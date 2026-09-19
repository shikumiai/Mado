import type { SiteConfig } from "@/lib/site-config-schema";
import * as data from "@/components/sections/data";
import { normalizeSectionType, findSectionDef } from "@/lib/templates/catalog";
import { resolveFieldTarget } from "./field-target";

export type ContentField = {
  key: string; label: string; kind?: "text" | "long" | "image" | "url" | "number" | "boolean";
  fields?: ContentField[]; item?: ContentField[] | "text";
};
const f = (key: string, label: string, kind?: ContentField["kind"]): ContentField => ({ key, label, kind });
const image = f("image", "写真", "image");
const heading = [f("heading", "見出し"), f("eyebrow", "小見出し"), f("lead", "紹介文", "long")];
const cta = (key: string, label: string): ContentField => ({ key, label, fields: [f("label", "ボタンの文字"), f("href", "リンク先", "url")] });
const rows: ContentField = { key: "rows", label: "案内表", item: [f("label", "項目名"), f("value", "内容", "long")] };
const list = (key: string, label: string, item: ContentField[] | "text"): ContentField => ({ key, label, item });
const note = f("note", "補足", "long");
export const COMPANY_FIELDS: ContentField[] = [
  f("name", "会社名・屋号"), f("nameEn", "英字名"), f("tagline", "キャッチコピー", "long"),
  f("description", "事業の紹介", "long"), f("business", "事業内容", "long"),
  f("phone", "電話番号"), f("fax", "FAX"), f("email", "メールアドレス"), f("address", "所在地", "long"),
  f("hours", "営業時間・受付時間", "long"), f("mapEmbedUrl", "地図の埋め込みURL", "url"),
  f("ceo", "代表者名"), f("ceoTitle", "代表者の肩書き"), f("bio", "ごあいさつ", "long"),
  f("ceoPhoto", "代表者の写真", "image"), f("since", "創業年"), f("founded", "設立日"),
  f("capital", "資本金"), f("employees", "従業員数"), f("license", "許認可", "long"), f("iso", "認証", "long"),
  list("social", "SNS・外部リンク", [f("label", "表示名"), f("href", "リンク先", "url")]),
];
const titleDescription = [f("title", "タイトル"), f("description", "説明", "long")];
const itemFields: Record<string, ContentField[]> = {
  strengths: [...titleDescription, f("icon", "アイコン名")],
  services: [...titleDescription, f("icon", "アイコン名"), f("price", "料金"), f("duration", "所要時間"), f("details", "詳しい説明", "long"), f("targetAudience", "対象"), f("results", "提供内容", "long"), list("steps", "進め方", "text"), list("sessionContent", "実施内容", "text"), list("expectedChanges", "目指す変化", "text"), list("faq", "サービスの質問", [f("q", "質問"), f("a", "回答", "long")])],
  works: [...titleDescription, image, f("titleEn", "英字タイトル"), f("category", "分類"), f("year", "年"), f("location", "場所"), f("client", "依頼主"), f("specs", "仕様", "long"), f("concept", "コンセプト", "long"), f("beforeDesc", "変更前", "long"), f("afterDesc", "変更後", "long"), f("equipment", "設備", "long"), f("clientComment", "コメント", "long")],
  menu: [f("name", "名称"), image, f("category", "分類"), f("price", "料金・価格"), f("description", "説明", "long"), f("isRecommended", "おすすめとして表示", "boolean")],
  staff: [f("name", "氏名"), f("role", "役割・肩書き"), image, f("bio", "紹介文", "long"), f("specialty", "得意分野"), f("experience", "経歴", "long"), f("schedule", "担当日"), f("philosophy", "考え方・メッセージ", "long"), list("qualifications", "資格", "text"), list("programs", "担当プログラム", "text")],
  voices: [f("name", "お名前・表記"), f("project", "ご利用内容"), f("text", "いただいた声", "long"), f("rating", "評価（1〜5）", "number")],
  flow: [f("step", "番号", "number"), ...titleDescription, f("duration", "所要時間")],
  faq: [f("q", "質問", "long"), f("a", "回答", "long"), f("category", "分類")],
  news: [f("date", "日付"), f("category", "分類"), f("title", "タイトル"), image, f("excerpt", "概要", "long"), f("body", "本文", "long"), f("link", "外部リンク先", "url")],
  booking: [f("date", "開催日"), f("time", "時間"), f("title", "名称"), f("location", "会場"), f("spots", "残り枠数", "number")],
};
export function fieldsForSection(type: string): ContentField[] {
  type = normalizeSectionType(type);
  if (type === "hero") return [f("title", "キャッチコピー", "long"), f("eyebrow", "小見出し"), f("badge", "バッジの文字"), f("lead", "紹介文", "long"), image, list("facts", "短い案内", "text"), cta("primaryCta", "主なボタン"), cta("secondaryCta", "補助のボタン")];
  const fields = [...heading];
  if (itemFields[type]) fields.push(list("items", ({ works: "実績・事例", menu: "メニュー・商品", staff: "人物", voices: "お客様の声", booking: "予約枠" } as Record<string, string>)[type] ?? "一覧", itemFields[type]));
  if (type === "voices") fields.push(list("stats", "実績の数字", [f("num", "数字"), f("unit", "単位"), f("label", "説明")]));
  if (["menu", "flow", "faq", "booking", "contact", "access"].includes(type)) fields.push(note);
  if (type === "booking") fields.push(f("guidanceHeading", "事前案内の見出し"), list("guidance", "事前案内", "text"), f("messageLabel", "用件欄のラベル"), f("formNote", "フォームの注意書き", "long"));
  if (type === "contact") fields.push(f("emailNote", "メールの補足"), f("visitNote", "来訪の補足"), f("actionHeading", "連絡ボタンの見出し"));
  if (type === "services") fields.push(cta("primaryCta", "案内ボタン"));
  if (type === "menu") fields.push(f("priceNote", "価格の補足（例：税込）"));
  if (type === "access") fields.push(f("hoursHeading", "時間表の見出し"));
  if (type === "news") fields.push(cta("moreCta", "一覧へのリンク"));
  if (["booking", "contact"].includes(type)) fields.push(cta("primaryCta", "主なボタン"), cta("secondaryCta", "補助のボタン"), list("purposes", "お問い合わせの選択肢", "text"));
  if (["booking", "access", "company"].includes(type)) fields.push(image);
  if (["access", "company", "contact"].includes(type)) fields.push(rows);
  if (type === "access") fields.push(f("mapEmbedUrl", "地図の埋め込みURL", "url"), list("ways", "交通・駐車場の案内", "text"), { key: "hoursTable", label: "曜日・時間の表", fields: [list("head", "列の見出し", "text"), list("rows", "時間帯", [f("label", "時間帯名"), list("cells", "各列の内容", "text")]), note] });
  if (type === "company") fields.push(f("messageHeading", "あいさつの見出し"), f("messageTitle", "あいさつのタイトル"), f("message", "あいさつ本文", "long"), f("historyHeading", "沿革の見出し"), list("history", "沿革", [f("year", "年"), f("title", "出来事"), f("description", "説明", "long")]));
  return fields;
}

/** 描画と同じ解決関数から編集欄を作る。非表示・空欄も入力できる。 */
export function sectionContent(config: SiteConfig, index: number): Record<string, unknown> {
  const s = config.sections![index];
  const type = normalizeSectionType(s.type);
  const resolvers: Record<string, (c: SiteConfig, d?: Record<string, unknown>) => object> = {
    hero: data.heroOf, strengths: data.strengthsOf, services: data.servicesOf, works: data.worksOf,
    menu: data.menuOf, staff: data.staffOf, voices: data.voicesOf, flow: data.flowOf, faq: data.faqOf,
    news: data.newsOf, access: data.accessOf, booking: data.bookingOf, contact: data.contactOf, company: data.companyOf,
  };
  const values = { ...s.data, ...(resolvers[type]?.(config, s.data) ?? {}) } as Record<string, unknown>;
  if ("primary" in values) values.primaryCta ??= values.primary;
  if ("secondary" in values) values.secondaryCta ??= values.secondary;
  return values;
}

export interface ContentPatch { path: string; value: unknown }
/** A duplicated part owns a snapshot, so changing its list cannot edit the original part. */
export function duplicateSectionData(config: SiteConfig, index: number): Record<string, unknown> {
  const section = config.sections![index];
  const content = sectionContent(config, index);
  const variant = section.variant ?? findSectionDef(config.templateId, section)?.variant;
  if (normalizeSectionType(section.type) === "staff" && variant === "lead-message" && !(content.items as unknown[])?.length && config.company.ceo) {
    content.items = [{ id: 1, name: config.company.ceo, role: config.company.ceoTitle ?? "代表", bio: config.company.bio ?? "", image: config.company.ceoPhoto ?? "" }];
  }
  return structuredClone({ ...section.data, ...Object.fromEntries(fieldsForSection(section.type)
    .filter(field => content[field.key] !== undefined).map(field => [field.key, content[field.key]])) });
}
export function contentPatches(config: SiteConfig, index: number | null, before: Record<string, unknown>, after: Record<string, unknown>): ContentPatch[] {
  const patches: ContentPatch[] = [];
  for (const key of Object.keys(after)) {
    if (JSON.stringify(before[key]) === JSON.stringify(after[key])) continue;
    const oldRows = before[key]; const newRows = after[key];
    // A normal company-backed table keeps the same targets as inline editing.
    if (index !== null && key === "rows" && !Array.isArray(config.sections![index].data?.rows) && Array.isArray(oldRows) && Array.isArray(newRows) && oldRows.length === newRows.length && oldRows.every((r, i) => r.label === newRows[i].label)) {
      newRows.forEach((r, i) => {
        if (r.value === oldRows[i].value) return;
        const target = resolveFieldTarget(config, `sections.${index}.rows.${i}.value`);
        patches.push({ path: target.path, value: target.toStored ? target.toStored(r.value) : r.value });
      });
    } else {
      patches.push({ path: index === null ? `company.${key}` : resolveFieldTarget(config, `sections.${index}.${key}`).path, value: after[key] });
    }
  }
  return patches;
}

/** Creates arrays at numeric segments; refuses prototype keys even for internal callers. */
export function setConfigValue(root: object, path: string, value: unknown): void {
  const keys = path.split(".");
  if (keys.some((k) => ["__proto__", "prototype", "constructor"].includes(k))) throw new Error("Invalid field");
  let at = root as Record<string, unknown>;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!at[key] || typeof at[key] !== "object") at[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    at = at[key] as Record<string, unknown>;
  }
  at[keys.at(-1)!] = value;
}

export function isContentUrl(value: string, image = false): boolean {
  if (!value) return true;
  if (/[\u0000-\u0020\\]/.test(value)) return false;
  if (image && /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(value)) return true;
  return /^https?:\/\/[^/]+/i.test(value) || /^\/(?!\/)/.test(value) || (!image && /^(#|mailto:|tel:)/i.test(value));
}

/** Upload pending photos anywhere in the config; the caller saves only after every upload succeeds. */
export async function uploadConfigImages(config: SiteConfig, upload: (value: string) => Promise<string>): Promise<SiteConfig> {
  const next = structuredClone(config);
  const cache = new Map<string, Promise<string>>();
  async function walk(value: unknown): Promise<unknown> {
    if (typeof value === "string" && value.startsWith("data:image/")) {
      if (!cache.has(value)) cache.set(value, upload(value));
      return await cache.get(value);
    }
    if (Array.isArray(value)) return Promise.all(value.map(walk));
    if (value && typeof value === "object") {
      for (const [key, item] of Object.entries(value)) (value as Record<string, unknown>)[key] = await walk(item);
    }
    return value;
  }
  await walk(next);
  return next;
}

/** Explicit reset preserves shared company fields and existing customer photos. */
export function resetSectionContent(config: SiteConfig, index: number, current: Record<string, unknown>, seed: Record<string, unknown>): Record<string, unknown> {
  const next = { ...current, ...seed };
  for (const key of Object.keys(seed)) {
    if (resolveFieldTarget(config, `sections.${index}.${key}`).path.startsWith("company.")) next[key] = current[key];
    if (Array.isArray(current[key]) && Array.isArray(next[key])) {
      const old = current[key] as Record<string, unknown>[];
      const fresh = next[key] as Record<string, unknown>[];
      let nextId = Math.max(0, ...old.map(item => Number(item?.id) || 0)) + 1;
      next[key] = fresh.map((item, i) => {
        if (!item || typeof item !== "object") return item;
        return { ...item,
          ...(key === "items" && (item.id !== undefined || old[i]?.id !== undefined) ? { id: old[i]?.id ?? nextId++ } : {}),
          ...(typeof old[i]?.slug === "string" ? { slug: old[i].slug } : {}),
          ...(typeof old[i]?.image === "string" ? { image: old[i].image } : {}),
        };
      });
      for (let i = fresh.length; i < old.length; i++) if (old[i]?.image) (next[key] as unknown[]).push(old[i]);
    }
  }
  const section = config.sections![index];
  if (normalizeSectionType(section.type) === "contact") {
    const variant = section.variant ?? findSectionDef(config.templateId, section)?.variant ?? "form-info";
    next.primaryCta = !["form-info", "form-only"].includes(variant)
      ? undefined
      : { label: "この内容で送る", href: "#contact" };
  }
  return next;
}
