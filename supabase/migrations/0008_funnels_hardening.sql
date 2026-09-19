-- ════════════════════════════════════════════════════════════════
-- 0008_funnels_hardening.sql — 導線チェックの締め直し（Codex レビュー F05 / F06）
--
-- 適用方法: supabase db query --linked -f supabase/migrations/0008_funnels_hardening.sql
-- 全て冪等。0007 は書き換えない（本番適用済み）。
--
-- 変えること
--   1. 導線（funnels）への直接の INSERT / UPDATE / DELETE を利用者から外す。
--      書くのはサーバー（service_role）だけ。プランの上限・段の形の検証・同時作成の
--      歯止めはサーバー側にあり、直接書き込みではそれを迂回できたため。
--      読むのは今までどおり自分の会社のものだけ。
--   2. 導線を消しても、貼ってしまった追跡リンクの飛び先が消えないようにする。
--      行を消す代わりに archived_at を立てる（画面からは消える。/go は飛ぶ）。
-- ════════════════════════════════════════════════════════════════

-- ─── 1. 利用者からの直接書き込みを閉じる ───
drop policy if exists "member_insert_own_funnels" on public.funnels;
drop policy if exists "member_update_own_funnels" on public.funnels;
drop policy if exists "member_delete_own_funnels" on public.funnels;

-- ─── 2. 消す代わりにしまう ───
alter table public.funnels add column if not exists archived_at timestamptz;
create index if not exists funnels_org_live_idx
  on public.funnels(org_id, updated_at desc) where archived_at is null;

comment on column public.funnels.archived_at is
  '入っていたら「消した」扱い。行と追跡リンクは残すので、貼った先のリンクは飛び先を失わない';
comment on table public.funnels is
  'お客さんが宣言した導線。hops は Hop[]（docs/FUNNEL_CHECK_V1.md §8）。書くのは service_role だけ';
