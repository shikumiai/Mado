-- ════════════════════════════════════════════════════════════════
-- 0007_funnels.sql — 導線チェック（サイトまでの道が見える）
--
-- 設計書: docs/FUNNEL_CHECK_V1.md（§4 追跡リンク / §5 データ）
-- 適用方法: Supabase ダッシュボード → SQL Editor に全文貼って Run
--
-- 全て冪等（何度実行しても安全）に書いてある。
--
-- 誰が何をできるか
--   ・導線（funnels）       … 自分の会社のものだけ、読める・書ける
--   ・追跡リンク・チェック結果・クリック … 自分の会社のものだけ読める。
--     書くのは service_role（/go の記録と、サーバーの Server Action）だけ。
--     こうしておくと「飛び先の URL を直接書き換えて別のところへ飛ばす」ができない。
-- ════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════
-- 1. テーブル
-- ════════════════════════════════════════

-- ─── 導線（1サイトに複数持てる）───
create table if not exists public.funnels (
  id         uuid        primary key default gen_random_uuid(),
  org_id     uuid        not null references public.orgs(id)  on delete cascade,
  site_id    uuid        references public.sites(id)          on delete set null,
  name       text        not null,                            -- 「X から LINE 経由」など
  hops       jsonb       not null default '[]'::jsonb,        -- Hop[]（設計書 §8 の型）
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists funnels_org_idx  on public.funnels(org_id, updated_at desc);
create index if not exists funnels_site_idx on public.funnels(site_id);

alter table public.funnels drop constraint if exists funnels_name_check;
alter table public.funnels add  constraint funnels_name_check
  check (char_length(name) between 1 and 100);

alter table public.funnels drop constraint if exists funnels_hops_check;
alter table public.funnels add  constraint funnels_hops_check
  check (case when jsonb_typeof(hops) = 'array' then jsonb_array_length(hops) <= 12 else false end);


-- ─── 追跡リンク（段ごとに1本。お客さんが X や LINE に貼る）───
create table if not exists public.tracked_links (
  code       text        primary key,                         -- 英数字8文字
  funnel_id  uuid        not null references public.funnels(id) on delete cascade,
  hop_index  int         not null,
  target_url text        not null,                            -- 302 で送る先
  created_at timestamptz not null default now()
);
create index if not exists tracked_links_funnel_idx on public.tracked_links(funnel_id, hop_index);

alter table public.tracked_links drop constraint if exists tracked_links_code_check;
alter table public.tracked_links add  constraint tracked_links_code_check
  check (code ~ '^[a-zA-Z0-9]{6,16}$');

alter table public.tracked_links drop constraint if exists tracked_links_hop_check;
alter table public.tracked_links add  constraint tracked_links_hop_check
  check (hop_index >= 0 and hop_index < 12);

-- 1つの段に1本。作り直しても同じコードを使い続ける
create unique index if not exists tracked_links_one_per_hop
  on public.tracked_links(funnel_id, hop_index);


-- ─── 追跡リンクを踏んだ記録 ───
-- IP は保存しない。残すのは「同じ端末らしいか」の目印と、どこから来たかのホスト名だけ。
create table if not exists public.tracked_clicks (
  id           bigint      generated always as identity primary key,
  code         text        not null references public.tracked_links(code) on delete cascade,
  clicked_at   timestamptz not null default now(),
  visitor_hash text        not null,                          -- sha256(UA + 日付 + 塩)
  ref_host     text
);
create index if not exists tracked_clicks_code_time_idx
  on public.tracked_clicks(code, clicked_at desc);


-- ─── チェック1回ぶんの結果 ───
create table if not exists public.funnel_runs (
  id          uuid        primary key default gen_random_uuid(),
  funnel_id   uuid        not null references public.funnels(id) on delete cascade,
  status      text        not null check (status in ('running','done','failed')),
  results     jsonb       not null default '[]'::jsonb,       -- HopResult[]（設計書 §8 の型）
  started_at  timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists funnel_runs_funnel_idx
  on public.funnel_runs(funnel_id, started_at desc);


-- ════════════════════════════════════════
-- 2. updated_at の自動更新（0001 で作った関数を使う）
-- ════════════════════════════════════════

drop trigger if exists funnels_touch on public.funnels;
create trigger funnels_touch
  before update on public.funnels
  for each row execute function public.touch_updated_at();


-- ════════════════════════════════════════
-- 3. RLS のヘルパー
--
--    0001 の owns_site と同じ書き方。ポリシーから別テーブルを直接引くと
--    無限再帰しやすいので、security definer の関数に閉じ込める。
-- ════════════════════════════════════════

-- 「この導線は自分の会社のものか」
create or replace function public.owns_funnel(p_funnel_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.funnels f
      join public.org_members m on m.org_id = f.org_id
     where f.id = p_funnel_id
       and m.user_id = auth.uid()
  )
$$;

-- 「この追跡リンクは自分の会社のものか」
create or replace function public.owns_tracked_link(p_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.tracked_links t
      join public.funnels f     on f.id = t.funnel_id
      join public.org_members m on m.org_id = f.org_id
     where t.code = p_code
       and m.user_id = auth.uid()
  )
$$;


-- ════════════════════════════════════════
-- 4. RLS
-- ════════════════════════════════════════

alter table public.funnels        enable row level security;
alter table public.tracked_links  enable row level security;
alter table public.tracked_clicks enable row level security;
alter table public.funnel_runs    enable row level security;

-- ─── 導線そのもの（顧客が作って直して消す）───

drop policy if exists "member_read_own_funnels" on public.funnels;
create policy "member_read_own_funnels" on public.funnels
  for select to authenticated
  using (org_id in (select public.user_org_ids()));

drop policy if exists "member_insert_own_funnels" on public.funnels;
create policy "member_insert_own_funnels" on public.funnels
  for insert to authenticated
  with check (org_id in (select public.user_org_ids()));

drop policy if exists "member_update_own_funnels" on public.funnels;
create policy "member_update_own_funnels" on public.funnels
  for update to authenticated
  using      (org_id in (select public.user_org_ids()))
  with check (org_id in (select public.user_org_ids()));

drop policy if exists "member_delete_own_funnels" on public.funnels;
create policy "member_delete_own_funnels" on public.funnels
  for delete to authenticated
  using (org_id in (select public.user_org_ids()));

-- ─── 追跡リンク・チェック結果・クリック（読むだけ。書くのは service_role）───

drop policy if exists "member_read_own_links" on public.tracked_links;
create policy "member_read_own_links" on public.tracked_links
  for select to authenticated
  using (public.owns_funnel(funnel_id));

drop policy if exists "member_read_own_runs" on public.funnel_runs;
create policy "member_read_own_runs" on public.funnel_runs
  for select to authenticated
  using (public.owns_funnel(funnel_id));

drop policy if exists "member_read_own_clicks" on public.tracked_clicks;
create policy "member_read_own_clicks" on public.tracked_clicks
  for select to authenticated
  using (public.owns_tracked_link(code));

-- ─── Lyo（プラットフォーム管理者）は全部読める ───

drop policy if exists "admin_read_funnels" on public.funnels;
create policy "admin_read_funnels" on public.funnels
  for select to authenticated
  using (public.is_platform_admin());

drop policy if exists "admin_read_links" on public.tracked_links;
create policy "admin_read_links" on public.tracked_links
  for select to authenticated
  using (public.is_platform_admin());

drop policy if exists "admin_read_runs" on public.funnel_runs;
create policy "admin_read_runs" on public.funnel_runs
  for select to authenticated
  using (public.is_platform_admin());

drop policy if exists "admin_read_clicks" on public.tracked_clicks;
create policy "admin_read_clicks" on public.tracked_clicks
  for select to authenticated
  using (public.is_platform_admin());


-- ════════════════════════════════════════
-- 5. 日別の集計
--
--    段ごと・日ごとに「人数」と「クリック数」を返す。
--    人数は同じ端末らしいものを1日1回に丸めた数（visitor_hash に日付が入っている）。
--
--    security definer にしない。呼んだ人の権限のまま数えるので、
--    他人の導線を指しても RLS が効いて何も返らない。
-- ════════════════════════════════════════

drop function if exists public.funnel_clicks_daily(uuid, int);
drop function if exists public.funnel_clicks_daily(uuid);

create function public.funnel_clicks_daily(p_funnel_id uuid, p_days int default 30)
returns table (hop_index int, day date, visitors bigint, clicks bigint)
language sql
stable
as $$
  -- group by / order by は番号で書く。返す列の名前（day など）と
  -- 中の列の名前がぶつからないようにするため。
  select t.hop_index,
         (c.clicked_at at time zone 'Asia/Tokyo')::date,
         count(distinct c.visitor_hash),
         count(*)
    from public.tracked_clicks c
    join public.tracked_links  t on t.code = c.code
   where t.funnel_id = p_funnel_id
     and c.clicked_at >= now() - (greatest(coalesce(p_days, 30), 1) || ' days')::interval
   group by 1, 2
   order by 2 desc, 1
$$;


-- ════════════════════════════════════════
-- 6. 予約スラッグの追加
--
--    /go/<code> を顧客サイトの URL として取られないようにする。
--    src/lib/resolve-site.ts の RESERVED_SLUGS と同じ内容にしてある。
-- ════════════════════════════════════════

insert into public.reserved_slugs (slug) values ('go')
on conflict do nothing;


-- ════════════════════════════════════════
-- 7. 補足
-- ════════════════════════════════════════

comment on table  public.funnels               is 'お客さんが宣言した導線。hops は Hop[]（docs/FUNNEL_CHECK_V1.md §8）';
comment on table  public.tracked_links         is '段ごとの追跡リンク。導線を消すと一緒に消えるが、/go 側は見つからなければ Mado のトップへ送るので貼った先が 404 にはならない';
comment on table  public.tracked_clicks        is '追跡リンクを踏んだ記録。IP は保存しない。書き込みは /go が service_role で行う';
comment on column public.tracked_clicks.visitor_hash is 'sha256(User-Agent + 日付 + 塩)。日付が入っているので、同じ端末でも日をまたげば別の人数として数える';
comment on table  public.funnel_runs           is 'チェック1回ぶんの結果。results は HopResult[]（docs/FUNNEL_CHECK_V1.md §8）';
comment on function public.funnel_clicks_daily is '段ごと・日ごとの人数とクリック数。呼んだ人の権限のまま数える';
