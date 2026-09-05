import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe-server";
import { getWriteClient } from "@/lib/supabase/server";
import { logger, retryGasWebhook } from "@/lib/error-handler";
import { normalizePlanId, PLAN_LOOKUP_KEYS, type Plan } from "@/lib/stripe";
import { customerSiteUrl } from "@/lib/resolve-site";

/* ═══════════════════════════════════════════════════════════════
   POST /api/webhook — Stripe Webhook

   新設計では「orgs / sites の1行を更新するだけ」。
   リポ作成もデプロイもしない。DB 書き込みは service_role で行う。

   守ること:
     - 署名（stripe-signature）と署名鍵（STRIPE_WEBHOOK_SECRET）の両方を必須にする
     - 同じ event.id を2回受けても2回目は何もしない（stripe_events で冪等）
     - メール通知はベストエフォート。失敗しても本流（DB更新）は止めない
   ═══════════════════════════════════════════════════════════════ */

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // 署名鍵か Stripe クライアントが無ければ受け付けない。
  // （以前あった「署名が無ければ本文をそのまま信じる」逃げ道は塞いである）
  if (!stripe || !webhookSecret) {
    logger.error("STRIPE", "Stripe の鍵が未設定のため webhook を受け付けない");
    return NextResponse.json({ error: "webhook not configured" }, { status: 500 });
  }
  if (!sig) {
    logger.warn("STRIPE", "署名ヘッダのない webhook を拒否");
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    logger.error("STRIPE", "Webhook 署名検証に失敗", { error: err });
    return NextResponse.json({ error: "signature verification failed" }, { status: 400 });
  }

  const admin = getWriteClient();
  if (!admin) {
    logger.error("STRIPE", "DB（service_role）が未設定のため webhook を処理できない");
    return NextResponse.json({ error: "storage not configured" }, { status: 500 });
  }

  /* ─── 冪等性: この event.id を初めて見たときだけ処理する ─── */
  const { error: insErr } = await admin
    .from("stripe_events")
    .insert({ event_id: event.id, type: event.type });

  if (insErr?.code === "23505") {
    // 重複キー = 既に受け取り済み。二重処理しない
    logger.debug("STRIPE", `重複 webhook を無視: ${event.id}`);
    return NextResponse.json({ received: true, duplicate: true });
  }
  // 台帳に書けたか。書けていれば、処理に失敗したとき台帳から消し、
  // Stripe の再送で処理をやり直せるようにする（先に記録して弾くと取りこぼす）。
  const recorded = !insErr;
  if (insErr) {
    // 台帳に書けない他の理由（テーブル未作成など）。取りこぼしを避けるため処理は続ける
    logger.warn("STRIPE", "stripe_events への記録に失敗（処理は続行）", { error: insErr });
  }

  /* ─── イベント別処理 ─── */
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(admin, stripe, event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(admin, event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(admin, event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(admin, event.data.object as Stripe.Invoice);
        break;

      default:
        logger.debug("STRIPE", `未処理イベント: ${event.type}`);
    }
  } catch (err) {
    // 記録済みなら台帳から消す。こうしないと Stripe の再送が「処理済み」として弾かれ、
    // 決済は済んだのに org が pending のまま、という取りこぼしになる。
    // 500 を返すと Stripe がリトライするので、DB更新の一時失敗はそこで回復する。
    if (recorded) {
      await admin.from("stripe_events").delete().eq("event_id", event.id);
    }
    logger.error("STRIPE", `イベント処理に失敗: ${event.type}`, { error: err });
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/* ═══════════════════════════════════════
   型の短縮
   ═══════════════════════════════════════ */
type WriteClient = NonNullable<ReturnType<typeof getWriteClient>>;

/** string | オブジェクト | null から ID 文字列を取り出す */
function toId(ref: string | { id: string } | null | undefined): string | null {
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref.id;
}

/* ═══════════════════════════════════════
   checkout.session.completed
   決済完了 → 会社を有効化・サイトを公開
   ═══════════════════════════════════════ */
async function handleCheckoutCompleted(
  admin: WriteClient,
  _stripe: Stripe,
  session: Stripe.Checkout.Session
) {
  const orgId = session.metadata?.org_id;
  const siteId = session.metadata?.site_id;

  if (!orgId || !siteId) {
    logger.error("STRIPE", "metadata に org_id / site_id が無い", {
      details: { sessionId: session.id },
    });
    return;
  }

  const customerId = toId(session.customer);
  const subscriptionId = toId(session.subscription);

  // metadata.plan があれば org のプランもここで合わせる。
  // 無料→有料の切り替え（既存 org を再利用した Checkout）でも、この1イベントで
  // plan が active / live と一緒に反映され、subscription.updated の到着を待たずに済む。
  const orgUpdate: {
    status: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    plan?: Plan;
  } = {
    status: "active",
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
  };
  const metaPlan = session.metadata?.plan;
  if (metaPlan) orgUpdate.plan = normalizePlanId(metaPlan);

  const { error: orgErr } = await admin.from("orgs").update(orgUpdate).eq("id", orgId);
  if (orgErr) throw orgErr;

  const { error: siteErr } = await admin
    .from("sites")
    .update({ status: "live", published_at: new Date().toISOString() })
    .eq("id", siteId);
  if (siteErr) throw siteErr;

  logger.success("STRIPE", "決済完了を反映（org=active / site=live）", {
    details: { orgId, siteId },
  });

  // ここから先はベストエフォート。失敗しても申込は成立している
  await notifyGasBestEffort(admin, orgId, siteId, session);
}

/* ═══════════════════════════════════════
   customer.subscription.updated
   プラン変更を反映
   ═══════════════════════════════════════ */
async function handleSubscriptionUpdated(admin: WriteClient, subscription: Stripe.Subscription) {
  const plan = planFromSubscription(subscription);
  if (!plan) {
    logger.warn("STRIPE", "サブスクからプランを判定できず更新をスキップ", {
      details: { subscriptionId: subscription.id },
    });
    return;
  }

  const { error } = await admin
    .from("orgs")
    .update({ plan })
    .eq("stripe_subscription_id", subscription.id);
  if (error) throw error;

  logger.info("STRIPE", `プランを更新: ${plan}`, {
    details: { subscriptionId: subscription.id },
  });
}

/* ═══════════════════════════════════════
   customer.subscription.deleted
   解約 → 会社を canceled・サイトを停止
   ═══════════════════════════════════════ */
async function handleSubscriptionDeleted(admin: WriteClient, subscription: Stripe.Subscription) {
  const { data: org, error: findErr } = await admin
    .from("orgs")
    .select("id")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();
  if (findErr) throw findErr;

  if (!org) {
    logger.warn("STRIPE", "解約対象の会社が見つからない", {
      details: { subscriptionId: subscription.id },
    });
    return;
  }

  const { error: orgErr } = await admin.from("orgs").update({ status: "canceled" }).eq("id", org.id);
  if (orgErr) throw orgErr;

  const { error: siteErr } = await admin
    .from("sites")
    .update({ status: "suspended" })
    .eq("org_id", org.id);
  if (siteErr) throw siteErr;

  logger.info("STRIPE", "解約を反映（org=canceled / site=suspended）", {
    details: { orgId: org.id, subscriptionId: subscription.id },
  });
}

/* ═══════════════════════════════════════
   invoice.payment_failed
   支払い失敗 → 会社を past_due
   ═══════════════════════════════════════ */
async function handlePaymentFailed(admin: WriteClient, invoice: Stripe.Invoice) {
  const subscriptionId = toId(invoice.parent?.subscription_details?.subscription);
  if (!subscriptionId) {
    logger.warn("STRIPE", "支払い失敗にサブスクIDが無い（スキップ）", {
      details: { invoiceId: invoice.id },
    });
    return;
  }

  const { error } = await admin
    .from("orgs")
    .update({ status: "past_due" })
    .eq("stripe_subscription_id", subscriptionId);
  if (error) throw error;

  logger.warn("STRIPE", "支払い失敗を反映（org=past_due）", {
    details: { subscriptionId },
  });
}

/* ═══════════════════════════════════════
   小道具
   ═══════════════════════════════════════ */

/**
 * サブスクからプランを決める。実際に契約している price の lookup_key を最優先にする。
 *
 * カスタマーポータルでプランを変えると price は変わるが、サブスクの metadata は据え置かれる。
 * metadata を先に見ると「古いプランのまま」になってしまうので、lookup_key（＝今まさに
 * 契約している価格）を先に見る。lookup_key の付いていない価格のときだけ metadata を控えに使う。
 */
function planFromSubscription(subscription: Stripe.Subscription): Plan | null {
  const lookupKey = subscription.items?.data?.[0]?.price?.lookup_key;
  if (lookupKey) {
    for (const [plan, key] of Object.entries(PLAN_LOOKUP_KEYS)) {
      if (key === lookupKey) return plan as Plan;
    }
  }

  const metaPlan = subscription.metadata?.plan;
  if (metaPlan) return normalizePlanId(metaPlan);

  return null;
}

/**
 * 完成通知メール（GAS 送信専用）。ベストエフォート。
 * GAS_WEBHOOK_URL が無ければ何もしない。失敗しても投げ返さない（本流を止めない）。
 */
async function notifyGasBestEffort(
  admin: WriteClient,
  orgId: string,
  siteId: string,
  session: Stripe.Checkout.Session
) {
  const gasUrl = process.env.GAS_WEBHOOK_URL;
  if (!gasUrl) return;

  try {
    const { data: org } = await admin
      .from("orgs")
      .select("name, email, phone, industry, plan")
      .eq("id", orgId)
      .maybeSingle();
    const { data: site } = await admin
      .from("sites")
      .select("slug, template_id")
      .eq("id", siteId)
      .maybeSingle();

    await retryGasWebhook(gasUrl, {
      org_id: orgId,
      site_id: siteId,
      company_name: org?.name ?? "",
      email: org?.email ?? "",
      phone: org?.phone ?? "",
      industry: org?.industry ?? "other",
      plan: normalizePlanId(org?.plan ?? "otameshi"),
      template: site?.template_id ?? "",
      slug: site?.slug ?? "",
      site_url: site?.slug ? customerSiteUrl(site.slug) : "",
      stripe_session_id: session.id,
      stripe_customer_id: toId(session.customer) ?? "",
      stripe_subscription_id: toId(session.subscription) ?? "",
      amount_total: session.amount_total,
      _status: "公開中",
    });
    logger.success("GAS_WEBHOOK", "完成通知を送信", { details: { orgId, siteId } });
  } catch (err) {
    logger.warn("GAS_WEBHOOK", "完成通知に失敗（本流は継続）", { error: err });
  }
}
