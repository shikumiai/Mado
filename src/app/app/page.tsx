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
import { loadSiteForEdit } from "@/lib/site-editor";
import { onboardingState } from "@/lib/onboarding";
import { runSiteCheck } from "@/lib/funnels/site-check";
import { countNewInquiries } from "@/lib/inquiries";
import { Card, Badge } from "@/components/ui";
import {
  ExternalLink, Pencil, Plus, ArrowRight, ShieldCheck, KeyRound, Sparkles,
  Route, Lock, Check, AlertCircle, MinusCircle, Inbox, Camera,
} from "lucide-react";

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

  // 公開したあと、次にやることを1つだけ出す（docs/ONBOARDING_V1.md）。
  // サイトが1つのうちは、そのサイトについて出す。
  const mainSite = sites[0] ?? null;
  const loaded = mainSite ? await loadSiteForEdit(mainSite.id) : null;
  const todo = loaded?.ok ? onboardingState(loaded.config) : null;
  const next = todo?.next ?? null;
  const nextHref =
    mainSite && next
      ? ["hero-photo", "rest-photos"].includes(next.id)
        ? `/app/sites/${mainSite.id}/photos`
        : `/app/sites/${mainSite.id}/editor${next.anchor ? `?focus=${encodeURIComponent(next.anchor)}` : ""}`
      : "";

  // 公開前チェック（docs/FUNNEL_CHECK_V1.md §7）。設定を読むだけなので全プランで出せる。
  const siteChecks = loaded?.ok ? runSiteCheck(loaded.config) : null;
  const siteChecksOk = siteChecks?.filter((c) => c.status === "ok").length ?? 0;

  // 導線（§6・§9）。おためしは画面は見えるが作れない
  const funnelsLocked = plan === "otameshi";

  // 届いた問い合わせのうち、まだ対応していない数
  const newInquiries = await countNewInquiries();

  return (
    <div className="flex flex-col gap-8">
      {/* 見出し: 会社名 + プランのバッジ */}
      <div>
        <p className="text-xs font-medium tracking-wide text-ink3">マイページ</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">{org.name}</h1>
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

      {/* 次にやること: 全部は並べず、いちばん効く1つだけ出す */}
      {todo && next && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink2">次にやること</h2>
          <Card className="flex flex-col gap-4">
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-xs text-ink3">サイトの仕上がり</p>
                <p className="tnum text-xs text-ink3">
                  {todo.done} / {todo.total}
                </p>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface2">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-500"
                  style={{ width: `${Math.round((todo.done / todo.total) * 100)}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-base font-bold text-ink sm:text-lg">{next.title}</p>
                <p className="mt-1 text-sm text-ink2">{next.detail}</p>
              </div>
              <Link href={nextHref} className={primaryLink}>
                <Pencil className="size-4" aria-hidden /> 直す
              </Link>
            </div>
          </Card>
        </section>
      )}

      {todo?.complete && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink2">次にやること</h2>
          <Card className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                <Sparkles className="size-[18px]" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">サイトはひととおり仕上がっています。</p>
                <p className="mt-0.5 text-sm text-ink2">
                  写真も文章も自分のものに入れ替わりました。あとはいつでも直せます。
                </p>
              </div>
            </div>
            <Link href={`/app/sites/${mainSite?.id}/editor`} className={secondaryLink}>
              編集する <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Card>
        </section>
      )}

      {/* 届いた問い合わせ: 未対応があれば先に目に入る位置に */}
      {sites.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink2">届いた問い合わせ</h2>
          <Card className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-full ${
                  newInquiries > 0 ? "bg-accent-soft text-accent" : "bg-surface2 text-ink3"
                }`}
              >
                <Inbox className="size-[18px]" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">
                  {newInquiries > 0 ? `未対応が ${newInquiries} 件あります。` : "未対応の問い合わせはありません。"}
                </p>
                <p className="mt-0.5 text-sm text-ink2">
                  サイトのフォームから届いたものは、ここと登録メールの両方に届きます。
                </p>
              </div>
            </div>
            <Link href="/app/inquiries" className={newInquiries > 0 ? primaryLink : secondaryLink}>
              一覧を見る <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Card>
        </section>
      )}

      {/* 公開前チェック: 設定を読んで分かることだけを、項目ごとに出す */}
      {siteChecks && mainSite && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink2">公開前チェック</h2>
          <Card className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm text-ink2">サイトの中を確かめました。</p>
              <p className="tnum text-xs text-ink3">
                {siteChecksOk} / {siteChecks.length}
              </p>
            </div>

            <ul className="flex flex-col gap-2.5">
              {siteChecks.map((c) => (
                <li key={c.name} className="flex items-start gap-2.5">
                  {c.status === "ok" ? (
                    <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  ) : c.status === "ng" ? (
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
                  ) : (
                    <MinusCircle className="mt-0.5 size-4 shrink-0 text-ink3" aria-hidden />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm text-ink">{c.name}</p>
                    {c.reason && <p className="mt-0.5 text-sm text-ink2">{c.reason}</p>}
                  </div>
                </li>
              ))}
            </ul>

            {siteChecksOk < siteChecks.length && (
              <div>
                <Link href={`/app/sites/${mainSite.id}/editor`} className={secondaryLink}>
                  <Pencil className="size-4" aria-hidden /> 直す
                </Link>
              </div>
            )}
          </Card>
        </section>
      )}

      {/* 自分のサイト一覧 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink2">あなたのサイト</h2>

        {sites.length === 0 ? (
          <Card className="flex flex-col items-center gap-4 py-12 text-center">
            <div>
              <p className="text-sm text-ink">まだサイトがありません。</p>
              <p className="mt-1 text-sm text-ink2">見本を選び、写真や文章を自分のものに入れ替えて公開できます。</p>
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
                      <Link href={`/app/sites/${site.id}/photos`} className={`${secondaryLink} min-h-11`}>
                        <Camera className="size-4" aria-hidden /> 写真を入れ替える
                      </Link>
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

      {/* 導線: サイトまでの道 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink2">導線</h2>
        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={[
                "grid size-9 shrink-0 place-items-center rounded-full",
                funnelsLocked ? "bg-surface2 text-ink3" : "bg-accent-soft text-accent",
              ].join(" ")}
            >
              {funnelsLocked ? (
                <Lock className="size-[18px]" aria-hidden />
              ) : (
                <Route className="size-[18px]" aria-hidden />
              )}
            </span>
            <div>
              <p className="text-sm font-medium text-ink">サイトまでの道</p>
              <p className="mt-0.5 text-sm text-ink2">
                {funnelsLocked
                  ? "おまかせプランで使えます。どこで道が切れているかが分かります。"
                  : "X や LINE からサイトまで、どこで切れているかと、何人通ったかが出ます。"}
              </p>
            </div>
          </div>
          <Link href="/app/funnels" className={secondaryLink}>
            導線を見る <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Card>
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
