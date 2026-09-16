-- Transactional integration checks. Fixtures and auth rows are always rolled back.
begin;
select set_config('funnel_test.buyer',gen_random_uuid()::text,true);
select set_config('funnel_test.other',gen_random_uuid()::text,true);
select set_config('funnel_test.admin',gen_random_uuid()::text,true);
select set_config('funnel_test.order',gen_random_uuid()::text,true);
insert into auth.users(id) values (current_setting('funnel_test.buyer')::uuid),(current_setting('funnel_test.other')::uuid),(current_setting('funnel_test.admin')::uuid);
insert into public.platform_admins(user_id) values(current_setting('funnel_test.admin')::uuid);
set local role authenticated;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('funnel_test.buyer'),'role','authenticated')::text,true);
insert into public.mado_funnel_orders(id,user_id,title,entry_url,audience,goal,test_mode,consent)
values(current_setting('funnel_test.order')::uuid,auth.uid(),'TEST','https://example.com/','TEST','TEST','before_submit',true);
do $$ begin
 begin
  update public.mado_funnel_orders set quote_yen=100 where id=current_setting('funnel_test.order')::uuid;
  raise exception 'TEST FAILED: buyer edited quote';
 exception when raise_exception then if sqlerrm like 'TEST FAILED:%' then raise; end if; end;
 begin
  insert into public.mado_funnel_orders(user_id,title,entry_url,audience,goal,test_mode,consent)
  values(auth.uid(),'TEST','https://example.com/','TEST','TEST','test_completion',true);
  raise exception 'TEST FAILED: completion without authorization';
 exception when check_violation then null; end;
 begin
  insert into public.mado_funnel_orders(user_id,previous_order_id,title,entry_url,audience,goal,test_mode,consent)
  values(auth.uid(),current_setting('funnel_test.order')::uuid,'TEST','https://example.com/','TEST','TEST','before_submit',true);
  raise exception 'TEST FAILED: premature retest';
 exception when raise_exception then if sqlerrm like 'TEST FAILED:%' then raise; end if; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('funnel_test.other'),'role','authenticated')::text,true);
do $$ begin
 if exists(select 1 from public.mado_funnel_orders where id=current_setting('funnel_test.order')::uuid) then raise exception 'TEST FAILED: cross-owner read'; end if;
 update public.mado_funnel_orders set quote_accepted_at=now() where id=current_setting('funnel_test.order')::uuid;
 if found then raise exception 'TEST FAILED: cross-owner write'; end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('funnel_test.admin'),'role','authenticated')::text,true);
update public.mado_funnel_orders set status='quoted',quote_yen=0,quote_scope='TEST no payment / no external action' where id=current_setting('funnel_test.order')::uuid;
do $$ begin
 begin
  update public.mado_funnel_orders set quote_accepted_at=now() where id=current_setting('funnel_test.order')::uuid;
  raise exception 'TEST FAILED: admin impersonated buyer consent';
 exception when raise_exception then if sqlerrm like 'TEST FAILED:%' then raise; end if; end;
 begin
  update public.mado_funnel_orders set status='checking',payment_confirmed=true where id=current_setting('funnel_test.order')::uuid;
  raise exception 'TEST FAILED: started without consent';
 exception when raise_exception then if sqlerrm like 'TEST FAILED:%' then raise; end if; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('funnel_test.buyer'),'role','authenticated')::text,true);
update public.mado_funnel_orders set quote_accepted_at=now() where id=current_setting('funnel_test.order')::uuid;
do $$ begin
 update public.mado_funnel_orders set quote_accepted_at=now() where id=current_setting('funnel_test.order')::uuid and version=1;
 if found then raise exception 'TEST FAILED: stale version'; end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('funnel_test.admin'),'role','authenticated')::text,true);
do $$ begin
 begin
  update public.mado_funnel_orders set quote_yen=10 where id=current_setting('funnel_test.order')::uuid;
  raise exception 'TEST FAILED: accepted quote changed';
 exception when raise_exception then if sqlerrm like 'TEST FAILED:%' then raise; end if; end;
 begin
  update public.mado_funnel_orders set status='checking' where id=current_setting('funnel_test.order')::uuid;
  raise exception 'TEST FAILED: started without payment check';
 exception when raise_exception then if sqlerrm like 'TEST FAILED:%' then raise; end if; end;
end $$;
update public.mado_funnel_orders set status='checking',payment_confirmed=true where id=current_setting('funnel_test.order')::uuid;
do $$ begin
 begin
  update public.mado_funnel_orders set report_summary='Draft' where id=current_setting('funnel_test.order')::uuid;
  raise exception 'TEST FAILED: unpublished draft persisted on buyer-readable row';
 exception when raise_exception then if sqlerrm like 'TEST FAILED:%' then raise; end if; end;
 begin
  update public.mado_funnel_orders set status='reported' where id=current_setting('funnel_test.order')::uuid;
  raise exception 'TEST FAILED: empty report published';
 exception when raise_exception then if sqlerrm like 'TEST FAILED:%' then raise; end if; end;
end $$;
update public.mado_funnel_orders set status='reported',report_summary='TEST report',checked_scope='TEST before submission; completion not verified',
 findings='[{"source":"human","reviewer":"TEST A","step":"form","observation":"TEST observed","hypothesis":"TEST hypothesis","suggestion":"TEST next action"},{"source":"ai","reviewer":"TEST AI","step":"understand","observation":"TEST inconsistency","hypothesis":"","suggestion":"TEST next action"}]'::jsonb
 where id=current_setting('funnel_test.order')::uuid;
do $$ begin
 begin
  update public.mado_funnel_orders set findings='[]'::jsonb where id=current_setting('funnel_test.order')::uuid;
  raise exception 'TEST FAILED: published report changed';
 exception when raise_exception then if sqlerrm like 'TEST FAILED:%' then raise; end if; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('funnel_test.other'),'role','authenticated')::text,true);
do $$ begin
 begin
  insert into public.mado_funnel_orders(user_id,previous_order_id,title,entry_url,audience,goal,test_mode,consent)
  values(auth.uid(),current_setting('funnel_test.order')::uuid,'TEST','https://example.com/','TEST','TEST','before_submit',true);
  raise exception 'TEST FAILED: foreign retest linked';
 exception when raise_exception then if sqlerrm like 'TEST FAILED:%' then raise; end if; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('funnel_test.buyer'),'role','authenticated')::text,true);
insert into public.mado_funnel_orders(user_id,previous_order_id,title,entry_url,audience,goal,test_mode,consent)
values(auth.uid(),current_setting('funnel_test.order')::uuid,'TEST retest','https://example.com/updated','TEST','TEST','before_submit',true);
do $$ declare i integer; begin
 if not exists(select 1 from public.mado_funnel_orders where id=current_setting('funnel_test.order')::uuid and status='reported' and jsonb_array_length(findings)=2) then raise exception 'TEST FAILED: buyer cannot read report'; end if;
 for i in 1..3 loop
  insert into public.mado_funnel_orders(user_id,title,entry_url,audience,goal,test_mode,consent) values(auth.uid(),'TEST quota','https://example.com/','TEST','TEST','before_submit',true);
 end loop;
 begin
  insert into public.mado_funnel_orders(user_id,title,entry_url,audience,goal,test_mode,consent) values(auth.uid(),'TEST sixth','https://example.com/','TEST','TEST','before_submit',true);
  raise exception 'TEST FAILED: active quota bypassed';
 exception when raise_exception then if sqlerrm like 'TEST FAILED:%' then raise; end if; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('funnel_test.admin'),'role','authenticated')::text,true);
update public.mado_funnel_orders set status='closed' where id=current_setting('funnel_test.order')::uuid;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('funnel_test.buyer'),'role','authenticated')::text,true);
insert into public.mado_funnel_orders(user_id,title,entry_url,audience,goal,test_mode,consent) values(auth.uid(),'TEST slot released','https://example.com/','TEST','TEST','before_submit',true);
set local role anon;
do $$ begin
 begin
  perform 1 from public.mado_funnel_orders;
  raise exception 'TEST FAILED: anonymous access';
 exception when insufficient_privilege then null; end;
end $$;
rollback;
select 'PASS: ownership, authorization, quotes, transitions, publication, linked retests, quota, anonymous denial; fixtures rolled back' as result;
