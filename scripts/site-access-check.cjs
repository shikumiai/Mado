/* eslint-disable @typescript-eslint/no-require-imports -- Nodeで実際のServer Actionをモック接続し検証する。 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
let scenario = {};
let privilegedCalls = 0;
let rpcCalls = 0;
const user = { id: "signed-in-user" };
const site = { id: "public-site", org_id: "site-org", slug: "public-site", template_id: "warm-craft", status: "live" };
const client = {
  auth: { getUser: async () => ({ data: { user: scenario.signedOut ? null : user }, error: scenario.authError ? {} : null }) },
  from: (table) => {
    const filters = {};
    const query = {
      select: () => query,
      eq: (key, value) => { filters[key] = value; return query; },
      maybeSingle: async () => {
        if (table === "sites") return { data: site, error: null }; // RLSは他人の公開サイトも返す
        assert.equal(filters.user_id, user.id);
        if (table === "org_members") {
          assert.equal(filters.org_id, site.org_id);
          return { data: scenario.role ? { role: scenario.role } : null, error: scenario.memberError ? {} : null };
        }
        if (table === "platform_admins") return { data: scenario.admin ? user : null, error: scenario.adminError ? {} : null };
        throw new Error(`想定外の読み込み: ${table}`);
      },
    };
    return query;
  },
  rpc: async () => { rpcCalls++; return { data: { ok: true, version: 2 }, error: null }; },
};
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=", "base64");
function validPhoto() {
  const form = new FormData();
  form.set("file", new File([png], "test.png", { type: "image/png" }));
  return form;
}
const storage = {
  storage: { from: (bucket) => {
    assert.equal(bucket, "site-assets");
    return {
      upload: async (objectPath, bytes) => {
        assert.ok(objectPath.startsWith(`${site.id}/`));
        assert.deepEqual(Buffer.from(bytes), png);
        return { error: null };
      },
      getPublicUrl: (objectPath) => ({ data: { publicUrl: `https://storage.example.invalid/${objectPath}` } }),
    };
  } },
  from: (table) => {
    assert.equal(table, "assets");
    return { insert: async (asset) => { assert.equal(asset.site_id, site.id); return { error: null }; } };
  },
};
const resolve = Module._resolveFilename;
Module._resolveFilename = function(id, ...rest) {
  return resolve.call(this, id.startsWith("@/") ? path.join(root, "src", id.slice(2)) : id, ...rest);
};
const load = Module._load;
Module._load = function(id, parent, ...rest) {
  if (id.endsWith("supabase/ssr")) return { createServerSupabase: async () => client };
  if (id.endsWith("supabase/server")) return { getWriteClient: () => { privilegedCalls++; return storage; } };
  return load.call(this, id, parent, ...rest);
};
require.extensions[".ts"] = (m,name) => m._compile(ts.transpileModule(fs.readFileSync(name,"utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText,name);
const { requireSiteAccess } = require("../src/lib/auth.ts");
const { uploadSiteImage, saveSiteConfig, loadSiteForEdit, listSiteHistory } = require("../src/lib/site-editor.ts");
(async () => {
  for (const s of [{}, {role:"viewer"}, {signedOut:true}, {authError:true}, {role:"owner",memberError:true}, {admin:true,adminError:true}]) {
    scenario = s;
    assert.equal((await requireSiteAccess(site.id)).ok, false);
    assert.deepEqual(await uploadSiteImage(site.id, validPhoto()), { ok: false, message: "このサイトを編集する権限がありません。" });
    assert.equal((await saveSiteConfig(site.id, {}, 1)).ok, false);
    assert.equal((await loadSiteForEdit(site.id)).ok, false);
    assert.deepEqual(await listSiteHistory(site.id), []);
  }
  assert.equal(privilegedCalls, 0, "拒否した呼出しはservice_roleへ到達しない");
  assert.equal(rpcCalls, 0, "拒否した呼出しは保存RPCへ到達しない");
  for (const s of [{role:"owner"}, {role:"editor"}, {admin:true}]) {
    scenario = s;
    assert.equal((await requireSiteAccess(site.id)).ok, true);
    assert.equal((await uploadSiteImage(site.id, validPhoto())).ok, true);
    assert.equal((await saveSiteConfig(site.id, {}, 1)).ok, true);
  }
  assert.equal(rpcCalls, 3);
  assert.equal(privilegedCalls, 3);
  console.log("PASS: 公開サイトの第三者・閲覧者・未ログイン・照会失敗は拒否、owner/editor/管理者のみ編集可");
})().catch((error)=>{console.error(error); process.exitCode=1;});
