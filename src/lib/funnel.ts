export const funnelStatuses: Record<string, string> = {
  requested: "内容確認中",
  quoted: "見積をご確認ください",
  checking: "導線を確認中",
  reported: "確認結果が届きました",
  closed: "対応完了",
  cancelled: "受付終了",
};
export const funnelSteps: Record<string, string> = {
  entry: "紹介ページに入る",
  understand: "内容・料金を理解する",
  form: "問い合わせに進む",
  complete: "送信・完了を確かめる",
};
export type Finding = {
  source: "human" | "ai";
  reviewer: string;
  step: string;
  observation: string;
  hypothesis: string;
  suggestion: string;
};
export type FunnelOrder = {
  id: string;
  user_id: string;
  previous_order_id: string | null;
  title: string;
  entry_url: string;
  audience: string;
  goal: string;
  context: string;
  test_mode: "before_submit" | "test_completion";
  status: string;
  quote_yen: number | null;
  quote_scope: string;
  quote_accepted_at: string | null;
  payment_confirmed: boolean;
  report_summary: string;
  checked_scope: string;
  findings: Finding[];
  version: number;
  created_at: string;
};
// These are links for manual review. Never fetch user URLs on the server.
export function publicHttpsUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const h = url.hostname.toLowerCase();
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      !h.includes(".") ||
      h.startsWith("[") ||
      /^[\d.]+$/.test(h) ||
      /\.(local|localhost|internal|test|invalid)$/.test(h) ||
      h === "localhost" ||
      value.length > 2000
    )
      return null;
    return url.href;
  } catch {
    return null;
  }
}
