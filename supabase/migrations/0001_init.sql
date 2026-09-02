-- ════════════════════════════════════════════════════════════════
-- 0001_init.sql — しくみや v2 初期スキーマ
--
-- 設計書: docs/07_ARCHITECTURE_V2_SUPABASE.md
-- 適用方法: Supabase ダッシュボード → SQL Editor に全文貼って Run
--
-- 全て冪等（何度実行しても安全）に書いてある。
-- 途中でコケたら、直してからもう一度まるごと流せばいい。
-- ════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════
-- 1. テーブル
-- ════════════════════════════════════════

-- ─── 契約している会社（= 請求単位 = テナント）───
create table if not exists public.orgs (
  id                     uuid primary key default gen_random_uuid(),
  name                   text        not null,                     -- 会社名
  email                  text        not null,                     -- 連絡先
  phone                  text        not null default '',
  industry               text        not null default 'other',
  plan                   text        not null default 'otameshi',  -- otameshi / omakase / omakase-pro
  status                 text        not null default 'pending',   -- pending / active / past_due / canceled
  stripe_customer_id     text        unique,
  stripe_subscription_id text        unique,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- ─── 会社とログインユーザーの紐付け ───
create table if not exists public.org_members (
  org_id     uuid        not null references public.orgs(id)      on delete cascade,
  user_id    uuid        not null references auth.users(id)       on delete cascade,
  role       text        not null default 'owner',                -- owner / editor
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index if not exists org_members_user_idx on public.org_members(user_id);

-- ─── サイト ───
-- 1社1サイトで始めるが、org_id を外に出しておくことで将来複数持てる
create table if not exists public.sites (
  id            uuid        primary key default gen_random_uuid(),
  org_id        uuid        not null references public.orgs(id) on delete cascade,
  slug          text        not null unique,          -- URL の /{slug}
  custom_domain text        unique,                   -- v1 は手動運用。列だけ先に用意
  template_id   text        not null,                 -- warm-craft / trust-navy / clean-arch
  status        text        not null default 'draft', -- draft / live / suspended
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists sites_org_idx       on public.sites(org_id);
create index if not exists sites_slug_live_idx on public.sites(slug) where status = 'live';

-- ─── サイトの中身（旧 site.config.json）───
-- config は jsonb。今の SiteConfig 型がそのまま入る
create table if not exists public.site_configs (
  site_id    uuid        primary key references public.sites(id) on delete cascade,
  config     jsonb       not null default '{}'::jsonb,
  version    integer     not null default 1,          -- 同時編集の衝突検出に使う
  updated_at timestamptz not null default now(),
  updated_by uuid        references auth.users(id)
);

-- ─── 保存履歴（元に戻せる）───
create table if not exists public.site_config_versions (
  id         bigserial   primary key,
  site_id    uuid        not null references public.sites(id) on delete cascade,
  config     jsonb       not null,
  version    integer     not null,
  note       text        not null default '',
  created_by uuid        references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists scv_site_created_idx
  on public.site_config_versions(site_id, created_at desc);

-- ─── 画像 ───
create table if not exists public.assets (
  id           uuid        primary key default gen_random_uuid(),
  site_id      uuid        not null references public.sites(id) on delete cascade,
  storage_path text        not null,                  -- site-assets バケット内のパス
  kind         text        not null default 'photo',
  bytes        integer,
  width        integer,
  height       integer,
  created_at   timestamptz not null default now()
);
create index if not exists assets_site_idx on public.assets(site_id);

-- ─── 編集依頼（Lyo が手で対応するもの）───
create table if not exists public.edit_requests (
  id         uuid        primary key default gen_random_uuid(),
  site_id    uuid        not null references public.sites(id) on delete cascade,
  kind       text        not null,                    -- text / image / layout / feature
  body       text        not null,
  status     text        not null default 'pending',  -- pending / working / done / rejected
  ai_result  jsonb,
  created_by uuid        references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists edit_requests_status_idx
  on public.edit_requests(status, created_at desc);
create index if not exists edit_requests_site_idx on public.edit_requests(site_id);

-- ─── AI編集の回数制限（プラン別）───
create table if not exists public.ai_edit_usage (
  site_id uuid    not null references public.sites(id) on delete cascade,
  period  text    not null,                            -- 'YYYY-MM'
  used    integer not null default 0,
  primary key (site_id, period)
);

-- ─── 予約スラッグ（顧客が取れない URL）───
create table if not exists public.reserved_slugs (slug text primary key);
insert into public.reserved_slugs (slug) values
  ('start'), ('member'), ('admin'), ('api'), ('login'), ('signup'),
  ('legal'), ('privacy'), ('features'), ('lp'), ('templates'),
  ('portfolio-templates'), ('preview'), ('order'), ('portfolio'), ('test'),
  ('s'), ('images'), ('assets'), ('static'), ('public'), ('_next'),
  ('favicon.ico'), ('robots.txt'), ('sitemap.xml'), ('manifest.json')
on conflict do nothing;

-- ─── プラットフォーム管理者（Lyo）───
create table if not exists public.platform_admins (
  user_id    uuid        primary key references auth.users(id) on delete cascade,
  note       text        not null default '',
  created_at timestamptz not null default now()
);


-- ════════════════════════════════════════
-- 2. スラッグの検証（DB側で強制する）
--    アプリ側チェックだけだと必ず漏れる
-- ════════════════════════════════════════

create or replace function public.check_site_slug()
returns trigger
language plpgsql
as $$
begin
  new.slug := lower(trim(new.slug));

  if exists (select 1 from public.reserved_slugs r where r.slug = new.slug) then
    raise exception 'この URL は使用できません: %', new.slug
      using errcode = '23514';
  end if;

  if new.slug !~ '^[a-z0-9]([a-z0-9-]{1,48}[a-z0-9])?$' then
    raise exception 'URL は英小文字・数字・ハイフンのみ、3〜50文字にしてください: %', new.slug
      using errcode = '23514';
  end if;

  return new;
end $$;

drop trigger if exists sites_check_slug on public.sites;
create trigger sites_check_slug
  before insert or update of slug on public.sites
  for each row execute function public.check_site_slug();


-- ════════════════════════════════════════
-- 3. updated_at の自動更新
-- ════════════════════════════════════════

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists orgs_touch          on public.orgs;
drop trigger if exists sites_touch         on public.sites;
drop trigger if exists edit_requests_touch on public.edit_requests;

create trigger orgs_touch          before update on public.orgs          for each row execute function public.touch_updated_at();
create trigger sites_touch         before update on public.sites         for each row execute function public.touch_updated_at();
create trigger edit_requests_touch before update on public.edit_requests for each row execute function public.touch_updated_at();


-- ════════════════════════════════════════
-- 4. RLS のヘルパー関数
--
--    ポリシーから別テーブルを直接引くと無限再帰しやすい。
--    security definer の関数に閉じ込めるのが定石。
-- ════════════════════════════════════════

create or replace function public.user_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.org_members where user_id = auth.uid()
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.platform_admins where user_id = auth.uid())
$$;

-- 「この site は自分の会社のものか」
create or replace function public.owns_site(p_site_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.sites s
      join public.org_members m on m.org_id = s.org_id
     where s.id = p_site_id
       and m.user_id = auth.uid()
  )
$$;

-- 「この site は公開中か」
create or replace function public.site_is_live(p_site_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.sites s where s.id = p_site_id and s.status = 'live'
  )
$$;


-- ════════════════════════════════════════
-- 5. RLS を有効化
--
--    書き込みポリシーを作らないテーブルは service_role だけが書ける。
--    service_role は RLS を素通りするので、サーバー側の認可を
--    通った操作だけが成立する形になる。
-- ════════════════════════════════════════

alter table public.orgs                 enable row level security;
alter table public.org_members          enable row level security;
alter table public.sites                enable row level security;
alter table public.site_configs         enable row level security;
alter table public.site_config_versions enable row level security;
alter table public.assets               enable row level security;
alter table public.edit_requests        enable row level security;
alter table public.ai_edit_usage        enable row level security;
alter table public.reserved_slugs       enable row level security;
alter table public.platform_admins      enable row level security;


-- ──────────────────────────────
-- 5-1. 顧客サイトの公開表示（誰でも読める）
-- ──────────────────────────────

drop policy if exists "public_read_live_sites" on public.sites;
create policy "public_read_live_sites" on public.sites
  for select to anon, authenticated
  using (status = 'live');

drop policy if exists "public_read_live_configs" on public.site_configs;
create policy "public_read_live_configs" on public.site_configs
  for select to anon, authenticated
  using (public.site_is_live(site_id));


-- ──────────────────────────────
-- 5-2. 顧客（自分の会社のものだけ）
-- ──────────────────────────────

drop policy if exists "member_read_own_org" on public.orgs;
create policy "member_read_own_org" on public.orgs
  for select to authenticated
  using (id in (select public.user_org_ids()));

drop policy if exists "member_read_own_memberships" on public.org_members;
create policy "member_read_own_memberships" on public.org_members
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "member_read_own_sites" on public.sites;
create policy "member_read_own_sites" on public.sites
  for select to authenticated
  using (org_id in (select public.user_org_ids()));

drop policy if exists "member_read_own_configs" on public.site_configs;
create policy "member_read_own_configs" on public.site_configs
  for select to authenticated
  using (public.owns_site(site_id));

-- 編集（サイトの中身の書き換え。ここが顧客の主操作）
drop policy if exists "member_update_own_configs" on public.site_configs;
create policy "member_update_own_configs" on public.site_configs
  for update to authenticated
  using      (public.owns_site(site_id))
  with check (public.owns_site(site_id));

drop policy if exists "member_read_own_versions" on public.site_config_versions;
create policy "member_read_own_versions" on public.site_config_versions
  for select to authenticated
  using (public.owns_site(site_id));

drop policy if exists "member_insert_own_versions" on public.site_config_versions;
create policy "member_insert_own_versions" on public.site_config_versions
  for insert to authenticated
  with check (public.owns_site(site_id));

drop policy if exists "member_read_own_assets" on public.assets;
create policy "member_read_own_assets" on public.assets
  for select to authenticated
  using (public.owns_site(site_id));

drop policy if exists "member_read_own_requests" on public.edit_requests;
create policy "member_read_own_requests" on public.edit_requests
  for select to authenticated
  using (public.owns_site(site_id));

drop policy if exists "member_insert_own_requests" on public.edit_requests;
create policy "member_insert_own_requests" on public.edit_requests
  for insert to authenticated
  with check (public.owns_site(site_id));

drop policy if exists "member_read_own_usage" on public.ai_edit_usage;
create policy "member_read_own_usage" on public.ai_edit_usage
  for select to authenticated
  using (public.owns_site(site_id));

-- 予約スラッグは申込画面で参照するので誰でも読める
drop policy if exists "anyone_read_reserved_slugs" on public.reserved_slugs;
create policy "anyone_read_reserved_slugs" on public.reserved_slugs
  for select to anon, authenticated
  using (true);


-- ──────────────────────────────
-- 5-3. Lyo（プラットフォーム管理者）は全部読める
--
--    書き込みは service_role 側（サーバーAPI）に寄せる。
--    管理画面から直接 plan を書き換えられないようにする。
-- ──────────────────────────────

drop policy if exists "admin_read_orgs" on public.orgs;
create policy "admin_read_orgs" on public.orgs
  for select to authenticated using (public.is_platform_admin());

drop policy if exists "admin_read_members" on public.org_members;
create policy "admin_read_members" on public.org_members
  for select to authenticated using (public.is_platform_admin());

drop policy if exists "admin_read_sites" on public.sites;
create policy "admin_read_sites" on public.sites
  for select to authenticated using (public.is_platform_admin());

drop policy if exists "admin_read_configs" on public.site_configs;
create policy "admin_read_configs" on public.site_configs
  for select to authenticated using (public.is_platform_admin());

drop policy if exists "admin_read_versions" on public.site_config_versions;
create policy "admin_read_versions" on public.site_config_versions
  for select to authenticated using (public.is_platform_admin());

drop policy if exists "admin_read_assets" on public.assets;
create policy "admin_read_assets" on public.assets
  for select to authenticated using (public.is_platform_admin());

drop policy if exists "admin_read_requests" on public.edit_requests;
create policy "admin_read_requests" on public.edit_requests
  for select to authenticated using (public.is_platform_admin());

drop policy if exists "admin_update_requests" on public.edit_requests;
create policy "admin_update_requests" on public.edit_requests
  for update to authenticated
  using      (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "admin_read_usage" on public.ai_edit_usage;
create policy "admin_read_usage" on public.ai_edit_usage
  for select to authenticated using (public.is_platform_admin());

-- 自分が管理者かどうかは本人だけ確認できる
drop policy if exists "admin_read_self" on public.platform_admins;
create policy "admin_read_self" on public.platform_admins
  for select to authenticated using (user_id = auth.uid());


-- ════════════════════════════════════════
-- 6. サイト設定の保存（同時編集の衝突を検出する）
--
--    期待している version を渡してもらい、一致したときだけ書く。
--    一致しなければ 40001 を返し、アプリ側が読み直しを促す。
-- ════════════════════════════════════════

-- ⚠ この関数は 0002_config_save_result.sql で作り直してある。
--   衝突時の errcode '40001' が自動リトライを招いてタイムアウトしたため。
--   新規に構築する場合は 0001 → 0002 の順に流せば正しい形になる。
create or replace function public.update_site_config(
  p_site_id          uuid,
  p_config           jsonb,
  p_expected_version integer,
  p_note             text default ''
) returns integer
language plpgsql
security invoker              -- RLS を効かせる（ここを definer にすると穴になる）
set search_path = public
as $$
declare
  v_new integer;
begin
  update public.site_configs
     set config     = p_config,
         version    = version + 1,
         updated_at = now(),
         updated_by = auth.uid()
   where site_id = p_site_id
     and version = p_expected_version
  returning version into v_new;

  if v_new is null then
    raise exception 'CONFLICT: 別の画面で先に保存されている（site_id=%）', p_site_id
      using errcode = '40001';
  end if;

  insert into public.site_config_versions (site_id, config, version, note, created_by)
  values (p_site_id, p_config, v_new, p_note, auth.uid());

  return v_new;
end $$;

grant execute on function public.update_site_config(uuid, jsonb, integer, text) to authenticated;


-- ════════════════════════════════════════
-- 7. 画像置き場（Storage）
--
--    Base64 を DB に入れない。バケットに置いて URL で参照する。
--    アップロードはサーバー経由（service_role）で、
--    webp 変換とリサイズを通してから置く。
-- ════════════════════════════════════════

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists "public_read_site_assets" on storage.objects;
create policy "public_read_site_assets" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'site-assets');


-- ════════════════════════════════════════
-- 8. 適用後にやること（手動・1回だけ）
-- ════════════════════════════════════════
--
-- (1) Lyo を管理者にする。Google でログインしたあと、
--     Supabase ダッシュボードの Authentication → Users で自分の UID を調べて:
--
--       insert into public.platform_admins (user_id, note)
--       values ('<ここに自分のUID>', 'Lyo')
--       on conflict do nothing;
--
-- (2) 疎通確認（テーブルが見えるかだけ確認する。anon キーを使う）:
--
--       node -e "
--       const { createClient } = require('@supabase/supabase-js');
--       const sb = createClient('https://xxxx.supabase.co', 'ANON_KEY');
--       sb.from('reserved_slugs').select('*').limit(3)
--         .then(({data, error}) => console.log(error ?? data));
--       "
--
--     ここで管理画面の HTML っぽいエラーが返るときは、Project URL の指定間違い。
--     正しいのは https://xxxx.supabase.co で、ダッシュボードの URL ではない。
