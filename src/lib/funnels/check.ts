/**
 * 導線を上から順に確かめる（設計書 FUNNEL_CHECK_V1.md の §3）。
 *
 * やること
 *   web     … 開けるか・最終 URL・タイトル・次の段への行き方が本文にあるか
 *   line    … 友だち追加 URL が生きているか・飛び先が LINE の友だち追加ページか
 *   discord … 公開の招待 API を叩いて、有効か・期限切れか・サーバー名と規模
 *   mado    … 自分のサイトの設定を読んで §7 のサイト内チェック
 *   x       … 見に行かない（規約）。押された回数は追跡リンクで数える
 *   member  … 入口 URL が生きているかだけ。ログインの先は見ない
 *
 * 守ること
 *   ・1段あたり8秒で打ち切る。相手のサイトが重くても画面を待たせない
 *   ・ng には必ず理由を一文と、取れた根拠（状態コード・最終 URL・取得日時）を残す
 *   ・取りに行くのは公開されている URL だけ。転送は1段ずつ確かめて追い、
 *     名前解決の結果が社内・自分自身のアドレスならつながない（fetch-safe.ts）
 *   ・本文は読み込みながら上限で止める
 *
 * mado の段の url には siteId が入る。他人のサイトを覗けないように、
 * 呼ぶ側（actions.ts）で「その会社のサイトか」を確かめてから渡すこと。
 */

import type { SiteConfig } from "../site-config-schema";
import { SITE_BASE_URL } from "../resolve-site";
import { readCapped, safeFetch } from "./fetch-safe";
import type { Hop, HopCheck, HopResult, HopStatus } from "./types";

/** 相手のサーバーに名乗る名前 */
const USER_AGENT = "Mado-FunnelCheck/1.0";

/** 1段あたりの制限時間 */
const HOP_TIMEOUT_MS = 8_000;

/** 読み込む本文の上限（重いページで詰まらせない） */
const MAX_BODY = 512 * 1024;

/** 追う転送の数の上限 */
const MAX_REDIRECTS = 5;

/** 追跡リンクの置き場 */
const TRACK_PATH = "/go/";
const TRACK_HOST = new URL(SITE_BASE_URL).hostname.toLowerCase().replace(/^www\./, "");

/**
 * 呼ぶ側が渡す、確かめるための材料。
 *   siteUrls … mado の段の siteId → 公開 URL（自分の会社のサイトだけ）
 *   codes    … 段の番号 → その段に貼る追跡リンクのコード（次の段へ送るもの）
 */
export interface CheckContext {
  siteUrls: Record<string, string>;
  codes: Record<number, string>;
}

const EMPTY_CONTEXT: CheckContext = { siteUrls: {}, codes: {} };

/* ═══════════════════════════════════════
   小さな道具
   ═══════════════════════════════════════ */

function now(): string {
  return new Date().toISOString();
}

/**
 * 段の状態。ng が1つでもあれば ng。
 * 1つも確かめられなかったとき（全部 skipped）だけ skipped にする。
 */
function worstOf(checks: HopCheck[]): HopStatus {
  if (checks.some((c) => c.status === "ng")) return "ng";
  if (checks.some((c) => c.status === "ok")) return "ok";
  return "skipped";
}

/** 決めた時間で打ち切る */
async function withTimeout<T>(work: Promise<T>, ms: number, onTimeout: () => T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const guard = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(onTimeout()), ms);
  });
  try {
    return await Promise.race([work, guard]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * 取りに行ってよい URL か（形の検査）。
 * 公開されている http / https のページだけを通す。
 * IP 直打ち・変わったポート・認証情報つき・社内向けの名前は弾く。
 * 名前解決の結果は接続の瞬間に fetch-safe.ts が別に検査する。
 */
export function publicUrl(value: string): URL | null {
  const raw = (value || "").trim();
  if (!raw || raw.length > 2000) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password || url.port) return null;
  if (!host.includes(".") || host.startsWith("[")) return null;
  if (/^[\d.]+$/.test(host)) return null;
  if (host === "localhost" || /\.(local|localhost|internal|test|invalid|home|lan)$/.test(host)) return null;
  return url;
}

interface Fetched {
  ok: boolean;
  statusCode?: number;
  finalUrl?: string;
  title?: string;
  body: string;
  /** 取りに行けなかったときの言い分 */
  failure?: "blocked" | "network" | "redirects";
}

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

/**
 * ページを1枚取ってくる。落ちても例外は投げない。
 * 転送は自動で追わず、飛び先を1段ずつ形と名前解決で確かめてから追う。
 */
export async function getPage(value: string): Promise<Fetched> {
  let current = publicUrl(value);
  if (!current) return { ok: false, body: "", failure: "blocked" };

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let res: Response;
    try {
      res = await safeFetch(current, {
        headers: {
          "user-agent": USER_AGENT,
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        timeoutMs: HOP_TIMEOUT_MS,
      });
    } catch (err) {
      // fetch は失敗を TypeError("fetch failed") に包み、元の理由は cause に入る
      const e = err as (NodeJS.ErrnoException & { cause?: NodeJS.ErrnoException }) | undefined;
      const code = e?.cause?.code ?? e?.code;
      return {
        ok: false,
        body: "",
        finalUrl: current.href,
        failure: code === "EBLOCKEDADDRESS" ? "blocked" : "network",
      };
    }

    if (REDIRECT_STATUSES.has(res.status)) {
      // 転送先も同じ基準で確かめる。社内向けや形の変な先へは追わない
      await res.body?.cancel().catch(() => undefined);
      const location = res.headers.get("location");
      if (!location) {
        return { ok: false, statusCode: res.status, finalUrl: current.href, body: "", failure: "redirects" };
      }
      let nextUrl: URL | null = null;
      try {
        nextUrl = publicUrl(new URL(location, current).href);
      } catch {
        nextUrl = null;
      }
      if (!nextUrl) {
        return { ok: false, statusCode: res.status, finalUrl: current.href, body: "", failure: "blocked" };
      }
      current = nextUrl;
      continue;
    }

    const body = await readCapped(res, MAX_BODY);
    return {
      ok: res.status < 400,
      statusCode: res.status,
      finalUrl: current.href,
      title: titleOf(body),
      body,
    };
  }

  return { ok: false, body: "", finalUrl: current.href, failure: "redirects" };
}

/** ページのタイトル */
function titleOf(html: string): string | undefined {
  const m = html.match(/<title[^>]*>([\s\S]{0,300}?)<\/title>/i);
  if (!m) return undefined;
  const t = m[1].replace(/\s+/g, " ").trim();
  return t || undefined;
}

/** 本文の中のリンク先を全部出す */
function hrefsOf(html: string): string[] {
  const out: string[] = [];
  const re = /href\s*=\s*["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) out.push(m[1]);
  return out;
}

/** 本文の中の書き方（"/line" など）を、そのページの住所を土台にして URL にする */
function resolveHref(href: string, base?: string): URL | null {
  const raw = (href || "").trim();
  if (!raw || /^(#|mailto:|tel:|javascript:|data:)/i.test(raw)) return null;
  try {
    return new URL(raw, base || undefined);
  } catch {
    return null;
  }
}

function hostOf(url: URL): string {
  return url.hostname.toLowerCase().replace(/^www\./, "");
}

function pathOf(url: URL): string {
  return url.pathname.replace(/\/+$/, "") || "/";
}

/**
 * 本文のリンクが「次の段の URL そのもの」か。
 * ホスト名は大文字小文字を区別しない。道筋（path）は区別する。
 * 次の段の URL に ?… が付いていれば、それも同じでなければ同一と見ない。
 */
function sameTarget(link: URL, expected: URL): boolean {
  if (hostOf(link) !== hostOf(expected)) return false;
  if (pathOf(link) !== pathOf(expected)) return false;
  if (expected.search && link.search !== expected.search) return false;
  return true;
}

/** 本文のリンクが「この段に貼る追跡リンク」そのものか（コードは大文字小文字を区別する） */
function isOwnTrackedLink(link: URL, code: string): boolean {
  return hostOf(link) === TRACK_HOST && link.pathname === `${TRACK_PATH}${code}`;
}

/** 取りに行った結果を根拠の形にする */
function evidenceOf(page: Fetched): HopCheck["evidence"] {
  return {
    ...(page.statusCode !== undefined ? { statusCode: page.statusCode } : {}),
    ...(page.finalUrl ? { finalUrl: page.finalUrl } : {}),
    ...(page.title ? { title: page.title } : {}),
    fetchedAt: now(),
  };
}

/** 取りに行けなかった理由の文（誰が読んでも分かる一文にする） */
function failureReason(page: Fetched, what: string): string {
  if (page.failure === "blocked") {
    return "外から開けないアドレス（社内向けの名前や IP、またはそこへの転送）なので取りに行っていません。公開されている https の URL を入れてください。";
  }
  if (page.failure === "redirects") {
    return `${what}の転送が多すぎるか、転送先が分かりません。URL を直接のものにしてください。`;
  }
  if (page.failure === "network") {
    return `${what}につながりませんでした。URL が合っているか確かめてください。`;
  }
  return `${what}が開きません（${page.statusCode}）。URL を確かめてください。`;
}

/** 次の段へ行くための材料（次の段の URL と、この段に貼る追跡リンクのコード） */
interface NextExpectation {
  next: Hop | undefined;
  url: URL | null;
  code: string | null;
}

/* ═══════════════════════════════════════
   段の種類ごとの確かめ方
   ═══════════════════════════════════════ */

/** web — 任意のページ */
async function checkWeb(hop: Hop, expect: NextExpectation): Promise<HopCheck[]> {
  const page = await getPage(hop.url);
  const checks: HopCheck[] = [];

  checks.push(
    page.ok
      ? { name: "ページが開ける", status: "ok", evidence: evidenceOf(page) }
      : {
          name: "ページが開ける",
          status: "ng",
          reason: failureReason(page, "ページ"),
          evidence: evidenceOf(page),
        },
  );

  checks.push(nextLinkCheck(page, expect));
  return checks;
}

/**
 * 次の段への行き方が本文にあるか。
 * 認めるのは「この段に貼る追跡リンク」か「次の段の URL そのもの」だけ。
 * 他の追跡リンクや、似たドメインの別ページでは通さない。
 */
export function nextLinkCheck(page: Fetched, expect: NextExpectation): HopCheck {
  const name = "次の段へのリンクがある";
  if (!expect.next) {
    return { name, status: "skipped", reason: "ここが最後の段なので、次の行き先はありません。" };
  }
  if (!page.ok || !page.body) {
    return { name, status: "skipped", reason: "ページを開けなかったので、中のリンクは確かめていません。" };
  }
  if (!expect.url && !expect.code) {
    return { name, status: "skipped", reason: "次の段の URL が分からないので、リンクは確かめていません。" };
  }

  const links = hrefsOf(page.body)
    .map((href) => resolveHref(href, page.finalUrl))
    .filter((v): v is URL => v !== null);

  const hasTracked = expect.code !== null && links.some((l) => isOwnTrackedLink(l, expect.code as string));
  const hasDirect = expect.url !== null && links.some((l) => sameTarget(l, expect.url as URL));

  if (hasTracked || hasDirect) {
    return { name, status: "ok", evidence: evidenceOf(page) };
  }
  return {
    name,
    status: "ng",
    reason: `このページに「${expect.next.label}」へのリンク（この段の追跡リンクか、次の段の URL）が見つかりません。ここで道が切れています。`,
    evidence: evidenceOf(page),
  };
}

/** LINE の友だち追加ページか */
function isLineAddFriend(value: string): boolean {
  const url = publicUrl(value);
  if (!url) return false;
  const host = url.hostname.toLowerCase();
  if (host === "lin.ee") return true;
  if (host === "liff.line.me") return true;
  if (host === "line.me" || host === "www.line.me" || host === "page.line.me") {
    return /^\/(R\/ti\/p|ti\/p|R\/oaMessage)\//i.test(url.pathname) || url.pathname.startsWith("/@");
  }
  return false;
}

/** line — 友だち追加 URL */
async function checkLine(hop: Hop): Promise<HopCheck[]> {
  const checks: HopCheck[] = [];

  if (!isLineAddFriend(hop.url)) {
    checks.push({
      name: "友だち追加 URL が生きている",
      status: "ng",
      reason: "LINE の友だち追加 URL ではありません。lin.ee か line.me/R/ti/p から始まる URL を入れてください。",
      evidence: { fetchedAt: now() },
    });
    checks.push(skippedLineInside());
    return checks;
  }

  const page = await getPage(hop.url);

  checks.push(
    page.ok
      ? { name: "友だち追加 URL が生きている", status: "ok", evidence: evidenceOf(page) }
      : {
          name: "友だち追加 URL が生きている",
          status: "ng",
          reason: failureReason(page, "友だち追加のページ"),
          evidence: evidenceOf(page),
        },
  );

  if (page.ok) {
    const landed = isLineAddFriend(page.finalUrl || hop.url);
    checks.push(
      landed
        ? { name: "飛び先が友だち追加のページ", status: "ok", evidence: evidenceOf(page) }
        : {
            name: "飛び先が友だち追加のページ",
            status: "ng",
            reason: "友だち追加のページではないところに着きました。URL を作り直してください。",
            evidence: evidenceOf(page),
          },
    );
  }

  checks.push(skippedLineInside());
  return checks;
}

function skippedLineInside(): HopCheck {
  return {
    name: "メニューと配信の中身",
    status: "skipped",
    reason: "LINE の中身は確かめていません。読むには公式アカウントの権限をお預かりする必要があります。",
  };
}

/** discord の招待コードを取り出す */
function discordInviteCode(value: string): string | null {
  const url = publicUrl(value);
  if (url) {
    const host = url.hostname.toLowerCase();
    const path = url.pathname.replace(/^\/+|\/+$/g, "");
    if (host === "discord.gg" || host === "discord.com" || host === "discordapp.com" || host === "www.discord.com") {
      const code = path.replace(/^invite\//i, "");
      if (/^[a-z0-9-]{2,64}$/i.test(code)) return code;
    }
    return null;
  }
  const raw = (value || "").trim();
  return /^[a-z0-9-]{2,64}$/i.test(raw) ? raw : null;
}

interface DiscordInvite {
  guild?: { name?: string };
  approximate_member_count?: number;
  expires_at?: string | null;
}

/** discord — 招待リンク（認証の要らない公開 API を使う） */
async function checkDiscord(hop: Hop): Promise<HopCheck[]> {
  const code = discordInviteCode(hop.url);
  const checks: HopCheck[] = [];

  if (!code) {
    checks.push({
      name: "招待が有効",
      status: "ng",
      reason: "Discord の招待 URL ではありません。discord.gg から始まる URL を入れてください。",
      evidence: { fetchedAt: now() },
    });
    checks.push(skippedDiscordInside());
    return checks;
  }

  const api = new URL(`https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true`);
  let status: number | undefined;
  let invite: DiscordInvite | null = null;

  try {
    const res = await safeFetch(api, {
      headers: { "user-agent": USER_AGENT, accept: "application/json" },
      timeoutMs: HOP_TIMEOUT_MS,
    });
    status = res.status;
    if (res.ok) {
      const text = await readCapped(res, 64 * 1024);
      try {
        invite = JSON.parse(text) as DiscordInvite;
      } catch {
        invite = null;
      }
    } else {
      await res.body?.cancel().catch(() => undefined);
    }
  } catch {
    status = undefined;
  }

  const base = {
    ...(status !== undefined ? { statusCode: status } : {}),
    finalUrl: `https://discord.gg/${code}`,
    fetchedAt: now(),
  };

  if (invite) {
    const name = invite.guild?.name;
    const members = invite.approximate_member_count;
    checks.push({
      name: "招待が有効",
      status: "ok",
      evidence: { ...base, ...(name ? { title: name } : {}) },
    });
    checks.push({
      name: "サーバー名が取れる",
      status: name ? "ok" : "skipped",
      ...(name ? {} : { reason: "サーバー名が取れませんでした。招待の設定をご確認ください。" }),
      evidence: {
        ...base,
        ...(name ? { title: members !== undefined ? `${name}（参加 ${members}）` : name } : {}),
      },
    });
  } else if (status === 404) {
    checks.push({
      name: "招待が有効",
      status: "ng",
      reason: "招待が切れています。期限の無い招待リンクを作り直してください。",
      evidence: base,
    });
  } else {
    checks.push({
      name: "招待が有効",
      status: "ng",
      reason:
        status === undefined
          ? "Discord につながりませんでした。時間をおいてもう一度お試しください。"
          : `招待の状態を確かめられませんでした（${status}）。URL をご確認ください。`,
      evidence: base,
    });
  }

  checks.push(skippedDiscordInside());
  return checks;
}

function skippedDiscordInside(): HopCheck {
  return {
    name: "サーバーの中",
    status: "skipped",
    reason: "サーバーの中は確かめていません。中を見るにはボットを入れてもらう必要があります。",
  };
}

/** member — ログインが要るページ */
async function checkMember(hop: Hop): Promise<HopCheck[]> {
  const page = await getPage(hop.url);
  return [
    page.ok
      ? { name: "入口の URL が生きている", status: "ok", evidence: evidenceOf(page) }
      : {
          name: "入口の URL が生きている",
          status: "ng",
          reason: failureReason(page, "入口のページ"),
          evidence: evidenceOf(page),
        },
    {
      name: "ログインの先の中身",
      status: "skipped",
      reason: "ログインの先は確かめていません。会員ページに勝手に入ることはしません。",
    },
  ];
}

/** x — プロフィール */
function checkX(): HopCheck[] {
  return [
    {
      name: "X のページの中身",
      status: "skipped",
      reason: "X のページは見に行きません。規約で禁じられています。ここに貼った追跡リンクが押された回数だけを数えます。",
    },
  ];
}

/** mado — 自分の Mado サイト（url には siteId が入っている） */
async function checkMado(hop: Hop): Promise<HopCheck[]> {
  const siteId = (hop.url || "").trim();
  if (!siteId) {
    return [
      {
        name: "サイトの設定を読む",
        status: "ng",
        reason: "サイトが選ばれていません。導線の設定でサイトを選び直してください。",
        evidence: { fetchedAt: now() },
      },
    ];
  }

  const [{ getWriteClient }, { runSiteCheck }] = await Promise.all([
    import("../supabase/server"),
    import("./site-check"),
  ]);

  const supabase = getWriteClient();
  if (!supabase) {
    return [
      {
        name: "サイトの設定を読む",
        status: "skipped",
        reason: "ただいまサイトの設定を読めません。時間をおいてもう一度お試しください。",
      },
    ];
  }

  const { data, error } = await supabase
    .from("site_configs")
    .select("config")
    .eq("site_id", siteId)
    .maybeSingle();

  if (error || !data?.config) {
    return [
      {
        name: "サイトの設定を読む",
        status: "ng",
        reason: "サイトが見つかりませんでした。導線の設定でサイトを選び直してください。",
        evidence: { fetchedAt: now() },
      },
    ];
  }

  return runSiteCheck(data.config as SiteConfig);
}

/* ═══════════════════════════════════════
   本体
   ═══════════════════════════════════════ */

/** 次の段の URL を、確かめられる形にする（mado は呼ぶ側が渡した公開 URL に置き換える） */
function nextUrlOf(next: Hop | undefined, context: CheckContext): URL | null {
  if (!next) return null;
  if (next.kind === "mado") {
    const url = context.siteUrls[next.url];
    return url ? publicUrl(url) : null;
  }
  return publicUrl(next.url);
}

/** 段1つを確かめる */
async function checkHop(hop: Hop, expect: NextExpectation): Promise<HopCheck[]> {
  switch (hop.kind) {
    case "web":
      return checkWeb(hop, expect);
    case "line":
      return checkLine(hop);
    case "discord":
      return checkDiscord(hop);
    case "mado":
      return checkMado(hop);
    case "member":
      return checkMember(hop);
    case "x":
      return checkX();
    default:
      return [{ name: "この段の確かめ方", status: "skipped", reason: "この種類の段はまだ確かめられません。" }];
  }
}

/**
 * 導線を丸ごと確かめる。
 * 段は同時に確かめる。1段でも 8 秒を超えたら、その段だけ打ち切って先へ進む。
 */
export async function runFunnelCheck(hops: Hop[], context: CheckContext = EMPTY_CONTEXT): Promise<HopResult[]> {
  const list = Array.isArray(hops) ? hops : [];

  return Promise.all(
    list.map(async (hop, hopIndex) => {
      const next = list[hopIndex + 1];
      const expect: NextExpectation = {
        next,
        url: nextUrlOf(next, context),
        code: context.codes[hopIndex] ?? null,
      };
      const checks = await withTimeout(
        checkHop(hop, expect).catch((err): HopCheck[] => {
          console.error("[funnel-check] 段の確認に失敗", { hopIndex, kind: hop?.kind, err });
          return [
            {
              name: "この段を確かめる",
              status: "ng",
              reason: "確かめている途中で止まりました。時間をおいてもう一度お試しください。",
              evidence: { fetchedAt: now() },
            },
          ];
        }),
        HOP_TIMEOUT_MS + 500,
        (): HopCheck[] => [
          {
            name: "この段を確かめる",
            status: "ng",
            reason: "8秒たっても返事がありませんでした。相手のページが重いか、止まっています。",
            evidence: { fetchedAt: now() },
          },
        ],
      );

      return { hopIndex, status: worstOf(checks), checks };
    }),
  );
}
