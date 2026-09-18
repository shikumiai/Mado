"use client";

/**
 * バッジ。状態を小さなピルで示す（公開中・準備中・停止中 など）。
 * 色は状態ごとに決め、淡い地に濃い文字で読ませる。
 */

type Tone = "neutral" | "accent" | "success" | "warn" | "danger" | "info";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneVar: Record<Tone, string> = {
  neutral: "var(--ink2)",
  accent: "var(--accent)",
  success: "var(--success)",
  warn: "var(--warn)",
  danger: "var(--danger)",
  info: "var(--info)",
};

export function Badge({
  tone = "neutral",
  className = "",
  style,
  children,
  ...rest
}: BadgeProps) {
  const c = toneVar[tone];
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-xs font-medium",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        color: c,
        backgroundColor: `color-mix(in srgb, ${c} 14%, transparent)`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
