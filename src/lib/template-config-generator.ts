/**
 * テンプレートConfig生成
 * フォームデータ → site.config.json を生成する汎用関数
 * 業種に依存しない
 */

import { type SiteConfig, type StyleConfig, DEFAULT_STYLE } from "./site-config-schema";
import { getPlanFromTemplateId, getBaseTemplateId, type Plan } from "./stripe";
import { customerSiteUrl, customerSiteLabel } from "./resolve-site";
import { type BrandColors, buildPalette, normalizeHex } from "./palette";

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
 * 選んだ色を style に書き込む。
 * 正（テンプレートが読むところ）は style.brand。
 * style.colors は前からある項目なので、同じ色から作った値で埋めて食い違わせない。
 * 色が選ばれていなければ何も足さない＝テンプレートの初期色で描かれる。
 */
function applyBrand(base: StyleConfig, brand: Partial<BrandColors> | undefined): StyleConfig {
  const primary = normalizeHex(brand?.primary);
  if (!primary) return base;

  const sub1 = normalizeHex(brand?.sub1) || undefined;
  const sub2 = normalizeHex(brand?.sub2) || undefined;
  const p = buildPalette({ primary, sub1, sub2 });

  return {
    ...base,
    brand: { primary, ...(sub1 ? { sub1 } : {}), ...(sub2 ? { sub2 } : {}) },
    colors: {
      primary: p.primary,
      accent: p.sub1,
      background: p.bg,
      text: p.ink,
      textMuted: p.ink2,
      border: p.line,
    },
  };
}

/**
 * フォームデータからsite.config.jsonの内容を生成
 * 初期状態では最低限の情報のみ。顧客が管理ページから後で追加・編集する
 */
export function generateSiteConfig(formData: OrderFormData): SiteConfig {
  const plan = getPlanFromTemplateId(formData.templateId);
  const baseTemplate = getBaseTemplateId(formData.templateId);
  const style = applyBrand(
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
