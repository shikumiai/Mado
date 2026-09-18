/**
 * 導線チェックの動作確認（docs/FUNNEL_CHECK_V1.md §11 の合格条件）。
 *
 *   node scripts/funnel-check-smoke.mjs
 *
 * 切れた LINE の URL、期限切れの Discord 招待、404 の Web ページを渡して、
 * それぞれ ng と理由の一文が返るかを見る。
 * 取りに行くのは誰でも開ける公開ページだけ。データベースには触らない。
 *
 * check.ts は TypeScript なので、その場で一時フォルダへ組み立ててから読み込む。
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const root = path.resolve(import.meta.dirname, "..");
const work = mkdtempSync(path.join(tmpdir(), "funnel-check-"));
const outDir = path.join(work, "js");
const configPath = path.join(work, "tsconfig.json");

// プロジェクトの設定（@/ の読み替えなど）を引き継いだまま、素の JavaScript を書き出す
writeFileSync(
  configPath,
  JSON.stringify({
    extends: path.join(root, "tsconfig.json"),
    compilerOptions: {
      noEmit: false,
      incremental: false,
      outDir,
      rootDir: path.join(root, "src"),
      module: "commonjs",
      moduleResolution: "node",
      target: "es2022",
      skipLibCheck: true,
      // 一時フォルダに置くので、型の置き場だけプロジェクト側を指す
      typeRoots: [path.join(root, "node_modules/@types")],
      types: ["node"],
    },
    include: [path.join(root, "src/lib/funnels/check.ts")],
  }),
);

console.log("組み立て中…");
execFileSync(
  process.execPath,
  [path.join(root, "node_modules", "typescript", "bin", "tsc"), "-p", configPath],
  { cwd: root, stdio: "inherit" },
);

const require = createRequire(import.meta.url);
const { runFunnelCheck } = require(path.join(outDir, "lib", "funnels", "check.js"));

const hops = [
  { kind: "line", label: "切れた LINE", url: "https://lin.ee/0000000" },
  { kind: "discord", label: "切れた Discord 招待", url: "https://discord.gg/zzzzzzzzzz" },
  { kind: "web", label: "無いページ", url: "https://example.com/no-such-page" },
  { kind: "x", label: "X のプロフィール", url: "https://x.com/Lyo_shikumiai" },
];

const results = await runFunnelCheck(hops);

let allGood = true;
for (const result of results) {
  const hop = hops[result.hopIndex];
  const expected = hop.kind === "x" ? "skipped" : "ng";
  const pass = result.status === expected;
  if (!pass) allGood = false;

  console.log(`\n${result.hopIndex}: ${hop.label}（${hop.kind}）`);
  console.log(`  結果: ${result.status}  期待: ${expected}  ${pass ? "○" : "×"}`);
  for (const check of result.checks) {
    console.log(`  - [${check.status}] ${check.name}${check.reason ? " … " + check.reason : ""}`);
    if (check.evidence) console.log(`      根拠: ${JSON.stringify(check.evidence)}`);
  }
}

console.log(allGood ? "\n全部そろっています。" : "\n食い違いがあります。");
process.exit(allGood ? 0 : 1);
