/**
 * 管理（Lyo 専用）/admin — 顧客・月次売上・サイト・編集依頼を1枚に。
 *
 * ゲート: getMyAccount() の isPlatformAdmin が false／未ログインなら外へ送る。
 * データ取得はすべて「ログイン中の管理者セッション（RLS）」越し。admin_read_* の
 * ポリシーが全件読取を許すので service_role は使わない。集計（月次売上）はここで出し、
 * 一覧と編集依頼の状態更新は AdminConsole（client）が受け持つ。
 */

import { redirect } from "next/navigation";
import { getMyAccount } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/ssr";
import { isMissingTableError } from "@/lib/supabase/server";
import { PLAN_LABELS, PLAN_PRICES, normalizePlanId, type Plan } from "@/lib/stripe";
import { Card } from "@/components/ui";
import { AdminConsole, type OrgVM, type SiteVM, type RequestVM } from "./AdminConsole";
import type { EditRequestStatus } from "@/lib/admin";
import { Wallet, Users, FileEdit, Building2 } from "lucide-react";

export const metadata = { title: "管理｜Mado" };

const PLAN_ORDER: Plan[] = ["otameshi", "omakase", "omakase-pro"];

/** 表示用の月額（"¥1,480"）から数値（1480）を取り出す。金額の正は PLAN_PRICES */
function planYen(plan: Plan): number {
  return Number(PLAN_PRICES[plan].replace(/[^0-9]/g, "")) || 0;
}

function yen(n: number): string {
  return `¥${n.toLocaleString("ja-JP")}`;
}

function jpDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

/* Supabase の行の型（select したぶんだけ） */
type OrgRow = { id: string; name: string; email: string; plan: string; status: string; created_at: string };
type SiteRow = { id: string; org_id: string; slug: string; status: string; created_at: string };
type ReqRow = { id: string; site_id: string; kind: string; body: string; status: string; created_at: string };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const account = await getMyAccount();
  if (!account) redirect("/auth/login?next=/admin");
  if (!account.isPlatformAdmin) redirect("/app");

  const { tab } = await searchParams;

  const supabase = await createServerSupabase();

  let orgRows: OrgRow[] = [];
  let siteRows: SiteRow[] = [];
  let reqRows: ReqRow[] = [];

  if (supabase) {
    const [orgsRes, sitesRes, reqRes] = await Promise.all([
      supabase
        .from("orgs")
        .select("id, name, email, plan, status, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("sites")
        .select("id, org_id, slug, status, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("edit_requests")
        .select("id, site_id, kind, body, status, created_at")
        .order("created_at", { ascending: false }),
    ]);

    for (const [res, label] of [
      [orgsRes, "orgs"],
      [sitesRes, "sites"],
      [reqRes, "edit_requests"],
    ] as const) {
      if (res.error && !isMissingTableError(res.error)) {
        console.error(`[admin] ${label} の取得に失敗`, res.error);
      }
    }

    orgRows = (orgsRes.data as OrgRow[] | null) ?? [];
    siteRows = (sitesRes.data as SiteRow[] | null) ?? [];
    reqRows = (reqRes.data as ReqRow[] | null) ?? [];
  }

  // 会社名の引き当て表
  const orgNameById = new Map(orgRows.map((o) => [o.id, o.name]));

  // ── ビューモデルに整形（client へ渡す用） ──
  const orgs: OrgVM[] = orgRows.map((o) => ({
    id: o.id,
    name: o.name,
    email: o.email,
    plan: normalizePlanId(o.plan),
    status: o.status,
    created: jpDate(o.created_at),
  }));

  const sites: SiteVM[] = siteRows.map((s) => ({
    id: s.id,
    slug: s.slug,
    status: s.status,
    orgName: orgNameById.get(s.org_id) ?? "（会社不明）",
    created: jpDate(s.created_at),
    isLive: s.status === "live",
  }));

  const siteInfoById = new Map(
    siteRows.map((s) => [s.id, { slug: s.slug, orgName: orgNameById.get(s.org_id) ?? "（会社不明）" }])
  );

  const requests: RequestVM[] = reqRows.map((r) => {
    const info = siteInfoById.get(r.site_id);
    return {
      id: r.id,
      kind: r.kind,
      body: r.body,
      status: (["pending", "working", "done", "rejected"].includes(r.status)
        ? r.status
        : "pending") as EditRequestStatus,
      orgName: info?.orgName ?? "（会社不明）",
      siteSlug: info?.slug ?? "—",
      created: jpDate(r.created_at),
    };
  });

  // ── 月次売上（active の会社をプラン別に集計）──
  const activeOrgs = orgs.filter((o) => o.status === "active");
  const breakdown = PLAN_ORDER.map((plan) => {
    const count = activeOrgs.filter((o) => o.plan === plan).length;
    return { plan, count, subtotal: count * planYen(plan) };
  });
  const mrr = breakdown.reduce((sum, b) => sum + b.subtotal, 0);
  const contracts = activeOrgs.length;
  const pendingRequests = requests.filter((r) => r.status === "pending").length;

  const stats = [
    { icon: Wallet, label: "月次売上", value: yen(mrr) },
    { icon: FileEdit, label: "契約数", value: `${contracts}` },
    { icon: Building2, label: "顧客総数", value: `${orgs.length}` },
    { icon: Users, label: "未対応の依頼", value: `${pendingRequests}` },
  ];

  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="text-xs font-medium tracking-wide text-ink3">管理</p>
        <h1 className="mt-1 text-2xl font-bold">運営のようす</h1>
      </div>

      {/* サマリー（サーバー集計） */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="flex flex-col gap-2">
              <div className="flex size-9 items-center justify-center rounded-md bg-accent-soft">
                <Icon className="size-5 text-accent" aria-hidden />
              </div>
              <p className="tnum text-2xl font-bold text-ink">{s.value}</p>
              <p className="text-xs text-ink2">{s.label}</p>
            </Card>
          );
        })}
      </div>

      {/* 月次売上の内訳 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink2">プラン別の内訳</h2>
        <Card padded={false} className="overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[22rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-ink3">
                <th className="px-4 py-2.5 font-medium sm:px-5">プラン</th>
                <th className="px-4 py-2.5 text-right font-medium">契約数</th>
                <th className="px-4 py-2.5 text-right font-medium sm:px-5">月額小計</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {breakdown.map((b) => (
                <tr key={b.plan}>
                  <td className="px-4 py-3 sm:px-5">
                    <span className="font-medium text-ink">{PLAN_LABELS[b.plan]}</span>
                    <span className="tnum ml-2 text-xs text-ink3">{PLAN_PRICES[b.plan]}／月</span>
                  </td>
                  <td className="tnum px-4 py-3 text-right text-ink">{b.count}</td>
                  <td className="tnum px-4 py-3 text-right text-ink sm:px-5">{yen(b.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-line bg-surface2/50">
                <td className="px-4 py-3 font-semibold text-ink sm:px-5">合計（月次売上）</td>
                <td className="tnum px-4 py-3 text-right font-semibold text-ink">{contracts}</td>
                <td className="tnum px-4 py-3 text-right font-bold text-ink sm:px-5">{yen(mrr)}</td>
              </tr>
            </tfoot>
          </table>
          </div>
        </Card>
      </section>

      {/* 顧客 / サイト / 編集依頼 */}
      <AdminConsole orgs={orgs} sites={sites} requests={requests} initialTab={tab} />
    </div>
  );
}
