/**
 * サイトデータの取り出し口。
 *
 * 顧客サイトの表示は「公開中のサイトを1件、config ごと引く」だけで済む。
 * 旧設計では GitHub から site.config.json を取っていたが、その経路はここに置き換わる。
 *
 * v1 ではキャッシュを挟まない。Supabase 東京 × Vercel 東京なら
 * 索引付き1件の取得は十分速く、「保存したら即反映」が確実に成立する。
 * 負荷が出てきたら 'use cache' + cacheTag('site:<slug>') を足す。
 */

import type { SiteConfig } from "./site-config-schema";
import { getReadClient, getWriteClient, isMissingTableError } from "./supabase/server";

export interface PublishedSite {
  id: string;
  slug: string;
  templateId: string;
  config: SiteConfig;
  version: number;
}

/** site_configs は1対1なので、実装差で配列で返ってきても拾えるようにしておく */
type ConfigRow = { version: number; config: SiteConfig };

function pickConfigRow(raw: unknown): ConfigRow | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return (raw[0] as ConfigRow) ?? null;
  return raw as ConfigRow;
}

/**
 * 公開中のサイトを slug で1件取る。
 * 見つからない・まだ公開していない・DB が未接続 のときは null。
 */
export async function getPublishedSite(slug: string): Promise<PublishedSite | null> {
  const supabase = getReadClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("sites")
    .select("id, slug, template_id, site_configs(version, config)")
    .eq("slug", slug)
    .eq("status", "live")
    .maybeSingle();

  if (error) {
    // テーブル未作成のときは画面を白くせず「見つからない」として扱う
    if (isMissingTableError(error)) return null;
    console.error("[site-repo] サイト取得に失敗", { slug, error });
    return null;
  }
  if (!data) return null;

  const row = pickConfigRow((data as { site_configs?: unknown }).site_configs);
  if (!row?.config) return null;

  return {
    id: data.id as string,
    slug: data.slug as string,
    templateId: (data.template_id as string) || "warm-craft",
    config: row.config,
    version: row.version ?? 1,
  };
}

/**
 * slug が空いているか調べる（申込画面用）。サーバー側からだけ呼ぶこと。
 * 予約語の判定は checkSlug() 側で先に行う。
 *
 * ここで service_role を使うのは、anon だと RLS により公開中のサイトしか
 * 見えないため。下書きのまま押さえられている slug を「空いている」と
 * 誤判定して、あとから unique 制約で落ちるのを防ぐ。
 */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  const supabase = getWriteClient();
  if (!supabase) return true;

  const { data, error } = await supabase
    .from("sites")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error && !isMissingTableError(error)) {
    console.error("[site-repo] slug 重複チェックに失敗", { slug, error });
    return false;
  }
  return !data;
}
