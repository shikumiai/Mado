import type { Plan } from "../stripe";

export type AiKind = "text" | "company";
export const AI_ALLOWANCE: Record<Plan, number> = { otameshi: 0, omakase: 30, "omakase-pro": 100 };
export const AI_COST: Record<AiKind, number> = { text: 1, company: 5 };
export const AI_MODEL = "gpt-4.1-mini-2025-04-14";
export const AI_MAX_PROMPT_BYTES: Record<AiKind, number> = { text: 16000, company: 32000 };
export const AI_MAX_OUTPUT_TOKENS: Record<AiKind, number> = { text: 1200, company: 3200 };
export const AI_SOURCE_LIMIT: Record<AiKind, number> = { text: 2000, company: 6000 };
export const AI_RESET_NOTE = "会社内で共有。毎月1日（日本時間）に更新・繰越なし。追加料金は自動で発生しません。";

export interface AiBalance {
  limit: number;
  used: number;
  remaining: number;
  resetsAt: string;
  budgetRemaining: number;
}

export function aiPeriod(now = new Date()): string {
  return new Date(now.getTime() + 9 * 3600000).toISOString().slice(0, 7);
}
