/**
 * 導線を上から順に確かめる（設計書 FUNNEL_CHECK_V1.md の §3）。
 *
 * やること
 *   web     … 開けるか・最終 URL・タイトル・次の段への行き方が本文にあるか
 *   line    … 友だち追加 URL が生きているか・飛び先が LINE の友だち追加ページか
 *   discord … 公開の招待 API を叩いて、有効か・期限切れか・サーバー名と人数
 *   mado    … 自分のサイトの設定を読んで §7 のサイト内チェック
 *   x       … 見に行かない（規約）。通った人数は追跡リンクで数える
 *   member  … 入口 URL が生きているかだけ。ログインの先は見ない
 *
 * 守ること
 *   ・1段あたり8秒で打ち切る。相手のサイトが重くても画面を待たせない
 *   ・ng には必ず理由を一文と、取れた根拠（状態コード・最終 URL・取得日時）を残す
 *   ・取りに行くのは公開されている URL だけ。社内向けのアドレスや IP は弾く
 *
 * mado の段の url には siteId が入る。他人のサイトを覗けないように、
 * 呼ぶ側（actions.ts）で「その会社のサイトか」を確かめてから渡すこと。
 */

import type { SiteConfig } from "../site-config-schema";
import { SITE_BASE_URL } from "../resolve-site";
import type { Hop, HopCheck, HopResult, HopStatus } from "./types";

/** 相手のサーバーに名乗る名前 */
const USER_AGENT = "Mado-FunnelCheck/1.0";

/** 1段あたりの制限時間 */
const HOP_TIMEOUT_MS = 8_000;

/** 読み込む本文の上限（重いページで詰まらせない） */
const MAX_BODY = 512 * 1024;

/** 追跡リンクの置き場（ここへのリンクも「次の段への行き方」として認める） */
const TRACK_PATH = "/go/";
const TRACK_HOST = new URL(SITE_BASE_URL).hostname.toLowerCase().replace(/^www\./, "");

/* ═══════════════════════════════════════
   小さな道具
   ═══════════════════════════════════════ */

function now(): string {
  return new Date().toISOString();
}

/**
 * 段の状態。ng が1つでもあれば ng。
 * 1つも確かめられなかったとき（全部 skipped）だけ skipped にする。
 * こうしないと「最後の段なので次は無い」のような注記だけで灰色になってしまう。
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
 * 取りに行ってよい URL か。
 * 公開されている http / https のページだけを通す。
 * 社内のアドレス・IP 直打ち・変わったポートは弾く（サーバーから内側を覗かせない）。
 */
function publicUrl(value: string): URL | null {
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
  if (host === "localhost" || /\.(local|localhost|internal|test|invalid)$/.test(host)) return null;
  return url;
}

interface Fetched {
  ok: boolean;
  statusCode?: number;
  finalUrl?: string;
  title?: string;
  body: string;
  /** 取りに行けなかったときの言い分 */
  failure?: "blocked" | "network";
}

/** ページを1枚取ってくる。落ちても例外は投げない */
async function getPage(value: string): Promise<Fetched> {
  const url = publicUrl(value);
  if (!url) return { ok: false, body: "", failure: "blocked" };

  try {
    const res = await fetch(url.href, {
      redirect: "follow",
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(HOP_TIMEOUT_MS),
    });
    const raw = await res.text().catch(() => "");
    const body = raw.slice(0, MAX_BODY);
    return {
      ok: res.status < 400,
      statusCode: res.status,
      finalUrl: res.url || url.href,
      title: titleOf(body),
      body,
    };
  } catch {
    return { ok: false, body: "", finalUrl: url.href, failure: "network" };
  }
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

/**
 * 見比べるために URL をホスト名と道筋に割る。
 * http / https・www・末尾の / ・後ろに付く ?... の違いは無視する。
 * 本文の中の "/about" のような書き方は、そのページの住所を土台にして解く。
 */
function splitUrl(value: string, base?: string): { host: string; path: string } | null {
  const raw = (value || "").trim();
  if (!raw || /^(#|mailto:|tel:|javascript:|data:)/i.test(raw)) return null;
  try {
    const url = new URL(raw, base || undefined);
    return {
      host: url.hostname.toLowerCase().replace(/^www\./, ""),
      path: url.pathname.toLowerCase().replace(/\/+$/, ""),
    };
  } catch {
    return null;
  }
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
    return "URL の形が正しくないか、外から開けないアドレスです。https から始まる URL を入れてください。";
  }
  if (page.failure === "network") {
    return `${what}につながりませんでした。URL が合っているか確かめてください。`;
  }
  return `${what}が開きません（${page.statusCode}）。URL を確かめてください。`;
}

/* ═══════════════════════════════════════
   段の種類ごとの確かめ方
   ═══════════════════════════════════════ */

/** web — 任意のページ */
async function checkWeb(hop: Hop, next: Hop | undefined): Promise<HopCheck[]> {
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

  checks.push(nextLinkCheck(page, next));
  return checks;
}

/** 次の段への行き方が本文にあるか。追跡リンクが貼ってあればそれでよい */
function nextLinkCheck(page: Fetched, next: Hop | undefined): HopCheck {
  if (!next) {
    return {
      name: "次の段へのリンクがある",
      status: "skipped",
      reason: "ここが最後の段なので、次の行き先はありません。",
    };
  }
  if (!page.ok || !page.body) {
    return {
      name: "次の段へのリンクがある",
      status: "skipped",
      reason: "ページを開けなかったので、中のリンクは確かめていません。",
    };
  }

  // 本文のリンクを、そのページの住所を土台にして解く（"/line" のような書き方も見る）
  const links = hrefsOf(page.body)
    .map((href) => splitUrl(href, page.finalUrl))
    .filter((v): v is { host: string; path: string } => v !== null);

  // 追跡リンク（mado.shikumiai.com/go/…）が貼ってあれば、それで道はつながっている
  const hasTracked = links.some((l) => l.host === TRACK_HOST && l.path.startsWith(TRACK_PATH));

  // 次の段の URL そのもの。自分の Mado サイトは URL の代わりに siteId が入っているので見比べられない
  const target = next.kind === "mado" ? null : splitUrl(next.url);
  const hasDirect =
    target !== null &&
    links.some(
      (l) =>
        l.host === target.host &&
        (target.path === "" || l.path === target.path || l.path.startsWith(target.path + "/")),
    );

  if (hasTracked || hasDirect) {
    return { name: "次の段へのリンクがある", status: "ok", evidence: evidenceOf(page) };
  }
  return {
    name: "次の段へのリンクがある",
    status: "ng",
    reason: `このページに「${next.label}」へのリンクが見つかりません。ここで道が切れています。`,
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
  // 「abcDEF12」のようにコードだけ書かれていたとき
  const raw = (value || "").trim();
  return /^[a-z0-9-]{2,64}$/i.test(raw) ? raw : null;
}

interface DiscordInvite {
  guild?: { name?: string };
  approximate_member_count?: number;
  approximate_presence_count?: number;
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

  const api = `https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true`;
  let status: number | undefined;
  let invite: DiscordInvite | null = null;

  try {
    const res = await fetch(api, {
      redirect: "follow",
      headers: { "user-agent": USER_AGENT, accept: "application/json" },
      signal: AbortSignal.timeout(HOP_TIMEOUT_MS),
    });
    status = res.status;
    if (res.ok) invite = (await res.json().catch(() => null)) as DiscordInvite | null;
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
      name: "サーバー名と人数が取れる",
      status: name ? "ok" : "skipped",
      ...(name
        ? {}
        : { reason: "サーバー名が取れませんでした。招待の設定をご確認ください。" }),
      evidence: {
        ...base,
        ...(name ? { title: members !== undefined ? `${name}（${members}人）` : name } : {}),
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
      reason: "X のページは見に行きません。規約で禁じられています。通った人数は追跡リンクで数えます。",
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

  // データベースと §7 の判定はここでしか使わないので、必要になってから読み込む
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

/** 段1つを確かめる */
async function checkHop(hop: Hop, next: Hop | undefined): Promise<HopCheck[]> {
  switch (hop.kind) {
    case "web":
      return checkWeb(hop, next);
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
      return [
        {
          name: "この段の確かめ方",
          status: "skipped",
          reason: "この種類の段はまだ確かめられません。",
        },
      ];
  }
}

/**
 * 導線を丸ごと確かめる。
 * 段は同時に確かめる。1段でも 8 秒を超えたら、その段だけ打ち切って先へ進む。
 */
export async function runFunnelCheck(hops: Hop[]): Promise<HopResult[]> {
  const list = Array.isArray(hops) ? hops : [];

  return Promise.all(
    list.map(async (hop, hopIndex) => {
      const checks = await withTimeout(
        checkHop(hop, list[hopIndex + 1]).catch((err): HopCheck[] => {
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
