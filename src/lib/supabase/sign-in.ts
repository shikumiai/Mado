"use client";

/**
 * ログインの入口（ブラウザ側）。
 *
 * 入る道は3つ。どれも最後は同じ「ログイン状態の Cookie」を作る。
 *   1. メール ＋ パスワード（新規登録・ログイン・再設定）
 *   2. パスキー（WebAuthn。対応端末では最優先）
 *   3. Google（1ボタン。アカウントが無ければその場で作られる）
 *
 * 返り値は { ok, message? } にそろえる。うまくいかない時は、その場に薄く
 * 出せるよう、やさしい日本語のメッセージを添える（英語のまま出さない）。
 */

import { getBrowserClient } from "./client";
import type { PasskeyListItem } from "@supabase/supabase-js";

export type AuthResult =
  | { ok: true; needsEmailConfirm?: boolean }
  | { ok: false; message: string };

const NOT_READY = "ログインの準備ができていません。時間をおいて試してください。";

/** ログイン後の戻り先を安全な内部パスに限る */
function safeNext(next?: string | null): string | undefined {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return undefined;
}

/** Supabase の英語エラーを、やさしい日本語に置きかえる */
function friendlyAuthError(error: { code?: string; message?: string } | null): string {
  const code = error?.code ?? "";
  const msg = (error?.message ?? "").toLowerCase();

  if (code === "invalid_credentials" || msg.includes("invalid login credentials")) {
    return "メールアドレスかパスワードが違うようです。もう一度お確かめください。";
  }
  if (code === "email_not_confirmed" || msg.includes("email not confirmed")) {
    return "メールの確認がまだのようです。届いた確認メールのリンクを開いてください。";
  }
  if (code === "user_already_exists" || code === "email_exists" || msg.includes("already registered")) {
    return "このメールアドレスはすでに登録済みです。ログインからお進みください。";
  }
  if (code === "weak_password" || msg.includes("password should be") || msg.includes("weak")) {
    return "パスワードが短いようです。8文字以上にしてください。";
  }
  if (code === "over_email_send_rate_limit" || msg.includes("rate limit") || msg.includes("too many")) {
    return "送信の回数が多すぎました。少し時間をおいてから試してください。";
  }
  if (code === "same_password" || msg.includes("different from the old")) {
    return "いまと同じパスワードです。別のパスワードにしてください。";
  }
  if (msg.includes("webauthn") || msg.includes("passkey") || code.includes("passkey")) {
    return "パスキーでの確認ができませんでした。もう一度お試しください。";
  }
  return "うまくいきませんでした。時間をおいてもう一度お試しください。";
}

/* ═══════════════════════════════════════════════════════════
   1. メール ＋ パスワード
   ═══════════════════════════════════════════════════════════ */

/** 新規登録。確認メールが要る設定なら needsEmailConfirm を返す */
export async function signUpWithEmail(
  email: string,
  password: string,
  next?: string
): Promise<AuthResult> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: NOT_READY };

  const redirectTo = new URL("/auth/callback", window.location.origin);
  const n = safeNext(next);
  if (n) redirectTo.searchParams.set("next", n);

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { emailRedirectTo: redirectTo.toString() },
  });

  if (error) {
    console.error("[sign-in] 新規登録に失敗", error);
    return { ok: false, message: friendlyAuthError(error) };
  }

  // 確認メールが有効だと session は返らない（メールのリンクを踏むまで保留）
  const needsEmailConfirm = !data.session;
  return { ok: true, needsEmailConfirm };
}

/** ログイン（メール＋パスワード） */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: NOT_READY };

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    console.error("[sign-in] ログインに失敗", error);
    return { ok: false, message: friendlyAuthError(error) };
  }
  return { ok: true };
}

/** パスワード再設定のメールを送る。リンク先は /auth/reset/confirm */
export async function sendPasswordReset(email: string): Promise<AuthResult> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: NOT_READY };

  const redirectTo = new URL("/auth/reset/confirm", window.location.origin);

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: redirectTo.toString(),
  });

  if (error) {
    console.error("[sign-in] 再設定メールの送信に失敗", error);
    return { ok: false, message: friendlyAuthError(error) };
  }
  return { ok: true };
}

/** 新しいパスワードを保存する（再設定リンクで一時ログインした後に呼ぶ） */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: NOT_READY };

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    console.error("[sign-in] パスワードの更新に失敗", error);
    return { ok: false, message: friendlyAuthError(error) };
  }
  return { ok: true };
}

/**
 * 再設定リンクから戻ってきたときに、一時的なログイン状態を作る。
 * リンクの形（PKCE の ?code / token_hash / URL 断片）どれでも受けられるようにする。
 * 断片(#access_token=...)は detectSessionInUrl が自動で処理するので、
 * ここでは code / token_hash を明示的に交換する。
 */
export async function establishRecoverySession(): Promise<AuthResult> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: NOT_READY };

  // すでにセッションがあれば（断片の自動処理済み等）そのまま通す
  const { data: current } = await supabase.auth.getSession();
  if (current.session) return { ok: true };

  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // detectSessionInUrl が先に同じ code を使い切っていることがある。
      // その場合はすでにセッションがあるはずなので見直す。
      const { data: after } = await supabase.auth.getSession();
      if (after.session) return { ok: true };
      console.error("[sign-in] 再設定リンクの確認に失敗(code)", error);
      return { ok: false, message: "リンクの有効期限が切れているかもしれません。もう一度メールを送ってください。" };
    }
    return { ok: true };
  }

  if (tokenHash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
    if (error) {
      console.error("[sign-in] 再設定リンクの確認に失敗(token_hash)", error);
      return { ok: false, message: "リンクの有効期限が切れているかもしれません。もう一度メールを送ってください。" };
    }
    return { ok: true };
  }

  return { ok: false, message: "再設定リンクが正しくないようです。メールのリンクからもう一度お進みください。" };
}

/* ═══════════════════════════════════════════════════════════
   2. パスキー（WebAuthn・ネイティブ）
   ═══════════════════════════════════════════════════════════ */

/** この端末・ブラウザがパスキーに対応しているか */
export function passkeysSupported(): boolean {
  return typeof window !== "undefined" && typeof window.PublicKeyCredential === "function";
}

/**
 * パスキーでログイン（パスワードなしの本人確認）。
 * 端末に保存されたパスキーの中から選んで、そのままログイン状態を作る。
 */
export async function signInWithPasskey(): Promise<AuthResult> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: NOT_READY };
  if (!passkeysSupported()) {
    return { ok: false, message: "この端末はパスキーに対応していないようです。メールか Google でお進みください。" };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPasskey();
    if (error || !data?.session) {
      console.error("[sign-in] パスキーのログインに失敗", error);
      return { ok: false, message: passkeyFallbackMessage(error) };
    }
    return { ok: true };
  } catch (e) {
    // experimental フラグ未設定など、想定外はここで受ける
    console.error("[sign-in] パスキーのログインで例外", e);
    return { ok: false, message: "この環境ではパスキーがまだ使えません。メールか Google でお進みください。" };
  }
}

/** パスキーを登録する（ログイン中の人が、この端末を"鍵"として覚えさせる） */
export async function registerPasskey(friendlyName?: string): Promise<AuthResult> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: NOT_READY };
  if (!passkeysSupported()) {
    return { ok: false, message: "この端末はパスキーに対応していないようです。" };
  }

  try {
    const { data, error } = await supabase.auth.registerPasskey();
    if (error || !data) {
      console.error("[sign-in] パスキーの登録に失敗", error);
      return { ok: false, message: passkeyFallbackMessage(error) };
    }
    // 名前を付けたい場合は、登録直後にリネームする（任意）
    const name = friendlyName?.trim();
    if (name && data.id) {
      await supabase.auth.passkey.update({ passkeyId: data.id, friendlyName: name }).catch(() => {});
    }
    return { ok: true };
  } catch (e) {
    console.error("[sign-in] パスキーの登録で例外", e);
    return { ok: false, message: "この環境ではパスキーがまだ使えません。" };
  }
}

/** ログイン中の人のパスキー一覧 */
export async function listPasskeys(): Promise<
  { ok: true; items: PasskeyListItem[] } | { ok: false; message: string }
> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: NOT_READY };
  try {
    const { data, error } = await supabase.auth.passkey.list();
    if (error) return { ok: false, message: passkeyFallbackMessage(error) };
    return { ok: true, items: data ?? [] };
  } catch {
    return { ok: false, message: "この環境ではパスキーがまだ使えません。" };
  }
}

/** パスキーを削除する */
export async function deletePasskey(passkeyId: string): Promise<AuthResult> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: NOT_READY };
  try {
    const { error } = await supabase.auth.passkey.delete({ passkeyId });
    if (error) return { ok: false, message: passkeyFallbackMessage(error) };
    return { ok: true };
  } catch {
    return { ok: false, message: "削除できませんでした。時間をおいてお試しください。" };
  }
}

/** パスキーの名前を変える */
export async function renamePasskey(passkeyId: string, friendlyName: string): Promise<AuthResult> {
  const supabase = getBrowserClient();
  if (!supabase) return { ok: false, message: NOT_READY };
  try {
    const { error } = await supabase.auth.passkey.update({
      passkeyId,
      friendlyName: friendlyName.trim().slice(0, 120),
    });
    if (error) return { ok: false, message: passkeyFallbackMessage(error) };
    return { ok: true };
  } catch {
    return { ok: false, message: "名前を変えられませんでした。時間をおいてお試しください。" };
  }
}

/** パスキー系の失敗を、原因ごとにやさしく言い換える */
function passkeyFallbackMessage(error: { name?: string; code?: string; message?: string } | null): string {
  const name = error?.name ?? "";
  const msg = (error?.message ?? "").toLowerCase();

  // 利用者が途中でやめた（ダイアログを閉じた）
  if (name === "NotAllowedError" || msg.includes("not allowed") || msg.includes("abort") || msg.includes("timed out")) {
    return "パスキーの確認をキャンセルしたようです。もう一度お試しください。";
  }
  // サーバー側でまだ機能が有効になっていない
  if (msg.includes("not enabled") || msg.includes("not found") || msg.includes("disabled") || msg.includes("501") || msg.includes("404")) {
    return "この環境ではパスキーがまだ使えません。メールか Google でお進みください。";
  }
  if (msg.includes("does not support")) {
    return "この端末はパスキーに対応していないようです。メールか Google でお進みください。";
  }
  return "パスキーでの確認ができませんでした。もう一度お試しください。";
}

/* ═══════════════════════════════════════════════════════════
   3. Google
   ═══════════════════════════════════════════════════════════ */

/**
 * @param next ログイン後に開きたいページ（省略時は会社の有無で自動判定）
 */
export async function signInWithGoogle(next?: string): Promise<{ ok: boolean; message?: string }> {
  const supabase = getBrowserClient();
  if (!supabase) {
    return { ok: false, message: NOT_READY };
  }

  const redirectTo = new URL("/auth/callback", window.location.origin);
  const n = safeNext(next);
  if (n) redirectTo.searchParams.set("next", n);

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
