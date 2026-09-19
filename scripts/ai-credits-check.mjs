import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '../.verification/pg-test/node_modules/@electric-sql/pglite/dist/index.js';
const db=new PGlite();const uid=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const [owner,editor,viewer,outsider,admin,org,site,site2]=[1,2,3,4,5,20,30,31].map(uid);
const sql=name=>readFile(new URL(`../supabase/migrations/${name}`,import.meta.url),'utf8');
let seq=100;
async function call(user=owner,kind='text',id=uid(seq++),target=site,hash='a'.repeat(64)){
 return db.transaction(async tx=>{await tx.exec('set local role service_role');return(await tx.query('select public.reserve_ai_request($1,$2,$3,$4,$5) r',[target,user,id,hash,kind])).rows[0].r});
}
async function finish(id,user=owner,result={suggestions:[]}){return(await db.query('select public.finish_ai_request($1,$2,$3::jsonb) r',[id,user,JSON.stringify(result)])).rows[0].r}
async function reset(){await db.exec('delete from public.ai_requests');await db.query("update orgs set plan='omakase',status='active',stripe_subscription_id='sub_fixture' where id=$1",[org]);}
try{
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create schema storage;create table storage.buckets(id text primary key,name text,public boolean);create table storage.objects(id uuid primary key,bucket_id text);alter table storage.objects enable row level security;grant usage on schema public,auth,storage to anon,authenticated,service_role;`);
 for(const file of ['0001_init.sql','0002_config_save_result.sql','20260919174341_site_editor_write_roles.sql'])await db.exec(await sql(file));
 await db.exec('grant all on all tables in schema public,auth to service_role;grant all on all tables in schema public to authenticated,anon;grant usage on all sequences in schema public to service_role,authenticated,anon;');
 const migration=await sql('20260919182602_ai_credits.sql');await db.exec(migration);await db.exec(migration);
 for(const user of [owner,editor,viewer,outsider,admin])await db.query('insert into auth.users values($1)',[user]);
 await db.query("insert into orgs(id,name,email,plan,status,stripe_subscription_id) values($1,'Fixture','fixture@example.invalid','omakase','active','sub_fixture')",[org]);
 for(const [user,role] of [[owner,'owner'],[editor,'editor'],[viewer,'viewer']])await db.query('insert into org_members(org_id,user_id,role)values($1,$2,$3)',[org,user,role]);
 await db.query('insert into platform_admins(user_id)values($1)',[admin]);
 await db.query("insert into sites(id,org_id,slug,template_id,status)values($1,$3,'ai-test','warm-craft','live'),($2,$3,'ai-second','warm-craft','live')",[site,site2,org]);
 for(const role of ['anon','authenticated'])await assert.rejects(db.transaction(async tx=>{await tx.exec(`set local role ${role}`);await tx.query('select public.reserve_ai_request($1,$2,$3,$4,$5)',[site,owner,uid(99),'a'.repeat(64),'text']);}),{code:'42501'});
 for(const user of [viewer,outsider,null])assert.equal((await call(user)).status,user===null?'invalid':'forbidden');
 for(const [plan,status,sub] of [['otameshi','active','sub_fixture'],['omakase','pending','sub_fixture'],['omakase','past_due','sub_fixture'],['omakase-pro','active',null]]){
  await db.query('update orgs set plan=$1,status=$2,stripe_subscription_id=$3 where id=$4',[plan,status,sub,org]);assert.equal((await call()).status,'paid_required');
 }
 await reset();
 for(const user of [owner,editor,admin]){const id=uid(seq++);assert.equal((await call(user,'text',id)).status,'reserved');await finish(id,user)}
 const id=uid(seq++);let r=await call(owner,'company',id);assert.equal(r.status,'reserved');assert.equal(r.balance.used,8);
 assert.equal((await call(owner,'company',id)).status,'running');assert.equal((await call(editor,'company',id)).status,'conflict');
 assert.equal((await call(owner,'text',uid(seq++),site2)).status,'busy');await finish(id);
 assert.equal((await call(owner,'company',id)).status,'succeeded');
 await reset();
 const batch=await Promise.all([call(owner),call(editor)]);assert.deepEqual(batch.map(r=>r.status).sort(),['busy','reserved']);
 await reset();
 for(let i=0;i<6;i++){const id=uid(seq++);assert.equal((await call(owner,'company',id)).status,'reserved');await finish(id)}
 assert.equal((await call()).status,'limit');
 await db.query("update orgs set plan='omakase-pro' where id=$1",[org]);r=await call();assert.equal(r.status,'reserved');assert.equal(r.balance.used,31);assert.equal(r.balance.limit,100);
 await reset();
 for(let i=0;i<12;i++){const id=uid(seq++);assert.equal((await call(owner,'company',id)).status,'reserved');const result=await finish(id,owner,null);assert.equal(result.used,0)}
 assert.equal((await call()).status,'budget');
 await db.exec("update ai_requests set period='2020-01'");assert.equal((await call()).status,'reserved');
 await db.exec("update ai_requests set created_at=now()-interval '6 minutes' where status='running'");r=await call();assert.equal(r.status,'reserved');assert.equal(r.balance.used,1);assert.equal(r.balance.attempted,2);
 await db.exec("update ai_requests set created_at=now()-interval '6 minutes' where status='running'");
 const refreshed=(await db.query('select public.ai_credit_balance($1) r',[org])).rows[0].r;assert.equal(refreshed.used,0);assert.equal(refreshed.attempted,2);
 await db.query('delete from org_members where user_id=$1',[owner]);assert.equal((await call()).status,'forbidden');
 console.log('PASS SQL: repeat migration, RPC grants, paid subscription requirement, owner/editor/admin, viewer/outsider, shared multi-site budget, in-flight lock, idempotency, plan change, failure refunds/budget cap, stale settlement, month rollover, revoked membership');
}finally{await db.close()}
