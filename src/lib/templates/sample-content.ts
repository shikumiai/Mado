/** Customer starter content is independent from fictional showcase companies. */
import type { SiteConfig } from "@/lib/site-config-schema";
import { HISTORY_SOURCE, ITEM_SOURCE, STATS_SOURCE } from "@/lib/editor/field-target";
import { normalizeSectionType } from "./catalog";
import { starterSectionData } from "./starter-content";

export function sampleSectionData(templateId: string | undefined | null, type: string, _variant?: string, industry?: string): Record<string, unknown> {
  return starterSectionData(templateId, type, industry);
}

const COMPANY_BACKED: Record<string, [string, string][]> = {
  hero: [
    ["title", "tagline"],
    ["lead", "description"],
  ],
  company: [
    ["message", "bio"],
    ["messageTitle", "tagline"],
  ],
};

export interface SampleSeed {
  /** そのセクションに持たせる分（見出し・本文・写真） */
  data: Record<string, unknown>;
  /** config の一番上に置く分（詳細ページが読む側）。何も無ければ空 */
  shared: Record<string, unknown[]>;
}

/**
 * 手本の中身を「セクションに持たせる分」と「config の一番上に置く分」に分ける。
 *
 * 実績・スタッフ・お品書き・お知らせは、詳細ページ（/works/1 など）も
 * config の一番上の配列を読む。だから、そこがまだ空のときは一番上へ入れる。
 * すでに中身があるときは、上書きせずそのセクションだけの一覧として持たせる
 * （同じ機能を2つ置いたとき、片方を直しても、もう片方が変わらない）。
 */
export function sampleSectionSeed(
  config: SiteConfig,
  type: string,
  variant?: string,
): SampleSeed {
  const t = normalizeSectionType(type);
  const data = { ...sampleSectionData(config.templateId, t, variant, config.industry) };
  if (t === "contact") {
    if (variant && !["form-info", "form-only"].includes(variant)) delete data.primaryCta;
    else data.primaryCta = { label: "この内容で送る", href: "#contact" };
  }
  const shared: Record<string, unknown[]> = {};
  const bag = config as unknown as Record<string, unknown>;
  const company = config.company as unknown as Record<string, unknown>;

  // その人がもう書いているものは、手本で上書きしない
  for (const [key, field] of COMPANY_BACKED[t] ?? []) {
    const own = company?.[field];
    if (typeof own === "string" && own.trim() !== "") delete data[key];
  }

  const move = (key: "items" | "stats" | "history", source: string | undefined) => {
    if (!source) return;
    const value = data[key];
    if (!Array.isArray(value) || value.length === 0) return;
    const current = bag[source];
    // すでにお客さんの中身があるところは触らない
    if (Array.isArray(current) && current.length > 0) return;
    if (shared[source]) return;
    shared[source] = value as unknown[];
    delete data[key];
  };

  move("items", ITEM_SOURCE[t]);
  if (t === "voices") move("stats", STATS_SOURCE);
  if (t === "company") move("history", HISTORY_SOURCE);

  return { data, shared };
}
