/**
 * 業種の対応表（35業種 → 10テンプレート）。
 *
 * テンプレートは10系統しかない。けれど、お客さんは自分の商売の名前で探す。
 * 「パン屋」で探した人が「小売・店舗」のテンプレートにたどり着けるように、
 * 細かい業種名と、いちばん近いテンプレートの結びつきをここ1か所に書く。
 *
 * 構成・必須機能・初期色の正は src/lib/templates/catalog.ts。
 * このファイルは「どの商売がどのテンプレートに寄るか」だけを持つ。
 *
 * 申し込み画面（/start）は10テンプレートを主に見せ、
 * 見つからない人のために、ここの一覧から選べるようにしている。
 */

import { TEMPLATE_IDS, getTemplate } from "@/lib/templates/catalog";

/* ═══════════════════════════════════════
   型
   ═══════════════════════════════════════ */

export interface IndustryEntry {
  /** 業種の名前（申込の industry に入る値） */
  id: string;
  /** 画面に出す名前 */
  name: string;
  /** 寄せ先のテンプレート（catalog.ts の id） */
  templateId: string;
  /** どんなサイトになるか（一言） */
  note: string;
}

/* ═══════════════════════════════════════
   対応表
   ═══════════════════════════════════════ */

export const INDUSTRIES: IndustryEntry[] = [
  /* ─── 工務店・リフォーム（warm-craft） ─── */
  { id: "construction", name: "工務店・リフォーム", templateId: "warm-craft", note: "建てた家と、建てた人で選んでもらう" },
  { id: "exterior", name: "外構・造園", templateId: "warm-craft", note: "施工の前後を並べて見せる" },
  { id: "auto-repair", name: "自動車整備・板金", templateId: "warm-craft", note: "作業内容と料金を分かりやすく" },
  { id: "cleaning", name: "ハウスクリーニング・清掃", templateId: "warm-craft", note: "作業の様子と対応エリアを見せる" },

  /* ─── 建設会社（trust-navy） ─── */
  { id: "builder", name: "建設会社・土木", templateId: "trust-navy", note: "規模と実績を数字で示す" },
  { id: "plumbing", name: "電気・設備工事", templateId: "trust-navy", note: "事業内容と施工実績を並べる" },
  { id: "real-estate", name: "不動産", templateId: "trust-navy", note: "会社の姿と取扱物件を落ち着いて" },
  { id: "manufacturing", name: "製造・工場", templateId: "trust-navy", note: "設備と製品、会社概要をきちんと" },
  { id: "web-agency", name: "Web制作・システム開発", templateId: "trust-navy", note: "事業内容と制作実績を法人向けに" },

  /* ─── 設計事務所（clean-arch） ─── */
  { id: "architect", name: "設計事務所", templateId: "clean-arch", note: "作品と考え方だけで見せる" },
  { id: "photographer", name: "写真家・映像制作", templateId: "clean-arch", note: "作品を大きく、余白のまま" },
  { id: "designer", name: "デザイナー・イラストレーター", templateId: "clean-arch", note: "世界観を邪魔しない静かな並び" },
  { id: "freelance-engineer", name: "フリーランス（技術職）", templateId: "clean-arch", note: "実績と考え方を1枚で" },

  /* ─── 飲食店（saveur） ─── */
  { id: "restaurant", name: "レストラン・カフェ", templateId: "saveur", note: "品書きと店の空気で選ばれる" },
  { id: "izakaya", name: "居酒屋・バー", templateId: "saveur", note: "お品書きと営業時間を先に" },
  { id: "sushi", name: "寿司・割烹・和食", templateId: "saveur", note: "献立と席のご案内を静かに" },
  { id: "hotel", name: "ホテル・旅館・民泊", templateId: "saveur", note: "部屋とご予約、アクセスをまとめて" },

  /* ─── 美容・サロン（velvet） ─── */
  { id: "hair-salon", name: "美容室・理容室", templateId: "velvet", note: "料金と担当者が先に分かる" },
  { id: "nail-salon", name: "ネイル・まつげ", templateId: "velvet", note: "デザインとメニューを並べる" },
  { id: "esthetic", name: "エステ・脱毛", templateId: "velvet", note: "コースと料金、予約まで一本道" },
  { id: "pet-salon", name: "ペットサロン", templateId: "velvet", note: "仕上がりの写真とメニューで" },

  /* ─── 医療・クリニック（clarity） ─── */
  { id: "clinic", name: "クリニック・病院", templateId: "clarity", note: "診療時間と担当医が迷わず見つかる" },
  { id: "dental", name: "歯科医院", templateId: "clarity", note: "診療内容と受診の流れを丁寧に" },
  { id: "chiropractic", name: "整骨院・整体・鍼灸", templateId: "clarity", note: "施術内容と料金、予約まで" },
  { id: "veterinary", name: "動物病院", templateId: "clarity", note: "診療案内と診療時間をはっきり" },
  { id: "care", name: "介護・訪問看護", templateId: "clarity", note: "サービス内容と相談先を安心して読める形に" },

  /* ─── 士業（credence） ─── */
  { id: "tax-accountant", name: "税理士・会計事務所", templateId: "credence", note: "取扱分野と料金を先に出す" },
  { id: "lawyer", name: "弁護士・司法書士", templateId: "credence", note: "扱う分野と相談の流れを明快に" },
  { id: "administrative", name: "行政書士・社労士", templateId: "credence", note: "手続きの種類と費用を並べる" },
  { id: "consultant", name: "コンサルティング・コーチング", templateId: "credence", note: "実績と進め方で選んでもらう" },

  /* ─── 教育・スクール（beacon） ─── */
  { id: "cram-school", name: "学習塾・進学教室", templateId: "beacon", note: "コースと月謝と合格実績を並べる" },
  { id: "language-school", name: "英会話・語学教室", templateId: "beacon", note: "レッスンと講師、体験申込まで" },
  { id: "music-school", name: "音楽・アート教室", templateId: "beacon", note: "教室の様子とレッスン料を" },
  { id: "seminar", name: "セミナー講師・研修", templateId: "beacon", note: "内容と受講者の声で信じてもらう" },

  /* ─── フィットネス（forge） ─── */
  { id: "gym", name: "ジム・パーソナルトレーニング", templateId: "forge", note: "プログラムと担当と料金を一度に" },
  { id: "yoga", name: "ヨガ・ピラティス", templateId: "forge", note: "クラスと料金、体験申込まで" },
  { id: "dojo", name: "武道・スポーツ教室", templateId: "forge", note: "指導内容と入会の流れを" },

  /* ─── 小売・店舗（marche） ─── */
  { id: "retail", name: "雑貨・アパレル", templateId: "marche", note: "商品と入荷と地図で来店につなげる" },
  { id: "bakery", name: "パン屋・洋菓子・和菓子", templateId: "marche", note: "商品写真と焼き上がりのお知らせ" },
  { id: "flower-shop", name: "花屋", templateId: "marche", note: "季節の花と店内の様子を" },
  { id: "farm", name: "農園・直売所", templateId: "marche", note: "作り手の顔と旬の入荷を" },
  { id: "handmade", name: "ハンドメイド作家", templateId: "marche", note: "作品と取扱店、催しの案内を" },
];

/* ═══════════════════════════════════════
   引き当て
   ═══════════════════════════════════════ */

const BY_ID = new Map(INDUSTRIES.map((i) => [i.id, i]));

/** 業種の細目を1つ引く */
export function findIndustry(id: string | undefined | null): IndustryEntry | undefined {
  return id ? BY_ID.get(id) : undefined;
}

/** その業種に合うテンプレート。知らない業種なら null */
export function templateForIndustry(id: string | undefined | null): string | null {
  const entry = findIndustry(id);
  if (!entry) return null;
  return TEMPLATE_IDS.includes(entry.templateId) ? entry.templateId : null;
}

/** そのテンプレートに寄せている業種の一覧（申込画面の「こんな商売に」） */
export function industriesForTemplate(templateId: string): IndustryEntry[] {
  return INDUSTRIES.filter((i) => i.templateId === templateId);
}

/** そのテンプレートの代表的な業種名（カードに出す3〜4語） */
export function industryNamesFor(templateId: string, limit = 4): string[] {
  return industriesForTemplate(templateId)
    .slice(0, limit)
    .map((i) => i.name);
}

/** テンプレートごとにまとめた対応表（見出しはテンプレートの業種名） */
export function industriesByTemplate(): { templateId: string; label: string; items: IndustryEntry[] }[] {
  return TEMPLATE_IDS.map((id) => ({
    templateId: id,
    label: getTemplate(id)?.industry ?? id,
    items: industriesForTemplate(id),
  })).filter((g) => g.items.length > 0);
}
