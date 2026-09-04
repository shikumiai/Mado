"use client";

/**
 * ログインの小窓（LP から開く）。
 *
 * 認証は Supabase の Google に一本化した。next-auth のメール/パスワードと
 * 新規登録フローは撤去。アカウントが無ければ Google で入った時点でその場で
 * 作られる（ログイン ＝ 新規登録）。
 *
 * ※ 割り込みモーダルは今後シートへ寄せる方針（Phase 6 の LP 作り直しで対応）。
 *   ここでは props を保ったまま中身だけ差し替え、既存の呼び出し側を壊さない。
 */

import { useEffect, useState } from "react";
import { signInWithGoogle } from "@/lib/supabase/sign-in";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 後方互換のため残す（現状は Google 一本なので未使用） */
  initialMode?: "select" | "register";
  /** 後方互換のため残す。着地先はコールバック側が会社の有無で自動判定する */
  callbackUrl?: string;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleGoogle() {
    setBusy(true);
    setError("");
    // 着地先はコールバックが会社の有無で判定する（/app か /start）。
    const result = await signInWithGoogle();
    if (!result.ok) {
      setError(result.message ?? "ログインを開始できませんでした。");
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="ログイン"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[rgba(16,21,31,0.5)] backdrop-blur-sm" />

      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-surface text-ink shadow-sh3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold">ログイン</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="-m-1 rounded-md p-1.5 text-ink3 outline-none transition-colors hover:bg-surface2 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="flex flex-col gap-3 px-6 pb-6 pt-2">
          <p className="text-sm leading-relaxed text-ink2">
            Google で入れます。はじめての方も、そのまま始められます。
          </p>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
            >
              {error}
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

          <p className="pt-1 text-center text-[11px] text-ink3">
            サイト作成はすぐに始められます
          </p>
        </div>
      </div>
    </div>
  );
}
