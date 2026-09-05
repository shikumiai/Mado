"use client";

/**
 * よくある質問。ひとつずつ開いて読むアコーディオン。
 * 高さは 0fr → 1fr のグリッドで伸縮させる（動きを減らす設定なら一瞬で開く）。
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string;
}

export function Faq({
  items,
  className = "",
}: {
  items: FaqItem[];
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className={["flex flex-col gap-3", className].filter(Boolean).join(" ")}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-line bg-surface shadow-sh1"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left outline-none transition-colors hover:bg-surface2/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            >
              <span className="text-sm font-medium text-ink sm:text-base">
                {it.q}
              </span>
              <ChevronDown
                className={`size-5 shrink-0 text-ink3 transition-transform duration-200 ease-brand ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-200 ease-brand"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm leading-relaxed text-ink2">
                  {it.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
