/**
 * clean-arch-pro のデモ / プレビューページ。
 * clean-arch と同じ site.config.json を、プラン違いで描く
 * （プラン差は「見せるセクションの数」で表す。構成は src/lib/templates/catalog.ts）。
 */
import TemplateDemo, { type DemoSearchParams } from "@/components/portfolio-templates/TemplateDemo";
import siteConfig from "../clean-arch/site.config.json";

export default async function TemplateDemoPage({
  searchParams,
}: {
  searchParams: DemoSearchParams;
}) {
  return (
    <TemplateDemo
      config={siteConfig}
      templateId="clean-arch-pro"
      plan="omakase-pro"
      searchParams={searchParams}
    />
  );
}
