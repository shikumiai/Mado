/**
 * ログイン中の人が「誰で、どの会社の、どのサイトを触ってよいか」を返す。
 *
 * 権限そのものは DB の RLS が守っている。ここは画面を出し分けるための
 * 便利関数で、ここを通さずに書けてしまう抜け道は作らない。
 */

import { createServerSupabase } from "./supabase/ssr";
import { getWriteClient, isMissingTableError } from "./supabase/server";
import type { User } from "@supabase/supabase-js";

export interface MyOrg {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
}

export interface MySite {
  id: string;
  slug: string;
  templateId: string;
  status: string;
}

export interface MyAccount {
  user: User;
  org: MyOrg | null;
  sites: MySite[];
  isPlatformAdmin: boolean;
}

/** ログイン中のユーザー。未ログインなら null */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

/**
 * ログイン中の人の、会社とサイト一式。
 *
 * 取得は RLS 越しなので、他人の会社は最初から返ってこない。
 * 会社が無い（申込前）ときは org が null になる。呼び出し側で /start へ送る。
 */
export async function getMyAccount(): Promise<MyAccount | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) return null;
  const user = userData.user;

  const { data: orgs, error: orgErr } = await supabase
    .from("orgs")
    .select("id, name, email, plan, status")
    .limit(1);

  if (orgErr && !isMissingTableError(orgErr)) {
    console.error("[auth] 会社の取得に失敗", orgErr);
  }
  const org = (orgs?.[0] as MyOrg | undefined) ?? null;

  let sites: MySite[] = [];
  if (org) {
    const { data: siteRows } = await supabase
      .from("sites")
      .select("id, slug, template_id, status")
      .eq("org_id", org.id)
      .order("created_at", { ascending: true });

    sites = (siteRows ?? []).map((r) => ({
      id: r.id as string,
      slug: r.slug as string,
      templateId: r.template_id as string,
      status: r.status as string,
    }));
  }

  const { data: adminRow } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return { user, org, sites, isPlatformAdmin: Boolean(adminRow) };
}

/**
 * その site を触ってよいか確かめる。よければ site を返す。
 *
 * 編集系の処理は必ずこれを通してから始める。
 * RLS も同じ判定をするので、ここを抜かしても他人のデータは書けないが、
 * 「権限が無い」を早い段階できれいに返すために使う。
 */
export async function requireSiteAccess(
  siteId: string
): Promise<{ ok: true; site: MySite; user: User } | { ok: false; reason: "unauthenticated" | "forbidden" }> {
  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, reason: "unauthenticated" };

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { ok: false, reason: "unauthenticated" };

  // RLS 越しに引く。自分の会社のサイトでなければ返ってこない
  const { data, error } = await supabase
    .from("sites")
    .select("id, slug, template_id, status")
    .eq("id", siteId)
    .maybeSingle();

  if (error || !data) return { ok: false, reason: "forbidden" };

  return {
    ok: true,
    user: userData.user,
    site: {
      id: data.id as string,
      slug: data.slug as string,
      templateId: data.template_id as string,
      status: data.status as string,
    },
  };
}

/**
 * ユーザーを会社に紐付ける（申込時に1回だけ呼ぶ）。
 *
 * org_members には顧客自身が書き込むポリシーを作っていないので、
 * サーバー側から service_role で入れる。
 * 呼ぶ前に「その org を作ったのがこの人か」を必ず確かめること。
 */
export async function linkUserToOrg(
  orgId: string,
  userId: string,
  role: "owner" | "editor" = "owner"
): Promise<boolean> {
  const admin = getWriteClient();
  if (!admin) return false;

  const { error } = await admin
    .from("org_members")
    .upsert({ org_id: orgId, user_id: userId, role }, { onConflict: "org_id,user_id" });

  if (error) {
    console.error("[auth] 会社への紐付けに失敗", { orgId, userId, error });
    return false;
  }
  return true;
}
