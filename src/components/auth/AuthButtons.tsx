"use client";

/**
 * 他の方法で入るボタン（Google・パスキー）。ログインと新規登録の両方で使い回す。
 * それぞれ自分で「押せない状態」「結果のトースト」「成功後の移動」まで面倒を見る。
 */

import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { Button, useToast } from "@/components/ui";
import {
  signInWithGoogle,
  signInWithPasskey,
  passkeysSupported,
} from "@/lib/supabase/sign-in";

/** ログイン後の行き先。会社の有無での振り分けはサーバー(/app)側がやる */
function landing(next?: string): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/app";
}

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/** Google で続ける。押すと Google の画面へ移り、戻ると準備が整う */
export function GoogleButton({ next, label = "Google で続ける" }: { next?: string; label?: string }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function handle() {
    setBusy(true);
    const r = await signInWithGoogle(next);
    if (!r.ok) {
      toast({ title: "Google に進めませんでした", description: r.message, tone: "danger" });
      setBusy(false);
    }
    // 成功時は Google へ移動するので、ここには戻ってこない
  }

  return (
    <Button variant="secondary" size="lg" block loading={busy} onClick={handle} leftIcon={<GoogleIcon />}>
      {label}
    </Button>
  );
}

/**
 * パスキーで入る（パスワードなし）。対応端末でだけ出す。
 * 成功したら会社の有無に応じてサーバーが振り分けるので /app へ移動する。
 */
export function PasskeyButton({
  next,
  variant = "primary",
}: {
  next?: string;
  variant?: "primary" | "cta" | "secondary";
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [supported, setSupported] = useState(false);

  // 対応判定はブラウザでしかできないので、描画後に確かめる
  useEffect(() => {
    setSupported(passkeysSupported());
  }, []);

  if (!supported) return null;

  async function handle() {
    setBusy(true);
    const r = await signInWithPasskey();
    if (r.ok) {
      window.location.assign(landing(next));
      return; // 移動するのでボタンは戻さない
    }
    toast({ title: "パスキーで入れませんでした", description: r.message, tone: "danger" });
    setBusy(false);
  }

  return (
    <Button
      variant={variant}
      size="lg"
      block
      loading={busy}
      onClick={handle}
      leftIcon={<KeyRound className="size-[18px]" aria-hidden />}
    >
      パスキーで入る
    </Button>
  );
}
