"use server";

/**
 * 申込のサーバー処理（名前先行フロー）。
 *
 * 考え方はひとつ。「名前（URL）を取る → ログイン → 続きは下書き保存つきで進む」。
 * 途中でブラウザを閉じても、次に開いたときサーバーの下書きから続けられる。
 *
 * 流れと、この中の関数の対応:
 *   0 アドレス   … checkSlugAvailability（空き確認）
 *   1 ログイン   … reserveSite（ログイン直後に名前を確保して枠を押さえる）
 *   2〜6 各決定  … saveSignupDraft（決めるたびにサーバーへ下書き保存）
 *   再開         … loadSignupDraft（前回の続きを読む）
 *   7 公開       … publishFreeSite（無料・即公開） / startPaidCheckoutForSite（有料・Stripe へ）
 *
 * 枠の押さえ方は DB の signup_pending_site 1本にそろえてある。
 * orgs.status='pending' / sites.status='draft' で先に作り、無料なら publishFreeSite が、
 * 有料なら Stripe の webhook が active / live に上げる。ここは変えていない。
 *
 * 認可について:
 *   下書きの書き換えは service_role（RLS を素通りする）で行う。
 *   その前に必ず、ログイン中の Cookie セッションで sites を1件引いて
 *   「自分の会社のサイトか」を確かめる（DB の owns_site と同じ判定を RLS にさせている）。
 *   引けなければ書かない。
 */

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createServerSupabase } from "./supabase/ssr";
import { getWriteClient } from "./supabase/server";
import { getStripe, resolvePriceId, createSubscriptionCheckoutSession } from "./stripe-server";
import { normalizePlanId, type Plan } from "./stripe";
import { checkSlug } from "./resolve-site";
import { isSlugAvailable } from "./site-repo";
import { generateSiteConfig } from "./template-config-generator";
import type { SiteConfig } from "./site-config-schema";

/* ═══════════════════════════════════════
   型
   ═══════════════════════════════════════ */

/** 申込画面で選んだ色（代表カラー＋サブ最大2つ） */
export interface SignupBrand {
  primary?: string;
  sub1?: string;
  sub2?: string;
}

/** 各ステップで決まったこと。決まった分だけ送る */
export interface SignupDraftPatch {
  brand?: SignupBrand | null;
  /** 色の組の名前（「木のぬくもり」など）。画面に出すためだけの控え */
  colorSetId?: string | null;
  /** 業種テンプレートの系統（warm-craft など） */
  family?: string | null;
  /** 細かい商売の名前（industry-registry の id） */
  industryId?: string | null;
  plan?: Plan;
  companyName?: string;
  email?: string;
  phone?: string;
  /** 途中まで進んだ位置。再開に使う */
  step?: number;
}

/** サーバーに保存されている下書き一式 */
export interface SignupDraftState {
  siteId: string;
  orgId: string;
  slug: string;
  brand: SignupBrand | null;
  colorSetId: string | null;
  family: string | null;
  industryId: string | null;
  plan: Plan;
  companyName: string;
  email: string;
  phone: string;
  step: number;
}

export type SlugAvailability =
  | { ok: true; slug: string }
  | { ok: false; reason: "reserved" | "format" | "taken" | "unavailable"; message: string };

/** 下書きに触る処理が返す「できなかった理由」 */
export type DraftFailReason =
  | "unauthenticated"
  | "not_found"
  | "not_draft"
  | "invalid"
  | "slug"
  | "taken"
  | "stripe"
  | "failed";

export type ReserveResult =
  | { ok: true; siteId: string; orgId: string; slug: string }
  | { ok: false; reason: DraftFailReason; message: string };

export type SaveDraftResult =
  | { ok: true }
  | { ok: false; reason: DraftFailReason; message: string };

export type LoadDraftResult =
  | { ok: true; draft: SignupDraftState }
  | { ok: false; reason: "unauthenticated" | "none" | "failed" };

export type PublishResult =
  | { ok: true; slug: string }
  | { ok: false; reason: DraftFailReason; message: string };

export type PaidCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; reason: DraftFailReason; message: string };

/* ═══════════════════════════════════════
   下書きの置き場
   ═══════════════════════════════════════ */

/**
 * 申込ウィザードだけが使う控え。site_configs.config の中に _signup として入れる。
 * 公開サイトを描く側はこのキーを見ないので、あっても害はない。
 */
interface SignupMeta {
  brand?: SignupBrand | null;
  colorSetId?: string | null;
  family?: string | null;
  industryId?: string | null;
  step?: number;
  savedAt?: string;
}

type DraftConfig = SiteConfig & { _signup?: SignupMeta };

const NOT_READY = "ただいま申し込みを準備中です。時間をおいてお試しください。";
const GONE =
  "下書きが見つかりませんでした。お手数ですが、もう一度名前から始めてください。";

/** 名前だけ決まっている段階で使う仮のテンプレート */
const PROVISIONAL_TEMPLATE = "warm-craft";

/** 系統 + プラン → テンプレートID（おまかせ=-mid / プロ=-pro / おためし=無印） */
function templateIdFor(family: string | null | undefined, plan: Plan): string {
  const base = family || PROVISIONAL_TEMPLATE;
  if (plan === "omakase") return `${base}-mid`;
  if (plan === "omakase-pro") return `${base}-pro`;
  return base;
}

function readMeta(config: unknown): SignupMeta {
  if (!config || typeof config !== "object") return {};
  const meta = (config as DraftConfig)._signup;
  return meta && typeof meta === "object" ? meta : {};
}

/** 1対1の関連は実装差で配列になることがあるので、どちらでも拾えるようにする */
function pickOne<T>(raw: unknown): T | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return (raw[0] as T) ?? null;
  return raw as T;
}

type OrgRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  industry: string;
  plan: string;
  status: string;
};

type DraftRow = {
  siteId: string;
  slug: string;
  templateId: string;
  siteStatus: string;
  org: OrgRow;
  config: unknown;
};

const DRAFT_SELECT =
  "id, slug, template_id, status, created_at, " +
  "orgs(id, name, email, phone, industry, plan, status), " +
  "site_configs(config)";

function toDraftRow(raw: unknown): DraftRow | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const org = pickOne<OrgRow>(row.orgs);
  if (!org) return null;
  const cfg = pickOne<{ config: unknown }>(row.site_configs);
  return {
    siteId: row.id as string,
    slug: (row.slug as string) || "",
    templateId: (row.template_id as string) || PROVISIONAL_TEMPLATE,
    siteStatus: (row.status as string) || "draft",
    org,
    config: cfg?.config ?? null,
  };
}

/** 行の中身を、画面が扱う形にほどく */
function toDraftState(row: DraftRow): SignupDraftState {
  const meta = readMeta(row.config);
  return {
    siteId: row.siteId,
    orgId: row.org.id,
    slug: row.slug,
    brand: meta.brand ?? null,
    colorSetId: meta.colorSetId ?? null,
    family: meta.family ?? null,
    industryId: meta.industryId ?? null,
    plan: normalizePlanId(row.org.plan || "otameshi"),
    // 仮で入れた「名前＝会社名」は空として返す（会社情報の欄を空で出したい）
    companyName: row.org.name === row.slug ? "" : row.org.name || "",
    email: row.org.email || "",
    phone: row.org.phone || "",
    step: typeof meta.step === "number" ? meta.step : 0,
  };
}

/* ═══════════════════════════════════════
   ログインと持ち主の確認
   ═══════════════════════════════════════ */

async function getSignedInUser(): Promise<{
  supabase: SupabaseClient | null;
  user: User | null;
}> {
  const supabase = await createServerSupabase();
  if (!supabase) return { supabase: null, user: null };
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data?.user ?? null };
}

/**
 * ログイン中の人の「申込途中の下書き」を1件探す。
 * RLS 越しに引くので、他人のサイトは最初から返ってこない。
 */
async function findDraftRow(supabase: SupabaseClient): Promise<DraftRow | null> {
  const { data, error } = await supabase
    .from("sites")
    .select(DRAFT_SELECT)
    .eq("status", "draft")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[signup] 下書きの検索に失敗", error);
    return null;
  }

  for (const raw of data ?? []) {
    const row = toDraftRow(raw);
    if (row && row.org.status === "pending") return row;
  }
  return null;
}

/**
 * 「この site を、この人が、申込途中として触ってよいか」を確かめる。
 *
 * service_role で書く前に必ずこれを通す。判定そのものは RLS にさせている
 * （Cookie セッションで引けたら、その人の会社のサイト）。
 */
async function requireDraftSite(
  siteId: string,
): Promise<
  | { ok: true; user: User; row: DraftRow }
  | { ok: false; reason: DraftFailReason; message: string }
> {
  if (!siteId || typeof siteId !== "string") {
    return { ok: false, reason: "invalid", message: "申込の下書きが指定されていません。" };
  }

  const { supabase, user } = await getSignedInUser();
  if (!supabase) return { ok: false, reason: "failed", message: NOT_READY };
  if (!user) return { ok: false, reason: "unauthenticated", message: "ログインが必要です。" };

  const { data, error } = await supabase
    .from("sites")
    .select(DRAFT_SELECT)
    .eq("id", siteId)
    .maybeSingle();

  if (error) {
    console.error("[signup] サイトの確認に失敗", { siteId, error });
    return { ok: false, reason: "failed", message: NOT_READY };
  }

  const row = data ? toDraftRow(data) : null;
  // 引けない = 自分の会社のものではない、または期限切れで空けられた
  if (!row) return { ok: false, reason: "not_found", message: GONE };

  if (row.siteStatus !== "draft" || row.org.status !== "pending") {
    return {
      ok: false,
      reason: "not_draft",
      message: "このサイトはすでに公開されています。編集画面からお進みください。",
    };
  }

  return { ok: true, user, row };
}

/* ═══════════════════════════════════════
   下書きの書き込み（service_role・認可の後だけ）
   ═══════════════════════════════════════ */

/**
 * 下書きの内容を1回で書き切る。
 *
 * 保存先の割り当て:
 *   orgs.plan / name / email / phone / industry … 会社とプラン
 *   sites.template_id                           … 業種の系統 + プラン
 *   site_configs.config                         … テンプレ・色・構成・会社情報（+ _signup の控え）
 */
async function writeDraft(
  row: DraftRow,
  patch: SignupDraftPatch,
  publish: { free: true } | { paidPlan: Plan } | null,
): Promise<{ ok: true; slug: string } | { ok: false; reason: DraftFailReason; message: string }> {
  const admin = getWriteClient();
  if (!admin) return { ok: false, reason: "failed", message: NOT_READY };

  const current = toDraftState(row);

  const brand = patch.brand !== undefined ? patch.brand : current.brand;
  const colorSetId = patch.colorSetId !== undefined ? patch.colorSetId : current.colorSetId;
  const family = patch.family !== undefined ? patch.family : current.family;
  const industryId = patch.industryId !== undefined ? patch.industryId : current.industryId;
  const plan = patch.plan ?? current.plan;
  const companyName = (patch.companyName ?? current.companyName).trim();
  const email = (patch.email ?? current.email).trim();
  const phone = (patch.phone ?? current.phone).trim();
  const step = patch.step ?? current.step;

  const templateId = templateIdFor(family, plan);
  const industry = industryId || family || "other";

  const config = generateSiteConfig({
    orderId: "",
    // 会社名がまだなら、サイトのアドレスを仮の名前にしておく（orgs.name は必須）
    companyName: companyName || row.slug,
    email,
    phone,
    industry,
    templateId,
    siteSlug: row.slug,
    brand: brand ?? undefined,
  }) as DraftConfig;

  config._signup = {
    brand: brand ?? null,
    colorSetId: colorSetId ?? null,
    family: family ?? null,
    industryId: industryId ?? null,
    step,
    savedAt: new Date().toISOString(),
  };

  /* --- 会社 --- */
  const orgPatch: Record<string, unknown> = {
    name: companyName || row.slug,
    email: email || row.org.email,
    phone,
    industry,
    plan: publish && "paidPlan" in publish ? publish.paidPlan : plan,
    updated_at: new Date().toISOString(),
  };
  if (publish && "free" in publish) {
    orgPatch.plan = "otameshi";
    orgPatch.status = "active";
  }

  const { error: orgErr } = await admin.from("orgs").update(orgPatch).eq("id", row.org.id);
  if (orgErr) {
    console.error("[signup] 会社の保存に失敗", { orgId: row.org.id, orgErr });
    return { ok: false, reason: "failed", message: "保存できませんでした。時間をおいてお試しください。" };
  }

  /* --- サイト --- */
  const sitePatch: Record<string, unknown> = {
    template_id: templateId,
    updated_at: new Date().toISOString(),
  };
  if (publish && "free" in publish) {
    sitePatch.status = "live";
    sitePatch.published_at = new Date().toISOString();
  }

  const { error: siteErr } = await admin.from("sites").update(sitePatch).eq("id", row.siteId);
  if (siteErr) {
    console.error("[signup] サイトの保存に失敗", { siteId: row.siteId, siteErr });
    return { ok: false, reason: "failed", message: "保存できませんでした。時間をおいてお試しください。" };
  }

  /* --- 中身 --- */
  const { error: cfgErr } = await admin
    .from("site_configs")
    .update({ config, updated_at: new Date().toISOString() })
    .eq("site_id", row.siteId);

  if (cfgErr) {
    console.error("[signup] 設定の保存に失敗", { siteId: row.siteId, cfgErr });
    return { ok: false, reason: "failed", message: "保存できませんでした。時間をおいてお試しください。" };
  }

  return { ok: true, slug: row.slug };
}

/* ═══════════════════════════════════════
   0. URL（スラッグ）の空き確認
   ═══════════════════════════════════════ */

/**
 * トップページと申込画面から呼ぶ。形式・予約語・重複をまとめて見て、使えるかどうかを返す。
 * 最終的な可否は DB のトリガーと unique 制約が決める。ここは早めに知らせるためのもの。
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
      message: "この名前はもう使われています。別の名前を入れてください。",
    };
  }
  return { ok: true, slug: check.slug };
}

/* ═══════════════════════════════════════
   1. 名前を確保する（ログイン直後）
   ═══════════════════════════════════════ */

/**
 * ログイン中のユーザーとして、その名前で枠を押さえる。
 *
 * すでに申込途中の下書き（orgs.status='pending' かつ sites.status='draft'）があれば、
 * 新しく作らずにそれを返す。名前だけ変えたい場合は、その下書きの slug を付け替える。
 * こうしないと、戻る・再読み込みのたびに空の会社が増えていく。
 */
export async function reserveSite(rawSlug: string): Promise<ReserveResult> {
  const check = checkSlug(rawSlug);
  if (!check.ok) return { ok: false, reason: "slug", message: check.message };

  const { supabase, user } = await getSignedInUser();
  if (!supabase) return { ok: false, reason: "failed", message: NOT_READY };
  if (!user) return { ok: false, reason: "unauthenticated", message: "ログインが必要です。" };

  /* --- すでに下書きがあるなら、それを使い回す --- */
  const existing = await findDraftRow(supabase);
  if (existing) {
    if (existing.slug === check.slug) {
      return { ok: true, siteId: existing.siteId, orgId: existing.org.id, slug: existing.slug };
    }

    const available = await isSlugAvailable(check.slug);
    if (!available) {
      return {
        ok: false,
        reason: "taken",
        message: "この名前はもう使われています。別の名前を入れてください。",
      };
    }

    // ここに来る時点で、この下書きが本人のものだと RLS 越しに確認できている
    const admin = getWriteClient();
    if (!admin) return { ok: false, reason: "failed", message: NOT_READY };

    const { error } = await admin
      .from("sites")
      .update({ slug: check.slug, updated_at: new Date().toISOString() })
      .eq("id", existing.siteId);

    if (error) {
      console.error("[signup] 名前の付け替えに失敗", { siteId: existing.siteId, error });
      return {
        ok: false,
        reason: "taken",
        message: "この名前は使えませんでした。別の名前を入れてください。",
      };
    }
    return { ok: true, siteId: existing.siteId, orgId: existing.org.id, slug: check.slug };
  }

  /* --- 新しく枠を押さえる（orgs / org_members / sites / site_configs を1トランザクションで） --- */
  const { data, error } = await supabase.rpc("signup_pending_site", {
    p_name: check.slug, // 会社名はまだ聞いていないので、仮に名前を入れておく
    p_email: user.email ?? "",
    p_phone: "",
    p_industry: "other",
    p_template_id: PROVISIONAL_TEMPLATE,
    p_slug: check.slug,
    p_config: {},
  });

  if (error) {
    console.error("[signup] 名前の確保に失敗", error);
    return { ok: false, reason: "failed", message: "名前を確保できませんでした。時間をおいてお試しください。" };
  }

  const res = data as { ok?: boolean; reason?: string; org_id?: string; site_id?: string } | null;

  if (!res?.ok) {
    if (res?.reason === "unauthenticated") {
      return { ok: false, reason: "unauthenticated", message: "ログインが必要です。" };
    }
    if (res?.reason === "slug") {
      return {
        ok: false,
        reason: "taken",
        message: "この名前はもう使われています。別の名前を入れてください。",
      };
    }
    return { ok: false, reason: "failed", message: "名前を確保できませんでした。時間をおいてお試しください。" };
  }

  return { ok: true, siteId: res.site_id!, orgId: res.org_id!, slug: check.slug };
}

/* ═══════════════════════════════════════
   2〜6. 決めるたびに下書き保存
   ═══════════════════════════════════════ */

/** 途中で決めたことをサーバーに預ける。閉じても次に開いたとき続きから始められる */
export async function saveSignupDraft(
  siteId: string,
  patch: SignupDraftPatch,
): Promise<SaveDraftResult> {
  const access = await requireDraftSite(siteId);
  if (!access.ok) return { ok: false, reason: access.reason, message: access.message };

  const res = await writeDraft(access.row, patch, null);
  if (!res.ok) return { ok: false, reason: res.reason, message: res.message };
  return { ok: true };
}

/** 申込画面を開いたときに、前回の続きを読む */
export async function loadSignupDraft(): Promise<LoadDraftResult> {
  const { supabase, user } = await getSignedInUser();
  if (!supabase) return { ok: false, reason: "failed" };
  if (!user) return { ok: false, reason: "unauthenticated" };

  const row = await findDraftRow(supabase);
  if (!row) return { ok: false, reason: "none" };

  const draft = toDraftState(row);
  // メールが空なら、ログイン中のものを既定にしておく
  if (!draft.email && user.email) draft.email = user.email;
  return { ok: true, draft };
}

/* ═══════════════════════════════════════
   7. 確認して公開
   ═══════════════════════════════════════ */

/** おためし（無料）。その場で公開まで済ませる */
export async function publishFreeSite(
  siteId: string,
  patch: SignupDraftPatch,
): Promise<PublishResult> {
  const access = await requireDraftSite(siteId);
  if (!access.ok) return { ok: false, reason: access.reason, message: access.message };

  const current = toDraftState(access.row);
  const companyName = (patch.companyName ?? current.companyName).trim();
  if (!companyName) {
    return { ok: false, reason: "invalid", message: "お名前（会社名）を入力してください。" };
  }

  const res = await writeDraft(
    access.row,
    { ...patch, companyName, plan: "otameshi" },
    { free: true },
  );
  if (!res.ok) return { ok: false, reason: res.reason, message: res.message };
  return { ok: true, slug: res.slug };
}

/**
 * おまかせ以上（有料）。押さえてある枠のまま Stripe へ送る。
 * 決済が終わると webhook が同じ org / site を active / live に上げる。
 */
export async function startPaidCheckoutForSite(
  siteId: string,
  plan: Plan,
  patch: SignupDraftPatch = {},
): Promise<PaidCheckoutResult> {
  if (plan !== "omakase" && plan !== "omakase-pro") {
    return { ok: false, reason: "invalid", message: "このプランはお支払いが不要です。" };
  }

  const access = await requireDraftSite(siteId);
  if (!access.ok) return { ok: false, reason: access.reason, message: access.message };

  const current = toDraftState(access.row);
  const companyName = (patch.companyName ?? current.companyName).trim();
  if (!companyName) {
    return { ok: false, reason: "invalid", message: "お名前（会社名）を入力してください。" };
  }
  const email = (patch.email ?? current.email ?? access.user.email ?? "").trim();

  // 決済まわりが動く状態か、枠に触る前に確かめる
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, reason: "stripe", message: "ただいま決済を準備中です。時間をおいてお試しください。" };
  }
  const priceId = await resolvePriceId(plan);
  if (!priceId) {
    return {
      ok: false,
      reason: "stripe",
      message: "このプランの価格が設定されていません。しばらくお待ちください。",
    };
  }

  const saved = await writeDraft(
    access.row,
    { ...patch, companyName, email, plan },
    { paidPlan: plan },
  );
  if (!saved.ok) return { ok: false, reason: saved.reason, message: saved.message };

  const family = patch.family !== undefined ? patch.family : current.family;
  const templateId = templateIdFor(family, plan);
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://mado.shikumiai.com";

  try {
    // metadata に org / site / plan を載せるので、webhook はこの行を active / live に上げられる
    const session = await createSubscriptionCheckoutSession(stripe, {
      plan,
      priceId,
      orgId: access.row.org.id,
      siteId: access.row.siteId,
      templateId,
      email,
      successUrl: `${base}/start/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${base}/start`,
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
