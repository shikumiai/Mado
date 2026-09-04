"use client";

/**
 * テーマ切替。システム / 明るい / 暗い の3択。
 * <html> の data-theme を切り替え、選択を localStorage に覚える（theme.tsx）。
 */

import { Monitor, Sun, Moon } from "lucide-react";
import { useTheme, type ThemeChoice } from "./theme";

const OPTIONS: { value: ThemeChoice; label: string; icon: React.ReactNode }[] = [
  { value: "system", label: "システム", icon: <Monitor className="size-4" aria-hidden /> },
  { value: "light", label: "明るい", icon: <Sun className="size-4" aria-hidden /> },
  { value: "dark", label: "暗い", icon: <Moon className="size-4" aria-hidden /> },
];

export function ThemeToggle({
  className = "",
  showLabel = false,
}: {
  className?: string;
  /** 文字ラベルも見せる（既定はアイコンのみ） */
  showLabel?: boolean;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="テーマの切り替え"
      className={[
        "inline-flex items-center gap-0.5 rounded-pill bg-surface2 p-0.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {OPTIONS.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            title={opt.label}
            onClick={() => setTheme(opt.value)}
            className={[
              "inline-flex items-center gap-1.5 rounded-pill h-8 px-2.5 text-xs font-medium",
              "transition-[background-color,color,box-shadow] duration-200 ease-brand",
              "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-bg",
              active ? "bg-surface text-ink shadow-sh1" : "text-ink2 hover:text-ink",
            ].join(" ")}
          >
            {opt.icon}
            {showLabel && <span>{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
