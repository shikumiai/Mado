import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripe } from "../stripe-server";
import { PLAN_LOOKUP_KEYS, normalizePlanId } from "../stripe";

/** A sandbox subscription must never unlock real API spending for the public. */
export async function verifyAiSubscription(db: SupabaseClient, siteId: string, userId: string): Promise<string | null> {
  const { data: site } = await db.from("sites").select("org_id").eq("id", siteId).single();
  if (!site) return "サイトが見つかりません。";
  const { data: org } = await db.from("orgs").select("plan,status,stripe_subscription_id,stripe_customer_id").eq("id", site.org_id).single();
  if (!org || org.status !== "active" || !org.stripe_subscription_id || normalizePlanId(org.plan) === "otameshi") return "AIは有料プランで使えます。お支払い状況をご確認ください。";
  const stripe = getStripe();
  if (!stripe) return "お支払い状況を確認できませんでした。利用枠は消費していません。";
  try {
    const subscription = await stripe.subscriptions.retrieve(org.stripe_subscription_id);
    const customer = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    if (subscription.status !== "active" || customer !== org.stripe_customer_id || !subscription.items.data.some(item => item.price.lookup_key === PLAN_LOOKUP_KEYS[normalizePlanId(org.plan)])) return "ご契約の確認が必要です。支払い・プラン画面をご確認ください。";
    if (!subscription.livemode) {
      const { data, error } = await db.from("platform_admins").select("user_id").eq("user_id", userId).maybeSingle();
      if (error || !data) return "テスト決済中のAI生成は運営者の検証用です。通常の編集はそのまま使えます。";
    }
    return null;
  } catch { return "お支払い状況を確認できませんでした。利用枠は消費していません。"; }
}
