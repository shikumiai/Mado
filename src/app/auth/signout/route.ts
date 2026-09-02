/**
 * ログアウト。
 *
 * Cookie を消す必要があるので Route Handler で受ける
 * （Server Component からは Cookie を書けない）。
 */

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/ssr";

export async function POST(request: Request) {
  const { origin } = new URL(request.url);

  const supabase = await createServerSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }

  return NextResponse.redirect(`${origin}/`, { status: 303 });
}
