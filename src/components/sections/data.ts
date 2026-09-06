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
  FlowStep,
  FAQItem,
  NewsItem,
  BookingEvent,
  HistoryEvent,
} from "@/lib/site-config-schema";
import type { Cta, HoursTable, InfoRow, SectionData } from "./types";

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

/* ─── 8 flow ─── */

export function flowOf(config: SiteConfig, data?: SectionData) {
  return {
    eyebrow: str(data?.eyebrow) ?? "FLOW",
    heading: str(data?.heading) ?? "ご相談から完成までの流れ",
    lead: str(data?.lead),
    note: str(data?.note),
    items: list<FlowStep>(data?.items) ?? config.flow ?? [],
  };
}

/* ─── 9 faq ─── */

export function faqOf(config: SiteConfig, data?: SectionData) {
  return {
    eyebrow: str(data?.eyebrow) ?? "FAQ",
    heading: str(data?.heading) ?? "よくあるご質問",
    lead: str(data?.lead),
    note: str(data?.note),
    items: list<FAQItem>(data?.items) ?? config.faq ?? [],
  };
}

/** 質問を分類ごとにまとめる（分類が無いものは「そのほか」へ） */
export function groupFaq(items: FAQItem[]): { name: string; items: FAQItem[] }[] {
  const out: { name: string; items: FAQItem[] }[] = [];
  for (const it of items) {
    const name = it.category || "そのほか";
    const found = out.find((g) => g.name === name);
    if (found) found.items.push(it);
    else out.push({ name, items: [it] });
  }
  return out;
}

/* ─── 10 news ─── */

export function newsOf(config: SiteConfig, data?: SectionData) {
  return {
    eyebrow: str(data?.eyebrow) ?? "NEWS",
    heading: str(data?.heading) ?? "お知らせ",
    lead: str(data?.lead),
    moreCta: cta(data?.moreCta),
    items: list<NewsItem>(data?.items) ?? config.news ?? [],
  };
}

/** "2025.04.05" / "2025-04-05" / "2025年4月5日" を年・月日・曜日っぽい形に分ける */
export function splitDate(raw: string): { year: string; md: string; month: string; day: string } {
  const nums = (raw || "").match(/\d+/g) || [];
  const year = nums[0] && nums[0].length === 4 ? nums[0] : "";
  const month = year ? nums[1] ?? "" : nums[0] ?? "";
  const day = year ? nums[2] ?? "" : nums[1] ?? "";
  const md = month && day ? `${month.padStart(2, "0")}.${day.padStart(2, "0")}` : raw;
  return { year, md, month, day };
}

/** お知らせを年ごとにまとめる（新しい年が先。年が読めないものは最後に） */
export function groupNewsByYear(items: NewsItem[]): { year: string; items: NewsItem[] }[] {
  const out: { year: string; items: NewsItem[] }[] = [];
  for (const it of items) {
    const year = splitDate(it.date).year || "そのほか";
    const found = out.find((g) => g.year === year);
    if (found) found.items.push(it);
    else out.push({ year, items: [it] });
  }
  return out;
}

/* ─── 11 access ─── */

/** 表の行を組み立てる。値が空のものは落とす（空白の行を作らない） */
function rows(pairs: [string, string | undefined][]): InfoRow[] {
  return pairs
    .filter((pair): pair is [string, string] => Boolean(pair[1] && pair[1].trim()))
    .map(([label, value]) => ({ label, value }));
}

function infoRows(data?: SectionData): InfoRow[] | undefined {
  const raw = list<Partial<InfoRow>>(data?.rows);
  if (!raw) return undefined;
  return raw
    .filter((r): r is InfoRow => Boolean(str(r.label) && str(r.value)))
    .map((r) => ({ label: r.label, value: r.value }));
}

export function accessOf(config: SiteConfig, data?: SectionData) {
  const c = config.company;
  const table = data?.hoursTable as HoursTable | undefined;
  return {
    eyebrow: str(data?.eyebrow) ?? "ACCESS",
    heading: str(data?.heading) ?? "アクセス・営業時間",
    lead: str(data?.lead),
    note: str(data?.note),
    image: str(data?.image),
    mapEmbedUrl: str(data?.mapEmbedUrl) ?? c.mapEmbedUrl,
    ways: list<string>(data?.ways) ?? [],
    hoursTable:
      table && Array.isArray(table.head) && Array.isArray(table.rows) && table.rows.length > 0
        ? table
        : undefined,
    rows:
      infoRows(data) ??
      rows([
        ["所在地", c.address],
        ["電話", c.phone],
        ["FAX", c.fax],
        ["営業時間", c.hours],
        ["メール", c.email],
      ]),
  };
}

/* ─── 12 booking ─── */

export function bookingOf(config: SiteConfig, data?: SectionData) {
  const c = config.company;
  return {
    eyebrow: str(data?.eyebrow) ?? "BOOKING",
    heading: str(data?.heading) ?? "ご予約・お申し込み",
    lead: str(data?.lead) ?? "日にちが決まっていなくても構いません。まずはご希望をお聞かせください。",
    note: str(data?.note) ?? "お電話でも承ります。受付時間は " + (c.hours || "営業時間内") + " です。",
    image: str(data?.image),
    primary: cta(data?.primaryCta) ?? { label: "予約を申し込む", href: "#booking-form" },
    secondary: cta(data?.secondaryCta) ?? (c.phone ? { label: c.phone, href: `tel:${c.phone.replace(/[^\d+]/g, "")}` } : undefined),
    items: list<BookingEvent>(data?.items) ?? config.bookingEvents ?? [],
    purposes: list<string>(data?.purposes) ?? ["見学・体験", "初回のご相談", "見積もりの依頼", "そのほか"],
  };
}

/* ─── 13 contact ─── */

export function contactOf(config: SiteConfig, data?: SectionData) {
  const c = config.company;
  return {
    eyebrow: str(data?.eyebrow) ?? "CONTACT",
    heading: str(data?.heading) ?? "お問い合わせ",
    lead: str(data?.lead) ?? "小さなことでも構いません。1営業日以内にご返信します。",
    note: str(data?.note),
    purposes: list<string>(data?.purposes) ?? ["相談したい", "見積もりがほしい", "資料がほしい", "そのほか"],
    primary: cta(data?.primaryCta) ?? { label: "この内容で送る", href: "#contact-form" },
    secondary: cta(data?.secondaryCta),
    rows: rows([
      ["電話", c.phone],
      ["メール", c.email],
      ["受付時間", c.hours],
      ["所在地", c.address],
    ]),
    company: c,
  };
}

/* ─── 14 company ─── */

export function companyOf(config: SiteConfig, data?: SectionData) {
  const c = config.company;
  const business =
    c.business ||
    (config.services && config.services.length > 0
      ? config.services.map((s) => s.title).join(" / ")
      : undefined);
  return {
    eyebrow: str(data?.eyebrow) ?? "COMPANY",
    heading: str(data?.heading) ?? "会社概要",
    lead: str(data?.lead),
    image: str(data?.image) ?? c.ceoPhoto,
    messageHeading: str(data?.messageHeading) ?? "代表あいさつ",
    messageTitle: str(data?.messageTitle) ?? c.tagline,
    message: str(data?.message) ?? c.bio,
    historyHeading: str(data?.historyHeading) ?? "沿革",
    history: list<HistoryEvent>(data?.history) ?? config.history ?? [],
    company: c,
    rows:
      infoRows(data) ??
      rows([
        ["会社名", c.name],
        ["代表者", c.ceoTitle ? `${c.ceo}（${c.ceoTitle}）` : c.ceo],
        ["設立", c.founded || (c.since ? `${c.since}年` : undefined)],
        ["資本金", c.capital],
        ["従業員数", c.employees],
        ["所在地", c.address],
        ["電話", c.phone],
        ["事業内容", business],
        ["許認可", c.license],
        ["認証", c.iso],
      ]),
  };
}
