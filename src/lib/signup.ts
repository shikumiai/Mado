"use server";

/**
 * 申込のサーバー処理。
 *
 * 旧設計では顧客ごとに外部リポジトリとホスティングを新規に立て、申込途中のデータも
 * 外部に一時保存していた。ここではデータベースに行を入れるだけなので、失敗しても
 * 普通にエラーを返せるし、「申込は成功したのにサイトが無い」が構造的に起きない。
 *
 * Server Action にしてあるのは、ログイン中の Cookie セッションをそのまま使い、
 * DB 側の関数の中で auth.uid() を「その人」として効かせるため。
 *
 *  - createFreeSite       … おためし（無料）。1トランザクションで公開まで済ませる
 *  - startPaidCheckout    … おまかせ以上（有料）。枠を pending で押さえて Stripe へ送る
 *  - checkSlugAvailability … 申込画面の「このURLは空いてるか」を返す
 */

import { createServerSupabase } from "./supabase/ssr";
import { getStripe, resolvePriceId } from "./stripe-server";
import { getPlanFromTemplateId, type Plan } from "./stripe";
import { checkSlug } from "./resolve-site";
import { isSlugAvailable } from "./site-repo";
import { generateSiteConfig } from "./template-config-generator";

/* ═══════════════════════════════════════
   入力・戻り値の型
   ═══════════════════════════════════════ */

export interface SignupInput {
  companyName: string;
  email: string;
  phone?: string;
  industry?: string;
  templateId: string;
  slug: string;
}

export type SlugAvailability =
  | { ok: true; slug: string }
  | { ok: false; reason: "reserved" | "format" | "taken" | "unavailable"; message: string };

export type CreateFreeResult =
  | { ok: true; slug: string }
  | { ok: false; reason: "unauthenticated" | "slug" | "invalid" | "failed"; message: string };

export type PaidCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; reason: "unauthenticated" | "slug" | "invalid" | "stripe" | "failed"; message: string };

/* ═══════════════════════════════════════
   共通の下ごしらえ
   ═══════════════════════════════════════ */

/** 必須項目がそろっているか、ざっと確かめる（画面側でも弾いているが念のため） */
function validateInput(input: SignupInput): string | null {
  if (!input.templateId?.trim()) return "テンプレートが選ばれていません。";
  if (!input.companyName?.trim()) return "お名前（会社名）を入力してください。";
  if (!input.email?.trim()) return "メールアドレスが取得できませんでした。ログインし直してください。";
  return null;
}

/** ログイン中のユーザーを取る。未ログインや未接続は null */
async function getSignedInUser() {
  const supabase = await createServerSupabase();
  if (!supabase) return { supabase: null, user: null };
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data?.user ?? null };
}

/* ═══════════════════════════════════════
   URL（スラッグ）の空き確認
   ═══════════════════════════════════════ */

/**
 * 申込画面から呼ぶ。形式・予約語・重複をまとめて見て、使えるかどうかを返す。
 * 実際の可否は DB のトリガーと unique 制約が最終判定するが、ここで早めに知らせる。
 */
export async function checkSlugAvailability(rawSlug: string): Promise<SlugAvailability> {
  const check = checkSlug(rawSlug);
  if (!check.ok) {
    return { ok: false, reason: check.reason, message: check.message };
  }

  const available = await isSlugAvailable(check.slug);
  if (!available) {
    return {
      ok: false,
      reason: "taken",
      message: "このURLは既に使われています。別のURLを入力してください。",
    };
  }
  return { ok: true, slug: check.slug };
}

/* ═══════════════════════════════════════
   おためし（無料）申込
   ═══════════════════════════════════════ */

export async function createFreeSite(input: SignupInput): Promise<CreateFreeResult> {
  const invalid = validateInput(input);
  if (invalid) return { ok: false, reason: "invalid", message: invalid };

  const { supabase, user } = await getSignedInUser();
  if (!supabase) {
    return { ok: false, reason: "failed", message: "ただいま申し込みを準備中です。時間をおいてお試しください。" };
  }
  if (!user) {
    return { ok: false, reason: "unauthenticated", message: "ログインが必要です。" };
  }

  // 形式・予約語を先に弾く
  const check = checkSlug(input.slug);
  if (!check.ok) return { ok: false, reason: "slug", message: check.message };

  const config = generateSiteConfig({
    orderId: "",
    companyName: input.companyName,
    email: input.email,
    phone: input.phone || "",
    industry: input.industry || "other",
    templateId: input.templateId,
    siteSlug: check.slug,
  });

  // ログイン中の本人として呼ぶ。関数の中で auth.uid() が効く
  const { data, error } = await supabase.rpc("signup_free_site", {
    p_name: input.companyName,
    p_email: input.email,
    p_phone: input.phone || "",
    p_industry: input.industry || "other",
    p_template_id: input.templateId,
    p_slug: check.slug,
    p_config: config,
  });

  if (error) {
    console.error("[signup] createFreeSite に失敗", error);
    return { ok: false, reason: "failed", message: "サイトを作成できませんでした。時間をおいてお試しください。" };
  }

  const res = data as { ok?: boolean; reason?: string; slug?: string } | null;
  if (res?.ok) return { ok: true, slug: res.slug ?? check.slug };

  if (res?.reason === "unauthenticated") {
    return { ok: false, reason: "unauthenticated", message: "ログインが必要です。" };
  }
  if (res?.reason === "slug") {
    return { ok: false, reason: "slug", message: "このURLは使えません。別のURLを入力してください。" };
  }
  return { ok: false, reason: "failed", message: "サイトを作成できませんでした。時間をおいてお試しください。" };
}

/* ═══════════════════════════════════════
   おまかせ以上（有料）申込 → Stripe Checkout
   ═══════════════════════════════════════ */

export async function startPaidCheckout(input: SignupInput): Promise<PaidCheckoutResult> {
  const invalid = validateInput(input);
  if (invalid) return { ok: false, reason: "invalid", message: invalid };

  const { supabase, user } = await getSignedInUser();
  if (!supabase) {
    return { ok: false, reason: "failed", message: "ただいま申し込みを準備中です。時間をおいてお試しください。" };
  }
  if (!user) {
    return { ok: false, reason: "unauthenticated", message: "ログインが必要です。" };
  }

  const check = checkSlug(input.slug);
  if (!check.ok) return { ok: false, reason: "slug", message: check.message };

  const plan: Plan = getPlanFromTemplateId(input.templateId);

  // 決済まわりが動く状態か、先に確かめる（枠を作ってから落ちないように）
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, reason: "stripe", message: "ただいま決済を準備中です。時間をおいてお試しください。" };
  }
  const priceId = await resolvePriceId(plan);
  if (!priceId) {
    return { ok: false, reason: "stripe", message: "このプランの価格が設定されていません。しばらくお待ちください。" };
  }

  const config = generateSiteConfig({
    orderId: "",
    companyName: input.companyName,
    email: input.email,
    phone: input.phone || "",
    industry: input.industry || "other",
    templateId: input.templateId,
    siteSlug: check.slug,
  });

  // 枠を pending / draft で先に押さえる
  const { data, error } = await supabase.rpc("signup_pending_site", {
    p_name: input.companyName,
    p_email: input.email,
    p_phone: input.phone || "",
    p_industry: input.industry || "other",
    p_template_id: input.templateId,
    p_slug: check.slug,
    p_config: config,
  });

  if (error) {
    console.error("[signup] signup_pending_site に失敗", error);
    return { ok: false, reason: "failed", message: "お申し込みを開始できませんでした。時間をおいてお試しください。" };
  }

  const res = data as
    | { ok?: boolean; reason?: string; org_id?: string; site_id?: string; slug?: string }
    | null;

  if (!res?.ok) {
    if (res?.reason === "unauthenticated") {
      return { ok: false, reason: "unauthenticated", message: "ログインが必要です。" };
    }
    if (res?.reason === "slug") {
      return { ok: false, reason: "slug", message: "このURLは使えません。別のURLを入力してください。" };
    }
    return { ok: false, reason: "failed", message: "お申し込みを開始できませんでした。時間をおいてお試しください。" };
  }

  const orgId = res.org_id!;
  const siteId = res.site_id!;
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://mado.shikumiai.com";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      // payment_method_types は渡さない。
      // Dashboard の Payment method configurations に決めさせることで、
      // その顧客に出せる支払い方法（card / link など）が自動で選ばれる。
      line_items: [{ price: priceId, quantity: 1 }],
      // 旧設計の order 情報ではなく、押さえた org / site の ID を載せる。
      // Webhook はこれを見て同じ行を active / live に上げる。
      metadata: {
        org_id: orgId,
        site_id: siteId,
        template_id: input.templateId,
        plan,
      },
      subscription_data: {
        metadata: {
          org_id: orgId,
          site_id: siteId,
          plan,
        },
      },
      customer_email: input.email,
      success_url: `${base}/start/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/start`,
    });

    if (!session.url) {
      return { ok: false, reason: "stripe", message: "決済ページを開けませんでした。もう一度お試しください。" };
    }
    return { ok: true, url: session.url };
  } catch (err) {
    console.error("[signup] Stripe Checkout の作成に失敗", err);
    return { ok: false, reason: "stripe", message: "決済ページを開けませんでした。もう一度お試しください。" };
  }
}
