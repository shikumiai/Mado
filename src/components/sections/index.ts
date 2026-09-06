/**
 * 機能（セクション）部品のカタログ。
 *
 * Renderer はここから「機能の種類（type）」と「見せ方（variant）」で部品を1つ受け取り、
 * その部品を描くだけでよい。部品を足しても Renderer 側は変えなくて済む。
 *
 * 知らない見せ方を渡されたら、その機能の既定の見せ方に落とす（古い config でも必ず描ける）。
 *
 * 第2段a の対象は前半7機能。残り7機能（flow / faq / news / access / booking / contact / company）は
 * 第2段b でここに足す。
 */

import type { SectionComponent } from "./types";

import HeroStatement from "./hero/statement";
import HeroSplit from "./hero/split";
import HeroFull from "./hero/full";
import HeroWindow from "./hero/window";
import HeroQuiet from "./hero/quiet";

import StrengthsNumbered from "./strengths/numbered";
import StrengthsCards from "./strengths/cards";
import StrengthsEditorial from "./strengths/editorial";
import StrengthsBands from "./strengths/bands";
import StrengthsMinimal from "./strengths/minimal";

import ServicesGrid from "./services/grid";
import ServicesEditorial from "./services/editorial";
import ServicesList from "./services/list";
import ServicesTabs from "./services/tabs";
import ServicesQuiet from "./services/quiet";

import WorksGrid from "./works/grid";
import WorksMasonry from "./works/masonry";
import WorksFeatureList from "./works/feature-list";
import WorksShowcase from "./works/showcase";
import WorksQuiet from "./works/quiet";

import MenuPhotoCards from "./menu/photo-cards";
import MenuPriceTable from "./menu/price-table";
import MenuTabs from "./menu/tabs";
import MenuSignboard from "./menu/signboard";
import MenuQuietTable from "./menu/quiet-table";

import StaffGrid from "./staff/grid";
import StaffLeadMessage from "./staff/lead-message";
import StaffList from "./staff/list";
import StaffEditorial from "./staff/editorial";
import StaffQuiet from "./staff/quiet";

import VoicesBubbles from "./voices/bubbles";
import VoicesStatsBand from "./voices/stats-band";
import VoicesQuotesList from "./voices/quotes-list";
import VoicesFeature from "./voices/feature";
import VoicesQuiet from "./voices/quiet";

/* ═══════════════════════════════════════
   カタログ
   ═══════════════════════════════════════ */

/** 見せ方1つ */
export interface SectionVariantEntry {
  /** config に書く見せ方の名前 */
  id: string;
  /** 画面に出す名前（平易な日本語） */
  label: string;
  /** どんなときに選ぶか */
  note: string;
  Component: SectionComponent;
}

/** 機能1つ */
export interface SectionTypeEntry {
  /** config に書く機能の名前 */
  type: string;
  /** 画面に出す名前 */
  label: string;
  /** その機能の役割 */
  role: string;
  /** 何も指定が無いときの見せ方 */
  defaultVariant: string;
  variants: SectionVariantEntry[];
}

export const SECTION_CATALOG: SectionTypeEntry[] = [
  {
    type: "hero",
    label: "メインビジュアル",
    role: "いちばん言いたいこと・行動のきっかけ・1枚の絵",
    defaultVariant: "split",
    variants: [
      { id: "statement", label: "主張1枚", note: "言葉を大きく1つ。絵は下に1枚だけ", Component: HeroStatement },
      { id: "split", label: "分割", note: "文を左、絵を右。いちばん外れが無い", Component: HeroSplit },
      { id: "full", label: "全面", note: "絵が画面いっぱい。その上に文を置く", Component: HeroFull },
      { id: "window", label: "窓", note: "窓枠の中に実物が見える。Mado らしい1枚", Component: HeroWindow },
      { id: "quiet", label: "静寂", note: "文字と余白だけ。設計・写真・工芸に", Component: HeroQuiet },
    ],
  },
  {
    type: "strengths",
    label: "選ばれる理由",
    role: "他ではなくここに頼む理由",
    defaultVariant: "cards",
    variants: [
      { id: "numbered", label: "番号列", note: "1・2・3と数えて読ませる", Component: StrengthsNumbered },
      { id: "cards", label: "カード", note: "面で見せる。先頭だけ大きく", Component: StrengthsCards },
      { id: "editorial", label: "誌面", note: "1つを大きく、残りを小さく積む", Component: StrengthsEditorial },
      { id: "bands", label: "帯", note: "画面いっぱいの帯を1行ずつ", Component: StrengthsBands },
      { id: "minimal", label: "アイコン最小", note: "塗りも影も使わない静かな並び", Component: StrengthsMinimal },
    ],
  },
  {
    type: "services",
    label: "事業・サービス",
    role: "何をやっているか（診療内容・取扱分野）",
    defaultVariant: "grid",
    variants: [
      { id: "grid", label: "整列カード", note: "面で並べる。先頭だけ横長の主役", Component: ServicesGrid },
      { id: "editorial", label: "誌面", note: "目次のあとに1件ずつ記事として", Component: ServicesEditorial },
      { id: "list", label: "一覧行", note: "1行1件。数が多いときに", Component: ServicesList },
      { id: "tabs", label: "タブ分類", note: "選んだ1件だけ詳しく出す", Component: ServicesTabs },
      { id: "quiet", label: "静寂リスト", note: "名前と一言だけ", Component: ServicesQuiet },
    ],
  },
  {
    type: "works",
    label: "実績・作品",
    role: "施工事例・制作物・解決事例",
    defaultVariant: "grid",
    variants: [
      { id: "grid", label: "整列グリッド", note: "数を見せる。先頭だけ大きく", Component: WorksGrid },
      { id: "masonry", label: "メイソンリー誌面", note: "縦横の違う写真をそのまま積む", Component: WorksMasonry },
      { id: "feature-list", label: "大画像＋一覧", note: "1件を大きく、他も同時に見える", Component: WorksFeatureList },
      { id: "showcase", label: "横送り", note: "大きいまま横に送る。写真が強い商売に", Component: WorksShowcase },
      { id: "quiet", label: "静寂", note: "1点ずつ、間をあけて", Component: WorksQuiet },
    ],
  },
  {
    type: "menu",
    label: "メニュー・料金",
    role: "品書き・商品・コース・料金表",
    defaultVariant: "photo-cards",
    variants: [
      { id: "photo-cards", label: "写真カード", note: "見て選んでもらう", Component: MenuPhotoCards },
      { id: "price-table", label: "価格表", note: "分類ごとに名前と値段を行で", Component: MenuPriceTable },
      { id: "tabs", label: "タブ分類", note: "分類を選んで、その中だけ見る", Component: MenuTabs },
      { id: "signboard", label: "一枚看板", note: "主役を1つだけ大きく", Component: MenuSignboard },
      { id: "quiet-table", label: "静寂の表", note: "罫と余白だけの品書き", Component: MenuQuietTable },
    ],
  },
  {
    type: "staff",
    label: "スタッフ・代表",
    role: "医師・講師・トレーナー・代表の紹介",
    defaultVariant: "grid",
    variants: [
      { id: "grid", label: "顔写真グリッド", note: "顔で選んでもらう。先頭だけ大きく", Component: StaffGrid },
      { id: "lead-message", label: "代表1人＋メッセージ", note: "挨拶で人柄を伝える", Component: StaffLeadMessage },
      { id: "list", label: "一覧行", note: "人数が多いとき。出勤も並べる", Component: StaffList },
      { id: "editorial", label: "誌面", note: "大きい1人と小さい何人か", Component: StaffEditorial },
      { id: "quiet", label: "静寂", note: "名前と一言だけ。顔写真を出さない", Component: StaffQuiet },
    ],
  },
  {
    type: "voices",
    label: "お客様の声・実績数値",
    role: "第三者の言葉と数字で信じてもらう",
    defaultVariant: "bubbles",
    variants: [
      { id: "bubbles", label: "吹き出しカード", note: "話し言葉として見せる", Component: VoicesBubbles },
      { id: "stats-band", label: "数字の帯", note: "件数・年数で言い切る", Component: VoicesStatsBand },
      { id: "quotes-list", label: "一覧引用", note: "声が多いときに上から読ませる", Component: VoicesQuotesList },
      { id: "feature", label: "主役1件＋小", note: "長い体験談が1本あるとき", Component: VoicesFeature },
      { id: "quiet", label: "静寂", note: "1文ずつ、間をあけて", Component: VoicesQuiet },
    ],
  },
];

/* ═══════════════════════════════════════
   引き当て
   ═══════════════════════════════════════ */

const BY_TYPE = new Map(SECTION_CATALOG.map((t) => [t.type, t]));

/** その機能の既定の見せ方 */
export function defaultVariantOf(type: string): string | null {
  return BY_TYPE.get(type)?.defaultVariant ?? null;
}

/** その機能が部品として用意されているか */
export function hasSection(type: string): boolean {
  return BY_TYPE.has(type);
}

/** 機能の一覧（見せ方の名前つき）。エディタの選択肢に使う */
export function listSectionTypes(): SectionTypeEntry[] {
  return SECTION_CATALOG;
}

/**
 * 部品を1つ取り出す。
 * 見せ方の指定が無い・知らない名前のときは、その機能の既定に落とす。
 * 機能そのものが未対応なら null（呼び出し側は何も描かない）。
 */
export function getSection(type: string, variant?: string | null): SectionComponent | null {
  const entry = BY_TYPE.get(type);
  if (!entry) return null;
  const found = variant ? entry.variants.find((v) => v.id === variant) : undefined;
  if (found) return found.Component;
  const fallback = entry.variants.find((v) => v.id === entry.defaultVariant);
  return fallback ? fallback.Component : entry.variants[0].Component;
}

/** 見せ方の説明（画面に出す名前と使いどころ） */
export function getVariantInfo(type: string, variant: string): SectionVariantEntry | null {
  return BY_TYPE.get(type)?.variants.find((v) => v.id === variant) ?? null;
}

export type { SectionComponent };
