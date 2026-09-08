"use client";

/**
 * Supabase クライアント（ブラウザ側）
 *
 * セッションは Cookie に保存する（@supabase/ssr の createBrowserClient）。
 * こうすると、ブラウザで始めたログインをサーバー（Route Handler / proxy /
 * Server Component）からもそのまま読める。
 *
 * 素の supabase-js の createClient() は使わない。あちらは既定が implicit 方式で、
 * Google から戻るときにトークンが URL の #access_token=... に載る。
 * サーバー側の /auth/callback には # 以降が届かないので、?code= を待っている
 * コールバックが「ログイン情報を受け取れませんでした」になる。
 * createBrowserClient は既定が PKCE 方式で、?code= を付けて戻ってくる。
 *
 * 取得のたびに作り直すと認証インスタンスが増えて警告が出るので、
 * モジュール内に1個だけ作って使い回す。
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const URL_ENV = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_ENV = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient | null {
  if (!URL_ENV || !ANON_ENV) return null;
  if (!client) {
    client = createBrowserClient(URL_ENV, ANON_ENV);
  }
  return client;
}
