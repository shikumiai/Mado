/**
 * site.config.json のTypeScript型定義
 *
 * 全テンプレート共通のデータスキーマ。
 * テンプレートのpage.tsxはこの型のデータを受け取って描画する。
 * 顧客のデータ変更はこのJSONを更新するだけで即反映される。
 */

import { defaultSectionsFor } from "@/lib/templates/catalog";

/* ═══════════════════════════════════════
   会社情報（全テンプレート共通）
   ═══════════════════════════════════════ */
export interface CompanyInfo {
  name: string;               // 山田工務店
  nameEn?: string;            // YAMADA CONSTRUCTION（trust-navy用）
  tagline: string;            // 家族の暮らしに寄り添う家づくり
  description: string;        // サイトの説明文
  phone: string;
  fax?: string;
  email: string;
  address: string;
  hours: string;              // 9:00〜18:00（日曜・祝日定休）
  since: string;              // 1996
  ceo: string;                // 代表者名
  ceoTitle?: string;          // 一級建築士 / 代表取締役
  bio: string;                // 代表挨拶（改行は\n\nで区切る）
  license?: string;           // 許認可
  capital?: string;           // 資本金
  employees?: string;         // 従業員数
  business?: string;          // 事業内容（会社概要の表に出す。無ければ services から作る）
  founded?: string;           // 設立（法人化の年月。無ければ since を使う）
  iso?: string;               // ISO認証
  domain: string;             // yamada-koumuten.jp
  ceoPhoto?: string;          // /images/ceo.jpg
  mapEmbedUrl?: string;       // Google Maps embed URL
  social?: SocialLink[];      // フッターに出す SNS・外部ページ
}

/* ═══════════════════════════════════════
   SNS・外部ページ（フッターに出す）
   ═══════════════════════════════════════ */
export interface SocialLink {
  label: string;              // Instagram / LINE公式アカウント
  href: string;               // https://instagram.com/...
}

/* ═══════════════════════════════════════
   施工実績 / 作品
   ═══════════════════════════════════════ */
export interface Project {
  id: number;
  title: string;              // 世田谷の家
  titleEn?: string;           // House in Setagaya（clean-arch用）
  slug?: string;              // portrait-hikari（作品詳細ページURL用）
  category: string;           // 新築 / リフォーム / 住宅 / 店舗
  year: string;               // 2025
  description: string;
  specs?: string;             // 木造2階建 / 延床面積 120㎡ / 4LDK
  image?: string;             // /images/work-1.jpg
  // ミドル以上
  client?: string;            // S様ご家族
  beforeDesc?: string;        // Before説明
  afterDesc?: string;         // After説明
  // clean-arch用
  size?: "landscape" | "portrait" | "square";
  // 作品・撮影の詳細（設計事務所・写真）
  concept?: string;           // 撮影コンセプト
  location?: string;          // 撮影場所
  equipment?: string;         // 使用機材
  clientComment?: string;     // クライアントコメント
}

/* ═══════════════════════════════════════
   強み / サービス
   ═══════════════════════════════════════ */
export interface Strength {
  title: string;
  description: string;
  icon?: string;              // lucide-reactのアイコン名: "Home" | "Shield" | etc.
}

export interface Service {
  title: string;
  description: string;
  icon?: string;
  slug?: string;                // diet-program（サブページURL用）
  targetAudience?: string | string[];  // 対象者（文字列 or 配列）
  details?: string;             // トレーニング内容の詳細
  duration?: string;            // 期間・頻度の目安（「週2回 × 3ヶ月」等）
  results?: string;             // 成果事例（Before/After数値等）
  price?: string;               // 料金（「¥32,000/月〜」等）
  steps?: string[];             // サービスの流れ（ステップ形式）
  faq?: { q: string; a: string }[];  // よくある質問
  sessionContent?: string[];    // セッション内容の詳細（コーチング等）
  expectedChanges?: string[];   // 期待できる変化（具体的な数値入り）
  testimonial?: {               // 体験談（匿名）
    initial: string;            // T.K
    attribute: string;          // 30代男性・IT企業
    text: string;               // 体験談本文
  };
}

/* ═══════════════════════════════════════
   解決事例（士業テンプレート用）
   ═══════════════════════════════════════ */
export interface Case {
  id: number;
  slug: string;                 // startup-tax-saving
  title: string;                // 創業2年目の法人税を年間80万円削減
  category: string;             // 法人税務
  client: string;               // IT企業（従業員5名）※匿名
  challenge: string;            // 課題
  solution: string;             // 対応策
  result: string;               // 結果
}

/* ═══════════════════════════════════════
   お客様の声（コーチング・無形商材用）
   ═══════════════════════════════════════ */
export interface Voice {
  id: number;
  slug: string;                 // career-change-success
  initial: string;              // T.K
  attribute: string;            // 30代男性・IT企業管理職
  challenge: string;            // 相談前の課題
  insight: string;              // セッションでの気づき
  result: string;               // 現在の状態（変化）
  numbers: string;              // 具体的な数値（年収変化等）
}

/* ═══════════════════════════════════════
   お客様の声（ミドル以上）
   ═══════════════════════════════════════ */
export interface Testimonial {
  name: string;               // S様（世田谷区）
  project: string;            // 新築
  text: string;
  rating?: number;            // 1-5
}

/* ═══════════════════════════════════════
   ニュース / お知らせ（ミドル以上）
   ═══════════════════════════════════════ */
export interface NewsItem {
  date: string;               // 2025.04.05
  category: string;           // 完成見学会 / お知らせ / メディア
  title: string;
  // ── 一覧→詳細で使う（無くても一覧は成立する）──
  id?: number;
  slug?: string;              // spring-open-house（詳細ページURL用）
  excerpt?: string;           // 一覧に出す短い前置き
  body?: string;              // 本文（改行は\n\nで区切る）
  image?: string;
  link?: string;              // 外部記事へ飛ばす場合
}

/* ═══════════════════════════════════════
   受賞歴（clean-arch用）
   ═══════════════════════════════════════ */
export interface Award {
  year: string;
  title: string;
  project: string;
}

/* ═══════════════════════════════════════
   数字実績（trust-navy用）
   ═══════════════════════════════════════ */
export interface Stat {
  num: string;                // 50
  unit: string;               // 年
  label: string;              // 創業からの歴史
}

/* ═══════════════════════════════════════
   予約イベント（プレミアム）
   ═══════════════════════════════════════ */
export interface BookingEvent {
  id: number;
  date: string;               // 4/19（土）
  time: string;               // 10:00〜16:00
  title: string;
  location: string;
  spots: number;
}

/* ═══════════════════════════════════════
   AIチャットボットFAQ（プレミアム）
   ═══════════════════════════════════════ */
export interface ChatFAQ {
  question: string;
  answer: string;
}

/* ═══════════════════════════════════════
   採用情報（trust-navy-pro用）
   ═══════════════════════════════════════ */
export interface JobPosting {
  id: string;
  title: string;              // 施工管理（建築）
  type: string;               // 正社員
  location: string;
  salary: string;
  description: string;
  duties: string[];
  requirements: string[];
  preferred: string[];
  licenses: string[];
}

/* ═══════════════════════════════════════
   メニュー（飲食業種用）
   ═══════════════════════════════════════ */
export interface MenuItem {
  id: number;
  name: string;               // 季節の前菜盛り合わせ
  price: string;              // ¥1,200
  description?: string;       // 旬の野菜を使った5種の前菜
  category: string;           // 前菜 / パスタ / ドリンク
  isRecommended?: boolean;    // おすすめマーク
  image?: string;
}

/* ═══════════════════════════════════════
   ギャラリー（飲食・美容等）
   ═══════════════════════════════════════ */
export interface GalleryItem {
  id: number;
  slug?: string;              // short-bob-natural（詳細ページURL用）
  image?: string;
  caption?: string;           // 自家製パスタ / テラス席の夜景
  category?: string;          // 料理 / 店内 / 外観
  stylist?: string;           // 担当スタイリスト名（美容）
  description?: string;       // スタイル説明
  treatment?: string;         // 施術内容（カット + カラー）
  duration?: string;          // 施術時間（約2時間）
  price?: string;             // 料金（¥15,400）
}

/* ═══════════════════════════════════════
   スタッフ紹介（美容・医療等）
   ═══════════════════════════════════════ */
export interface StaffMember {
  id: number;
  slug?: string;              // nakamura-saori（詳細ページURL用）
  name: string;               // 田中 美咲
  role: string;               // スタイリスト / 院長
  bio?: string;               // 得意スタイルはショートヘア...
  image?: string;
  specialty?: string;         // 得意スタイル（ショートヘア、大人世代のヘアデザイン）
  experience?: string;        // 経歴（スタイリスト歴18年）
  schedule?: string;          // 出勤日（月・水〜土）
  qualifications?: string[];  // 資格一覧（["NSCA-CSCS", "NESTA-PFT"]等）
  philosophy?: string;        // トレーニング哲学・指導方針
  programs?: string[];        // 担当プログラムのslug一覧
}

/* ═══════════════════════════════════════
   ご利用の流れ（flow セクション）
   ═══════════════════════════════════════ */
export interface FlowStep {
  step: number;               // 1, 2, 3...
  title: string;              // お問い合わせ
  description: string;        // 詳細説明
  duration: string;           // 1営業日以内にご返信
}

/* ═══════════════════════════════════════
   よくある質問
   ═══════════════════════════════════════ */
export interface FAQItem {
  question: string;
  answer: string;
  category?: string;          // 費用のこと / 工事のこと（分類タブで使う）
}

/* ═══════════════════════════════════════
   沿革（会社概要の一部・日本の会社サイトの必須）
   ═══════════════════════════════════════ */
export interface HistoryEvent {
  year: string;               // 1998
  title: string;              // 松本市中央に工房を構える
  description?: string;
}

/* ═══════════════════════════════════════
   セクション定義
   ═══════════════════════════════════════ */

/**
 * セクションの種類。テンプレートによって使えるセクションが異なる。
 * header / footer は常に表示されるため、ここには含めない。
 */
export type SectionType =
  | "hero"           // メインビジュアル（全テンプレート共通）
  | "works"          // 施工実績 / 作品一覧
  | "strengths"      // 私たちの強み
  | "services"       // サービス紹介（trust-navy）
  | "stats"          // 数字実績（trust-navy）
  | "about"          // 会社案内 / 代表挨拶
  | "testimonials"   // お客様の声（omakase以上）
  | "news"           // お知らせ（omakase以上）
  | "awards"         // 受賞歴（clean-arch）
  | "booking"        // 予約（omakase-pro）
  | "recruit"        // 採用（trust-navy omakase-pro）
  | "menu"           // メニュー表示（飲食）
  | "gallery"        // ギャラリー（飲食・美容等）
  | "staff"          // スタッフ紹介（美容・医療等）
  | "pricing"        // 料金表（士業・サービス業等）
  | "info"           // 店舗情報・地図（店舗型ビジネス）
  | "contact"        // お問い合わせ
  // ── v3 の機能カタログで足した種類（旧い名前もそのまま残す） ──
  | "voices"         // お客様の声・実績数値（旧 testimonials / stats）
  | "flow"           // ご利用・相談・受診の流れ
  | "faq"            // よくある質問
  | "access"         // アクセス・営業/診療時間・地図（旧 info）
  | "company";       // 会社概要・代表挨拶・沿革（旧 about）

export interface Section {
  type: SectionType;
  visible: boolean;
  label: string;              // エディタ表示名（「施工実績」「会社案内」等）
  /**
   * 見せ方。同じ機能でもレイアウトの型を選べる（v3）。
   * 例: works の "grid" / "masonry" / "feature-list" / "showcase" / "quiet"。
   * 未指定・知らない名前なら、その機能の既定の見せ方で描く。
   */
  variant?: string;
  /**
   * そのセクションのデータ。無ければ config の同じ項目（projects / strengths …）を使う。
   * 中身の形は src/components/sections/types.ts の *Data を参照。
   */
  data?: Record<string, unknown>;
  /** アンカー。ページ内リンクの飛び先（未指定なら type を使う） */
  id?: string;
}

/* ═══════════════════════════════════════
   スタイル設定
   ═══════════════════════════════════════ */
/**
 * お客さんが選んだ色。代表カラー1つ＋サブ最大2つ。
 * ここが空なら、テンプレートの初期色で描く（古い config でも壊れない）。
 * 実際に使う色一式は src/lib/palette.ts がここから組み立てる。
 */
export interface BrandStyle {
  primary: string;            // 代表カラー #C05A2E
  sub1?: string;              // サブ1
  sub2?: string;              // サブ2
}

export interface StyleConfig {
  /** 選んだ色（無ければテンプレートの初期色） */
  brand?: BrandStyle;
  colors: {
    primary: string;          // #7BA23F
    accent: string;           // #D4A76A
    background: string;       // #FAF7F2
    text: string;             // #3D3226
    textMuted: string;        // #8B7D6B
    border: string;           // #E8DFD3
  };
  fonts: {
    heading: string;          // "'Noto Sans JP', sans-serif"
    body: string;
  };
  sizes: {
    heading: "sm" | "md" | "lg";
    body: "sm" | "md" | "lg";
  };
  weights: {
    heading: "normal" | "bold" | "light";
    body: "normal" | "bold";
  };
}

/* ═══════════════════════════════════════
   メイン設定（全体）
   ═══════════════════════════════════════ */
export interface SiteConfig {
  // メタ情報
  templateId: string;         // warm-craft | trust-navy | clean-arch
  plan: "otameshi" | "omakase" | "omakase-pro";
  orderId: string;
  siteUrl: string;

  // 会社情報
  company: CompanyInfo;

  // コンテンツ
  projects: Project[];
  strengths: Strength[];
  services?: Service[];       // trust-navy用
  stats?: Stat[];             // trust-navy用

  // 業種固有データ
  menu?: MenuItem[];            // メニュー（飲食・美容等）
  galleryItems?: GalleryItem[]; // ギャラリー（飲食・美容等）
  staff?: StaffMember[];        // スタッフ紹介（美容・医療等）
  voices?: Voice[];             // お客様の声（コーチング・無形商材用）
  cases?: Case[];               // 解決事例（士業テンプレート用）

  // おまかせ以上
  testimonials?: Testimonial[];
  news?: NewsItem[];
  awards?: Award[];           // clean-arch用

  // v3 の機能カタログで使う一覧
  flow?: FlowStep[];            // ご利用の流れ
  faq?: FAQItem[];              // よくある質問
  history?: HistoryEvent[];     // 沿革（会社概要）

  // おまかせプロ
  bookingEvents?: BookingEvent[];
  chatFAQs?: ChatFAQ[];
  jobs?: JobPosting[];        // trust-navy-pro用

  // セクション順序（なければデフォルトを使う）
  sections?: Section[];

  // スタイル
  style: StyleConfig;
}

/**
 * その config で描くセクション一式。
 * config.sections があればそれ。無ければテンプレート定義（10業種の構成の正）から作る。
 *
 * 描く側（SectionsRenderer）と同じところを見るので、
 * 編集画面に出る「ページの構成」と、実際に描かれるサイトが食い違わない。
 */
export function getSections(config: SiteConfig): Section[] {
  if (config.sections && config.sections.length > 0) {
    return config.sections;
  }
  return defaultSectionsFor(config.templateId, config.plan);
}

/* ═══════════════════════════════════════
   デフォルト値
   ═══════════════════════════════════════ */
export const DEFAULT_STYLE: Record<string, StyleConfig> = {
  "warm-craft": {
    colors: { primary: "#7BA23F", accent: "#D4A76A", background: "#FAF7F2", text: "#3D3226", textMuted: "#8B7D6B", border: "#E8DFD3" },
    fonts: { heading: "'Noto Sans JP', sans-serif", body: "'Noto Sans JP', sans-serif" },
    sizes: { heading: "lg", body: "md" },
    weights: { heading: "bold", body: "normal" },
  },
  "trust-navy": {
    colors: { primary: "#1B3A5C", accent: "#C8A96E", background: "#F0F4F8", text: "#1B3A5C", textMuted: "#6B7B8D", border: "#D1D9E3" },
    fonts: { heading: "'Noto Sans JP', sans-serif", body: "'Noto Sans JP', sans-serif" },
    sizes: { heading: "lg", body: "md" },
    weights: { heading: "bold", body: "normal" },
  },
  "clean-arch": {
    colors: { primary: "#333333", accent: "#999999", background: "#FFFFFF", text: "#333333", textMuted: "#999999", border: "#E5E5E5" },
    fonts: { heading: "'Noto Sans JP', sans-serif", body: "'Noto Sans JP', sans-serif" },
    sizes: { heading: "lg", body: "md" },
    weights: { heading: "light", body: "normal" },
  },
  "saveur": {
    colors: { primary: "#8B4513", accent: "#D4A574", background: "#FBF8F4", text: "#2C1810", textMuted: "#7A6B5E", border: "#E8DFD3" },
    fonts: { heading: "'Noto Serif JP', serif", body: "'Noto Sans JP', sans-serif" },
    sizes: { heading: "lg", body: "md" },
    weights: { heading: "bold", body: "normal" },
  },
  "velvet": {
    colors: { primary: "#9B6B6B", accent: "#C4956A", background: "#FAF6F5", text: "#3A2828", textMuted: "#8A7070", border: "#E8DEDD" },
    fonts: { heading: "'Noto Sans JP', sans-serif", body: "'Noto Sans JP', sans-serif" },
    sizes: { heading: "lg", body: "md" },
    weights: { heading: "bold", body: "normal" },
  },
  "credence": {
    colors: { primary: "#2B4C3F", accent: "#8B7355", background: "#F7F6F3", text: "#1A1A1A", textMuted: "#6B6B6B", border: "#E0DDD8" },
    fonts: { heading: "'Noto Serif JP', serif", body: "'Noto Sans JP', sans-serif" },
    sizes: { heading: "lg", body: "md" },
    weights: { heading: "bold", body: "normal" },
  },
  "clarity": {
    colors: { primary: "#2E7D8C", accent: "#5BA4B5", background: "#F5F9FA", text: "#1A2E33", textMuted: "#5A7A82", border: "#D8E8EC" },
    fonts: { heading: "'Noto Sans JP', sans-serif", body: "'Noto Sans JP', sans-serif" },
    sizes: { heading: "lg", body: "md" },
    weights: { heading: "bold", body: "normal" },
  },
  "beacon": {
    colors: { primary: "#2C5F7C", accent: "#E8963A", background: "#F8F6F2", text: "#1E2D3D", textMuted: "#5C7080", border: "#DDE3E8" },
    fonts: { heading: "'Noto Sans JP', sans-serif", body: "'Noto Sans JP', sans-serif" },
    sizes: { heading: "lg", body: "md" },
    weights: { heading: "bold", body: "normal" },
  },
  "marche": {
    colors: { primary: "#C45B28", accent: "#2E6B4A", background: "#FDF8F4", text: "#2A1F14", textMuted: "#7A6B5E", border: "#E8DFD3" },
    fonts: { heading: "'Noto Serif JP', serif", body: "'Noto Sans JP', sans-serif" },
    sizes: { heading: "lg", body: "md" },
    weights: { heading: "bold", body: "normal" },
  },
  "forge": {
    colors: { primary: "#1A1A1A", accent: "#FF6B35", background: "#F5F5F5", text: "#1A1A1A", textMuted: "#6B6B6B", border: "#E0E0E0" },
    fonts: { heading: "'Noto Sans JP', sans-serif", body: "'Noto Sans JP', sans-serif" },
    sizes: { heading: "lg", body: "md" },
    weights: { heading: "bold", body: "normal" },
  },
};
