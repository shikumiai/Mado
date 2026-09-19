/**
 * 追跡リンクの受け口（設計書 FUNNEL_CHECK_V1.md の §4）。
 *
 *   mado.shikumiai.com/go/<code>
 *     → tracked_links の飛び先へ 302 で送る
 *     → 通ったことを tracked_clicks に1行だけ残す
 *
 * 残すもの: 時刻・同じ端末らしいかの目印・どこから来たかのホスト名。
 * 残さないもの: IP アドレス。誰が来たかは分からないまま、人数だけ数える。
 *
 * コードが見つからないときは 404 にしない。お客さんが X や LINE に貼った
 * リンクを、導線を消したあとも死んだリンクにしないため、Mado のトップへ送る。
 */

import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { getWriteClient } from "@/lib/supabase/server";
import { SITE_BASE_URL } from "@/lib/resolve-site";

export const dynamic = "force-dynamic";

/** 明らかに人ではないもの。数に入れない */
const BOT_UA =
  /(bot|crawler|spider|crawl|slurp|preview|fetcher|monitor|headless|curl|wget|python-requests|okhttp|facebookexternalhit|slackbot|discordbot|twitterbot|embedly|whatsapp|line-poker)/i;

/** 目印を作るときに混ぜる言葉。表に出ない */
const SALT = process.env.FUNNEL_CLICK_SALT || "mado-funnel";

/** 飛ばしてよい URL か（javascript: などで飛ばさない） */
function safeTarget(value: string): string | null {
  try {
    const url = new URL((value || "").trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.href;
  } catch {
    return null;
  }
}

/**
 * 同じ端末らしいかの目印。人を特定するものではなく、同じブラウザ情報の別人は同じ値になる。
 * 画面に出す数は「押された回数」で、この目印を人数としては使わない。
 * 日付は集計（日本時間）と同じ区切りにする。
 */
function visitorHash(userAgent: string): string {
  const day = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return createHash("sha256").update(`${userAgent}|${day}|${SALT}`).digest("hex");
}

/** どこから来たか。ホスト名だけ残す */
function refHost(referer: string | null): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).hostname.toLowerCase().slice(0, 253) || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const home = NextResponse.redirect(SITE_BASE_URL, 302);

  if (!/^[a-zA-Z0-9]{6,16}$/.test(code || "")) return home;

  const supabase = getWriteClient();
  if (!supabase) return home;

  const { data, error } = await supabase
    .from("tracked_links")
    .select("code, target_url")
    .eq("code", code)
    .maybeSingle();

  if (error || !data) return home;

  const target = safeTarget(data.target_url as string);
  if (!target) return home;

  const userAgent = request.headers.get("user-agent") || "";

  // 人が踏んだときだけ数える。取りこぼしても飛ばすほうを優先する
  if (userAgent && !BOT_UA.test(userAgent)) {
    const { error: insertError } = await supabase.from("tracked_clicks").insert({
      code: data.code as string,
      visitor_hash: visitorHash(userAgent),
      ref_host: refHost(request.headers.get("referer")),
    });
    if (insertError) {
      console.error("[go] クリックの記録に失敗", { code, error: insertError });
    }
  }

  return NextResponse.redirect(target, 302);
}
