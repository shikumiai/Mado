"use client";

/**
 * ログイン画面（Supabase Auth 版・作り直し）。
 *
 * 入口はひとつ。Google のボタン1つで入る。アカウントが無ければ
 * その場で作られる（ログイン ＝ 新規登録）。うまくいかない時は
 * 理由をその場に薄く出すだけで、別の画面へは飛ばさない。
 *
 * URL のクエリは useSearchParams を使わず window から読む。
 * useSearchParams はページ全体を Suspense に落として初回が真っ白になるため。
 */

import { useEffect, useState } from "react";
import { signInWithGoogle } from "@/lib/supabase/sign-in";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Mascot } from "@/components/ui/Mascot";

const ERROR_MESSAGES: Record<string, string> = {
  login_failed: "ログインが完了しませんでした。もう一度お試しください。",
  missing_code: "ログイン情報を受け取れませんでした。もう一度お試しください。",
  session_failed: "ログイン状態を保存できませんでした。もう一度お試しください。",
  not_configured: "ただいまログインを準備中です。時間をおいてお試しください。",
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (code) {
      setMessage(
        ERROR_MESSAGES[code] ??
          `ログインの途中で問題が発生しました。もう一度お試しください。（理由: ${code}）`
      );
    }
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
    <main className="grid min-h-screen place-items-center bg-bg px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Mascot size={56} className="mb-4" />
          <h1 className="text-xl font-bold text-ink">Mado にログイン</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink2">
            Google のアカウントで入れます。
            <br />
            はじめての方は、そのまま始められます（ログイン＝新規登録）。
          </p>
        </div>

        <Card className="flex flex-col gap-4">
          {message && (
            <p
              role="alert"
              className="rounded-md border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm leading-relaxed text-danger"
            >
              {message}
            </p>
          )}

          <Button
            variant="secondary"
            size="lg"
            block
            loading={busy}
            onClick={handleGoogle}
            leftIcon={<GoogleIcon />}
          >
            {busy ? "ログイン中…" : "Google で続ける"}
          </Button>

          <p className="text-center text-xs leading-relaxed text-ink3">
            ボタンを押すと Google の画面に移り、戻ってくると準備が整います。
          </p>
        </Card>
      </div>
    </main>
  );
}
