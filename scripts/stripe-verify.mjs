/**
 * Mado — Stripe 設定の疎通確認
 *
 * 確かめること:
 *  1. lookup_key から Price ID を引けるか
 *  2. payment_method_types を渡さずに Checkout Session を作れるか
 *  3. その Session でどの支払い方法が出るか（Dashboard 設定が効いているか）
 *
 * 実行: STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-verify.mjs
 */
import Stripe from "stripe";

const sk = process.env.STRIPE_SECRET_KEY;
if (!sk) { console.error("STRIPE_SECRET_KEY が未設定"); process.exit(1); }
if (!sk.startsWith("sk_test_")) { console.error("テストキー以外では動かさない"); process.exit(1); }

const stripe = new Stripe(sk, { apiVersion: "2026-04-22.dahlia" });

const LOOKUP_KEYS = ["omakase_monthly_jpy", "omakase_pro_monthly_jpy"];

console.log("=== 1. lookup_key から価格を引く ===");
const prices = {};
for (const key of LOOKUP_KEYS) {
  const res = await stripe.prices.list({ lookup_keys: [key], active: true, limit: 1 });
  const p = res.data[0];
  if (!p) { console.log(`  ${key}: 見つからない`); continue; }
  prices[key] = p.id;
  console.log(`  ${key.padEnd(24)} -> ${p.id}  ¥${p.unit_amount}/${p.recurring?.interval}`);
}

console.log("\n=== 2. Checkout Session を作る（payment_method_types なし） ===");
const priceId = prices["omakase_monthly_jpy"];
if (!priceId) { console.error("  価格が引けないので中止"); process.exit(1); }

const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  line_items: [{ price: priceId, quantity: 1 }],
  customer_email: "verify@example.com",
  success_url: "https://mado.shikumiai.com/start/success?session_id={CHECKOUT_SESSION_ID}",
  cancel_url: "https://mado.shikumiai.com/start",
  metadata: { verify: "true" },
});

console.log(`  session: ${session.id}`);
console.log(`  status : ${session.status}`);
console.log(`  出せる支払い方法: ${(session.payment_method_types || []).join(", ") || "(なし)"}`);
console.log(`  決済URL: ${session.url ? "発行された" : "発行されない"}`);

console.log("\n=== 3. 後始末 ===");
await stripe.checkout.sessions.expire(session.id);
console.log("  確認用の Session を期限切れにした");
