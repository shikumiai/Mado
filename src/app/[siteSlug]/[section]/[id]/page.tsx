/**
 * 顧客サイトの詳細ページ（一覧の1件を1ページで）。
 *
 *   mado.shikumiai.com/{slug}/works/{id}
 *   mado.shikumiai.com/{slug}/staff/{id}
 *   mado.shikumiai.com/{slug}/menu/{id}
 *   mado.shikumiai.com/{slug}/news/{id}
 *
 * 中身は config から引くので、お客がデータを1件足すと詳細ページが1枚増える。
 * テンプレートごとに作る必要は無い。
 *
 * section は上の4つだけ許す。それ以外（/{slug}/about など）は 404 にして、
 * 顧客サイトの URL がむやみに増えないようにする。
 */

import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveSiteSlug } from "@/lib/resolve-site";
import { getPublishedSite } from "@/lib/site-repo";
import { findDetailItem, isDetailSection } from "@/components/sections/detail-data";
import DetailView from "@/components/sections/DetailView";

type Params = { params: Promise<{ siteSlug: string; section: string; id: string }> };

/** 同じリクエストの中では1回しか取りに行かない（見出し用と本文用で2回引かない） */
const loadSite = cache((slug: string) => getPublishedSite(slug));

/** URL からサイトと1件を引く。どこかで外れたら null */
async function load(params: Params["params"]) {
  const { siteSlug, section, id } = await params;

  const slug = resolveSiteSlug("", siteSlug);
  if (!slug) return null;
  if (!isDetailSection(section)) return null;

  const site = await loadSite(slug);
  if (!site) return null;

  const item = findDetailItem(site.config, section, id);
  if (!item) return null;

  return { slug, site, item };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const found = await load(params);
  if (!found) return {};

  const { site, item } = found;
  const company = site.config.company;
  const title = `${item.title} | ${company?.name ?? ""}`;
  const description =
    (item.body || item.rows.map((r) => `${r.label}：${r.value}`).join(" / ")).slice(0, 120);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: item.image ? [{ url: item.image }] : undefined,
    },
  };
}

export default async function DetailPage({ params }: Params) {
  const found = await load(params);
  if (!found) notFound();

  return <DetailView config={found.site.config} slug={found.slug} item={found.item} />;
}
