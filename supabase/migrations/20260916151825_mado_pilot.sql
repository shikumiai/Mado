-- Additive pilot schema. Existing customer-site tables are untouched.
create table public.mado_pilot_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  title text not null check (char_length(title) between 1 and 100),
  audience text not null check (char_length(audience) between 1 and 500),
  facts text not null check (char_length(facts) between 1 and 4000),
  goal text not null check (char_length(goal) between 1 and 1000),
  consent boolean not null check (consent),
  status text not null default 'requested' check (status in ('requested','quoted','production','review','revision','delivered','cancelled')),
  quote_yen integer check (quote_yen between 1 and 1000000),
  quote_scope text not null default '' check (char_length(quote_scope) <= 4000),
  quote_accepted_at timestamptz,
  payment_confirmed boolean not null default false,
  variants jsonb not null default '[]' check (jsonb_typeof(variants) = 'array' and jsonb_array_length(variants) in (0,3)),
  feedback jsonb not null default '[]' check (jsonb_typeof(feedback) = 'array' and jsonb_array_length(feedback) <= 20),
  selected_variant integer check (selected_variant between 1 and 3),
  revision_note text not null default '' check (char_length(revision_note) <= 1000),
  delivery_path text not null default '',
  operator_note text not null default '' check (char_length(operator_note) <= 2000),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index mado_pilot_orders_user_id_idx on public.mado_pilot_orders(user_id);
alter table public.mado_pilot_orders enable row level security;
revoke all on public.mado_pilot_orders from anon, authenticated;
grant select, insert, update on public.mado_pilot_orders to authenticated;
create policy pilot_orders_read on public.mado_pilot_orders for select to authenticated
using (user_id = (select auth.uid()) or (select public.is_platform_admin()));
create policy pilot_orders_create on public.mado_pilot_orders for insert to authenticated
with check (user_id = (select auth.uid()) and status = 'requested' and quote_yen is null
and quote_scope = '' and quote_accepted_at is null and not payment_confirmed
and variants = '[]'::jsonb and feedback = '[]'::jsonb and selected_variant is null
and revision_note = '' and delivery_path = '' and operator_note = '' and version = 1);
create policy pilot_orders_update on public.mado_pilot_orders for update to authenticated
using (user_id = (select auth.uid()) or (select public.is_platform_admin()))
with check (user_id = (select auth.uid()) or (select public.is_platform_admin()));

-- Invoker: uses the caller's RLS, never bypasses ownership.
create function public.guard_mado_pilot_order() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if tg_op = 'INSERT' then
    perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 9147));
    if (select count(*) from public.mado_pilot_orders where user_id = auth.uid()) >= 5 then
      raise exception 'Pilot request limit reached';
    end if;
    new.created_at := now(); new.updated_at := now();
    return new;
  end if;
  if new.id <> old.id or new.user_id <> old.user_id or new.created_at <> old.created_at then
    raise exception 'Order identity is immutable';
  end if;
  if not public.is_platform_admin() then
    if (to_jsonb(new) - array['quote_accepted_at','selected_variant','revision_note','updated_at','version'])
       is distinct from (to_jsonb(old) - array['quote_accepted_at','selected_variant','revision_note','updated_at','version']) then
      raise exception 'Only the operator can edit order details';
    end if;
    if new.quote_accepted_at is distinct from old.quote_accepted_at then
      if old.status <> 'quoted' or old.quote_yen is null or old.quote_scope = '' or old.quote_accepted_at is not null or new.quote_accepted_at is null then
        raise exception 'Quote cannot be accepted';
      end if;
      new.quote_accepted_at := now();
    end if;
    if new.selected_variant is distinct from old.selected_variant then
      if old.status <> 'review' or jsonb_array_length(old.variants) <> 3 or old.selected_variant is not null or new.selected_variant is null then
        raise exception 'Variant cannot be selected';
      end if;
    end if;
    if new.revision_note is distinct from old.revision_note then
      if old.status <> 'review' or old.revision_note <> '' or new.revision_note = '' or new.selected_variant is null then
        raise exception 'Revision cannot be requested';
      end if;
      new.status := 'revision';
    end if;
  else
    if old.quote_accepted_at is not null and (new.quote_yen is distinct from old.quote_yen or new.quote_scope is distinct from old.quote_scope or new.quote_accepted_at is distinct from old.quote_accepted_at) then
      raise exception 'Accepted quote is immutable';
    end if;
    if new.status <> old.status and not (
      new.status = 'cancelled' or
      (old.status = 'requested' and new.status = 'quoted') or
      (old.status = 'quoted' and new.status = 'production') or
      (old.status = 'production' and new.status = 'review') or
      (old.status = 'review' and new.status in ('revision','delivered')) or
      (old.status = 'revision' and new.status = 'delivered')
    ) then raise exception 'Invalid status transition'; end if;
  end if;
  if new.status = 'quoted' and (new.quote_yen is null or new.quote_scope = '') then raise exception 'Quote details required'; end if;
  if new.status in ('production','review','revision','delivered') and (new.quote_accepted_at is null or not new.payment_confirmed) then raise exception 'Quote acceptance and payment confirmation required'; end if;
  if new.status in ('review','revision','delivered') and jsonb_array_length(new.variants) <> 3 then raise exception 'Three variants required'; end if;
  if new.status = 'delivered' and (new.selected_variant is null or new.delivery_path = '') then raise exception 'Selection and delivery required'; end if;
  new.version := old.version + 1; new.updated_at := now();
  return new;
end $$;
revoke all on function public.guard_mado_pilot_order() from public, anon, authenticated;
create trigger guard_mado_pilot_order before insert or update on public.mado_pilot_orders
for each row execute function public.guard_mado_pilot_order();

create table public.mado_pilot_applications (
  user_id uuid primary key references auth.users(id),
  display_name text not null check (char_length(display_name) between 1 and 80),
  specialty text not null check (char_length(specialty) between 1 and 1000),
  method text not null check (char_length(method) between 1 and 8000),
  consent boolean not null check (consent),
  created_at timestamptz not null default now()
);
alter table public.mado_pilot_applications enable row level security;
revoke all on public.mado_pilot_applications from anon, authenticated;
grant select, insert on public.mado_pilot_applications to authenticated;
create policy pilot_applications_read on public.mado_pilot_applications for select to authenticated
using (user_id = (select auth.uid()) or (select public.is_platform_admin()));
create policy pilot_applications_create on public.mado_pilot_applications for insert to authenticated
with check (user_id = (select auth.uid()));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('mado-pilot','mado-pilot',false,3145728,array['image/jpeg','image/png','image/webp']);
create policy pilot_assets_read on storage.objects for select to authenticated
using (bucket_id = 'mado-pilot' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_platform_admin())));
create policy pilot_assets_insert on storage.objects for insert to authenticated
with check (bucket_id = 'mado-pilot' and exists (
  select 1 from public.mado_pilot_orders o
  where o.id::text = (storage.foldername(name))[2] and o.user_id::text = (storage.foldername(name))[1]
  and ((o.user_id = (select auth.uid()) and o.status = 'requested' and (storage.filename(name)) like 'material-%') or (select public.is_platform_admin()))
));
