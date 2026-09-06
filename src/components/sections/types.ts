/**
 * 機能（セクション）部品の共通契約。
 *
 * サイトは「機能」の組み合わせで出来ている。機能ごとに見せ方（variant）が5つあり、
 * どの部品も同じ形の props を受け取る。だから Renderer は type と variant で部品を選ぶだけでよく、
 * 部品を足しても Renderer 側を書き換えずに済む。
 *
 * 色はここでは渡さない。TplPalette の context から取る（部品は var(--tpl-*) で塗る）。
 * SVG の絵だけは context から実際の色を受け取って塗る（fill 属性が CSS 変数を受けない環境があるため）。
 */

import type { ComponentType } from "react";
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

/** 編集できる項目の種類 */
export type FieldType = "text" | "image";

/** セクションに渡すデータ。中身は機能ごとに決まる（下の *Data 型） */
export type SectionData = Record<string, unknown>;

/** ボタン1つぶん */
export type Cta = { label: string; href: string };

/**
 * どの部品も同じ props を受け取る。
 * data は機能ごとの形（HeroData / WorksData …）。省略されたら config の同じ項目から拾う。
 */
export interface SectionProps<TData extends SectionData = SectionData> {
  /** そのセクションのデータ */
  data?: TData;
  /** サイト全体の設定。会社名・電話など、セクションをまたぐ参照に使う */
  config: SiteConfig;
  /** アンカー。ページ内リンクの飛び先になる（#works など） */
  id?: string;
  /**
   * data-field-id の前置き。エディタは "sections.2" のように並び順を渡す。
   * 中の項目は "sections.2.items.0.title" のようにつながる。
   */
  fieldPath?: string;
  /** 編集モード。項目に枠が出てクリックできるようになる */
  editMode?: boolean;
  onFieldClick?: (fieldId: string, currentValue: string, fieldType: FieldType) => void;
  /** 直近で変えた項目（印が付く） */
  changedFields?: Set<string>;
}

/** 編集連携に必要な分だけ */
export type EditProps = Pick<
  SectionProps,
  "fieldPath" | "editMode" | "onFieldClick" | "changedFields"
>;

/** レジストリに並べるときの型 */
export type SectionComponent = ComponentType<SectionProps>;

/* ═══════════════════════════════════════
   機能ごとのデータの形
   （interface でなく type にしてある。SectionData に渡せるようにするため）
   ═══════════════════════════════════════ */

/** 1 hero — 主張＋CTA＋絵 */
export type HeroData = {
  badge?: string;
  eyebrow?: string;
  title?: string;
  lead?: string;
  image?: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
  /** 窓の下・数字の帯などに出す短い事実（「創業28年」等） */
  facts?: string[];
};

/** 2 strengths — 選ばれる理由 */
export type StrengthsData = {
  eyebrow?: string;
  heading?: string;
  lead?: string;
  items?: Strength[];
};

/** 3 services — 事業・診療内容・取扱分野 */
export type ServicesData = {
  eyebrow?: string;
  heading?: string;
  lead?: string;
  items?: Service[];
};

/** 4 works — 実績・施工事例・作品 */
export type WorksData = {
  eyebrow?: string;
  heading?: string;
  lead?: string;
  items?: Project[];
};

/** 5 menu — メニュー・料金・商品・コース */
export type MenuData = {
  eyebrow?: string;
  heading?: string;
  lead?: string;
  /** 表の下に添える注記（「表示は税込です」等） */
  note?: string;
  items?: MenuItem[];
};

/** 6 staff — スタッフ・医師・講師・代表 */
export type StaffData = {
  eyebrow?: string;
  heading?: string;
  lead?: string;
  items?: StaffMember[];
};

/** 7 voices — お客様の声・実績数値 */
export type VoicesData = {
  eyebrow?: string;
  heading?: string;
  lead?: string;
  items?: Testimonial[];
  stats?: Stat[];
};

/** 表の1行（会社概要・店舗情報） */
export type InfoRow = { label: string; value: string };

/** 曜日ごとの営業・診療時間の表 */
export type HoursTable = {
  /** 見出しの行（左上の空欄を除いた曜日）。例 ["月","火","水","木","金","土","日"] */
  head: string[];
  /** 1行ぶん。cells は head と同じ数だけ並べる（"●" "／" "9:00-13:00" など） */
  rows: { label: string; cells: string[] }[];
  note?: string;
};

/** 8 flow — ご利用・相談・受診・入会の流れ */
export type FlowData = {
  eyebrow?: string;
  heading?: string;
  lead?: string;
  note?: string;
  items?: FlowStep[];
};

/** 9 faq — よくある質問 */
export type FaqData = {
  eyebrow?: string;
  heading?: string;
  lead?: string;
  note?: string;
  items?: FAQItem[];
};

/** 10 news — お知らせ・ブログ・入荷・休診案内 */
export type NewsData = {
  eyebrow?: string;
  heading?: string;
  lead?: string;
  /** 「お知らせ一覧へ」のような、まとめて見る導線 */
  moreCta?: Cta;
  items?: NewsItem[];
};

/** 11 access — アクセス・店舗情報・営業/診療時間・地図 */
export type AccessData = {
  eyebrow?: string;
  heading?: string;
  lead?: string;
  note?: string;
  /** 外観・店内の写真 */
  image?: string;
  /** 地図の埋め込みURL。無ければ設計された地図の絵を出す */
  mapEmbedUrl?: string;
  /** 住所・電話などの表。省略すると company から作る */
  rows?: InfoRow[];
  /** 曜日ごとの時間表（診療時間・営業時間） */
  hoursTable?: HoursTable;
  /** 最寄り駅・駐車場などの短い案内 */
  ways?: string[];
};

/** 12 booking — 予約・見学会・体験・相談申込 */
export type BookingData = {
  eyebrow?: string;
  heading?: string;
  lead?: string;
  note?: string;
  image?: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
  /** 日程・枠 */
  items?: BookingEvent[];
  /** 予約の種類（フォームの選択肢） */
  purposes?: string[];
};

/** 13 contact — お問い合わせフォーム＋連絡先 */
export type ContactData = {
  eyebrow?: string;
  heading?: string;
  lead?: string;
  note?: string;
  /** 相談内容の選択肢 */
  purposes?: string[];
  primaryCta?: Cta;
  secondaryCta?: Cta;
};

/** 14 company — 会社概要・代表挨拶・沿革 */
export type CompanyData = {
  eyebrow?: string;
  heading?: string;
  lead?: string;
  /** 会社概要の表。省略すると company から日本の必須項目で作る */
  rows?: InfoRow[];
  /** 代表挨拶 */
  messageHeading?: string;
  messageTitle?: string;
  message?: string;
  image?: string;
  /** 沿革 */
  historyHeading?: string;
  history?: HistoryEvent[];
};
