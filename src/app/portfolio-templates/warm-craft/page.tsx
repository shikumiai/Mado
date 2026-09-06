/**
 * テンプレートのデモ / プレビューページ。
 *
 * 本番の顧客サイトと同じ TemplateRenderer で、このフォルダの
 * site.config.json をそのまま描く（デモも本番も同じ描画＝見た目がズレない）。
 * プラン差（-mid / -pro）は config.sections の構成で表示する。
 *
 * アドレスに ?primary=&sub1=&sub2= を付けると、その色で描く。
 * 申し込み画面のプレビューが「選んだ色のテンプレ」をそのまま映すために使う。
 * 色の指定が無ければテンプレートの初期色のまま。
 */
import type { SiteConfig } from "@/lib/site-config-schema";
import TemplateRenderer from "@/components/template-renderers/TemplateRenderer";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import { brandFromQuery } from "@/lib/palette";
import siteConfig from "./site.config.json";

const config = siteConfig as SiteConfig;

export default async function TemplateDemoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const brand = brandFromQuery(await searchParams);
  const shown: SiteConfig = brand
    ? { ...config, style: { ...config.style, brand } }
    : config;

  return (
    <>
      <DemoBanner />
      <TemplateRenderer templateId={shown.templateId} config={shown} />
    </>
  );
}
