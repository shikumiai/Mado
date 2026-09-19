// 本番・ローカルサーバーには接続せず、メモリ内のPostgresで実際のRLSとRPCを実行する。
// 準備: npm install --prefix .verification/pg-test --save-exact @electric-sql/pglite@0.4.0
// 実行: node scripts/site-editor-rls-check.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "../.verification/pg-test/node_modules/@electric-sql/pglite/dist/index.js";

const db = new PGlite();
const uid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const owner = uid(1), editor = uid(2), viewer = uid(3), outsider = uid(4), admin = uid(5);
const org = uid(20), otherOrg = uid(21), site = uid(30), otherSite = uid(31);
const readSql = (name) => readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), "utf8");
async function asUser(id, query, params = [], role = "authenticated") {
  assert.ok(["anon", "authenticated"].includes(role));
  return db.transaction(async (tx) => {
    await tx.exec(`set local role ${role}`);
    await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [id || ""]);
    return tx.query(query, params);
  });
}
async function current() {
  return (await db.query("select config, version from public.site_configs where site_id=$1", [site])).rows[0];
}
async function save(id, target = site, version) {
  version ??= (await current()).version;
  return (await asUser(id, "select public.update_site_config($1, $2::jsonb, $3, 'RLS test') as result", [target, JSON.stringify({ photo: "test.jpg" }), version])).rows[0].result;
}
async function denied(id, target = site, role = "authenticated") {
  const before = await current();
  const result = await asUser(id, "update public.site_configs set config='{}' where site_id=$1 returning site_id", [target], role);
  assert.equal(result.rows.length, 0, "直接UPDATEも拒否");
  if (role === "authenticated") {
    assert.equal((await save(id, target)).ok, false, "RPCでも拒否");
    await assert.rejects(asUser(id, "insert into public.site_config_versions(site_id, config, version) values($1, '{}', 999)", [target]), { code: "42501" });
  }
  assert.deepEqual(await current(), before, "不許可の処理で設定や版は変わらない");
}

try {
  // Supabase管理スキーマだけを最小限再現。業務テーブル/RLS/RPCはmigration原文。
  await db.exec(`
    create role anon;
    create role authenticated;
    create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid$$;
    create schema storage;
    create table storage.buckets(id text primary key, name text, public boolean);
    create table storage.objects(id uuid primary key, bucket_id text);
    alter table storage.objects enable row level security;
    grant usage on schema public, auth, storage to anon, authenticated;
  `);
  await db.exec(await readSql("0001_init.sql"));
  await db.exec(await readSql("0002_config_save_result.sql"));
  await db.exec("grant all on all tables in schema public to anon, authenticated; grant usage on all sequences in schema public to anon, authenticated;");
  for (const id of [owner, editor, viewer, outsider, admin]) await db.query("insert into auth.users values($1)", [id]);
  for (const id of [org, otherOrg]) await db.query("insert into public.orgs(id,name,email) values($1,'test','test@example.invalid')", [id]);
  for (const [id, tenant, memberRole] of [[owner,org,"owner"],[editor,org,"editor"],[viewer,org,"viewer"],[outsider,otherOrg,"owner"]]) {
    await db.query("insert into public.org_members(org_id,user_id,role) values($1,$2,$3)", [tenant,id,memberRole]);
  }
  await db.query("insert into public.platform_admins(user_id) values($1)", [admin]);
  await db.query("insert into public.sites(id,org_id,slug,template_id,status) values($1,$2,'photo-check','warm-craft','live'),($3,$4,'photo-other','warm-craft','live')", [site,org,otherSite,otherOrg]);
  await db.query("insert into public.site_configs(site_id) values($1),($2)", [site,otherSite]);

  // 修正前の問題も再現する。モックの成功値だけを確かめるテストにしない。
  assert.equal((await save(viewer)).ok, true, "旧RLSではviewerが保存できてしまう");
  assert.deepEqual(await save(admin), {ok:false,reason:"not_found"}, "旧RLSでは管理者が保存できない");
  const migration = await readSql("20260919174341_site_editor_write_roles.sql");
  await db.exec(migration);
  await db.exec(migration); // 再適用してもポリシーは広がらない

  for (const id of [owner,editor,admin]) {
    const before = await current();
    assert.deepEqual(await save(id), {ok:true,version:before.version+1});
    const history = await db.query("select created_by from public.site_config_versions where site_id=$1 and version=$2", [site,before.version+1]);
    assert.equal(history.rows.length, 1, "設定と履歴が同時に保存される");
    assert.equal(history.rows[0].created_by, id);
  }
  await denied(viewer);
  await denied(outsider);
  await denied(null);
  await denied(null, site, "anon");
  await denied(owner, otherSite);
  const beforeConflict = await current();
  assert.deepEqual(await save(editor, site, 1), {ok:false,reason:"conflict",current_version:beforeConflict.version});
  assert.deepEqual(await current(), beforeConflict);
  assert.equal((await asUser(viewer, "select site_id from public.site_configs where site_id=$1", [site])).rows.length, 1, "viewerの閲覧は残る");
  assert.equal((await asUser(null, "select site_id from public.site_configs where site_id=$1", [site], "anon")).rows.length, 1, "公開サイトは引き続き閲覧できる");
  await db.query("delete from public.org_members where org_id=$1 and user_id=$2", [org,owner]);
  await denied(owner);
  await db.query("delete from public.platform_admins where user_id=$1", [admin]);
  await denied(admin);
  console.log("PASS: 実PostgresのRLS/RPCで旧不具合再現→owner/editor/admin保存+履歴、viewer/他社/匿名/権限失効拒否、版競合、公開SELECT維持、migration再適用を確認");
} finally {
  await db.close();
}
