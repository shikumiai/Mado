-- ════════════════════════════════════════════════════════════════
-- 0003_reserve_auth_slugs.sql
--
-- 認証用のルート（/auth/callback, /auth/signout）を足すので、
-- 顧客がその URL を取れないように予約する。
--
-- src/app 直下にディレクトリを増やしたら、ここと
-- src/lib/resolve-site.ts の RESERVED_SLUGS の両方に足すこと。
-- ════════════════════════════════════════════════════════════════

insert into public.reserved_slugs (slug) values
  ('auth'), ('logout'), ('signout'), ('callback'), ('account'), ('settings')
on conflict do nothing;
