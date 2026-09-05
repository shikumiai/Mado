"use client";

/**
 * 認証まわりの画面（ログイン・新規登録・再設定）の共通の枠。
 *
 * 世界観は Mado ＝ 窓。あたたかいクリームの地に、窓から光が差す。
 * 見出しは明朝で職人の実直さを出し、操作は迷わないように縦に一列で置く。
 * 割り込む演出はせず、ページを開いた1回だけそっと立ち上がる（mado-load）。
 */

import { ThemeToggle } from "@/components/ui";

/** Mado の印＝光の差す窓（ラインアート・装飾） */
export function WindowMark({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
      className="drop-shadow-[0_6px_16px_rgba(232,135,58,0.28)]"
    >
      <defs>
        <linearGradient id="mado-auth-pane" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent-soft)" />
          <stop offset="1" stopColor="var(--surface)" />
        </linearGradient>
      </defs>
      {/* 窓の奥から差す暖色の光 */}
      <circle cx="32" cy="27" r="27" fill="var(--accent)" opacity="0.15" />
      {/* 窓枠と4枚のガラス */}
      <rect
        x="12"
        y="8"
        width="40"
        height="44"
        rx="4"
        fill="url(#mado-auth-pane)"
        stroke="var(--brand)"
        strokeWidth="2.5"
      />
      {/* 格子（縦横の桟） */}
      <path d="M32 9 V51 M13 30 H51" stroke="var(--brand)" strokeWidth="2.5" />
      {/* 光の筋（左上のガラスに差し込む） */}
      <path
        d="M18 15 L26 15 M18 21 L23 21"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.75"
      />
      {/* 窓台 */}
      <path d="M9 52 H55" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export interface AuthShellProps {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  /** カードの下に添える案内（リンクなど） */
  footer?: React.ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-bg px-5 py-12">
      {/* 上方から差す暖色の光（装飾） */}
      <div aria-hidden className="window-light pointer-events-none absolute inset-x-0 top-0 h-[48vh]" />
      <div aria-hidden className="paper-grain pointer-events-none absolute inset-0 opacity-60" />

      {/* テーマ切替は隅にそっと置く（割り込まない） */}
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="mado-load relative z-10 w-full max-w-md">
        <div className="mb-7 flex flex-col items-center text-center">
          <WindowMark size={64} />
          <h1 className="mt-5 font-serif text-[26px] font-medium leading-tight text-ink">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2.5 max-w-[21rem] text-sm leading-relaxed text-ink2">{subtitle}</p>
          )}
        </div>

        <div className="rounded-xl border border-line bg-surface/95 p-6 shadow-sh2 backdrop-blur-sm sm:p-7">
          {children}
        </div>

        {footer && <div className="mt-5 text-center text-sm leading-relaxed text-ink2">{footer}</div>}
      </div>
    </main>
  );
}

/** 「または」の区切り線。方法の切れ目に薄く置く */
export function AuthDivider({ label = "または" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-line" />
      <span className="text-xs text-ink3">{label}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
