"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/ssr";
import { isUuid, type ActionState } from "@/lib/pilot";
import {
  publicHttpsUrl,
  funnelStatuses,
  funnelSteps,
  type Finding,
} from "@/lib/funnel";

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
function field(form: FormData, key: string, max: number) {
  const v = form.get(key);
  return typeof v === "string" && v.trim().length <= max ? v.trim() : "";
}
function refresh(id: string) {
  revalidatePath(`/pilot/funnels/${id}`);
  revalidatePath("/pilot");
  revalidatePath("/pilot/manage");
}
export async function createFunnel(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const ctx = await context();
  if (!ctx) return { error: "ログインし直してお試しください。" };
  const title = field(form, "title", 100),
    audience = field(form, "audience", 1000),
    goal = field(form, "goal", 1000);
  const entry_url = publicHttpsUrl(field(form, "entry_url", 2000)),
    test_mode = field(form, "test_mode", 30);
  const previous = field(form, "previous_order_id", 36);
  if (
    !title ||
    !audience ||
    !goal ||
    !entry_url ||
    !["before_submit", "test_completion"].includes(test_mode) ||
    form.get("consent") !== "on" ||
    (previous && !isUuid(previous))
  )
    return {
      error: "必須項目と公開HTTPS URL、確認範囲への同意をご確認ください。",
    };
  if (test_mode === "test_completion" && form.get("test_authorized") !== "on")
    return {
      error: "完了まで確認する場合は、テスト環境の操作許可を確認してください。",
    };
  const { data, error } = await ctx.db
    .from("mado_funnel_orders")
    .insert({
      user_id: ctx.user.id,
      title,
      audience,
      goal,
      entry_url,
      test_mode,
      context: field(form, "context", 4000),
      consent: true,
      previous_order_id: previous || null,
    })
    .select("id")
    .single();
  if (error || !data)
    return {
      error:
        "保存できませんでした。対応完了前の依頼は5件までです。再確認は結果が届いた依頼からお申し込みください。",
    };
  revalidatePath("/pilot");
  redirect(`/pilot/funnels/${data.id}`);
}
export async function acceptFunnelQuote(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const ctx = await context();
  if (!ctx) return { error: "ログインし直してください。" };
  const id = field(form, "id", 36),
    version = Number(form.get("version"));
  if (!isUuid(id) || !Number.isInteger(version) || form.get("agree") !== "on")
    return { error: "見積内容への同意をご確認ください。" };
  const { data, error } = await ctx.db
    .from("mado_funnel_orders")
    .update({ quote_accepted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", ctx.user.id)
    .eq("status", "quoted")
    .eq("version", version)
    .is("quote_accepted_at", null)
    .select("id")
    .maybeSingle();
  if (error || !data)
    return {
      error:
        "見積が更新されている可能性があります。画面を再読み込みしてご確認ください。",
    };
  refresh(id);
  return {
    success:
      "見積に同意しました。見積に記載された方法でお支払いください。自動決済は行われません。",
  };
}
export async function updateFunnel(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const ctx = await context();
  if (!ctx?.admin) return { error: "運営管理者としてログインしてください。" };
  const id = field(form, "id", 36),
    status = field(form, "status", 30),
    version = Number(form.get("version"));
  const amount = field(form, "quote_yen", 10),
    quote_yen = amount === "" ? null : Number(amount);
  if (
    !isUuid(id) ||
    !(status in funnelStatuses) ||
    !Number.isInteger(version) ||
    (quote_yen !== null &&
      (!Number.isInteger(quote_yen) || quote_yen < 0 || quote_yen > 1000000))
  )
    return { error: "金額と状態をご確認ください。" };
  const findings: Finding[] = [];
  for (let i = 0; i < 10; i++) {
    const observation = field(form, `observation_${i}`, 2000),
      reviewer = field(form, `reviewer_${i}`, 100),
      suggestion = field(form, `suggestion_${i}`, 2000);
    const hypothesis = field(form, `hypothesis_${i}`, 2000);
    if (!observation && !reviewer && !suggestion && !hypothesis) continue;
    const source = field(form, `source_${i}`, 10),
      step = field(form, `step_${i}`, 20);
    if (
      !observation ||
      !reviewer ||
      !suggestion ||
      !["human", "ai"].includes(source) ||
      !(step in funnelSteps)
    )
      return {
        error: `記録${i + 1}の確認者・観察・改善案を入力してください。`,
      };
    findings.push({
      source: source as "human" | "ai",
      reviewer,
      step,
      observation,
      hypothesis,
      suggestion,
    });
  }
  const { data, error } = await ctx.db
    .from("mado_funnel_orders")
    .update({
      status,
      quote_yen,
      quote_scope: field(form, "quote_scope", 4000),
      payment_confirmed: form.get("payment_confirmed") === "on",
      report_summary: field(form, "report_summary", 4000),
      checked_scope: field(form, "checked_scope", 4000),
      findings,
    })
    .eq("id", id)
    .eq("version", version)
    .select("id")
    .maybeSingle();
  if (error || !data)
    return {
      error:
        "保存できませんでした。画面の更新、見積同意・入金・結果の必須項目と状態の順序をご確認ください。公開済み結果と合意後の見積は変更できません。",
    };
  refresh(id);
  return { success: "保存しました。" };
}
