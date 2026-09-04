/**
 * 会員エリア /app の共通の枠（ヘッダー + 中央寄せの本文）。
 *
 * データは取らない・出し分けもしない純粋な見た目の枠。認証チェックと
 * リダイレクトは各ページが受け持つ（ページが redirect すればこの枠は表示されない）。
 * マスコット「むすび」を左上にそっと置いて、割り込まない常在の存在にする。
 */

import Link from "next/link";
import { Mascot, ThemeToggle } from "@/components/ui";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3">
          <Link
            href="/app"
            className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="マイページのトップへ"
          >
            <Mascot size={28} />
            <span className="text-base font-bold tracking-tight">Mado</span>
          </Link>
          <div className="flex items-center gap-1.5">
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

      <main className="mx-auto max-w-3xl px-5 py-8 pb-24">{children}</main>
    </div>
  );
}
