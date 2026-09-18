"use client";

/**
 * Supabase クライアント（ブラウザ側）
 *
 * セッションは Cookie に保存する（@supabase/ssr の createBrowserClient）。
 * こうすると、ブラウザで作ったログイン状態を、サーバー（Server Component /
 * Route Handler / proxy）からもそのまま読める。メール・パスキーのログインは
 * ブラウザ側で完結するので、Cookie に載せておかないとサーバーが気づけない。
 *
 * 取得のたびに作り直すと認証インスタンスが増えて警告が出るので、
 * モジュール内に1個だけ作って使い回す（createBrowserClient は既定で singleton）。
 *
 * experimental.passkey を有効にして、ネイティブのパスキー(WebAuthn)機能
 * （auth.signInWithPasskey / registerPasskey / passkey.*）を使えるようにする。
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const URL_ENV = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_ENV = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient | null {
  if (!URL_ENV || !ANON_ENV) return null;
  if (!client) {
    client = createBrowserClient(URL_ENV, ANON_ENV, {
      auth: {
        // ネイティブのパスキー（WebAuthn）を解禁する。既定は無効なので、
        // これが無いと passkey 系メソッドは呼んだ瞬間にエラーになる。
        experimental: { passkey: true },
      },
    });
  }
  return client;
}
