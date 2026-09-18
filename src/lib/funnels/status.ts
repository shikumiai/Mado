/**
 * 状態（ok / ng / skipped）を画面に出すときの言葉と色。
 *
 * 総合点は出さない（docs/FUNNEL_CHECK_V1.md §12）。出すのは段ごとの状態だけ。
 */

import type { HopStatus } from "./types";

type Tone = "success" | "danger" | "neutral";

export const STATUS_LABELS: Record<HopStatus, string> = {
  ok: "つながっている",
  ng: "切れている",
  skipped: "確かめていない",
};

export const STATUS_TONES: Record<HopStatus, Tone> = {
  ok: "success",
  ng: "danger",
  skipped: "neutral",
};

/** 状態の丸の色。CSS 変数をそのまま使う */
export const STATUS_DOT: Record<HopStatus, string> = {
  ok: "var(--success)",
  ng: "var(--danger)",
  skipped: "var(--ink3)",
};

/** 悪いほうを残す。ng > skipped > ok */
export function worstStatus(list: HopStatus[]): HopStatus | null {
  if (list.length === 0) return null;
  if (list.includes("ng")) return "ng";
  if (list.includes("skipped")) return "skipped";
  return "ok";
}

/** 「2026年9月18日 14:30」の形。ISO が壊れていたらそのまま返す */
export function formatRunTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${hh}:${mm}`;
}
