"use client";

/**
 * 新規登録（メール ＋ パスワード）。
 *
 * Google やパスキーは「入る＝登録」だが、メールだけは道が分かれるので、
 * ここで明示的に登録できるようにする。確認メールが必要な設定なら、
 * 送った旨をその場に出して待ってもらう（画面は飛ばさない）。
 * パスキーは登録後（ログイン中）に設定できるので、ここには置かない。
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Field, Button, useToast } from "@/components/ui";
import { AuthShell, AuthDivider } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/AuthButtons";
import { signUpWithEmail } from "@/lib/supabase/sign-in";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function landing(next?: string): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/app";
}

export default function SignupPage() {
  const { toast } = useToast();
  const [next, setNext] = useState<string | undefined>(undefined);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [emailErr, setEmailErr] = useState<string | undefined>(undefined);
  const [pwErr, setPwErr] = useState<string | undefined>(undefined);
  const [confirmErr, setConfirmErr] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("next");
    if (n) setNext(n);
  }, []);

  const nextQ = next ? `?next=${encodeURIComponent(next)}` : "";

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setEmailErr(undefined);
    setPwErr(undefined);
    setConfirmErr(undefined);

    let bad = false;
    if (!EMAIL_RE.test(email.trim())) {
      setEmailErr("メールアドレスの形をご確認ください。");
      bad = true;
    }
    if (password.length < 8) {
      setPwErr("パスワードは8文字以上にしてください。");
      bad = true;
    }
    if (confirm !== password) {
      setConfirmErr("確認用のパスワードが一致しません。");
      bad = true;
    }
    if (bad) return;

    setBusy(true);
    const r = await signUpWithEmail(email, password, next);
    if (!r.ok) {
      setBusy(false);
      setEmailErr(r.message);
      return;
    }

    if (r.needsEmailConfirm) {
      setSentTo(email.trim());
      setBusy(false);
      return;
    }

    // 確認メール不要の設定なら、そのまま入れる
    toast({ title: "ようこそ", description: "登録が完了しました。", tone: "success" });
    window.location.assign(landing(next));
  }

  // 確認メールを送った後の画面
  if (sentTo) {
    return (
      <AuthShell
        title="確認メールを送りました"
        subtitle="あと一歩です。届いたメールのリンクを開くと、登録が完了します。"
        footer={
          <Link
            href={`/auth/login${nextQ}`}
            className="rounded font-medium text-accent underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            ログインにもどる
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-accent-soft text-accent">
            <MailCheck className="size-7" aria-hidden />
          </span>
          <p className="text-sm leading-relaxed text-ink">
            <span className="font-medium">{sentTo}</span> 宛に確認メールを送りました。
          </p>
          <p className="text-xs leading-relaxed text-ink3">
            メールが見当たらないときは、迷惑メールのフォルダもご確認ください。
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Mado をはじめる"
      subtitle="メールとパスワードで登録します。あとからパスキーや Google も追加できます。"
      footer={
        <>
          すでにアカウントをお持ちの方は{" "}
          <Link
            href={`/auth/login${nextQ}`}
            className="rounded font-medium text-accent underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            ログイン
          </Link>
        </>
      }
    >
      <form onSubmit={handleSignup} className="flex flex-col gap-4" noValidate>
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
        <Field
          label="パスワード"
          type="password"
          autoComplete="new-password"
          placeholder="8文字以上"
          helper="推測されにくい8文字以上にしてください。"
          value={password}
          error={pwErr}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Field
          label="パスワード（確認）"
          type="password"
          autoComplete="new-password"
          placeholder="もう一度入力"
          value={confirm}
          error={confirmErr}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <Button type="submit" variant="primary" size="lg" block loading={busy}>
          登録する
        </Button>
      </form>

      <div className="my-5">
        <AuthDivider />
      </div>
      <GoogleButton next={next} label="Google で登録" />
    </AuthShell>
  );
}
