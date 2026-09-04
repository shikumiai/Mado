"use server";

/**
 * サイト編集の保存口。
 *
 * 旧設計では「GitHub に push → Vercel が再ビルド」で反映していた。
 * ここではデータベースを1行書き換えるだけなので、ビルドを挟まずに反映される。
 *
 * Server Action にしてあるのは2つの理由から:
 *  - Cookie のセッションをそのまま使えるので、RLS が「その人」として効く
 *  - 将来キャッシュを入れたとき、read-your-own-writes を成立させる updateTag が
 *    Server Action の中でしか呼べない（Route Handler では使えない）
 *
 * 権限は DB の RLS が守っている。ここでの確認は、早い段階できれいに返すためのもの。
 */

import type { SiteConfig } from "./site-config-schema";
import { createServerSupabase } from "./supabase/ssr";
import { getWriteClient } from "./supabase/server";
import { requireSiteAccess } from "./auth";

/* ═══════════════════════════════════════
   読み込み
   ═══════════════════════════════════════ */

export type LoadResult =
  | {
      ok: true;
      siteId: string;
      slug: string;
      templateId: string;
      status: string;
      plan: string;
      orgName: string;
      config: SiteConfig;
      version: number;
    }
  | { ok: false; reason: "unauthenticated" | "forbidden" | "not_found" };

/** 編集画面が開くときに、サイト1件と現在の設定を取る */
export async function loadSiteForEdit(siteId: string): Promise<LoadResult> {
  const access = await requireSiteAccess(siteId);
  if (!access.ok) return { ok: false, reason: access.reason };

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, reason: "unauthenticated" };

  // config と、プラン判定に使う会社情報をまとめて取る（RLS 越し）
  const { data, error } = await supabase
    .from("sites")
    .select("id, slug, template_id, status, org_id, orgs(name, plan), site_configs(config, version)")
    .eq("id", siteId)
    .maybeSingle();

  if (error || !data) {
    console.error("[site-editor] サイトの取得に失敗", { siteId, error });
    return { ok: false, reason: "not_found" };
  }

  const cfgRow = pickOne<{ config: SiteConfig; version: number }>(
    (data as { site_configs?: unknown }).site_configs
  );
  if (!cfgRow?.config) return { ok: false, reason: "not_found" };

  const org = pickOne<{ name: string; plan: string }>((data as { orgs?: unknown }).orgs);

  return {
    ok: true,
    siteId: data.id as string,
    slug: data.slug as string,
    templateId: (data.template_id as string) || "warm-craft",
    status: data.status as string,
    plan: org?.plan || "otameshi",
    orgName: org?.name || "",
    config: cfgRow.config,
    version: cfgRow.version ?? 1,
  };
}

/* ═══════════════════════════════════════
   保存
   ═══════════════════════════════════════ */

export type SaveResult =
  | { ok: true; version: number }
  | { ok: false; reason: "conflict"; currentVersion: number }
  | { ok: false; reason: "unauthenticated" | "forbidden" | "not_found" | "failed"; message?: string };

/**
 * サイト設定をまるごと保存する。
 *
 * 手元で開いていた版（expectedVersion）を一緒に送り、DB 側の版と一致したときだけ書く。
 * 一致しなければ conflict を返すので、画面は上書きを止めて読み直しを促す。
 * 保存のたびに履歴（site_config_versions）にも積まれるので、あとから戻せる。
 */
export async function saveSiteConfig(
  siteId: string,
  config: SiteConfig,
  expectedVersion: number,
  note = ""
): Promise<SaveResult> {
  const access = await requireSiteAccess(siteId);
  if (!access.ok) return { ok: false, reason: access.reason };

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, reason: "unauthenticated" };

  const { data, error } = await supabase.rpc("update_site_config", {
    p_site_id: siteId,
    p_config: config,
    p_expected_version: expectedVersion,
    p_note: note,
  });

  if (error) {
    console.error("[site-editor] 保存に失敗", { siteId, error });
    return { ok: false, reason: "failed", message: "保存できませんでした。時間をおいて試してください。" };
  }

  const res = data as { ok?: boolean; version?: number; reason?: string; current_version?: number } | null;

  if (res?.ok) return { ok: true, version: res.version ?? expectedVersion + 1 };

  if (res?.reason === "conflict") {
    return { ok: false, reason: "conflict", currentVersion: res.current_version ?? expectedVersion };
  }
  return { ok: false, reason: "not_found" };
}

/* ═══════════════════════════════════════
   画像
   ═══════════════════════════════════════ */

const BUCKET = "site-assets";
const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; message: string };

/**
 * 画像を Storage に置いて、公開 URL を返す。
 *
 * 画面側で先に縮小・圧縮してから送ってくる前提なので、ここでは変換しない。
 * 置き場所は {site_id}/{YYYYMM}/{乱数}.{拡張子}。
 */
export async function uploadSiteImage(siteId: string, formData: FormData): Promise<UploadResult> {
  const access = await requireSiteAccess(siteId);
  if (!access.ok) {
    return { ok: false, message: "このサイトを編集する権限がありません。" };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, message: "画像が受け取れませんでした。" };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "画像が大きすぎます。8MB以下にしてください。" };
  }
  if (!ALLOWED.has(file.type)) {
    return { ok: false, message: "対応していない形式です。JPEG・PNG・WebP のいずれかにしてください。" };
  }

  const admin = getWriteClient();
  if (!admin) return { ok: false, message: "画像の保存先が設定されていません。" };

  const ext = extensionFor(file.type);
  const now = new Date();
  const period = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const path = `${siteId}/${period}/${crypto.randomUUID()}.${ext}`;

  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: upErr } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });

  if (upErr) {
    console.error("[site-editor] 画像の保存に失敗", { siteId, path, upErr });
    return { ok: false, message: "画像を保存できませんでした。もう一度お試しください。" };
  }

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);

  // 何がどこにあるか追えるように控えておく
  await admin.from("assets").insert({
    site_id: siteId,
    storage_path: path,
    kind: "photo",
    bytes: file.size,
  });

  return { ok: true, url: pub.publicUrl, path };
}

/* ═══════════════════════════════════════
   履歴
   ═══════════════════════════════════════ */

export type HistoryEntry = { version: number; note: string; createdAt: string };

/** 保存履歴を新しい順に返す（「1つ前に戻す」の材料） */
export async function listSiteHistory(siteId: string, limit = 20): Promise<HistoryEntry[]> {
  const access = await requireSiteAccess(siteId);
  if (!access.ok) return [];

  const supabase = await createServerSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("site_config_versions")
    .select("version, note, created_at")
    .eq("site_id", siteId)
    .order("version", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[site-editor] 履歴の取得に失敗", { siteId, error });
    return [];
  }
  return (data ?? []).map((r) => ({
    version: r.version as number,
    note: (r.note as string) || "",
    createdAt: r.created_at as string,
  }));
}

/** 指定した版の内容を取り出す（戻す前の確認に使う） */
export async function getSiteVersion(siteId: string, version: number): Promise<SiteConfig | null> {
  const access = await requireSiteAccess(siteId);
  if (!access.ok) return null;

  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("site_config_versions")
    .select("config")
    .eq("site_id", siteId)
    .eq("version", version)
    .maybeSingle();

  if (error || !data) return null;
  return data.config as SiteConfig;
}

/* ═══════════════════════════════════════
   小道具
   ═══════════════════════════════════════ */

/** 1対1の関連は実装差で配列になることがあるので、どちらでも拾えるようにする */
function pickOne<T>(raw: unknown): T | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return (raw[0] as T) ?? null;
  return raw as T;
}

function extensionFor(mime: string): string {
  switch (mime) {
    case "image/png": return "png";
    case "image/webp": return "webp";
    case "image/avif": return "avif";
    case "image/gif": return "gif";
    default: return "jpg";
  }
}
