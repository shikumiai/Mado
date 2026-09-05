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
import { getWriteClient } from "@/lib/supabase/server";
import {
  getStripe,
  resolvePriceId,
  createSubscriptionCheckoutSession,
} from "@/lib/stripe-server";
import { SITE_BASE_URL } from "@/lib/resolve-site";
import { normalizePlanId, type Plan } from "@/lib/stripe";

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

/* ═══════════════════════════════════════
   プラン変更（アップ／ダウン／解約）

   SaaS決済憲章: アップも解約も同じ手軽さで。入口は次の3通りに寄せる。
     - 無料 → 有料 : 既存の会社・サイトを使い回して新規 Checkout（startPaidCheckout と共通化）
     - 有料 → 有料 : サブスクの price を差し替える（差額は日割り）。webhook が orgs.plan を反映
     - 有料 → 無料 : 解約はカスタマーポータルへ（お支払い方法の変更・領収書もここ）
   認可は必ず本人セッション（RLS）越しに会社を引いてから。未設定・価格無し・
   ポータル未設定は理由を添えて { ok:false }（既存の null 方式に合わせる）。
   ═══════════════════════════════════════ */

export type PlanChangeResult =
  | { ok: true; kind: "checkout"; url: string } // 無料→有料: Checkout へ移る
  | { ok: true; kind: "portal"; url: string } // 解約・無料化: ポータルへ移る
  | { ok: true; kind: "updated"; plan: Plan } // 有料→有料: その場で変更完了
  | { ok: false; reason: string };

export async function changePlan(target: Plan): Promise<PlanChangeResult> {
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
    .select("id, email, plan, status, stripe_customer_id, stripe_subscription_id")
    .limit(1);
  const org = orgs?.[0] as
    | {
        id: string;
        email: string | null;
        plan: string;
        status: string;
        stripe_customer_id: string | null;
        stripe_subscription_id: string | null;
      }
    | undefined;
  if (!org) {
    return { ok: false, reason: "会社の情報が見つかりませんでした。" };
  }

  const current = normalizePlanId(org.plan);
  if (target === current) {
    return { ok: false, reason: "すでにこのプランをご利用中です。" };
  }

  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, reason: "決済の準備が整っていません。時間をおいて試してください。" };
  }

  // いま有料で契約中か（解約済みは無料扱いにして、新規 Checkout で入り直す）
  const hasActiveSub = Boolean(org.stripe_subscription_id) && org.status !== "canceled";

  /* ── 有料 → 無料（おためし）＝ 解約。カスタマーポータルへ寄せる ── */
  if (target === "otameshi") {
    if (!hasActiveSub || !org.stripe_customer_id) {
      return { ok: false, reason: "すでに無料プランです。" };
    }
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: org.stripe_customer_id,
        return_url: `${SITE_BASE_URL}/app/billing`,
      });
      return { ok: true, kind: "portal", url: session.url };
    } catch (err) {
      console.error("[billing] 解約ポータルの作成に失敗", err);
      return { ok: false, reason: "解約の画面を開けませんでした。少し待ってから試してください。" };
    }
  }

  // ここから target は有料（omakase / omakase-pro）
  const priceId = await resolvePriceId(target);
  if (!priceId) {
    return { ok: false, reason: "このプランの価格が設定されていません。しばらくお待ちください。" };
  }

  /* ── 有料 → 有料（アップ／ダウン）＝ サブスクの price を差し替える ── */
  if (hasActiveSub && org.stripe_subscription_id) {
    try {
      const sub = await stripe.subscriptions.retrieve(org.stripe_subscription_id);
      const itemId = sub.items.data[0]?.id;
      if (!itemId) {
        return { ok: false, reason: "ご契約の情報を確認できませんでした。時間をおいて試してください。" };
      }
      await stripe.subscriptions.update(org.stripe_subscription_id, {
        items: [{ id: itemId, price: priceId }],
        // 差額は日割りで調整（アップは不足分を、ダウンは余剰分を次回請求で相殺）
        proration_behavior: "create_prorations",
        // webhook は price の lookup_key を優先して読むが、二重の保険で metadata も合わせる
        metadata: { ...sub.metadata, plan: target },
      });

      // 画面へすぐ反映されるよう、確認できた範囲で orgs.plan も即時更新する。
      // 会員は RLS 越しに orgs を更新できないので service_role で書く（本人所有は上で確認済み）。
      // webhook（customer.subscription.updated）が後で同じ値を再度書く＝冪等。
      const admin = getWriteClient();
      if (admin) {
        const { error } = await admin.from("orgs").update({ plan: target }).eq("id", org.id);
        if (error) console.warn("[billing] プランの即時反映に失敗（webhook で反映されます）", error);
      }

      return { ok: true, kind: "updated", plan: target };
    } catch (err) {
      console.error("[billing] プラン変更（サブスク更新）に失敗", err);
      return { ok: false, reason: "プランを変更できませんでした。少し待ってから試してください。" };
    }
  }

  /* ── 無料 → 有料 ＝ 既存の会社・サイトを使い回して新規 Checkout ── */
  const { data: sites } = await supabase
    .from("sites")
    .select("id, template_id")
    .eq("org_id", org.id)
    .order("created_at", { ascending: true })
    .limit(1);
  const site = sites?.[0] as { id: string; template_id: string | null } | undefined;
  if (!site) {
    return { ok: false, reason: "対象のサイトが見つかりませんでした。" };
  }

  try {
    const session = await createSubscriptionCheckoutSession(stripe, {
      plan: target,
      priceId,
      orgId: org.id,
      siteId: site.id,
      templateId: site.template_id ?? undefined,
      email: org.email ?? undefined,
      customerId: org.stripe_customer_id, // 過去に有料だった会社は顧客を使い回す
      successUrl: `${SITE_BASE_URL}/app/billing?changed=1`,
      cancelUrl: `${SITE_BASE_URL}/app/billing`,
    });
    if (!session.url) {
      return { ok: false, reason: "決済ページを開けませんでした。もう一度お試しください。" };
    }
    return { ok: true, kind: "checkout", url: session.url };
  } catch (err) {
    console.error("[billing] アップグレード用 Checkout の作成に失敗", err);
    return { ok: false, reason: "決済ページを開けませんでした。もう一度お試しください。" };
  }
}
