const assert=require('node:assert/strict');
const fs=require('node:fs'); const path=require('node:path'); const Module=require('node:module'); const ts=require('typescript');
const root=path.resolve(__dirname,'..');
require.extensions['.ts']=(m,name)=>m._compile(ts.transpileModule(fs.readFileSync(name,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,name);
const resolve=Module._resolveFilename;
Module._resolveFilename=function(name,...rest){return resolve.call(this,name.startsWith('@/')?path.join(root,'src',name.slice(2)):name,...rest)};
const {restoreSignupStep}=require('../src/lib/signup-flow.ts');
assert.deepEqual([0,1,2,3,4,5,6,7].map(n=>restoreSignupStep(n,undefined,'saveur')),[0,1,3,2,4,5,6,7]);
assert.equal(restoreSignupStep(2,undefined,null),2); assert.equal(restoreSignupStep(3,2,'saveur'),3);
const {aiPeriod,AI_MAX_PROMPT_BYTES,AI_MAX_OUTPUT_TOKENS,AI_COST}=require('../src/lib/ai/policy.ts');
assert.equal(aiPeriod(new Date('2026-09-30T14:59:59Z')),'2026-09');assert.equal(aiPeriod(new Date('2026-09-30T15:00:00Z')),'2026-10');
for(const kind of ['text','company']) assert.ok(((AI_MAX_PROMPT_BYTES[kind]+500)*0.4+AI_MAX_OUTPUT_TOKENS[kind]*1.6)/1e6*200 < AI_COST[kind]*2);
const {aiTargets,parseAiSuggestions,applyAiSuggestions}=require('../src/lib/ai/content.ts');
const config={company:{name:'Test',tagline:'Old',description:'',bio:''},style:{brand:{primary:'#123456'}},sections:[{type:'hero',visible:true,data:{title:'Override',image:'original.jpg'}}]};
const source='京都で木の椅子を作る会社です。';
const targets=aiTargets(config,'company');
const suggestion={path:'company.tagline',after:'京都でつくる、木の椅子。',evidence:'京都で木の椅子を作る'};
const parse=s=>parseAiSuggestions(JSON.stringify({suggestions:s}),targets,source);
const parsed=parse([suggestion]);assert.equal(parsed[0].before,'Old');
assert.throws(()=>parse([{...suggestion,path:'__proto__.polluted'}]));assert.throws(()=>parse([{...suggestion,evidence:'存在しない根拠'}]));assert.throws(()=>parse([{...suggestion,after:'創業30年'}]));
const updated=applyAiSuggestions(config,parsed);assert.equal(config.company.tagline,'Old');assert.deepEqual(updated.style,config.style);assert.deepEqual(updated.sections,config.sections);
assert.throws(()=>applyAiSuggestions({...config,company:{...config.company,tagline:'Changed'}},parsed));
let scenario={},calls=0,rpcs=[];
const rawBalance={limit:30,used:5,attempted:5,resetsAt:'2026-09-30T15:00:00Z'};
const db={from(){const q={select(){return q},eq(){return q},single:async()=>({data:{config,version:1,org_id:'org'}})};return q},async rpc(name,params){rpcs.push([name,params]);if(name==='reserve_ai_request')return{data:scenario.noLedger?null:{status:scenario.status||'reserved',balance:rawBalance,result:{suggestions:parsed,version:1}}};return{data:rawBalance}}};
const load=Module._load;
Module._load=function(name,...rest){
 if(name==='@/lib/auth')return{requireSiteAccess:async()=>scenario.denied?{ok:false,reason:'forbidden'}:{ok:true,user:{id:'user'}}};
 if(name==='@/lib/ai/billing-gate')return{verifyAiSubscription:async()=>scenario.billingDenied?'not_paid':null};
 if(name==='@/lib/supabase/server')return{getWriteClient:()=>db};
 if(name==='openai')return class {constructor(opts){assert.equal(opts.maxRetries,0);assert.equal(opts.timeout,40000);this.chat={completions:{create:async p=>{calls++;assert.equal(p.model,'gpt-4.1-mini-2025-04-14');assert.equal(p.max_completion_tokens,3200);if(scenario.providerFail)throw Error('fake');return{choices:[{finish_reason:'stop',message:{content:JSON.stringify({suggestions:[suggestion]})}}]}}}}}};
 return load.call(this,name,...rest);
};
const {POST}=require('../src/app/api/ai-edit/route.ts'); const {NextRequest}=require('next/server');
process.env.OPENAI_API_KEY='fixture-not-a-real-key';
const base={siteId:'00000000-0000-4000-8000-000000000001',requestId:'00000000-0000-4000-8000-000000000002',kind:'company',source,version:1};
async function run(state,patch={}){scenario=state;calls=0;rpcs=[];const response=await POST(new NextRequest('https://example.invalid/api/ai-edit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...base,...patch})}));return{status:response.status,body:await response.json()};}
(async()=>{
 for(const state of [{denied:true},{billingDenied:true},{status:'paid_required'},{status:'limit'},{status:'budget'},{status:'busy'},{status:'running'},{status:'conflict'},{noLedger:true}]){const r=await run(state);assert.ok(r.status>=400);assert.equal(calls,0);}
 assert.equal((await run({}, {source:'x'.repeat(6001)})).status,400);assert.equal(calls,0);
 assert.equal((await run({}, {version:2})).status,409);assert.equal(calls,0);
 assert.equal((await run({})).status,200);assert.equal(calls,1);assert.equal(rpcs.at(-1)[1].p_result.suggestions.length,1);
 assert.equal((await run({status:'succeeded'})).status,200);assert.equal(calls,0);
 assert.equal((await run({providerFail:true})).status,502);assert.equal(calls,1);assert.equal(rpcs.at(-1)[1].p_result,null);
 delete process.env.OPENAI_API_KEY;assert.equal((await run({})).status,503);assert.equal(calls,0);assert.equal(rpcs.length,0);
 console.log('PASS: onboarding draft migration, JST reset, cost bound, grounded/allowed fields, snapshot apply, actual API auth/quota/idempotency/failure/no-key gates');
})().catch(e=>{console.error(e);process.exitCode=1});
