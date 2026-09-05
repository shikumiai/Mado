/**
 * Stripe のサーバー専用処理。
 *
 * SDK を読み込むので、クライアントコンポーネントから import しないこと。
 * プラン名やラベルなど画面でも使う値は src/lib/stripe.ts 側に置いてある。
 */

import Stripe from "stripe";
import { STRIPE_API_VERSION, PLAN_LOOKUP_KEYS, getStripePriceId, type Plan } from "./stripe";

let stripeClient: Stripe | null = null;

/** Stripe クライアント。未設定なら null */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: STRIPE_API_VERSION as Stripe.LatestApiVersion,
    });
  }
  return stripeClient;
}

/** lookup_key → Price ID の結果を覚えておく（起動中は使い回す） */
const priceIdCache = new Map<string, string>();

/**
 * プランに対応する Price ID を返す。おためし（無料）は null。
 *
 * lookup_key で Stripe に問い合わせるので、Dashboard 側で価格を
 * 作り直しても、コードや環境変数を触らずに追従する。
 * 問い合わせに失敗したときだけ、環境変数の値を控えとして使う。
 */
export async function resolvePriceId(plan: Plan): Promise<string | null> {
  const lookupKey = PLAN_LOOKUP_KEYS[plan];
  if (!lookupKey) return null; // 無料プラン

  const cached = priceIdCache.get(lookupKey);
  if (cached) return cached;

  const stripe = getStripe();
  if (stripe) {
    try {
      const res = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
      const price = res.data[0];
      if (price) {
        priceIdCache.set(lookupKey, price.id);
        return price.id;
      }
      console.warn(`[stripe] lookup_key "${lookupKey}" に対応する価格が見つからない`);
    } catch (err) {
      console.error(`[stripe] 価格の取得に失敗（環境変数の値を使う）: ${lookupKey}`, err);
    }
  }

  // 控え: 環境変数
  const fallback = getStripePriceId(plan);
  return fallback || null;
}

/** テストなどで覚えた値を捨てる */
export function clearPriceIdCache() {
  priceIdCache.clear();
}

/**
 * テスト／サンドボックス環境かどうか。
 *
 * STRIPE_SECRET_KEY が sk_test_ / rk_test_ で始まればテスト（Stripe のサンドボックスも
 * テストモードの鍵を使うので、これで一緒に拾える）。本番の鍵（sk_live_ 等）では false。
 * 画面に「テストカードで試せます」の注記を出してよいかの判定にだけ使う。
 */
export function isStripeTestMode(): boolean {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  return /^(sk|rk)_test_/.test(key);
}

/**
 * サブスクの Checkout Session を作る共通処理。
 *
 * 新規申込（signup の startPaidCheckout）と、無料→有料の切り替え（billing の changePlan）で
 * 使い回す。metadata に org_id / site_id / plan を必ず載せるので、webhook はどちらの経路でも
 * 同じ1行を active / plan / live に更新できる。
 *
 * payment_method_types は渡さない。Dashboard の Payment method configurations に決めさせると、
 * その顧客に出せる支払い方法（card / link など）が自動で選ばれる。
 * 既存顧客（customerId）があればそれを使い回し、無ければ customer_email で作る（両方は渡せない）。
 */
export interface SubscriptionCheckoutParams {
  plan: Plan;
  priceId: string;
  orgId: string;
  siteId: string;
  templateId?: string;
  email?: string;
  customerId?: string | null;
  successUrl: string;
  cancelUrl: string;
}

export async function createSubscriptionCheckoutSession(
  stripe: Stripe,
  params: SubscriptionCheckoutParams
): Promise<Stripe.Checkout.Session> {
  const metadata: Record<string, string> = {
    org_id: params.orgId,
    site_id: params.siteId,
    plan: params.plan,
  };
  if (params.templateId) metadata.template_id = params.templateId;

  const create: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    line_items: [{ price: params.priceId, quantity: 1 }],
    metadata,
    subscription_data: {
      metadata: {
        org_id: params.orgId,
        site_id: params.siteId,
        plan: params.plan,
      },
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  };

  if (params.customerId) {
    create.customer = params.customerId;
  } else if (params.email) {
    create.customer_email = params.email;
  }

  return stripe.checkout.sessions.create(create);
}
