/**
 * velvet のデモ / プレビューページ。
 * 中身は共通の TemplateDemo（本番と同じ TemplateRenderer で描く）。
 * ?primary=&sub1=&sub2= を付けると、その色で塗り替わる。
 */
import TemplateDemo, { type DemoSearchParams } from "@/components/portfolio-templates/TemplateDemo";
import siteConfig from "./site.config.json";

export default async function TemplateDemoPage({
  searchParams,
}: {
  searchParams: DemoSearchParams;
}) {
  return (
    <TemplateDemo
      config={siteConfig}
      templateId="velvet"
      plan="omakase-pro"
      searchParams={searchParams}
    />
  );
}
