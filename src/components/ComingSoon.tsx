/**
 * 「準備中」の置きページ。
 *
 * 旧・会員エリア（next-auth 時代）は作り直しの最中。認証を Supabase に
 * 一本化する Phase で中身を新しく作る。それまではここで場所だけ保ち、
 * ビルドを通す。新デザインのトークンで表示する。
 */

import Link from "next/link";

export function ComingSoon({
  title = "準備中です",
  message = "この画面は作り直しの最中です。もうしばらくお待ちください。",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-bg px-6 py-16">
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-8 text-center shadow-sh2">
        <p className="text-xs font-medium tracking-wide text-accent">Mado</p>
        <h1 className="mt-3 text-xl font-bold text-ink">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink2">{message}</p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-brand/40 px-4 text-sm font-medium text-ink outline-none transition-colors hover:bg-surface2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            トップへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
