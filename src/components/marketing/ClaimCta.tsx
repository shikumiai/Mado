"use client";

/**
 * 「サイトを作る」ボタン。
 *
 * トップページには名前を決める入力がある。そこにいるときは画面を移さず、
 * その入力まで運んでカーソルを合わせる。別のページから押したときはトップの入力へ移る。
 * 動きを減らす設定では、するっと動かさずその場に飛ぶ。
 */

import type { MouseEvent, ReactNode } from "react";
import { LinkButton } from "./LinkButton";
import { CLAIM_ANCHOR_ID, CLAIM_INPUT_ID } from "./NameClaim";

export function ClaimCta({
  variant = "cta",
  size = "md",
  block = false,
  className = "",
  onNavigate,
  rightIcon,
  children,
}: {
  variant?: "primary" | "cta" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  block?: boolean;
  className?: string;
  /** 押したときに先にやること（スマホのメニューを閉じる等） */
  onNavigate?: () => void;
  rightIcon?: ReactNode;
  children: ReactNode;
}) {
  function handle(e: MouseEvent<HTMLAnchorElement>) {
    onNavigate?.();

    const input = document.getElementById(CLAIM_INPUT_ID);
    if (!input) return; // このページに入力が無い → トップの入力へ移る

    e.preventDefault();
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    document
      .getElementById(CLAIM_ANCHOR_ID)
      ?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "center" });
    (input as HTMLInputElement).focus({ preventScroll: true });
  }

  return (
    <LinkButton
      href={`/#${CLAIM_ANCHOR_ID}`}
      variant={variant}
      size={size}
      block={block}
      className={className}
      rightIcon={rightIcon}
      onClick={handle}
    >
      {children}
    </LinkButton>
  );
}

export default ClaimCta;
