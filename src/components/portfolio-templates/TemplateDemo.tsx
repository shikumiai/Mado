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
  const brand = brandFromQuery(await searchParams);

  const shown: SiteConfig = {
    ...base,
    templateId: templateId ?? base.templateId,
    plan: normalizePlanId(plan ?? base.plan ?? "otameshi"),
    style: brand ? { ...base.style, brand } : base.style,
  };

  return (
    <>
      <DemoBanner />
      <TemplateRenderer templateId={shown.templateId} config={shown} />
    </>
  );
}
