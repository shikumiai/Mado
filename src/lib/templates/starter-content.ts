import { findIndustry } from "@/lib/industry-registry";
import { getTemplate, normalizeSectionType, toTemplateFamily } from "./catalog";

/** 顧客のひな形。架空のデモ企業の実績・価格・人物をコピーしない。 */
export function industryCopy(templateId?: string | null, industry?: string) {
  const family = toTemplateFamily(templateId);
  const entry = industry ? findIndustry(industry) : undefined;
  const name = entry?.name ?? getTemplate(family)?.industry ?? "事業";
  const defaults: Record<string, [string, string, string]> = {
    "warm-craft": ["サービス・対応内容", "仕事の紹介", "ご相談・ご依頼"],
    "trust-navy": ["事業・サービス", "実績・事例", "ご相談・お問い合わせ"],
    "clean-arch": ["サービス・料金", "作品・実績", "制作のご相談"],
    saveur: ["メニュー・プラン", "店内・サービス", "ご予約・お問い合わせ"],
    velvet: ["メニュー・料金", "サービスの紹介", "ご予約・ご相談"],
    clarity: ["診療・サービス案内", "施設のご案内", "ご利用の相談"],
    credence: ["相談分野・料金", "対応事例", "ご相談の受付"],
    beacon: ["コース・受講料", "教室・講座の紹介", "体験・受講のご相談"],
    forge: ["プログラム・料金", "施設・レッスン", "体験・入会のご相談"],
    marche: ["商品・サービス", "お店の紹介", "商品のお問い合わせ"],
  };
  const overrides: Record<string, [string, string, string]> = {
    hotel: ["客室・宿泊プラン", "館内・客室", "宿泊のご予約・お問い合わせ"],
    "auto-repair": ["整備メニュー・料金", "作業事例", "整備・点検のご相談"],
    cleaning: ["清掃メニュー・料金", "作業事例", "清掃のご相談"],
    "real-estate": ["取扱物件・サービス", "物件の紹介", "物件のご相談"],
    manufacturing: ["製品・加工内容", "製品・設備", "製造のご相談"],
    "web-agency": ["制作・開発サービス", "制作・開発実績", "制作・開発のご相談"],
    photographer: ["撮影プラン・料金", "写真・映像作品", "撮影のご相談"],
    designer: ["制作メニュー・料金", "デザイン・作品", "制作のご相談"],
    "freelance-engineer": ["対応分野・サービス", "開発・支援実績", "開発のご相談"],
    chiropractic: ["施術メニュー・料金", "院内のご案内", "施術のご相談"],
    care: ["サービス・ご利用案内", "施設・活動の紹介", "ご利用の相談"],
    veterinary: ["診療案内", "院内のご案内", "受診のお問い合わせ"],
    "pet-salon": ["お手入れメニュー・料金", "お手入れの紹介", "ご予約・ご相談"],
    bakery: ["パン・商品", "お店の紹介", "商品のお問い合わせ"],
    "flower-shop": ["花・ギフト", "制作例・店内", "ご注文の相談"],
    farm: ["農産物・商品", "農園の紹介", "商品のお問い合わせ"],
    handmade: ["作品・商品", "作品の紹介", "ご注文の相談"],
  };
  const [menu, works, booking] = overrides[industry ?? ""] ?? defaults[family] ?? defaults["trust-navy"];
  return { name, menu, works, booking };
}

export function starterSectionData(templateId: string | undefined | null, type: string, industry?: string): Record<string, unknown> {
  const p = industryCopy(templateId, industry);
  const t = normalizeSectionType(type);
  const contact = { label: "お問い合わせ", href: "#contact" };
  const heading: Record<string, string> = {
    hero: "メインビジュアル", strengths: "大切にしていること", services: p.menu,
    works: p.works, menu: p.menu, staff: "私たちについて", voices: "お客様の声",
    flow: "ご利用の流れ", faq: "よくあるご質問", news: "お知らせ", access: "アクセス・ご利用案内",
    booking: p.booking, contact: "お問い合わせ", company: "事業者情報",
  };
  const base = { heading: heading[t] ?? "ご案内", eyebrow: "", lead: "" };
  switch (t) {
    case "hero": return {
      title: `${p.name}を、もっと身近に。`, lead: "サービスの内容やご利用について、お気軽にお問い合わせください。",
      eyebrow: "", badge: "", facts: [], primaryCta: contact,
      secondaryCta: { label: "ご案内を見る", href: "#contact" },
    };
    case "strengths": return { ...base, items: [
      { title: "私たちの方針", description: "大切にしている考え方や、お客様への向き合い方をご紹介します。", icon: "Heart" },
      { title: "サービスについて", description: "ご要望に合う内容を見つけていただけるよう、サービスをご案内します。", icon: "Compass" },
    ] };
    case "services": return { ...base, items: [1, 2].map((n) => ({ title: `サービス ${n}`, description: "提供する内容・対象・対応範囲をご記入ください。", icon: "Briefcase" })) };
    case "works": return { ...base, items: [1, 2, 3].map((id) => ({ id, title: `${p.works} ${id}`, category: "ご紹介", description: "写真に合わせて内容や特徴をご記入ください。" })) };
    case "menu": return { ...base, note: "", items: [1, 2, 3].map((id) => ({ id, name: `${p.menu} ${id}`, category: "ご案内", price: "お問い合わせください", description: "内容・料金・ご利用条件をご記入ください。" })) };
    // 人物・実績数・口コミ・資格・予約枠は本人の入力まで作らない。
    case "staff": return { ...base, items: [] };
    case "voices": return { ...base, items: [], stats: [] };
    case "news": return { ...base, items: [] };
    case "flow": return { ...base, items: [
      { step: 1, title: "お問い合わせ", description: "ご希望や気になることをお聞かせください。", duration: "" },
      { step: 2, title: "内容のご案内", description: "内容・料金・進め方をご確認ください。", duration: "" },
      { step: 3, title: "お申し込み・ご利用", description: "ご案内した内容に沿ってお手続きください。", duration: "" },
    ] };
    case "faq": return { ...base, items: [{ q: "詳しい内容を知りたいのですが。", a: "お問い合わせ窓口から、ご希望の内容をお知らせください。", category: "ご利用について" }] };
    case "booking": return { ...base, note: "", items: [], purposes: ["予約の相談", "利用方法について", "その他"], primaryCta: contact };
    case "contact": return { ...base, lead: "ご不明な点やご相談はこちらからお寄せください。", purposes: ["サービスについて", "ご利用の相談", "その他"], primaryCta: contact };
    case "access": return { ...base, ways: [], note: "" };
    case "company": return { ...base, messageHeading: "ごあいさつ", message: "", history: [] };
    default: return base;
  }
}

/** Catalog-only examples show the layout. These records are never added to a customer's site. */
export function sectionPreviewData(templateId: string | undefined | null, type: string, industry?: string): Record<string, unknown> {
  const data = starterSectionData(templateId, type, industry);
  const samples: Record<string, object[]> = {
    staff: [1, 2, 3].map(id => ({ id, name: "氏名の見本", role: "担当・肩書き", bio: "この場所に紹介文が入ります。" })),
    voices: [{ name: "お名前の見本", text: "いただいた声をこの場所に紹介します。", project: "ご利用内容" }],
    news: [{ id: 1, title: "お知らせの見出し", date: "日付", excerpt: "お知らせの概要が入ります。" }],
    booking: [{ title: "予約枠の見本", date: "開催日", time: "開催時間", spots: 1 }],
  };
  if (samples[type]) data.items = samples[type];
  if (type === "voices") data.stats = [{ num: "—", unit: "", label: "実績を表示する場所" }];
  return data;
}
