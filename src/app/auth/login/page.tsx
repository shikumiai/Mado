"use client";

/**
 * ログイン画面（Supabase Auth 版）。
 *
 * 既存の /member のログイン画面は next-auth のままなので、
 * まずはこちらで新しい経路を通す。動作が確かめられたら
 * /member 側をこの仕組みに寄せて、next-auth を外す。
 *
 * URL のクエリは useSearchParams を使わず window から読む。
 * useSearchParams を使うとページ全体が Suspense に落ちて、
 * 最初の表示が真っ白になるため。
 */

import { useEffect, useState } from "react";
import { signInWithGoogle } from "@/lib/supabase/sign-in";

const ERROR_MESSAGES: Record<string, string> = {
  login_failed: "ログインが完了しませんでした。もう一度お試しください。",
  missing_code: "ログイン情報を受け取れませんでした。もう一度お試しください。",
  session_failed: "ログイン状態を保存できませんでした。もう一度お試しください。",
  not_configured: "ただいまログインを準備中です。時間をおいてお試しください。",
};

export default function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (code && ERROR_MESSAGES[code]) setMessage(ERROR_MESSAGES[code]);
  }, []);

  async function handleGoogle() {
    setBusy(true);
    setMessage(null);

    const next = new URLSearchParams(window.location.search).get("next");
    const result = await signInWithGoogle(next || undefined);

    if (!result.ok) {
      setMessage(result.message ?? "ログインできませんでした。");
      setBusy(false);
    }
    // 成功時は Google の画面へ移動するので、ここには戻ってこない
  }

  return (
    <main
      style={{
        minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, background: "#FAF7F2",
        fontFamily: "'Noto Sans JP', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 380, width: "100%" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "#3D3226" }}>ログイン</h1>
        <p style={{ fontSize: 13, color: "#8B7D6B", marginBottom: 28, lineHeight: 1.8 }}>
          Google アカウントでログインします。
          <br />
          はじめての方は、そのまま申し込みに進めます。
        </p>

        {message && (
          <p
            role="alert"
            style={{
              fontSize: 13, color: "#B03A2E", background: "#FCF0EE",
              border: "1px solid #F0D5D0", borderRadius: 8,
              padding: "10px 14px", marginBottom: 18, lineHeight: 1.7,
            }}
          >
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          style={{
            width: "100%", padding: "14px 20px", fontSize: 15, fontWeight: 600,
            color: "#3D3226", background: "#fff",
            border: "1px solid #E8DFD3", borderRadius: 10,
            cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {busy ? "ログイン中…" : "Google でログイン"}
        </button>
      </div>
    </main>
  );
}
