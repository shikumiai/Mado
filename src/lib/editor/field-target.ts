/**
 * 編集した項目を、設定のどこに書くか決めるところ。
 *
 * 部品は「自分が何番目のセクションか」までしか知らないので、
 * クリックした項目の名前は sections.2.items.0.title のようになる。
 * けれど一覧の中身（実績・スタッフ・お品書き・お知らせ…）が本当に置いてあるのは
 * config の一番上（projects / staff / menu / news …）で、詳細ページもそこを読む。
 *
 * だから保存先は「読んでいる側」に合わせる。ここがその1本道。
 *   sections.2.items.0.title  →  projects.0.title
 *   sections.5.rows.1.value    →  company.phone
 *   sections.0.title           →  company.tagline
 * セクション自身が data を持っているとき（そのセクション専用の文言を入れたとき）は、
 * 読んでいる側が data なので、そのまま sections.2.data.… に書く。
 *
 * 二重管理をしないための決まりごと:
 *   「表示に使われている値の出どころ」＝「保存先」。ここ以外に写しを作らない。
 */

import type { SiteConfig } from "@/lib/site-config-schema";
import { defaultSectionsFor, normalizeSectionType } from "@/lib/templates/catalog";
import { accessOf, companyOf, contactOf } from "@/components/sections/data";
import type { InfoRow, SectionData } from "@/components/sections/types";

/* ═══════════════════════════════════════
   保存先
   ═══════════════════════════════════════ */

export interface FieldTarget {
  /** 設定の中の場所（"projects.0.title" など） */
  path: string;
  /**
   * 画面に出ていた文字から、保存する値に直す。
   * 表の行のように「組み立てて表示している」ものを元に戻すために使う。
   */
  toStored?: (value: string) => string;
}

/** 一覧の中身が本当に置いてある場所（機能 → config の一番上の配列） */
const ITEM_SOURCE: Record<string, string> = {
  works: "projects",
  staff: "staff",
  menu: "menu",
  news: "news",
  services: "services",
  strengths: "strengths",
  voices: "testimonials",
  flow: "flow",
  faq: "faq",
  booking: "bookingEvents",
};

/** voices の数字は testimonials ではなく stats に入っている */
const STATS_SOURCE = "stats";

/** 沿革（company）の置き場 */
const HISTORY_SOURCE = "history";

/**
 * 1つだけの項目の出どころ。
 * 画面には data の値が先に出るが、data が無ければ会社情報から拾って出している。
 * その場合は会社情報の方を直すのが正しい（サイト中の同じ値がまとめて直る）。
 */
const FIELD_SOURCE: Record<string, Record<string, string>> = {
  hero: {
    title: "company.tagline",
    lead: "company.description",
    name: "company.name",
  },
  company: {
    message: "company.bio",
    messageTitle: "company.tagline",
    image: "company.ceoPhoto",
  },
};

/** 表の行の見出し → 会社情報のどの項目か */
const ROW_FIELD: Record<string, string> = {
  会社名: "name",
  代表者: "ceo",
  設立: "founded",
  資本金: "capital",
  従業員数: "employees",
  所在地: "address",
  電話: "phone",
  FAX: "fax",
  メール: "email",
  営業時間: "hours",
  受付時間: "hours",
  事業内容: "business",
  許認可: "license",
  認証: "iso",
};

/* ═══════════════════════════════════════
   引き当て
   ═══════════════════════════════════════ */

interface ResolvedSection {
  type: string;
  data?: SectionData;
}

/** その番号のセクション（config に書かれていなければテンプレートの既定） */
function sectionAt(config: SiteConfig, index: number): ResolvedSection | null {
  const list =
    config.sections && config.sections.length > 0
      ? config.sections
      : defaultSectionsFor(config.templateId, config.plan);
  const s = list[index];
  if (!s) return null;
  return { type: normalizeSectionType(s.type), data: s.data };
}

/** そのセクションが自分でその配列を持っているか（持っていれば読む側も data） */
function hasOwnList(data: SectionData | undefined, key: string): boolean {
  return Array.isArray(data?.[key]) && (data[key] as unknown[]).length > 0;
}

/** 表の行（見出しと値）を、部品と同じやり方で組み立て直す */
function rowsOfSection(config: SiteConfig, type: string, data?: SectionData): InfoRow[] {
  if (type === "company") return companyOf(config, data).rows;
  if (type === "contact") return contactOf(config, data).rows;
  return accessOf(config, data).rows;
}

/**
 * クリックした項目の保存先を決める。
 * セクションに属さない項目（company.phone など）はそのまま。
 */
export function resolveFieldTarget(config: SiteConfig, fieldId: string): FieldTarget {
  const m = /^sections\.(\d+)\.(.+)$/.exec(fieldId);
  if (!m) return { path: fieldId };

  const index = Number(m[1]);
  const rest = m[2];
  const inData = `sections.${index}.data.${rest}`;

  // すでに data を指しているものは触らない
  if (rest.startsWith("data.")) return { path: fieldId };

  const section = sectionAt(config, index);
  if (!section) return { path: inData };
  const { type, data } = section;

  /* ── 一覧の中身 ── */
  const list = /^(items|stats|history)\.(\d+)\.(.+)$/.exec(rest);
  if (list) {
    const [, listName, at, field] = list;
    if (hasOwnList(data, listName)) return { path: inData };

    const source =
      listName === "stats"
        ? STATS_SOURCE
        : listName === "history"
          ? HISTORY_SOURCE
          : ITEM_SOURCE[type];

    return source ? { path: `${source}.${at}.${field}` } : { path: inData };
  }

  /* ── 表の行（会社情報から組み立てているもの） ── */
  const row = /^rows\.(\d+)\.value$/.exec(rest);
  if (row) {
    if (hasOwnList(data, "rows")) return { path: inData };
    const rows = rowsOfSection(config, type, data);
    const label = rows[Number(row[1])]?.label;
    const field = label ? ROW_FIELD[label] : undefined;
    if (!field) return { path: inData };

    // 「代表者」は肩書きを添えて表示している。保存するのは名前だけ
    if (field === "ceo") {
      const title = config.company.ceoTitle;
      return {
        path: "company.ceo",
        toStored: (v) => (title ? v.replace(new RegExp(`（${title}）\\s*$`), "").trim() : v),
      };
    }
    return { path: `company.${field}` };
  }

  /* ── 1つだけの項目 ── */
  if (!rest.includes(".")) {
    const own = data?.[rest];
    const written = typeof own === "string" && own.trim() !== "";
    const source = FIELD_SOURCE[type]?.[rest];
    if (!written && source) return { path: source };
  }

  return { path: inData };
}
