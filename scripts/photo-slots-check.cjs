/* eslint-disable @typescript-eslint/no-require-imports -- NodeのCommonJSフックでTSを検証する独立スクリプト。 */
// 純粋関数の検証。認証・ネットワーク・DBへのアクセスは行わない。
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...rest) {
  return resolve.call(this, id.startsWith("@/") ? path.join(root, "src", id.slice(2)) : id, ...rest);
};
for (const ext of [".ts", ".tsx"]) require.extensions[ext] = (m, name) => {
  const output = ts.transpileModule(fs.readFileSync(name, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  m._compile(output, name);
};
const { photoSlots, replacePhoto, isSamplePhoto } = require("../src/lib/editor/photo-slots.ts");
const { generateSiteConfig } = require("../src/lib/template-config-generator.ts");
const { onboardingState } = require("../src/lib/onboarding.ts");
const { TEMPLATE_IDS } = require("../src/lib/templates/catalog.ts");
const { heroOf, worksOf, companyOf } = require("../src/components/sections/data.ts");
const create = (templateId = "warm-craft-pro") => generateSiteConfig({
  templateId, orderId: "", companyName: "写真確認用", email: "test@example.invalid", ceo: "見本", bio: "ごあいさつ", siteSlug: "photo-check",
});
function at(config, key) { return key.split(".").reduce((v, k) => v?.[k], config); }
let replacements = 0;
for (const family of TEMPLATE_IDS) for (const suffix of ["", "-mid", "-pro"]) {
  const config = create(family + suffix);
  const before = JSON.stringify(config);
  const slots = photoSlots(config);
  assert.ok(slots.length > 0, family + suffix);
  assert.equal(new Set(slots.map((s) => s.path)).size, slots.length);
  let updated = config;
  for (const slot of slots) {
    const url = `https://photos.example.invalid/${replacements++}.jpg`;
    updated = replacePhoto(updated, slot.path, url);
    assert.equal(at(updated, slot.path), url);
    assert.equal(photoSlots(updated).find((s) => s.path === slot.path)?.src, url, slot.path);
  }
  assert.equal(JSON.stringify(config), before, "元のconfigを変更しない");
  assert.deepEqual(updated.company.name, config.company.name);
  assert.deepEqual(updated.style, config.style);
  assert.equal(onboardingState(updated).templatePhotos, 0, "非表示の見本画像は未完了に数えない");
}
const original = create();
original.sections = [
  { type: "hero", label: "トップ", visible: true, data: {} },
  { type: "works", label: "実績", visible: true },
  { type: "works", label: "別の実績", visible: true, data: { items: [{ title: "独立した写真", image: "https://example.invalid/custom.jpg" }] } },
  { type: "works", label: "同じ一覧の再利用", visible: true },
];
const slots = photoSlots(original);
assert.equal(slots[0].src, heroOf(original, {}).image, "保存値がなくてもヒーローの見本を拾う");
assert.equal(slots.find((s) => s.path === "projects.0.image").locations.length, 2, "共用の宛先を二重に表示しない");
const own = slots.find((s) => s.path === "sections.2.data.items.0.image");
assert.ok(own);
const changed = replacePhoto(original, own.path, "https://example.invalid/replaced.jpg");
assert.equal(worksOf(changed, changed.sections[2].data).items[0].image, "https://example.invalid/replaced.jpg");
assert.deepEqual(changed.projects, original.projects, "独立部品の変更は共有一覧を上書きしない");
assert.deepEqual(changed.sections[0], original.sections[0]);
assert.throws(() => replacePhoto(original, "company.email", "bad"), "写真以外の書換えを受け付けない");
assert.throws(() => replacePhoto(original, "__proto__.polluted", "bad"));

const noPhoto = create("clean-arch");
noPhoto.sections = [{ type: "hero", variant: "quiet", visible: true, label: "冒頭" }, { type: "staff", variant: "quiet", visible: true, label: "スタッフ" }];
assert.equal(photoSlots(noPhoto).length, 0, "写真のない見せ方に枠を出さない");
assert.ok(onboardingState(noPhoto).tasks.find((task) => task.id === "hero-photo").done);

const hidden = create();
hidden.sections.forEach((section) => { section.visible = false; });
assert.equal(photoSlots(hidden).length, 0);
const gated = create();
gated.sections = [{ type: "booking", id: "booking", variant: "photo-cta", label: "予約", visible: true }];
gated.plan = "otameshi";
assert.equal(photoSlots(gated).length, 0, "プラン外の写真を編集一覧に出さない");
gated.plan = "omakase-pro";
assert.equal(photoSlots(gated).length, 1);
const signboard = create("saveur-pro");
signboard.sections = [{ type: "menu", variant: "signboard", label: "看板メニュー", visible: true, data: { items: [
  { name: "先頭", image: "https://example.invalid/first.jpg" },
  { name: "おすすめ", isRecommended: true, image: "https://example.invalid/recommended.jpg" },
] } }];
assert.equal(photoSlots(signboard).length, 1);
assert.equal(photoSlots(signboard)[0].path, "sections.0.data.items.1.image", "看板の写真は先頭とは限らない");
const owner = create();
owner.sections = [{ type: "company", variant: "message-feature", label: "会社", visible: true }];
const ownerChanged = replacePhoto(owner, photoSlots(owner)[0].path, "https://example.invalid/owner.jpg");
assert.equal(companyOf(ownerChanged).image, "https://example.invalid/owner.jpg");
const legacy = create();
legacy.sections = undefined;
const withSections = replacePhoto(legacy, photoSlots(legacy)[0].path, "https://example.invalid/hero.jpg");
assert.ok(withSections.sections.length);
assert.equal(legacy.sections, undefined);
assert.ok(isSamplePhoto("/images/templates/velvet/hero.jpg"));
assert.ok(!isSamplePhoto("https://example.invalid/hero.jpg"));
console.log(`PASS: 10業種 × 3プラン、${replacements}枚の保存先・表示値、独立/共用部品、非表示、写真なし、競合前提の不変更新`);
