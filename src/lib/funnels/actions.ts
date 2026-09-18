"use server";

/**
 * 導線チェックの入口（設計書 FUNNEL_CHECK_V1.md の §8・§9）。
 *
 * 画面からはここだけを呼ぶ。作る・直す・消す・いま確かめる・人数を見る。
 *
 * 認可の流れは site-editor.ts / signup.ts と同じ。
 *   1. Cookie のセッションで「誰か」と「どの会社か」を確かめる（RLS 越しに読む）
 *   2. その会社のものだと分かってから service_role で書く
 * 順番を入れ替えると誰でも他人の導線を触れてしまう。必ずこの順で書く。
 */

import { randomBytes } from "node:crypto";
import type { Plan } from "../stripe";
import { normalizePlanId } from "../stripe";
import { funnelLimit, planAllowsFunnelCheck } from "../templates/catalog";
import { getMyAccount } from "../auth";
import { getWriteClient, isMissingTableError } from "../supabase/server";
import { SITE_BASE_URL, customerSiteUrl } from "../resolve-site";
import { runFunnelCheck } from "./check";
import type {
  FunnelDetail,
  FunnelRun,
  FunnelSummary,
  Hop,
  HopClicks,
  HopKind,
  HopResult,
  HopStatus,
  RunStatus,
  TrackedLink,
} from "./types";

/* ═══════════════════════════════════════
   決まりごと
   ═══════════════════════════════════════ */

const HOP_KINDS: HopKind[] = ["x", "line", "web", "mado", "member", "discord"];

/** 段の数の上限（DB の制約と同じ） */
const MAX_HOPS = 12;

/** 追跡リンクのコードに使う文字。0 と O、1 と l のような読み違えやすい字は入れない */
const CODE_CHARS = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_LENGTH = 8;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 画面に出す人数の既定の日数（今週ぶん） */
const DEFAULT_DAYS = 7;

/* ═══════════════════════════════════════
   小さな道具
   ═══════════════════════════════════════ */

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n/g, "\n").trim().slice(0, max);
}

/** 追跡リンクの飛び先として使える URL か */
function publicTarget(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    if (!url.hostname.includes(".")) return null;
    return url.href;
  } catch {
    return null;
  }
}

function newCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) out += CODE_CHARS[bytes[i] % CODE_CHARS.length];
  return out;
}

function trackedUrl(code: string): string {
  return `${SITE_BASE_URL}/go/${code}`;
}

/** 段の状態の悪い順。画面では「いちばん悪いところ」を先に見せる */
const STATUS_RANK: Record<HopStatus, number> = { ok: 0, skipped: 1, ng: 2 };

function worstStatus(results: HopResult[]): HopStatus | null {
  if (!results.length) return null;
  return results.reduce<HopStatus>(
    (acc, r) => (STATUS_RANK[r.status] > STATUS_RANK[acc] ? r.status : acc),
    "ok",
  );
}

function toRun(row: Record<string, unknown>): FunnelRun {
  return {
    id: String(row.id),
    status: (row.status as RunStatus) ?? "failed",
    results: Array.isArray(row.results) ? (row.results as HopResult[]) : [],
    startedAt: String(row.started_at),
    finishedAt: (row.finished_at as string | null) ?? null,
  };
}

/* ═══════════════════════════════════════
   認可
   ═══════════════════════════════════════ */

interface OrgContext {
  orgId: string;
  plan: Plan;
  /** その会社のサイト（mado の段に選んでよいもの） */
  sites: Map<string, string>;
}

async function requireOrg(): Promise<
  { ok: true; ctx: OrgContext } | { ok: false; reason: "unauthenticated" | "no_org" }
> {
  const account = await getMyAccount();
  if (!account) return { ok: false, reason: "unauthenticated" };
  if (!account.org) return { ok: false, reason: "no_org" };

  return {
    ok: true,
    ctx: {
      orgId: account.org.id,
      plan: normalizePlanId(account.org.plan || "otameshi"),
      sites: new Map(account.sites.map((s) => [s.id, s.slug])),
    },
  };
}

interface FunnelRow {
  id: string;
  org_id: string;
  site_id: string | null;
  name: string;
  hops: Hop[];
  updated_at: string;
}

/** その導線を触ってよいか確かめて、中身ごと返す */
async function requireFunnel(
  id: string,
): Promise<
  { ok: true; ctx: OrgContext; funnel: FunnelRow } | { ok: false; reason: "unauthenticated" | "forbidden" | "not_found" }
> {
  const org = await requireOrg();
  if (!org.ok) {
    return { ok: false, reason: org.reason === "unauthenticated" ? "unauthenticated" : "forbidden" };
  }
  if (!UUID_RE.test(clean(id, 64))) return { ok: false, reason: "not_found" };

  const supabase = getWriteClient();
  if (!supabase) return { ok: false, reason: "not_found" };

  const { data, error } = await supabase
    .from("funnels")
    .select("id, org_id, site_id, name, hops, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return { ok: false, reason: "not_found" };
  if (data.org_id !== org.ctx.orgId) return { ok: false, reason: "forbidden" };

  return {
    ok: true,
    ctx: org.ctx,
    funnel: {
      id: String(data.id),
      org_id: String(data.org_id),
      site_id: (data.site_id as string | null) ?? null,
      name: String(data.name),
      hops: Array.isArray(data.hops) ? (data.hops as Hop[]) : [],
      updated_at: String(data.updated_at),
    },
  };
}

/* ═══════════════════════════════════════
   入力の検証
   ═══════════════════════════════════════ */

const KIND_LABEL: Record<HopKind, string> = {
  x: "X",
  line: "LINE",
  web: "ホームページ",
  mado: "自分のサイト",
  member: "会員ページ",
  discord: "Discord",
};

function normalizeHops(
  input: unknown,
  ctx: OrgContext,
): { ok: true; hops: Hop[] } | { ok: false; message: string } {
  if (!Array.isArray(input) || input.length === 0) {
    return { ok: false, message: "段を1つ以上入れてください。" };
  }
  if (input.length > MAX_HOPS) {
    return { ok: false, message: `段は${MAX_HOPS}個までです。` };
  }

  const hops: Hop[] = [];
  for (let i = 0; i < input.length; i++) {
    const raw = (input[i] ?? {}) as Partial<Hop>;
    const kind = raw.kind as HopKind;
    if (!HOP_KINDS.includes(kind)) {
      return { ok: false, message: `${i + 1}段目の種類が分かりません。` };
    }

    const label = clean(raw.label, 60) || KIND_LABEL[kind];
    const url = clean(raw.url, 2000);

    if (kind === "mado") {
      if (!ctx.sites.has(url)) {
        return { ok: false, message: `${i + 1}段目のサイトを選び直してください。` };
      }
    } else if (!publicTarget(url)) {
      return { ok: false, message: `${i + 1}段目（${label}）の URL は https から始まる形で入れてください。` };
    }

    hops.push({ kind, label, url });
  }
  return { ok: true, hops };
}

/* ═══════════════════════════════════════
   追跡リンクの発行
   ═══════════════════════════════════════ */

/** その段の飛び先。自分のサイトはスラッグから組み立てる */
function hopTarget(hop: Hop, ctx: OrgContext): string | null {
  if (hop.kind === "mado") {
    const slug = ctx.sites.get(hop.url);
    return slug ? customerSiteUrl(slug) : null;
  }
  return publicTarget(hop.url);
}

/**
 * 段の数だけ追跡リンクを用意する。
 * 既にある段のコードは変えない（貼ってある先が死ぬので、作り直さない）。
 * 飛び先だけ今の URL に合わせる。
 */
async function issueLinks(funnelId: string, hops: Hop[], ctx: OrgContext): Promise<void> {
  const supabase = getWriteClient();
  if (!supabase) return;

  const { data: existing, error } = await supabase
    .from("tracked_links")
    .select("code, hop_index, target_url")
    .eq("funnel_id", funnelId);

  if (error && !isMissingTableError(error)) {
    console.error("[funnels] 追跡リンクの読み込みに失敗", { funnelId, error });
    return;
  }

  const byIndex = new Map<number, { code: string; target_url: string }>();
  for (const row of existing ?? []) {
    byIndex.set(row.hop_index as number, {
      code: row.code as string,
      target_url: row.target_url as string,
    });
  }

  for (let i = 0; i < hops.length; i++) {
    const target = hopTarget(hops[i], ctx);
    if (!target) continue;

    const current = byIndex.get(i);
    if (current) {
      if (current.target_url !== target) {
        const { error: updateError } = await supabase
          .from("tracked_links")
          .update({ target_url: target })
          .eq("code", current.code);
        if (updateError) console.error("[funnels] 飛び先の更新に失敗", { funnelId, i, error: updateError });
      }
      continue;
    }

    // 同じコードが既にあれば引き直す
    for (let attempt = 0; attempt < 5; attempt++) {
      const { error: insertError } = await supabase.from("tracked_links").insert({
        code: newCode(),
        funnel_id: funnelId,
        hop_index: i,
        target_url: target,
      });
      if (!insertError) break;
      if (attempt === 4) {
        console.error("[funnels] 追跡リンクの発行に失敗", { funnelId, i, error: insertError });
      }
    }
  }
}

/* ═══════════════════════════════════════
   一覧
   ═══════════════════════════════════════ */

export async function listFunnels(): Promise<
  | { ok: true; funnels: FunnelSummary[]; limit: number; plan: Plan }
  | { ok: false; reason: "unauthenticated" | "no_org" }
> {
  const org = await requireOrg();
  if (!org.ok) return { ok: false, reason: org.reason };

  const { ctx } = org;
  const limit = funnelLimit(ctx.plan);
  const supabase = getWriteClient();
  if (!supabase) return { ok: true, funnels: [], limit, plan: ctx.plan };

  const { data, error } = await supabase
    .from("funnels")
    .select("id, name, site_id, hops, updated_at")
    .eq("org_id", ctx.orgId)
    .order("updated_at", { ascending: false });

  if (error) {
    if (!isMissingTableError(error)) console.error("[funnels] 一覧の取得に失敗", error);
    return { ok: true, funnels: [], limit, plan: ctx.plan };
  }

  const rows = data ?? [];
  const ids = rows.map((r) => r.id as string);

  // 導線ごとの「いちばん新しいチェック」を1回のクエリでまとめて取る
  const lastRuns = new Map<string, FunnelRun>();
  if (ids.length > 0) {
    const { data: runRows } = await supabase
      .from("funnel_runs")
      .select("id, funnel_id, status, results, started_at, finished_at")
      .in("funnel_id", ids)
      .order("started_at", { ascending: false })
      .limit(ids.length * 10);

    for (const row of runRows ?? []) {
      const funnelId = row.funnel_id as string;
      if (!lastRuns.has(funnelId)) lastRuns.set(funnelId, toRun(row));
    }
  }

  const funnels: FunnelSummary[] = rows.map((r) => {
    const run = lastRuns.get(r.id as string) ?? null;
    return {
      id: r.id as string,
      name: r.name as string,
      siteId: (r.site_id as string | null) ?? null,
      hopCount: Array.isArray(r.hops) ? r.hops.length : 0,
      updatedAt: String(r.updated_at),
      lastRun: run
        ? { status: run.status, finishedAt: run.finishedAt, worst: worstStatus(run.results) }
        : null,
    };
  });

  return { ok: true, funnels, limit, plan: ctx.plan };
}

/* ═══════════════════════════════════════
   1本を開く
   ═══════════════════════════════════════ */

export async function loadFunnel(
  id: string,
): Promise<
  | { ok: true; funnel: FunnelDetail; plan: Plan }
  | { ok: false; reason: "unauthenticated" | "forbidden" | "not_found" }
> {
  const access = await requireFunnel(id);
  if (!access.ok) return { ok: false, reason: access.reason };

  const supabase = getWriteClient();
  if (!supabase) return { ok: false, reason: "not_found" };

  const [linkRes, runRes] = await Promise.all([
    supabase.from("tracked_links").select("code, hop_index").eq("funnel_id", id).order("hop_index"),
    supabase
      .from("funnel_runs")
      .select("id, status, results, started_at, finished_at")
      .eq("funnel_id", id)
      .order("started_at", { ascending: false })
      .limit(10),
  ]);

  const links: TrackedLink[] = (linkRes.data ?? []).map((row) => ({
    hopIndex: row.hop_index as number,
    code: row.code as string,
    url: trackedUrl(row.code as string),
  }));

  const runs: FunnelRun[] = (runRes.data ?? []).map(toRun);

  return {
    ok: true,
    plan: access.ctx.plan,
    funnel: {
      id: access.funnel.id,
      name: access.funnel.name,
      siteId: access.funnel.site_id,
      hops: access.funnel.hops,
      links,
      runs,
    },
  };
}

/* ═══════════════════════════════════════
   作る
   ═══════════════════════════════════════ */

export async function createFunnel(input: {
  name: string;
  siteId?: string | null;
  hops: Hop[];
}): Promise<
  | { ok: true; id: string }
  | { ok: false; reason: "unauthenticated" | "no_org" | "plan" | "invalid" | "failed"; message?: string }
> {
  const org = await requireOrg();
  if (!org.ok) return { ok: false, reason: org.reason };
  const { ctx } = org;

  const limit = funnelLimit(ctx.plan);
  if (limit === 0) {
    return {
      ok: false,
      reason: "plan",
      message: "導線チェックはおまかせプラン以上で使えます。",
    };
  }

  const name = clean(input?.name, 100);
  if (!name) return { ok: false, reason: "invalid", message: "導線の名前を入れてください。" };

  const siteId = clean(input?.siteId ?? "", 64) || null;
  if (siteId && !ctx.sites.has(siteId)) {
    return { ok: false, reason: "invalid", message: "サイトを選び直してください。" };
  }

  const hops = normalizeHops(input?.hops, ctx);
  if (!hops.ok) return { ok: false, reason: "invalid", message: hops.message };

  const supabase = getWriteClient();
  if (!supabase) {
    return { ok: false, reason: "failed", message: "ただいま保存できません。時間をおいてお試しください。" };
  }

  if (limit > 0) {
    const { count } = await supabase
      .from("funnels")
      .select("id", { count: "exact", head: true })
      .eq("org_id", ctx.orgId);
    if ((count ?? 0) >= limit) {
      return {
        ok: false,
        reason: "plan",
        message: `導線は${limit}本まで作れます。増やすにはおまかせプロへの変更が必要です。`,
      };
    }
  }

  const { data, error } = await supabase
    .from("funnels")
    .insert({ org_id: ctx.orgId, site_id: siteId, name, hops: hops.hops })
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("[funnels] 作成に失敗", { orgId: ctx.orgId, error });
    return { ok: false, reason: "failed", message: "保存できませんでした。時間をおいてお試しください。" };
  }

  const id = String(data.id);
  await issueLinks(id, hops.hops, ctx);
  return { ok: true, id };
}

/* ═══════════════════════════════════════
   直す
   ═══════════════════════════════════════ */

export async function updateFunnel(
  id: string,
  input: { name?: string; hops?: Hop[] },
): Promise<
  | { ok: true }
  | {
      ok: false;
      reason: "unauthenticated" | "forbidden" | "not_found" | "invalid" | "failed";
      message?: string;
    }
> {
  const access = await requireFunnel(id);
  if (!access.ok) return { ok: false, reason: access.reason };
  const { ctx } = access;

  const patch: Record<string, unknown> = {};

  if (input?.name !== undefined) {
    const name = clean(input.name, 100);
    if (!name) return { ok: false, reason: "invalid", message: "導線の名前を入れてください。" };
    patch.name = name;
  }

  let hops: Hop[] | null = null;
  if (input?.hops !== undefined) {
    const checked = normalizeHops(input.hops, ctx);
    if (!checked.ok) return { ok: false, reason: "invalid", message: checked.message };
    hops = checked.hops;
    patch.hops = hops;
  }

  if (Object.keys(patch).length === 0) return { ok: true };

  const supabase = getWriteClient();
  if (!supabase) {
    return { ok: false, reason: "failed", message: "ただいま保存できません。時間をおいてお試しください。" };
  }

  const { error } = await supabase.from("funnels").update(patch).eq("id", id);
  if (error) {
    console.error("[funnels] 更新に失敗", { id, error });
    return { ok: false, reason: "failed", message: "保存できませんでした。時間をおいてお試しください。" };
  }

  if (hops) await issueLinks(id, hops, ctx);
  return { ok: true };
}

/* ═══════════════════════════════════════
   消す
   ═══════════════════════════════════════ */

export async function deleteFunnel(
  id: string,
): Promise<
  { ok: true } | { ok: false; reason: "unauthenticated" | "forbidden" | "not_found" | "failed" }
> {
  const access = await requireFunnel(id);
  if (!access.ok) return { ok: false, reason: access.reason };

  const supabase = getWriteClient();
  if (!supabase) return { ok: false, reason: "failed" };

  const { error } = await supabase.from("funnels").delete().eq("id", id);
  if (error) {
    console.error("[funnels] 削除に失敗", { id, error });
    return { ok: false, reason: "failed" };
  }
  return { ok: true };
}

/* ═══════════════════════════════════════
   いま確かめる
   ═══════════════════════════════════════ */

export async function startRun(
  id: string,
): Promise<
  | { ok: true; run: FunnelRun }
  | {
      ok: false;
      reason: "unauthenticated" | "forbidden" | "not_found" | "plan" | "failed";
      message?: string;
    }
> {
  const access = await requireFunnel(id);
  if (!access.ok) return { ok: false, reason: access.reason };
  const { ctx, funnel } = access;

  if (!planAllowsFunnelCheck(ctx.plan)) {
    return { ok: false, reason: "plan", message: "「いま確かめる」はおまかせプラン以上で使えます。" };
  }

  const supabase = getWriteClient();
  if (!supabase) {
    return { ok: false, reason: "failed", message: "ただいま確かめられません。時間をおいてお試しください。" };
  }

  // 自分のサイトでない siteId が紛れていたら、その段は空にして渡す
  // （他人のサイトの中身を覗けないようにする）
  const hops: Hop[] = funnel.hops.map((hop) =>
    hop.kind === "mado" && !ctx.sites.has(hop.url) ? { ...hop, url: "" } : hop,
  );

  const { data: started, error: startError } = await supabase
    .from("funnel_runs")
    .insert({ funnel_id: id, status: "running", results: [] })
    .select("id, status, results, started_at, finished_at")
    .maybeSingle();

  if (startError || !started) {
    console.error("[funnels] チェックを始められませんでした", { id, error: startError });
    return { ok: false, reason: "failed", message: "確かめられませんでした。時間をおいてお試しください。" };
  }

  const runId = String(started.id);

  try {
    const results = await runFunnelCheck(hops);
    const finishedAt = new Date().toISOString();

    const { error: saveError } = await supabase
      .from("funnel_runs")
      .update({ status: "done", results, finished_at: finishedAt })
      .eq("id", runId);
    if (saveError) console.error("[funnels] 結果の保存に失敗", { id, runId, error: saveError });

    return {
      ok: true,
      run: {
        id: runId,
        status: "done",
        results,
        startedAt: String(started.started_at),
        finishedAt,
      },
    };
  } catch (err) {
    console.error("[funnels] チェックの途中で止まりました", { id, runId, err });
    const finishedAt = new Date().toISOString();
    await supabase.from("funnel_runs").update({ status: "failed", finished_at: finishedAt }).eq("id", runId);
    return { ok: false, reason: "failed", message: "確かめている途中で止まりました。もう一度お試しください。" };
  }
}

/* ═══════════════════════════════════════
   段ごとの人数
   ═══════════════════════════════════════ */

export async function clicksByHop(
  id: string,
  days?: number,
): Promise<
  | { ok: true; days: number; hops: HopClicks[] }
  | { ok: false; reason: "unauthenticated" | "forbidden" | "not_found" }
> {
  const access = await requireFunnel(id);
  if (!access.ok) return { ok: false, reason: access.reason };

  const span = Math.min(Math.max(Math.round(days ?? DEFAULT_DAYS), 1), 365);
  const hops: HopClicks[] = access.funnel.hops.map((_, hopIndex) => ({
    hopIndex,
    visitors: 0,
    clicks: 0,
  }));

  const supabase = getWriteClient();
  if (!supabase) return { ok: true, days: span, hops };

  const { data, error } = await supabase.rpc("funnel_clicks_daily", {
    p_funnel_id: id,
    p_days: span,
  });

  if (error) {
    if (!isMissingTableError(error)) console.error("[funnels] 人数の集計に失敗", { id, error });
    return { ok: true, days: span, hops };
  }

  // 日ごとに返ってくるので、段ごとに足し上げる
  for (const row of (data ?? []) as { hop_index: number; visitors: number; clicks: number }[]) {
    const target = hops[row.hop_index];
    if (!target) continue;
    target.visitors += Number(row.visitors) || 0;
    target.clicks += Number(row.clicks) || 0;
  }

  return { ok: true, days: span, hops };
}
