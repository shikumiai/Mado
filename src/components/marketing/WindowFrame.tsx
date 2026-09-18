/**
 * 窓枠。中に入れたもの（顧客サイトのライブプレビューや画像）を
 * 「窓から見えている実物」として見せる Mado の視覚言語。
 *
 * ブラウザのモック（信号ボタン＋URL欄）にはしない。
 * 木の枠・窓の掛け金（latch）・下枠（sill）で"窓"を表し、中身は素通しの眺めにする。
 * 装飾の光は呼び出し側で window-light を後ろに敷く。
 */

import type { ReactNode } from "react";

export function WindowFrame({
  children,
  caption,
  className = "",
}: {
  children: ReactNode;
  /** 下枠に添える一言（「○○様のサイト（プレビュー）」など） */
  caption?: ReactNode;
  className?: string;
}) {
  return (
    <figure className={["relative", className].filter(Boolean).join(" ")}>
      {/* 枠（木・面材のニュアンス） */}
      <div className="relative rounded-xl border border-line bg-surface2 p-2.5 shadow-sh3">
        {/* 掛け金（latch）: 右中央の小さな暖色の金具 */}
        <span
          aria-hidden
          className="absolute right-0 top-1/2 z-10 h-9 w-[6px] -translate-y-1/2 translate-x-[3px] rounded-full bg-accent shadow-sh1"
        />
        {/* ガラス面（素通しの眺め） */}
        <div className="relative overflow-hidden rounded-lg border border-line bg-surface">
          {children}
          {/* ガラスの映り込み（ごく淡く・静止・操作を邪魔しない） */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 34%)",
            }}
          />
        </div>
      </div>

      {/* 下枠（sill）+ キャプション */}
      {caption && (
        <figcaption className="mx-3 flex items-center gap-2 rounded-b-lg border border-t-0 border-line bg-surface2 px-4 py-2 text-xs text-ink2 shadow-sh1">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
