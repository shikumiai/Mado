/**
 * 導線チェックの型の契約。
 *
 * 設計の正は docs/FUNNEL_CHECK_V1.md §8。画面も裏側もこのファイルだけを見る。
 * ここを変えると両方が同時に壊れるので、変えるときは設計書から直す。
 */

/** 段の種類。宣言できる場所の種類（§3） */
export type HopKind = "x" | "line" | "web" | "mado" | "member" | "discord";

/** 導線の1つの場所 */
export interface Hop {
  kind: HopKind;
  /** 画面に出す名前 */
  label: string;
  /** 宣言した URL。mado のときは siteId を入れる */
  url: string;
}

/** 段の結果。skipped は「確かめていない」 */
export type HopStatus = "ok" | "ng" | "skipped";

/** 段の中で確かめた1項目 */
export interface HopCheck {
  /** 「URL が生きている」「次の段へのリンクがある」など */
  name: string;
  status: HopStatus;
  /** ng / skipped の理由。一文 */
  reason?: string;
  /** 根拠。あるものだけ */
  evidence?: {
    statusCode?: number;
    finalUrl?: string;
    title?: string;
    /** ISO */
    fetchedAt: string;
  };
}

/** 段1つ分の結果。status は checks の最悪値 */
export interface HopResult {
  hopIndex: number;
  status: HopStatus;
  checks: HopCheck[];
}

/** チェック1回の状態 */
export type RunStatus = "running" | "done" | "failed";

/** チェック1回分 */
export interface FunnelRun {
  id: string;
  status: RunStatus;
  results: HopResult[];
  startedAt: string;
  finishedAt: string | null;
}

/** 一覧に出す導線1本の要約 */
export interface FunnelSummary {
  id: string;
  name: string;
  siteId: string | null;
  hopCount: number;
  updatedAt: string;
  lastRun: {
    status: RunStatus;
    finishedAt: string | null;
    worst: HopStatus | null;
  } | null;
}

/** 段ごとに発行する短い URL */
export interface TrackedLink {
  hopIndex: number;
  code: string;
  url: string;
}

/** 詳細画面が必要とする一式 */
export interface FunnelDetail {
  id: string;
  name: string;
  siteId: string | null;
  hops: Hop[];
  links: TrackedLink[];
  runs: FunnelRun[];
}

/** 段ごとの人数（visitors が丸めた人数、clicks が生の数） */
export interface HopClicks {
  hopIndex: number;
  visitors: number;
  clicks: number;
}
