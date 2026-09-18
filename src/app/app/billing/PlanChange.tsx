"use client";

/**
 * プラン一覧 ＋ 変更ボタン。
 *
 * 現行プランを強調し、ほかのプランへ「上げる／下げる／解約」を同じ手軽さで選べる
 * （SaaS決済憲章: アップも解約も同じ導線）。
 *   - 無料 → 有料 : Stripe Checkout へ移る
 *   - 有料 → 有料 : その場で変更（差額は日割り）。トーストで知らせて再読込
 *   - 有料 → 無料 : 解約はカスタマーポータルへ
 * 均一な3枚横並べカードは使わず、縦に積んだ行で現行との違いを見せる（ART_DIRECTION_V2）。
 * トーストで結果を伝え、モーダルでは割り込まない（UIUX憲章）。
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Badge, useToast } from "@/components/ui";
import { Check, ArrowUpRight, ArrowDownRight, FlaskConical } from "lucide-react";
import { changePlan } from "@/lib/billing";
import {
  PLAN_LABELS,
  PLAN_PRICES,
  PLAN_TAGLINES,
  PLAN_FEATURES,
  PLAN_RANK,
  type Plan,
} from "@/lib/stripe";

const PLAN_ORDER: Plan[] = ["otameshi", "omakase", "omakase-pro"];

export function PlanChange({
  currentPlan,
  testMode,
}: {
  currentPlan: Plan;
  testMode: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [busyPlan, setBusyPlan] = useState<Plan | null>(null);

  function handleChange(target: Plan) {
    setBusyPlan(target);
    startTransition(async () => {
      const res = await changePlan(target);

      if (!res.ok) {
        toast({ title: "プランを変更できませんでした", description: res.reason, tone: "warn" });
        setBusyPlan(null);
        return;
      }

      if (res.kind === "checkout" || res.kind === "portal") {
        // Checkout / ポータルへ遷移する（busy はそのままにして二度押しを防ぐ）
        window.location.href = res.url;
        return;
      }

      // その場で変更完了（有料→有料）
      toast({
        title: `${PLAN_LABELS[res.plan]}に変更しました`,
        description: "差額は日割りで調整されます。次回の請求からこのプランになります。",
        tone: "success",
      });
      setBusyPlan(null);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {PLAN_ORDER.map((plan) => {
          const isCurrent = plan === currentPlan;
          const goingUp = PLAN_RANK[plan] > PLAN_RANK[currentPlan];
          const isFreeTarget = plan === "otameshi";
          const busy = busyPlan === plan && pending;

          const actionLabel = isFreeTarget
            ? "無料に戻す（解約）"
            : goingUp
              ? `${PLAN_LABELS[plan]}に上げる`
              : `${PLAN_LABELS[plan]}に下げる`;

          return (
            <li
              key={plan}
              className={[
                "rounded-lg border p-4 transition-colors",
                isCurrent ? "border-accent/60 bg-accent-soft" : "border-line bg-surface",
              ].join(" ")}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg font-bold text-ink">
                      {PLAN_LABELS[plan]}
                    </span>
                    {isCurrent && <Badge tone="accent">利用中</Badge>}
                  </div>
                  <p className="mt-0.5 text-sm text-ink2">{PLAN_TAGLINES[plan]}</p>
                </div>
                <p className="shrink-0 text-right leading-none">
                  <span className="tnum text-lg font-bold text-ink">{PLAN_PRICES[plan]}</span>
                  <span className="ml-0.5 text-xs text-ink2">／月</span>
                </p>
              </div>

              <ul className="mt-3 flex flex-col gap-1.5">
                {PLAN_FEATURES[plan].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink2">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>

              {!isCurrent && (
                <div className="mt-4">
                  <Button
                    variant={goingUp && !isFreeTarget ? "primary" : "secondary"}
                    size="sm"
                    loading={busy}
                    disabled={pending && !busy}
                    onClick={() => handleChange(plan)}
                    leftIcon={
                      isFreeTarget ? undefined : goingUp ? (
                        <ArrowUpRight className="size-4" aria-hidden />
                      ) : (
                        <ArrowDownRight className="size-4" aria-hidden />
                      )
                    }
                  >
                    {actionLabel}
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-ink3">
        プランを上げると、差額は日割りで計算されます。下げる・解約は、今の期間の終わりで切り替わります。
      </p>

      {testMode && (
        <p className="flex items-start gap-2 rounded-md border border-line bg-surface2 px-3 py-2 text-xs text-ink2">
          <FlaskConical className="mt-0.5 size-3.5 shrink-0 text-info" aria-hidden />
          <span>
            テスト環境です。カード番号{" "}
            <span className="tnum font-medium text-ink">4242 4242 4242 4242</span>
            ・将来の有効期限・任意のセキュリティコード（3桁）・任意の郵便番号で、実際の請求なしにお試しいただけます。
          </span>
        </p>
      )}
    </div>
  );
}
