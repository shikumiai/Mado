-- 写真・設定の保存権限をServer ActionとDBで揃える。
-- owns_site は閲覧用の「所属」判定なので変更せず、書込み用を分ける。
-- 新しい関数は呼出者のRLSで評価し、権限昇格しない。
begin;

create or replace function public.can_edit_site(p_site_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select (select auth.uid()) is not null and (
    public.is_platform_admin()
    or exists (
      select 1
        from public.sites s
        join public.org_members m on m.org_id = s.org_id
       where s.id = p_site_id
         and m.user_id = (select auth.uid())
         and m.role in ('owner', 'editor')
    )
  )
$$;

revoke all on function public.can_edit_site(uuid) from public, anon;
grant execute on function public.can_edit_site(uuid) to authenticated;

-- 既存の所属だけを確認するポリシーを置き換える（追加だけだとORで穴が残る）。
drop policy if exists "member_update_own_configs" on public.site_configs;
create policy "member_update_own_configs" on public.site_configs
  for update to authenticated
  using (public.can_edit_site(site_id))
  with check (public.can_edit_site(site_id));

drop policy if exists "member_insert_own_versions" on public.site_config_versions;
create policy "member_insert_own_versions" on public.site_config_versions
  for insert to authenticated
  with check (public.can_edit_site(site_id));

-- 公開サイトの読取り、所属者・管理者のSELECT、Storage設定は変更しない。
-- update_site_config は既存のSECURITY INVOKERのまま上記のRLSを通る。
commit;
