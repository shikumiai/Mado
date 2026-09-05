/**
 * 公開ページ共通のフッター。会社情報・各ページへのリンク・外部発信（note / X）。
 * 純粋な表示だけなのでクライアント指定は不要。
 */

import Link from "next/link";
import { WindowMark } from "./WindowMark";

const PRODUCT_LINKS = [
  { label: "料金", href: "/pricing" },
  { label: "サイトを作る", href: "/start" },
  { label: "ログイン", href: "/auth/login" },
];

const LEGAL_LINKS = [
  { label: "特定商取引法に基づく表示", href: "/legal" },
  { label: "プライバシーポリシー", href: "/privacy" },
];

const SOCIAL_LINKS = [
  { label: "note", href: "https://note.com/shikumiai" },
  { label: "X", href: "https://x.com/Lyo_shikumiai" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* ブランド */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <WindowMark className="size-8" />
              <div className="leading-tight">
                <p className="text-base font-bold text-ink">Mado</p>
                <p className="text-[11px] tracking-wide text-ink3">
                  by Lyo Vision
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink2">
              写真を送るだけ。あとは全部おまかせのホームページづくり。
            </p>
          </div>

          {/* サービス */}
          <nav aria-label="サービス">
            <p className="text-xs font-medium tracking-wide text-ink3">
              サービス
            </p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink2 transition-colors hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 規約 */}
          <nav aria-label="規約">
            <p className="text-xs font-medium tracking-wide text-ink3">規約</p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink2 transition-colors hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 発信 */}
          <nav aria-label="発信">
            <p className="text-xs font-medium tracking-wide text-ink3">発信</p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {SOCIAL_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-ink2 transition-colors hover:text-ink"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-ink3">
            © {year} Lyo Vision. All rights reserved.
          </p>
          <p className="text-xs text-ink3">
            制作費0円・月額0円から・独自ドメイン全プラン対応
          </p>
        </div>
      </div>
    </footer>
  );
}
