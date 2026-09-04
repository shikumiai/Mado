"use client";

/**
 * タブ。エディタの「見る / 編集 / AI」の切り替えなどに使う。
 * 左右キーで移動でき、選択中がひと目で分かる。中身の出し分けは呼び出し側で行う。
 */

import { useRef } from "react";

export interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  /** タブ一覧の説明（読み上げ用） */
  "aria-label"?: string;
  className?: string;
}

export function Tabs({
  tabs,
  value,
  onValueChange,
  className = "",
  ...aria
}: TabsProps) {
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = (index + dir + tabs.length) % tabs.length;
    onValueChange(tabs[next].value);
    btnRefs.current[next]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={aria["aria-label"]}
      className={[
        "inline-flex items-center gap-1 rounded-pill bg-surface2 p-1",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {tabs.map((tab, i) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            ref={(el) => {
              btnRefs.current[i] = el;
            }}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onValueChange(tab.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={[
              "inline-flex items-center gap-1.5 rounded-pill px-3.5 h-8 text-sm font-medium",
              "transition-[background-color,color,box-shadow] duration-200 ease-brand",
              "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-bg",
              active
                ? "bg-surface text-ink shadow-sh1"
                : "text-ink2 hover:text-ink",
            ].join(" ")}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
