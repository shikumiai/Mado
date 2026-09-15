/**
 * 公開したあと、次にやることを1つ決める。
 *
 * 考え方は docs/ONBOARDING_V1.md。
 * 公開した時点のサイトは業種見本の中身で埋まっている。そこから
 * 「自分の会社のもの」に変わったかどうかを、設定を読んで見分ける。
 *
 * 見分け方は印を持たせず突き合わせで行う。
 *   写真 … /images/templates/ の下を指していれば、まだ見本のもの
 *   文字 … その業種の見本と同じ文字なら、まだ見本のまま
 * site.config.json には判定用の項目を足さない。
 */

import type { SiteConfig } from "./site-config-schema";
import { sampleSectionData } from "./templates/sample-content";

/** テンプレートに付いてくる写真の置き場 */
const TEMPLATE_PHOTO_PREFIX = "/images/templates/";

/** 主役になる一覧と、画面に出すときの呼び方 */
const MAIN_LISTS: { key: string; label: string }[] = [
  { key: "projects", label: "施工実績" },
  { key: "menu", label: "お品書き" },
  { key: "staff", label: "スタッフ紹介" },
  { key: "cases", label: "解決事例" },
  { key: "voices", label: "お客様の声" },
  { key: "galleryItems", label: "ギャラリー" },
];

export interface OnboardingTask {
  id: "hero-photo" | "tagline" | "first-item" | "contact" | "rest-photos";
  /** 押したら何が起きるかが分かる一文 */
  title: string;
  /** なぜ先にやるのかの一言 */
  detail: string;
  done: boolean;
  /** 編集画面で光らせる場所。無ければ先頭から */
  anchor?: string;
}

export interface OnboardingState {
  tasks: OnboardingTask[];
  /** まだ終わっていないもののうち、いちばん上の1つ */
  next: OnboardingTask | null;
  done: number;
  total: number;
  /** すべて終わっているか */
  complete: boolean;
  /** まだ見本のままの写真の枚数 */
  templatePhotos: number;
}

/* ═══════════════════════════════════════
   見分ける道具
   ═══════════════════════════════════════ */

/** テンプレートに付いてきた写真か */
export function isTemplatePhoto(src: unknown): boolean {
  return typeof src === "string" && src.startsWith(TEMPLATE_PHOTO_PREFIX);
}

/** 設定の中に残っている、見本の写真の枚数を数える */
function countTemplatePhotos(value: unknown): number {
  if (typeof value === "string") return isTemplatePhoto(value) ? 1 : 0;
  if (Array.isArray(value)) return value.reduce<number>((n, v) => n + countTemplatePhotos(v), 0);
  if (value && typeof value === "object") {
    return Object.values(value).reduce<number>((n, v) => n + countTemplatePhotos(v), 0);
  }
  return 0;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** そのテンプレートの主役になる一覧を取り出す */
function mainList(config: SiteConfig): { label: string; items: Record<string, unknown>[] } | null {
  const bag = config as unknown as Record<string, unknown>;
  for (const { key, label } of MAIN_LISTS) {
    const value = bag[key];
    if (Array.isArray(value) && value.length > 0) {
      return { label, items: value as Record<string, unknown>[] };
    }
  }
  return null;
}

/** 一番上の大きな見出し（メインビジュアル）の設定 */
function heroData(config: SiteConfig): { data: Record<string, unknown>; anchor?: string } {
  const section = config.sections?.find((s) => s.type === "hero");
  return {
    data: (section?.data ?? {}) as Record<string, unknown>,
    anchor: section?.id,
  };
}

/* ═══════════════════════════════════════
   本体
   ═══════════════════════════════════════ */

/**
 * いまの設定から、やることの一覧と「次の1つ」を出す。
 * 並びは上から順に、直したときサイトの印象が大きく変わるもの。
 */
export function onboardingState(config: SiteConfig): OnboardingState {
  const hero = heroData(config);
  const heroSample = sampleSectionData(config.templateId, "hero") as Record<string, unknown>;
  const list = mainList(config);
  const templatePhotos = countTemplatePhotos(config);

  const heroPhotoDone = Boolean(hero.data.image) && !isTemplatePhoto(hero.data.image);

  const heroTitle = text(hero.data.title) || text(config.company.tagline);
  const taglineDone = heroTitle !== "" && heroTitle !== text(heroSample.title);

  // 一覧の中に、自分の写真が入ったものが1件でもあるか
  const firstItemDone = Boolean(
    list?.items.some((item) => Boolean(item.image) && !isTemplatePhoto(item.image)),
  );

  const contactDone = text(config.company.phone) !== "" && text(config.company.address) !== "";

  const tasks: OnboardingTask[] = [
    {
      id: "hero-photo",
      title: "一番上の写真を、自分のものに変える",
      detail: "開いて最初に目に入る1枚です。ここが変わるだけで自分の会社の顔になります。",
      done: heroPhotoDone,
      anchor: hero.anchor,
    },
    {
      id: "tagline",
      title: "キャッチコピーを自分の言葉にする",
      detail: "写真のすぐ下に出る一文です。何をしている会社かが伝わります。",
      done: taglineDone,
      anchor: hero.anchor,
    },
    {
      id: "first-item",
      title: `${list?.label ?? "実績"}を1件、自分のものにする`,
      detail: "1件でも本物が入ると、見ている人が問い合わせる理由になります。",
      done: firstItemDone,
    },
    {
      id: "contact",
      title: "電話番号と住所を入れる",
      detail: "連絡先が無いと、気に入っても連絡のしようがありません。",
      done: contactDone,
    },
    {
      id: "rest-photos",
      title: "残りの写真を入れ替える",
      detail:
        templatePhotos > 0
          ? `見本の写真があと${templatePhotos}枚あります。入れ替えると全部が自分のサイトになります。`
          : "写真はすべて自分のものに入れ替わっています。",
      done: templatePhotos === 0,
    },
  ];

  const done = tasks.filter((t) => t.done).length;

  return {
    tasks,
    next: tasks.find((t) => !t.done) ?? null,
    done,
    total: tasks.length,
    complete: done === tasks.length,
    templatePhotos,
  };
}
