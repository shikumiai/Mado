/**
 * 自分の Mado サイトの中を確かめる（設計書 FUNNEL_CHECK_V1.md の §7）。
 *
 * 見に行かない。保存してある設定を読むだけなので速いし、どのプランでも回せる。
 * 見本のままかどうかの判定は onboarding.ts のものをそのまま使う。
 * 「公開前チェック」として /app に出すのも、導線の中の mado の段に出すのも、ここ1本。
 */

import type { SiteConfig } from "../site-config-schema";
import { getSections } from "../site-config-schema";
import { onboardingState } from "../onboarding";
import type { HopCheck } from "./types";

/* ═══════════════════════════════════════
   設定の中を歩く道具
   ═══════════════════════════════════════ */

/** ボタン1つ（セクションの data に {label, href} の形で入っている） */
interface FoundCta {
  label: string;
  href: string;
}

/** 写真らしい項目の名前 */
const PHOTO_KEY = /(image|photo|src|thumbnail|logo)$/i;

/** セクションの data をたどって、ボタンを全部集める */
function collectCtas(value: unknown, found: FoundCta[] = []): FoundCta[] {
  if (Array.isArray(value)) {
    for (const v of value) collectCtas(v, found);
    return found;
  }
  if (value && typeof value === "object") {
    const bag = value as Record<string, unknown>;
    if (typeof bag.href === "string" && "label" in bag) {
      found.push({ label: String(bag.label ?? ""), href: bag.href });
    }
    for (const v of Object.values(bag)) collectCtas(v, found);
  }
  return found;
}

/** 中身の無い写真の項目を数える */
function countEmptyPhotos(value: unknown, key = ""): number {
  if (typeof value === "string") {
    return PHOTO_KEY.test(key) && value.trim() === "" ? 1 : 0;
  }
  if (Array.isArray(value)) {
    return value.reduce<number>((n, v) => n + countEmptyPhotos(v, key), 0);
  }
  if (value && typeof value === "object") {
    return Object.entries(value).reduce<number>((n, [k, v]) => n + countEmptyPhotos(v, k), 0);
  }
  return 0;
}

/** そのサイトの中にあるページ内リンクの飛び先（#works など） */
function anchorsOf(config: SiteConfig): Set<string> {
  const ids = getSections(config).map((s) => s.id || s.type);
  return new Set(ids);
}

/** ボタンの飛び先として成り立っているか */
function ctaTargetOk(href: string, anchors: Set<string>): boolean {
  const v = href.trim();
  if (v === "" || v === "#") return false;
  if (v.startsWith("#")) return anchors.has(v.slice(1));
  if (/^(https?:|tel:|mailto:|line:)/i.test(v)) return true;
  // サイトの中のページ（/works/3 など）
  return v.startsWith("/");
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/* ═══════════════════════════════════════
   本体
   ═══════════════════════════════════════ */

/**
 * サイトの設定を読んで、公開前に直しておきたいところを返す。
 * ここでは外へ取りに行かないので、根拠（evidence）は付けない。
 */
export function runSiteCheck(config: SiteConfig): HopCheck[] {
  const checks: HopCheck[] = [];
  const state = onboardingState(config);
  const sections = getSections(config);
  const anchors = anchorsOf(config);

  /* 1. ボタンの飛び先 */
  const ctas = [
    ...collectCtas(sections),
    ...(config.company.social ?? []).map((s) => ({ label: s.label, href: s.href })),
  ];
  const deadCtas = ctas.filter((c) => !ctaTargetOk(c.href, anchors));
  checks.push(
    deadCtas.length === 0
      ? { name: "ボタンの飛び先がある", status: "ok" }
      : {
          name: "ボタンの飛び先がある",
          status: "ng",
          reason: `飛び先が入っていないボタンが${deadCtas.length}個あります（${deadCtas
            .map((c) => c.label || "名前なし")
            .slice(0, 3)
            .join("・")}）。`,
        },
  );

  /* 2. 電話番号と住所 */
  const phone = text(config.company.phone);
  const address = text(config.company.address);
  checks.push(
    phone && address
      ? { name: "電話番号と住所が入っている", status: "ok" }
      : {
          name: "電話番号と住所が入っている",
          status: "ng",
          reason: !phone && !address
            ? "電話番号と住所が空です。連絡先が無いと問い合わせが来ません。"
            : !phone
              ? "電話番号が空です。すぐ電話したい人が離れます。"
              : "住所が空です。どこのお店か分からないと来店につながりません。",
        },
  );

  /* 3. お問い合わせの部品 */
  const hasContact =
    sections.some((s) => (s.type === "contact" || s.type === "booking") && s.visible !== false) ||
    text(config.company.email) !== "";
  checks.push(
    hasContact
      ? { name: "お問い合わせの受け口がある", status: "ok" }
      : {
          name: "お問い合わせの受け口がある",
          status: "ng",
          reason: "お問い合わせのセクションもメールアドレスもありません。連絡する手立てがありません。",
        },
  );

  /* 4. 見本のままの写真・文章 */
  const sampleLeft = state.tasks.filter(
    (t) => !t.done && (t.id === "hero-photo" || t.id === "tagline" || t.id === "rest-photos"),
  );
  checks.push(
    sampleLeft.length === 0
      ? { name: "見本のままの写真・文章が残っていない", status: "ok" }
      : {
          name: "見本のままの写真・文章が残っていない",
          status: "ng",
          reason:
            state.templatePhotos > 0
              ? `見本の写真が${state.templatePhotos}枚と、見本のままの文章が残っています。自分のものに入れ替えてください。`
              : "見本のままの文章が残っています。自分の言葉に書き換えてください。",
        },
  );

  /* 5. 写真のパスが空でない */
  const emptyPhotos = countEmptyPhotos(config);
  const heroBroken = config.sections?.some(
    (s) => s.type === "hero" && typeof s.data?.image === "string" && s.data.image.trim() === "",
  );
  checks.push(
    emptyPhotos === 0 && !heroBroken
      ? { name: "写真が壊れていない", status: "ok" }
      : {
          name: "写真が壊れていない",
          status: "ng",
          reason: `写真の場所が空の項目が${Math.max(emptyPhotos, 1)}件あります。そこは画像が出ません。`,
        },
  );

  return checks;
}
