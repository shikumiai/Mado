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

  return {
    templateId: formData.templateId,
    plan,
    orderId: formData.orderId,
    siteUrl,

    // その業種・そのプランの構成をはじめから書いておく。
    // 書かなければ描く側が既定に落としてくれるが、書いておけば
    // 編集画面の「ページの構成」と公開サイトが最初から同じものを指す。
    sections: defaultSectionsFor(formData.templateId, plan),

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
}

/**
 * site.config.jsonをJSON文字列に変換
 */
export function stringifySiteConfig(config: SiteConfig): string {
  return JSON.stringify(config, null, 2);
}
