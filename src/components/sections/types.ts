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
