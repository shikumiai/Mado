/**
 * 料金カード。トップの料金セクションと /pricing の両方で使う共通部品。
 * 表示のズレを防ぐため、金額とプラン名は src/lib/stripe.ts の1か所から引く。
 *
 * 均等3カラムにはしない。真ん中の「おまかせ」を主役として一段大きく・浮かせ、
 * 両脇（無料・プロ）はそれを支える控えめな段にする（大小差で選びやすく）。
 * 無料先出し（おためし → おまかせ → おまかせプロ）の並びは保つ。
 * ボタンは3段の強弱: おまかせ=あかり付き / おためし=オレンジ実面 / プロ=濃紺の枠。
 */

import { Check } from "lucide-react";
import {
  PLAN_LABELS,
  PLAN_PRICES,
  PLAN_YEARLY_PRICES,
  type Plan,
} from "@/lib/stripe";
import { LinkButton } from "./LinkButton";

type CtaVariant = "cta" | "primary" | "secondary";

interface PlanMeta {
  plan: Plan;
  tagline: string;
  features: string[];
  note?: string;
  ctaLabel: string;
  ctaVariant: CtaVariant;
  featured?: boolean;
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
    ctaVariant: "primary",
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
    ctaVariant: "cta",
    featured: true,
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
    ctaVariant: "secondary",
  },
];

const REASSURANCE = [
  "制作費0円",
  "いつでも解約OK・違約金なし",
  "独自ドメイン全プラン対応",
];

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="mt-6 flex flex-1 flex-col gap-3">
      {features.map((f) => (
        <li key={f} className="flex items-start gap-2.5">
          <Check
            className="mt-0.5 size-4 shrink-0 text-accent"
            strokeWidth={2.5}
            aria-hidden
          />
          <span className="text-sm text-ink2">{f}</span>
        </li>
      ))}
    </ul>
  );
}

function PriceBlock({ plan }: { plan: Plan }) {
  const isFree = plan === "otameshi";
  return (
    <>
      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="font-serif text-5xl font-bold leading-none text-ink">
          {PLAN_PRICES[plan]}
        </span>
        <span className="text-sm text-ink3">/ 月（税込）</span>
      </div>
      {isFree ? (
        <p className="mt-2 h-5 text-xs text-ink3">ずっと0円ではじめられます</p>
      ) : (
        <p className="mt-2 h-5 text-xs text-ink3">
          年払いなら月{" "}
          <span className="tnum text-ink2">{PLAN_YEARLY_PRICES[plan]}</span>
        </p>
      )}
    </>
  );
}

/** 主役の「おまかせ」。一段大きく・浮かせ・あかりを添える */
function FeaturedCard({ meta }: { meta: PlanMeta }) {
  const { plan, tagline, features, ctaLabel, ctaVariant } = meta;
  return (
    <div className="relative lg:-my-3 lg:-mx-1">
      {/* 窓から差すあたたかい光（装飾・静止） */}
      <div
        aria-hidden
        className="window-light pointer-events-none absolute -inset-x-6 -top-8 -z-10 h-40 rounded-full blur-2xl"
      />
      <div className="relative flex h-full flex-col rounded-2xl border-2 border-accent/55 bg-surface p-7 shadow-sh3 sm:p-8">
        <div className="flex items-center justify-between">
          <p className="font-serif text-2xl font-bold text-ink">
            {PLAN_LABELS[plan]}
          </p>
          <span className="inline-flex items-center rounded-pill bg-accent px-3 py-1 text-xs font-bold text-on-accent">
            おすすめ
          </span>
        </div>
        <p className="mt-1.5 text-sm text-ink2">{tagline}</p>

        <PriceBlock plan={plan} />

        <div className="mt-6">
          <LinkButton href="/start" variant={ctaVariant} size="lg" block>
            {ctaLabel}
          </LinkButton>
        </div>

        <FeatureList features={features} />
      </div>
    </div>
  );
}

/** 脇を支える段（無料・プロ）。控えめに、けれど手を抜かず */
function SatelliteCard({ meta }: { meta: PlanMeta }) {
  const { plan, tagline, features, note, ctaLabel, ctaVariant } = meta;
  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-sh1 sm:p-7">
      <p className="font-serif text-xl font-bold text-ink">
        {PLAN_LABELS[plan]}
      </p>
      <p className="mt-1.5 text-sm text-ink2">{tagline}</p>

      <PriceBlock plan={plan} />

      <div className="mt-6">
        <LinkButton href="/start" variant={ctaVariant} block>
          {ctaLabel}
        </LinkButton>
      </div>

      <FeatureList features={features} />

      {note && (
        <p className="mt-5 border-t border-line pt-4 text-xs text-ink3">
          {note}
        </p>
      )}
    </div>
  );
}

export function PricingCards({ className = "" }: { className?: string }) {
  const [otameshi, omakase, pro] = PLANS;

  return (
    <div className={className}>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.24fr_1fr] lg:items-center lg:gap-6">
        <SatelliteCard meta={otameshi} />
        <FeaturedCard meta={omakase} />
        <SatelliteCard meta={pro} />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {REASSURANCE.map((r) => (
          <span
            key={r}
            className="inline-flex items-center gap-1.5 text-sm text-ink2"
          >
            <Check className="size-4 text-accent" strokeWidth={2.5} aria-hidden />
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
