/**
 * warm-craft-pro のデモ / プレビューページ。
 * warm-craft と同じ site.config.json を、プラン違いで描く
 * （プラン差は「見せるセクションの数」で表す。構成は src/lib/templates/catalog.ts）。
 */
import TemplateDemo, { type DemoSearchParams } from "@/components/portfolio-templates/TemplateDemo";
import siteConfig from "../warm-craft/site.config.json";

export default async function TemplateDemoPage({
  searchParams,
}: {
  searchParams: DemoSearchParams;
}) {
  return (
    <TemplateDemo
      config={siteConfig}
      templateId="warm-craft-pro"
      plan="omakase-pro"
      searchParams={searchParams}
    />
  );
}
