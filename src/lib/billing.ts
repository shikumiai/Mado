"use server";

/**
 * お支払いまわりのサーバー処理（会員が自分で操作する分）。
 *
 * SaaS決済憲章: アップグレードも解約も、同じ手軽さで自分で管理できること。
 * その入口が Stripe のカスタマーポータル。ここでは「ログイン中の人の会社」を
 * その人のセッション（RLS）越しに確かめてから、ポータルのURLを作って返す。
 *
 * 認可の要:
 *   会社は必ず本人のセッションで引く。RLS が効くので、他人の会社は最初から
 *   返ってこない ＝ 他人の請求画面は開けない。
 *
 * Stripe や Supabase が未設定でも import では落とさない（getStripe / createServerSupabase
 * が null を返す方式に合わせ、ここでは理由を添えて { ok:false } を返すだけにする）。
 */

import { createServerSupabase } from "@/lib/supabase/ssr";
import { getStripe } from "@/lib/stripe-server";
import { SITE_BASE_URL } from "@/lib/resolve-site";

export type BillingPortalResult =
  | { ok: true; url: string }
  | { ok: false; reason: string };

/**
 * ログイン中のユーザーの会社について、Stripe のカスタマーポータルを開くURLを返す。
 * 無料（stripe_customer_id 無し）や未設定のときは、理由を添えて { ok:false }。
 */
export async function openBillingPortal(): Promise<BillingPortalResult> {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return { ok: false, reason: "ただいま準備中です。少し待ってから試してください。" };
  }

  // 本人確認（セッション）
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return { ok: false, reason: "ログインが切れているようです。もう一度ログインしてください。" };
  }

  // 会社を本人のセッション越しに引く。RLS が効くので自分の会社しか返らない
  const { data: orgs } = await supabase
    .from("orgs")
    .select("id, stripe_customer_id")
    .limit(1);
  const org = orgs?.[0] as { id: string; stripe_customer_id: string | null } | undefined;

  if (!org) {
    return { ok: false, reason: "会社の情報が見つかりませんでした。" };
  }
  if (!org.stripe_customer_id) {
    // 無料プランはまだ Stripe の顧客になっていない
    return { ok: false, reason: "無料プランのため、お支払いの管理画面はまだありません。" };
  }

  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, reason: "決済の準備が整っていません。時間をおいて試してください。" };
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: `${SITE_BASE_URL}/app/billing`,
    });
    return { ok: true, url: session.url };
  } catch (err) {
    console.error("[billing] カスタマーポータルの作成に失敗", err);
    return { ok: false, reason: "お支払い画面を開けませんでした。少し待ってから試してください。" };
  }
}
