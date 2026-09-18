/**
 * trust-navy-mid のデモ / プレビューページ。
 * trust-navy と同じ site.config.json を、プラン違いで描く
 * （プラン差は「見せるセクションの数」で表す。構成は src/lib/templates/catalog.ts）。
 */
import TemplateDemo, { type DemoSearchParams } from "@/components/portfolio-templates/TemplateDemo";
import siteConfig from "../trust-navy/site.config.json";

export default async function TemplateDemoPage({
  searchParams,
}: {
  searchParams: DemoSearchParams;
}) {
  return (
    <TemplateDemo
      config={siteConfig}
      templateId="trust-navy-mid"
      plan="omakase"
      searchParams={searchParams}
    />
  );
}
