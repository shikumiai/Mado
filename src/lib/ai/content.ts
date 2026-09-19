import type { SiteConfig } from "../site-config-schema";
import type { AiKind } from "./policy";

export const COMPANY_FIELDS: Record<string, string> = {
  name: "会社・お店の名前", tagline: "キャッチコピー", description: "紹介文", bio: "代表挨拶",
  business: "事業内容", ceo: "代表者名", address: "所在地", phone: "電話番号", email: "メール",
  hours: "営業時間", since: "創業年",
};
export interface AiTarget { path: string; label: string; before: string }
export interface AiSuggestion extends AiTarget { after: string; evidence: string }
export const COMPANY_BRIEF = `会社・お店の名前：
事業内容・提供するサービス：
お客様・対応エリア：
自社の強み・大切にしていること：
代表者・挨拶に入れたい想い：
所在地・営業時間・連絡先：
確認できる実績（数字・時期も）：
文章の雰囲気・避けたい表現：
未確認の項目は空欄で構いません。`;

export function aiTargets(config: SiteConfig, kind: AiKind): AiTarget[] {
  const fields = kind === "text" ? ["tagline", "description", "bio"] : Object.keys(COMPANY_FIELDS);
  const company = config.company as unknown as Record<string, unknown>;
  const targets = fields.map(field => ({ path: `company.${field}`, label: COMPANY_FIELDS[field], before: typeof company[field] === "string" ? company[field] as string : "" }));
  config.sections?.forEach((section, index) => {
    if (!section.visible || section.type !== "hero" || !section.data) return;
    for (const [key, label] of [["title", "トップの見出し"], ["lead", "トップの紹介文"]]) {
      const value = section.data[key];
      if (typeof value === "string" && value.trim()) targets.push({ path: `sections.${index}.data.${key}`, label, before: value });
    }
  });
  return targets.slice(0, 20);
}

/** Model output cannot choose arbitrary config keys or its own before value. */
export function parseAiSuggestions(raw: string, targets: AiTarget[], source: string): AiSuggestion[] {
  const result: unknown = JSON.parse(raw);
  if (!result || typeof result !== "object" || !("suggestions" in result) || !Array.isArray(result.suggestions)) throw new Error("invalid_result");
  if (result.suggestions.length > 20) throw new Error("too_many_changes");
  const seen = new Set<string>();
  const suggestions: AiSuggestion[] = [];
  for (const item of result.suggestions) {
    if (!item || typeof item !== "object") throw new Error("invalid_suggestion");
    const target = targets.find(t => t.path === item.path);
    if (!target || seen.has(target.path) || typeof item.after !== "string" || !item.after.trim() || item.after.length > 2000 || typeof item.evidence !== "string" || !item.evidence.trim() || !source.includes(item.evidence)) throw new Error("ungrounded_suggestion");
    const numbers: string[] = item.after.match(/[0-9]+(?:[.,][0-9]+)*/g) ?? [];
    if (numbers.some(n => !source.includes(n))) throw new Error("unsupported_number");
    seen.add(target.path);
    if (item.after.trim() !== target.before) suggestions.push({ ...target, after: item.after.trim(), evidence: item.evidence });
  }
  if (!suggestions.length) throw new Error("no_changes");
  return suggestions;
}

export function applyAiSuggestions(config: SiteConfig, suggestions: AiSuggestion[]): SiteConfig {
  const updated = structuredClone(config);
  const allowed = aiTargets(config, "company");
  for (const suggestion of suggestions) {
    const target = allowed.find(t => t.path === suggestion.path);
    if (!target || target.before !== suggestion.before) throw new Error("changed_since_generation");
    const keys = target.path.split(".");
    let node = updated as unknown as Record<string, unknown>;
    for (const key of keys.slice(0, -1)) node = node[key] as Record<string, unknown>;
    node[keys[keys.length - 1]] = suggestion.after;
  }
  return updated;
}
