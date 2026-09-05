"use client";

import { useState } from "react";
import {
  Phone, Mail, Check, ArrowRight, Star,
  Building2, Wrench, Shield, Briefcase, HardHat,
  MapPin, Clock, Ruler,
} from "lucide-react";
import type { SiteConfig } from "@/lib/site-config-schema";
import { getSections } from "@/lib/site-config-schema";

/**
 * trust-navy テンプレートの描画コンポーネント（建設会社向け）
 *
 * ネイビー × ゴールドで信頼感を出す。sections配列の順序でセクションを描く。
 * 色はこのテンプレート固有の固定パレット（アプリのダークモードに引きずられない）。
 * 会社名・電話・実績などは全て config から差し込む。
 */

/* ─── 固定パレット（config.style が無くてもこの色で成立する） ─── */
const NAVY = "#1B3A5C";
const NAVY_DEEP = "#0D2440";
const NAVY_MID = "#2A5080";
const GOLD = "#C8A96E";
const MIST = "#F0F4F8";

/* 見出し・数字の明朝（信頼・実直さ。未読込でも安全にフォールバック） */
const SERIF = "var(--font-serif-mincho), 'Zen Old Mincho', 'Yu Mincho', serif";

const SERVICE_ICONS: Record<string, typeof Building2> = {
  Building2, Wrench, Shield, Briefcase, HardHat,
};

interface Props {
  config: SiteConfig;
  editMode?: boolean;
  onFieldClick?: (fieldId: string, currentValue: string, fieldType: "text" | "image") => void;
  changedFields?: Set<string>;
}

type EP = Omit<Props, "config"> & { editMode: boolean };

/* ─── 編集可能ラッパー（エディタ連携。data-field-id を出す） ─── */
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
        cursor: "pointer", position: "relative", borderRadius: 4,
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

/* ─── ラベル（英字の小見出し＋日本語見出し） ─── */
function Eyebrow({ en, ja, light = false }: { en: string; ja: string; light?: boolean }) {
  return (
    <div style={{ marginBottom: 40, textAlign: "center" }}>
      <p style={{ color: GOLD, fontSize: 12, letterSpacing: "0.3em", fontWeight: 600, marginBottom: 8 }}>{en}</p>
      <h2 style={{ color: light ? "#fff" : NAVY, fontWeight: 700, fontSize: "clamp(1.4rem, 3.5vw, 2rem)", margin: 0 }}>{ja}</h2>
    </div>
  );
}

/* ─── 施工写真の枠（実写が来るまで、ネイビー×ゴールドの建築ラインアートで“完成”させる） ─── */
function BuildingArt({ seed, category }: { seed: number; category?: string }) {
  const u = `tnw${seed}`;
  const cat = category || "";
  const isResidence = cat.includes("集合") || cat.includes("住宅") || cat.includes("マンション");
  const isCommercial = cat.includes("商業") || cat.includes("店");
  const isMedical = cat.includes("医療") || cat.includes("福祉");
  const isIndustrial = cat.includes("産業") || cat.includes("工場") || cat.includes("倉庫");
  const isCivic = !isResidence && !isCommercial && !isMedical && !isIndustrial; // 公共・その他
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={`${u}bg`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor={NAVY_DEEP} />
          <stop offset="60%" stopColor={NAVY} />
          <stop offset="100%" stopColor="#16324F" />
        </linearGradient>
        <radialGradient id={`${u}glow`} cx="50%" cy="22%" r="62%">
          <stop offset="0%" stopColor={GOLD} stopOpacity="0.22" />
          <stop offset="60%" stopColor={GOLD} stopOpacity="0.05" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${u}vig`} cx="50%" cy="45%" r="75%">
          <stop offset="58%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor={NAVY_DEEP} stopOpacity="0.5" />
        </radialGradient>
        <pattern id={`${u}grid`} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke={GOLD} strokeOpacity="0.06" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="400" height="300" fill={`url(#${u}bg)`} />
      <rect width="400" height="300" fill={`url(#${u}grid)`} />
      <rect width="400" height="300" fill={`url(#${u}glow)`} />

      <g fill="none" stroke={GOLD} strokeWidth="2" strokeLinejoin="round">
        {isResidence && (<>
          <rect x="150" y="72" width="104" height="196" fill={NAVY_MID} fillOpacity="0.4" />
          <rect x="100" y="140" width="52" height="128" fill={NAVY_MID} fillOpacity="0.26" strokeWidth="1.6" />
          <rect x="254" y="122" width="52" height="146" fill={NAVY_MID} fillOpacity="0.26" strokeWidth="1.6" />
          {Array.from({ length: 8 }).map((_, r) =>
            Array.from({ length: 3 }).map((_, c) => {
              const on = (r * 3 + c + seed) % 4 === 0;
              return <rect key={`w${r}-${c}`} x={162 + c * 30} y={98 + r * 22} width="18" height="12" fill={on ? GOLD : "none"} fillOpacity={on ? 0.85 : 0} stroke={GOLD} strokeOpacity="0.5" strokeWidth="1" />;
            })
          )}
          <rect x="188" y="240" width="28" height="28" fill="none" strokeWidth="1.6" />
        </>)}

        {isCommercial && (<>
          <rect x="70" y="120" width="260" height="148" fill={NAVY_MID} fillOpacity="0.36" />
          {Array.from({ length: 5 }).map((_, r) => (
            <line key={`h${r}`} x1="70" y1={120 + r * 30} x2="330" y2={120 + r * 30} stroke={GOLD} strokeOpacity="0.4" strokeWidth="1" />
          ))}
          {Array.from({ length: 9 }).map((_, c) => (
            <line key={`v${c}`} x1={70 + c * 29} y1="120" x2={70 + c * 29} y2="268" stroke={GOLD} strokeOpacity="0.32" strokeWidth="1" />
          ))}
          {[[1, 1], [3, 2], [5, 3], [2, 4], [6, 1]].map(([c, r], i) => (
            <rect key={`l${i}`} x={70 + c * 29 + 3} y={120 + r * 30 + 3} width="23" height="24" fill={GOLD} fillOpacity="0.7" stroke="none" />
          ))}
          <line x1="58" y1="200" x2="342" y2="200" strokeWidth="2.4" />
          <rect x="182" y="230" width="36" height="38" fill={NAVY_DEEP} fillOpacity="0.5" strokeWidth="1.8" />
        </>)}

        {isMedical && (<>
          <rect x="96" y="108" width="208" height="160" fill={NAVY_MID} fillOpacity="0.36" />
          {Array.from({ length: 4 }).map((_, r) =>
            Array.from({ length: 6 }).map((_, c) => {
              const on = (r + c + seed) % 3 === 0;
              return <rect key={`m${r}-${c}`} x={110 + c * 30} y={118 + r * 32} width="20" height="14" fill={on ? GOLD : "none"} fillOpacity={on ? 0.8 : 0} stroke={GOLD} strokeOpacity="0.45" strokeWidth="1" />;
            })
          )}
          <rect x="186" y="58" width="28" height="28" fill={GOLD} fillOpacity="0.9" stroke="none" />
          <rect x="196" y="64" width="8" height="16" fill={NAVY_DEEP} stroke="none" />
          <rect x="192" y="68" width="16" height="8" fill={NAVY_DEEP} stroke="none" />
        </>)}

        {isIndustrial && (<>
          <rect x="110" y="170" width="200" height="98" fill={NAVY_MID} fillOpacity="0.36" />
          {Array.from({ length: 5 }).map((_, i) => (
            <polygon key={`s${i}`} points={`${110 + i * 40},170 ${110 + i * 40},146 ${150 + i * 40},170`} fill={NAVY_MID} fillOpacity="0.3" strokeWidth="1.6" />
          ))}
          <rect x="60" y="150" width="40" height="118" rx="20" fill={NAVY_MID} fillOpacity="0.3" strokeWidth="1.8" />
          <rect x="326" y="96" width="18" height="172" fill={NAVY_MID} fillOpacity="0.3" strokeWidth="1.8" />
          {[0, 1, 2, 3].map((c) => {
            const on = (c + seed) % 2 === 0;
            return <rect key={`d${c}`} x={128 + c * 46} y="212" width="26" height="30" fill={on ? GOLD : "none"} fillOpacity={on ? 0.7 : 0} stroke={GOLD} strokeOpacity="0.5" strokeWidth="1.2" />;
          })}
        </>)}

        {isCivic && (<>
          <polygon points="120,120 220,72 320,120" fill={NAVY_MID} fillOpacity="0.4" strokeWidth="2.2" />
          <rect x="120" y="120" width="200" height="20" fill={NAVY_MID} fillOpacity="0.5" strokeWidth="1.8" />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={`c${i}`} x={132 + i * 32} y="140" width="16" height="104" fill={NAVY_MID} fillOpacity="0.26" strokeWidth="1.6" />
          ))}
          <rect x="108" y="244" width="224" height="10" fill={NAVY_MID} fillOpacity="0.5" strokeWidth="1.6" />
          <rect x="96" y="254" width="248" height="8" fill={NAVY_MID} fillOpacity="0.4" stroke={GOLD} strokeOpacity="0.6" strokeWidth="1.2" />
        </>)}
      </g>

      {/* 基準線＋寸法（建築ドローイングの品位） */}
      <g stroke={GOLD} strokeOpacity="0.5">
        <line x1="0" y1="268" x2="400" y2="268" strokeWidth="1.5" />
        <line x1="44" y1="276" x2="44" y2="286" strokeWidth="1" />
        <line x1="356" y1="276" x2="356" y2="286" strokeWidth="1" />
        <line x1="44" y1="281" x2="356" y2="281" strokeWidth="1" strokeDasharray="3 5" />
      </g>
      <rect width="400" height="300" fill={`url(#${u}vig)`} />
      <rect x="5" y="5" width="390" height="290" fill="none" stroke={GOLD} strokeOpacity="0.18" strokeWidth="1" />
    </svg>
  );
}

/* ═══════════════════════════════════════
   Hero
   ═══════════════════════════════════════ */
function HeroSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const c = config.company;
  return (
    <section className="tn-hero">
      <svg className="tn-hero-bg" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <defs>
          <linearGradient id="tnSky" x1="0" y1="0" x2="0.2" y2="1">
            <stop offset="0%" stopColor={NAVY_DEEP} />
            <stop offset="55%" stopColor={NAVY} />
            <stop offset="100%" stopColor="#16324F" />
          </linearGradient>
          <radialGradient id="tnHeroGlow" cx="64%" cy="80%" r="55%">
            <stop offset="0%" stopColor={GOLD} stopOpacity="0.26" />
            <stop offset="55%" stopColor={GOLD} stopOpacity="0.06" />
            <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
          </radialGradient>
          <pattern id="tnHeroGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke={GOLD} strokeOpacity="0.05" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1200" height="700" fill="url(#tnSky)" />
        <rect width="1200" height="700" fill="url(#tnHeroGrid)" />
        <rect width="1200" height="700" fill="url(#tnHeroGlow)" />
        {/* 遠景の稜線 */}
        <rect x="60" y="360" width="120" height="240" fill={NAVY_MID} opacity="0.22" />
        <rect x="1030" y="330" width="150" height="270" fill={NAVY_MID} opacity="0.22" />
        {/* 建築ライン（金の外形線＋奥行きのネイビー面） */}
        <g fill="none" stroke={GOLD} strokeOpacity="0.7" strokeWidth="1.6" strokeLinejoin="round">
          <rect x="200" y="300" width="120" height="300" fill={NAVY_MID} fillOpacity="0.3" />
          <rect x="340" y="220" width="150" height="380" fill={NAVY_MID} fillOpacity="0.4" />
          <polygon points="560,180 660,120 760,180 760,600 560,600" fill={NAVY_MID} fillOpacity="0.5" />
          <rect x="790" y="280" width="120" height="320" fill={NAVY_MID} fillOpacity="0.3" />
        </g>
        {/* 窓（整然と・一部点灯） */}
        {Array.from({ length: 10 }).map((_, r) =>
          Array.from({ length: 4 }).map((_, c) => (
            <rect key={`a${r}-${c}`} x={356 + c * 34} y={240 + r * 35} width="18" height="22" fill={GOLD} fillOpacity={(r + c) % 3 === 0 ? 0.5 : 0.13} />
          ))
        )}
        {Array.from({ length: 11 }).map((_, r) =>
          Array.from({ length: 4 }).map((_, c) => (
            <rect key={`b${r}-${c}`} x={576 + c * 40} y={200 + r * 35} width="22" height="24" fill={GOLD} fillOpacity={(r * 2 + c) % 3 === 0 ? 0.45 : 0.12} />
          ))
        )}
        {/* タワークレーン（建設会社の象徴） */}
        <g fill="none" stroke={GOLD} strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round">
          <line x1="1000" y1="120" x2="1000" y2="600" />
          <line x1="884" y1="150" x2="1116" y2="150" />
          <line x1="1000" y1="120" x2="900" y2="152" />
          <line x1="1000" y1="120" x2="1092" y2="150" />
          <line x1="908" y1="150" x2="908" y2="196" />
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`m${i}`} x1="994" y1={150 + i * 50} x2="1006" y2={175 + i * 50} />
          ))}
          <rect x="898" y="196" width="20" height="14" fill={GOLD} fillOpacity="0.5" stroke="none" />
        </g>
        {/* 地表 */}
        <rect y="600" width="1200" height="100" fill={NAVY_DEEP} />
        <line x1="0" y1="600" x2="1200" y2="600" stroke={GOLD} strokeWidth="1.5" strokeDasharray="40 20" opacity="0.4" />
      </svg>
      <div className="tn-hero-overlay" />
      <div className="tn-hero-inner">
        <div className="tn-badge">
          <span className="tn-badge-dot" />
          <span>since {c.since}</span>
        </div>
        <E fieldId="company.tagline" value={c.tagline} {...ep}>
          <h1 className="tn-hero-title">{c.tagline}</h1>
        </E>
        <E fieldId="company.description" value={c.description} {...ep}>
          <p className="tn-hero-desc">{c.description}</p>
        </E>
        <div className="tn-hero-cta">
          <a href="#contact" className="tn-btn tn-btn-gold">お問い合わせ</a>
          <a href="#works" className="tn-btn tn-btn-ghost">施工実績を見る <ArrowRight size={14} /></a>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Services（事業内容）
   ═══════════════════════════════════════ */
function ServicesSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const services = config.services || [];
  if (services.length === 0) return null;
  return (
    <section id="service" className="tn-sec" style={{ background: "#fff" }}>
      <div className="tn-wrap">
        <Eyebrow en="SERVICE" ja="事業内容" />
        <div className="tn-grid tn-grid-services">
          {services.map((s, i) => {
            const Icon = SERVICE_ICONS[s.icon || "Building2"] || Building2;
            return (
              <E key={i} fieldId={`services.${i}.title`} value={s.title} {...ep}>
                <div className="tn-service-card">
                  <div className="tn-service-icon"><Icon size={26} strokeWidth={1.5} /></div>
                  <h3 className="tn-service-title">{s.title}</h3>
                  <p className="tn-body">{s.description}</p>
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
   Works（施工実績）
   ═══════════════════════════════════════ */
function WorksSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const projects = config.projects || [];
  if (projects.length === 0) return null;
  return (
    <section id="works" className="tn-sec" style={{ background: MIST }}>
      <div className="tn-wrap">
        <Eyebrow en="WORKS" ja="施工実績" />
        <div className="tn-grid tn-grid-works">
          {projects.map((p, i) => (
            <div key={p.id} className="tn-work-card">
              <E fieldId={`projects.${i}.image`} value={p.image || ""} type="image" {...ep}>
                <div className="tn-work-img">
                  {p.image
                    ? <img src={p.image} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    : <BuildingArt seed={i} category={p.category} />}
                  <span className="tn-work-cat">{p.category}</span>
                </div>
              </E>
              <div className="tn-work-body">
                <E fieldId={`projects.${i}.title`} value={p.title} {...ep}>
                  <h3 className="tn-work-title">{p.title}</h3>
                </E>
                <div className="tn-work-meta">
                  {p.specs && <span><Ruler size={12} /> {p.specs}</span>}
                  <span>{p.year}</span>
                </div>
                {p.description && (
                  <E fieldId={`projects.${i}.description`} value={p.description} {...ep}>
                    <p className="tn-body" style={{ marginTop: 8 }}>{p.description}</p>
                  </E>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Stats（数字で見る実績）
   ═══════════════════════════════════════ */
function StatsSection({ config }: { config: SiteConfig; ep: EP }) {
  const stats = config.stats || [];
  if (stats.length === 0) return null;
  return (
    <section className="tn-stats-band">
      <div className="tn-wrap tn-grid tn-grid-stats">
        {stats.map((s, i) => (
          <div key={i} className="tn-stat">
            <p className="tn-stat-num">{s.num}<span>{s.unit}</span></p>
            <span className="tn-stat-tick" />
            <p className="tn-stat-label">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   About（会社概要）
   ═══════════════════════════════════════ */
function AboutSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const c = config.company;
  const rows: [string, string | undefined][] = [
    ["商号", c.name],
    ["英文社名", c.nameEn],
    ["代表者", c.ceo ? `代表取締役 ${c.ceo}` : undefined],
    ["設立", c.since ? `${c.since}年` : undefined],
    ["資本金", c.capital],
    ["従業員数", c.employees],
    ["所在地", c.address],
    ["TEL / FAX", c.fax ? `${c.phone} / ${c.fax}` : c.phone],
    ["許認可", c.license],
    ["認証", c.iso],
    ["Webサイト", c.domain],
  ];
  const visible = rows.filter((r) => r[1]);
  return (
    <section id="about" className="tn-sec" style={{ background: "#fff" }}>
      <div className="tn-wrap" style={{ maxWidth: 1000 }}>
        <Eyebrow en="COMPANY" ja="会社概要" />
        <E fieldId="company.bio" value={c.bio} {...ep}>
          <div className="tn-ceo">
            <p className="tn-ceo-label">代表メッセージ</p>
            <div className="tn-ceo-body">
              {c.bio.split("\n\n").map((para, i) => <p key={i} style={{ margin: i > 0 ? "12px 0 0" : 0 }}>{para}</p>)}
            </div>
            {c.ceo && <p className="tn-ceo-name">代表取締役　{c.ceo}</p>}
          </div>
        </E>
        <div className="tn-table">
          {visible.map(([label, value], i) => (
            <div key={label} className="tn-table-row" style={{ borderTop: i > 0 ? `1px solid ${MIST}` : "none" }}>
              <div className="tn-table-key">{label}</div>
              <div className="tn-table-val">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Testimonials（お客様の声）
   ═══════════════════════════════════════ */
function TestimonialsSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const items = config.testimonials || [];
  if (items.length === 0) return null;
  return (
    <section className="tn-sec" style={{ background: MIST }}>
      <div className="tn-wrap">
        <Eyebrow en="VOICE" ja="お客様の声" />
        <div className="tn-grid tn-grid-voice">
          {items.map((t, i) => (
            <E key={i} fieldId={`testimonials.${i}.text`} value={t.text} {...ep}>
              <div className="tn-voice-card">
                <div className="tn-stars">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={14} fill={s < (t.rating || 5) ? GOLD : "none"} color={s < (t.rating || 5) ? GOLD : "#D1D9E3"} />
                  ))}
                </div>
                <p className="tn-voice-text">「{t.text}」</p>
                <p className="tn-voice-name">{t.name}<span> / {t.project}</span></p>
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
  const news = config.news || [];
  if (news.length === 0) return null;
  return (
    <section className="tn-sec" style={{ background: "#fff" }}>
      <div className="tn-wrap" style={{ maxWidth: 900 }}>
        <Eyebrow en="NEWS" ja="お知らせ" />
        <div>
          {news.map((n, i) => (
            <E key={i} fieldId={`news.${i}.title`} value={n.title} {...ep}>
              <div className="tn-news-row">
                <span className="tn-news-date">{n.date}</span>
                <span className="tn-news-cat">{n.category}</span>
                <span className="tn-news-title">{n.title}</span>
              </div>
            </E>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Recruit（採用情報）
   ═══════════════════════════════════════ */
function RecruitSection({ config }: { config: SiteConfig; ep: EP }) {
  const jobs = config.jobs || [];
  if (jobs.length === 0) return null;
  return (
    <section id="recruit" className="tn-sec tn-recruit">
      <div className="tn-wrap" style={{ maxWidth: 1000 }}>
        <Eyebrow en="RECRUIT" ja="採用情報" light />
        <div className="tn-grid tn-grid-jobs">
          {jobs.map((j) => (
            <div key={j.id} className="tn-job-card">
              <div className="tn-job-head">
                <h3 className="tn-job-title">{j.title}</h3>
                <span className="tn-job-type">{j.type}</span>
              </div>
              <div className="tn-job-meta">
                {j.location && <span><MapPin size={12} /> {j.location}</span>}
                {j.salary && <span>{j.salary}</span>}
              </div>
              {j.description && <p className="tn-body" style={{ marginTop: 10 }}>{j.description}</p>}
              {j.duties?.length > 0 && (
                <div className="tn-job-block">
                  <p className="tn-job-block-label">主な業務</p>
                  <ul className="tn-job-list">{j.duties.map((d, k) => <li key={k}>{d}</li>)}</ul>
                </div>
              )}
              {j.requirements?.length > 0 && (
                <div className="tn-job-block">
                  <p className="tn-job-block-label">応募資格</p>
                  <ul className="tn-job-list">{j.requirements.map((r, k) => <li key={k}>{r}</li>)}</ul>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="tn-recruit-note">応募・お問い合わせは下記の連絡先までお気軽にどうぞ。</p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Contact（お問い合わせ）
   ═══════════════════════════════════════ */
function ContactSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const c = config.company;
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" className="tn-sec" style={{ background: MIST }}>
      <div className="tn-wrap" style={{ maxWidth: 900 }}>
        <Eyebrow en="CONTACT" ja="お問い合わせ" />
        <div className="tn-contact-cards">
          <E fieldId="company.phone" value={c.phone} {...ep}>
            <a href={`tel:${c.phone}`} className="tn-contact-card">
              <Phone size={20} color={NAVY} />
              <span className="tn-contact-card-label">お電話</span>
              <span className="tn-contact-card-val">{c.phone}</span>
              {c.hours && <span className="tn-contact-card-sub"><Clock size={11} /> {c.hours}</span>}
            </a>
          </E>
          <E fieldId="company.email" value={c.email} {...ep}>
            <a href={`mailto:${c.email}`} className="tn-contact-card">
              <Mail size={20} color={NAVY} />
              <span className="tn-contact-card-label">メール</span>
              <span className="tn-contact-card-val">{c.email}</span>
              {c.address && <span className="tn-contact-card-sub"><MapPin size={11} /> {c.address}</span>}
            </a>
          </E>
        </div>
        {sent ? (
          <div className="tn-thanks">
            <div className="tn-thanks-icon"><Check size={22} color={NAVY} /></div>
            <p className="tn-thanks-title">送信ありがとうございます</p>
            <p className="tn-body">担当者より折り返しご連絡いたします。</p>
          </div>
        ) : (
          <form className="tn-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <div className="tn-form-row">
              <label>会社名・お名前<input type="text" required placeholder="例：○○株式会社 山田" /></label>
              <label>メールアドレス<input type="email" required placeholder="info@example.com" /></label>
            </div>
            <label>お問い合わせ内容<textarea rows={5} required placeholder="ご相談内容をご記入ください。" /></label>
            <button type="submit" className="tn-btn tn-btn-navy">送信する</button>
          </form>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   セクション→コンポーネントのマッピング
   ═══════════════════════════════════════ */
const SECTION_COMPONENTS: Record<string, (props: { config: SiteConfig; ep: EP }) => React.ReactNode> = {
  hero: HeroSection,
  services: ServicesSection,
  works: WorksSection,
  stats: StatsSection,
  about: AboutSection,
  testimonials: TestimonialsSection,
  news: NewsSection,
  recruit: RecruitSection,
  contact: ContactSection,
};

/* ═══════════════════════════════════════
   スコープCSS（.tn-root 配下だけに効く。固定色 + レスポンシブ）
   ═══════════════════════════════════════ */
const STYLES = `
.tn-root { font-family: 'Noto Sans JP', system-ui, sans-serif; color: ${NAVY}; background: #fff; }
.tn-root * { box-sizing: border-box; }
.tn-root img { max-width: 100%; }
.tn-wrap { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.tn-sec { padding: 72px 0; }
.tn-body { font-size: 14px; line-height: 1.9; color: ${NAVY_MID}; }
.tn-grid { display: grid; gap: 20px; }
.tn-grid-services { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
.tn-grid-works { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
.tn-grid-voice { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
.tn-grid-jobs { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
.tn-grid-stats { grid-template-columns: repeat(4, 1fr); gap: 16px; }

/* Header */
.tn-head { position: sticky; top: 0; z-index: 50; background: rgba(13,36,64,0.9); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.08); }
.tn-head.tn-head-static { position: relative; }
.tn-head-inner { max-width: 1200px; margin: 0 auto; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.tn-head-name { color: #fff; font-weight: 700; font-size: 16px; letter-spacing: 0.02em; }
.tn-head-en { color: rgba(255,255,255,0.45); font-size: 9px; letter-spacing: 0.15em; display: block; }
.tn-head-nav { display: flex; align-items: center; gap: 22px; }
.tn-head-nav a { color: rgba(255,255,255,0.75); font-size: 13px; text-decoration: none; transition: color 0.2s; }
.tn-head-nav a:hover { color: ${GOLD}; }
.tn-head-tel { display: inline-flex; align-items: center; gap: 6px; color: ${GOLD}; font-size: 13px; font-weight: 600; text-decoration: none; }

/* Hero */
.tn-hero { position: relative; min-height: 620px; display: flex; align-items: center; overflow: hidden; }
.tn-hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; }
.tn-hero-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(13,36,64,0.85) 0%, rgba(27,58,92,0.45) 55%, transparent 100%); }
.tn-hero-inner { position: relative; z-index: 2; max-width: 1200px; width: 100%; margin: 0 auto; padding: 56px 24px; }
.tn-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border: 1px solid rgba(200,169,110,0.4); color: ${GOLD}; font-size: 12px; letter-spacing: 0.2em; margin-bottom: 22px; }
.tn-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: ${GOLD}; }
.tn-hero-title { font-family: ${SERIF}; color: #fff; font-weight: 700; line-height: 1.3; font-size: clamp(1.9rem, 5vw, 3.4rem); letter-spacing: 0.01em; margin: 0 0 18px; }
.tn-hero-desc { color: rgba(255,255,255,0.65); font-size: 15px; line-height: 1.9; max-width: 540px; margin: 0 0 32px; }
.tn-hero-cta { display: flex; flex-wrap: wrap; gap: 12px; }
.tn-btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 30px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 2px; transition: all 0.2s; cursor: pointer; border: none; }
.tn-btn-gold { background: ${GOLD}; color: ${NAVY_DEEP}; }
.tn-btn-gold:hover { background: #d8bd85; }
.tn-btn-ghost { border: 1px solid rgba(255,255,255,0.3); color: #fff; background: transparent; }
.tn-btn-ghost:hover { background: rgba(255,255,255,0.1); }
.tn-btn-navy { background: ${NAVY}; color: #fff; justify-content: center; }
.tn-btn-navy:hover { background: ${NAVY_MID}; }

/* Services */
.tn-service-card { padding: 28px 24px; border: 1px solid ${MIST}; background: #fff; height: 100%; transition: box-shadow 0.25s, transform 0.25s, border-color 0.25s; }
.tn-service-card:hover { border-color: rgba(27,58,92,0.2); box-shadow: 0 14px 30px rgba(27,58,92,0.1); transform: translateY(-3px); }
.tn-service-icon { width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; background: ${MIST}; color: ${NAVY}; margin-bottom: 18px; transition: background 0.25s, color 0.25s; }
.tn-service-card:hover .tn-service-icon { background: ${NAVY}; color: #fff; }
.tn-service-title { font-size: 16px; font-weight: 700; color: ${NAVY}; margin: 0 0 10px; }

/* Works */
.tn-work-card { background: #fff; overflow: hidden; box-shadow: 0 2px 10px rgba(27,58,92,0.07); }
.tn-work-img { position: relative; height: 200px; overflow: hidden; }
.tn-work-cat { position: absolute; top: 12px; left: 12px; background: rgba(13,36,64,0.85); color: ${GOLD}; font-size: 11px; padding: 4px 10px; letter-spacing: 0.05em; }
.tn-work-body { padding: 18px 18px 22px; }
.tn-work-title { font-size: 16px; font-weight: 700; color: ${NAVY}; margin: 0 0 8px; }
.tn-work-meta { display: flex; flex-wrap: wrap; gap: 14px; font-size: 12px; color: ${NAVY_MID}; }
.tn-work-meta span { display: inline-flex; align-items: center; gap: 4px; }

/* Stats band */
.tn-stats-band { background: linear-gradient(180deg, ${NAVY} 0%, ${NAVY_DEEP} 100%); padding: 54px 0; border-top: 1px solid rgba(200,169,110,0.28); border-bottom: 1px solid rgba(200,169,110,0.28); }
.tn-stat { text-align: center; padding: 4px 8px; }
.tn-grid-stats .tn-stat + .tn-stat { border-left: 1px solid rgba(200,169,110,0.16); }
.tn-stat-num { font-family: ${SERIF}; color: #fff; font-weight: 700; font-size: clamp(2rem, 4.4vw, 2.9rem); line-height: 1; margin: 0; }
.tn-stat-num span { color: ${GOLD}; font-size: 0.46em; margin-left: 4px; font-weight: 500; }
.tn-stat-tick { display: block; width: 26px; height: 2px; background: ${GOLD}; opacity: 0.85; margin: 12px auto 0; }
.tn-stat-label { color: rgba(255,255,255,0.55); font-size: 12px; letter-spacing: 0.08em; margin: 10px 0 0; }

/* About */
.tn-ceo { padding: 32px; background: ${MIST}; border-left: 4px solid ${GOLD}; margin-bottom: 36px; }
.tn-ceo-label { color: ${GOLD}; font-size: 12px; letter-spacing: 0.2em; font-weight: 600; margin: 0 0 16px; }
.tn-ceo-body { color: ${NAVY}; font-size: 15px; line-height: 2; }
.tn-ceo-name { color: ${NAVY_MID}; font-size: 14px; margin: 20px 0 0; text-align: right; }
.tn-table { border: 1px solid ${MIST}; }
.tn-table-row { display: flex; flex-direction: row; }
.tn-table-key { width: 176px; flex-shrink: 0; padding: 14px 20px; background: ${NAVY}; color: #fff; font-size: 14px; font-weight: 600; }
.tn-table-val { flex: 1; padding: 14px 20px; background: #fff; color: ${NAVY_MID}; font-size: 14px; }

/* Voice */
.tn-voice-card { padding: 26px 24px; background: #fff; border: 1px solid ${MIST}; height: 100%; }
.tn-stars { display: flex; gap: 3px; margin-bottom: 14px; }
.tn-voice-text { color: ${NAVY}; font-size: 14px; line-height: 1.9; margin: 0 0 14px; }
.tn-voice-name { color: ${NAVY_MID}; font-size: 13px; font-weight: 600; margin: 0; }
.tn-voice-name span { font-weight: 400; color: #8fa0b3; }

/* News */
.tn-news-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: 14px; padding: 14px 0; border-bottom: 1px solid ${MIST}; }
.tn-news-date { color: #8fa0b3; font-size: 13px; flex-shrink: 0; }
.tn-news-cat { color: ${GOLD}; font-size: 11px; border: 1px solid ${GOLD}; padding: 2px 10px; flex-shrink: 0; }
.tn-news-title { color: ${NAVY}; font-size: 14px; }

/* Recruit */
.tn-recruit { background: ${NAVY_DEEP}; }
.tn-job-card { padding: 26px 24px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); }
.tn-job-head { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.tn-job-title { color: #fff; font-size: 17px; font-weight: 700; margin: 0; }
.tn-job-type { color: ${NAVY_DEEP}; background: ${GOLD}; font-size: 11px; font-weight: 700; padding: 3px 10px; }
.tn-job-meta { display: flex; flex-wrap: wrap; gap: 14px; color: rgba(255,255,255,0.6); font-size: 13px; }
.tn-job-meta span { display: inline-flex; align-items: center; gap: 4px; }
.tn-recruit .tn-body { color: rgba(255,255,255,0.6); }
.tn-job-block { margin-top: 14px; }
.tn-job-block-label { color: ${GOLD}; font-size: 12px; font-weight: 600; margin: 0 0 6px; }
.tn-job-list { margin: 0; padding-left: 18px; color: rgba(255,255,255,0.72); font-size: 13px; line-height: 1.9; }
.tn-recruit-note { color: rgba(255,255,255,0.5); font-size: 13px; text-align: center; margin: 32px 0 0; }

/* Contact */
.tn-contact-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 32px; }
.tn-contact-card { display: flex; flex-direction: column; gap: 4px; padding: 24px; background: #fff; border: 1px solid ${MIST}; text-decoration: none; transition: box-shadow 0.2s; }
.tn-contact-card:hover { box-shadow: 0 10px 24px rgba(27,58,92,0.1); }
.tn-contact-card-label { color: ${NAVY_MID}; font-size: 12px; margin-top: 8px; }
.tn-contact-card-val { color: ${NAVY}; font-size: 18px; font-weight: 700; }
.tn-contact-card-sub { color: #8fa0b3; font-size: 12px; display: inline-flex; align-items: center; gap: 5px; margin-top: 2px; }
.tn-form { display: flex; flex-direction: column; gap: 18px; background: #fff; padding: 32px; border: 1px solid ${MIST}; }
.tn-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.tn-form label { display: flex; flex-direction: column; gap: 8px; font-size: 13px; font-weight: 600; color: ${NAVY}; }
.tn-form input, .tn-form textarea { padding: 12px 14px; border: 1px solid ${MIST}; border-radius: 2px; font-size: 14px; color: ${NAVY}; font-family: inherit; outline: none; }
.tn-form input:focus, .tn-form textarea:focus { border-color: ${GOLD}; }
.tn-form textarea { resize: vertical; }
.tn-thanks { text-align: center; padding: 48px 24px; background: #fff; border: 1px solid ${MIST}; }
.tn-thanks-icon { width: 52px; height: 52px; border-radius: 50%; background: ${MIST}; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
.tn-thanks-title { color: ${NAVY}; font-size: 16px; font-weight: 700; margin: 0 0 6px; }

/* Footer */
.tn-foot { background: ${NAVY_DEEP}; color: #fff; padding: 44px 24px; }
.tn-foot-inner { max-width: 1200px; margin: 0 auto; text-align: center; }
.tn-foot-name { font-weight: 700; font-size: 16px; margin: 0 0 6px; }
.tn-foot-en { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 0.15em; margin: 0 0 14px; }
.tn-foot-info { color: rgba(255,255,255,0.55); font-size: 13px; line-height: 1.9; margin: 0; }
.tn-foot-copy { color: rgba(255,255,255,0.3); font-size: 11px; margin: 18px 0 0; }

@media (max-width: 860px) {
  .tn-head-nav a { display: none; }
  .tn-grid-stats { grid-template-columns: repeat(2, 1fr); }
  .tn-grid-stats .tn-stat + .tn-stat { border-left: none; }
  .tn-table-key { width: 120px; }
}
@media (max-width: 600px) {
  .tn-form-row { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .tn-root * { transition: none !important; }
}
`;

/* ═══════════════════════════════════════
   メインRenderer
   ═══════════════════════════════════════ */
export default function TrustNavyRenderer({ config, editMode = false, onFieldClick, changedFields }: Props) {
  const c = config.company;
  const sections = getSections(config);
  const ep: EP = { editMode, onFieldClick, changedFields };

  return (
    <div className="tn-root" onClick={(e) => { if (editMode && (e.target as HTMLElement).closest("a")) e.preventDefault(); }}>
      <style>{STYLES}</style>

      {/* ─── Header（常に表示） ─── */}
      <header className={`tn-head${editMode ? " tn-head-static" : ""}`}>
        <div className="tn-head-inner">
          <E fieldId="company.name" value={c.name} {...ep}>
            <div>
              <span className="tn-head-name">{c.name}</span>
              {c.nameEn && <span className="tn-head-en">{c.nameEn}</span>}
            </div>
          </E>
          <nav className="tn-head-nav">
            <a href="#service">事業内容</a>
            <a href="#works">施工実績</a>
            <a href="#about">会社概要</a>
            <a href="#contact">お問い合わせ</a>
            <a href={`tel:${c.phone}`} className="tn-head-tel"><Phone size={14} /> {c.phone}</a>
          </nav>
        </div>
      </header>

      {/* ─── セクション（sections配列の順序で描画） ─── */}
      {sections.map((section) => {
        if (!section.visible) return null;
        const Component = SECTION_COMPONENTS[section.type];
        if (!Component) return null;
        return <Component key={section.type} config={config} ep={ep} />;
      })}

      {/* ─── Footer（常に表示） ─── */}
      <footer className="tn-foot">
        <div className="tn-foot-inner">
          <p className="tn-foot-name">{c.name}</p>
          {c.nameEn && <p className="tn-foot-en">{c.nameEn}</p>}
          <p className="tn-foot-info">
            {c.address}<br />
            TEL {c.phone}{c.fax ? ` / FAX ${c.fax}` : ""}　{c.hours}
          </p>
          <p className="tn-foot-copy">© {new Date().getFullYear()} {c.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
