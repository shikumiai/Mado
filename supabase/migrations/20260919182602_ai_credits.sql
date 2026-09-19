-- AI generation reservations. Only the server can spend/refund; callers cannot set plan/cost.
create table if not exists public.ai_requests (
  id uuid primary key,
  org_id uuid not null references public.orgs(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  period text not null,
  kind text not null check (kind in ('text','company')),
  credits integer not null check (credits in (1,5)),
  input_hash text not null,
  status text not null default 'running' check (status in ('running','succeeded','failed')),
  result jsonb,
  created_at timestamptz not null default now()
);
create index if not exists ai_requests_org_period on public.ai_requests(org_id,period);
alter table public.ai_requests enable row level security;
revoke all on public.ai_requests from anon, authenticated;
grant select on public.ai_requests to authenticated;
grant all on public.ai_requests to service_role;
drop policy if exists ai_requests_read on public.ai_requests;
create policy ai_requests_read on public.ai_requests for select to authenticated
  using (public.can_edit_site(site_id));

create or replace function public.ai_credit_balance(p_org_id uuid) returns jsonb
language plpgsql volatile security invoker set search_path = '' as $$
declare v_result jsonb;
begin
  perform 1 from public.orgs where id=p_org_id for update;
  update public.ai_requests set status='failed' where org_id=p_org_id and status='running' and created_at < now()-interval '5 minutes';
  select jsonb_build_object(
    'limit', case when (o.status <> 'active' or o.stripe_subscription_id is null) then 0 when o.plan='omakase' then 30 when o.plan='omakase-pro' then 100 else 0 end,
    'used', coalesce(sum(r.credits) filter (where r.status <> 'failed'),0),
    'attempted', coalesce(sum(r.credits),0),
    'resetsAt', (date_trunc('month',now() at time zone 'Asia/Tokyo') + interval '1 month') at time zone 'Asia/Tokyo'
  ) into v_result from public.orgs o left join public.ai_requests r on r.org_id=o.id
    and r.period=to_char(now() at time zone 'Asia/Tokyo','YYYY-MM')
  where o.id=p_org_id group by o.id,o.plan,o.status;
  return v_result;
end $$;
revoke all on function public.ai_credit_balance(uuid) from public, anon, authenticated;
grant execute on function public.ai_credit_balance(uuid) to service_role;

create or replace function public.reserve_ai_request(
  p_site_id uuid, p_user_id uuid, p_id uuid, p_hash text, p_kind text
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_org public.orgs%rowtype;
  v_existing public.ai_requests%rowtype;
  v_balance jsonb;
  v_cost integer;
  v_limit integer;
begin
  if p_user_id is null or p_id is null or p_hash is null or length(p_hash) <> 64 or p_kind not in ('text','company') or p_kind is null then
    return jsonb_build_object('status','invalid');
  end if;
  -- One lock for every site/user in this billing org, including concurrent requests.
  select o.* into v_org from public.orgs o join public.sites s on s.org_id=o.id
    where s.id=p_site_id for update of o;
  if not found then return jsonb_build_object('status','forbidden'); end if;
  if not exists (select 1 from public.org_members where org_id=v_org.id and user_id=p_user_id and role in ('owner','editor'))
     and not exists (select 1 from public.platform_admins where user_id=p_user_id) then
    return jsonb_build_object('status','forbidden');
  end if;
  v_limit := case when (v_org.status <> 'active' or v_org.stripe_subscription_id is null) then 0 when v_org.plan='omakase' then 30 when v_org.plan='omakase-pro' then 100 else 0 end;
  if v_limit=0 then return jsonb_build_object('status','paid_required'); end if;
  -- A terminated worker releases user credits, never the operating-cost budget.
  update public.ai_requests set status='failed' where org_id=v_org.id and status='running' and created_at < now()-interval '5 minutes';
  v_balance := public.ai_credit_balance(v_org.id);
  select * into v_existing from public.ai_requests where id=p_id;
  if found then
    if v_existing.site_id <> p_site_id or v_existing.user_id <> p_user_id or v_existing.kind <> p_kind or v_existing.input_hash <> p_hash then
      return jsonb_build_object('status','conflict');
    end if;
    return jsonb_build_object('status',v_existing.status,'result',v_existing.result,'balance',v_balance);
  end if;
  v_cost := case when p_kind='company' then 5 else 1 end;
  if (v_balance->>'used')::int+v_cost > v_limit then
    return jsonb_build_object('status','limit','balance',v_balance);
  end if;
  -- Failures may still cost money at the provider. Never refund this second budget.
  if (v_balance->>'attempted')::int+v_cost > v_limit*2 then
    return jsonb_build_object('status','budget','balance',v_balance);
  end if;
  if exists(select 1 from public.ai_requests where org_id=v_org.id and status='running') then
    return jsonb_build_object('status','busy','balance',v_balance);
  end if;
  insert into public.ai_requests(id,org_id,site_id,user_id,period,kind,credits,input_hash)
    values(p_id,v_org.id,p_site_id,p_user_id,to_char(now() at time zone 'Asia/Tokyo','YYYY-MM'),p_kind,v_cost,p_hash);
  return jsonb_build_object('status','reserved','balance',public.ai_credit_balance(v_org.id));
end $$;
revoke all on function public.reserve_ai_request(uuid,uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.reserve_ai_request(uuid,uuid,uuid,text,text) to service_role;

create or replace function public.finish_ai_request(p_id uuid,p_user_id uuid,p_result jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare v_org_id uuid;
begin
  -- Same lock order as reserve; settlement cannot reopen a finished/stale reservation.
  select org_id into v_org_id from public.ai_requests where id=p_id and user_id=p_user_id;
  if not found then return null; end if;
  perform 1 from public.orgs where id=v_org_id for update;
  update public.ai_requests set status=case when p_result is null or p_result='null'::jsonb then 'failed' else 'succeeded' end,result=p_result
    where id=p_id and user_id=p_user_id and status='running';
  return public.ai_credit_balance(v_org_id);
end $$;
revoke all on function public.finish_ai_request(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.finish_ai_request(uuid,uuid,jsonb) to service_role;
