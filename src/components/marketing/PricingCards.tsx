/**
 * 料金カード（3段）。トップの料金セクションと /pricing の両方で使う共通部品。
 * 表示のズレを防ぐため、金額とプラン名は src/lib/stripe.ts の1か所から引く。
 *
 * 無料先出し（おためし → おまかせ → おまかせプロ）。
 * 金銭的な得は言葉で押し売りせず、単品価格をそのまま並べて体感させる。
 */

import { Check } from "lucide-react";
import { Badge } from "@/components/ui";
import {
  PLAN_LABELS,
  PLAN_PRICES,
  PLAN_YEARLY_PRICES,
  type Plan,
} from "@/lib/stripe";
import { LinkButton } from "./LinkButton";

interface PlanMeta {
  plan: Plan;
  /** 一言で「誰のための段か」 */
  tagline: string;
  features: string[];
  /** 補足（含まれないもの等） */
  note?: string;
  ctaLabel: string;
  /** 真ん中の推し */
  highlighted?: boolean;
}

const PLANS: PlanMeta[] = [
  {
    plan: "otameshi",
    tagline: "まずは無料で、サイトを持つ。",
    features: [
      "業種に合ったテンプレート",
      "施工写真の掲載",
      "会社概要・お問い合わせ",
      "スマホ・タブレット対応",
      "SSL（https）標準",
      "独自ドメイン対応",
    ],
    note: "更新はご自身で（AIおまかせ編集は含みません）",
    ctaLabel: "無料ではじめる",
  },
  {
    plan: "omakase",
    tagline: "更新までまるごとおまかせ。",
    features: [
      "おためしの内容ぜんぶ",
      "実績・お客様の声・ブログ",
      "Googleマップの表示",
      "検索で見つかりやすく（SEO）",
      "AIにおまかせで編集（月3回）",
    ],
    ctaLabel: "このプランではじめる",
    highlighted: true,
  },
  {
    plan: "omakase-pro",
    tagline: "できることを、ぜんぶ。",
    features: [
      "おまかせの内容ぜんぶ",
      "予約・問い合わせの自動化",
      "採用ページ",
      "多言語対応",
      "AIにおまかせで編集（無制限）",
    ],
    ctaLabel: "このプランではじめる",
  },
];

const REASSURANCE = [
  "制作費0円",
  "いつでも解約OK・違約金なし",
  "独自ドメイン全プラン対応",
];

function PlanCard({ meta }: { meta: PlanMeta }) {
  const { plan, tagline, features, note, ctaLabel, highlighted } = meta;
  const isFree = plan === "otameshi";

  return (
    <div
      className={[
        "relative flex flex-col rounded-2xl p-6 sm:p-7",
        highlighted
          ? "bg-surface border border-accent/45 shadow-sh3 ring-1 ring-accent/25"
          : "bg-surface border border-line shadow-sh2",
      ].join(" ")}
    >
      {highlighted && (
        <span className="absolute -top-3 left-6">
          <Badge tone="accent">おすすめ</Badge>
        </span>
      )}

      <p className="text-lg font-bold text-ink">{PLAN_LABELS[plan]}</p>
      <p className="mt-1 text-sm text-ink2">{tagline}</p>

      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="tnum text-4xl font-bold text-ink">
          {PLAN_PRICES[plan]}
        </span>
        <span className="text-sm text-ink3">/ 月（税込）</span>
      </div>
      {isFree ? (
        <p className="mt-1 h-5 text-xs text-ink3">ずっと0円ではじめられます</p>
      ) : (
        <p className="mt-1 h-5 text-xs text-ink3">
          年払いなら月<span className="tnum">{PLAN_YEARLY_PRICES[plan]}</span>
        </p>
      )}

      <div className="mt-6">
        <LinkButton
          href="/start"
          variant={highlighted ? "cta" : "primary"}
          block
          pill
        >
          {ctaLabel}
        </LinkButton>
      </div>

      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check
              className="mt-0.5 size-4 shrink-0 text-success"
              strokeWidth={2.5}
              aria-hidden
            />
            <span className="text-sm text-ink2">{f}</span>
          </li>
        ))}
      </ul>

      {note && (
        <p className="mt-5 border-t border-line pt-4 text-xs text-ink3">
          {note}
        </p>
      )}
    </div>
  );
}

export function PricingCards({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <div className="grid items-stretch gap-5 lg:grid-cols-3">
        {PLANS.map((meta) => (
          <PlanCard key={meta.plan} meta={meta} />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {REASSURANCE.map((r) => (
          <span
            key={r}
            className="inline-flex items-center gap-1.5 text-sm text-ink2"
          >
            <Check className="size-4 text-success" strokeWidth={2.5} aria-hidden />
            {r}
          </span>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-ink3">
        表示はすべて税込・月額です。プランの変更・解約はいつでもご自身の画面から。
      </p>
    </div>
  );
}
