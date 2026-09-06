/**
 * 10業種テンプレートの定義（構成の正）。
 *
 * サイトは「機能（セクション）」の組み合わせでできている。
 * どの業種に、どの機能を、どの見せ方で、どの順番で並べるか。それをここ1か所に書く。
 * 描くのは src/components/template-renderers/SectionsRenderer.tsx が1本で受け持つので、
 * 業種を足すときに書くのはこのファイルだけになる。
 *
 * 並びの考え方は「興味 → 信頼 → 行動」。
 *   興味 … メインビジュアル・何をやっているか・実物（実績/メニュー/作品）
 *   信頼 … 選ばれる理由・人・お客様の声・流れ・よくある質問・会社概要
 *   行動 … 予約・アクセス・お問い合わせ
 *
 * required（必須）は、その業種のサイトでこれが無いと商売として成り立たない機能。
 * plan は「このプラン以上で表示する」という意味。おためしは要点だけ、
 * おまかせで信頼づくりが増え、おまかせプロで予約・採用まで載る。
 *
 * 色は palettePreset が初期値。お客さんが色を選べば site.config.json の style.brand が勝つ。
 */

import type { Section, SectionType } from "@/lib/site-config-schema";
import { normalizePlanId, type Plan } from "@/lib/stripe";
import { TEMPLATE_BRAND_PRESETS } from "@/lib/palette";

/* ═══════════════════════════════════════
   型
   ═══════════════════════════════════════ */

export type PlanId = Plan;

/** テンプレートに並ぶ機能1つ */
export interface TemplateSectionDef {
  /** 機能の種類（部品カタログの type） */
  type: SectionType;
  /** 見せ方（部品カタログの variant） */
  variant: string;
  /** 画面・エディタに出す名前 */
  label: string;
  /** ページ内リンクの飛び先（#works など）。テンプレートの中で重複させない */
  id: string;
  /** この業種では欠かせない機能（設計書の★） */
  required?: boolean;
  /** このプラン以上で表示する。未指定はどのプランでも表示 */
  plan?: PlanId;
}

/** 色の初期値（代表＋サブ2） */
export interface TemplatePalettePreset {
  primary: string;
  sub1: string;
  sub2: string;
}

/** 業種テンプレート1つ */
export interface TemplateDef {
  /** config の templateId（-mid / -pro を外した系統名） */
  id: string;
  /** 画面に出す名前 */
  name: string;
  /** 何屋のためのテンプレートか */
  industry: string;
  /** 一言でどんなサイトになるか */
  tagline: string;
  palettePreset: TemplatePalettePreset;
  sections: TemplateSectionDef[];
}

/* ═══════════════════════════════════════
   プランの上下
   ═══════════════════════════════════════ */

const PLAN_RANK: Record<PlanId, number> = {
  otameshi: 0,
  omakase: 1,
  "omakase-pro": 2,
};

/** 旧IDも受け取れるプランの並び順（大きいほど上位） */
export function planRank(plan: string | undefined | null): number {
  return PLAN_RANK[normalizePlanId(plan || "otameshi")];
}

/** そのプランで、この機能を表示してよいか */
export function planAllows(plan: string | undefined | null, needs?: PlanId): boolean {
  if (!needs) return true;
  return planRank(plan) >= PLAN_RANK[needs];
}

/* ═══════════════════════════════════════
   初期色（正は src/lib/palette.ts）
   ═══════════════════════════════════════ */

/** テンプレートの初期色を palette.ts から引く（色の表は1か所に置く） */
function preset(id: string): TemplatePalettePreset {
  const b = TEMPLATE_BRAND_PRESETS[id] ?? TEMPLATE_BRAND_PRESETS["warm-craft"];
  return { primary: b.primary, sub1: b.sub1 ?? b.primary, sub2: b.sub2 ?? b.primary };
}

/* ═══════════════════════════════════════
   10業種
   ═══════════════════════════════════════ */

export const TEMPLATES: TemplateDef[] = [
  /* ─── 1 工務店・リフォーム ─── */
  {
    id: "warm-craft",
    name: "Warm Craft",
    industry: "工務店・リフォーム",
    tagline: "建てた家と、建てた人の顔で選んでもらう",
    palettePreset: preset("warm-craft"),
    sections: [
      { type: "hero", variant: "split", label: "メインビジュアル", id: "home" },
      { type: "strengths", variant: "cards", label: "選ばれる理由", id: "strengths" },
      { type: "works", variant: "grid", label: "施工実績", id: "works", required: true },
      { type: "flow", variant: "vertical-timeline", label: "家づくりの流れ", id: "flow", plan: "omakase" },
      { type: "voices", variant: "bubbles", label: "お客様の声", id: "voices", plan: "omakase" },
      { type: "staff", variant: "lead-message", label: "代表あいさつ", id: "message", plan: "omakase" },
      { type: "booking", variant: "slots-cards", label: "完成見学会", id: "booking", plan: "omakase-pro" },
      { type: "access", variant: "map-table", label: "工房・アクセス", id: "access" },
      { type: "contact", variant: "form-info", label: "お問い合わせ", id: "contact" },
      { type: "company", variant: "table-only", label: "会社概要", id: "company" },
    ],
  },

  /* ─── 2 建設会社 ─── */
  {
    id: "trust-navy",
    name: "Trust Navy",
    industry: "建設会社",
    tagline: "規模と実績を、数字と会社の姿で示す",
    palettePreset: preset("trust-navy"),
    sections: [
      { type: "hero", variant: "full", label: "メインビジュアル", id: "home" },
      { type: "services", variant: "grid", label: "事業内容", id: "services", required: true },
      { type: "works", variant: "grid", label: "施工実績", id: "works", required: true },
      { type: "voices", variant: "stats-band", label: "実績と評価", id: "results" },
      { type: "company", variant: "table-message-history", label: "会社概要", id: "company", required: true },
      { type: "news", variant: "list-rows", label: "お知らせ", id: "news", plan: "omakase" },
      { type: "staff", variant: "list", label: "社員紹介・採用", id: "recruit", plan: "omakase-pro" },
      { type: "access", variant: "map-table", label: "アクセス", id: "access" },
      { type: "contact", variant: "form-info", label: "お問い合わせ", id: "contact" },
    ],
  },

  /* ─── 3 設計事務所 ─── */
  {
    id: "clean-arch",
    name: "Clean Arch",
    industry: "設計事務所",
    tagline: "作品と考え方だけで、余白のまま見せる",
    palettePreset: preset("clean-arch"),
    sections: [
      { type: "hero", variant: "quiet", label: "メインビジュアル", id: "home" },
      { type: "works", variant: "quiet", label: "作品", id: "works", required: true },
      { type: "staff", variant: "lead-message", label: "設計者について", id: "message" },
      { type: "flow", variant: "quiet-line", label: "設計の流れ", id: "flow", plan: "omakase" },
      { type: "voices", variant: "quotes-list", label: "受賞と評価", id: "awards", plan: "omakase" },
      { type: "news", variant: "quiet", label: "お知らせ", id: "news", plan: "omakase" },
      { type: "contact", variant: "form-info", label: "お問い合わせ", id: "contact" },
    ],
  },

  /* ─── 4 飲食店 ─── */
  {
    id: "saveur",
    name: "Saveur",
    industry: "飲食店",
    tagline: "品書きと店の空気で、今夜の一軒に選ばれる",
    palettePreset: preset("saveur"),
    sections: [
      { type: "hero", variant: "full", label: "メインビジュアル", id: "home" },
      { type: "menu", variant: "tabs", label: "お品書き", id: "menu", required: true },
      { type: "strengths", variant: "bands", label: "こだわり", id: "strengths" },
      { type: "works", variant: "masonry", label: "店内と料理", id: "gallery", plan: "omakase" },
      { type: "staff", variant: "editorial", label: "料理人", id: "staff", plan: "omakase" },
      { type: "access", variant: "map-table", label: "営業時間・アクセス", id: "access", required: true },
      { type: "booking", variant: "form", label: "ご予約", id: "booking", plan: "omakase-pro" },
      { type: "news", variant: "cards", label: "お知らせ", id: "news", plan: "omakase" },
      { type: "contact", variant: "band", label: "お問い合わせ", id: "contact" },
    ],
  },

  /* ─── 5 美容・サロン ─── */
  {
    id: "velvet",
    name: "Velvet",
    industry: "美容・サロン",
    tagline: "料金と担当者が先に分かるから、初めてでも入れる",
    palettePreset: preset("velvet"),
    sections: [
      { type: "hero", variant: "statement", label: "メインビジュアル", id: "home" },
      { type: "menu", variant: "price-table", label: "メニュー・料金", id: "menu", required: true },
      { type: "works", variant: "showcase", label: "スタイル", id: "styles", required: true },
      { type: "staff", variant: "grid", label: "スタッフ", id: "staff", required: true },
      { type: "voices", variant: "bubbles", label: "お客様の声", id: "voices", plan: "omakase" },
      { type: "booking", variant: "cta-band", label: "ご予約", id: "booking", required: true },
      { type: "access", variant: "map-table", label: "アクセス", id: "access", required: true },
      { type: "faq", variant: "accordion", label: "よくある質問", id: "faq", plan: "omakase" },
      { type: "contact", variant: "form-info", label: "お問い合わせ", id: "contact" },
    ],
  },

  /* ─── 6 医療・クリニック ─── */
  {
    id: "clarity",
    name: "Clarity",
    industry: "医療・クリニック",
    tagline: "診療時間と担当医が、迷わず見つかる",
    palettePreset: preset("clarity"),
    sections: [
      { type: "hero", variant: "split", label: "メインビジュアル", id: "home" },
      { type: "services", variant: "tabs", label: "診療案内", id: "departments", required: true },
      { type: "staff", variant: "grid", label: "医師・スタッフ", id: "doctors", required: true },
      { type: "flow", variant: "horizontal-steps", label: "受診の流れ", id: "flow", plan: "omakase" },
      { type: "access", variant: "map-table", label: "診療時間・アクセス", id: "access", required: true },
      { type: "faq", variant: "two-column", label: "よくある質問", id: "faq", plan: "omakase" },
      { type: "news", variant: "list-rows", label: "お知らせ・休診", id: "news", plan: "omakase" },
      { type: "booking", variant: "cta-band", label: "受診のご予約", id: "booking", plan: "omakase-pro" },
      { type: "contact", variant: "form-info", label: "お問い合わせ", id: "contact" },
    ],
  },

  /* ─── 7 士業 ─── */
  {
    id: "credence",
    name: "Credence",
    industry: "士業（税理士・行政書士ほか）",
    tagline: "扱う分野と料金を先に出して、相談の一歩を軽くする",
    palettePreset: preset("credence"),
    sections: [
      { type: "hero", variant: "quiet", label: "メインビジュアル", id: "home" },
      { type: "services", variant: "list", label: "取扱分野", id: "services", required: true },
      { type: "works", variant: "feature-list", label: "解決事例", id: "cases", plan: "omakase" },
      { type: "staff", variant: "lead-message", label: "代表・所属", id: "message" },
      { type: "menu", variant: "quiet-table", label: "料金", id: "fees" },
      { type: "flow", variant: "numbered-cards", label: "ご相談の流れ", id: "flow", plan: "omakase" },
      { type: "faq", variant: "list", label: "よくある質問", id: "faq", plan: "omakase" },
      { type: "voices", variant: "quotes-list", label: "お客様の声", id: "voices", plan: "omakase" },
      { type: "access", variant: "table-only", label: "事務所案内", id: "access" },
      { type: "booking", variant: "cta-band", label: "初回相談のご予約", id: "booking", plan: "omakase-pro" },
      { type: "contact", variant: "form-info", label: "お問い合わせ", id: "contact" },
    ],
  },

  /* ─── 8 教育・スクール ─── */
  {
    id: "beacon",
    name: "Beacon",
    industry: "教育・スクール",
    tagline: "コースと月謝と合格実績を、そのまま並べる",
    palettePreset: preset("beacon"),
    sections: [
      { type: "hero", variant: "statement", label: "メインビジュアル", id: "home" },
      { type: "menu", variant: "price-table", label: "コース", id: "courses", required: true },
      { type: "strengths", variant: "numbered", label: "選ばれる理由", id: "strengths" },
      { type: "voices", variant: "stats-band", label: "合格実績と声", id: "results" },
      { type: "staff", variant: "editorial", label: "講師", id: "teachers", plan: "omakase" },
      { type: "flow", variant: "vertical-timeline", label: "入塾までの流れ", id: "flow", plan: "omakase" },
      { type: "menu", variant: "quiet-table", label: "料金", id: "tuition" },
      { type: "faq", variant: "category-tabs", label: "よくある質問", id: "faq", plan: "omakase" },
      { type: "access", variant: "photo-info", label: "教室案内", id: "access" },
      { type: "booking", variant: "slots-cards", label: "体験・見学", id: "trial", plan: "omakase-pro" },
      { type: "contact", variant: "form-info", label: "お問い合わせ", id: "contact" },
    ],
  },

  /* ─── 9 フィットネス ─── */
  {
    id: "forge",
    name: "Forge",
    industry: "フィットネス・ジム",
    tagline: "プログラムと担当と料金を、一度に見せて体験へ運ぶ",
    palettePreset: preset("forge"),
    sections: [
      { type: "hero", variant: "window", label: "メインビジュアル", id: "home" },
      { type: "menu", variant: "price-table", label: "プログラム", id: "programs", required: true },
      { type: "staff", variant: "grid", label: "トレーナー", id: "trainers", required: true },
      { type: "works", variant: "showcase", label: "施設", id: "facility", plan: "omakase" },
      { type: "menu", variant: "quiet-table", label: "料金プラン", id: "plans" },
      { type: "voices", variant: "feature", label: "会員の声", id: "voices", plan: "omakase" },
      { type: "flow", variant: "horizontal-steps", label: "入会の流れ", id: "flow", plan: "omakase" },
      { type: "access", variant: "photo-info", label: "アクセス", id: "access" },
      { type: "booking", variant: "photo-cta", label: "体験のお申し込み", id: "trial", plan: "omakase-pro" },
      { type: "contact", variant: "band", label: "お問い合わせ", id: "contact" },
    ],
  },

  /* ─── 10 小売・店舗 ─── */
  {
    id: "marche",
    name: "Marche",
    industry: "小売・店舗",
    tagline: "商品と入荷と地図で、今日そこへ行く理由をつくる",
    palettePreset: preset("marche"),
    sections: [
      { type: "hero", variant: "window", label: "メインビジュアル", id: "home" },
      { type: "menu", variant: "photo-cards", label: "商品", id: "items", required: true },
      { type: "strengths", variant: "minimal", label: "こだわり", id: "strengths" },
      { type: "works", variant: "masonry", label: "店内の様子", id: "gallery", plan: "omakase" },
      { type: "news", variant: "feature-plus", label: "入荷・催し", id: "news" },
      { type: "access", variant: "map-table", label: "店舗案内", id: "access", required: true },
      { type: "voices", variant: "quiet", label: "お客様の声", id: "voices", plan: "omakase" },
      { type: "contact", variant: "form-only", label: "お問い合わせ", id: "contact" },
    ],
  },
];

/* ═══════════════════════════════════════
   引き当て
   ═══════════════════════════════════════ */

/** 使えるテンプレートの id 一覧（並びは申し込み画面に出す順） */
export const TEMPLATE_IDS: string[] = TEMPLATES.map((t) => t.id);

const BY_ID = new Map(TEMPLATES.map((t) => [t.id, t]));

/** warm-craft-pro → warm-craft のように系統名へ丸める */
export function toTemplateFamily(templateId: string | undefined | null): string {
  return (templateId || "warm-craft").replace(/-(?:mid|pro)$/, "");
}

/** テンプレート定義。知らない id なら null */
export function getTemplate(templateId: string | undefined | null): TemplateDef | null {
  return BY_ID.get(toTemplateFamily(templateId)) ?? null;
}

/** テンプレート定義。知らない id でも必ず何か返す（描画側の保険） */
export function getTemplateOrDefault(templateId: string | undefined | null): TemplateDef {
  return getTemplate(templateId) ?? TEMPLATES[0];
}

/** そのテンプレートの初期色 */
export function templatePalettePreset(templateId: string | undefined | null): TemplatePalettePreset {
  return getTemplateOrDefault(templateId).palettePreset;
}

/**
 * そのテンプレート・そのプランで描くセクション一式。
 * site.config.json に sections が無いときは、これがそのままサイトの構成になる。
 */
export function defaultSectionsFor(
  templateId: string | undefined | null,
  plan?: string | null,
): Section[] {
  return getTemplateOrDefault(templateId)
    .sections.filter((s) => planAllows(plan, s.plan))
    .map((s) => ({
      type: s.type,
      variant: s.variant,
      label: s.label,
      id: s.id,
      visible: true,
    }));
}

/**
 * config に書かれた1つのセクションが、テンプレート定義のどれに当たるか。
 * アンカー（id）で先に合わせ、無ければ同じ種類の先頭を当てる。
 * プランで出し分けるとき（このセクションはおまかせ以上か）に使う。
 */
export function findSectionDef(
  templateId: string | undefined | null,
  section: { type: string; id?: string },
): TemplateSectionDef | null {
  const defs = getTemplateOrDefault(templateId).sections;
  if (section.id) {
    const byId = defs.find((d) => d.id === section.id);
    if (byId) return byId;
  }
  return defs.find((d) => d.type === section.type) ?? null;
}

/** その業種で欠かせない機能（設計書の★）の一覧 */
export function requiredSectionsOf(templateId: string | undefined | null): TemplateSectionDef[] {
  return getTemplateOrDefault(templateId).sections.filter((s) => s.required);
}

/* ═══════════════════════════════════════
   昔の種類名の読み替え
   ═══════════════════════════════════════ */

/**
 * v2 までの site.config.json はこの名前でセクションを持っている。
 * 保存されたままの config でも今の部品で描けるように、機能と見せ方へ読み替える。
 * 描画（SectionsRenderer）と編集（保存先の割り出し）の両方がここを見る。
 */
export const LEGACY_SECTIONS: Record<string, { type: SectionType; variant: string }> = {
  about: { type: "company", variant: "table-message-history" },
  stats: { type: "voices", variant: "stats-band" },
  testimonials: { type: "voices", variant: "bubbles" },
  awards: { type: "voices", variant: "quotes-list" },
  recruit: { type: "staff", variant: "list" },
  gallery: { type: "works", variant: "masonry" },
  pricing: { type: "menu", variant: "price-table" },
  info: { type: "access", variant: "map-table" },
};

/** 昔の種類名を今の機能名に直す */
export function normalizeSectionType(type: string): SectionType {
  return (LEGACY_SECTIONS[type]?.type ?? type) as SectionType;
}
