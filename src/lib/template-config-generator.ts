/**
 * テンプレートConfig生成
 * フォームデータ → site.config.json を生成する汎用関数
 * 業種に依存しない
 */

import { type SiteConfig, DEFAULT_STYLE } from "./site-config-schema";
import { getPlanFromTemplateId, getBaseTemplateId } from "./stripe";
import { customerSiteUrl, customerSiteLabel } from "./resolve-site";
import { type BrandColors, styleWithBrand } from "./palette";
import { defaultSectionsFor } from "./templates/catalog";
import { templatePhoto } from "./templates/photos";
import { industryCopy } from "./templates/starter-content";
import { sampleSectionSeed } from "./templates/sample-content";

interface OrderFormData {
  orderId: string;
  companyName: string;
  email: string;
  phone?: string;
  address?: string;
  ceo?: string;
  bio?: string;
  tagline?: string;
  industry?: string;
  templateId: string;
  domain?: string;
  siteSlug?: string;
  /** 申し込み画面で選んだ色（代表カラー＋サブ最大2つ） */
  brand?: Partial<BrandColors>;
}

/**
 * セクションが1枚だけ持つ写真（テンプレートに付いてくるもの）。
 * お客さんが自分の写真を送るまでのあいだ、ここが埋まっているから公開初日から完成して見える。
 * 写真の中身は docs/PHOTO_BRIEF.md、置き場は public/images/templates/<テンプレート>/。
 */
const SECTION_PHOTO: Record<string, "hero" | "scene-1" | "scene-2" | "owner"> = {
  hero: "hero",
  access: "scene-1",
  booking: "scene-2",
  company: "owner",
};

/**
 * フォームデータからsite.config.jsonの内容を生成
 * 初期状態では最低限の情報のみ。顧客が管理ページから後で追加・編集する
 */
export function generateSiteConfig(formData: OrderFormData): SiteConfig {
  const plan = getPlanFromTemplateId(formData.templateId);
  const baseTemplate = getBaseTemplateId(formData.templateId);
  const style = styleWithBrand(
    DEFAULT_STYLE[baseTemplate] || DEFAULT_STYLE["warm-craft"],
    formData.brand,
  );

  const siteUrl = formData.domain
    ? `https://${formData.domain}`
    : customerSiteUrl(formData.siteSlug || "sample");

  const base: SiteConfig = {
    templateId: formData.templateId,
    industry: formData.industry,
    plan,
    orderId: formData.orderId,
    siteUrl,

    // その業種・そのプランの構成をはじめから書いておく。
    // 書かなければ描く側が既定に落としてくれるが、書いておけば
    // 編集画面の「ページの構成」と公開サイトが最初から同じものを指す。
    sections: defaultSectionsFor(formData.templateId, plan).map((section) => {
      const copy = industryCopy(formData.templateId, formData.industry);
      section = { ...section, label: section.type === "works" ? copy.works : section.type === "menu" || section.type === "services" ? copy.menu : section.type === "booking" ? copy.booking : section.type === "flow" ? "ご利用の流れ" : section.type === "staff" ? "私たちについて" : section.type === "access" ? "アクセス・ご利用案内" : section.type === "voices" ? "お客様の声" : section.label };
      const role = SECTION_PHOTO[section.type];
      return role
        ? { ...section, data: { ...section.data, image: templatePhoto(baseTemplate, role) } }
        : section;
    }),

    company: {
      name: formData.companyName,
      tagline: formData.tagline || "",
      description: "",
      phone: formData.phone || "",
      email: formData.email,
      address: formData.address || "",
      hours: "",
      since: "",
      ceo: formData.ceo || "",
      bio: formData.bio || "",
      domain: formData.domain || customerSiteLabel(formData.siteSlug || "sample"),
      // 代表の写真。差し替えるまではテンプレートのものが出る
      ceoPhoto: templatePhoto(baseTemplate, "owner"),
    },

    projects: [],
    strengths: [],

    // おまかせ以上のフィールド（空配列で初期化）
    ...(plan !== "otameshi" ? {
      testimonials: [],
      news: [],
    } : {}),

    // おまかせプロのフィールド
    ...(plan === "omakase-pro" ? {
      chatFAQs: [],
      bookingEvents: [],
    } : {}),

    style,
  };

  return withSampleContent(base);
}

/**
 * 公開する設定に、その業種の見本の中身を入れる。
 *
 * 入れないと、実績や選ばれる理由が0件のまま公開され、
 * 中身が0件のセクションは描画側で消えるので、申込中に見た見本と公開物が食い違う。
 * 部品を足したときと同じ `sampleSectionSeed` を使うので、入り方は編集画面とそろう。
 *
 * その人が入力した会社名・あいさつなどは `sampleSectionSeed` の中で除かれるため、
 * ここで上書きされることはない。すでに入れてある写真も見本より優先する。
 */
function withSampleContent(base: SiteConfig): SiteConfig {
  let config = base;

  const sections = (base.sections ?? []).map((section) => {
    const seed = sampleSectionSeed(config, section.type, section.variant);
    // 実績・スタッフ・お品書きなどは詳細ページも読むので config の一番上へ
    if (Object.keys(seed.shared).length > 0) {
      config = { ...config, ...seed.shared };
    }
    const data = { ...seed.data, ...(section.data ?? {}) };
    return Object.keys(data).length > 0 ? { ...section, data } : section;
  });

  return { ...config, sections };
}

/**
 * site.config.jsonをJSON文字列に変換
 */
export function stringifySiteConfig(config: SiteConfig): string {
  return JSON.stringify(config, null, 2);
}
