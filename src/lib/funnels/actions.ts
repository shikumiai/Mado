// TODO(統合時に削除): 裏側担当の実装に置き換える
"use server";

/**
 * 導線チェックの Server Action（署名だけの仮置き）。
 *
 * 画面側の担当が型を通すために置いた仮のファイル。
 * 中身は裏側担当の実装（Supabase を読み書きするもの）に丸ごと差し替える。
 * 署名は docs/FUNNEL_CHECK_V1.md §8 の契約そのままなので、ここは変えない。
 */

import type { Plan } from "@/lib/stripe";
import type { Hop, FunnelSummary, FunnelDetail, FunnelRun, HopClicks } from "./types";

export async function listFunnels(): Promise<
  | { ok: true; funnels: FunnelSummary[]; limit: number; plan: Plan }
  | { ok: false; reason: "unauthenticated" | "no_org" }
> {
  throw new Error("not implemented");
}

export async function loadFunnel(
  id: string,
): Promise<
  | { ok: true; funnel: FunnelDetail; plan: Plan }
  | { ok: false; reason: "unauthenticated" | "forbidden" | "not_found" }
> {
  void id;
  throw new Error("not implemented");
}

export async function createFunnel(input: {
  name: string;
  siteId?: string | null;
  hops: Hop[];
}): Promise<
  | { ok: true; id: string }
  | {
      ok: false;
      reason: "unauthenticated" | "no_org" | "plan" | "invalid" | "failed";
      message?: string;
    }
> {
  void input;
  throw new Error("not implemented");
}

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
  void id;
  void input;
  throw new Error("not implemented");
}

export async function deleteFunnel(
  id: string,
): Promise<
  | { ok: true }
  | { ok: false; reason: "unauthenticated" | "forbidden" | "not_found" | "failed" }
> {
  void id;
  throw new Error("not implemented");
}

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
  void id;
  throw new Error("not implemented");
}

export async function clicksByHop(
  id: string,
  days?: number,
): Promise<
  | { ok: true; days: number; hops: HopClicks[] }
  | { ok: false; reason: "unauthenticated" | "forbidden" | "not_found" }
> {
  void id;
  void days;
  throw new Error("not implemented");
}
