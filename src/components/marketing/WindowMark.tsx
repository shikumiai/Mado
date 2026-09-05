/**
 * Mado のロゴマーク。「窓（まど）」を思わせる面 + 桟（さん）の記号。
 * 差し色オレンジは印だけに使う方針に沿って、面は淡いオレンジ・線はオレンジ。
 * 装飾なので読み上げからは外す。
 */

export function WindowMark({ className = "size-8" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={["inline-flex shrink-0", className].filter(Boolean).join(" ")}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-full">
        <rect
          x="3.25"
          y="3.25"
          width="17.5"
          height="17.5"
          rx="5"
          fill="var(--accent-soft)"
          stroke="var(--accent)"
          strokeWidth="1.6"
        />
        <path
          d="M12 4.5v15M4.5 12h15"
          stroke="var(--accent)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
