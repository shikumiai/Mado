"use client";

/**
 * 新しいパスワードを決める画面（再設定メールのリンク先）。
 *
 * まずリンクの情報から一時的なログイン状態を作る（establishRecoverySession）。
 * 作れたら新しいパスワードの入力を出し、保存できたらマイページへ送る。
 * リンクが古い・壊れている時は、その理由を出してメール送信へ戻れるようにする。
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { Field, Button, useToast } from "@/components/ui";
import { AuthShell } from "@/components/auth/AuthShell";
import { establishRecoverySession, updatePassword } from "@/lib/supabase/sign-in";

type Phase = "verifying" | "ready" | "invalid";

export default function ResetConfirmPage() {
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("verifying");
  const [invalidMsg, setInvalidMsg] = useState<string>("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwErr, setPwErr] = useState<string | undefined>(undefined);
  const [confirmErr, setConfirmErr] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await establishRecoverySession();
      if (!alive) return;
      if (r.ok) {
        setPhase("ready");
      } else {
        setInvalidMsg(r.message);
        setPhase("invalid");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setPwErr(undefined);
    setConfirmErr(undefined);

    let bad = false;
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
    const r = await updatePassword(password);
    if (!r.ok) {
      setBusy(false);
      setPwErr(r.message);
      return;
    }
    toast({ title: "変更しました", description: "新しいパスワードを保存しました。", tone: "success" });
    window.location.assign("/app");
  }

  if (phase === "verifying") {
    return (
      <AuthShell title="確認しています" subtitle="リンクを確かめています。少しお待ちください。">
        <div className="flex justify-center py-4">
          <span className="skeleton h-11 w-full max-w-xs" />
        </div>
      </AuthShell>
    );
  }

  if (phase === "invalid") {
    return (
      <AuthShell
        title="リンクを確認できませんでした"
        footer={
          <Link
            href="/auth/reset"
            className="rounded font-medium text-accent underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            もう一度メールを送る
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-danger/10 text-danger">
            <CircleAlert className="size-7" aria-hidden />
          </span>
          <p className="text-sm leading-relaxed text-ink">{invalidMsg}</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="新しいパスワード" subtitle="これから使うパスワードを決めてください。">
      <form onSubmit={handleSave} className="flex flex-col gap-4" noValidate>
        <Field
          label="新しいパスワード"
          type="password"
          autoComplete="new-password"
          placeholder="8文字以上"
          value={password}
          error={pwErr}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Field
          label="新しいパスワード（確認）"
          type="password"
          autoComplete="new-password"
          placeholder="もう一度入力"
          value={confirm}
          error={confirmErr}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <Button type="submit" variant="primary" size="lg" block loading={busy}>
          パスワードを変更
        </Button>
      </form>
    </AuthShell>
  );
}
