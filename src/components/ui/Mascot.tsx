"use client";

/**
 * マスコット「むすび」の置き場。副操縦士として要所に寄り添う存在。
 *
 * 実画像（チビ和装キツネ）は Lyo が後で用意して差す。
 * それまでは淡いリングで場所だけ確保する（割り込まない・そっと居る）。
 * 装飾なので読み上げからは外す（aria-hidden）。
 */

import Image from "next/image";

export interface MascotProps {
  /** むすびの画像パス。未指定ならリングの place holder を出す */
  src?: string;
  /** 一辺の大きさ(px) */
  size?: number;
  className?: string;
}

export function Mascot({ src, size = 64, className = "" }: MascotProps) {
  return (
    <div
      aria-hidden
      className={["relative shrink-0 select-none", className]
        .filter(Boolean)
        .join(" ")}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          width={size}
          height={size}
          className="rounded-pill object-contain"
        />
      ) : (
        <span
          className="block size-full rounded-pill"
          style={{
            background:
              "radial-gradient(circle at 50% 40%, var(--accent-soft), transparent 70%)",
            boxShadow: "0 0 0 1px var(--line), inset 0 0 0 1px var(--line)",
          }}
        />
      )}
    </div>
  );
}
