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
import { onboardingState } from "@/lib/onboarding";
import type { SiteConfig } from "@/lib/site-config-schema";
import { Card } from "@/components/ui";
import { AdminConsole, type OrgVM, type SiteVM, type RequestVM } from "./AdminConsole";
import type { EditRequestStatus } from "@/lib/admin";
import { Wallet, Users, FileEdit, Building2 } from "lucide-react";

/** 件数だけ欲しいときの問い合わせ（表が無い・読めないときは 0） */
async function countRows(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabase>>>,
  table: string,
): Promise<number> {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) {
    if (!isMissingTableError(error)) console.error(`[admin] ${table} の件数取得に失敗`, error);
    return 0;
  }
  return count ?? 0;
}

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

  // ── 段ごとの数（docs/SERVICE_DESIGN_V1.md §4）──
  // 「知る」は解析を入れるまで出せない。それ以外は DB の行数で出す。
  let funnelCount = 0;
  let runCount = 0;
  let clickCount = 0;
  let inquiryCount = 0;
  let finishedSites = 0;
  const liveSiteIds = siteRows.filter((s) => s.status === "live").map((s) => s.id);
  if (supabase) {
    const [f, r, c, i, cfg] = await Promise.all([
      countRows(supabase, "funnels"),
      countRows(supabase, "funnel_runs"),
      countRows(supabase, "tracked_clicks"),
      countRows(supabase, "inquiries"),
      liveSiteIds.length > 0
        ? supabase.from("site_configs").select("site_id, config").in("site_id", liveSiteIds)
        : Promise.resolve({ data: [] as { site_id: string; config: SiteConfig }[], error: null }),
    ]);
    funnelCount = f;
    runCount = r;
    clickCount = c;
    inquiryCount = i;
    // 「自分のものにした」＝ 次にやること5つが全部終わったサイト
    for (const row of (cfg.data as { site_id: string; config: SiteConfig }[] | null) ?? []) {
      try {
        if (onboardingState(row.config).complete) finishedSites++;
      } catch {
        /* 設定が壊れていても数えるだけなので飛ばす */
      }
    }
  }
  const liveCount = liveSiteIds.length;
  const paidLiveOrgIds = new Set(
    orgRows.filter((o) => o.status === "active" && normalizePlanId(o.plan) !== "otameshi").map((o) => o.id),
  );
  const paidLiveSites = siteRows.filter((s) => s.status === "live" && paidLiveOrgIds.has(s.org_id)).length;

  const stages: { no: string; label: string; value: string; note: string }[] = [
    { no: "1", label: "知る（LP に来た）", value: "—", note: "解析を入れるまで出せません" },
    { no: "2", label: "名前を取った（ログインして押さえた）", value: `${orgRows.length}`, note: "会社の行の数" },
    { no: "3", label: "公開した", value: `${liveCount}`, note: `うち有料 ${paidLiveSites}` },
    { no: "4", label: "自分のものにした（次にやること 5/5）", value: `${finishedSites} / ${liveCount}`, note: "公開中のサイトのうち" },
    { no: "5", label: "道を見た（導線を登録）", value: `${funnelCount}`, note: `確かめた回数 ${runCount}・追跡リンクを通った ${clickCount}` },
    { no: "6", label: "続けている（有料の契約）", value: `${paidLiveOrgIds.size}`, note: "おまかせ以上で稼働中" },
    { no: "＋", label: "問い合わせが届いた", value: `${inquiryCount}`, note: "お客さんのサイトのフォームから" },
  ];

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

  const supportStats = [
    { icon: Users, label: "契約数", value: `${contracts}`, alert: false },
    { icon: Building2, label: "顧客総数", value: `${orgs.length}`, alert: false },
    { icon: FileEdit, label: "未対応の依頼", value: `${pendingRequests}`, alert: pendingRequests > 0 },
  ];

  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="text-xs font-medium tracking-wide text-ink3">管理</p>
        <h1 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">運営のようす</h1>
      </div>

      {/* サマリー: 売上を主役に、支える3指標を並べる（情報の緩急・サーバー集計） */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* 月次売上（主役・窓から差す暖色の光） */}
        <div className="relative overflow-hidden rounded-xl border border-line bg-surface p-5 shadow-sh2">
          <div aria-hidden className="window-light pointer-events-none absolute inset-x-0 -top-8 h-28" />
          <div className="relative">
            <p className="flex items-center gap-1.5 text-sm text-ink2">
              <Wallet className="size-4 text-accent" aria-hidden /> 月次売上（MRR）
            </p>
            <p className="tnum mt-2 font-serif text-4xl font-bold leading-none text-ink">{yen(mrr)}</p>
            <p className="mt-2 text-xs text-ink3">稼働中の契約 {contracts} 件の合計</p>
          </div>
        </div>

        {/* 支える3指標 */}
        <div className="grid grid-cols-3 gap-3 lg:col-span-2">
          {supportStats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="flex flex-col justify-between gap-3">
                <span
                  className={[
                    "grid size-9 place-items-center rounded-md",
                    s.alert ? "bg-warn/15 text-warn" : "bg-accent-soft text-accent",
                  ].join(" ")}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="tnum text-2xl font-bold text-ink">{s.value}</p>
                  <p className="mt-0.5 text-xs text-ink2">{s.label}</p>
                </div>
              </Card>
            );
          })}
        </div>
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

      {/* 段ごとの数: お客さんの流れのどこで落ちているかを1つの表で */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink2">段ごとの数（お客さんの流れ）</h2>
        <Card padded={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[26rem] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-ink3">
                  <th className="px-4 py-2.5 font-medium sm:px-5">段</th>
                  <th className="px-4 py-2.5 text-right font-medium">数</th>
                  <th className="px-4 py-2.5 font-medium sm:px-5">補足</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {stages.map((s) => (
                  <tr key={s.no}>
                    <td className="px-4 py-3 sm:px-5">
                      <span className="tnum mr-2 text-xs text-ink3">{s.no}</span>
                      <span className="font-medium text-ink">{s.label}</span>
                    </td>
                    <td className="tnum px-4 py-3 text-right text-ink">{s.value}</td>
                    <td className="px-4 py-3 text-xs text-ink3 sm:px-5">{s.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-ink3">週に1回見れば足ります。どこで数が減っているかが、次に直す場所です。</p>
      </section>

      {/* 顧客 / サイト / 編集依頼 */}
      <AdminConsole orgs={orgs} sites={sites} requests={requests} initialTab={tab} />
    </div>
  );
}
