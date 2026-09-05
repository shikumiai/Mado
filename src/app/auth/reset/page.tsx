"use client";

/**
 * パスワード再設定の入口。
 *
 * メールアドレスを受け取り、再設定用のリンクを送る。
 * 送ったあとは、その旨をその場に出して待ってもらう。
 * リンク先は /auth/reset/confirm（新しいパスワードを決める画面）。
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Field, Button } from "@/components/ui";
import { AuthShell } from "@/components/auth/AuthShell";
import { sendPasswordReset } from "@/lib/supabase/sign-in";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ResetPage() {
  const [next, setNext] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("next");
    if (n) setNext(n);
  }, []);

  const nextQ = next ? `?next=${encodeURIComponent(next)}` : "";

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setEmailErr(undefined);
    if (!EMAIL_RE.test(email.trim())) {
      setEmailErr("メールアドレスの形をご確認ください。");
      return;
    }
    setBusy(true);
    const r = await sendPasswordReset(email);
    setBusy(false);
    if (!r.ok) {
      setEmailErr(r.message);
      return;
    }
    setSentTo(email.trim());
  }

  if (sentTo) {
    return (
      <AuthShell
        title="再設定メールを送りました"
        subtitle="届いたメールのリンクを開くと、新しいパスワードを決められます。"
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
            <span className="font-medium">{sentTo}</span> 宛に再設定メールを送りました。
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
      title="パスワードの再設定"
      subtitle="登録したメールアドレスに、再設定のリンクをお送りします。"
      footer={
        <Link
          href={`/auth/login${nextQ}`}
          className="rounded font-medium text-accent underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          ログインにもどる
        </Link>
      }
    >
      <form onSubmit={handleSend} className="flex flex-col gap-4" noValidate>
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
        <Button type="submit" variant="primary" size="lg" block loading={busy}>
          再設定メールを送る
        </Button>
      </form>
    </AuthShell>
  );
}
