"use client";

/**
 * 公開ページ共通のヘッダー。ロゴ・ナビ・ログイン・CTA・テーマ切替。
 * 画面上に固定して薄く透ける。スマホではメニューを下からのシートで開く（割り込まない）。
 */

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { ThemeToggle, Sheet } from "@/components/ui";
import { LinkButton } from "./LinkButton";
import { WindowMark } from "./WindowMark";

/** ページ内の見出しへ飛ぶリンク。トップ以外からはトップへ戻ってから移動する。 */
const NAV = [
  { label: "特徴", href: "/#features" },
  { label: "テンプレート", href: "/#templates" },
  { label: "料金", href: "/pricing" },
  { label: "よくある質問", href: "/#faq" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <WindowMark className="size-8" />
      <span className="flex flex-col leading-tight">
        <span className="text-base font-bold tracking-wide text-ink">Mado</span>
        <span className="text-[10px] tracking-wide text-ink3">
          by Lyo Vision
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-md supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />

        <nav className="hidden items-center gap-7 md:flex" aria-label="メイン">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm text-ink2 transition-colors hover:text-ink"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link
            href="/auth/login"
            className="text-sm text-ink2 transition-colors hover:text-ink"
          >
            ログイン
          </Link>
          <LinkButton href="/start" variant="cta" size="sm" pill>
            サイトを作る
          </LinkButton>
        </div>

        {/* スマホ */}
        <div className="flex items-center gap-1.5 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label="メニューを開く"
            onClick={() => setOpen(true)}
            className="rounded-md p-2 text-ink2 outline-none transition-colors hover:bg-surface2 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        side="bottom"
        title="メニュー"
      >
        <nav className="flex flex-col gap-1" aria-label="メイン（スマホ）">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-3 text-ink transition-colors hover:bg-surface2"
            >
              {n.label}
            </a>
          ))}
          <Link
            href="/auth/login"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-3 text-ink transition-colors hover:bg-surface2"
          >
            ログイン
          </Link>
        </nav>
        <div className="mt-3">
          <LinkButton href="/start" variant="cta" block pill>
            サイトを作る
          </LinkButton>
        </div>
      </Sheet>
    </header>
  );
}
