/**
 * Codex レビュー F01〜F07 の修正を確かめる（ネットワークと DB には触らない）。
 * 実行: node scripts/funnel-fix-probes.cjs
 * PASS ＝ 直した挙動になっている。Codex の funnel-review-probes.cjs（欠陥が再現したら PASS）とは逆向き。
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const base = "https://mado.shikumiai.com";
const results = [];

function source(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}
function load(file, dependencies, globals = {}, extra = "") {
  const output = ts.transpileModule(source(file) + "\n" + extra, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  const context = {
    exports,
    module: { exports },
    URL,
    Headers,
    AbortSignal,
    Date,
    Set,
    Map,
    TextDecoder,
    setTimeout,
    clearTimeout,
    console,
    process: { env: {} },
    ...globals,
    require(id) {
      if (!(id in dependencies)) throw new Error("Unexpected dependency: " + id);
      return dependencies[id];
    },
  };
  vm.runInNewContext(output, context, { filename: file });
  return exports;
}
function pass(name, evidence) {
  results.push({ name, ok: true, evidence });
}

async function main() {
  /* ── F01: 社内アドレスの判定と、転送先の検査 ── */
  const fetchSafe = load(
    "src/lib/funnels/fetch-safe.ts",
    { "node:dns/promises": { lookup: async () => [] }, "node:net": require("node:net"), undici: { Agent: class {} } },
  );
  const privateIps = ["127.0.0.1", "10.0.0.1", "172.16.5.5", "192.168.1.1", "169.254.169.254", "0.0.0.0", "100.64.0.1", "::1", "fe80::1", "fc00::1", "::ffff:127.0.0.1", "::ffff:7f00:1", "64:ff9b::10.0.0.1"];
  const publicIps = ["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111", "104.16.0.1"];
  for (const ip of privateIps) assert.equal(fetchSafe.isPrivateIp(ip), true, "private: " + ip);
  for (const ip of publicIps) assert.equal(fetchSafe.isPrivateIp(ip), false, "public: " + ip);
  pass("F01 isPrivateIp: 社内・自分自身・リンクローカル・IPv4包みを弾き、公開アドレスは通す", {
    privateChecked: privateIps.length,
    publicChecked: publicIps.length,
  });

  // getPage: 転送先が 127.0.0.1 / 社内名なら追わない。転送が多すぎれば止める
  const responses = [];
  const check = load(
    "src/lib/funnels/check.ts",
    {
      "../resolve-site": { SITE_BASE_URL: base },
      "./fetch-safe": {
        safeFetch: async (url) => {
          const next = responses.shift();
          if (!next) throw new Error("no more responses for " + url.href);
          if (next.throw) {
            const err = new Error("blocked");
            err.code = next.throw;
            throw err;
          }
          return {
            status: next.status,
            headers: new Headers(next.headers || {}),
            body: null,
            ok: next.status < 400,
          };
        },
        readCapped: async () => "",
      },
    },
  );

  responses.push({ status: 302, headers: { location: "http://127.0.0.1/internal" } });
  let page = await check.getPage("https://public.example/redirect");
  assert.equal(page.ok, false);
  assert.equal(page.failure, "blocked");
  assert.equal(page.finalUrl, "https://public.example/redirect");

  responses.push({ status: 301, headers: { location: "https://intranet.local/admin" } });
  page = await check.getPage("https://public.example/redirect2");
  assert.equal(page.failure, "blocked");

  for (let i = 0; i < 7; i++) responses.push({ status: 302, headers: { location: `https://public.example/hop${i}` } });
  page = await check.getPage("https://public.example/loop");
  assert.equal(page.failure, "redirects");
  responses.length = 0;

  responses.push({ throw: "EBLOCKEDADDRESS" });
  page = await check.getPage("https://resolves-to-private.example/");
  assert.equal(page.failure, "blocked");
  pass("F01 getPage: 転送先が社内アドレスなら追わない。転送が多すぎれば止める。名前解決で弾かれたら blocked", {
    redirectMode: "manual (safeFetch)",
    maxRedirects: 5,
  });

  /* ── F04: 次の段の判定 ── */
  const okPage = (body) => ({ ok: true, statusCode: 200, finalUrl: "https://source.example/page", body });
  const next = { kind: "web", label: "予約ページ", url: "https://expected.example/booking" };

  const unrelated = check.nextLinkCheck(okPage(`<a href="${base}/go/WRONG234">別の導線</a>`), { next, url: new URL(next.url), code: "RIGHT567" });
  assert.equal(unrelated.status, "ng");

  const ownTracked = check.nextLinkCheck(okPage(`<a href="${base}/go/RIGHT567">予約へ</a>`), { next, url: new URL(next.url), code: "RIGHT567" });
  assert.equal(ownTracked.status, "ok");

  const wrongCase = check.nextLinkCheck(okPage(`<a href="${base}/go/right567">予約へ</a>`), { next, url: new URL(next.url), code: "RIGHT567" });
  assert.equal(wrongCase.status, "ng");

  const direct = check.nextLinkCheck(okPage(`<a href="/booking">予約へ</a>`), { next, url: new URL(next.url), code: null });
  assert.equal(direct.status, "ng", "別ホストの相対リンクは一致しない");
  const directSame = check.nextLinkCheck(
    { ...okPage(`<a href="/booking">予約へ</a>`), finalUrl: "https://expected.example/top" },
    { next, url: new URL(next.url), code: null },
  );
  assert.equal(directSame.status, "ok");

  const withQuery = check.nextLinkCheck(okPage(`<a href="https://expected.example/booking">予約へ</a>`), {
    next: { ...next, url: "https://expected.example/booking?plan=pro" },
    url: new URL("https://expected.example/booking?plan=pro"),
    code: null,
  });
  assert.equal(withQuery.status, "ng", "?… が付く URL は同じ ?… でなければ一致しない");

  const madoNext = { kind: "mado", label: "自分のサイト", url: "00000000-0000-4000-8000-000000000001" };
  const madoResolved = check.nextLinkCheck(okPage(`<a href="${base}/my-store">サイトへ</a>`), {
    next: madoNext,
    url: new URL(`${base}/my-store`),
    code: null,
  });
  assert.equal(madoResolved.status, "ok");
  const madoUnknown = check.nextLinkCheck(okPage(`<a href="${base}/my-store">サイトへ</a>`), { next: madoNext, url: null, code: null });
  assert.equal(madoUnknown.status, "skipped");
  pass("F04 nextLinkCheck: 認めるのは自分の追跡リンク（大文字小文字も一致）か次の段の URL そのもの。mado は slug の URL に解決して照合", {
    unrelatedTracked: unrelated.status,
    ownTracked: ownTracked.status,
    madoResolved: madoResolved.status,
  });

  /* ── F03: 追跡リンクの向き（段 i のリンクは段 i+1 へ） ── */
  const inserted = [];
  const fakeSupabase = {
    from(table) {
      assert.equal(table, "tracked_links");
      return {
        select() {
          return this;
        },
        eq() {
          return Promise.resolve({ data: [], error: null });
        },
        insert: async (row) => {
          inserted.push(row);
          return { error: null };
        },
      };
    },
  };
  const actions = load(
    "src/lib/funnels/actions.ts",
    {
      "node:crypto": crypto,
      "../stripe": { normalizePlanId: (p) => p },
      "../templates/catalog": { funnelLimit: () => 3, planAllowsFunnelCheck: () => true },
      "../auth": {},
      "../supabase/server": { getWriteClient: () => fakeSupabase, isMissingTableError: () => false },
      "../resolve-site": { SITE_BASE_URL: base, customerSiteUrl: (slug) => `${base}/${slug}` },
      "./check": { runFunnelCheck: async () => [] },
    },
    {},
    "exports.__review = { issueLinks };",
  );
  const hops = [
    { kind: "x", label: "X", url: "https://x.com/example" },
    { kind: "line", label: "LINE", url: "https://lin.ee/abc123" },
    { kind: "mado", label: "サイト", url: "site-1" },
  ];
  await actions.__review.issueLinks("funnel-1", hops, { sites: new Map([["site-1", "my-store"]]) });
  assert.equal(inserted.length, 2, "最後の段には貼るリンクが無い");
  assert.equal(inserted[0].hop_index, 0);
  assert.equal(inserted[0].target_url, "https://lin.ee/abc123", "X に貼るリンクは LINE へ");
  assert.equal(inserted[1].hop_index, 1);
  assert.equal(inserted[1].target_url, `${base}/my-store`, "LINE に貼るリンクはサイトへ");
  pass("F03 issueLinks: 段 i に貼るリンクの飛び先は段 i+1。最後の段にはリンクを作らない", {
    links: inserted.map((r) => `${r.hop_index} -> ${r.target_url}`),
  });

  /* ── F02 / F05 / F06 / F07: 静的な確認 ── */
  const view = source("src/app/app/funnels/[id]/FunnelView.tsx");
  assert.ok(!/count\?\.visitors/.test(view), "画面は visitors を出さない");
  assert.ok(/押された回数/.test(view));
  const sql8 = source("supabase/migrations/0008_funnels_hardening.sql");
  for (const p of ["member_insert_own_funnels", "member_update_own_funnels", "member_delete_own_funnels"]) {
    assert.match(sql8, new RegExp(`drop policy if exists "${p}"`));
  }
  assert.match(sql8, /add column if not exists archived_at/);
  const actionsSrc = source("src/lib/funnels/actions.ts");
  assert.ok(!/from\("funnels"\)\.delete\(\)\.eq\("id", id\)/.test(actionsSrc.split("deleteFunnel")[1]), "deleteFunnel は delete しない");
  assert.match(actionsSrc, /update\(\{ archived_at: new Date\(\)\.toISOString\(\) \}\)/);
  assert.match(actionsSrc, /funnelLimit\(ctx\.plan\) === 0/, "updateFunnel にプラン判定");
  const fetchSafeSrc = source("src/lib/funnels/fetch-safe.ts");
  assert.match(fetchSafeSrc, /reader\.cancel\(\)/, "本文は上限で読み止める");
  assert.match(source("src/lib/funnels/check.ts"), /readCapped\(res, MAX_BODY\)/);
  pass("F02/F05/F06/F07 静的確認: 画面は回数だけ・利用者の直接書き込みを閉じる・削除はしまう・本文は読みながら止める", {});

  console.log(JSON.stringify({ allFixed: true, probes: results }, null, 2));
}

main().catch((error) => {
  console.error("PROBE FAILED:", error);
  process.exitCode = 1;
});
