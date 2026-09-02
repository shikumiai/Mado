"use client";

/**
 * Supabase クライアント（ブラウザ側）
 *
 * 取得のたびに createClient() すると、定期更新のたびに認証インスタンスが増えて
 * ブラウザに警告が出る。モジュール内に1個だけ作って使い回す。
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL_ENV = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_ENV = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient | null {
  if (!URL_ENV || !ANON_ENV) return null;
  if (!client) {
    client = createClient(URL_ENV, ANON_ENV);
  }
  return client;
}
