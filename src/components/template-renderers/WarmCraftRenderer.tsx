"use client";

import { useState } from "react";
import {
  Phone, Mail, Check, ArrowRight, Star, Calendar, MapPin, Clock, Users2,
  Home, Hammer, Shield, Users, Ruler, HardHat, Leaf, Heart,
} from "lucide-react";
import type { SiteConfig } from "@/lib/site-config-schema";
import { getSections } from "@/lib/site-config-schema";
import { TplRoot, useConfigPalette, useTplPalette } from "./TplPalette";

/**
 * warm-craft テンプレートの描画コンポーネント（工務店・リフォーム向け）
 *
 * 色はお客さんが選んだ代表カラー＋サブから作る（src/lib/palette.ts）。
 * 選んでいなければ、木のぬくもり（クリーム × ブラウン × テラコッタ）の初期色。
 * 地・見出し・帯・線・ボタン・SVG の絵まで、全部その1組の色から塗るので、
 * 色をひとつ変えるとページ全体が同じ雰囲気のまま塗り替わる。
 * sections配列の順序でセクションを描く。会社情報は全て config から差し込む。
 */

/**
 * このテンプレートでの色の割り当て。
 * 昔の固定パレットと同じ名前にして、絵や文字の描き方は変えていない。
 */
function useWc() {
  const p = useTplPalette();
  return {
    CREAM: p.bg,             // 地
    CREAM_DEEP: p.bgDeep,    // ひとつ濃い段
    BROWN: p.ink,            // 見出し・線
    BROWN_MID: p.ink2,       // 本文
    TERRA: p.primary,        // 代表カラー（CTA・差し色）
    WOOD: p.inkSoft,         // 装飾の中間色
    SURFACE: p.surface,      // 面（カード・壁）
    LINE: p.line,
    LINE_STRONG: p.lineStrong,
    MUTED: p.mutedFill,
    GLOW1: p.glow1,          // 窓あかり（明）
    GLOW2: p.glow2,          // 窓あかり（暗）
    SUB1: p.sub1,
    TINT: p.primaryTint,   // 濃地の上に置く淡い差し色
    ROOF_TONES: p.tones,     // 屋根の描き分け
  };
}

const ICON_MAP: Record<string, typeof Home> = {
  Home, Hammer, Shield, Users, Ruler, HardHat, Leaf, Heart,
};

/* 見出しフォント（温かみ重視＝Zen Kaku Gothic。未読込でも安全にフォールバック） */
const HEAD = "var(--font-gothic-zen), 'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif";

interface Props {
  config: SiteConfig;
  editMode?: boolean;
  onFieldClick?: (fieldId: string, currentValue: string, fieldType: "text" | "image") => void;
  changedFields?: Set<string>;
}

type EP = Omit<Props, "config"> & { editMode: boolean };

/* ─── 編集可能ラッパー ─── */
function E({ fieldId, value, type = "text", editMode, onFieldClick, changedFields, children }: {
  fieldId: string; value: string; type?: "text" | "image";
  editMode: boolean;
  onFieldClick?: Props["onFieldClick"];
  changedFields?: Set<string>;
  children: React.ReactNode;
}) {
  if (!editMode) return <>{children}</>;
  const changed = changedFields?.has(fieldId);
  return (
    <div
      data-field-id={fieldId}
      onClick={(e) => { e.stopPropagation(); onFieldClick?.(fieldId, value, type); }}
      style={{
        cursor: "pointer", position: "relative", borderRadius: 6,
        outline: changed ? "2px solid #6c5ce7" : "1px dashed transparent",
        transition: "outline 0.15s",
      }}
      onMouseEnter={(e) => { if (!changed) (e.currentTarget as HTMLElement).style.outline = "1px dashed #a29bfe"; }}
      onMouseLeave={(e) => { if (!changed) (e.currentTarget as HTMLElement).style.outline = "1px dashed transparent"; }}
    >
      {changed && (
        <div style={{ position: "absolute", top: -6, right: -6, zIndex: 10, width: 16, height: 16, borderRadius: "50%", background: "#6c5ce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Check size={9} color="#fff" />
        </div>
      )}
      {children}
    </div>
  );
}

function Eyebrow({ en, ja }: { en: string; ja: string }) {
  return (
    <div className="wc-eyebrow">
      <span className="wc-eyebrow-line" />
      <div>
        <p className="wc-eyebrow-en">{en}</p>
        <h2 className="wc-eyebrow-ja">{ja}</h2>
      </div>
    </div>
  );
}

/* ─── 施工写真の枠（実写が来るまで、暖色の建築ラインアートで“完成”させる） ─── */
function HouseArt({ seed, category }: { seed: number; category?: string }) {
  const { CREAM_DEEP, BROWN, TERRA, WOOD, SURFACE, LINE, MUTED, GLOW1, GLOW2, ROOF_TONES } = useWc();
  const u = `wcw${seed}`;
  const reform = (category || "").includes("リフォーム") || (category || "").includes("改装");
  const roof = ROOF_TONES[seed % ROOF_TONES.length];
  const lit = seed % 3 !== 0; // 窓に灯りを入れるか
  const winFill = lit ? `url(#${u}win)` : MUTED;
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={`${u}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={SURFACE} />
          <stop offset="58%" stopColor={CREAM_DEEP} />
          <stop offset="100%" stopColor={LINE} />
        </linearGradient>
        <radialGradient id={`${u}sun`} cx="78%" cy="16%" r="60%">
          <stop offset="0%" stopColor={TERRA} stopOpacity="0.26" />
          <stop offset="55%" stopColor={TERRA} stopOpacity="0.06" />
          <stop offset="100%" stopColor={TERRA} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${u}win`} cx="50%" cy="38%" r="72%">
          <stop offset="0%" stopColor={GLOW1} />
          <stop offset="100%" stopColor={GLOW2} />
        </radialGradient>
        <pattern id={`${u}grid`} width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M25 0H0V25" fill="none" stroke={BROWN} strokeOpacity="0.055" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="400" height="300" fill={`url(#${u}bg)`} />
      <rect width="400" height="300" fill={`url(#${u}grid)`} />
      <rect width="400" height="300" fill={`url(#${u}sun)`} />
      {/* 遠景の丘 */}
      <path d="M0 236 Q130 206 260 228 T400 222 V300 H0 Z" fill={WOOD} opacity="0.15" />
      {/* 地面 */}
      <line x1="0" y1="266" x2="400" y2="266" stroke={BROWN} strokeOpacity="0.3" strokeWidth="1.5" />
      {reform ? (
        /* リフォーム＝足場のライン */
        <g stroke={BROWN} strokeOpacity="0.3" strokeWidth="1.6">
          <line x1="60" y1="150" x2="60" y2="266" />
          <line x1="98" y1="150" x2="98" y2="266" />
          <line x1="60" y1="150" x2="98" y2="150" />
          <line x1="60" y1="186" x2="98" y2="186" />
          <line x1="60" y1="224" x2="98" y2="224" />
        </g>
      ) : (
        /* 新築＝庭木 */
        <g>
          <line x1="74" y1="266" x2="74" y2="206" stroke={BROWN} strokeOpacity="0.55" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="74" cy="190" r="26" fill={WOOD} fillOpacity="0.22" />
          <circle cx="74" cy="190" r="26" fill="none" stroke={BROWN} strokeOpacity="0.5" strokeWidth="2.2" />
        </g>
      )}
      {/* 煙突 */}
      <rect x="266" y="112" width="16" height="40" fill={roof} stroke={BROWN} strokeWidth="2" />
      {/* 屋根 */}
      <polygon points="138,152 225,98 312,152" fill={roof} fillOpacity="0.92" stroke={BROWN} strokeWidth="2.6" strokeLinejoin="round" />
      {/* 壁 */}
      <rect x="152" y="152" width="146" height="114" fill={SURFACE} fillOpacity="0.94" stroke={BROWN} strokeWidth="2.6" />
      {/* 上階の窓 */}
      <g stroke={BROWN} strokeWidth="2">
        <rect x="168" y="168" width="42" height="34" rx="2" fill={winFill} />
        <line x1="189" y1="168" x2="189" y2="202" strokeWidth="1.4" />
        <rect x="240" y="168" width="42" height="34" rx="2" fill={winFill} />
        <line x1="261" y1="168" x2="261" y2="202" strokeWidth="1.4" />
      </g>
      {/* 掃き出し窓・ドア */}
      <rect x="164" y="220" width="34" height="46" rx="2" fill={winFill} stroke={BROWN} strokeWidth="2" />
      <rect x="207" y="214" width="36" height="52" rx="2" fill={TERRA} fillOpacity="0.88" stroke={BROWN} strokeWidth="2" />
      <circle cx="236" cy="242" r="2.6" fill={SURFACE} />
      <rect x="252" y="220" width="34" height="46" rx="2" fill={winFill} stroke={BROWN} strokeWidth="2" />
      {/* 額縁（枠として成立させる） */}
      <rect x="6" y="6" width="388" height="288" rx="4" fill="none" stroke={BROWN} strokeOpacity="0.14" strokeWidth="1.5" />
    </svg>
  );
}

/* ═══════════════════════════════════════
   Hero
   ═══════════════════════════════════════ */
function HeroSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const { CREAM_DEEP, BROWN, TERRA, WOOD, SURFACE, LINE, GLOW1, GLOW2 } = useWc();
  const c = config.company;
  return (
    <section className="wc-hero">
      <div className="wc-hero-text">
        <div className="wc-hero-badge"><Leaf size={13} /> since {c.since}</div>
        <E fieldId="company.tagline" value={c.tagline} {...ep}>
          <h1 className="wc-hero-title">{c.tagline}</h1>
        </E>
        <E fieldId="company.description" value={c.description} {...ep}>
          <p className="wc-hero-desc">{c.description}</p>
        </E>
        <div className="wc-hero-cta">
          <a href="#contact" className="wc-btn wc-btn-terra">相談してみる</a>
          <a href="#works" className="wc-btn wc-btn-line">施工事例を見る <ArrowRight size={15} /></a>
        </div>
      </div>
      <div className="wc-hero-art">
        <svg viewBox="0 0 500 460" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }} xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <defs>
            <linearGradient id="wcHeroBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SURFACE} />
              <stop offset="55%" stopColor={CREAM_DEEP} />
              <stop offset="100%" stopColor={LINE} />
            </linearGradient>
            <radialGradient id="wcHeroSun" cx="26%" cy="20%" r="52%">
              <stop offset="0%" stopColor={GLOW1} stopOpacity="0.85" />
              <stop offset="45%" stopColor={TERRA} stopOpacity="0.12" />
              <stop offset="100%" stopColor={TERRA} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="wcHeroWin" cx="50%" cy="40%" r="72%">
              <stop offset="0%" stopColor={GLOW1} />
              <stop offset="100%" stopColor={GLOW2} />
            </radialGradient>
            <pattern id="wcHeroGrid" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M28 0H0V28" fill="none" stroke={BROWN} strokeOpacity="0.05" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="500" height="460" fill="url(#wcHeroBg)" />
          <rect width="500" height="460" fill="url(#wcHeroGrid)" />
          <rect width="500" height="460" fill="url(#wcHeroSun)" />
          {/* 窓から差す光 */}
          <g opacity="0.5">
            <polygon points="70,0 150,0 90,300 40,300" fill={GLOW1} opacity="0.35" />
            <polygon points="150,0 200,0 150,300 110,300" fill={GLOW1} opacity="0.22" />
          </g>
          {/* 遠景の丘 */}
          <path d="M0 330 Q140 292 300 320 T500 306 V460 H0 Z" fill={WOOD} opacity="0.16" />
          <path d="M0 360 Q160 332 340 352 T500 344 V460 H0 Z" fill={WOOD} opacity="0.12" />
          {/* 地面 */}
          <line x1="0" y1="372" x2="500" y2="372" stroke={BROWN} strokeOpacity="0.22" strokeWidth="1.5" />
          {/* 庭木 */}
          <line x1="86" y1="372" x2="86" y2="286" stroke={BROWN} strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" />
          <circle cx="86" cy="262" r="38" fill={WOOD} fillOpacity="0.2" />
          <circle cx="86" cy="262" r="38" fill="none" stroke={BROWN} strokeOpacity="0.45" strokeWidth="2.6" />
          {/* 家 */}
          <rect x="248" y="150" width="30" height="60" fill={TERRA} stroke={BROWN} strokeWidth="3" />
          <polygon points="196,214 320,120 444,214" fill={TERRA} fillOpacity="0.9" stroke={BROWN} strokeWidth="3.2" strokeLinejoin="round" />
          <rect x="214" y="214" width="208" height="158" fill={SURFACE} fillOpacity="0.95" stroke={BROWN} strokeWidth="3.2" />
          <g stroke={BROWN} strokeWidth="2.4">
            <rect x="236" y="238" width="56" height="46" rx="2" fill="url(#wcHeroWin)" />
            <line x1="264" y1="238" x2="264" y2="284" strokeWidth="1.6" />
            <line x1="236" y1="261" x2="292" y2="261" strokeWidth="1.6" />
            <rect x="344" y="238" width="56" height="46" rx="2" fill="url(#wcHeroWin)" />
            <line x1="372" y1="238" x2="372" y2="284" strokeWidth="1.6" />
            <line x1="344" y1="261" x2="400" y2="261" strokeWidth="1.6" />
          </g>
          <rect x="296" y="300" width="44" height="72" rx="2" fill={TERRA} fillOpacity="0.88" stroke={BROWN} strokeWidth="2.6" />
          <circle cx="332" cy="338" r="3.2" fill={SURFACE} />
          {/* 前景の草 */}
          <g stroke={WOOD} strokeOpacity="0.55" strokeWidth="2.4" strokeLinecap="round">
            <line x1="120" y1="400" x2="120" y2="384" /><line x1="130" y1="400" x2="134" y2="386" /><line x1="110" y1="400" x2="106" y2="388" />
            <line x1="430" y1="404" x2="430" y2="388" /><line x1="440" y1="404" x2="444" y2="390" /><line x1="420" y1="404" x2="416" y2="392" />
          </g>
          <rect x="8" y="8" width="484" height="444" rx="6" fill="none" stroke={BROWN} strokeOpacity="0.12" strokeWidth="1.5" />
        </svg>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Works（施工実績）
   ═══════════════════════════════════════ */
function WorksSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const { CREAM } = useWc();
  const projects = config.projects || [];
  if (projects.length === 0) return null;
  return (
    <section id="works" className="wc-sec" style={{ background: CREAM }}>
      <div className="wc-wrap">
        <Eyebrow en="WORKS" ja="施工実績" />
        <div className="wc-grid wc-grid-works">
          {projects.map((p, i) => (
            <div key={p.id} className="wc-work-card">
              <E fieldId={`projects.${i}.image`} value={p.image || ""} type="image" {...ep}>
                <div className="wc-work-img">
                  {p.image
                    ? <img src={p.image} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    : <HouseArt seed={i} category={p.category} />}
                </div>
              </E>
              <div className="wc-work-body">
                <span className="wc-work-cat">{p.category}</span>
                <E fieldId={`projects.${i}.title`} value={p.title} {...ep}>
                  <h3 className="wc-work-title">{p.title}</h3>
                </E>
                {p.specs && <p className="wc-work-specs">{p.specs}</p>}
                <E fieldId={`projects.${i}.description`} value={p.description} {...ep}>
                  <p className="wc-body">{p.description}</p>
                </E>
                <p className="wc-work-year">{p.year}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Strengths（私たちの強み）
   ═══════════════════════════════════════ */
function StrengthsSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const { CREAM_DEEP } = useWc();
  const strengths = config.strengths || [];
  if (strengths.length === 0) return null;
  return (
    <section id="strength" className="wc-sec" style={{ background: CREAM_DEEP }}>
      <div className="wc-wrap">
        <Eyebrow en="OUR STRENGTHS" ja="私たちの強み" />
        <div className="wc-grid wc-grid-strength">
          {strengths.map((s, i) => {
            const Icon = ICON_MAP[s.icon || "Home"] || Home;
            return (
              <E key={i} fieldId={`strengths.${i}.title`} value={s.title} {...ep}>
                <div className="wc-strength-card">
                  <div className="wc-strength-icon"><Icon size={24} strokeWidth={1.6} /></div>
                  <h3 className="wc-strength-title">{s.title}</h3>
                  <p className="wc-body">{s.description}</p>
                </div>
              </E>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   About（会社案内 / 代表挨拶）
   ═══════════════════════════════════════ */
function AboutSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const { CREAM, CREAM_DEEP, BROWN, WOOD, SURFACE, GLOW1 } = useWc();
  const c = config.company;
  return (
    <section id="about" className="wc-sec" style={{ background: CREAM }}>
      <div className="wc-wrap wc-about">
        <div className="wc-about-media">
          <E fieldId="company.ceoPhoto" value={c.ceoPhoto || ""} type="image" {...ep}>
            <div className="wc-about-photo">
              {c.ceoPhoto
                ? <img src={c.ceoPhoto} alt={c.ceo} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                : (
                  <svg viewBox="0 0 320 380" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }} xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <defs>
                      <linearGradient id="wcCeoBg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={SURFACE} />
                        <stop offset="100%" stopColor={CREAM_DEEP} />
                      </linearGradient>
                      <radialGradient id="wcCeoLight" cx="64%" cy="28%" r="62%">
                        <stop offset="0%" stopColor={GLOW1} stopOpacity="0.7" />
                        <stop offset="100%" stopColor={GLOW1} stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <rect width="320" height="380" fill="url(#wcCeoBg)" />
                    {/* 背景の窓 */}
                    <rect x="186" y="42" width="98" height="122" rx="3" fill={SURFACE} fillOpacity="0.6" stroke={BROWN} strokeOpacity="0.15" strokeWidth="2" />
                    <line x1="235" y1="42" x2="235" y2="164" stroke={BROWN} strokeOpacity="0.12" strokeWidth="1.5" />
                    <line x1="186" y1="103" x2="284" y2="103" stroke={BROWN} strokeOpacity="0.12" strokeWidth="1.5" />
                    <rect width="320" height="380" fill="url(#wcCeoLight)" />
                    {/* 人物（頭・首・肩がつながった上半身） */}
                    <path d="M64 380 L64 300 Q70 248 160 244 Q250 248 256 300 L256 380 Z" fill={WOOD} fillOpacity="0.5" />
                    <rect x="146" y="188" width="28" height="60" fill={WOOD} fillOpacity="0.5" />
                    <circle cx="160" cy="150" r="46" fill={WOOD} fillOpacity="0.5" />
                    <circle cx="160" cy="150" r="46" fill="none" stroke={BROWN} strokeOpacity="0.32" strokeWidth="2" />
                    <path d="M64 300 Q70 248 160 244 Q250 248 256 300" fill="none" stroke={BROWN} strokeOpacity="0.28" strokeWidth="2" />
                    <path d="M140 252 L160 272 L180 252" fill="none" stroke={BROWN} strokeOpacity="0.3" strokeWidth="2" />
                    <line x1="28" y1="352" x2="292" y2="352" stroke={BROWN} strokeOpacity="0.14" strokeWidth="1.5" />
                  </svg>
                )}
            </div>
          </E>
          <div className="wc-about-namecard">
            <E fieldId="company.ceo" value={c.ceo || ""} {...ep}>
              <p className="wc-about-name">{c.ceo || "代表者名"}</p>
            </E>
            {c.ceoTitle && <p className="wc-about-role">{c.ceoTitle}</p>}
          </div>
        </div>
        <div className="wc-about-text">
          <Eyebrow en="ABOUT US" ja="私たちについて" />
          <E fieldId="company.bio" value={c.bio} {...ep}>
            <div className="wc-about-bio">
              {c.bio.split("\n\n").map((para, i) => <p key={i} style={{ margin: i > 0 ? "14px 0 0" : 0 }}>{para}</p>)}
            </div>
          </E>
          <div className="wc-about-facts">
            {c.address && <div><MapPin size={15} /> {c.address}</div>}
            {c.phone && <div><Phone size={15} /> {c.phone}</div>}
            {c.hours && <div><Clock size={15} /> {c.hours}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Testimonials（お客様の声）
   ═══════════════════════════════════════ */
function TestimonialsSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const { CREAM_DEEP, TERRA, LINE_STRONG } = useWc();
  const items = config.testimonials || [];
  if (items.length === 0) return null;
  return (
    <section className="wc-sec" style={{ background: CREAM_DEEP }}>
      <div className="wc-wrap">
        <Eyebrow en="VOICE" ja="お客様の声" />
        <div className="wc-grid wc-grid-voice">
          {items.map((t, i) => (
            <E key={i} fieldId={`testimonials.${i}.text`} value={t.text} {...ep}>
              <div className="wc-voice-card">
                <div className="wc-stars">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={15} fill={s < (t.rating || 5) ? TERRA : "none"} color={s < (t.rating || 5) ? TERRA : LINE_STRONG} />
                  ))}
                </div>
                <p className="wc-voice-text">「{t.text}」</p>
                <p className="wc-voice-name">{t.name}<span> / {t.project}</span></p>
              </div>
            </E>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   News（お知らせ）
   ═══════════════════════════════════════ */
function NewsSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const { CREAM } = useWc();
  const news = config.news || [];
  if (news.length === 0) return null;
  return (
    <section className="wc-sec" style={{ background: CREAM }}>
      <div className="wc-wrap" style={{ maxWidth: 860 }}>
        <Eyebrow en="NEWS" ja="お知らせ" />
        <div>
          {news.map((n, i) => (
            <E key={i} fieldId={`news.${i}.title`} value={n.title} {...ep}>
              <div className="wc-news-row">
                <span className="wc-news-date">{n.date}</span>
                <span className="wc-news-cat">{n.category}</span>
                <span className="wc-news-title">{n.title}</span>
              </div>
            </E>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Booking（見学会・イベント予約）
   ═══════════════════════════════════════ */
function BookingSection({ config }: { config: SiteConfig; ep: EP }) {
  const { CREAM_DEEP } = useWc();
  const events = config.bookingEvents || [];
  if (events.length === 0) return null;
  return (
    <section id="booking" className="wc-sec" style={{ background: CREAM_DEEP }}>
      <div className="wc-wrap">
        <Eyebrow en="EVENT" ja="見学会・イベント" />
        <div className="wc-grid wc-grid-booking">
          {events.map((ev) => {
            const soldOut = ev.spots <= 0;
            return (
              <div key={ev.id} className="wc-event-card">
                <div className="wc-event-date"><Calendar size={15} /> {ev.date}<span className="wc-event-time">{ev.time}</span></div>
                <h3 className="wc-event-title">{ev.title}</h3>
                {ev.location && <p className="wc-event-loc"><MapPin size={13} /> {ev.location}</p>}
                <div className="wc-event-foot">
                  <span className="wc-event-spots"><Users2 size={13} /> 残り {Math.max(0, ev.spots)} 組</span>
                  <span className={`wc-event-btn${soldOut ? " wc-event-btn-off" : ""}`}>{soldOut ? "受付終了" : "予約する"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Contact（お問い合わせ）
   ═══════════════════════════════════════ */
function ContactSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const { TERRA, TINT } = useWc();
  const c = config.company;
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" className="wc-sec wc-contact">
      <div className="wc-wrap" style={{ maxWidth: 760 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p className="wc-eyebrow-en" style={{ color: TINT }}>CONTACT</p>
          <h2 className="wc-contact-title">お気軽にご相談ください</h2>
          <p className="wc-contact-sub">お見積もり・ご相談は無料です。小さなことでもお問い合わせください。</p>
        </div>
        <div className="wc-contact-cards">
          <E fieldId="company.phone" value={c.phone} {...ep}>
            <a href={`tel:${c.phone}`} className="wc-contact-card"><Phone size={18} /> {c.phone}</a>
          </E>
          <E fieldId="company.email" value={c.email} {...ep}>
            <a href={`mailto:${c.email}`} className="wc-contact-card wc-contact-card-line"><Mail size={18} /> メールで相談</a>
          </E>
        </div>
        {sent ? (
          <div className="wc-thanks">
            <div className="wc-thanks-icon"><Check size={22} color={TERRA} /></div>
            <p className="wc-thanks-title">ありがとうございます</p>
            <p className="wc-contact-sub" style={{ color: "var(--tpl-on-dark-2)" }}>2〜3営業日以内にご連絡いたします。</p>
          </div>
        ) : (
          <form className="wc-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <div className="wc-form-row">
              <label>お名前<input type="text" required placeholder="山田 太郎" /></label>
              <label>電話番号 または メール<input type="text" required placeholder="090-0000-0000" /></label>
            </div>
            <label>ご相談内容<textarea rows={4} required placeholder="例：築20年の一戸建てのリフォームを検討しています。" /></label>
            <button type="submit" className="wc-btn wc-btn-terra" style={{ justifyContent: "center", width: "100%" }}>送信する</button>
          </form>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   セクション→コンポーネント
   ═══════════════════════════════════════ */
const SECTION_COMPONENTS: Record<string, (props: { config: SiteConfig; ep: EP }) => React.ReactNode> = {
  hero: HeroSection,
  works: WorksSection,
  strengths: StrengthsSection,
  about: AboutSection,
  testimonials: TestimonialsSection,
  news: NewsSection,
  booking: BookingSection,
  contact: ContactSection,
};

/* ═══════════════════════════════════════
   スコープCSS
   ═══════════════════════════════════════ */
const STYLES = `
.wc-root { font-family: 'Noto Sans JP', system-ui, sans-serif; color: var(--tpl-ink); background: var(--tpl-bg); }
.wc-root * { box-sizing: border-box; }
.wc-root img { max-width: 100%; }
.wc-wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.wc-sec { padding: 76px 0; }
.wc-body { font-size: 14px; line-height: 1.9; color: var(--tpl-ink2); }
.wc-grid { display: grid; gap: 22px; }
.wc-grid-works { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
.wc-grid-strength { grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); }
.wc-grid-voice { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
.wc-grid-booking { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }

.wc-eyebrow { display: flex; align-items: center; gap: 14px; margin-bottom: 34px; }
.wc-eyebrow-line { width: 32px; height: 3px; border-radius: 2px; background: var(--tpl-primary); flex-shrink: 0; }
.wc-eyebrow-en { font-size: 12px; letter-spacing: 0.25em; color: var(--tpl-primary); font-weight: 700; margin: 0 0 2px; }
.wc-eyebrow-ja { font-family: ${HEAD}; font-size: clamp(1.4rem, 3.5vw, 1.9rem); font-weight: 700; color: var(--tpl-ink); margin: 0; }

/* Header */
.wc-head { position: sticky; top: 0; z-index: 50; background: var(--tpl-bg-veil); backdrop-filter: blur(8px); border-bottom: 1px solid var(--tpl-bg-deep); }
.wc-head.wc-head-static { position: relative; }
.wc-head-inner { max-width: 1120px; margin: 0 auto; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.wc-head-name { font-weight: 700; font-size: 17px; color: var(--tpl-ink); }
.wc-head-nav { display: flex; align-items: center; gap: 22px; }
.wc-head-nav a { color: var(--tpl-ink2); font-size: 13px; text-decoration: none; transition: color 0.2s; }
.wc-head-nav a:hover { color: var(--tpl-primary); }
.wc-head-tel { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: var(--tpl-primary); color: var(--tpl-on-primary); font-size: 13px; font-weight: 700; border-radius: 999px; text-decoration: none; }

/* Hero */
.wc-hero { display: grid; grid-template-columns: 1.05fr 0.95fr; align-items: stretch; min-height: 540px; }
.wc-hero-text { display: flex; flex-direction: column; justify-content: center; padding: 64px clamp(24px, 5vw, 72px); }
.wc-hero-badge { display: inline-flex; align-items: center; gap: 7px; align-self: flex-start; padding: 6px 14px; border-radius: 999px; background: var(--tpl-bg-deep); color: var(--tpl-ink-soft); font-size: 12px; font-weight: 700; letter-spacing: 0.08em; margin-bottom: 20px; }
.wc-hero-title { font-family: ${HEAD}; font-size: clamp(1.9rem, 4.6vw, 3rem); font-weight: 700; line-height: 1.4; color: var(--tpl-ink); margin: 0 0 18px; }
.wc-hero-desc { font-size: 15px; line-height: 2; color: var(--tpl-ink2); margin: 0 0 30px; max-width: 480px; }
.wc-hero-cta { display: flex; flex-wrap: wrap; gap: 12px; }
.wc-hero-art { position: relative; min-height: 320px; }
.wc-btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 999px; border: none; cursor: pointer; transition: all 0.2s; }
.wc-btn-terra { background: var(--tpl-primary); color: var(--tpl-on-primary); }
.wc-btn-terra:hover { background: var(--tpl-primary-strong); transform: translateY(-1px); }
.wc-btn-line { background: transparent; color: var(--tpl-ink); border: 1.5px solid var(--tpl-ink-soft); }
.wc-btn-line:hover { background: var(--tpl-bg-deep); }

/* Works */
.wc-work-card { background: var(--tpl-surface); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px var(--tpl-shadow-weak); transition: transform 0.25s, box-shadow 0.25s; }
.wc-work-card:hover { transform: translateY(-4px); box-shadow: 0 14px 30px var(--tpl-shadow-strong); }
.wc-work-img { height: 190px; overflow: hidden; }
.wc-work-body { padding: 20px; }
.wc-work-cat { display: inline-block; font-size: 11px; font-weight: 700; color: var(--tpl-primary); background: var(--tpl-bg-deep); padding: 3px 10px; border-radius: 999px; margin-bottom: 10px; }
.wc-work-title { font-size: 17px; font-weight: 700; color: var(--tpl-ink); margin: 0 0 6px; }
.wc-work-specs { font-size: 12px; color: var(--tpl-ink-soft); margin: 0 0 8px; }
.wc-work-year { font-size: 12px; color: var(--tpl-ink3); margin: 12px 0 0; }

/* Strengths */
.wc-strength-card { background: var(--tpl-surface); border-radius: 16px; padding: 30px 24px; text-align: center; height: 100%; box-shadow: 0 3px 12px var(--tpl-shadow-weak); }
.wc-strength-icon { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; background: var(--tpl-bg-deep); color: var(--tpl-primary); }
.wc-strength-title { font-size: 16px; font-weight: 700; color: var(--tpl-ink); margin: 0 0 10px; }

/* About */
.wc-about { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 48px; align-items: center; }
.wc-about-media { display: flex; flex-direction: column; }
.wc-about-photo { border-radius: 16px; overflow: hidden; aspect-ratio: 4/5; box-shadow: 0 10px 30px var(--tpl-shadow-strong); }
.wc-about-namecard { margin-top: 16px; }
.wc-about-name { font-size: 18px; font-weight: 700; color: var(--tpl-ink); margin: 0; }
.wc-about-role { font-size: 13px; color: var(--tpl-ink-soft); margin: 4px 0 0; }
.wc-about-bio { font-size: 15px; line-height: 2.1; color: var(--tpl-ink2); }
.wc-about-facts { margin-top: 24px; display: flex; flex-direction: column; gap: 10px; }
.wc-about-facts div { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--tpl-ink); }
.wc-about-facts svg { color: var(--tpl-primary); flex-shrink: 0; }

/* Voice */
.wc-voice-card { background: var(--tpl-surface); border-radius: 16px; padding: 26px 24px; height: 100%; box-shadow: 0 3px 12px var(--tpl-shadow-weak); }
.wc-stars { display: flex; gap: 3px; margin-bottom: 14px; }
.wc-voice-text { font-size: 14px; line-height: 1.9; color: var(--tpl-ink); margin: 0 0 14px; }
.wc-voice-name { font-size: 13px; font-weight: 700; color: var(--tpl-ink2); margin: 0; }
.wc-voice-name span { font-weight: 400; color: var(--tpl-ink3); }

/* News */
.wc-news-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: 14px; padding: 15px 0; border-bottom: 1px solid var(--tpl-bg-deep); }
.wc-news-date { font-size: 13px; color: var(--tpl-ink3); flex-shrink: 0; }
.wc-news-cat { font-size: 11px; color: var(--tpl-primary); background: var(--tpl-bg-deep); padding: 2px 10px; border-radius: 999px; flex-shrink: 0; }
.wc-news-title { font-size: 14px; color: var(--tpl-ink); }

/* Booking */
.wc-event-card { background: var(--tpl-surface); border-radius: 16px; padding: 24px; box-shadow: 0 3px 12px var(--tpl-shadow-weak); display: flex; flex-direction: column; }
.wc-event-date { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: var(--tpl-primary); }
.wc-event-time { font-size: 12px; color: var(--tpl-ink-soft); font-weight: 400; margin-left: 4px; }
.wc-event-title { font-size: 16px; font-weight: 700; color: var(--tpl-ink); margin: 12px 0 8px; }
.wc-event-loc { display: flex; align-items: center; gap: 5px; font-size: 13px; color: var(--tpl-ink2); margin: 0; }
.wc-event-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 18px; }
.wc-event-spots { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--tpl-ink-soft); }
.wc-event-btn { font-size: 13px; font-weight: 700; color: var(--tpl-on-primary); background: var(--tpl-primary); padding: 8px 18px; border-radius: 999px; }
.wc-event-btn-off { background: var(--tpl-muted-fill); }

/* Contact */
.wc-contact { background: var(--tpl-ink-deep); }
.wc-contact-title { font-size: clamp(1.5rem, 4vw, 2.1rem); font-weight: 700; color: var(--tpl-on-dark); margin: 6px 0 12px; }
.wc-contact-sub { font-size: 14px; line-height: 1.9; color: var(--tpl-on-dark-2); margin: 0; }
.wc-contact-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 24px; }
.wc-contact-card { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 18px; border-radius: 12px; background: var(--tpl-primary); color: var(--tpl-on-primary); font-size: 17px; font-weight: 700; text-decoration: none; transition: background 0.2s; }
.wc-contact-card:hover { background: var(--tpl-primary-strong); }
.wc-contact-card-line { background: var(--tpl-on-dark-fill); border: 1px solid var(--tpl-on-dark-line); font-size: 15px; }
.wc-contact-card-line:hover { background: var(--tpl-on-dark-fill-2); }
.wc-form { background: var(--tpl-on-dark-fill); border: 1px solid var(--tpl-on-dark-line); border-radius: 16px; padding: 28px; display: flex; flex-direction: column; gap: 16px; }
.wc-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.wc-form label { display: flex; flex-direction: column; gap: 7px; font-size: 13px; font-weight: 600; color: var(--tpl-on-dark-2); }
.wc-form input, .wc-form textarea { padding: 12px 14px; border-radius: 8px; border: 1px solid var(--tpl-on-dark-line); background: var(--tpl-on-dark-field); font-size: 14px; color: var(--tpl-ink); font-family: inherit; outline: none; }
.wc-form input:focus, .wc-form textarea:focus { border-color: var(--tpl-primary); }
.wc-form textarea { resize: vertical; }
.wc-thanks { text-align: center; padding: 40px 24px; background: var(--tpl-on-dark-fill); border-radius: 16px; }
.wc-thanks-icon { width: 54px; height: 54px; border-radius: 50%; background: var(--tpl-surface); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
.wc-thanks-title { font-size: 18px; font-weight: 700; color: var(--tpl-on-dark); margin: 0 0 6px; }

/* Footer */
.wc-foot { background: var(--tpl-ink-deep); color: var(--tpl-on-dark); padding: 40px 24px; border-top: 1px solid var(--tpl-on-dark-fill); }
.wc-foot-inner { max-width: 1120px; margin: 0 auto; text-align: center; }
.wc-foot-name { font-weight: 700; font-size: 16px; margin: 0 0 8px; }
.wc-foot-info { font-size: 13px; color: var(--tpl-on-dark-3); line-height: 1.9; margin: 0; }
.wc-foot-copy { font-size: 11px; color: var(--tpl-on-dark-4); margin: 16px 0 0; }

@media (max-width: 880px) {
  .wc-hero { grid-template-columns: 1fr; }
  .wc-hero-art { min-height: 240px; order: -1; }
  .wc-about { grid-template-columns: 1fr; gap: 32px; }
  .wc-head-nav a { display: none; }
}
@media (max-width: 600px) {
  .wc-form-row { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .wc-root * { transition: none !important; }
}
`;

/* ═══════════════════════════════════════
   メインRenderer
   ═══════════════════════════════════════ */
export default function WarmCraftRenderer({ config, editMode = false, onFieldClick, changedFields }: Props) {
  const c = config.company;
  const sections = getSections(config);
  const ep: EP = { editMode, onFieldClick, changedFields };
  const palette = useConfigPalette(config);

  return (
    <TplRoot
      palette={palette}
      className="wc-root"
      onClick={(e) => { if (editMode && (e.target as HTMLElement).closest("a")) e.preventDefault(); }}
    >
      <style>{STYLES}</style>

      {/* ─── Header ─── */}
      <header className={`wc-head${editMode ? " wc-head-static" : ""}`}>
        <div className="wc-head-inner">
          <E fieldId="company.name" value={c.name} {...ep}>
            <span className="wc-head-name">{c.name}</span>
          </E>
          <nav className="wc-head-nav">
            <a href="#works">施工実績</a>
            <a href="#strength">強み</a>
            <a href="#about">私たちについて</a>
            <a href={`tel:${c.phone}`} className="wc-head-tel"><Phone size={14} /> {c.phone}</a>
          </nav>
        </div>
      </header>

      {/* ─── セクション ─── */}
      {sections.map((section) => {
        if (!section.visible) return null;
        const Component = SECTION_COMPONENTS[section.type];
        if (!Component) return null;
        return <Component key={section.type} config={config} ep={ep} />;
      })}

      {/* ─── Footer ─── */}
      <footer className="wc-foot">
        <div className="wc-foot-inner">
          <p className="wc-foot-name">{c.name}</p>
          <p className="wc-foot-info">
            {c.address}<br />
            TEL {c.phone}　{c.hours}
          </p>
          <p className="wc-foot-copy">© {new Date().getFullYear()} {c.name}</p>
        </div>
      </footer>
    </TplRoot>
  );
}
