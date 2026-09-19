/* eslint-disable @typescript-eslint/no-require-imports -- Run the real TS/TSX modules without extra test dependencies. */
const assert = require('node:assert/strict');
const fs = require('node:fs'); const path = require('node:path'); const Module = require('node:module'); const ts = require('typescript');
const root = path.resolve(__dirname, '..');
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (m, name) => m._compile(ts.transpileModule(fs.readFileSync(name, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, name);
const resolve = Module._resolveFilename;
Module._resolveFilename = function(name, ...args) { return resolve.call(this, name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : name, ...args); };
const originalLoad = Module._load;
Module._load = function(name, ...args) { if (name === '@/lib/inquiries') return { submitInquiry: () => { throw Error('No external writes in tests'); } }; return originalLoad.call(this, name, ...args); };
const { generateSiteConfig } = require('../src/lib/template-config-generator.ts');
const { INDUSTRIES } = require('../src/lib/industry-registry.ts');
const { TEMPLATES } = require('../src/lib/templates/catalog.ts');
const { starterSectionData } = require('../src/lib/templates/starter-content.ts');
const { fieldsForSection, sectionContent, contentPatches, setConfigValue, uploadConfigImages, isContentUrl } = require('../src/lib/editor/content-fields.ts');
const { resolveFieldTarget } = require('../src/lib/editor/field-target.ts');
const { heroOf, worksOf, companyOf, contactOf, menuOf } = require('../src/components/sections/data.ts');
function config(templateId = 'warm-craft-pro', industry) { return generateSiteConfig({ orderId: '', templateId, industry, companyName: '利用者の屋号', email: 'owner@example.invalid' }); }
for (const industry of INDUSTRIES) {
  const c = config(industry.templateId + '-pro', industry.id);
  assert.equal(c.industry, industry.id);
  assert.equal(c.company.name, '利用者の屋号');
  assert.ok(c.sections[0].data.title.includes(industry.name));
  const text = JSON.stringify(c);
  for (const fiction of ['藤井', '大河内', '白川', '洋食みなも', '宮下', 'たかしま', '継ぎ足し', '合格率', '前日まで']) assert.ok(!text.includes(fiction), `${industry.id}: ${fiction}`);
  assert.equal(c.testimonials?.length ?? 0, 0); assert.equal(c.stats?.length ?? 0, 0); assert.equal(c.staff?.length ?? 0, 0);
}
const hotel = config('saveur-pro', 'hotel');
assert.ok(hotel.sections.some(s => s.data?.heading === '客室・宿泊プラン'));
assert.ok(!JSON.stringify(hotel).includes('パスタ'));
const c = config();
const wi = c.sections.findIndex(s => s.type === 'works');
const before = sectionContent(c, wi);
const after = { ...before, items: [...before.items].reverse().map((x, i) => i ? x : { ...x, title: '変更した実績' }) };
for (const p of contentPatches(c, wi, before, after)) setConfigValue(c, p.path, p.value);
assert.equal(worksOf(c, c.sections[wi].data).items[0].title, '変更した実績');
assert.equal(c.projects[0].title, '変更した実績');
// Clearing an explicit override must not resurrect a shared list or text.
c.sections[wi].data.items = [];
assert.equal(worksOf(c, c.sections[wi].data).items.length, 0);
assert.equal(resolveFieldTarget(c, `sections.${wi}.items`).path, `sections.${wi}.data.items`);
assert.equal(heroOf(c, { title: '', lead: '', image: '', eyebrow: '', badge: '' }).title, '');
assert.equal(heroOf(c, { image: '' }).image, '');
assert.equal(menuOf(c, { items: [{ id: 1, name: '商品', image: '', price: '100', category: '' }] }).items[0].image, '');
// Empty optional fields can be created, preserving numeric types and real arrays.
const fi = c.sections.findIndex(s => s.type === 'flow');
setConfigValue(c, resolveFieldTarget(c, `sections.${fi}.items`).path, [{ step: 1, title: '予約', description: '', duration: '' }]);
assert.ok(Array.isArray(c.flow)); assert.equal(typeof c.flow[0].step, 'number');
setConfigValue(c, 'company.social.0.href', 'https://example.invalid/');
assert.ok(Array.isArray(c.company.social));
assert.throws(() => setConfigValue(c, '__proto__.polluted', true));
// Display filters must not shift writes to the wrong raw row.
const ci = c.sections.findIndex(s => s.type === 'company');
c.sections[ci].data.rows = [{ label: '', value: '' }, { label: '独自項目', value: '旧' }];
const target = resolveFieldTarget(c, `sections.${ci}.rows.0.value`);
setConfigValue(c, target.path, '新');
assert.equal(companyOf(c, c.sections[ci].data).rows[0].value, '新');
assert.equal(contactOf(c, { rows: [] }).rows.length, 0);
// Company fallback editing for the representative variant.
const si = c.sections.findIndex(s => s.type === 'staff'); delete c.sections[si].data.items;
assert.equal(resolveFieldTarget(c, `sections.${si}.items.0.name`).path, 'company.ceo');
assert.ok(!isContentUrl('javascript:alert(1)')); assert.ok(!isContentUrl('//evil.invalid'));
assert.ok(isContentUrl('https://example.invalid/予約')); assert.ok(isContentUrl('#contact'));

// Review regressions: derived rows, resets, scoped detail pages and live contact destinations.
const { resetSectionContent, duplicateSectionData } = require('../src/lib/editor/content-fields.ts');
const { findDetailItem } = require('../src/components/sections/detail-data.ts');
const tableConfig = config(); tableConfig.company.phone = '03-1111-2222';
const accessIndex = tableConfig.sections.findIndex(s => s.type === 'access');
const tableBefore = sectionContent(tableConfig, accessIndex);
const phoneRow = tableBefore.rows.findIndex(r => r.label === '電話');
const tableAfter = { ...tableBefore, rows: tableBefore.rows.map((r,i) => i === phoneRow ? {...r,value:'03-9999-8888'} : r) };
for (const patch of contentPatches(tableConfig, accessIndex, tableBefore, tableAfter)) setConfigValue(tableConfig, patch.path, patch.value);
assert.equal(tableConfig.company.phone,'03-9999-8888');
assert.equal(tableConfig.sections[accessIndex].data.rows,undefined);
const companyIndex = tableConfig.sections.findIndex(s => s.type === 'company');
delete tableConfig.sections[companyIndex].data.message; tableConfig.company.bio='本人の挨拶';
const reset = resetSectionContent(tableConfig,companyIndex,sectionContent(tableConfig,companyIndex),starterSectionData(tableConfig.templateId,'company'));
assert.equal(reset.message,'本人の挨拶');
const withImage = {items:[{id:1,title:'実績',image:'https://cdn.example.invalid/own.jpg'}]};
assert.equal(resetSectionContent(tableConfig,wi,withImage,starterSectionData(tableConfig.templateId,'works')).items[0].image,withImage.items[0].image);
tableConfig.sections.push({id:'second-staff',type:'staff',visible:true,data:{items:[{id:1,name:'追加人物',role:'担当',image:''}]}});
const found = findDetailItem(tableConfig,'staff','@second-staff~1');
assert.equal(found.title,'追加人物'); assert.equal(found.image,'');
assert.equal(findDetailItem(tableConfig,'staff','@missing~1'),null);
const contactIndex=hotel.sections.findIndex(s=>s.type==='contact');
assert.equal(contactOf(hotel,hotel.sections[contactIndex].data).primary.href,'mailto:owner@example.invalid');
hotel.company.email='changed@example.invalid';
assert.equal(contactOf(hotel,hotel.sections[contactIndex].data).primary.href,'mailto:changed@example.invalid');
const resetContact=resetSectionContent(hotel,contactIndex,sectionContent(hotel,contactIndex),starterSectionData(hotel.templateId,'contact'));
assert.equal(resetContact.primaryCta,undefined);
assert.equal(contactOf(hotel,resetContact).primary.href,'mailto:changed@example.invalid');
hotel.company.email='later@example.invalid';
assert.equal(contactOf(hotel,resetContact).primary.href,'mailto:later@example.invalid');
delete hotel.sections[contactIndex].variant;
assert.equal(resetSectionContent(hotel,contactIndex,sectionContent(hotel,contactIndex),starterSectionData(hotel.templateId,'contact')).primaryCta,undefined);
const reordered={items:[4,1,2,3].map(id=>({id,slug:`work-${id}`,title:'実績',image:`https://cdn.example.invalid/${id}.jpg`}))};
const resetItems=resetSectionContent(tableConfig,wi,reordered,starterSectionData(tableConfig.templateId,'works')).items;
assert.equal(new Set(resetItems.map(x=>x.id)).size,resetItems.length);
assert.deepEqual(resetItems.map(x=>x.slug),reordered.items.map(x=>x.slug));
c.sections[si].data.items=[];
assert.equal(resolveFieldTarget(c,`sections.${si}.items.0.name`).path,'company.ceo');
const { resolveSections }=require('../src/lib/templates/sections.ts');
assert.deepEqual(resolveSections({...config(),sections:[]},true),[]);
assert.deepEqual(require('../src/lib/site-config-schema.ts').getSections({...config(),sections:[]}),[]);
const ownLists=config(); ownLists.sections=[
  {type:'works',visible:true,data:{items:[{id:1,title:'ID省略',image:''}]}},
  {type:'works',id:'works',visible:true,data:{items:[{id:1,title:'ID重複',image:''}]}},
  {type:'company',id:'history',variant:'history-timeline',visible:true,data:{history:[]}},
];
const publicSections=resolveSections(ownLists,false);
assert.equal(publicSections.length,2);
publicSections.forEach(s=>assert.equal(findDetailItem(ownLists,'works',`@${s.anchor}~1`).title,s.data.items[0].title));
const original=config(); const oi=original.sections.findIndex(s=>s.type==='works');
const independent=duplicateSectionData(original,oi); independent.items[0].title='複製だけ変更';
assert.notEqual(original.projects[0].title,independent.items[0].title);
original.company.ceo='代表の名前'; original.company.bio='元の挨拶';
const representativeIndex=original.sections.findIndex(s=>s.type==='staff');
const duplicateRepresentative=duplicateSectionData(original,representativeIndex);
assert.equal(duplicateRepresentative.items[0].name,'代表の名前');
original.sections.push({...original.sections[representativeIndex],id:'copy',data:duplicateRepresentative});
const copyIndex=original.sections.length-1;
assert.equal(resolveFieldTarget(original,`sections.${copyIndex}.items.0.name`).path,`sections.${copyIndex}.data.items.0.name`);

async function run() {
  const photo = 'data:image/png;base64,YQ==';
  c.sections[0].data.image = photo; c.company.ceoPhoto = photo; c.projects.forEach(item=>item.image=photo);
  let calls = 0;
  const saved = await uploadConfigImages(c, async () => { calls++; return 'https://cdn.example.invalid/photo.png'; });
  assert.equal(calls, 1); assert.equal(c.sections[0].data.image, photo);
  assert.equal(saved.company.ceoPhoto, saved.sections[0].data.image);
  await assert.rejects(() => uploadConfigImages(c, async () => { throw Error('Storage failed'); }));
  assert.equal(c.company.ceoPhoto, photo);
  // Persist / reload the complete draft after a section reorder; fields and uploaded images survive.
  saved.sections.reverse();
  const reloaded = JSON.parse(JSON.stringify(saved));
  assert.equal(reloaded.projects[0].title, '変更した実績');
  assert.equal(reloaded.sections.at(-1).data.image, 'https://cdn.example.invalid/photo.png');
  const React = require('react'); const { renderToStaticMarkup } = require('react-dom/server');
  const { SECTION_CATALOG, getSection } = require('../src/components/sections/index.ts');
  const { TplRoot } = require('../src/components/template-renderers/TplPalette.tsx');
  const { buildPalette, resolveBrand } = require('../src/lib/palette.ts');
  const renderSection=(type,variant,data,cfg=c)=>renderToStaticMarkup(React.createElement(TplRoot,{palette:buildPalette(resolveBrand(null,cfg.templateId))},React.createElement(getSection(type,variant),{config:cfg,data,id:'sample'})));
  const representative=config(); representative.company.ceo='代表'; representative.company.ceoPhoto='https://cdn.example.invalid/representative.jpg';
  assert.ok(!renderSection('staff','lead-message',{items:[{id:1,name:'担当',image:''}]},representative).includes('representative.jpg'));
  const serviceMarkup=renderSection('services','tabs',{items:[{title:'相談',description:'案内',steps:[],sessionContent:['実施内容の確認'],expectedChanges:['変化の確認']}]});
  assert.ok(serviceMarkup.includes('実施内容の確認')); assert.ok(serviceMarkup.includes('変化の確認'));
  let rendered = 0;
  for (const template of TEMPLATES) {
    const cfg = config(template.id + '-pro');
    for (const entry of SECTION_CATALOG) for (const variant of entry.variants) {
      const d = starterSectionData(template.id, entry.type);
      assert.ok(fieldsForSection(entry.type).length > 0);
      const html = renderToStaticMarkup(React.createElement(TplRoot, { palette: buildPalette(resolveBrand(null, template.id)) }, React.createElement(getSection(entry.type, variant.id), { config: cfg, data: d, id: 'sample' })));
      assert.ok(!html.includes('undefined') && !html.includes('NaN'), template.id + '/' + entry.type + '/' + variant.id);
      rendered++;
    }
  }
  console.log(`PASS: ${INDUSTRIES.length} industries, ${rendered} template/variant renders, edit/list/clear/photo/save round trips`);
}
run().catch(e => { console.error(e); process.exitCode = 1; });
