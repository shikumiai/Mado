/**
 * 顧客サイトの本番ページ。
 *
 *   mado.shikumiai.com/{slug}   →  Supabase から config を読んで Renderer で描く
 *
 * 旧設計では顧客ごとに GitHub リポと Vercel プロジェクトを作っていたが、
 * その役目がこの1ファイルに置き換わる。
 *
 * /start や /member のような静的ルートは Next.js 側が先に拾うので、
 * ここに落ちてくるのは顧客サイトの候補だけ。
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveSiteSlug } from "@/lib/resolve-site";
import { getPublishedSite } from "@/lib/site-repo";
import TemplateRenderer from "@/components/template-renderers/TemplateRenderer";
import { SiteLinkProvider } from "@/components/sections/shared";

type Params = { params: Promise<{ siteSlug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { siteSlug } = await params;
  const slug = resolveSiteSlug("", siteSlug);
  if (!slug) return {};

  const site = await getPublishedSite(slug);
  if (!site) return {};

  const company = site.config.company;
  const name = company?.name || "";
  const description = company?.tagline || company?.bio || "";

  return {
    title: name,
    description,
    openGraph: { title: name, description, type: "website" },
  };
}

export default async function CustomerSitePage({ params }: Params) {
  const { siteSlug } = await params;

  // 予約語や形式違いはここで落とす（DB を引きに行かない）
  const slug = resolveSiteSlug("", siteSlug);
  if (!slug) notFound();

  const site = await getPublishedSite(slug);
  if (!site) notFound();

  // 「今は公開中の顧客サイトの中だ」を部品に知らせる。
  // これがあると一覧の項目が詳細ページへのリンクになり、フォームが本当に送信される。
  // デモ・部品カタログ・エディタのプレビューでは包まないので、そちらは送信しない。
  return (
    <SiteLinkProvider value={{ slug, siteId: site.id }}>
      <TemplateRenderer templateId={site.templateId} config={site.config} />
    </SiteLinkProvider>
  );
}
