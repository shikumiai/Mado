"use client";

/**
 * ボタン。信頼できる部品カタログの中心。
 *
 * variant:
 *   primary   … オレンジ塗り（主要な操作）
 *   cta       … アクセントグラデ（申し込み等の「印」だけ）
 *   secondary … ネイビーの枠線（対の操作）
 *   ghost     … 枠なし（控えめな操作）
 *
 * どのテーマでも読める・キーボードで押せる・focus の枠が出る・
 * loading 中は自動で押せなくなる。
 */

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "cta" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** 角を丸めて薬（ピル）形にする */
  pill?: boolean;
  /** 読み込み中。スピナーを出し、押せなくする */
  loading?: boolean;
  /** 横幅いっぱいに広げる */
  block?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap select-none " +
  "transition-[background-color,color,box-shadow,transform,border-color] duration-200 ease-brand " +
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none active:translate-y-px";

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-on-accent shadow-sh1 hover:brightness-105 active:brightness-95",
  cta: "grad-accent text-white shadow-sh2 hover:brightness-105 active:brightness-95",
  secondary:
    "bg-transparent text-ink border border-brand/40 hover:bg-surface2 hover:border-brand/70",
  ghost: "bg-transparent text-ink2 hover:bg-surface2 hover:text-ink",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      pill = false,
      loading = false,
      block = false,
      leftIcon,
      rightIcon,
      className = "",
      children,
      disabled,
      type = "button",
      ...rest
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
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
        {...rest}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);
