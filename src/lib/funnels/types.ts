/**
 * 導線チェックで使う言葉の形（型の正）。
 *
 * 設計書: docs/FUNNEL_CHECK_V1.md の §8。
 * 画面もサーバーもここの形だけを見る。ここを変えるときは設計書も直す。
 *
 * 言葉の対応
 *   導線（funnel） … 入口から目的地までの段の並び
 *   段（hop）      … 導線の1つの場所（X・LINE・Web・自分のサイト・会員ページ・Discord）
 *   チェック（run）… 導線を上から順に確かめた1回の実行
 *   追跡リンク     … 段ごとに発行する短い URL。通った人数を数える
 */

/** 段の種類 */
export type HopKind = "x" | "line" | "web" | "mado" | "member" | "discord";

/** 段1つ */
export interface Hop {
  kind: HopKind;
  /** 画面に出す名前 */
  label: string;
  /** 宣言した URL（mado は siteId） */
  url: string;
}

/** 3値。確かめていないものは ok でも ng でもなく skipped */
export type HopStatus = "ok" | "ng" | "skipped";

/** 確かめたこと1件 */
export interface HopCheck {
  /** 「URL が生きている」「次の段へのリンクがある」 */
  name: string;
  status: HopStatus;
  /** ng / skipped の理由。一文 */
  reason?: string;
  /** 根拠。取れたものだけ */
  evidence?: {
    statusCode?: number;
    finalUrl?: string;
    title?: string;
    /** ISO */
    fetchedAt: string;
  };
}

/** 段1つぶんの結果 */
export interface HopResult {
  hopIndex: number;
  /** checks の最悪値 */
  status: HopStatus;
  checks: HopCheck[];
}

/** チェック1回の状態 */
export type RunStatus = "running" | "done" | "failed";

/** チェック1回 */
export interface FunnelRun {
  id: string;
  status: RunStatus;
  results: HopResult[];
  startedAt: string;
  finishedAt: string | null;
}

/** 一覧に出す導線1本 */
export interface FunnelSummary {
  id: string;
  name: string;
  siteId: string | null;
  hopCount: number;
  updatedAt: string;
  lastRun: {
    status: RunStatus;
    finishedAt: string | null;
    /** 段の中でいちばん悪い状態 */
    worst: HopStatus | null;
  } | null;
}

/** 段ごとの追跡リンク */
export interface TrackedLink {
  hopIndex: number;
  code: string;
  /** https://mado.shikumiai.com/go/<code> */
  url: string;
}

/** 導線1本の中身。runs は新しい順、最大10 */
export interface FunnelDetail {
  id: string;
  name: string;
  siteId: string | null;
  hops: Hop[];
  links: TrackedLink[];
  runs: FunnelRun[];
}

/** 段ごとの通過人数 */
export interface HopClicks {
  hopIndex: number;
  /** 同じ端末らしいものを1日1回に丸めた人数。画面に出すのはこちら */
  visitors: number;
  /** 生のクリック数 */
  clicks: number;
}
