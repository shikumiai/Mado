/**
 * テンプレートの写真の正（どのテンプレートに、どの写真が、何枚あるか）。
 *
 * 設計書 docs/TEMPLATE_SYSTEM_V3.md 8.1 の「ファイル名固定」をコードにしたもの。
 * 置き場は public/images/templates/<templateId>/ で、名前は決め打ち。
 *   hero.jpg / scene-1.jpg / scene-2.jpg … 主役の1枚・仕事の風景
 *   owner.jpg / staff-2.jpg 〜           … 代表と、その他の人（縦長）
 *   work-1.jpg 〜                        … 実績・作品・スタイル・施設
 *   item-1.jpg 〜                        … 料理・商品・コース・プログラム
 *   news-1.jpg 〜                        … お知らせに写真が出る業種だけ
 *   team.jpg                             … 予備（スタッフが仕事中の横位置）
 *
 * 枚数は「そのテンプレートの初期状態で実際に写真が出る場所の数」に合わせてある。
 * 写真そのものが無くても画面は壊れない（<img> の読み込みに失敗したら
 * shared.tsx の Media が設計された絵に戻す）。だからファイルは後から足せる。
 *
 * 何を写した写真かは docs/PHOTO_BRIEF.md（テンプレート×ファイル名の1行指示）。
 */

import { toTemplateFamily } from "./catalog";

/* ═══════════════════════════════════════
   型
   ═══════════════════════════════════════ */

/** 1枚しかない写真の役割 */
export type PhotoRole = "hero" | "scene-1" | "scene-2" | "owner" | "team";

/** 並びの中で1件ずつ使う写真の種類 */
export type PhotoListKind = "work" | "item" | "staff" | "news";

/** 写真の寸法（生成する側の指定と、<img> の width/height に使う） */
export interface PhotoSize {
  width: number;
  height: number;
}

/** 横位置（1536×1024）。主役・風景・実績・商品・お知らせ */
export const LANDSCAPE: PhotoSize = { width: 1536, height: 1024 };

/** 縦位置（1024×1536）。人の顔写真 */
export const PORTRAIT: PhotoSize = { width: 1024, height: 1536 };

/** そのテンプレートに用意する写真の枚数 */
export interface TemplatePhotoManifest {
  /** 実績・作品・スタイル・施設（works）の写真 */
  works: number;
  /** 料理・商品・コース・プログラム（menu）の写真 */
  items: number;
  /** 人の顔写真。1人目は owner.jpg、2人目から staff-2.jpg… */
  staff: number;
  /** お知らせ（news）の写真 */
  news: number;
}

/* ═══════════════════════════════════════
   テンプレートごとの枚数
   ═══════════════════════════════════════ */

/**
 * 10業種ぶん。数はデモ（＝テンプレートの初期状態）で写真が出る場所の数。
 *   works … その業種の works セクションが出す件数（works が無い業種は 0）
 *   items … menu セクションが写真付きで出す件数（料金表だけの業種は差し替え用に 4）
 *   staff … 顔写真が出る人数（代表 1 人だけの見せ方でも、一覧に出る人数を数える）
 *   news  … お知らせに写真が出る件数（行だけの見せ方は 0）
 */
export const TEMPLATE_PHOTOS: Record<string, TemplatePhotoManifest> = {
  "warm-craft": { works: 6, items: 0, staff: 3, news: 0 },
  "trust-navy": { works: 6, items: 0, staff: 5, news: 0 },
  "clean-arch": { works: 6, items: 0, staff: 3, news: 0 },
  saveur: { works: 6, items: 12, staff: 3, news: 4 },
  velvet: { works: 6, items: 4, staff: 4, news: 0 },
  clarity: { works: 0, items: 0, staff: 6, news: 0 },
  credence: { works: 6, items: 0, staff: 3, news: 0 },
  beacon: { works: 0, items: 4, staff: 5, news: 0 },
  forge: { works: 6, items: 4, staff: 6, news: 0 },
  marche: { works: 6, items: 12, staff: 0, news: 1 },
};

const EMPTY: TemplatePhotoManifest = { works: 0, items: 0, staff: 0, news: 0 };

/** そのテンプレートの写真の枚数。知らない id でも落ちない */
export function photoManifestOf(templateId: string | undefined | null): TemplatePhotoManifest {
  return TEMPLATE_PHOTOS[toTemplateFamily(templateId)] ?? EMPTY;
}

/* ═══════════════════════════════════════
   URL を組み立てる
   ═══════════════════════════════════════ */

/** public からの道。テンプレート名は系統名（-mid / -pro を外したもの） */
function urlOf(templateId: string | undefined | null, file: string): string {
  return `/images/templates/${toTemplateFamily(templateId)}/${file}`;
}

/**
 * 1枚しかない写真の URL。
 * hero / scene-1 / scene-2 / owner / team はどのテンプレートにもある。
 */
export function templatePhoto(templateId: string | undefined | null, role: PhotoRole): string {
  return urlOf(templateId, `${role}.jpg`);
}

/**
 * 並びの n 件目（0 から数える）の写真の URL。
 * そのテンプレートに用意していない枚数を超えたら undefined（＝設計された絵のまま）。
 * 人の写真だけは 1 人目が owner.jpg（代表あいさつと同じ顔を使うため）。
 */
export function templateListPhoto(
  templateId: string | undefined | null,
  kind: PhotoListKind,
  index: number,
): string | undefined {
  if (!Number.isInteger(index) || index < 0) return undefined;
  const m = photoManifestOf(templateId);
  const count = kind === "work" ? m.works : kind === "item" ? m.items : kind === "staff" ? m.staff : m.news;
  if (index >= count) return undefined;
  if (kind === "staff") return index === 0 ? templatePhoto(templateId, "owner") : urlOf(templateId, `staff-${index + 1}.jpg`);
  return urlOf(templateId, `${kind}-${index + 1}.jpg`);
}

/** その写真の寸法（人だけ縦位置） */
export function photoSizeOf(kind: PhotoRole | PhotoListKind): PhotoSize {
  return kind === "owner" || kind === "staff" ? PORTRAIT : LANDSCAPE;
}

/* ═══════════════════════════════════════
   一覧（指示書づくり・確認用）
   ═══════════════════════════════════════ */

/** そのテンプレートに要る写真のファイル名一式（docs/PHOTO_BRIEF.md と同じ並び） */
export function templatePhotoFiles(templateId: string | undefined | null): string[] {
  const m = photoManifestOf(templateId);
  const files = ["hero.jpg", "scene-1.jpg", "scene-2.jpg", "owner.jpg", "team.jpg"];
  for (let i = 2; i <= m.staff; i++) files.push(`staff-${i}.jpg`);
  for (let i = 1; i <= m.works; i++) files.push(`work-${i}.jpg`);
  for (let i = 1; i <= m.items; i++) files.push(`item-${i}.jpg`);
  for (let i = 1; i <= m.news; i++) files.push(`news-${i}.jpg`);
  return files;
}
