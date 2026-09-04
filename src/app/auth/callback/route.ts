/**
 * Google ログインの戻り先。
 *
 *   Google で認証
 *     → Supabase が ?code=... を付けてここへ返す
 *     → コードをセッションに交換して Cookie に保存
 *     → 会社があればダッシュボード、無ければ申込フローへ
 */

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/ssr";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  // Google 側で断られた場合
  const oauthError = searchParams.get("error_description") || searchParams.get("error");
  if (oauthError) {
    console.error("[auth/callback] ログインに失敗", oauthError);
    return NextResponse.redirect(`${origin}/auth/login?error=login_failed`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

  const supabase = await createServerSupabase();
  if (!supabase) {
    return NextResponse.redirect(`${origin}/auth/login?error=not_configured`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] セッションの作成に失敗", error);
    return NextResponse.redirect(`${origin}/auth/login?error=session_failed`);
  }

  // 行き先が指定されていればそこへ。ただし外部URLへは飛ばさない
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // 会社がある人はダッシュボード、まだの人は申込へ
  const { data: orgs } = await supabase.from("orgs").select("id").limit(1);
  // 会社がある人は会員ホーム（/app）へ。まだの人は申込フローの続きへ。
  const dest = orgs && orgs.length > 0 ? "/app" : "/start";

  return NextResponse.redirect(`${origin}${dest}`);
}
