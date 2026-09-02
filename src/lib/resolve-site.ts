/**
 * 「このリクエストはどの顧客サイトか」を決める唯一の入口。
 *
 * v1 の形:
 *   mado.shikumiai.com/{slug}       → パスの1階層目が顧客サイトのスラッグ
 *
 * 将来ここに足すもの（このファイルと proxy.ts だけを触れば済むようにしてある）:
 *   {slug}.mado.shikumiai.com       → サブドメイン方式
 *   tanaka-koumuten.com             → 顧客の独自ドメイン（sites.custom_domain を引く）
 *
 * ページや Renderer からは resolveSiteSlug() の結果だけを見る。
 * URL の形が変わっても、向こう側には影響が出ない。
 */

/**
 * 顧客サイトのスラッグとして使えない語。
 *
 * DB の reserved_slugs テーブルが本体で、そちらがトリガーで登録を止める。
 * こちらは「申込画面で早めに弾く」ための同じ一覧。
 * src/app 直下のディレクトリを増やしたら、両方に足すこと。
 */
export const RESERVED_SLUGS = new Set([
  "start", "member", "admin", "api", "login", "signup",
  "auth", "logout", "signout", "callback", "account", "settings",
  "legal", "privacy", "features", "lp", "templates",
  "portfolio-templates", "preview", "order", "portfolio", "test",
  "s", "images", "assets", "static", "public", "_next",
  "favicon.ico", "robots.txt", "sitemap.xml", "manifest.json",
]);

/** DB のトリガーと同じ規則。英小文字・数字・ハイフン、3〜50文字 */
const SLUG_PATTERN = /^[a-z0-9]([a-z0-9-]{1,48}[a-z0-9])?$/;

export type SlugCheck =
  | { ok: true; slug: string }
  | { ok: false; reason: "reserved" | "format"; message: string };

/**
 * 申込画面などで使う、スラッグの事前チェック。
 * 最終的な可否は DB のトリガーが決める。ここは早めに知らせるためのもの。
 */
export function checkSlug(input: string): SlugCheck {
  const slug = (input || "").trim().toLowerCase();

  if (RESERVED_SLUGS.has(slug)) {
    return { ok: false, reason: "reserved", message: "このURLは使えません。別のURLを入力してください。" };
  }
  if (!SLUG_PATTERN.test(slug)) {
    return {
      ok: false,
      reason: "format",
      message: "URLは英小文字・数字・ハイフンのみ、3〜50文字で入力してください。",
    };
  }
  return { ok: true, slug };
}

/**
 * URL から顧客サイトのスラッグを取り出す。
 * 顧客サイトではないとき（LP・申込・会員・管理など）は null を返す。
 *
 * @param host        リクエストのホスト名（将来のサブドメイン対応で使う）
 * @param pathSegment パスの1階層目（例: "/tanaka-koumuten" の "tanaka-koumuten"）
 */
export function resolveSiteSlug(host: string, pathSegment: string): string | null {
  void host; // v1 ではホスト名を見ない。サブドメイン対応を足すときにここで使う

  const seg = (pathSegment || "").trim().toLowerCase();
  if (!seg) return null;

  const check = checkSlug(seg);
  return check.ok ? check.slug : null;
}

/* ═══════════════════════════════════════
   顧客サイトの公開 URL
   ═══════════════════════════════════════ */

/** サービスの基点。環境変数で差し替えられる */
export const SITE_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_BASE_URL || "https://mado.shikumiai.com";

/** 顧客サイトの URL（例: https://mado.shikumiai.com/tanaka-koumuten） */
export function customerSiteUrl(slug: string): string {
  return `${SITE_BASE_URL}/${slug}`;
}

/** 画面に出す用（例: mado.shikumiai.com/tanaka-koumuten） */
export function customerSiteLabel(slug: string): string {
  return customerSiteUrl(slug).replace(/^https?:\/\//, "");
}

/** 入力欄の前に出す固定部分（例: mado.shikumiai.com/） */
export const SITE_URL_PREFIX = SITE_BASE_URL.replace(/^https?:\/\//, "") + "/";
