"use client";

/**
 * カード。中身をひとまとまりに見せる面。
 *   default … 面（surface）+ 淡い枠 + 影
 *   glass   … 透け感のある面（差し色カードにだけ薄く使う）
 */

import { forwardRef } from "react";

type Variant = "default" | "glass";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  /** 内側の余白を付ける（既定 true） */
  padded?: boolean;
}

const variants: Record<Variant, string> = {
  default: "bg-surface border border-line shadow-sh2",
  glass:
    "bg-surface/60 border border-line backdrop-blur-md shadow-sh2 supports-[backdrop-filter]:bg-surface/50",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "default", padded = true, className = "", children, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={[
        "rounded-xl text-ink",
        variants[variant],
        padded ? "p-5" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
});
