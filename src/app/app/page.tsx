/**
 * 会員ホーム /app — 「自分のサイト・直す・支払い」を1枚に畳んだダッシュボード。
 *
 * 未ログイン → /auth/login、会社がまだ無い（申込前）→ /start へ送る。
 * 権限は DB(RLS) が守る。この画面は出し分けの便宜で、抜け道は作らない。
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyAccount } from "@/lib/auth";
import { customerSiteUrl, customerSiteLabel } from "@/lib/resolve-site";
import { PLAN_LABELS, PLAN_PRICES, normalizePlanId } from "@/lib/stripe";
import { Card, Badge } from "@/components/ui";
import { ExternalLink, Pencil, Plus, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";

export const metadata = { title: "マイページ｜Mado" };

/** サイトの状態 → 表示ラベルとバッジの色 */
const SITE_STATUS: Record<string, { label: string; tone: "success" | "neutral" | "danger" }> = {
  live: { label: "公開中", tone: "success" },
  draft: { label: "準備中", tone: "neutral" },
  suspended: { label: "停止", tone: "danger" },
};

/* リンクをボタンの見た目にする（Button は client なので、遷移はリンクを装う） */
const primaryLink =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-accent px-4 text-sm font-medium text-on-accent shadow-sh1 outline-none transition hover:brightness-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:translate-y-px";
const secondaryLink =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-brand/40 px-4 text-sm text-ink outline-none transition hover:border-brand/70 hover:bg-surface2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

export default async function AppHome() {
  const account = await getMyAccount();
  if (!account) redirect("/auth/login?next=/app");
  if (!account.org) redirect("/start");

  const { org, sites, isPlatformAdmin } = account;
  const plan = normalizePlanId(org.plan);

  return (
    <div className="flex flex-col gap-8">
      {/* 見出し: 会社名 + プランのバッジ */}
      <div>
        <p className="text-xs font-medium tracking-wide text-ink3">マイページ</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-2xl font-bold">{org.name}</h1>
          <Badge tone="accent">{PLAN_LABELS[plan]}プラン</Badge>
          {isPlatformAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 rounded-md text-sm text-ink2 outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ShieldCheck className="size-4" aria-hidden /> 管理画面
            </Link>
          )}
        </div>
      </div>

      {/* 自分のサイト一覧 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink2">あなたのサイト</h2>

        {sites.length === 0 ? (
          <Card className="flex flex-col items-center gap-4 py-12 text-center">
            <div>
              <p className="text-sm text-ink">まだサイトがありません。</p>
              <p className="mt-1 text-sm text-ink2">写真を送るだけで、あとは全部おまかせです。</p>
            </div>
            <Link href="/start" className={primaryLink}>
              <Plus className="size-4" aria-hidden /> サイトを作る
            </Link>
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {sites.map((site) => {
              const st = SITE_STATUS[site.status] ?? { label: site.status, tone: "neutral" as const };
              return (
                <li key={site.id}>
                  <Card className="flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-base font-bold">{site.slug}</span>
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </div>
                      <p className="tnum mt-1 break-all text-xs text-ink3">
                        {customerSiteLabel(site.slug)}
                      </p>
                    </div>

                    <div className="flex flex-shrink-0 flex-wrap gap-2">
                      {site.status === "live" && (
                        <a
                          href={customerSiteUrl(site.slug)}
                          target="_blank"
                          rel="noreferrer"
                          className={secondaryLink}
                        >
                          <ExternalLink className="size-4" aria-hidden /> サイトを見る
                        </a>
                      )}
                      <Link href={`/app/sites/${site.id}/editor`} className={primaryLink}>
                        <Pencil className="size-4" aria-hidden /> 編集する
                      </Link>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* プラン概要 + 支払いへ */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink2">プランと支払い</h2>
        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-ink2">現在のプラン</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-bold">{PLAN_LABELS[plan]}</span>
              <span className="tnum text-sm text-ink2">{PLAN_PRICES[plan]}／月</span>
            </p>
          </div>
          <Link href="/app/billing" className={secondaryLink}>
            支払い・プランを見る <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Card>
      </section>

      {/* ログインの安全性（パスキー） */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink2">ログインの安全性</h2>
        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
              <KeyRound className="size-[18px]" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-medium text-ink">パスキー</p>
              <p className="mt-0.5 text-sm text-ink2">この端末を鍵にして、パスワードなしで入れます。</p>
            </div>
          </div>
          <Link href="/app/security" className={secondaryLink}>
            設定する <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Card>
      </section>
    </div>
  );
}
