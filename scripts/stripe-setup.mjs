/**
 * Mado — 新Stripeアカウントの商品・価格セットアップ
 *
 * 冪等に作る: lookup_key と metadata.plan_id で既存を探し、無ければ作る。
 * 何度流しても重複しない。
 */
import Stripe from "stripe";

const sk = process.env.STRIPE_SECRET_KEY;
if (!sk) { console.error("STRIPE_SECRET_KEY が未設定"); process.exit(1); }

const stripe = new Stripe(sk, { apiVersion: "2026-04-22.dahlia" });

const PLANS = [
  {
    planId: "omakase",
    name: "Mado おまかせ",
    description: "ホームページの制作と運用の月額プラン。独自ドメイン対応、AI編集は月3回まで。",
    amount: 1480,               // JPY は小数を持たない通貨なので、この数字がそのまま円
    lookupKey: "omakase_monthly_jpy",
  },
  {
    planId: "omakase-pro",
    name: "Mado おまかせプロ",
    description: "ホームページの制作と運用の月額プラン。AI編集は無制限。予約・AIチャット・SEO設計つき。",
    amount: 4980,
    lookupKey: "omakase_pro_monthly_jpy",
  },
];

async function findProduct(planId) {
  const res = await stripe.products.search({
    query: `active:'true' AND metadata['plan_id']:'${planId}'`,
    limit: 1,
  });
  return res.data[0] ?? null;
}

async function findPrice(lookupKey) {
  const res = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
  return res.data[0] ?? null;
}

const result = [];

for (const plan of PLANS) {
  let product = await findProduct(plan.planId);
  if (product) {
    // 名前や説明が変わっていたら揃える（サービス名の改名に追従させるため）
    if (product.name !== plan.name || product.description !== plan.description) {
      product = await stripe.products.update(product.id, {
        name: plan.name,
        description: plan.description,
      });
      console.log(`  商品 更新: ${plan.planId} -> ${product.id}  「${product.name}」`);
    } else {
      console.log(`  商品 既存: ${plan.planId} -> ${product.id}`);
    }
  } else {
    product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: { plan_id: plan.planId },
    });
    console.log(`  商品 作成: ${plan.planId} -> ${product.id}`);
  }

  let price = await findPrice(plan.lookupKey);
  if (price) {
    console.log(`  価格 既存: ${plan.lookupKey} -> ${price.id} (${price.unit_amount}円)`);
  } else {
    price = await stripe.prices.create({
      product: product.id,
      currency: "jpy",
      unit_amount: plan.amount,
      recurring: { interval: "month" },
      lookup_key: plan.lookupKey,
      transfer_lookup_key: true,
      metadata: { plan_id: plan.planId },
    });
    console.log(`  価格 作成: ${plan.lookupKey} -> ${price.id} (${price.unit_amount}円/月)`);
  }

  result.push({ planId: plan.planId, productId: product.id, priceId: price.id, lookupKey: plan.lookupKey, amount: price.unit_amount });
}

console.log("\n=== できあがり ===");
for (const r of result) {
  console.log(`  ${r.planId.padEnd(12)} ${r.lookupKey.padEnd(24)} ${r.priceId}  ¥${r.amount}/月`);
}
