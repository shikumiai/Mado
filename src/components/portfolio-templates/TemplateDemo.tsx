/**
 * テンプレートのデモ / プレビューページの中身（10業種で共通）。
 *
 * 本番の顧客サイトと同じ TemplateRenderer で、そのテンプレートの
 * site.config.json をそのまま描く（デモも本番も同じ描画＝見た目がズレない）。
 *
 * ・アドレスに ?primary=&sub1=&sub2= を付けると、その色で描く。
 *   申し込み画面のプレビューが「選んだ色のテンプレ」をそのまま映すために使う。
 * ・plan を渡すと、そのプランで見えるセクションだけを描く。
 *   建築3系統の -mid / -pro は、同じ config をプラン違いで見せている。
 */

import type { SiteConfig } from "@/lib/site-config-schema";
import TemplateRenderer from "@/components/template-renderers/TemplateRenderer";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import { brandFromQuery } from "@/lib/palette";
import { generateSiteConfig } from "@/lib/template-config-generator";
import { toTemplateFamily } from "@/lib/templates/catalog";
import { normalizePlanId } from "@/lib/stripe";

export type DemoSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function TemplateDemo({
  config,
  templateId,
  plan,
  searchParams,
}: {
  /** そのフォルダの site.config.json */
  config: unknown;
  /** URL のテンプレート名（warm-craft-mid など）。省略時は config のもの */
  templateId?: string;
  /** 見せるプラン。省略時は config のもの */
  plan?: string;
  searchParams: DemoSearchParams;
}) {
  const base = config as SiteConfig;
  const query = await searchParams;
  const brand = brandFromQuery(query);

  // ?plan=omakase を付けると、そのプランで見えるセクションだけになる。
  // 申し込み画面がプランを切り替えたときに、構成の違いをその場で見せるために使う。
  const askedPlan = Array.isArray(query.plan) ? query.plan[0] : query.plan;

  const selectedPlan = normalizePlanId(askedPlan ?? plan ?? base.plan ?? "otameshi");
  const family = toTemplateFamily(templateId ?? base.templateId);
  const suffix = selectedPlan === "omakase-pro" ? "-pro" : selectedPlan === "omakase" ? "-mid" : "";
  const industry = typeof query.industry === "string" ? query.industry : undefined;
  const shown = generateSiteConfig({
    orderId: "", companyName: "あなたの会社・お店", email: "", templateId: family + suffix,
    industry, brand: brand ?? undefined,
  });


  return (
    <>
      <DemoBanner />
      <TemplateRenderer templateId={shown.templateId} config={shown} />
    </>
  );
}
