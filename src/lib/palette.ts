/**
 * 色エンジン — 代表カラー（＋サブ最大2色）から、テンプレートが使う色を全部作る。
 *
 * ねらいはひとつ。「お客さんが選んだ色が、サイト全体に同じ考え方で行き渡る」こと。
 * 見出しの濃さも、地の色も、線も、影も、SVGの絵も、ここで作った1組の色から出す。
 * だから色をひとつ変えるだけで、サイト全体が同じ雰囲気のまま塗り替わる。
 *
 * 使う側の入口:
 *   - resolveBrand(brand, templateId) … 保存された色 or テンプレートの初期色を決める
 *   - buildPalette(brand)             … 色一式を作る
 *   - paletteToCssVars(palette)       … --tpl-* の CSS 変数に変換する
 *
 * 文字色はコントラストを計算してから返す（WCAG の相対輝度）。
 * 代表カラーそのものは書き換えない。上に載る文字の方を明るく／濃くして合わせる。
 */

/* ═══════════════════════════════════════
   型
   ═══════════════════════════════════════ */

/** お客さんが選ぶ色。サブは最大2つ・省略できる */
export interface BrandColors {
  primary: string;
  sub1?: string;
  sub2?: string;
}

/** テンプレートが使う色一式 */
export interface Palette {
  /** 入力（正規化済み） */
  brand: Required<BrandColors>;

  /* 代表カラー */
  primary: string;
  primaryStrong: string;   // 少し濃い（ボタンのホバー）
  primaryLift: string;     // 少し明るい（濃地の上の面）
  primaryDeep: string;     // 濃地（ヘッダー・帯の地）
  primarySoft: string;     // ごく淡い（バッジ・アイコンの丸）
  primaryTint: string;     // 淡い（濃地の上の小さな文字・SVGの面）
  onPrimary: string;       // 代表カラーの上に置く文字
  primaryVeil: string;     // 半透明（重ねの帯）
  primaryDeepVeil: string; // 濃地の半透明（すりガラスのヘッダー）

  /* サブカラー */
  sub1: string;
  sub1Hover: string;
  sub1Soft: string;
  sub1Line: string;        // 半透明の細線
  sub1LineSoft: string;
  onSub1: string;
  sub2: string;
  sub2Soft: string;
  onSub2: string;

  /* 文字 */
  ink: string;             // 見出し
  ink2: string;            // 本文
  ink3: string;            // 補助・日付
  inkSoft: string;         // 装飾の中間色
  inkDeep: string;         // 濃地（フッター・問い合わせ）

  /* 濃地の上に置くもの */
  onDark: string;
  onDark2: string;
  onDark3: string;
  onDark4: string;
  onDarkFill: string;
  onDarkFill2: string;
  onDarkLine: string;
  onDarkField: string;

  /* 地と面 */
  bg: string;
  bgDeep: string;
  bgVeil: string;
  surface: string;
  surfaceVeil: string;
  line: string;
  lineStrong: string;
  mutedFill: string;

  /* 影 */
  shadowWeak: string;
  shadowMid: string;
  shadowStrong: string;

  /* 窓あかり（SVGの灯り） */
  glow1: string;
  glow2: string;

  /* 装飾のトーン（屋根・面の描き分け） */
  tones: string[];
  /** 石・素材の淡い2色組（ミニマル系テンプレの絵） */
  stonePairs: [string, string][];
}

/* ═══════════════════════════════════════
   色の計算（hex ⇄ RGB ⇄ HSL・相対輝度・コントラスト）
   ═══════════════════════════════════════ */

interface RGB { r: number; g: number; b: number }
interface HSL { h: number; s: number; l: number }

const HEX_RE = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** "#abc" / "abcdef" / " #ABCDEF " などを "#AABBCC" に揃える。だめなら null */
export function normalizeHex(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const m = HEX_RE.exec(input.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return "#" + h.toUpperCase();
}

/** 使える色か */
export function isValidHex(input: unknown): boolean {
  return normalizeHex(input) !== null;
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

function hexToRgb(hex: string): RGB {
  const h = normalizeHex(hex) || "#000000";
  return {
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  const to = (v: number) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0").toUpperCase();
  return "#" + to(r) + to(g) + to(b);
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return { h, s, l };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const hh = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (hh < 60) { r = c; g = x; }
  else if (hh < 120) { r = x; g = c; }
  else if (hh < 180) { g = c; b = x; }
  else if (hh < 240) { g = x; b = c; }
  else if (hh < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

function hsl(h: number, s: number, l: number): string {
  return rgbToHex(hslToRgb({ h, s: clamp(s, 0, 1), l: clamp(l, 0, 1) }));
}

/** WCAG の相対輝度（0=黒 〜 1=白） */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** 2色のコントラスト比（1〜21。AA は本文4.5・大きい文字3.0） */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/** a に b を t（0〜1）だけ混ぜる */
function mix(a: string, b: string, t: number): string {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  const k = clamp(t, 0, 1);
  return rgbToHex({
    r: ra.r + (rb.r - ra.r) * k,
    g: ra.g + (rb.g - ra.g) * k,
    b: ra.b + (rb.b - ra.b) * k,
  });
}

function darken(hex: string, amount: number): string {
  const c = rgbToHsl(hexToRgb(hex));
  return hsl(c.h, c.s, c.l - amount);
}

function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${clamp(alpha, 0, 1)})`;
}

/**
 * 背景の上で必要なコントラストになるまで、文字色の明るさだけを動かす。
 * もともと背景より濃ければさらに濃く、薄ければさらに薄くする（色みは変えない）。
 * その向きで届かなければ逆向きも試し、それでも足りなければ黒か白まで振り切る。
 */
function ensureContrast(fg: string, bg: string, target: number): string {
  if (contrastRatio(fg, bg) >= target) return fg;
  const c = rgbToHsl(hexToRgb(fg));
  const darkerFirst = relativeLuminance(fg) <= relativeLuminance(bg);
  for (const dir of darkerFirst ? [-1, 1] : [1, -1]) {
    for (let i = 1; i <= 100; i++) {
      const l = c.l + dir * i * 0.01;
      if (l < 0 || l > 1) break;
      const next = hsl(c.h, c.s, l);
      if (contrastRatio(next, bg) >= target) return next;
    }
  }
  return contrastRatio("#000000", bg) >= contrastRatio("#FFFFFF", bg) ? "#000000" : "#FFFFFF";
}

/**
 * その色の上に置く文字色を決める。
 * 白と「濃い方の候補」を比べて有利な方を採り、濃い方を選んだ時は AA まで押し込む。
 */
function pickOn(base: string, darkCandidate: string): string {
  const white = contrastRatio("#FFFFFF", base);
  const dark = contrastRatio(darkCandidate, base);
  if (white >= dark) return "#FFFFFF";
  return ensureContrast(darkCandidate, base, 4.5);
}

/**
 * 彩度を調整する。もとが無彩色（黒・白・グレー）なら無彩色のまま返す。
 * 下限を機械的に当てると、グレーを選んだ人の画面にうっすら色が乗ってしまうため。
 */
function satOf(s: number, scale: number, min: number, max: number): number {
  if (s < 0.04) return 0;
  return clamp(s * scale, min, max);
}

/* ═══════════════════════════════════════
   色一式を作る
   ═══════════════════════════════════════ */

const FALLBACK_PRIMARY = "#C05A2E";

export function buildPalette(input: BrandColors): Palette {
  const primary = normalizeHex(input.primary) || FALLBACK_PRIMARY;
  const p = rgbToHsl(hexToRgb(primary));

  // サブが未指定なら、代表カラーから少しだけ回した「なじむ色」を作る
  const sub1 =
    normalizeHex(input.sub1) ||
    hsl(p.h + 28, satOf(p.s, 0.92, 0.12, 0.8), clamp(p.l + 0.06, 0.34, 0.64));
  const sub2 =
    normalizeHex(input.sub2) ||
    hsl(p.h - 26, satOf(p.s, 0.7, 0.08, 0.7), clamp(p.l + 0.16, 0.4, 0.72));

  const s1 = rgbToHsl(hexToRgb(sub1));
  const s2 = rgbToHsl(hexToRgb(sub2));

  /* 地と面：代表カラーをわずかに含む中性色。明るさで段を作る */
  const surface = hsl(p.h, p.s * 0.75, 0.988);
  const bg = hsl(p.h, p.s * 0.92, 0.962);
  const bgDeep = hsl(p.h, p.s * 0.82, 0.905);
  const line = hsl(p.h, p.s * 0.55, 0.9);
  const lineStrong = hsl(p.h, p.s * 0.5, 0.82);
  const mutedFill = hsl(p.h, p.s * 0.35, 0.76);

  /* 文字：代表カラーの色みを残しつつ、地の上で AA を満たすまで濃くする */
  const ink = ensureContrast(hsl(p.h, satOf(p.s, 0.72, 0.06, 0.46), 0.19), bg, 7);
  const ink2 = ensureContrast(hsl(p.h, satOf(p.s, 0.42, 0.05, 0.3), 0.4), bg, 4.5);
  const ink3 = ensureContrast(hsl(p.h, satOf(p.s, 0.3, 0.03, 0.22), 0.55), bg, 3);
  const inkSoft = ensureContrast(hsl(p.h, satOf(p.s, 0.34, 0.04, 0.26), 0.47), bg, 2.6);
  const inkDeep = darken(ink, 0.05);

  /* 代表カラーの派生 */
  const primaryStrong = hsl(p.h, p.s, Math.max(p.l - 0.09, 0.05));
  const primaryLift = hsl(p.h, p.s, clamp(p.l + 0.1, 0.12, 0.74));
  const primaryDeep = hsl(p.h, clamp(p.s * 1.05, 0, 1), clamp(Math.min(p.l * 0.62, 0.16), 0.05, 0.18));
  const primarySoft = hsl(p.h, p.s * 0.75, 0.9);
  const primaryTint = hsl(p.h, p.s * 0.8, 0.8);

  return {
    brand: { primary, sub1, sub2 },

    primary,
    primaryStrong,
    primaryLift,
    primaryDeep,
    primarySoft,
    primaryTint,
    onPrimary: pickOn(primary, ink),
    primaryVeil: rgba(primary, 0.45),
    primaryDeepVeil: rgba(primaryDeep, 0.9),

    sub1,
    sub1Hover: hsl(s1.h, s1.s, clamp(s1.l + 0.08, 0.1, 0.86)),
    sub1Soft: hsl(s1.h, s1.s * 0.75, 0.9),
    sub1Line: rgba(sub1, 0.4),
    sub1LineSoft: rgba(sub1, 0.2),
    onSub1: pickOn(sub1, ink),
    sub2,
    sub2Soft: hsl(s2.h, s2.s * 0.75, 0.9),
    onSub2: pickOn(sub2, ink),

    ink,
    ink2,
    ink3,
    inkSoft,
    inkDeep,

    onDark: "#FFFFFF",
    onDark2: "rgba(255, 255, 255, 0.72)",
    onDark3: "rgba(255, 255, 255, 0.55)",
    onDark4: "rgba(255, 255, 255, 0.34)",
    onDarkFill: "rgba(255, 255, 255, 0.06)",
    onDarkFill2: "rgba(255, 255, 255, 0.14)",
    onDarkLine: "rgba(255, 255, 255, 0.18)",
    onDarkField: "rgba(255, 255, 255, 0.95)",

    bg,
    bgDeep,
    bgVeil: rgba(bg, 0.92),
    surface,
    surfaceVeil: rgba(surface, 0.94),
    line,
    lineStrong,
    mutedFill,

    shadowWeak: rgba(ink, 0.06),
    shadowMid: rgba(ink, 0.1),
    shadowStrong: rgba(ink, 0.16),

    glow1: hsl(s1.h, satOf(s1.s, 2.2, 0.35, 0.95), 0.82),
    glow2: hsl(s1.h, satOf(s1.s, 2, 0.32, 0.9), 0.64),

    tones: [primary, darken(primary, 0.07), sub1, mix(primary, sub2, 0.45)],

    stonePairs: Array.from({ length: 8 }, (_, i): [string, string] => {
      const drift = ((i % 4) - 1.5) * 0.018;
      return [
        hsl(s1.h, satOf(s1.s, 1, 0.03, 0.3), 0.845 + drift),
        hsl(s1.h, satOf(s1.s, 1.15, 0.03, 0.34), 0.745 + drift),
      ];
    }),
  };
}

/* ═══════════════════════════════════════
   CSS 変数へ
   ═══════════════════════════════════════ */

/** テンプレートのルート要素に流し込む --tpl-* 一式 */
export function paletteToCssVars(p: Palette): Record<string, string> {
  return {
    "--tpl-primary": p.primary,
    "--tpl-primary-strong": p.primaryStrong,
    "--tpl-primary-lift": p.primaryLift,
    "--tpl-primary-deep": p.primaryDeep,
    "--tpl-primary-soft": p.primarySoft,
    "--tpl-primary-tint": p.primaryTint,
    "--tpl-on-primary": p.onPrimary,
    "--tpl-primary-veil": p.primaryVeil,
    "--tpl-primary-deep-veil": p.primaryDeepVeil,

    "--tpl-sub1": p.sub1,
    "--tpl-sub1-hover": p.sub1Hover,
    "--tpl-sub1-soft": p.sub1Soft,
    "--tpl-sub1-line": p.sub1Line,
    "--tpl-sub1-line-soft": p.sub1LineSoft,
    "--tpl-on-sub1": p.onSub1,
    "--tpl-sub2": p.sub2,
    "--tpl-sub2-soft": p.sub2Soft,
    "--tpl-on-sub2": p.onSub2,

    "--tpl-ink": p.ink,
    "--tpl-ink2": p.ink2,
    "--tpl-ink3": p.ink3,
    "--tpl-ink-soft": p.inkSoft,
    "--tpl-ink-deep": p.inkDeep,

    "--tpl-on-dark": p.onDark,
    "--tpl-on-dark-2": p.onDark2,
    "--tpl-on-dark-3": p.onDark3,
    "--tpl-on-dark-4": p.onDark4,
    "--tpl-on-dark-fill": p.onDarkFill,
    "--tpl-on-dark-fill-2": p.onDarkFill2,
    "--tpl-on-dark-line": p.onDarkLine,
    "--tpl-on-dark-field": p.onDarkField,

    "--tpl-bg": p.bg,
    "--tpl-bg-deep": p.bgDeep,
    "--tpl-bg-veil": p.bgVeil,
    "--tpl-surface": p.surface,
    "--tpl-surface-veil": p.surfaceVeil,
    "--tpl-line": p.line,
    "--tpl-line-strong": p.lineStrong,
    "--tpl-muted-fill": p.mutedFill,

    "--tpl-shadow-weak": p.shadowWeak,
    "--tpl-shadow-mid": p.shadowMid,
    "--tpl-shadow-strong": p.shadowStrong,

    "--tpl-glow-1": p.glow1,
    "--tpl-glow-2": p.glow2,

    "--tpl-tone-1": p.tones[0],
    "--tpl-tone-2": p.tones[1],
    "--tpl-tone-3": p.tones[2],
    "--tpl-tone-4": p.tones[3],
  };
}

/* ═══════════════════════════════════════
   テンプレートの初期色（お客さんが色を選んでいないときはこれ）
   ═══════════════════════════════════════ */

export const TEMPLATE_BRAND_PRESETS: Record<string, BrandColors> = {
  "warm-craft": { primary: "#BE5F38", sub1: "#A9764C", sub2: "#C77A46" },
  "trust-navy": { primary: "#1B3A5C", sub1: "#C8A96E", sub2: "#5C82AE" },
  "clean-arch": { primary: "#2B2B2B", sub1: "#C3BCAD", sub2: "#D8D3C8" },
};

/** warm-craft-pro → warm-craft のように系統名へ丸める */
export function toTemplateFamilyId(templateId: string | undefined | null): string {
  return (templateId || "warm-craft").replace(/-(?:mid|pro)$/, "");
}

/** そのテンプレートの初期色 */
export function presetBrand(templateId: string | undefined | null): BrandColors {
  return (
    TEMPLATE_BRAND_PRESETS[toTemplateFamilyId(templateId)] || TEMPLATE_BRAND_PRESETS["warm-craft"]
  );
}

/**
 * 色があればそれを、無ければテンプレートの初期色を返す。
 * 古い config（色の項目が無い）でも必ず動く。
 */
export function resolveBrand(
  brand: Partial<BrandColors> | undefined | null,
  templateId?: string | null,
): BrandColors {
  const primary = normalizeHex(brand?.primary);
  if (!primary) return presetBrand(templateId);
  return {
    primary,
    sub1: normalizeHex(brand?.sub1) || undefined,
    sub2: normalizeHex(brand?.sub2) || undefined,
  };
}

/* ═══════════════════════════════════════
   URL のクエリ ⇄ 色
   ═══════════════════════════════════════ */

type QueryLike = Record<string, string | string[] | undefined>;

function firstValue(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** ?primary=&sub1=&sub2= を読む。primary が無ければ null */
export function brandFromQuery(
  query: QueryLike | URLSearchParams | null | undefined,
): BrandColors | null {
  if (!query) return null;
  const get = (key: string): string | undefined =>
    query instanceof URLSearchParams ? query.get(key) ?? undefined : firstValue(query[key]);
  const primary = normalizeHex(get("primary"));
  if (!primary) return null;
  return {
    primary,
    sub1: normalizeHex(get("sub1")) || undefined,
    sub2: normalizeHex(get("sub2")) || undefined,
  };
}

/** 色を "primary=C05A2E&sub1=..." の形にする（# は付けない）。色が無ければ空文字 */
export function brandToQuery(brand: Partial<BrandColors> | null | undefined): string {
  const primary = normalizeHex(brand?.primary);
  if (!primary) return "";
  const parts = [`primary=${primary.slice(1)}`];
  const sub1 = normalizeHex(brand?.sub1);
  const sub2 = normalizeHex(brand?.sub2);
  if (sub1) parts.push(`sub1=${sub1.slice(1)}`);
  if (sub2) parts.push(`sub2=${sub2.slice(1)}`);
  return parts.join("&");
}

/** テンプレートのプレビューURL（色つき） */
export function templatePreviewUrl(
  templateId: string,
  brand?: Partial<BrandColors> | null,
): string {
  const q = brandToQuery(brand);
  return `/portfolio-templates/${templateId}${q ? `?${q}` : ""}`;
}

/* ═══════════════════════════════════════
   選びやすい色の組（申し込み画面のプリセット）
   ═══════════════════════════════════════ */

export interface ColorSet {
  id: string;
  /** 表示名（平易な日本語） */
  name: string;
  /** どんな商売に向くか */
  forWho: string;
  primary: string;
  sub1: string;
  sub2: string;
}

export const COLOR_SETS: ColorSet[] = [
  { id: "kinoyu", name: "木のぬくもり", forWho: "工務店・リフォーム", primary: "#C05A2E", sub1: "#A9764C", sub2: "#7E8B6D" },
  { id: "navy", name: "信頼のネイビー", forWho: "建設・設備", primary: "#1F3F66", sub1: "#C8A96E", sub2: "#5C82AE" },
  { id: "sumi", name: "落ち着いた墨", forWho: "設計・写真・工芸", primary: "#2B2B2B", sub1: "#C3BCAD", sub2: "#8A8A84" },
  { id: "midori", name: "深い緑", forWho: "造園・農業・和食", primary: "#2F5D46", sub1: "#C2A15B", sub2: "#7FA88C" },
  { id: "shu", name: "あたたかい朱", forWho: "飲食・和菓子", primary: "#B23A2E", sub1: "#D9A441", sub2: "#7A5C3E" },
  { id: "hidamari", name: "陽だまりのオレンジ", forWho: "教室・保育・地域の店", primary: "#DD8226", sub1: "#C7542C", sub2: "#8C6239" },
  { id: "mizu", name: "澄んだ青", forWho: "医療・クリニック・清掃", primary: "#2E7D8C", sub1: "#6FB3BF", sub2: "#C6A15B" },
  { id: "wine", name: "上品なワイン", forWho: "美容・サロン", primary: "#7A2E45", sub1: "#C08A6A", sub2: "#A8899B" },
  { id: "haiiro", name: "都会のグレー", forWho: "IT・コンサル・士業", primary: "#3A4652", sub1: "#C9A227", sub2: "#7B8794" },
  { id: "wakakusa", name: "若草", forWho: "学習塾・スポーツ", primary: "#4C7A34", sub1: "#C8A02E", sub2: "#7FA65C" },
  { id: "tsuchi", name: "砂と土", forWho: "雑貨・パン・手仕事", primary: "#9A6A3C", sub1: "#C9A16B", sub2: "#6E7A5E" },
  { id: "ai", name: "夜明けの藍", forWho: "不動産・行政書士", primary: "#26426E", sub1: "#B98A4B", sub2: "#6A82A8" },
];
