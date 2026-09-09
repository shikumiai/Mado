/**
 * 部品を足したときに入る「手本の中身」。
 *
 * カタログから部品を足した直後に、見出しも文章も写真も無い空っぽの帯が出ると、
 * お客さんは何を直せばいいのか分からない。だから足した瞬間から中身が入っているようにする。
 *
 * 中身はどこから来るか
 *   1. その業種テンプレートのデモ（src/app/portfolio-templates/<id>/site.config.json）。
 *      いま公開ページで見えているものと同じ、実際の商売の言葉と写真。
 *   2. そのテンプレートにその機能が無ければ、他の9つのデモから同じ機能を借りる。
 *   3. それでも足りない分は src/components/sections/data.ts の既定（見出しの言葉）。
 * ここで文章を書き起こさない。写しを作ると、デモを直したときに片方だけ古くなる。
 *
 * お客さんの事実（住所・電話・営業時間・地図）は手本から入れない。
 * それらは config.company から組み立てられるので、よその会社の連絡先が
 * お客さんのサイトに出てしまわないように、手本からは必ず外す。
 */

import type { SiteConfig } from "@/lib/site-config-schema";
import type { SectionData } from "@/components/sections/types";
import {
  accessOf, bookingOf, companyOf, contactOf, faqOf, flowOf, heroOf, menuOf,
  newsOf, servicesOf, staffOf, strengthsOf, voicesOf, worksOf,
} from "@/components/sections/data";
import {
  HISTORY_SOURCE, ITEM_SOURCE, STATS_SOURCE,
} from "@/lib/editor/field-target";
import { TEMPLATE_IDS, normalizeSectionType, toTemplateFamily } from "@/lib/templates/catalog";

import beacon from "@/app/portfolio-templates/beacon/site.config.json";
import clarity from "@/app/portfolio-templates/clarity/site.config.json";
import cleanArch from "@/app/portfolio-templates/clean-arch/site.config.json";
import credence from "@/app/portfolio-templates/credence/site.config.json";
import forge from "@/app/portfolio-templates/forge/site.config.json";
import marche from "@/app/portfolio-templates/marche/site.config.json";
import saveur from "@/app/portfolio-templates/saveur/site.config.json";
import trustNavy from "@/app/portfolio-templates/trust-navy/site.config.json";
import velvet from "@/app/portfolio-templates/velvet/site.config.json";
import warmCraft from "@/app/portfolio-templates/warm-craft/site.config.json";

/** 10業種のデモ。JSON なので型は当てはめて読む（正は site-config-schema） */
const DEMOS: Record<string, SiteConfig> = {
  "warm-craft": warmCraft as unknown as SiteConfig,
  "trust-navy": trustNavy as unknown as SiteConfig,
  "clean-arch": cleanArch as unknown as SiteConfig,
  saveur: saveur as unknown as SiteConfig,
  velvet: velvet as unknown as SiteConfig,
  clarity: clarity as unknown as SiteConfig,
  credence: credence as unknown as SiteConfig,
  beacon: beacon as unknown as SiteConfig,
  forge: forge as unknown as SiteConfig,
  marche: marche as unknown as SiteConfig,
};

/**
 * 手本から必ず外すもの（そのお客さんの事実に置き換わるところ）。
 * 表の行・曜日の時間表・地図は config.company から組み立てられる。
 */
const DROP_KEYS = new Set(["rows", "hoursTable", "mapEmbedUrl"]);

/**
 * テンプレートに付いてくる写真の道。
 * 手本から借りた写真の道はここで外す。写真を当てるのは data.ts の仕事で、
 * そのお客さんのテンプレート（templateId）の写真が当たるようにするため
 * （他の業種の写真の道を書き込んでしまうと、そちらが勝ってしまう）。
 */
const TEMPLATE_PHOTO = /^\/images\/templates\/[^/]+\//;

/* ═══════════════════════════════════════
   既定（data.ts）から機能ごとのデータを作る
   ═══════════════════════════════════════ */

/**
 * data.ts の取り出しを、そのまま部品に渡せる形（*Data）に戻す。
 * 見出しの言葉の正は data.ts なので、ここでは名前を付け替えるだけにする。
 */
function fromDefaults(type: string, demo: SiteConfig): Record<string, unknown> {
  switch (type) {
    case "hero": {
      const r = heroOf(demo);
      return {
        eyebrow: r.eyebrow, title: r.title, lead: r.lead, image: r.image,
        facts: r.facts, primaryCta: r.primary, secondaryCta: r.secondary,
      };
    }
    case "strengths": {
      const r = strengthsOf(demo);
      return { eyebrow: r.eyebrow, heading: r.heading, lead: r.lead, items: r.items };
    }
    case "services": {
      const r = servicesOf(demo);
      return { eyebrow: r.eyebrow, heading: r.heading, lead: r.lead, items: r.items };
    }
    case "works": {
      const r = worksOf(demo);
      return { eyebrow: r.eyebrow, heading: r.heading, lead: r.lead, items: r.items };
    }
    case "menu": {
      const r = menuOf(demo);
      return { eyebrow: r.eyebrow, heading: r.heading, lead: r.lead, note: r.note, items: r.items };
    }
    case "staff": {
      const r = staffOf(demo);
      return { eyebrow: r.eyebrow, heading: r.heading, lead: r.lead, items: r.items };
    }
    case "voices": {
      const r = voicesOf(demo);
      return { eyebrow: r.eyebrow, heading: r.heading, lead: r.lead, items: r.items, stats: r.stats };
    }
    case "flow": {
      const r = flowOf(demo);
      return { eyebrow: r.eyebrow, heading: r.heading, lead: r.lead, note: r.note, items: r.items };
    }
    case "faq": {
      const r = faqOf(demo);
      return { eyebrow: r.eyebrow, heading: r.heading, lead: r.lead, note: r.note, items: r.items };
    }
    case "news": {
      const r = newsOf(demo);
      return { eyebrow: r.eyebrow, heading: r.heading, lead: r.lead, items: r.items };
    }
    case "access": {
      const r = accessOf(demo);
      return { eyebrow: r.eyebrow, heading: r.heading, lead: r.lead, note: r.note, image: r.image, ways: r.ways };
    }
    case "booking": {
      const r = bookingOf(demo);
      return {
        eyebrow: r.eyebrow, heading: r.heading, lead: r.lead, note: r.note, image: r.image,
        items: r.items, purposes: r.purposes,
      };
    }
    case "contact": {
      const r = contactOf(demo);
      return { eyebrow: r.eyebrow, heading: r.heading, lead: r.lead, note: r.note, purposes: r.purposes };
    }
    case "company": {
      const r = companyOf(demo);
      return {
        eyebrow: r.eyebrow, heading: r.heading, lead: r.lead, image: r.image,
        messageHeading: r.messageHeading, messageTitle: r.messageTitle, message: r.message,
        historyHeading: r.historyHeading, history: r.history,
      };
    }
    default:
      return {};
  }
}

/* ═══════════════════════════════════════
   デモから引く
   ═══════════════════════════════════════ */

/** そのデモの中の、同じ機能のセクション（見せ方が同じものを先に選ぶ） */
function demoSectionData(
  demo: SiteConfig,
  type: string,
  variant?: string,
): SectionData | undefined {
  const same = (demo.sections ?? []).filter((s) => normalizeSectionType(s.type) === type);
  if (same.length === 0) return undefined;
  const exact = variant ? same.find((s) => s.variant === variant) : undefined;
  return (exact ?? same[0]).data;
}

/** 一覧の1件から、借りものの写真の道を外す */
function itemWithoutPhoto(item: unknown): unknown {
  if (!item || typeof item !== "object" || Array.isArray(item)) return item;
  const rec = item as Record<string, unknown>;
  if (typeof rec.image !== "string" || !TEMPLATE_PHOTO.test(rec.image)) return item;
  const rest = { ...rec };
  delete rest.image;
  return rest;
}

/** 空の項目・お客さんの事実・借りものの写真を落とす */
function clean(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (DROP_KEYS.has(k)) continue;
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    if (k === "image" && typeof v === "string" && TEMPLATE_PHOTO.test(v)) continue;
    if (Array.isArray(v)) {
      if (v.length === 0) continue;
      out[k] = v.map(itemWithoutPhoto);
      continue;
    }
    out[k] = v;
  }
  return out;
}

/** その見せ方が一覧を必要とするか（必要なら、一覧のあるデモを探しに行く） */
function needsItems(type: string, variant?: string): boolean {
  if (["strengths", "services", "works", "menu", "staff", "flow", "faq", "news"].includes(type)) return true;
  if (type === "voices") return true;
  if (type === "booking") return variant === "slots-cards";
  return false;
}

/** 手本として足りているか */
function isEnough(data: Record<string, unknown>, type: string, variant?: string): boolean {
  if (needsItems(type, variant)) {
    const items = data.items;
    const stats = data.stats;
    const hasItems = Array.isArray(items) && items.length > 0;
    const hasStats = Array.isArray(stats) && stats.length > 0;
    if (type === "voices") return hasItems || hasStats;
    return hasItems;
  }
  // 一覧を持たない機能は、見出しか本文があれば形になる
  return Boolean(data.heading || data.title || data.lead);
}

/** 自分の業種を先に、そのあと他の9業種を順に見る */
function searchOrder(templateId: string | undefined | null): string[] {
  const family = toTemplateFamily(templateId);
  return [family, ...TEMPLATE_IDS.filter((id) => id !== family)];
}

/* ═══════════════════════════════════════
   本体
   ═══════════════════════════════════════ */

/**
 * 足した部品に入れる手本の中身。
 * 一覧（実績・スタッフ・お品書き…）もここに入って返る。
 */
export function sampleSectionData(
  templateId: string | undefined | null,
  type: string,
  variant?: string,
): Record<string, unknown> {
  const t = normalizeSectionType(type);

  for (const id of searchOrder(templateId)) {
    const demo = DEMOS[id];
    if (!demo) continue;
    const merged = clean({
      ...fromDefaults(t, demo),
      ...(demoSectionData(demo, t, variant) ?? {}),
    });
    if (isEnough(merged, t, variant)) return merged;
  }

  // ここまで来ることはまず無いが、最後は自分の業種の既定で必ず何か返す
  const fallback = DEMOS[toTemplateFamily(templateId)] ?? DEMOS["warm-craft"];
  return clean(fromDefaults(t, fallback));
}

/* ═══════════════════════════════════════
   置き場所を分ける
   ═══════════════════════════════════════ */

/**
 * お客さんが自分で書いている項目。
 * ここに中身があるときは、手本を入れない（部品はもともと会社情報から拾って出すので、
 * その人の言葉がそのまま出る）。空のときだけ手本を入れて、白い帯にしない。
 * 対応は field-target.ts の FIELD_SOURCE と同じ。
 */
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
  const data = { ...sampleSectionData(config.templateId, t, variant) };
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
