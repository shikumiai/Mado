/** 表示側と同じデータ解決を使い、差し替える写真と保存先を一対一にする。 */
import type { SiteConfig } from "@/lib/site-config-schema";
import { getSections } from "@/lib/site-config-schema";
import { findSectionDef, LEGACY_SECTIONS, planAllows } from "@/lib/templates/catalog";
import { accessOf, bookingOf, companyOf, heroOf, menuOf, newsOf, staffOf, worksOf } from "@/components/sections/data";
import { resolveFieldTarget } from "./field-target";

export interface PhotoSlot {
  path: string;
  src: string;
  label: string;
  group: string;
  locations: string[];
  kind: "hero" | "landscape" | "portrait";
}

const VARIANTS: Record<string, string[]> = {
  hero: ["split", "statement", "full", "window", "quiet"],
  works: ["grid", "masonry", "feature-list", "showcase", "quiet"],
  staff: ["grid", "lead-message", "list", "editorial", "quiet"],
  menu: ["photo-cards", "price-table", "tabs", "signboard", "quiet-table"],
  news: ["list-rows", "cards", "feature-plus", "editorial", "quiet"],
  company: ["table-message-history", "table-only", "message-feature", "history-timeline", "quiet-table"],
  access: ["map-table", "table-only", "photo-info", "band", "quiet"],
  booking: ["cta-band", "slots-cards", "form", "photo-cta", "quiet-line"],
};

export function isSamplePhoto(src: string): boolean {
  return src.startsWith("/images/templates/");
}

export function photoSlots(config: SiteConfig): PhotoSlot[] {
  const found = new Map<string, PhotoSlot>();
  getSections(config).forEach((section, index) => {
    const def = findSectionDef(config.templateId, section);
    if (section.visible === false || !planAllows(config.plan, def?.plan)) return;
    const legacy = LEGACY_SECTIONS[section.type];
    const type = legacy?.type ?? section.type;
    const variants = VARIANTS[type];
    if (!variants) return;
    const chosen = section.variant ?? legacy?.variant ?? def?.variant;
    const variant = chosen && variants.includes(chosen) ? chosen : variants[0];
    const group = section.label || def?.label || "写真";
    const data = section.data;
    const add = (field: string, src: string | undefined, label: string, kind: PhotoSlot["kind"] = "landscape", directPath?: string) => {
      const path = directPath ?? resolveFieldTarget(config, `sections.${index}.${field}`).path;
      const previous = found.get(path);
      if (previous) {
        if (!previous.locations.includes(group)) previous.locations.push(group);
      } else {
        found.set(path, { path, src: src || "", label, group, locations: [group], kind });
      }
    };
    switch (type) {
      case "hero":
        if (variant !== "quiet") add("image", heroOf(config, data).image, "メインの写真", "hero");
        break;
      case "works":
        worksOf(config, data).items.forEach((item, i) => add(`items.${i}.image`, item.image, item.title || `実績 ${i + 1}`));
        break;
      case "staff": {
        if (variant === "quiet") break;
        const items = staffOf(config, data).items;
        items.forEach((item, i) => add(`items.${i}.image`, item.image, item.name || `スタッフ ${i + 1}`, "portrait"));
        if (!items.length && variant === "lead-message" && config.company.ceo) {
          add("image", config.company.ceoPhoto, config.company.ceo, "portrait", "company.ceoPhoto");
        }
        break;
      }
      case "menu": {
        const items = menuOf(config, data).items;
        if (variant === "photo-cards" || variant === "tabs") {
          items.forEach((item, i) => add(`items.${i}.image`, item.image, item.name || `メニュー ${i + 1}`));
        } else if (variant === "signboard" && items.length) {
          const i = Math.max(0, items.findIndex((item) => item.isRecommended));
          add(`items.${i}.image`, items[i].image, items[i].name);
        }
        break;
      }
      case "news": {
        const items = newsOf(config, data).items;
        if (variant === "cards") items.forEach((item, i) => add(`items.${i}.image`, item.image, item.title));
        if (variant === "feature-plus" && items[0]) add("items.0.image", items[0].image, items[0].title);
        break;
      }
      case "company": {
        const d = companyOf(config, data);
        if (d.message && ["table-message-history", "message-feature"].includes(variant)) {
          add("image", d.image, "代表の写真", "portrait");
        }
        break;
      }
      case "access":
        if (variant === "photo-info") add("image", accessOf(config, data).image, "お店・施設の写真");
        break;
      case "booking":
        if (variant === "photo-cta") add("image", bookingOf(config, data).image, "予約案内の写真");
        break;
    }
  });
  return [...found.values()];
}

/** 一覧で確定した宛先だけを変更する。他の部品・文章・配列を作り直さない。 */
export function replacePhoto(config: SiteConfig, path: string, url: string): SiteConfig {
  if (!photoSlots(config).some((slot) => slot.path === path)) throw new Error("写真の場所が変わりました。最新の画面を読み込んでください。");
  const next = structuredClone(config);
  next.sections = structuredClone(getSections(config));
  const parts = path.split(".");
  if (parts.some((part) => ["__proto__", "prototype", "constructor"].includes(part))) throw new Error("写真の保存先が正しくありません。");
  let target = next as unknown as Record<string, unknown>;
  for (const part of parts.slice(0, -1)) {
    if (target[part] === undefined) target[part] = {};
    target = target[part] as Record<string, unknown>;
  }
  target[parts.at(-1)!] = url;
  return next;
}
