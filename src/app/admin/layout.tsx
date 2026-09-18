/**
 * 管理エリア /admin の共通の枠（ヘッダー + 中央寄せの本文）。
 *
 * 認証・リダイレクトは各ページが受け持つ（ページが redirect すればこの枠は出ない）。
 * 見た目は会員エリア /app と同じ言語で、幅だけ一覧向けに広めにとる。
 * 旧デザイン（ダークのサイドバー）は作り替えてこの落ち着いた枠にした。
 */

import Link from "next/link";
import { ThemeToggle } from "@/components/ui";
import { WindowMark } from "@/components/marketing/WindowMark";
import { ArrowLeft } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="管理のトップへ"
          >
            <WindowMark className="size-8" />
            <span className="font-serif text-xl font-bold tracking-tight">Mado</span>
            <span className="rounded-pill bg-surface2 px-2 py-0.5 text-xs font-medium text-ink2">
              管理
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-ink2 outline-none transition hover:bg-surface2 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="size-4" aria-hidden /> マイページ
            </Link>
            <ThemeToggle />
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-md px-3 py-1.5 text-sm text-ink2 outline-none transition hover:bg-surface2 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 pb-24">{children}</main>
    </div>
  );
}
