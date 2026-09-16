-- Transactional integration test: all users, orders and object metadata roll back.
-- No emails, sessions, real image objects or external messages are created.
begin;
select set_config('mado_test.buyer',gen_random_uuid()::text,true);
select set_config('mado_test.other',gen_random_uuid()::text,true);
select set_config('mado_test.admin',gen_random_uuid()::text,true);
select set_config('mado_test.order',gen_random_uuid()::text,true);
insert into auth.users(id) values
  (current_setting('mado_test.buyer')::uuid),
  (current_setting('mado_test.other')::uuid),
  (current_setting('mado_test.admin')::uuid);
insert into public.platform_admins(user_id) values(current_setting('mado_test.admin')::uuid);
set local role authenticated;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('mado_test.buyer'),'role','authenticated','email','pilot-test@example.invalid')::text,true);
insert into public.mado_pilot_orders(id,user_id,title,audience,facts,goal,consent)
values(current_setting('mado_test.order')::uuid,auth.uid(),'Verification fixture','Test audience','Test facts','Test goal',true);
do $$ begin
  begin
    update public.mado_pilot_orders set quote_yen=100 where id=current_setting('mado_test.order')::uuid;
    raise exception 'TEST FAILED: buyer changed quote';
  exception when raise_exception then
    if sqlerrm like 'TEST FAILED:%' then raise; end if;
  end;
  begin
    update public.mado_pilot_orders set selected_variant=1 where id=current_setting('mado_test.order')::uuid;
    raise exception 'TEST FAILED: buyer selected before review';
  exception when raise_exception then
    if sqlerrm like 'TEST FAILED:%' then raise; end if;
  end;
end $$;
insert into public.mado_pilot_applications(user_id,display_name,contact_email,specialty,method,consent)
values(auth.uid(),'Test creator','pilot-test@example.invalid','Test','Private test prompt',true);
-- Five directly inserted objects pass; the sixth must be refused by Storage RLS.
do $$ declare i integer; prefix text := current_setting('mado_test.buyer') || '/' || current_setting('mado_test.order') || '/'; begin
  for i in 1..5 loop
    insert into storage.objects(bucket_id,name) values('mado-pilot',prefix || 'material-' || gen_random_uuid()::text || '.webp');
  end loop;
  begin
    insert into storage.objects(bucket_id,name) values('mado-pilot',prefix || 'material-' || gen_random_uuid()::text || '.webp');
    raise exception 'TEST FAILED: sixth owner image allowed';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('mado_test.other'),'role','authenticated')::text,true);
do $$ begin
  if exists(select 1 from public.mado_pilot_orders where id=current_setting('mado_test.order')::uuid) then raise exception 'TEST FAILED: foreign order readable'; end if;
  if exists(select 1 from public.mado_pilot_applications where user_id=current_setting('mado_test.buyer')::uuid) then raise exception 'TEST FAILED: foreign prompt readable'; end if;
  if exists(select 1 from storage.objects where bucket_id='mado-pilot' and starts_with(name,current_setting('mado_test.buyer') || '/')) then raise exception 'TEST FAILED: foreign image readable'; end if;
  update public.mado_pilot_orders set operator_note='attack' where id=current_setting('mado_test.order')::uuid;
  if found then raise exception 'TEST FAILED: foreign order writable'; end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('mado_test.admin'),'role','authenticated')::text,true);
update public.mado_pilot_orders set status='quoted',quote_yen=1000,quote_scope='Test fixed quote' where id=current_setting('mado_test.order')::uuid;
do $$ begin
  begin
    update public.mado_pilot_orders set status='production',payment_confirmed=true where id=current_setting('mado_test.order')::uuid;
    raise exception 'TEST FAILED: production before consent';
  exception when raise_exception then if sqlerrm like 'TEST FAILED:%' then raise; end if; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('mado_test.buyer'),'role','authenticated')::text,true);
update public.mado_pilot_orders set quote_accepted_at=now() where id=current_setting('mado_test.order')::uuid;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('mado_test.admin'),'role','authenticated')::text,true);
do $$ begin
  begin
    update public.mado_pilot_orders set quote_yen=2000 where id=current_setting('mado_test.order')::uuid;
    raise exception 'TEST FAILED: accepted quote changed';
  exception when raise_exception then if sqlerrm like 'TEST FAILED:%' then raise; end if; end;
end $$;
update public.mado_pilot_orders set status='production',payment_confirmed=true where id=current_setting('mado_test.order')::uuid;
update public.mado_pilot_orders set status='review',variants='[{"title":"A"},{"title":"B"},{"title":"C"}]'::jsonb where id=current_setting('mado_test.order')::uuid;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('mado_test.buyer'),'role','authenticated')::text,true);
update public.mado_pilot_orders set selected_variant=2,revision_note='Test revision' where id=current_setting('mado_test.order')::uuid;
do $$ begin
  if not exists(select 1 from public.mado_pilot_orders where id=current_setting('mado_test.order')::uuid and status='revision' and selected_variant=2) then raise exception 'TEST FAILED: revision transition'; end if;
  update public.mado_pilot_orders set selected_variant=1 where id=current_setting('mado_test.order')::uuid and version=1;
  if found then raise exception 'TEST FAILED: stale update passed'; end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('mado_test.admin'),'role','authenticated')::text,true);
update public.mado_pilot_orders set status='delivered',delivery_path=current_setting('mado_test.buyer') || '/' || current_setting('mado_test.order') || '/output-' || gen_random_uuid()::text || '.webp' where id=current_setting('mado_test.order')::uuid;
do $$ declare i integer; prefix text := current_setting('mado_test.buyer') || '/' || current_setting('mado_test.order') || '/'; begin
  for i in 6..40 loop
    insert into storage.objects(bucket_id,name) values('mado-pilot',prefix || 'output-' || gen_random_uuid()::text || '.webp');
  end loop;
  begin
    insert into storage.objects(bucket_id,name) values('mado-pilot',prefix || 'output-' || gen_random_uuid()::text || '.webp');
    raise exception 'TEST FAILED: 41st admin image allowed';
  exception when insufficient_privilege then null; end;
end $$;
set local role anon;
do $$ begin
  begin
    perform 1 from public.mado_pilot_orders;
    raise exception 'TEST FAILED: anon can query orders';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
select 'PASS: ownership, prompt privacy, image privacy, direct storage limits 5/40, quote tamper, early selection, consent, immutable accepted quote, production/review/revision/delivery, stale update, anonymous denial. All fixtures rolled back.' as result;
