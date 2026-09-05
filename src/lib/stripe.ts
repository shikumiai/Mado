/**
 * Stripe共通ユーティリティ
 * プランIDマッピング、業種に依存しない汎用設計
 *
 * プラン体系（2026-04 改定）:
 *   otameshi     → おためし（¥0/月・無料）
 *   omakase      → おまかせ（¥1,480/月・年払い¥1,180/月）
 *   omakase-pro  → おまかせプロ（¥4,980/月・年払い¥3,980/月）
 */

export type Plan = "otameshi" | "omakase" | "omakase-pro";

/** 旧プランIDとの互換マッピング（GAS/Stripe既存データ対応） */
const LEGACY_PLAN_MAP: Record<string, Plan> = {
  lite: "otameshi",
  middle: "omakase",
  premium: "omakase-pro",
};

/** 旧プランIDを新IDに変換。新IDはそのまま返す */
export function normalizePlanId(plan: string): Plan {
  if (plan in LEGACY_PLAN_MAP) return LEGACY_PLAN_MAP[plan];
  if (plan === "otameshi" || plan === "omakase" || plan === "omakase-pro") return plan as Plan;
  return "otameshi"; // fallback
}

/**
 * Stripe API バージョン。ここ1か所で管理する。
 * stripe-best-practices スキルが指す最新版に合わせる。
 */
export const STRIPE_API_VERSION = "2026-04-22.dahlia";

/**
 * プラン → Stripe の lookup_key
 *
 * Price ID（price_xxx）をコードや環境変数に固定すると、
 * 価格を作り直すたびに書き換えが要るうえ、古いIDが残って事故る。
 * lookup_key で引けば、Dashboard 側で価格を差し替えても追従する。
 * 実際の解決は src/lib/stripe-server.ts の resolvePriceId() が行う。
 */
export const PLAN_LOOKUP_KEYS: Record<Plan, string | null> = {
  otameshi: null, // 無料。Stripe を通さない
  omakase: "omakase_monthly_jpy",
  "omakase-pro": "omakase_pro_monthly_jpy",
};

/**
 * プラン → Stripe Price ID（環境変数版）
 *
 * resolvePriceId() が Stripe に問い合わせられないときの控え。
 * 通常は lookup_key 経由で引くので、こちらは使われない。
 * おためし（無料）は null を返す。
 */
export function getStripePriceId(plan: Plan): string | null {
  if (plan === "otameshi") return null; // 無料プラン

  const priceMap: Partial<Record<Plan, string | undefined>> = {
    omakase: process.env.STRIPE_PRICE_OMAKASE,
    "omakase-pro": process.env.STRIPE_PRICE_OMAKASE_PRO,
  };

  const priceId = priceMap[plan];
  if (!priceId) {
    // フォールバック: 旧環境変数名にも対応
    if (plan === "omakase") return process.env.STRIPE_PRICE_MIDDLE || "";
    if (plan === "omakase-pro") return process.env.STRIPE_PRICE_PREMIUM || "";
    throw new Error(`Stripe Price ID for plan "${plan}" is not configured.`);
  }
  return priceId;
}

/**
 * テンプレートIDからプランを判定
 * warm-craft → otameshi, warm-craft-mid → omakase, warm-craft-pro → omakase-pro
 */
export function getPlanFromTemplateId(templateId: string): Plan {
  if (templateId.endsWith("-pro")) return "omakase-pro";
  if (templateId.endsWith("-mid")) return "omakase";
  return "otameshi";
}

/**
 * テンプレートIDからベースIDを取得
 * warm-craft-mid → warm-craft, trust-navy-pro → trust-navy
 */
export function getBaseTemplateId(templateId: string): string {
  return templateId.replace(/-(?:mid|pro)$/, "");
}

/**
 * プラン表示名
 */
export const PLAN_LABELS: Record<Plan, string> = {
  otameshi: "おためし",
  omakase: "おまかせ",
  "omakase-pro": "おまかせプロ",
};

/**
 * プラン月額（表示用）
 */
export const PLAN_PRICES: Record<Plan, string> = {
  otameshi: "¥0",
  omakase: "¥1,480",
  "omakase-pro": "¥4,980",
};

/**
 * プラン年払い月額（表示用）
 */
export const PLAN_YEARLY_PRICES: Record<Plan, string> = {
  otameshi: "¥0",
  omakase: "¥1,180",
  "omakase-pro": "¥3,980",
};

/**
 * プランごとの月間編集依頼上限
 */
export const PLAN_EDIT_LIMITS: Record<Plan, number> = {
  otameshi: 0,        // AI編集不可（手動編集のみ）
  omakase: 3,         // 月3回
  "omakase-pro": 999, // 無制限
};

/**
 * プランの並び順（無料→上位）。プラン変更で「上げる／下げる」を見分けるのに使う。
 */
export const PLAN_RANK: Record<Plan, number> = {
  otameshi: 0,
  omakase: 1,
  "omakase-pro": 2,
};

/**
 * プランの一言。金額の得は言葉で言わず、何ができるかを短く伝える（プラン一覧で使う）。
 */
export const PLAN_TAGLINES: Record<Plan, string> = {
  otameshi: "まずは無料で、自分のサイトを持つ。",
  omakase: "編集もおまかせ。育てていくサイトに。",
  "omakase-pro": "予約もAIチャットも。本気で集客するなら。",
};

/**
 * プランごとの主な内容（プラン一覧の箇条書き。stripe-setup.mjs の商品説明と揃える）。
 */
export const PLAN_FEATURES: Record<Plan, string[]> = {
  otameshi: ["独自ドメインに対応", "自分で手動で編集", "AIでの編集はなし"],
  omakase: ["独自ドメインに対応", "AIでの編集 月3回まで", "写真を送るだけでおまかせ"],
  "omakase-pro": ["独自ドメインに対応", "AIでの編集 無制限", "予約・AIチャット・SEO設計つき"],
};
