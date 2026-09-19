import type { AiBalance } from "./policy";

export function decodeBalance(raw: unknown): AiBalance | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.limit !== "number" || typeof value.used !== "number" || typeof value.attempted !== "number" || typeof value.resetsAt !== "string") return null;
  return { limit: value.limit, used: value.used, remaining: Math.max(0, value.limit - value.used), budgetRemaining: Math.max(0, value.limit * 2 - value.attempted), resetsAt: value.resetsAt };
}
