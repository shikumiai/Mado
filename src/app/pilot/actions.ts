"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { createServerSupabase } from "@/lib/supabase/ssr";
import {
  isUuid,
  validAssetPath,
  type ActionState,
  type PilotOrder,
  type Variant,
  type Feedback,
} from "@/lib/pilot";

async function context() {
  const db = await createServerSupabase();
  if (!db) return null;
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  const { data: admin } = await db.rpc("is_platform_admin");
  return { db, user, admin: admin === true };
}
function field(form: FormData, name: string, max: number) {
  const value = form.get(name);
  return typeof value === "string" && value.trim().length <= max
    ? value.trim()
    : "";
}
const signedOut = {
  error: "ログインが切れました。ログインし直してからお試しください。",
};
function refresh(id: string) {
  revalidatePath(`/pilot/${id}`);
  revalidatePath("/pilot");
  revalidatePath("/pilot/manage");
}

export async function createOrder(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const ctx = await context();
  if (!ctx) return signedOut;
  const title = field(form, "title", 100),
    audience = field(form, "audience", 500),
    facts = field(form, "facts", 4000),
    goal = field(form, "goal", 1000);
  if (!title || !audience || !facts || !goal || form.get("consent") !== "on")
    return { error: "必須項目と素材の取り扱いへの同意をご確認ください。" };
  const { data, error } = await ctx.db
    .from("mado_pilot_orders")
    .insert({
      user_id: ctx.user.id,
      title,
      audience,
      facts,
      goal,
      consent: true,
    })
    .select("id")
    .single();
  if (error || !data)
    return {
      error:
        "依頼を保存できませんでした。受付は1アカウント5件までです。時間をおいて再度お試しください。",
    };
  revalidatePath("/pilot");
  redirect(`/pilot/${data.id}`);
}

export async function uploadAsset(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const ctx = await context();
  if (!ctx) return signedOut;
  const id = field(form, "id", 36);
  if (!isUuid(id)) return { error: "依頼が見つかりません。" };
  const { data: order } = await ctx.db
    .from("mado_pilot_orders")
    .select("*")
    .eq("id", id)
    .single();
  if (
    !order ||
    (!ctx.admin &&
      (order.user_id !== ctx.user.id || order.status !== "requested"))
  )
    return { error: "この依頼には写真を追加できません。" };
  const file = form.get("file");
  if (
    !(file instanceof File) ||
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size === 0 ||
    file.size > 3 * 1024 * 1024
  )
    return { error: "3MB以下のJPEG・PNG・WebP画像を選んでください。" };
  const prefix = `${order.user_id}/${id}`;
  const { data: files, error: listError } = await ctx.db.storage
    .from("mado-pilot")
    .list(prefix, { limit: 50 });
  if (listError || (files?.length ?? 0) >= (ctx.admin ? 40 : 5))
    return {
      error: "写真の追加上限に達したか、保存先を確認できませんでした。",
    };
  try {
    const image = await sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: 25000000,
    })
      .rotate()
      .resize({
        width: 2000,
        height: 2000,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 88 })
      .toBuffer();
    const kind =
      ctx.admin && form.get("kind") === "output" ? "output" : "material";
    const path = `${prefix}/${kind}-${crypto.randomUUID()}.webp`;
    const { error } = await ctx.db.storage
      .from("mado-pilot")
      .upload(path, image, { contentType: "image/webp", upsert: false });
    if (error)
      return { error: "画像を保存できませんでした。再度お試しください。" };
    refresh(id);
    return { success: "画像を保存しました。" };
  } catch {
    return {
      error:
        "画像を読み込めませんでした。別の画像か、小さい画像をお試しください。",
    };
  }
}

export async function buyerUpdate(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const ctx = await context();
  if (!ctx) return signedOut;
  const id = field(form, "id", 36),
    version = Number(form.get("version"));
  if (!isUuid(id) || !Number.isInteger(version))
    return { error: "画面を再読み込みしてください。" };
  const { data: order } = await ctx.db
    .from("mado_pilot_orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", ctx.user.id)
    .single();
  if (!order) return { error: "依頼が見つかりません。" };
  let patch: Record<string, unknown>;
  if (form.get("action") === "accept") {
    if (
      form.get("agree") !== "on" ||
      order.status !== "quoted" ||
      order.quote_accepted_at
    )
      return { error: "見積内容を確認し、同意欄にチェックしてください。" };
    patch = { quote_accepted_at: new Date().toISOString() };
  } else {
    const selected = Number(form.get("selected_variant"));
    const revision = field(form, "revision_note", 1000);
    if (
      ![1, 2, 3].includes(selected) ||
      order.status !== "review" ||
      order.selected_variant !== null
    )
      return { error: "比較できる3案から1案を選んでください。" };
    patch = { selected_variant: selected, revision_note: revision };
  }
  const { data, error } = await ctx.db
    .from("mado_pilot_orders")
    .update(patch)
    .eq("id", id)
    .eq("version", version)
    .select("id")
    .maybeSingle();
  if (error || !data)
    return {
      error:
        "内容が更新されている可能性があります。画面を再読み込みしてご確認ください。",
    };
  refresh(id);
  return {
    success:
      form.get("action") === "accept"
        ? "見積への同意を保存しました。入金方法は運営からご案内します。ここでは決済されません。"
        : "採用案を保存しました。運営が仕上げを進めます。",
  };
}

export async function operatorUpdate(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const ctx = await context();
  if (!ctx?.admin) return { error: "運営管理者だけが更新できます。" };
  const id = field(form, "id", 36),
    version = Number(form.get("version"));
  if (!isUuid(id) || !Number.isInteger(version))
    return { error: "画面を再読み込みしてください。" };
  const { data } = await ctx.db
    .from("mado_pilot_orders")
    .select("*")
    .eq("id", id)
    .single();
  if (!data) return { error: "依頼が見つかりません。" };
  const order = data as PilotOrder;
  const quote = Number(form.get("quote_yen"));
  const status = field(form, "status", 30);
  const variants: Variant[] = [];
  for (let i = 1; i <= 3; i++) {
    const title = field(form, `variant_title_${i}`, 100),
      description = field(form, `variant_description_${i}`, 1000),
      path = field(form, `variant_path_${i}`, 300),
      creator = field(form, `variant_creator_${i}`, 100);
    if (title || path || description || creator) {
      if (!title || !description || !creator || !validAssetPath(path, order))
        return {
          error: `案${i}の見出し・説明・提供者・画像をすべて入力してください。`,
        };
      variants.push({ title, description, path, creator });
    }
  }
  if (variants.length !== 0 && variants.length !== 3)
    return { error: "制作案は3案まとめて保存してください。" };
  const feedback: Feedback[] = [];
  for (let i = 1; i <= 5; i++) {
    const respondent = field(form, `respondent_${i}`, 80),
      reason = field(form, `reason_${i}`, 1000),
      choice = Number(form.get(`choice_${i}`));
    if (respondent || reason) {
      if (!respondent || !reason || ![1, 2, 3].includes(choice))
        return { error: `回答${i}の匿名名・選択案・理由を入力してください。` };
      feedback.push({ respondent, choice, reason });
    }
  }
  const delivery = field(form, "delivery_path", 300);
  if (delivery && !validAssetPath(delivery, order))
    return { error: "この依頼にアップロードした納品画像を選んでください。" };
  const { data: files, error: filesError } = await ctx.db.storage
    .from("mado-pilot")
    .list(`${order.user_id}/${id}`, { limit: 50 });
  const available = new Set(
    (files ?? []).map((f) => `${order.user_id}/${id}/${f.name}`),
  );
  if (
    filesError ||
    variants.some((v) => !available.has(v.path)) ||
    (delivery && !available.has(delivery))
  )
    return { error: "指定された画像が保存先に見つかりません。" };
  if (
    status === "quoted" &&
    !(files ?? []).some((f) => f.name.startsWith("material-"))
  )
    return { error: "見積の提示前に、依頼者による商品写真の追加が必要です。" };
  const { data: updated, error } = await ctx.db
    .from("mado_pilot_orders")
    .update({
      status,
      quote_yen: Number.isInteger(quote) && quote > 0 ? quote : null,
      quote_scope: field(form, "quote_scope", 4000),
      payment_confirmed: form.get("payment_confirmed") === "on",
      variants,
      feedback,
      delivery_path: delivery,
      operator_note: field(form, "operator_note", 2000),
    })
    .eq("id", id)
    .eq("version", version)
    .select("id")
    .maybeSingle();
  if (error || !updated)
    return {
      error:
        "保存できませんでした。見積同意・入金確認・3案・採用案・納品画像と、進捗の順番を確認してください。他の画面で更新した場合は再読み込みしてください。",
    };
  refresh(id);
  return { success: "依頼者への表示内容を更新しました。" };
}

export async function applyCreator(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const ctx = await context();
  if (!ctx) return signedOut;
  const display_name = field(form, "display_name", 80),
    specialty = field(form, "specialty", 1000),
    method = field(form, "method", 8000);
  if (!display_name || !specialty || !method || form.get("consent") !== "on")
    return { error: "必須項目と同意欄をご確認ください。" };
  const { error } = await ctx.db
    .from("mado_pilot_applications")
    .insert({
      user_id: ctx.user.id,
      display_name,
      contact_email: ctx.user.email,
      specialty,
      method,
      consent: true,
    });
  if (error)
    return { error: "応募を保存できませんでした。応募は1アカウント1件です。" };
  revalidatePath("/pilot/join");
  revalidatePath("/pilot/manage");
  return {
    success:
      "応募を受け付けました。報酬・利用範囲を個別に確認してから制作を依頼します。",
  };
}
