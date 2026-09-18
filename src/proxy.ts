/**
 * Next.js 16 の proxy（15 までの middleware）。
 *
 * ここでやることは1つだけ。**ログインセッションの更新**。
 *
 * Supabase の認証トークンには期限がある。Server Component からは Cookie を
 * 書けないので、更新されたトークンを保存する場所がここしかない。
 * 公式が「入れないと原因不明のログアウトや JSON パースエラーが起きる」と
 * 強く警告している箇所なので、必ず置いておく。
 *
 * ルーティング（どの顧客サイトを出すか）はここではやらない。
 * URL が mado.shikumiai.com/{slug} の形なので、Next.js の
 * 「静的ルートが動的ルートより先に当たる」性質だけで足りる。
 * サブドメイン方式や独自ドメインに広げるときに、ここへ判定を足す。
 */

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 未設定でも通す（セットアップ前でも画面は動く）
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // これを呼ぶとトークンが必要に応じて更新され、setAll が走る。
  // ログインしていない訪問者には Cookie が無いので、実質なにも起きない。
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * 静的ファイルと画像は除く。
     * 顧客サイト（/{slug}）は通す。訪問者は未ログインなので負荷にならない。
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
  ],
};
