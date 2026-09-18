/**
 * 支払い・透明性 /app/billing
 *
 * SaaS決済憲章「透明性を第1級」: 今のプラン・月額・次回の請求・今月の使用状況を
 * その場で見せ、使う人が自分で管理できる状態にする。
 * プラン変更（無料↔有料・アップ/ダウン）は同じ手軽さで並べ（PlanChange）、
 * お支払い方法の変更・解約・領収書は Stripe のカスタマーポータルへ寄せる。
 *
 * 未ログイン → /auth/login、会社がまだ無い → /start。権限は DB(RLS) が守る。
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyAccount } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/ssr";
import { getStripe, isStripeTestMode } from "@/lib/stripe-server";
import {
  PLAN_LABELS,
  PLAN_PRICES,
  PLAN_EDIT_LIMITS,
  normalizePlanId,
} from "@/lib/stripe";
import { Card, Badge } from "@/components/ui";
import { BillingPortalButton } from "./BillingPortalButton";
import { PlanChange } from "./PlanChange";
import { ArrowLeft, Receipt, Gauge, CreditCard, LayoutGrid } from "lucide-react";

export const metadata = { title: "支払い・プラン｜Mado" };

const backLink =
  "inline-flex items-center gap-1.5 rounded-md text-sm text-ink2 outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-ring";

/** 今の期間キー（ai_edit_usage.period と同じ 'YYYY-MM'） */
function currentPeriod(now = new Date()): { key: string; label: string } {
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  return { key: `${y}-${String(m).padStart(2, "0")}`, label: `${y}年${m}月` };
}

function formatJpDate(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default async function BillingPage() {
  const account = await getMyAccount();
  if (!account) redirect("/auth/login?next=/app/billing");
  if (!account.org) redirect("/start");

  const { org, sites } = account;
  const plan = normalizePlanId(org.plan);
  const limit = PLAN_EDIT_LIMITS[plan];
  const period = currentPeriod();
  const testMode = isStripeTestMode();

  // 本人のセッション（RLS）で、Stripe連携の有無と今月の使用状況を引く
  const supabase = await createServerSupabase();

  // Stripe の顧客・サブスクID（getMyAccount には含めていないので個別に取る）
  let stripeCustomerId: string | null = null;
  let stripeSubscriptionId: string | null = null;
  if (supabase) {
    const { data: orgRows } = await supabase
      .from("orgs")
      .select("stripe_customer_id, stripe_subscription_id")
      .limit(1);
    const row = orgRows?.[0] as
      | { stripe_customer_id: string | null; stripe_subscription_id: string | null }
      | undefined;
    stripeCustomerId = row?.stripe_customer_id ?? null;
    stripeSubscriptionId = row?.stripe_subscription_id ?? null;
  }
  const isPaid = Boolean(stripeCustomerId);

  // 今月の AI 編集の使用回数（このプランのサイト分を合算）
  let usedThisMonth = 0;
  const siteIds = sites.map((s) => s.id);
  if (supabase && siteIds.length > 0) {
    const { data: usageRows } = await supabase
      .from("ai_edit_usage")
      .select("used")
      .in("site_id", siteIds)
      .eq("period", period.key);
    const rows = (usageRows ?? []) as { used: number | null }[];
    usedThisMonth = rows.reduce((n, r) => n + (r.used ?? 0), 0);
  }

  // 次回の請求日（取れる範囲で）。取れなくても画面は成り立たせる
  let nextBillingDate: string | null = null;
  if (isPaid && stripeSubscriptionId) {
    const stripe = getStripe();
    if (stripe) {
      try {
        const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        const sec = sub.items.data[0]?.current_period_end;
        if (typeof sec === "number") nextBillingDate = formatJpDate(new Date(sec * 1000));
      } catch (err) {
        console.error("[billing] 次回請求日の取得に失敗", err);
      }
    }
  }

  const unlimited = limit >= 999;
  const noAiEdit = limit === 0;
  const usagePct = unlimited || limit === 0 ? 0 : Math.min(100, Math.round((usedThisMonth / limit) * 100));
  const overLimit = !unlimited && limit > 0 && usedThisMonth >= limit;

  return (
    <div className="flex flex-col gap-7">
      <div>
        <Link href="/app" className={backLink}>
          <ArrowLeft className="size-4" aria-hidden /> マイページに戻る
        </Link>
        <h1 className="mt-3 font-serif text-2xl font-bold">支払い・プラン</h1>
        <p className="mt-1 text-sm text-ink2">{org.name}</p>
      </div>

      {/* 現在のプラン（+ 次回の請求） */}
      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-ink2">現在のプラン</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold">{PLAN_LABELS[plan]}</span>
              <span className="tnum text-sm text-ink2">{PLAN_PRICES[plan]}／月</span>
            </p>
          </div>
          <Badge tone={isPaid ? "success" : "neutral"}>{isPaid ? "お支払い中" : "無料プラン"}</Badge>
        </div>

        {isPaid && (
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-t border-line pt-4">
            <p className="flex items-center gap-1.5 text-sm text-ink2">
              <Receipt className="size-4" aria-hidden /> 次回の請求予定日
            </p>
            <p className="text-sm font-semibold text-ink">
              {nextBillingDate ?? "お支払い画面でご確認いただけます"}
            </p>
          </div>
        )}
      </Card>

      {/* 今月の AI 編集の使用状況（透明性を第1級に） */}
      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink2">
          <Gauge className="size-4" aria-hidden /> 今月のAI編集（{period.label}）
        </h2>
        <Card className="flex flex-col gap-3">
          {noAiEdit ? (
            <p className="text-sm text-ink2">
              このプランにはAIでの編集はありません。手動での編集はいつでもできます。
            </p>
          ) : unlimited ? (
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm text-ink2">今月の利用回数</p>
              <p className="text-base font-semibold text-ink">
                <span className="tnum">{usedThisMonth}</span> 回
                <span className="ml-2 text-sm font-normal text-ink2">（無制限）</span>
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm text-ink2">今月の利用回数</p>
                <p className="tnum text-base font-semibold text-ink">
                  {usedThisMonth} / {limit} 回
                </p>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-pill bg-surface2"
                role="progressbar"
                aria-valuenow={usedThisMonth}
                aria-valuemin={0}
                aria-valuemax={limit}
              >
                <div
                  className="h-full rounded-pill transition-[width] duration-300"
                  style={{
                    width: `${usagePct}%`,
                    backgroundColor: overLimit ? "var(--warn)" : "var(--accent)",
                  }}
                />
              </div>
              <p className="text-xs text-ink3">
                {overLimit
                  ? "今月の回数を使い切りました。来月にリセットされます。"
                  : `今月はあと ${Math.max(limit - usedThisMonth, 0)} 回つかえます。`}
              </p>
            </>
          )}
        </Card>
      </section>

      {/* プラン一覧（現行を強調・変更ボタン） */}
      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink2">
          <LayoutGrid className="size-4" aria-hidden /> プランを選ぶ
        </h2>
        <PlanChange currentPlan={plan} testMode={testMode} />
      </section>

      {/* お支払い方法・解約（有料のみ。Stripe のポータルへ） */}
      {isPaid && (
        <section className="flex flex-col gap-3">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink2">
            <CreditCard className="size-4" aria-hidden /> お支払い方法・解約
          </h2>
          <Card className="flex flex-col gap-3">
            <p className="text-sm text-ink2">
              カード情報の変更・領収書の確認・解約は、Stripe の安全な画面で行えます。
            </p>
            <div>
              <BillingPortalButton />
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
