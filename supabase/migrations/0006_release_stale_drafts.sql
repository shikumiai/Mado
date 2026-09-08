-- ════════════════════════════════════════════════════════════════
-- 0006_release_stale_drafts.sql
--
-- 設計書: docs/07_ARCHITECTURE_V2_SUPABASE.md §9（申込フロー）
-- 適用方法: Supabase ダッシュボード → SQL Editor に全文貼って Run
--           （このファイルは書いてあるだけで、まだ適用していない）
--
-- やること:
--   申込の途中で放り出された下書き（会社は pending、サイトは draft のまま）を、
--   一定日数が過ぎたら消して、その名前（slug）をまた誰かが取れるようにする。
--
-- なぜ要るか:
--   名前先行の申込では、ログインした時点で名前を押さえる。
--   途中でやめた人の名前が永久に埋まると、良い名前から先に枯れていく。
--
-- 消すのは「明らかに申し込みが成立していないもの」だけ:
--   - orgs.status = 'pending'（有料の決済が終われば active になる）
--   - Stripe の顧客・サブスクが紐付いていない（決済に進んだ形跡がない）
--   - そのグループのサイトが全部 draft（1つでも公開済みなら触らない）
--   - orgs.updated_at が p_days 日より古い（下書き保存のたびに新しくなる）
--
-- sites / site_configs / org_members は orgs への外部キーが on delete cascade
-- なので、orgs を消せば一緒に片付く。
--
-- 全て冪等（何度実行しても安全）に書いてある。
-- ════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════
-- 1. 空ける処理（何件消したかを返す）
--
--    service_role / 管理者だけが呼べるようにする。顧客からは呼べない。
-- ════════════════════════════════════════

create or replace function public.release_stale_signup_drafts(p_days integer default 7)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_days    integer := greatest(coalesce(p_days, 7), 1);  -- 0日や負の日数は受け付けない
  v_deleted integer;
begin
  with stale as (
    select o.id
      from public.orgs o
     where o.status = 'pending'
       and o.stripe_customer_id is null
       and o.stripe_subscription_id is null
       and o.updated_at < now() - make_interval(days => v_days)
       -- 公開済み・停止中のサイトを1つでも持つ会社は対象外
       and not exists (
             select 1
               from public.sites s
              where s.org_id = o.id
                and s.status <> 'draft'
           )
  )
  delete from public.orgs o
   using stale
   where o.id = stale.id;

  get diagnostics v_deleted = row_count;

  raise notice '申込途中の下書きを % 件、空けました（% 日より古いもの）', v_deleted, v_days;
  return v_deleted;
end $$;

comment on function public.release_stale_signup_drafts(integer) is
  '申込途中のまま放置された pending の会社と draft のサイトを消して、名前(slug)を空ける';

-- 顧客（authenticated）にも anon にも実行させない。呼べるのは service_role のみ。
revoke all on function public.release_stale_signup_drafts(integer) from public, anon, authenticated;


-- ════════════════════════════════════════
-- 2. 毎日の自動実行（pg_cron がある環境だけ）
--
--    pg_cron が入っていない場合はここを飛ばす。
--    そのときは Supabase ダッシュボードの SQL Editor で
--      select public.release_stale_signup_drafts(7);
--    を手で流すか、Vercel の Cron から service_role で呼ぶ。
-- ════════════════════════════════════════

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    -- 同じ名前の予定があれば作り直す
    begin
      perform cron.unschedule('release-stale-signup-drafts');
    exception
      when others then
        null; -- まだ登録されていない
    end;

    perform cron.schedule(
      'release-stale-signup-drafts',
      '17 3 * * *',                                  -- 毎日 03:17（UTC）
      $cron$select public.release_stale_signup_drafts(7);$cron$
    );

    raise notice 'pg_cron に毎日の掃除を登録しました';
  else
    raise notice 'pg_cron が無いので自動実行は登録していません。手動で release_stale_signup_drafts(7) を実行してください';
  end if;
end $$;
