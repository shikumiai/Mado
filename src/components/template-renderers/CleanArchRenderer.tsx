"use client";

import { useState } from "react";
import { Mail, Phone, Check, ArrowUpRight } from "lucide-react";
import type { SiteConfig } from "@/lib/site-config-schema";
import { getSections } from "@/lib/site-config-schema";

/**
 * clean-arch テンプレートの描画コンポーネント（設計事務所向け）
 *
 * 余白の効いたミニマル白基調。細字・広い余白・ヘアライン。
 * 固定のモノトーン + ストーン系パレット（アプリのダークモードに引きずられない）。
 * sections配列の順序でセクションを描く。会社情報は全て config から差し込む。
 */

/* ─── 固定パレット ─── */
const INK = "#2B2B2B";
const SUB = "#8A8A84";
const FAINT = "#B8B8B2";
const LINE = "#EAEAE6";
const STONE1 = "#D8D3C8";
const STONE2 = "#C3BCAD";

/* 作品プレースホルダーのパターン */
const ARCH_STONES: [string, string][] = [
  ["#D9D4C9", "#C5BDAD"], ["#D2CCC1", "#BEB6A5"],
  ["#DAD5CB", "#C8C0B0"], ["#CFC9BD", "#BBB2A1"],
  ["#D6D1C6", "#C2BAAA"], ["#D0CABE", "#BAB1A0"],
  ["#DBD6CC", "#C6BEAE"], ["#CDC7BB", "#B9B09F"],
];

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
        cursor: "pointer", position: "relative", borderRadius: 2,
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

function ArchArt({ seed }: { seed: number }) {
  const [c1, c2] = ARCH_STONES[seed % ARCH_STONES.length];
  const variant = seed % 4;
  return (
    <svg viewBox="0 0 600 460" style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="460" fill="#EFEDE7" />
      {variant === 0 && (<>
        <rect x="130" y="150" width="340" height="230" fill={c1} />
        <rect x="130" y="140" width="340" height="14" fill={c2} />
        <rect x="170" y="190" width="130" height="130" fill="#fff" opacity="0.5" />
        <line x1="235" y1="190" x2="235" y2="320" stroke={c2} strokeWidth="1.5" />
        <rect x="340" y="230" width="90" height="120" fill={c2} opacity="0.55" />
      </>)}
      {variant === 1 && (<>
        <rect x="90" y="220" width="180" height="160" fill={c1} />
        <rect x="290" y="130" width="220" height="250" fill={c2} opacity="0.9" />
        <rect x="120" y="250" width="70" height="90" fill="#fff" opacity="0.45" />
        <rect x="330" y="165" width="55" height="70" fill="#fff" opacity="0.45" />
      </>)}
      {variant === 2 && (<>
        <rect x="70" y="250" width="460" height="110" fill={c1} />
        <rect x="70" y="240" width="460" height="12" fill={c2} />
        <rect x="110" y="275" width="170" height="70" fill="#fff" opacity="0.5" />
        <rect x="360" y="285" width="55" height="75" fill={c2} opacity="0.5" />
      </>)}
      {variant === 3 && (<>
        <rect x="160" y="110" width="150" height="270" fill={c1} />
        <rect x="310" y="190" width="180" height="190" fill={c2} opacity="0.85" />
        <rect x="185" y="140" width="100" height="70" fill="#fff" opacity="0.5" />
      </>)}
      <line x1="0" y1="382" x2="600" y2="382" stroke={c2} strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

/* ═══════════════════════════════════════
   Hero
   ═══════════════════════════════════════ */
function HeroSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const c = config.company;
  return (
    <section className="ca-hero">
      <div className="ca-hero-inner">
        <p className="ca-hero-eyebrow">ARCHITECTURE &amp; DESIGN</p>
        <E fieldId="company.tagline" value={c.tagline} {...ep}>
          <h1 className="ca-hero-title">{c.tagline}</h1>
        </E>
        <div className="ca-hero-rule" />
        <div className="ca-hero-meta">
          <E fieldId="company.name" value={c.name} {...ep}>
            <span>{c.name}</span>
          </E>
          <span className="ca-hero-sep">/</span>
          <E fieldId="company.description" value={c.description} {...ep}>
            <span>{c.description}</span>
          </E>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Works（作品一覧）
   ═══════════════════════════════════════ */
function WorksSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const projects = config.projects || [];
  if (projects.length === 0) return null;
  return (
    <section id="works" className="ca-sec">
      <div className="ca-wrap">
        <div className="ca-head-row">
          <p className="ca-eyebrow">SELECTED WORKS</p>
          <h2 className="ca-h2">作品一覧</h2>
        </div>
        <div className="ca-grid-works">
          {projects.map((p, i) => (
            <div key={p.id} className={`ca-work${p.size === "portrait" ? " ca-work-tall" : ""}`}>
              <E fieldId={`projects.${i}.image`} value={p.image || ""} type="image" {...ep}>
                <div className="ca-work-img">
                  {p.image
                    ? <img src={p.image} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    : <ArchArt seed={i} />}
                </div>
              </E>
              <div className="ca-work-cap">
                <E fieldId={`projects.${i}.title`} value={p.title} {...ep}>
                  <p className="ca-work-title">{p.titleEn || p.title}</p>
                </E>
                <div className="ca-work-meta">
                  <E fieldId={`projects.${i}.category`} value={p.category} {...ep}><span>{p.category}</span></E>
                  <E fieldId={`projects.${i}.year`} value={p.year} {...ep}><span>{p.year}</span></E>
                </div>
                {p.description && (
                  <E fieldId={`projects.${i}.description`} value={p.description} {...ep}>
                    <p className="ca-work-desc">{p.description}</p>
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
   About（設計者紹介）
   ═══════════════════════════════════════ */
function AboutSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const c = config.company;
  const facts: [string, string | undefined][] = [
    ["設立", c.since ? `${c.since}年` : undefined],
    ["所在地", c.address],
    ["資格", c.ceoTitle],
    ["登録", c.license],
  ];
  return (
    <section id="about" className="ca-sec ca-sec-line">
      <div className="ca-wrap">
        <p className="ca-eyebrow" style={{ marginBottom: 44 }}>ABOUT</p>
        <div className="ca-about">
          <div>
            <E fieldId="company.ceoPhoto" value={c.ceoPhoto || ""} type="image" {...ep}>
              <div className="ca-portrait">
                {c.ceoPhoto
                  ? <img src={c.ceoPhoto} alt={c.ceo} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  : (
                    <svg viewBox="0 0 400 500" style={{ width: "100%", height: "100%", display: "block" }} xmlns="http://www.w3.org/2000/svg">
                      <rect width="400" height="500" fill="#E4E1D9" />
                      <circle cx="200" cy="175" r="58" fill={STONE2} />
                      <ellipse cx="200" cy="370" rx="82" ry="98" fill={STONE2} />
                      <line x1="60" y1="460" x2="340" y2="460" stroke={STONE1} strokeWidth="1" />
                    </svg>
                  )}
              </div>
            </E>
            <div className="ca-portrait-cap">
              <E fieldId="company.ceo" value={c.ceo || ""} {...ep}>
                <p className="ca-portrait-name">{c.ceo}</p>
              </E>
              {c.ceoTitle && (
                <E fieldId="company.ceoTitle" value={c.ceoTitle} {...ep}>
                  <p className="ca-portrait-role">{c.ceoTitle}</p>
                </E>
              )}
            </div>
          </div>
          <div className="ca-about-body">
            <E fieldId="company.bio" value={c.bio} {...ep}>
              <div className="ca-bio">
                {c.bio.split("\n\n").map((para, i) => <p key={i} style={{ margin: i > 0 ? "18px 0 0" : 0 }}>{para}</p>)}
              </div>
            </E>
            <div className="ca-about-rule" />
            <div className="ca-facts">
              {facts.filter((f) => f[1]).map(([label, value]) => (
                <div key={label} className="ca-fact"><span className="ca-fact-key">{label}</span><span>{value}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Awards（受賞歴）
   ═══════════════════════════════════════ */
function AwardsSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const awards = config.awards || [];
  if (awards.length === 0) return null;
  return (
    <section id="awards" className="ca-sec ca-sec-line">
      <div className="ca-wrap" style={{ maxWidth: 900 }}>
        <p className="ca-eyebrow" style={{ marginBottom: 44 }}>AWARDS</p>
        <div>
          {awards.map((a, i) => (
            <E key={i} fieldId={`awards.${i}.title`} value={a.title} {...ep}>
              <div className="ca-award-row">
                <span className="ca-award-year">{a.year}</span>
                <div>
                  <p className="ca-award-title">{a.title}</p>
                  {a.project && <p className="ca-award-project">{a.project}</p>}
                </div>
              </div>
            </E>
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
    <section className="ca-sec ca-sec-line">
      <div className="ca-wrap">
        <p className="ca-eyebrow" style={{ marginBottom: 44 }}>VOICE</p>
        <div className="ca-grid-voice">
          {items.map((t, i) => (
            <E key={i} fieldId={`testimonials.${i}.text`} value={t.text} {...ep}>
              <div className="ca-voice">
                <p className="ca-voice-text">「{t.text}」</p>
                <p className="ca-voice-name">{t.name} — {t.project}</p>
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
    <section className="ca-sec ca-sec-line">
      <div className="ca-wrap" style={{ maxWidth: 900 }}>
        <p className="ca-eyebrow" style={{ marginBottom: 44 }}>NEWS</p>
        <div>
          {news.map((n, i) => (
            <E key={i} fieldId={`news.${i}.title`} value={n.title} {...ep}>
              <div className="ca-news-row">
                <span className="ca-news-date">{n.date}</span>
                <span className="ca-news-title">{n.title}</span>
              </div>
            </E>
          ))}
        </div>
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
    <section id="contact" className="ca-sec ca-sec-line">
      <div className="ca-wrap" style={{ maxWidth: 720 }}>
        <p className="ca-eyebrow" style={{ marginBottom: 16 }}>CONTACT</p>
        <p className="ca-contact-lead">お気軽にお問い合わせください。</p>
        <div className="ca-contact-links">
          <E fieldId="company.email" value={c.email} {...ep}>
            <a href={`mailto:${c.email}`} className="ca-contact-link"><Mail size={16} color={FAINT} strokeWidth={1.5} /> {c.email}</a>
          </E>
          <E fieldId="company.phone" value={c.phone} {...ep}>
            <a href={`tel:${c.phone}`} className="ca-contact-link"><Phone size={16} color={FAINT} strokeWidth={1.5} /> {c.phone}</a>
          </E>
        </div>
        {sent ? (
          <div className="ca-thanks">
            <div className="ca-thanks-icon"><Check size={20} color={SUB} /></div>
            <p className="ca-thanks-title">送信ありがとうございます</p>
            <p className="ca-thanks-sub">3営業日以内にご返信いたします。</p>
          </div>
        ) : (
          <form className="ca-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <div className="ca-form-row">
              <label className="ca-field"><span>お名前</span><input type="text" required placeholder="高橋 花子" /></label>
              <label className="ca-field"><span>メールアドレス</span><input type="email" required placeholder="hello@example.com" /></label>
            </div>
            <label className="ca-field"><span>ご相談内容</span><textarea rows={5} required placeholder="ご計画の概要をお聞かせください。" /></label>
            <button type="submit" className="ca-submit">SEND MESSAGE <ArrowUpRight size={15} /></button>
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
  about: AboutSection,
  awards: AwardsSection,
  testimonials: TestimonialsSection,
  news: NewsSection,
  contact: ContactSection,
};

/* ═══════════════════════════════════════
   スコープCSS
   ═══════════════════════════════════════ */
const STYLES = `
.ca-root { font-family: 'Noto Sans JP', system-ui, sans-serif; color: ${INK}; background: #fff; font-weight: 300; }
.ca-root * { box-sizing: border-box; }
.ca-root img { max-width: 100%; }
.ca-wrap { max-width: 1240px; margin: 0 auto; padding: 0 32px; }
.ca-sec { padding: 96px 0; background: #fff; }
.ca-sec-line { border-top: 1px solid ${LINE}; }
.ca-eyebrow { font-size: 10px; letter-spacing: 0.45em; color: ${FAINT}; margin: 0; font-weight: 400; }
.ca-h2 { font-size: 24px; font-weight: 300; letter-spacing: 0.1em; color: ${INK}; margin: 8px 0 0; }
.ca-head-row { margin-bottom: 56px; }

/* Header */
.ca-head { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,0.94); backdrop-filter: blur(12px); border-bottom: 1px solid ${LINE}; }
.ca-head.ca-head-static { position: relative; }
.ca-head-inner { max-width: 1240px; margin: 0 auto; padding: 0 32px; height: 62px; display: flex; align-items: center; justify-content: space-between; }
.ca-head-name { font-size: 14px; font-weight: 300; letter-spacing: 0.28em; color: ${INK}; }
.ca-head-nav { display: flex; align-items: center; gap: 34px; }
.ca-head-nav a { font-size: 11px; letter-spacing: 0.18em; color: ${SUB}; text-decoration: none; transition: color 0.2s; }
.ca-head-nav a:hover { color: ${INK}; }

/* Hero */
.ca-hero { min-height: 78vh; display: flex; align-items: center; justify-content: center; background: #fff; }
.ca-hero-inner { text-align: center; padding: 64px 32px; max-width: 860px; }
.ca-hero-eyebrow { color: ${FAINT}; font-size: 10px; letter-spacing: 0.5em; margin: 0 0 34px; font-weight: 400; }
.ca-hero-title { color: ${INK}; font-weight: 300; line-height: 1.5; font-size: clamp(2rem, 6vw, 3.9rem); letter-spacing: 0.06em; margin: 0; }
.ca-hero-rule { width: 48px; height: 1px; background: ${STONE1}; margin: 32px auto; }
.ca-hero-meta { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 12px; color: ${SUB}; font-size: 14px; letter-spacing: 0.08em; }
.ca-hero-sep { color: ${LINE}; }

/* Works */
.ca-grid-works { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px 20px; }
.ca-work-img { overflow: hidden; height: 280px; background: #EFEDE7; }
.ca-work-tall .ca-work-img { height: 420px; }
.ca-work-cap { padding: 14px 2px 4px; }
.ca-work-title { font-size: 14px; font-weight: 300; color: ${INK}; letter-spacing: 0.1em; margin: 0 0 4px; }
.ca-work-meta { display: flex; gap: 10px; }
.ca-work-meta span { font-size: 11px; color: ${FAINT}; }
.ca-work-desc { font-size: 13px; color: ${SUB}; line-height: 1.9; margin: 10px 0 0; }

/* About */
.ca-about { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 56px; }
.ca-portrait { aspect-ratio: 4/5; overflow: hidden; }
.ca-portrait-cap { margin-top: 20px; }
.ca-portrait-name { font-size: 20px; font-weight: 300; color: ${INK}; letter-spacing: 0.1em; margin: 0; }
.ca-portrait-role { font-size: 12px; color: ${FAINT}; letter-spacing: 0.1em; margin: 6px 0 0; }
.ca-about-body { display: flex; flex-direction: column; justify-content: center; }
.ca-bio { font-size: 15px; color: ${SUB}; line-height: 2.4; }
.ca-about-rule { width: 32px; height: 1px; background: ${STONE1}; margin: 32px 0; }
.ca-facts { display: flex; flex-direction: column; gap: 14px; }
.ca-fact { display: flex; gap: 24px; font-size: 13px; color: ${SUB}; }
.ca-fact-key { width: 56px; flex-shrink: 0; color: ${FAINT}; }

/* Awards */
.ca-award-row { display: flex; gap: 28px; padding: 18px 0; border-bottom: 1px solid ${LINE}; }
.ca-award-year { font-size: 12px; color: ${FAINT}; flex-shrink: 0; width: 52px; padding-top: 2px; }
.ca-award-title { font-size: 15px; font-weight: 300; color: ${INK}; margin: 0; }
.ca-award-project { font-size: 12px; color: ${FAINT}; margin: 4px 0 0; }

/* Voice */
.ca-grid-voice { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.ca-voice { padding: 28px; border: 1px solid ${LINE}; }
.ca-voice-text { font-size: 14px; color: ${SUB}; line-height: 2.1; margin: 0 0 16px; }
.ca-voice-name { font-size: 11px; color: ${FAINT}; letter-spacing: 0.05em; margin: 0; }

/* News */
.ca-news-row { display: flex; gap: 28px; align-items: baseline; padding: 16px 0; border-bottom: 1px solid ${LINE}; }
.ca-news-date { font-size: 11px; color: ${FAINT}; flex-shrink: 0; width: 84px; }
.ca-news-title { font-size: 14px; font-weight: 300; color: ${INK}; }

/* Contact */
.ca-contact-lead { font-size: 15px; color: ${SUB}; line-height: 1.8; margin: 0 0 40px; font-weight: 300; }
.ca-contact-links { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 44px; }
.ca-contact-link { display: flex; align-items: center; gap: 12px; padding: 16px 18px; border: 1px solid ${LINE}; font-size: 14px; color: ${SUB}; text-decoration: none; transition: border-color 0.2s; }
.ca-contact-link:hover { border-color: ${STONE2}; }
.ca-form { display: flex; flex-direction: column; gap: 26px; }
.ca-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 26px; }
.ca-field { display: flex; flex-direction: column; }
.ca-field span { font-size: 10px; color: ${FAINT}; letter-spacing: 0.2em; margin-bottom: 10px; }
.ca-field input, .ca-field textarea { padding: 10px 0; border: none; border-bottom: 1px solid ${LINE}; font-size: 14px; color: ${INK}; background: transparent; outline: none; font-family: inherit; resize: vertical; transition: border-color 0.2s; }
.ca-field input:focus, .ca-field textarea:focus { border-bottom-color: ${INK}; }
.ca-submit { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 16px; background: ${INK}; color: #fff; font-size: 11px; letter-spacing: 0.22em; border: none; cursor: pointer; transition: background 0.2s; }
.ca-submit:hover { background: #000; }
.ca-thanks { text-align: center; padding: 56px 24px; border: 1px solid ${LINE}; }
.ca-thanks-icon { width: 48px; height: 48px; border: 1px solid ${LINE}; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
.ca-thanks-title { font-size: 15px; font-weight: 300; color: ${INK}; letter-spacing: 0.05em; margin: 0; }
.ca-thanks-sub { font-size: 12px; color: ${FAINT}; margin: 6px 0 0; }

/* Footer */
.ca-foot { padding: 32px; border-top: 1px solid ${LINE}; background: #fff; }
.ca-foot-inner { max-width: 1240px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.ca-foot-top { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; justify-content: center; }
.ca-foot-name { font-size: 12px; font-weight: 300; letter-spacing: 0.28em; color: ${SUB}; }
.ca-foot-addr { font-size: 10px; color: ${FAINT}; }
.ca-foot-copy { font-size: 10px; color: ${FAINT}; margin: 0; }

@media (max-width: 820px) {
  .ca-about { grid-template-columns: 1fr; gap: 36px; }
  .ca-head-nav { gap: 20px; }
}
@media (max-width: 560px) {
  .ca-form-row { grid-template-columns: 1fr; }
  .ca-head-nav a { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .ca-root * { transition: none !important; }
}
`;

/* ═══════════════════════════════════════
   メインRenderer
   ═══════════════════════════════════════ */
export default function CleanArchRenderer({ config, editMode = false, onFieldClick, changedFields }: Props) {
  const c = config.company;
  const name = c.nameEn || c.name;
  const sections = getSections(config);
  const ep: EP = { editMode, onFieldClick, changedFields };

  return (
    <div className="ca-root" onClick={(e) => { if (editMode && (e.target as HTMLElement).closest("a")) e.preventDefault(); }}>
      <style>{STYLES}</style>

      {/* ─── Header ─── */}
      <header className={`ca-head${editMode ? " ca-head-static" : ""}`}>
        <div className="ca-head-inner">
          <E fieldId="company.nameEn" value={c.nameEn || c.name} {...ep}>
            <span className="ca-head-name">{name}</span>
          </E>
          <nav className="ca-head-nav">
            <a href="#works">WORKS</a>
            <a href="#about">ABOUT</a>
            <a href="#contact">CONTACT</a>
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
      <footer className="ca-foot">
        <div className="ca-foot-inner">
          <div className="ca-foot-top">
            <span className="ca-foot-name">{name}</span>
            <E fieldId="company.address" value={c.address} {...ep}>
              <span className="ca-foot-addr">{c.address}</span>
            </E>
          </div>
          <p className="ca-foot-copy">© {new Date().getFullYear()} {c.name}</p>
        </div>
      </footer>
    </div>
  );
}
