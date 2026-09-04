/**
 * テンプレートのデモ / プレビューページ。
 *
 * 本番の顧客サイトと同じ TemplateRenderer で、このフォルダの
 * site.config.json をそのまま描く（デモも本番も同じ描画＝見た目がズレない）。
 * プラン差（-mid / -pro）は config.sections の構成で表示する。
 */
import type { SiteConfig } from "@/lib/site-config-schema";
import TemplateRenderer from "@/components/template-renderers/TemplateRenderer";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import siteConfig from "./site.config.json";

const config = siteConfig as SiteConfig;

export default function TemplateDemoPage() {
  return (
    <>
      <DemoBanner />
      <TemplateRenderer templateId={config.templateId} config={config} />
    </>
  );
}
