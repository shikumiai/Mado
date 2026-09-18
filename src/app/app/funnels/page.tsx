/**
 * 導線の一覧 /app/funnels（docs/FUNNEL_CHECK_V1.md §6）。
 *
 * 「お客さんが自分のサイトに来るまでの道」を1本ずつ並べる。
 * おためしプランは画面は見えるが作れない。鍵つきで、何があるかだけ見せる。
 *
 * 未ログイン → /auth/login、会社がまだ無い（申込前）→ /start。
 * 権限は DB(RLS) が守る。この画面は出し分けの便宜で、抜け道は作らない。
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyAccount } from "@/lib/auth";
import { listFunnels } from "@/lib/funnels/actions";
import { STATUS_LABELS, STATUS_TONES, formatRunTime } from "@/lib/funnels/status";
import { PLAN_LABELS } from "@/lib/stripe";
import { Card, Badge } from "@/components/ui";
import { Plus, ArrowRight, Lock, Route, Circle } from "lucide-react";

export const metadata = { title: "導線｜Mado" };

const primaryLink =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-accent px-4 text-sm font-medium text-on-accent shadow-sh1 outline-none transition hover:brightness-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:translate-y-px";
const secondaryLink =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-brand/40 px-4 text-sm text-ink outline-none transition hover:border-brand/70 hover:bg-surface2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

/** 999 以上は上限なしとして扱う（プランの「無制限」） */
function limitLabel(limit: number): string {
  if (!Number.isFinite(limit) || limit >= 999) return "何本でも作れます。";
  return `このプランで作れるのは${limit}本までです。`;
}

export default async function FunnelsPage() {
  const account = await getMyAccount();
  if (!account) redirect("/auth/login?next=/app/funnels");
  if (!account.org) redirect("/start");

  const res = await listFunnels();
  if (!res.ok) {
    if (res.reason === "unauthenticated") redirect("/auth/login?next=/app/funnels");
    redirect("/start");
  }

  const { funnels, limit, plan } = res;
  const locked = limit <= 0;
  const canAdd = !locked && (!Number.isFinite(limit) || funnels.length < limit);

  return (
    <div className="flex flex-col gap-8">
      {/* 見出し */}
      <div>
        <p className="text-xs font-medium tracking-wide text-ink3">マイページ</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">導線</h1>
          {locked && <Badge tone="neutral">{PLAN_LABELS[plan]}プラン</Badge>}
        </div>
        <p className="mt-2 text-sm text-ink2">
          X から LINE、サイト、Discord まで。お客さんが通る道を1本ずつ登録すると、どこで切れているかと、何人通ったかが出ます。
        </p>
      </div>

      {/* おためし: 鍵つきで見せる。作れない */}
      {locked ? (
        <Card className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface2 text-ink3">
              <Lock className="size-[18px]" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">導線はおまかせプランで使えます。</p>
              <p className="mt-1 text-sm text-ink2">
                登録した道を上から順に確かめて、切れている段と、その段に何人来たかを出します。追跡リンクも段ごとに発行します。
              </p>
            </div>
          </div>

          {/* 何ができるのかを、鍵つきの見本で見せる */}
          <ul className="flex flex-col gap-2 rounded-lg border border-line bg-surface2/60 p-4">
            {[
              { kind: "X のプロフィール", note: "何人がリンクを踏んだか" },
              { kind: "LINE の友だち追加", note: "URL が生きているか" },
              { kind: "自分の Mado サイト", note: "ボタンの飛び先・連絡先" },
              { kind: "Discord の招待", note: "期限が切れていないか" },
            ].map((row) => (
              <li key={row.kind} className="flex items-center gap-2.5 text-sm text-ink3">
                <Circle className="size-2.5 shrink-0 fill-current opacity-40" aria-hidden />
                <span className="min-w-0 truncate">{row.kind}</span>
                <span className="ml-auto shrink-0 text-xs">{row.note}</span>
              </li>
            ))}
          </ul>

          <div>
            <Link href="/app/billing" className={primaryLink}>
              プランを見る <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </Card>
      ) : funnels.length === 0 ? (
        /* まだ1本も無い */
        <Card className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="grid size-10 place-items-center rounded-full bg-accent-soft text-accent">
            <Route className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm text-ink">まだ導線がありません。</p>
            <p className="mt-1 text-sm text-ink2">
              入口から自分のサイトまでの道を、上から順に足すだけです。
            </p>
          </div>
          <Link href="/app/funnels/new" className={primaryLink}>
            <Plus className="size-4" aria-hidden /> 最初の導線を作る
          </Link>
        </Card>
      ) : (
        <section className="flex flex-col gap-3">
          <ul className="flex flex-col gap-3">
            {funnels.map((f) => {
              const worst = f.lastRun?.worst ?? null;
              return (
                <li key={f.id}>
                  <Link
                    href={`/app/funnels/${f.id}`}
                    className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                  >
                    <Card className="flex flex-wrap items-center justify-between gap-4 transition-colors hover:bg-surface2/50">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-base font-bold">{f.name}</span>
                          {worst && <Badge tone={STATUS_TONES[worst]}>{STATUS_LABELS[worst]}</Badge>}
                        </div>
                        <p className="mt-1 text-xs text-ink3">
                          {f.hopCount}段
                          {f.lastRun?.finishedAt
                            ? ` ・ 最後に確かめたのは ${formatRunTime(f.lastRun.finishedAt)}`
                            : " ・ まだ確かめていません"}
                        </p>
                      </div>
                      <span className={secondaryLink} aria-hidden>
                        開く <ArrowRight className="size-4" />
                      </span>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap items-center gap-3">
            {canAdd ? (
              <Link href="/app/funnels/new" className={primaryLink}>
                <Plus className="size-4" aria-hidden /> 導線を追加
              </Link>
            ) : (
              <p className="text-sm text-ink2">
                {limitLabel(limit)}
                {" "}新しく作るには、いまある導線を削除するか、プランを上げてください。
              </p>
            )}
            {canAdd && <p className="text-xs text-ink3">{limitLabel(limit)}</p>}
          </div>
        </section>
      )}
    </div>
  );
}
