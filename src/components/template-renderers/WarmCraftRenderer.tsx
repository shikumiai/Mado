"use client";

import { useState } from "react";
import {
  Phone, Mail, Check, ArrowRight, Star, Calendar, MapPin, Clock, Users2,
  Home, Hammer, Shield, Users, Ruler, HardHat, Leaf, Heart,
} from "lucide-react";
import type { SiteConfig } from "@/lib/site-config-schema";
import { getSections } from "@/lib/site-config-schema";

/**
 * warm-craft テンプレートの描画コンポーネント（工務店・リフォーム向け）
 *
 * 木のぬくもり（クリーム × ブラウン × テラコッタ）の固定パレット。
 * sections配列の順序でセクションを描く。色はテンプレート内で固定し、
 * アプリのダークモードに引きずられない。会社情報は全て config から差し込む。
 */

/* ─── 固定パレット ─── */
const CREAM = "#FBF7F0";
const CREAM_DEEP = "#F3EADD";
const BROWN = "#453222";
const BROWN_MID = "#7A6752";
const TERRA = "#BE5F38";
const WOOD = "#A07850";
const INK_FOOT = "#332417";

const ICON_MAP: Record<string, typeof Home> = {
  Home, Hammer, Shield, Users, Ruler, HardHat, Leaf, Heart,
};

/* 施工実績プレースホルダーの色バリエーション（木・土・緑） */
const WORK_ART = [
  ["#D8C3A5", "#B49B78"],
  ["#C99A6B", "#A9784B"],
  ["#B8A488", "#94805F"],
  ["#CBA98A", "#A6825F"],
  ["#BFA07C", "#9C7D57"],
  ["#D3B48C", "#B08E63"],
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

/* ─── 家のプレースホルダー（画像が無くても成立） ─── */
function HouseArt({ seed }: { seed: number }) {
  const [c1, c2] = WORK_ART[seed % WORK_ART.length];
  return (
    <svg viewBox="0 0 400 240" style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="240" fill={c1} />
      <rect x="0" y="170" width="400" height="70" fill={c2} opacity="0.5" />
      <polygon points="200,50 300,120 100,120" fill={c2} />
      <rect x="120" y="120" width="160" height="90" fill="#fff" opacity="0.85" />
      <rect x="140" y="140" width="45" height="45" fill={c2} opacity="0.4" />
      <rect x="215" y="140" width="45" height="45" fill={c2} opacity="0.4" />
      <rect x="180" y="165" width="30" height="45" fill={c2} opacity="0.6" />
      <circle cx="330" cy="60" r="18" fill="#fff" opacity="0.35" />
    </svg>
  );
}

/* ═══════════════════════════════════════
   Hero
   ═══════════════════════════════════════ */
function HeroSection({ config, ep }: { config: SiteConfig; ep: EP }) {
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
          <rect width="500" height="460" fill={CREAM_DEEP} />
          <circle cx="380" cy="110" r="60" fill={TERRA} opacity="0.15" />
          <rect x="60" y="250" width="380" height="180" fill={WOOD} opacity="0.25" />
          <polygon points="250,90 430,240 70,240" fill={WOOD} opacity="0.55" />
          <rect x="150" y="240" width="200" height="190" fill="#fff" opacity="0.9" />
          <rect x="180" y="275" width="60" height="60" fill={WOOD} opacity="0.35" />
          <rect x="260" y="275" width="60" height="60" fill={WOOD} opacity="0.35" />
          <rect x="225" y="360" width="50" height="70" fill={TERRA} opacity="0.6" />
          <rect x="60" y="422" width="380" height="8" fill={BROWN} opacity="0.2" />
        </svg>
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
                    : <HouseArt seed={i} />}
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
                  <svg viewBox="0 0 320 380" style={{ width: "100%", height: "100%", display: "block" }} xmlns="http://www.w3.org/2000/svg">
                    <rect width="320" height="380" fill={CREAM_DEEP} />
                    <circle cx="160" cy="140" r="52" fill={WOOD} opacity="0.5" />
                    <ellipse cx="160" cy="300" rx="78" ry="86" fill={WOOD} opacity="0.5" />
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
                    <Star key={s} size={15} fill={s < (t.rating || 5) ? TERRA : "none"} color={s < (t.rating || 5) ? TERRA : "#D8CBBB"} />
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
  const c = config.company;
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" className="wc-sec wc-contact">
      <div className="wc-wrap" style={{ maxWidth: 760 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p className="wc-eyebrow-en" style={{ color: "#E8C4AE" }}>CONTACT</p>
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
            <p className="wc-contact-sub" style={{ color: "rgba(255,255,255,0.7)" }}>2〜3営業日以内にご連絡いたします。</p>
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
.wc-root { font-family: 'Noto Sans JP', system-ui, sans-serif; color: ${BROWN}; background: ${CREAM}; }
.wc-root * { box-sizing: border-box; }
.wc-root img { max-width: 100%; }
.wc-wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.wc-sec { padding: 76px 0; }
.wc-body { font-size: 14px; line-height: 1.9; color: ${BROWN_MID}; }
.wc-grid { display: grid; gap: 22px; }
.wc-grid-works { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
.wc-grid-strength { grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); }
.wc-grid-voice { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
.wc-grid-booking { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }

.wc-eyebrow { display: flex; align-items: center; gap: 14px; margin-bottom: 34px; }
.wc-eyebrow-line { width: 32px; height: 3px; border-radius: 2px; background: ${TERRA}; flex-shrink: 0; }
.wc-eyebrow-en { font-size: 12px; letter-spacing: 0.25em; color: ${TERRA}; font-weight: 700; margin: 0 0 2px; }
.wc-eyebrow-ja { font-size: clamp(1.4rem, 3.5vw, 1.9rem); font-weight: 700; color: ${BROWN}; margin: 0; }

/* Header */
.wc-head { position: sticky; top: 0; z-index: 50; background: rgba(251,247,240,0.92); backdrop-filter: blur(8px); border-bottom: 1px solid ${CREAM_DEEP}; }
.wc-head.wc-head-static { position: relative; }
.wc-head-inner { max-width: 1120px; margin: 0 auto; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.wc-head-name { font-weight: 700; font-size: 17px; color: ${BROWN}; }
.wc-head-nav { display: flex; align-items: center; gap: 22px; }
.wc-head-nav a { color: ${BROWN_MID}; font-size: 13px; text-decoration: none; transition: color 0.2s; }
.wc-head-nav a:hover { color: ${TERRA}; }
.wc-head-tel { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: ${TERRA}; color: #fff; font-size: 13px; font-weight: 700; border-radius: 999px; text-decoration: none; }

/* Hero */
.wc-hero { display: grid; grid-template-columns: 1.05fr 0.95fr; align-items: stretch; min-height: 540px; }
.wc-hero-text { display: flex; flex-direction: column; justify-content: center; padding: 64px clamp(24px, 5vw, 72px); }
.wc-hero-badge { display: inline-flex; align-items: center; gap: 7px; align-self: flex-start; padding: 6px 14px; border-radius: 999px; background: ${CREAM_DEEP}; color: ${WOOD}; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; margin-bottom: 20px; }
.wc-hero-title { font-size: clamp(1.9rem, 4.6vw, 3rem); font-weight: 700; line-height: 1.4; color: ${BROWN}; margin: 0 0 18px; }
.wc-hero-desc { font-size: 15px; line-height: 2; color: ${BROWN_MID}; margin: 0 0 30px; max-width: 480px; }
.wc-hero-cta { display: flex; flex-wrap: wrap; gap: 12px; }
.wc-hero-art { position: relative; min-height: 320px; }
.wc-btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 999px; border: none; cursor: pointer; transition: all 0.2s; }
.wc-btn-terra { background: ${TERRA}; color: #fff; }
.wc-btn-terra:hover { background: #a94e2c; transform: translateY(-1px); }
.wc-btn-line { background: transparent; color: ${BROWN}; border: 1.5px solid ${WOOD}; }
.wc-btn-line:hover { background: ${CREAM_DEEP}; }

/* Works */
.wc-work-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(69,50,34,0.07); transition: transform 0.25s, box-shadow 0.25s; }
.wc-work-card:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(69,50,34,0.12); }
.wc-work-img { height: 190px; overflow: hidden; }
.wc-work-body { padding: 20px; }
.wc-work-cat { display: inline-block; font-size: 11px; font-weight: 700; color: ${TERRA}; background: ${CREAM_DEEP}; padding: 3px 10px; border-radius: 999px; margin-bottom: 10px; }
.wc-work-title { font-size: 17px; font-weight: 700; color: ${BROWN}; margin: 0 0 6px; }
.wc-work-specs { font-size: 12px; color: ${WOOD}; margin: 0 0 8px; }
.wc-work-year { font-size: 12px; color: #b3a68f; margin: 12px 0 0; }

/* Strengths */
.wc-strength-card { background: #fff; border-radius: 16px; padding: 30px 24px; text-align: center; height: 100%; box-shadow: 0 3px 12px rgba(69,50,34,0.06); }
.wc-strength-icon { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; background: ${CREAM_DEEP}; color: ${TERRA}; }
.wc-strength-title { font-size: 16px; font-weight: 700; color: ${BROWN}; margin: 0 0 10px; }

/* About */
.wc-about { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 48px; align-items: center; }
.wc-about-media { display: flex; flex-direction: column; }
.wc-about-photo { border-radius: 16px; overflow: hidden; aspect-ratio: 4/5; box-shadow: 0 10px 30px rgba(69,50,34,0.12); }
.wc-about-namecard { margin-top: 16px; }
.wc-about-name { font-size: 18px; font-weight: 700; color: ${BROWN}; margin: 0; }
.wc-about-role { font-size: 13px; color: ${WOOD}; margin: 4px 0 0; }
.wc-about-bio { font-size: 15px; line-height: 2.1; color: ${BROWN_MID}; }
.wc-about-facts { margin-top: 24px; display: flex; flex-direction: column; gap: 10px; }
.wc-about-facts div { display: flex; align-items: center; gap: 10px; font-size: 14px; color: ${BROWN}; }
.wc-about-facts svg { color: ${TERRA}; flex-shrink: 0; }

/* Voice */
.wc-voice-card { background: #fff; border-radius: 16px; padding: 26px 24px; height: 100%; box-shadow: 0 3px 12px rgba(69,50,34,0.06); }
.wc-stars { display: flex; gap: 3px; margin-bottom: 14px; }
.wc-voice-text { font-size: 14px; line-height: 1.9; color: ${BROWN}; margin: 0 0 14px; }
.wc-voice-name { font-size: 13px; font-weight: 700; color: ${BROWN_MID}; margin: 0; }
.wc-voice-name span { font-weight: 400; color: #b3a68f; }

/* News */
.wc-news-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: 14px; padding: 15px 0; border-bottom: 1px solid ${CREAM_DEEP}; }
.wc-news-date { font-size: 13px; color: #b3a68f; flex-shrink: 0; }
.wc-news-cat { font-size: 11px; color: ${TERRA}; background: ${CREAM_DEEP}; padding: 2px 10px; border-radius: 999px; flex-shrink: 0; }
.wc-news-title { font-size: 14px; color: ${BROWN}; }

/* Booking */
.wc-event-card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 3px 12px rgba(69,50,34,0.06); display: flex; flex-direction: column; }
.wc-event-date { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: ${TERRA}; }
.wc-event-time { font-size: 12px; color: ${WOOD}; font-weight: 400; margin-left: 4px; }
.wc-event-title { font-size: 16px; font-weight: 700; color: ${BROWN}; margin: 12px 0 8px; }
.wc-event-loc { display: flex; align-items: center; gap: 5px; font-size: 13px; color: ${BROWN_MID}; margin: 0; }
.wc-event-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 18px; }
.wc-event-spots { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: ${WOOD}; }
.wc-event-btn { font-size: 13px; font-weight: 700; color: #fff; background: ${TERRA}; padding: 8px 18px; border-radius: 999px; }
.wc-event-btn-off { background: #c9bca9; }

/* Contact */
.wc-contact { background: ${INK_FOOT}; }
.wc-contact-title { font-size: clamp(1.5rem, 4vw, 2.1rem); font-weight: 700; color: #fff; margin: 6px 0 12px; }
.wc-contact-sub { font-size: 14px; line-height: 1.9; color: rgba(255,255,255,0.7); margin: 0; }
.wc-contact-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 24px; }
.wc-contact-card { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 18px; border-radius: 12px; background: ${TERRA}; color: #fff; font-size: 17px; font-weight: 700; text-decoration: none; transition: background 0.2s; }
.wc-contact-card:hover { background: #a94e2c; }
.wc-contact-card-line { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.25); font-size: 15px; }
.wc-contact-card-line:hover { background: rgba(255,255,255,0.16); }
.wc-form { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 28px; display: flex; flex-direction: column; gap: 16px; }
.wc-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.wc-form label { display: flex; flex-direction: column; gap: 7px; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); }
.wc-form input, .wc-form textarea { padding: 12px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.95); font-size: 14px; color: ${BROWN}; font-family: inherit; outline: none; }
.wc-form input:focus, .wc-form textarea:focus { border-color: ${TERRA}; }
.wc-form textarea { resize: vertical; }
.wc-thanks { text-align: center; padding: 40px 24px; background: rgba(255,255,255,0.05); border-radius: 16px; }
.wc-thanks-icon { width: 54px; height: 54px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
.wc-thanks-title { font-size: 18px; font-weight: 700; color: #fff; margin: 0 0 6px; }

/* Footer */
.wc-foot { background: ${INK_FOOT}; color: #fff; padding: 40px 24px; border-top: 1px solid rgba(255,255,255,0.08); }
.wc-foot-inner { max-width: 1120px; margin: 0 auto; text-align: center; }
.wc-foot-name { font-weight: 700; font-size: 16px; margin: 0 0 8px; }
.wc-foot-info { font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.9; margin: 0; }
.wc-foot-copy { font-size: 11px; color: rgba(255,255,255,0.35); margin: 16px 0 0; }

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

  return (
    <div className="wc-root" onClick={(e) => { if (editMode && (e.target as HTMLElement).closest("a")) e.preventDefault(); }}>
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
    </div>
  );
}
