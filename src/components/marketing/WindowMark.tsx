/**
 * Mado のロゴマーク。「窓（まど）」= 枠 + 桟（さん）で4つの窓ガラス。
 * 左上のガラスに暖色の光を差して「窓から光が入る」世界観を1マークに込める。
 * 面は淡い砂色、枠と桟は濃紺、光だけ暖色オレンジ。装飾なので読み上げから外す。
 */

export function WindowMark({ className = "size-8" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={["inline-flex shrink-0", className].filter(Boolean).join(" ")}
    >
      <svg viewBox="0 0 32 32" fill="none" className="size-full">
        {/* ガラス面 */}
        <rect x="5" y="4" width="22" height="24" rx="3.5" fill="var(--surface2)" />
        {/* 左上のガラスに差す光 */}
        <path d="M6.6 5.6h7.9v9.9H6.6z" fill="var(--accent)" opacity="0.9" />
        <path d="M6.6 5.6h7.9v9.9H6.6z" fill="var(--accent-soft)" opacity="0.35" />
        {/* 枠 */}
        <rect
          x="5"
          y="4"
          width="22"
          height="24"
          rx="3.5"
          stroke="var(--brand)"
          strokeWidth="2"
        />
        {/* 桟（十字） */}
        <path
          d="M16 5v22M6 16h20"
          stroke="var(--brand)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
