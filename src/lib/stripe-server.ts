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
