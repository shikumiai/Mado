/**
 * Mado — Stripe の Webhook エンドポイントを用意する
 *
 * 同じ URL のエンドポイントが既にあれば、受け取るイベントだけ揃えて作り直さない。
 * 何度流しても増えない。
 *
 * 実行:
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-webhook-setup.mjs
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-webhook-setup.mjs http://localhost:3000/api/webhook
 *
 * 署名鍵（whsec_）は作成した瞬間しか取れない。
 * 既存のものを引き直したいときは Stripe ダッシュボードで確認する。
 */
import Stripe from "stripe";

const sk = process.env.STRIPE_SECRET_KEY;
if (!sk) { console.error("STRIPE_SECRET_KEY が未設定"); process.exit(1); }

const stripe = new Stripe(sk, { apiVersion: "2026-04-22.dahlia" });

const URL = process.argv[2] || "https://mado.shikumiai.com/api/webhook";
const EVENTS = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
];

const list = await stripe.webhookEndpoints.list({ limit: 100 });
let ep = list.data.find((e) => e.url === URL);

if (ep) {
  ep = await stripe.webhookEndpoints.update(ep.id, {
    enabled_events: EVENTS,
    description: "Mado 本番",
  });
  console.log("既存のエンドポイントを更新:", ep.id);
  console.log("署名鍵: 作成時にしか取れないので、Stripe ダッシュボードで確認してください");
} else {
  ep = await stripe.webhookEndpoints.create({
    url: URL,
    enabled_events: EVENTS,
    description: "Mado 本番",
    api_version: "2026-04-22.dahlia",
  });
  console.log("新しく作成:", ep.id);
  console.log("STRIPE_WEBHOOK_SECRET=" + ep.secret);
}

console.log("URL       :", ep.url);
console.log("状態      :", ep.status);
console.log("受けるもの:", ep.enabled_events.join(", "));
