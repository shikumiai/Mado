create table public.mado_funnel_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  previous_order_id uuid references public.mado_funnel_orders(id),
  title text not null check (length(title) between 1 and 100),
  entry_url text not null check (length(entry_url) between 9 and 2000 and entry_url ~ '^https://[^[:space:]@]+$'),
  audience text not null check (length(audience) between 1 and 1000),
  goal text not null check (length(goal) between 1 and 1000),
  context text not null default '' check (length(context) <= 4000),
  test_mode text not null check (test_mode in ('before_submit','test_completion')),
  test_authorized boolean not null default false,
  check (test_mode = 'before_submit' or test_authorized),
  consent boolean not null check (consent),
  status text not null default 'requested' check (status in ('requested','quoted','checking','reported','closed','cancelled')),
  quote_yen integer check (quote_yen between 0 and 1000000),
  quote_scope text not null default '' check (length(quote_scope) <= 4000),
  quote_accepted_at timestamptz,
  payment_confirmed boolean not null default false,
  report_summary text not null default '' check (length(report_summary) <= 4000),
  checked_scope text not null default '' check (length(checked_scope) <= 4000),
  findings jsonb not null default '[]'::jsonb check (jsonb_typeof(findings) = 'array' and jsonb_array_length(findings) <= 10),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.mado_funnel_orders(user_id, created_at desc);
create index on public.mado_funnel_orders(previous_order_id);
alter table public.mado_funnel_orders enable row level security;
revoke all on public.mado_funnel_orders from anon, authenticated;
grant select, insert, update on public.mado_funnel_orders to authenticated;
create policy funnel_read on public.mado_funnel_orders for select to authenticated
 using (user_id = (select auth.uid()) or (select public.is_platform_admin()));
create policy funnel_create on public.mado_funnel_orders for insert to authenticated
 with check (user_id = (select auth.uid()));
create policy funnel_update on public.mado_funnel_orders for update to authenticated
 using (user_id = (select auth.uid()) or (select public.is_platform_admin()))
 with check (user_id = (select auth.uid()) or (select public.is_platform_admin()));

create function public.guard_mado_funnel_order() returns trigger
language plpgsql set search_path = '' as $$
declare item jsonb;
begin
 if tg_op = 'INSERT' then
   if new.user_id is distinct from auth.uid() then raise exception 'Owner required'; end if;
   perform pg_advisory_xact_lock(hashtextextended('mado-funnel:' || new.user_id::text, 0));
   if (select count(*) from public.mado_funnel_orders where user_id = new.user_id and status not in ('closed','cancelled')) >= 5 then
     raise exception 'Maximum five active requests';
   end if;
   if new.previous_order_id is not null and not exists (
     select 1 from public.mado_funnel_orders where id = new.previous_order_id and user_id = new.user_id and status in ('reported','closed')
   ) then raise exception 'Invalid previous request'; end if;
   if new.status <> 'requested' or new.quote_yen is not null or new.quote_scope <> '' or new.quote_accepted_at is not null
      or new.payment_confirmed or new.report_summary <> '' or new.checked_scope <> '' or new.findings <> '[]'::jsonb then
     raise exception 'New request must be empty';
   end if;
   new.version := 1; new.created_at := now();
 else
   if (to_jsonb(new) - array['status','quote_yen','quote_scope','quote_accepted_at','payment_confirmed','report_summary','checked_scope','findings','version','updated_at'])
      is distinct from (to_jsonb(old) - array['status','quote_yen','quote_scope','quote_accepted_at','payment_confirmed','report_summary','checked_scope','findings','version','updated_at']) then
     raise exception 'Request details are immutable';
   end if;
   if not public.is_platform_admin() then
     if new.user_id is distinct from auth.uid() or
       (to_jsonb(new) - array['quote_accepted_at','version','updated_at']) is distinct from
       (to_jsonb(old) - array['quote_accepted_at','version','updated_at']) or
       old.status <> 'quoted' or old.quote_accepted_at is not null or new.quote_accepted_at is null then
       raise exception 'Only quote acceptance is allowed';
     end if;
     new.quote_accepted_at := now();
   else
     if new.quote_accepted_at is distinct from old.quote_accepted_at then
       if new.user_id is distinct from auth.uid() or old.status <> 'quoted' or old.quote_accepted_at is not null or new.quote_accepted_at is null
         or new.quote_scope is distinct from old.quote_scope or new.quote_yen is distinct from old.quote_yen then
         raise exception 'Only buyer may accept the current quote';
       end if;
       new.quote_accepted_at := now();
     end if;
     if old.quote_accepted_at is not null and (new.quote_yen is distinct from old.quote_yen or new.quote_scope is distinct from old.quote_scope) then
       raise exception 'Accepted quote is immutable';
     end if;
     if new.status <> old.status and not (
       (old.status = 'requested' and new.status = 'quoted') or
       (old.status = 'quoted' and new.status = 'checking') or
       (old.status = 'checking' and new.status = 'reported') or
       (old.status = 'reported' and new.status = 'closed') or
       (old.status in ('requested','quoted','checking') and new.status = 'cancelled')
     ) then raise exception 'Invalid transition'; end if;
     if old.status in ('reported','closed','cancelled') and
       (new.report_summary is distinct from old.report_summary or new.checked_scope is distinct from old.checked_scope or new.findings is distinct from old.findings) then
       raise exception 'Published results are immutable';
     end if;
   end if;
   new.version := old.version + 1;
 end if;
 if new.status in ('quoted','checking','reported','closed') and (new.quote_yen is null or length(btrim(new.quote_scope)) = 0) then raise exception 'Quote required'; end if;
 if new.status in ('checking','reported','closed') and (new.quote_accepted_at is null or not new.payment_confirmed) then raise exception 'Acceptance and payment required'; end if;
 if new.status in ('reported','closed') and (length(btrim(new.report_summary)) = 0 or length(btrim(new.checked_scope)) = 0 or jsonb_array_length(new.findings) = 0) then raise exception 'Report required'; end if;
 if new.status not in ('reported','closed') and (new.report_summary <> '' or new.checked_scope <> '' or new.findings <> '[]'::jsonb) then
   raise exception 'Save results only when publishing';
 end if;
 for item in select value from jsonb_array_elements(new.findings) loop
   if jsonb_typeof(item) <> 'object' or not (item ?& array['source','reviewer','step','observation','hypothesis','suggestion'])
     or coalesce(item->>'source','') not in ('human','ai')
     or coalesce(item->>'step','') not in ('entry','understand','form','complete')
     or coalesce(length(btrim(item->>'reviewer')),0) not between 1 and 100
     or coalesce(length(btrim(item->>'observation')),0) not between 1 and 2000
     or coalesce(length(item->>'hypothesis'),4001) > 2000
     or coalesce(length(btrim(item->>'suggestion')),0) not between 1 and 2000 then raise exception 'Invalid finding'; end if;
 end loop;
 new.updated_at := now();
 return new;
end $$;
create trigger guard_mado_funnel_order before insert or update on public.mado_funnel_orders
for each row execute function public.guard_mado_funnel_order();
revoke all on function public.guard_mado_funnel_order() from public, anon, authenticated;
