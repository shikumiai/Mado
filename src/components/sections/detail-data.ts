/**
 * 一覧の1件を「詳細ページに出す形」へ組み直すところ。
 *
 * works / staff / menu / news は形がばらばらなので、ここで1つの形にそろえる。
 * こうしておくと詳細ページは1本で済み、config にデータを1件足すだけで
 * 詳細ページが1枚増える（テンプレ側を触らなくてよい）。
 *
 * サーバー側からも呼ぶので、このファイルは画面の部品を持たない。
 */

import type {
  SiteConfig,
  Project,
  StaffMember,
  MenuItem,
  NewsItem,
} from "@/lib/site-config-schema";
import type { InfoRow } from "./types";

/** 詳細ページを持てる機能。ここに無い名前は 404 にする */
export const DETAIL_SECTIONS = ["works", "staff", "menu", "news"] as const;
export type DetailSectionName = (typeof DETAIL_SECTIONS)[number];

export function isDetailSection(value: string): value is DetailSectionName {
  return (DETAIL_SECTIONS as readonly string[]).includes(value);
}

/** 前後の1件（詳細ページの下に出す） */
export interface DetailNeighbor {
  key: string;
  title: string;
}

/** 詳細ページに出すもの */
export interface DetailItem {
  section: DetailSectionName;
  index: number;
  key: string;
  /** 見出し */
  title: string;
  /** 見出しの上に出す小さな文字（分類・日付） */
  eyebrow?: string;
  /** 見出しの下（役職・値段・年） */
  subtitle?: string;
  image?: string;
  /** 本文。改行は \n\n で段落になる */
  body: string;
  /** 仕様・条件の表 */
  rows: InfoRow[];
  /** 資格・得意分野などの短い語 */
  tags: string[];
  /** 本文の下に足す小見出し付きの文章 */
  blocks: { heading: string; text: string }[];
  /** 一覧へ戻る */
  backLabel: string;
  prev?: DetailNeighbor;
  next?: DetailNeighbor;
}

/* ═══════════════════════════════════════
   小さな道具
   ═══════════════════════════════════════ */

function s(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

function rowsOf(pairs: [string, string | undefined][]): InfoRow[] {
  return pairs
    .filter((pair): pair is [string, string] => Boolean(pair[1] && String(pair[1]).trim()))
    .map(([label, value]) => ({ label, value }));
}

function blocksOf(pairs: [string, string | undefined][]): { heading: string; text: string }[] {
  return pairs
    .filter((pair): pair is [string, string] => Boolean(pair[1] && String(pair[1]).trim()))
    .map(([heading, text]) => ({ heading, text }));
}

/** 一覧の1件を指す文字列。slug → id → 並び順 の順で決める */
export function keyOf(item: { slug?: string; id?: number | string }, index: number): string {
  const key = item.slug ?? item.id;
  return String(key !== undefined && key !== "" ? key : index + 1);
}

/** その機能の一覧を config から取る */
export function listOf(config: SiteConfig, section: DetailSectionName): unknown[] {
  switch (section) {
    case "works": return config.projects ?? [];
    case "staff": return config.staff ?? [];
    case "menu": return config.menu ?? [];
    case "news": return config.news ?? [];
  }
}

/** URL の id からその1件を探す（slug・id・並び順のどれでも当たる） */
function indexOfKey(items: { slug?: string; id?: number | string }[], id: string): number {
  const want = decodeURIComponent(id).trim().toLowerCase();
  if (!want) return -1;
  const bySlug = items.findIndex((it) => (it.slug ?? "").toLowerCase() === want);
  if (bySlug >= 0) return bySlug;
  const byId = items.findIndex((it) => String(it.id ?? "") === want);
  if (byId >= 0) return byId;
  const n = Number(want);
  if (Number.isInteger(n) && n >= 1 && n <= items.length) return n - 1;
  return -1;
}

function neighbor(
  items: { slug?: string; id?: number | string }[],
  titles: (it: unknown) => string,
  index: number,
): { prev?: DetailNeighbor; next?: DetailNeighbor } {
  const at = (i: number): DetailNeighbor | undefined =>
    i >= 0 && i < items.length ? { key: keyOf(items[i], i), title: titles(items[i]) } : undefined;
  return { prev: at(index - 1), next: at(index + 1) };
}

/* ═══════════════════════════════════════
   引き当て
   ═══════════════════════════════════════ */

/** 見つからなければ null（呼び出し側は notFound()） */
export function findDetailItem(
  config: SiteConfig,
  section: DetailSectionName,
  id: string,
): DetailItem | null {
  if (section === "works") {
    const items = (config.projects ?? []) as Project[];
    const i = indexOfKey(items, id);
    if (i < 0) return null;
    const w = items[i];
    return {
      section, index: i, key: keyOf(w, i),
      title: w.title,
      eyebrow: s(w.category),
      subtitle: s(w.titleEn) ?? s(w.year),
      image: s(w.image),
      body: w.description ?? "",
      rows: rowsOf([
        ["分類", w.category],
        ["竣工", w.year],
        ["仕様", w.specs],
        ["お施主様", w.client],
        ["場所", w.location],
        ["使用機材", w.equipment],
      ]),
      tags: [],
      blocks: blocksOf([
        ["考えたこと", w.concept],
        ["before", w.beforeDesc],
        ["after", w.afterDesc],
        ["お客様の声", w.clientComment],
      ]),
      backLabel: "実績一覧へ戻る",
      ...neighbor(items, (it) => (it as Project).title, i),
    };
  }

  if (section === "staff") {
    const items = (config.staff ?? []) as StaffMember[];
    const i = indexOfKey(items, id);
    if (i < 0) return null;
    const m = items[i];
    return {
      section, index: i, key: keyOf(m, i),
      title: m.name,
      eyebrow: s(m.role),
      subtitle: s(m.experience),
      image: s(m.image),
      body: m.bio ?? "",
      rows: rowsOf([
        ["担当", m.role],
        ["得意なこと", m.specialty],
        ["経歴", m.experience],
        ["出勤日", m.schedule],
      ]),
      tags: m.qualifications ?? [],
      blocks: blocksOf([["考え方", m.philosophy]]),
      backLabel: "スタッフ一覧へ戻る",
      ...neighbor(items, (it) => (it as StaffMember).name, i),
    };
  }

  if (section === "menu") {
    const items = (config.menu ?? []) as MenuItem[];
    const i = indexOfKey(items, id);
    if (i < 0) return null;
    const m = items[i];
    return {
      section, index: i, key: keyOf(m, i),
      title: m.name,
      eyebrow: s(m.category),
      subtitle: s(m.price),
      image: s(m.image),
      body: m.description ?? "",
      rows: rowsOf([
        ["分類", m.category],
        ["料金", m.price],
        ["おすすめ", m.isRecommended ? "おすすめの品です" : undefined],
      ]),
      tags: [],
      blocks: [],
      backLabel: "メニュー一覧へ戻る",
      ...neighbor(items, (it) => (it as MenuItem).name, i),
    };
  }

  const items = (config.news ?? []) as NewsItem[];
  const i = indexOfKey(items, id);
  if (i < 0) return null;
  const n = items[i];
  return {
    section, index: i, key: keyOf(n, i),
    title: n.title,
    eyebrow: s(n.category),
    subtitle: s(n.date),
    image: s(n.image),
    body: s(n.body) ?? s(n.excerpt) ?? "",
    rows: rowsOf([
      ["掲載日", n.date],
      ["分類", n.category],
    ]),
    tags: [],
    blocks: [],
    backLabel: "お知らせ一覧へ戻る",
    ...neighbor(items, (it) => (it as NewsItem).title, i),
  };
}

/** その機能を config に持っているか（詳細ページのビルド対象を決めるのに使う） */
export function detailKeys(config: SiteConfig, section: DetailSectionName): string[] {
  const items = listOf(config, section) as { slug?: string; id?: number | string }[];
  return items.map((it, i) => keyOf(it, i));
}
