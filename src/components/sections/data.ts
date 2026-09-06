/**
 * セクションのデータを整えるところ。
 *
 * 部品には data を直接渡せるが、渡さなかった場合は今までの config
 * （config.projects / config.strengths …）から拾う。だから古い site.config.json でも
 * そのまま描ける。見出しも、指定が無ければ機能ごとの当たり前の言葉を入れる。
 */

import type {
  SiteConfig,
  Project,
  Strength,
  Service,
  MenuItem,
  StaffMember,
  Testimonial,
  Stat,
} from "@/lib/site-config-schema";
import type { Cta, SectionData } from "./types";

/* ─── 小さな取り出し ─── */

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

function list<T>(v: unknown): T[] | undefined {
  return Array.isArray(v) && v.length > 0 ? (v as T[]) : undefined;
}

function cta(v: unknown): Cta | undefined {
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  const o = v as Record<string, unknown>;
  const label = str(o.label);
  const href = str(o.href);
  return label ? { label, href: href || "#contact" } : undefined;
}

/* ─── 1 hero ─── */

export function heroOf(config: SiteConfig, data?: SectionData) {
  const c = config.company;
  return {
    company: c,
    badge: str(data?.badge) ?? (c.since ? `創業 ${c.since}年` : undefined),
    eyebrow: str(data?.eyebrow) ?? c.nameEn,
    title: str(data?.title) ?? c.tagline ?? c.name,
    lead: str(data?.lead) ?? c.description,
    image: str(data?.image),
    primary: cta(data?.primaryCta) ?? { label: "相談してみる", href: "#contact" },
    secondary: cta(data?.secondaryCta) ?? { label: "私たちについて", href: "#about" },
    facts: list<string>(data?.facts) ?? [],
  };
}

/* ─── 2 strengths ─── */

export function strengthsOf(config: SiteConfig, data?: SectionData) {
  return {
    eyebrow: str(data?.eyebrow) ?? "OUR STRENGTHS",
    heading: str(data?.heading) ?? "選ばれる理由",
    lead: str(data?.lead),
    items: list<Strength>(data?.items) ?? config.strengths ?? [],
  };
}

/* ─── 3 services ─── */

export function servicesOf(config: SiteConfig, data?: SectionData) {
  return {
    eyebrow: str(data?.eyebrow) ?? "SERVICE",
    heading: str(data?.heading) ?? "事業内容",
    lead: str(data?.lead),
    items: list<Service>(data?.items) ?? config.services ?? [],
  };
}

/* ─── 4 works ─── */

export function worksOf(config: SiteConfig, data?: SectionData) {
  return {
    eyebrow: str(data?.eyebrow) ?? "WORKS",
    heading: str(data?.heading) ?? "施工実績",
    lead: str(data?.lead),
    items: list<Project>(data?.items) ?? config.projects ?? [],
  };
}

/* ─── 5 menu ─── */

export function menuOf(config: SiteConfig, data?: SectionData) {
  return {
    eyebrow: str(data?.eyebrow) ?? "MENU",
    heading: str(data?.heading) ?? "メニュー",
    lead: str(data?.lead),
    note: str(data?.note),
    items: list<MenuItem>(data?.items) ?? config.menu ?? [],
  };
}

/** メニューを category ごとにまとめる（順番は出てきた順） */
export function groupByCategory(items: MenuItem[]): { name: string; items: MenuItem[] }[] {
  const out: { name: string; items: MenuItem[] }[] = [];
  for (const it of items) {
    const name = it.category || "おすすめ";
    const found = out.find((g) => g.name === name);
    if (found) found.items.push(it);
    else out.push({ name, items: [it] });
  }
  return out;
}

/* ─── 6 staff ─── */

export function staffOf(config: SiteConfig, data?: SectionData) {
  return {
    eyebrow: str(data?.eyebrow) ?? "STAFF",
    heading: str(data?.heading) ?? "スタッフ紹介",
    lead: str(data?.lead),
    items: list<StaffMember>(data?.items) ?? config.staff ?? [],
  };
}

/* ─── 7 voices ─── */

export function voicesOf(config: SiteConfig, data?: SectionData) {
  return {
    eyebrow: str(data?.eyebrow) ?? "VOICE",
    heading: str(data?.heading) ?? "お客様の声",
    lead: str(data?.lead),
    items: list<Testimonial>(data?.items) ?? config.testimonials ?? [],
    stats: list<Stat>(data?.stats) ?? config.stats ?? [],
  };
}
