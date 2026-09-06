"use client";

/**
 * 部品づくりの共通道具。
 *
 * ・Styles … 変種ごとの CSS を1回だけ入れる（同じ href は React がまとめてくれる）
 * ・BASE_CSS … どの変種でも使う土台（余白・見出し・ボタン・枠・フォーカス）
 * ・F … 編集モードで「ここは直せる」枠を出すラッパー
 * ・Head 系 … 見出しの組み方3種
 * ・Media … 写真があれば写真、無ければ設計された絵を出す枠
 *
 * 色は全部 var(--tpl-*)。生の色コードはここにも部品にも書かない。
 */

import { createContext, useContext, type ReactNode } from "react";
import {
  Award, BadgeCheck, Briefcase, Building2, Check, Clock, Coffee, Compass,
  Dumbbell, GraduationCap, Hammer, HardHat, Heart, Home, Leaf, MapPin,
  PenTool, Phone, Ruler, Scale, Scissors, Shield, ShoppingBag, Sparkles,
  Stethoscope, Sun, TrendingUp, Users, Utensils, Wrench,
} from "lucide-react";
import type { EditProps, FieldType } from "./types";

/* ═══════════════════════════════════════
   CSS の入れ方
   ═══════════════════════════════════════ */

/** 同じ id の CSS は1回しか入らない（React が href でまとめる） */
export function Styles({ id, css }: { id: string; css: string }) {
  return (
    <style href={`mado-section-${id}`} precedence="mado-sections">
      {css}
    </style>
  );
}

export const BASE_CSS = `
.ms { position: relative; box-sizing: border-box; padding: clamp(56px, 8vw, 104px) clamp(18px, 4vw, 28px);
  font-family: var(--font-sans), "Noto Sans JP", system-ui, sans-serif; color: var(--tpl-ink2);
  background: var(--tpl-bg); }
.ms *, .ms *::before, .ms *::after { box-sizing: border-box; }
.ms a { color: inherit; text-decoration: none; }
.ms :focus-visible { outline: 2px solid var(--tpl-primary); outline-offset: 3px; border-radius: 3px; }
.ms img { max-width: 100%; }
.ms p { margin: 0; }

.ms-wrap { max-width: 1140px; margin: 0 auto; }
.ms-wrap-mid { max-width: 900px; margin: 0 auto; }
.ms-wrap-narrow { max-width: 680px; margin: 0 auto; }

.ms-serif { font-family: var(--font-serif), "Zen Old Mincho", "Yu Mincho", serif;
  letter-spacing: -0.015em; font-feature-settings: "palt" 1; font-weight: 600; }
.ms-eyebrow { font-size: 11px; letter-spacing: 0.3em; font-weight: 700; color: var(--tpl-primary); margin: 0 0 12px; }
.ms-h2 { font-size: clamp(1.5rem, 3.4vw, 2.3rem); line-height: 1.25; color: var(--tpl-ink); margin: 0; }
.ms-h3 { font-size: 17px; line-height: 1.45; color: var(--tpl-ink); margin: 0; font-weight: 700; }
.ms-lead { font-size: 15px; line-height: 2; color: var(--tpl-ink2); margin: 16px 0 0; max-width: 60ch; }
.ms-body { font-size: 14px; line-height: 1.95; color: var(--tpl-ink2); }
.ms-note { font-size: 12px; line-height: 1.8; color: var(--tpl-ink3); }
.ms-num { font-variant-numeric: tabular-nums; }

.ms-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 26px; border-radius: 6px;
  font-size: 14px; font-weight: 700; border: 1px solid transparent; cursor: pointer; font-family: inherit;
  transition: background 0.2s, color 0.2s, border-color 0.2s, gap 0.2s; }
.ms-btn-fill { background: var(--tpl-primary); color: var(--tpl-on-primary); }
.ms-btn-fill:hover { background: var(--tpl-primary-strong); }
.ms-btn-line { border-color: var(--tpl-line-strong); color: var(--tpl-ink); background: transparent; }
.ms-btn-line:hover { border-color: var(--tpl-primary); color: var(--tpl-primary); }
.ms-btn-text { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700;
  color: var(--tpl-primary); background: none; border: 0; padding: 0; cursor: pointer; font-family: inherit;
  transition: gap 0.2s; }
.ms-btn-text:hover { gap: 10px; }

.ms-chip { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.04em;
  padding: 4px 10px; background: var(--tpl-bg-deep); color: var(--tpl-primary); border-radius: 3px; }
.ms-chip-line { background: transparent; border: 1px solid var(--tpl-line-strong); color: var(--tpl-ink3); }

.ms-frame { position: relative; overflow: hidden; background: var(--tpl-bg-deep); border-radius: 6px; }
.ms-frame > img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ms-frame > svg { width: 100%; height: 100%; display: block; }

.ms-mono { display: inline-flex; align-items: center; justify-content: center;
  border-radius: 50%; background: var(--tpl-bg-deep); border: 1px solid var(--tpl-sub1-line);
  color: var(--tpl-primary); font-weight: 700; flex: none; }

.ms-rule { height: 1px; background: var(--tpl-line); border: 0; margin: 0; }

.ms-head { margin-bottom: clamp(32px, 5vw, 52px); }
.ms-head-c { text-align: center; }
.ms-head-c .ms-lead { margin-left: auto; margin-right: auto; }
.ms-head-rule { display: flex; align-items: flex-end; gap: 20px; margin-bottom: clamp(32px, 5vw, 52px); }
.ms-head-rule-line { flex: 1; height: 1px; background: var(--tpl-line-strong); margin-bottom: 10px; }
.ms-head-split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 32px;
  align-items: end; margin-bottom: clamp(32px, 5vw, 52px); }
.ms-head-split .ms-lead { margin-top: 0; }

.ms-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.ms-table th, .ms-table td { text-align: left; padding: 14px 16px; line-height: 1.85;
  border-bottom: 1px solid var(--tpl-line); vertical-align: top; }
.ms-table th { width: 8.5em; font-weight: 600; color: var(--tpl-ink); background: var(--tpl-bg-deep);
  white-space: nowrap; }
.ms-table td { color: var(--tpl-ink2); }
.ms-table tr:last-child th, .ms-table tr:last-child td { border-bottom: 0; }

.ms-field { display: block; margin-bottom: 14px; }
.ms-field > span { display: block; font-size: 12px; font-weight: 700; color: var(--tpl-ink2);
  margin-bottom: 6px; letter-spacing: 0.04em; }
.ms-req { color: var(--tpl-primary); margin-left: 5px; font-size: 11px; font-style: normal; }
.ms-input, .ms-textarea, .ms-select { width: 100%; font-family: inherit; font-size: 14.5px;
  color: var(--tpl-ink); background: var(--tpl-surface); border: 1px solid var(--tpl-line-strong);
  border-radius: 5px; padding: 12px 14px; transition: border-color 0.2s, box-shadow 0.2s; }
.ms-input:focus, .ms-textarea:focus, .ms-select:focus { outline: none; border-color: var(--tpl-primary);
  box-shadow: 0 0 0 3px var(--tpl-primary-soft); }
.ms-textarea { min-height: 130px; resize: vertical; line-height: 1.8; }
.ms-select { appearance: none; cursor: pointer; }
.ms-form-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 16px; }
.ms-form-msg { margin-top: 14px; font-size: 13px; line-height: 1.8; padding: 12px 14px;
  border-radius: 5px; border: 1px solid var(--tpl-line-strong); background: var(--tpl-bg-deep);
  color: var(--tpl-ink2); }
.ms-form-msg-ok { border-color: var(--tpl-primary); background: var(--tpl-primary-soft);
  color: var(--tpl-ink); }
.ms-demo { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 700;
  color: var(--tpl-ink3); border: 1px dashed var(--tpl-line-strong); border-radius: 4px;
  padding: 6px 10px; }
@media (max-width: 640px) { .ms-form-row { grid-template-columns: 1fr; } }

.ms-dlink { display: block; color: inherit; transition: color 0.2s; }
a.ms-dlink:hover { color: var(--tpl-primary); }
.ms-more { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700;
  color: var(--tpl-primary); transition: gap 0.2s; }
a.ms-dlink:hover .ms-more { gap: 10px; }

.ms-edit { cursor: pointer; position: relative; border-radius: 4px; outline: 1px dashed transparent;
  transition: outline-color 0.15s; }
.ms-edit:hover { outline-color: var(--tpl-sub1); }
.ms-edit-on { outline: 2px solid var(--tpl-primary); }
.ms-edit-mark { position: absolute; top: -7px; right: -7px; z-index: 5; width: 16px; height: 16px;
  border-radius: 50%; background: var(--tpl-primary); color: var(--tpl-on-primary);
  display: flex; align-items: center; justify-content: center; }

@media (max-width: 880px) {
  .ms-head-split { grid-template-columns: 1fr; align-items: start; gap: 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .ms *, .ms *::before, .ms *::after { transition: none !important; animation: none !important;
    scroll-behavior: auto !important; }
}
`;

/** 土台の CSS。どの変種でも先頭に置く */
export function Base() {
  return <Styles id="base" css={BASE_CSS} />;
}

/* ═══════════════════════════════════════
   編集モードのラッパー
   ═══════════════════════════════════════ */

/** data-field-id を組み立てる（"sections.2" + items.0.title） */
export function fieldIdOf(base: string | undefined, at: (string | number)[]): string {
  return [base, ...at].filter((v) => v !== undefined && v !== "").join(".");
}

/** 直せる項目を包む。編集モードでないときは何も足さない（本番の見た目は変わらない） */
export function F({
  p, at, v, type = "text", children,
}: {
  p: EditProps;
  at: (string | number)[];
  v: string;
  type?: FieldType;
  children: ReactNode;
}) {
  if (!p.editMode) return <>{children}</>;
  const id = fieldIdOf(p.fieldPath, at);
  const changed = p.changedFields?.has(id);
  return (
    <div
      data-field-id={id}
      className={`ms-edit${changed ? " ms-edit-on" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        p.onFieldClick?.(id, v, type);
      }}
    >
      {changed && (
        <span className="ms-edit-mark">
          <Check size={9} strokeWidth={3} />
        </span>
      )}
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════
   見出しの組み方
   ═══════════════════════════════════════ */

/** 積み上げ（英字の小見出し → 明朝の大見出し → リード） */
export function HeadStack({
  p, eyebrow, heading, lead, center = false,
}: {
  p: EditProps;
  eyebrow?: string;
  heading: string;
  lead?: string;
  center?: boolean;
}) {
  return (
    <div className={`ms-head${center ? " ms-head-c" : ""}`}>
      {eyebrow && <p className="ms-eyebrow">{eyebrow}</p>}
      <F p={p} at={["heading"]} v={heading}>
        <h2 className="ms-h2 ms-serif">{heading}</h2>
      </F>
      {lead && (
        <F p={p} at={["lead"]} v={lead}>
          <p className="ms-lead">{lead}</p>
        </F>
      )}
    </div>
  );
}

/** 見出しの右へ罫が伸びる（誌面・一覧向き） */
export function HeadRule({
  p, eyebrow, heading, right,
}: {
  p: EditProps;
  eyebrow?: string;
  heading: string;
  right?: ReactNode;
}) {
  return (
    <div className="ms-head-rule">
      <div>
        {eyebrow && <p className="ms-eyebrow">{eyebrow}</p>}
        <F p={p} at={["heading"]} v={heading}>
          <h2 className="ms-h2 ms-serif">{heading}</h2>
        </F>
      </div>
      <span className="ms-head-rule-line" />
      {right}
    </div>
  );
}

/** 左に見出し・右にリード（密度のある機能向き） */
export function HeadSplit({
  p, eyebrow, heading, lead,
}: {
  p: EditProps;
  eyebrow?: string;
  heading: string;
  lead?: string;
}) {
  return (
    <div className="ms-head-split">
      <div>
        {eyebrow && <p className="ms-eyebrow">{eyebrow}</p>}
        <F p={p} at={["heading"]} v={heading}>
          <h2 className="ms-h2 ms-serif">{heading}</h2>
        </F>
      </div>
      {lead && (
        <F p={p} at={["lead"]} v={lead}>
          <p className="ms-lead">{lead}</p>
        </F>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   写真の枠（無ければ設計された絵）
   ═══════════════════════════════════════ */

/** 写真があれば写真、無ければ渡された絵を出す */
export function Media({
  src, alt, art, className, style,
}: {
  src?: string;
  alt: string;
  art: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`ms-frame${className ? ` ${className}` : ""}`} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt={alt} /> : art}
    </div>
  );
}

/* ═══════════════════════════════════════
   アイコン・小物
   ═══════════════════════════════════════ */

const ICONS = {
  Award, BadgeCheck, Briefcase, Building2, Clock, Coffee, Compass, Dumbbell,
  GraduationCap, Hammer, HardHat, Heart, Home, Leaf, MapPin, PenTool, Phone,
  Ruler, Scale, Scissors, Shield, ShoppingBag, Sparkles, Stethoscope, Sun,
  TrendingUp, Users, Utensils, Wrench,
} as const;

/** config の icon 名（"Home" 等）から絵記号を出す。知らない名前は Sparkles */
export function Icon({ name, size = 22 }: { name?: string; size?: number }) {
  const C = (name && ICONS[name as keyof typeof ICONS]) || Sparkles;
  return <C size={size} strokeWidth={1.6} />;
}

/** 名前の頭文字を丸に入れたもの（顔写真の代わり・引用の主） */
export function Monogram({ label, size = 44 }: { label: string; size?: number }) {
  const initial = label.trim().slice(0, 1) || "・";
  return (
    <span
      className="ms-mono ms-serif"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

/** 連番を "01" の形に */
export function pad2(n: number): string {
  return String(n + 1).padStart(2, "0");
}

/* ═══════════════════════════════════════
   公開サイトの中にいるか（一覧→詳細・フォーム送信の可否）
   ═══════════════════════════════════════ */

/**
 * 部品は「今どこで描かれているか」を知らない。
 * 公開中の顧客サイトの中だけ、ここに slug と site の id が入る。
 * デモ・部品カタログ・エディタのプレビューでは null なので、
 *   ・一覧の項目は詳細へのリンクにしない
 *   ・フォームは送信しない（「デモのため送信されません」と出す）
 * という分岐が、部品ごとに書かなくても同じ形で効く。
 */
export type SiteLink = { slug: string; siteId: string };

const SiteLinkContext = createContext<SiteLink | null>(null);

/** 公開サイトのページから、いちばん外側で包む */
export function SiteLinkProvider({ value, children }: { value: SiteLink; children: ReactNode }) {
  return <SiteLinkContext.Provider value={value}>{children}</SiteLinkContext.Provider>;
}

/** 公開サイトの中なら slug と id、そうでなければ null */
export function useSiteLink(): SiteLink | null {
  return useContext(SiteLinkContext);
}

/** 詳細ページを持てる機能 */
export type DetailSection = "works" | "staff" | "menu" | "news";

/** 一覧の1件を指す文字列。slug があればそれ、無ければ id、それも無ければ並び順 */
export function itemKeyOf(item: { slug?: string; id?: number | string }, index: number): string {
  const key = item.slug ?? item.id;
  return String(key !== undefined && key !== "" ? key : index + 1);
}

/** 一覧の1件から詳細への行き先。公開サイトの外では null（リンクにしない） */
export function detailHref(
  site: SiteLink | null,
  section: DetailSection,
  key: string | number,
): string | null {
  if (!site?.slug) return null;
  return `/${site.slug}/${section}/${encodeURIComponent(String(key))}`;
}

/**
 * 行き先があればリンク、無ければ何も足さずにそのまま出す。
 * 包むだけで済むので、一覧の部品は「今デモかどうか」を気にしなくてよい。
 * リンクにならないときは要素そのものを作らないので、見た目は1ドットも変わらない。
 */
export function DetailLink({
  section, item, index, className, children,
}: {
  section: DetailSection;
  item: { slug?: string; id?: number | string };
  index: number;
  className?: string;
  children: ReactNode;
}) {
  const site = useSiteLink();
  const href = detailHref(site, section, itemKeyOf(item, index));
  if (!href) return <>{children}</>;
  return (
    <a className={`ms-dlink${className ? ` ${className}` : ""}`} href={href}>
      {children}
    </a>
  );
}
