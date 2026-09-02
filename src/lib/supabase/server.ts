/**
 * Supabase クライアント（サーバー側）
 *
 * 読み取りと書き込みでクライアントを分ける。
 *  - 読み取り: anon キー。RLS が効くので、公開中のサイトだけが取れる
 *  - 書き込み: service_role キー。RLS を素通りするので、
 *              呼ぶ前に必ず認可チェックを通すこと
 *
 * 環境変数が未設定でも import では落とさない。
 * 「まだ繋がっていない」を null で表し、呼び出し側でフォールバックする。
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL_ENV = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_ENV = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ENV = process.env.SUPABASE_SERVICE_ROLE_KEY;

let readClient: SupabaseClient | null = null;
let writeClient: SupabaseClient | null = null;

/** 設定が揃っているか */
export function isSupabaseConfigured(): boolean {
  return Boolean(URL_ENV && ANON_ENV);
}

/**
 * 読み取り用（anon）。RLS が効く。
 * 公開サイトの表示・一般的な SELECT はこちら。
 */
export function getReadClient(): SupabaseClient | null {
  if (!URL_ENV || !ANON_ENV) return null;
  if (!readClient) {
    readClient = createClient(URL_ENV, ANON_ENV, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return readClient;
}

/**
 * 書き込み用（service_role）。RLS を素通りする。
 *
 * サーバーの中だけで使うこと。呼ぶ前に「この人はこの操作をしてよいか」を
 * 必ず確かめる。確かめずに呼ぶと誰でも何でも書ける。
 */
export function getWriteClient(): SupabaseClient | null {
  if (!URL_ENV || !SERVICE_ENV) return null;
  if (!writeClient) {
    writeClient = createClient(URL_ENV, SERVICE_ENV, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return writeClient;
}

/**
 * 「テーブルがまだ無い」系のエラーか判定する。
 * migration の適用前でも画面を白くしないために使う。
 */
export function isMissingTableError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; message?: string };
  if (e.code === "42P01" || e.code === "PGRST205") return true;
  const m = (e.message || "").toLowerCase();
  return m.includes("does not exist") || m.includes("schema cache");
}
