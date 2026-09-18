/**
 * サイト内チェック（docs/FUNNEL_CHECK_V1.md §7）。全プランで使える。
 *
 * 自分の Mado サイトは設定（site.config）を読めば分かるので、ページを見に行かない。
 * 見本のままかどうかの判定は onboarding.ts をそのまま使う（判定を二重に持たない）。
 *
 * 裏側担当が同じ場所に本実装を置いたら、そちらに差し替える。
 * 返り値は §8 の HopCheck[] なので、差し替えても画面は直さなくてよい。
 */

import type { SiteConfig } from "@/lib/site-config-schema";
import { getSections } from "@/lib/site-config-schema";
import { onboardingState } from "@/lib/onboarding";
import type { HopCheck, HopStatus } from "./types";

/** 写真が入っていそうな項目名 */
const PHOTO_KEYS = ["image", "photo", "ceoPhoto", "src", "cover", "thumbnail"];

/** リンクが入っていそうな項目名 */
const LINK_KEYS = ["href", "url", "link"];

type Bag = Record<string, unknown>;

function isBag(value: unknown): value is Bag {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** 設定の中を歩いて、項目名が合うものの値（文字列）を集める */
function collect(value: unknown, keys: string[], out: { key: string; value: string }[]): void {
  if (Array.isArray(value)) {
    for (const v of value) collect(v, keys, out);
    return;
  }
  if (!isBag(value)) return;
  for (const [k, v] of Object.entries(value)) {
    if (keys.includes(k) && (typeof v === "string" || v === null || v === undefined)) {
      out.push({ key: k, value: typeof v === "string" ? v : "" });
    } else {
      collect(v, keys, out);
    }
  }
}

/** ページ内のアンカー（#で始まるリンクの飛び先）として使える名前 */
function anchors(config: SiteConfig): Set<string> {
  const set = new Set<string>(["top", "contact"]);
  for (const s of getSections(config)) {
    set.add(s.id ?? s.type);
    set.add(s.type);
  }
  return set;
}

/** その飛び先が成り立っているか */
function linkLooksAlive(href: string, ok: Set<string>): boolean {
  const v = href.trim();
  if (v === "") return false;
  if (v.startsWith("#")) return ok.has(v.slice(1));
  return (
    v.startsWith("/") ||
    v.startsWith("http://") ||
    v.startsWith("https://") ||
    v.startsWith("tel:") ||
    v.startsWith("mailto:")
  );
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * 公開前に確かめること一式。
 * 直せるものから順に並べる（上ほど、直すと効く）。
 */
export function runSiteCheck(config: SiteConfig): HopCheck[] {
  const fetchedAt = new Date().toISOString();
  const ev = { fetchedAt };
  const checks: HopCheck[] = [];

  /* 1. ボタンの飛び先が存在する */
  const links: { key: string; value: string }[] = [];
  collect(config, LINK_KEYS, links);
  const ok = anchors(config);
  const deadLinks = links.filter((l) => !linkLooksAlive(l.value, ok));
  checks.push({
    name: "ボタンの飛び先がある",
    status: deadLinks.length === 0 ? "ok" : "ng",
    reason:
      deadLinks.length === 0
        ? undefined
        : `押しても何も起きないボタンが${deadLinks.length}か所あります。`,
    evidence: ev,
  });

  /* 2. 電話番号・住所が入っている */
  const phone = text(config.company?.phone);
  const address = text(config.company?.address);
  const missing = [phone === "" ? "電話番号" : null, address === "" ? "住所" : null].filter(Boolean);
  checks.push({
    name: "電話番号と住所が入っている",
    status: missing.length === 0 ? "ok" : "ng",
    reason: missing.length === 0 ? undefined : `${missing.join("と")}がまだ空です。`,
    evidence: ev,
  });

  /* 3. お問い合わせの部品がある */
  const hasContact = getSections(config).some(
    (s) => (s.type === "contact" || s.type === "access" || s.type === "info") && s.visible,
  );
  checks.push({
    name: "お問い合わせの部品がある",
    status: hasContact ? "ok" : "ng",
    reason: hasContact ? undefined : "連絡先を書いた部品が、いまのページに出ていません。",
    evidence: ev,
  });

  /* 4. 見本のままの写真・文章が残っていない */
  const todo = onboardingState(config);
  const leftover = todo.tasks.filter((t) => !t.done);
  checks.push({
    name: "見本のままの写真と文章が残っていない",
    status: leftover.length === 0 ? "ok" : "ng",
    reason:
      leftover.length === 0
        ? undefined
        : `まだ見本のままの場所があります（${leftover[0].title}）。`,
    evidence: ev,
  });

  /* 5. 写真が壊れていない（パスが空でない） */
  const photos: { key: string; value: string }[] = [];
  collect(config, PHOTO_KEYS, photos);
  const broken = photos.filter((p) => p.value.trim() === "");
  checks.push({
    name: "写真が表示できる",
    status: broken.length === 0 ? "ok" : "ng",
    reason:
      broken.length === 0
        ? undefined
        : `写真の場所が空のままの箇所が${broken.length}か所あります。`,
    evidence: ev,
  });

  return checks;
}

/** 一覧の見出しに出す、まとめの状態。ng が1つでもあれば ng */
export function siteCheckStatus(checks: HopCheck[]): HopStatus {
  if (checks.some((c) => c.status === "ng")) return "ng";
  if (checks.some((c) => c.status === "skipped")) return "skipped";
  return "ok";
}
