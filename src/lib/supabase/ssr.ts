/**
 * ログイン中のユーザーとして動く Supabase クライアント。
 *
 * Cookie にセッションが入るので、この経路で読み書きすると
 * RLS が「その人」として効く。自分の会社のサイトだけが見え、
 * 他人のサイトは DB の側で弾かれる。
 *
 * リクエストごとに毎回新しく作ること。使い回すと別の人のセッションが混ざる。
 * （使い回してよいのは anon / service_role の固定クライアントだけ）
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

const URL_ENV = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_ENV = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Server Component / Route Handler / Server Action から使う。
 *
 * Server Component からは Cookie を書けないので、トークンの更新は
 * proxy.ts が受け持つ。ここで書き込みに失敗しても無視してよい。
 */
export async function createServerSupabase(): Promise<SupabaseClient | null> {
  if (!URL_ENV || !ANON_ENV) return null;

  const cookieStore = await cookies();

  return createServerClient(URL_ENV, ANON_ENV, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component からの呼び出し。proxy.ts 側で更新される
        }
      },
    },
  });
}
