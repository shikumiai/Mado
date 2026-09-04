-- ════════════════════════════════════════════════════════════════
-- 0004_stripe_events_and_signup.sql
--
-- 設計書: docs/07_ARCHITECTURE_V2_SUPABASE.md の §9(申込フロー) §11(Stripe)
-- 適用方法: Supabase ダッシュボード → SQL Editor に全文貼って Run
--
-- やること:
--   1. stripe_events — Webhook の二重処理を防ぐ受信台帳
--   2. signup_free_site   — おためし（無料）申込を1トランザクションで作る
--   3. signup_pending_site — おまかせ以上（有料）の枠を決済前に押さえる
--
-- 全て冪等（何度実行しても安全）に書いてある。
-- 途中でコケたら、直してからもう一度まるごと流せばいい。
-- ════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════
-- 1. Stripe イベントの受信台帳（冪等性）
--
--    Stripe は同じ Webhook を複数回送ることがある（設計どおりの挙動）。
--    受け取った event.id をここに1行入れ、重複キーで弾かれたら
--    「もう処理した」とみなして何もしない。
--
--    RLS を有効化するだけでポリシーは作らない → service_role 専用。
--    Webhook はサーバー側（service_role）からしか書かない。
-- ════════════════════════════════════════

create table if not exists public.stripe_events (
  event_id    text        primary key,
  type        text        not null,
  received_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;


-- ════════════════════════════════════════
-- 2. おためし（無料）申込
--
--    ログイン中の本人として呼ぶ（auth.uid() を使う）。
--    orgs / org_members / sites / site_configs を順に入れて、公開まで一気に済ませる。
--
--    SECURITY DEFINER なのは、org_members などに顧客の insert ポリシーを
--    作っていないため。RLS を通さずに入れる代わりに、関数の中で
--    auth.uid() を必ず確認し、本人の会社としてだけ作る。
--
--    slug の可否は sites のトリガー(check_site_slug)が errcode 23514 で弾く。
--    slug の重複は unique 制約が 23505 で弾く。どちらも reason:'slug' で返す。
-- ════════════════════════════════════════

create or replace function public.signup_free_site(
  p_name        text,
  p_email       text,
  p_phone       text,
  p_industry    text,
  p_template_id text,
  p_slug        text,
  p_config      jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_org_id  uuid;
  v_site_id uuid;
  v_plan    text;
begin
  -- 未ログインでは作らせない
  if v_uid is null then
    return jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  end if;

  -- プランはテンプレIDの末尾から決める（-pro / -mid / それ以外）
  v_plan := case
    when p_template_id like '%-pro' then 'omakase-pro'
    when p_template_id like '%-mid' then 'omakase'
    else 'otameshi'
  end;

  insert into public.orgs (name, email, phone, industry, plan, status)
  values (p_name, p_email, coalesce(p_phone, ''), coalesce(nullif(p_industry, ''), 'other'), v_plan, 'active')
  returning id into v_org_id;

  insert into public.org_members (org_id, user_id, role)
  values (v_org_id, v_uid, 'owner');

  insert into public.sites (org_id, slug, template_id, status, published_at)
  values (v_org_id, p_slug, p_template_id, 'live', now())
  returning id into v_site_id;

  insert into public.site_configs (site_id, config, version)
  values (v_site_id, coalesce(p_config, '{}'::jsonb), 1);

  return jsonb_build_object('ok', true, 'slug', lower(trim(p_slug)));

exception
  -- check_violation = 23514（予約語・形式NG。トリガーが投げる）
  when check_violation then
    return jsonb_build_object('ok', false, 'reason', 'slug');
  -- unique_violation = 23505（slug が既に使われている）
  when unique_violation then
    return jsonb_build_object('ok', false, 'reason', 'slug');
end $$;

revoke all     on function public.signup_free_site(text, text, text, text, text, text, jsonb) from public, anon;
grant  execute on function public.signup_free_site(text, text, text, text, text, text, jsonb) to authenticated;


-- ════════════════════════════════════════
-- 3. おまかせ以上（有料）— 決済前に枠を押さえる
--
--    先に org を status='pending'、site を status='draft' で作っておき、
--    Stripe の決済が完了した Webhook で active / live に上げる。
--    こうすると「決済は済んだのに枠が無い」も「枠だけ有って決済されない」も
--    起きない（設計書 §9 が推す形）。
--
--    戻り値の org_id / site_id を Stripe Checkout の metadata に載せ、
--    Webhook はそれを見て同じ行を更新する。
-- ════════════════════════════════════════

create or replace function public.signup_pending_site(
  p_name        text,
  p_email       text,
  p_phone       text,
  p_industry    text,
  p_template_id text,
  p_slug        text,
  p_config      jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_org_id  uuid;
  v_site_id uuid;
  v_plan    text;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  end if;

  v_plan := case
    when p_template_id like '%-pro' then 'omakase-pro'
    when p_template_id like '%-mid' then 'omakase'
    else 'otameshi'
  end;

  insert into public.orgs (name, email, phone, industry, plan, status)
  values (p_name, p_email, coalesce(p_phone, ''), coalesce(nullif(p_industry, ''), 'other'), v_plan, 'pending')
  returning id into v_org_id;

  insert into public.org_members (org_id, user_id, role)
  values (v_org_id, v_uid, 'owner');

  insert into public.sites (org_id, slug, template_id, status)
  values (v_org_id, p_slug, p_template_id, 'draft')
  returning id into v_site_id;

  insert into public.site_configs (site_id, config, version)
  values (v_site_id, coalesce(p_config, '{}'::jsonb), 1);

  return jsonb_build_object(
    'ok', true,
    'org_id', v_org_id,
    'site_id', v_site_id,
    'slug', lower(trim(p_slug))
  );

exception
  when check_violation then
    return jsonb_build_object('ok', false, 'reason', 'slug');
  when unique_violation then
    return jsonb_build_object('ok', false, 'reason', 'slug');
end $$;

revoke all     on function public.signup_pending_site(text, text, text, text, text, text, jsonb) from public, anon;
grant  execute on function public.signup_pending_site(text, text, text, text, text, text, jsonb) to authenticated;
