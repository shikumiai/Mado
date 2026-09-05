/**
 * リンクとして働くボタン。見た目は共通の Button に合わせ、中身は <a>（Next Link）。
 * 「サイトを作る」「料金を見る」など、押すと別の画面へ移る CTA に使う。
 * 操作用の Button（送信・保存など）と役割で分ける。
 */

import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "cta" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap select-none " +
  "transition-[background-color,color,box-shadow,transform,border-color] duration-200 ease-brand " +
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg " +
  "active:translate-y-px";

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-on-accent shadow-sh1 hover:brightness-105 active:brightness-95",
  cta: "grad-accent text-white shadow-sh2 hover:brightness-105 active:brightness-95",
  secondary:
    "bg-transparent text-ink border border-brand/40 hover:bg-surface2 hover:border-brand/70",
  ghost: "bg-transparent text-ink2 hover:bg-surface2 hover:text-ink",
};

export interface LinkButtonProps {
  href: string;
  variant?: Variant;
  size?: Size;
  /** 角を丸めて薬（ピル）形にする */
  pill?: boolean;
  /** 横幅いっぱいに広げる */
  block?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  pill = false,
  block = false,
  leftIcon,
  rightIcon,
  className = "",
  children,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={[
        base,
        sizes[size],
        variants[variant],
        pill ? "rounded-pill" : "rounded-md",
        block ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
}
