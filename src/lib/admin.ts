"use server";

/**
 * 管理（Lyo 専用）のサーバー処理。
 *
 * ここでの認可は「ログイン中の管理者セッション」越しに行う（service_role は使わない）。
 * 編集依頼の状態更新は RLS の admin_update_requests ポリシー範囲だけで通る＝
 * 管理者以外が呼んでも DB 側で弾かれる。ここでも早めに弾いて、理由を添えて返す。
 *
 * Supabase が未設定でも import では落とさない（createServerSupabase が null を返す方式に
 * 合わせ、ここでは { ok:false } を理由付きで返すだけにする）。
 */

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/ssr";

/** 編集依頼の状態（0001_init.sql の edit_requests.status と一致させる） */
export type EditRequestStatus = "pending" | "working" | "done" | "rejected";

const VALID_STATUS: EditRequestStatus[] = ["pending", "working", "done", "rejected"];

export type UpdateResult = { ok: true } | { ok: false; reason: string };

/**
 * 編集依頼の状態を変える（pending → working → done / rejected）。
 *
 * 本人のセッション（RLS）で更新する。管理者でなければ RLS が弾くが、
 * その前にここでも確かめて、画面に出せる理由を返す。
 */
export async function updateEditRequestStatus(
  id: string,
  status: EditRequestStatus
): Promise<UpdateResult> {
  if (!VALID_STATUS.includes(status)) {
    return { ok: false, reason: "不明な状態です。" };
  }

  const supabase = await createServerSupabase();
  if (!supabase) {
    return { ok: false, reason: "ただいま準備中です。少し待ってから試してください。" };
  }

  // 本人確認（セッション）
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return { ok: false, reason: "ログインが切れているようです。もう一度ログインしてください。" };
  }

  // 管理者だけ。RLS(admin_update_requests) も同じ判定をするが、早めに弾く
  const { data: adminRow } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  if (!adminRow) {
    return { ok: false, reason: "この操作の権限がありません。" };
  }

  const { error } = await supabase
    .from("edit_requests")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("[admin] 編集依頼の状態更新に失敗", { id, status, error });
    return { ok: false, reason: "状態を更新できませんでした。少し待ってから試してください。" };
  }

  // 一覧・集計を最新にする
  revalidatePath("/admin");
  return { ok: true };
}
