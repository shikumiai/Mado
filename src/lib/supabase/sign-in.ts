"use client";

/**
 * ログインの入口（ブラウザ側）。
 *
 * Google の画面へ送り、戻り先を /auth/callback に指定する。
 * セッションの保存はコールバック側でやるので、ここは送り出すだけ。
 */

import { getBrowserClient } from "./client";

/**
 * @param next ログイン後に開きたいページ（省略時は会社の有無で自動判定）
 */
export async function signInWithGoogle(next?: string): Promise<{ ok: boolean; message?: string }> {
  const supabase = getBrowserClient();
  if (!supabase) {
    return { ok: false, message: "ログインの準備ができていません。時間をおいて試してください。" };
  }

  const redirectTo = new URL("/auth/callback", window.location.origin);
  if (next) redirectTo.searchParams.set("next", next);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // prompt:"consent" は付けない。付けると毎回同意画面が出て入口が重くなる。
      // 2回目以降の人はそのまま素通しで戻ってこられるようにする。
      redirectTo: redirectTo.toString(),
    },
  });

  if (error) {
    console.error("[sign-in] Google ログインの開始に失敗", error);
    return { ok: false, message: "ログインを開始できませんでした。" };
  }
  return { ok: true };
}

/** ログアウト。Cookie を消すため Route Handler へ POST する */
export function signOut() {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/auth/signout";
  document.body.appendChild(form);
  form.submit();
}
