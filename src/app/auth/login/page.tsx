"use client";

/**
 * ログイン画面（3つの入り方・新デザイン）。
 *
 * 窓×暖色×明朝の世界観で、入る道を1画面に並べる:
 *   ・パスキー（対応端末では最優先。指紋・顔・暗証番号で入る）
 *   ・メール ＋ パスワード（Google 以外の道。再設定リンクも明快に）
 *   ・Google（1ボタン。アカウントが無ければその場で作られる）
 *
 * サインイン＝新規登録の考えは残しつつ、メールだけは明示の新規登録も用意する。
 * うまくいかない時は理由をその場に薄く出し、別の画面へは飛ばさない。
 *
 * URL のクエリは useSearchParams を使わず window から読む
 * （useSearchParams はページ全体を Suspense に落として初回が真っ白になるため）。
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Field, Button, useToast } from "@/components/ui";
import { AuthShell, AuthDivider } from "@/components/auth/AuthShell";
import { GoogleButton, PasskeyButton } from "@/components/auth/AuthButtons";
import { signInWithEmail, passkeysSupported } from "@/lib/supabase/sign-in";

const CALLBACK_ERRORS: Record<string, string> = {
  login_failed: "ログインが完了しませんでした。もう一度お試しください。",
  missing_code: "ログイン情報を受け取れませんでした。もう一度お試しください。",
  session_failed: "ログイン状態を保存できませんでした。もう一度お試しください。",
  not_configured: "ただいまログインを準備中です。時間をおいてお試しください。",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function landing(next?: string): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/app";
}

export default function LoginPage() {
  const { toast } = useToast();
  const [next, setNext] = useState<string | undefined>(undefined);
  const [hasPasskey, setHasPasskey] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailErr, setEmailErr] = useState<string | undefined>(undefined);
  const [pwErr, setPwErr] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const n = q.get("next");
    if (n) setNext(n);

    const code = q.get("error");
    if (code) {
      toast({
        title: "もう一度お試しください",
        description: CALLBACK_ERRORS[code] ?? `ログインの途中で問題が発生しました。（理由: ${code}）`,
        tone: "danger",
      });
    }
    setHasPasskey(passkeysSupported());
  }, [toast]);

  const nextQ = next ? `?next=${encodeURIComponent(next)}` : "";

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setEmailErr(undefined);
    setPwErr(undefined);

    let bad = false;
    if (!EMAIL_RE.test(email.trim())) {
      setEmailErr("メールアドレスの形をご確認ください。");
      bad = true;
    }
    if (password.length < 1) {
      setPwErr("パスワードを入れてください。");
      bad = true;
    }
    if (bad) return;

    setBusy(true);
    const r = await signInWithEmail(email, password);
    if (r.ok) {
      window.location.assign(landing(next)); // 全リロードでサーバーに Cookie を渡す
      return;
    }
    setBusy(false);
    setPwErr(r.message);
  }

  return (
    <AuthShell
      title="Mado にログイン"
      subtitle="入り方は3つ。はじめての方も、そのまま始められます。"
      footer={
        <>
          メールではじめての方は{" "}
          <Link
            href={`/auth/signup${nextQ}`}
            className="rounded font-medium text-accent underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            新規登録
          </Link>
        </>
      }
    >
      {/* パスキー（対応端末では最優先の導線） */}
      {hasPasskey && (
        <>
          <PasskeyButton next={next} variant="primary" />
          <p className="mt-2 text-center text-xs leading-relaxed text-ink3">
            この端末に登録したパスキー（指紋・顔・暗証番号）で入れます。
          </p>
          <div className="my-5">
            <AuthDivider label="または メールで" />
          </div>
        </>
      )}

      {/* メール ＋ パスワード */}
      <form onSubmit={handleEmailLogin} className="flex flex-col gap-4" noValidate>
        <Field
          label="メールアドレス"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          error={emailErr}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <Field
            label="パスワード"
            type="password"
            autoComplete="current-password"
            placeholder="8文字以上"
            value={password}
            error={pwErr}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-end">
            <Link
              href={`/auth/reset${nextQ}`}
              className="rounded text-xs text-ink2 underline-offset-2 outline-none hover:text-ink hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              パスワードを忘れた方
            </Link>
          </div>
        </div>

        <Button type="submit" variant={hasPasskey ? "secondary" : "primary"} size="lg" block loading={busy}>
          ログイン
        </Button>
      </form>

      {/* Google */}
      <div className="my-5">
        <AuthDivider />
      </div>
      <GoogleButton next={next} />
    </AuthShell>
  );
}
