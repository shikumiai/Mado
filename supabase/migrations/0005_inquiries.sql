-- ════════════════════════════════════════════════════════════════
-- 0005_inquiries.sql — 顧客サイトの問い合わせ・予約の受け皿
--
-- 設計書: docs/TEMPLATE_SYSTEM_V3.md（機能12 booking / 機能13 contact）
-- 適用方法: Supabase ダッシュボード → SQL Editor に全文貼って Run
--
-- 全て冪等（何度実行しても安全）に書いてある。
--
-- 誰が何をできるか
--   ・書き込み … service_role だけ（サーバーの submitInquiry を通ったものだけが入る）
--   ・読み取り … そのサイトを持っている会社の人（owns_site）と、Lyo（is_platform_admin）
--   ・訪問者   … 読めない。書くのも直接はできない
-- ════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════
-- 1. テーブル
-- ════════════════════════════════════════

create table if not exists public.inquiries (
  id           uuid        primary key default gen_random_uuid(),
  site_id      uuid        not null references public.sites(id) on delete cascade,
  kind         text        not null default 'contact',   -- contact / booking
  name         text        not null,
  email        text        not null,
  phone        text        not null default '',
  message      text        not null,
  preferred_at timestamptz,                              -- 予約の希望日時（読み取れたときだけ）
  payload      jsonb       not null default '{}'::jsonb, -- 希望日時の原文・相談の種類・送信元
  status       text        not null default 'new',       -- new / read / done / spam
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 既に作ってあった場合に備えて、足りない列だけ足す
alter table public.inquiries add column if not exists preferred_at timestamptz;
alter table public.inquiries add column if not exists payload      jsonb not null default '{}'::jsonb;
alter table public.inquiries add column if not exists status       text  not null default 'new';
alter table public.inquiries add column if not exists updated_at   timestamptz not null default now();

-- 値の取り得る範囲（アプリ側だけの検査は必ず漏れる）
alter table public.inquiries drop constraint if exists inquiries_kind_check;
alter table public.inquiries add  constraint inquiries_kind_check
  check (kind in ('contact', 'booking'));

alter table public.inquiries drop constraint if exists inquiries_status_check;
alter table public.inquiries add  constraint inquiries_status_check
  check (status in ('new', 'read', 'done', 'spam'));

alter table public.inquiries drop constraint if exists inquiries_length_check;
alter table public.inquiries add  constraint inquiries_length_check
  check (
    char_length(name)    between 1 and 100
    and char_length(email)   between 3 and 200
    and char_length(phone)   <= 40
    and char_length(message) between 1 and 4000
  );

-- 一覧（新しい順）と、連投の数え上げに効く
create index if not exists inquiries_site_created_idx
  on public.inquiries(site_id, created_at desc);
create index if not exists inquiries_site_status_idx
  on public.inquiries(site_id, status, created_at desc);
create index if not exists inquiries_site_email_idx
  on public.inquiries(site_id, email, created_at desc);


-- ════════════════════════════════════════
-- 2. updated_at の自動更新（0001 で作った関数を使う）
-- ════════════════════════════════════════

drop trigger if exists inquiries_touch on public.inquiries;
create trigger inquiries_touch
  before update on public.inquiries
  for each row execute function public.touch_updated_at();


-- ════════════════════════════════════════
-- 3. RLS
--
--    insert / update / delete のポリシーを1つも作らない。
--    こうすると service_role（RLS を素通りする）だけが書ける状態になり、
--    サーバー側の submitInquiry を通った送信だけが入る。
-- ════════════════════════════════════════

alter table public.inquiries enable row level security;

-- 顧客（自分の会社のサイト宛てのものだけ読める）
drop policy if exists "member_read_own_inquiries" on public.inquiries;
create policy "member_read_own_inquiries" on public.inquiries
  for select to authenticated
  using (public.owns_site(site_id));

-- Lyo（プラットフォーム管理者）は全部読める
drop policy if exists "admin_read_inquiries" on public.inquiries;
create policy "admin_read_inquiries" on public.inquiries
  for select to authenticated
  using (public.is_platform_admin());


-- ════════════════════════════════════════
-- 4. 予約スラッグの追加
--
--    src/app 直下に増えたディレクトリ（/sections /pricing /styleguide /app）を、
--    顧客が URL として取れないようにする。
--    src/lib/resolve-site.ts の RESERVED_SLUGS と同じ内容にしてある。
-- ════════════════════════════════════════

insert into public.reserved_slugs (slug) values
  ('app'), ('sections'), ('pricing'), ('styleguide')
on conflict do nothing;


-- ════════════════════════════════════════
-- 5. 補足
-- ════════════════════════════════════════

comment on table  public.inquiries              is '顧客サイトから届いた問い合わせ・予約希望。書き込みは service_role のみ';
comment on column public.inquiries.preferred_at is '予約の希望日時。文章で書かれて読み取れなかったときは null で、原文は payload.preferred_text に残る';
comment on column public.inquiries.payload      is 'purpose（相談・予約の種類）/ source（送信元セクション）/ preferred_text（希望日時の原文）';
