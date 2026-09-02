"use client";

import { useState, useEffect } from "react";
import {
  Phone, Mail, Check,
  Shield, Home, Hammer, Users,
} from "lucide-react";
import type { SiteConfig, SectionType } from "@/lib/site-config-schema";
import { getSections } from "@/lib/site-config-schema";

/**
 * warm-craft テンプレートの描画コンポーネント
 * sections配列の順序に従ってセクションを動的に描画する
 */

const ICON_MAP: Record<string, typeof Home> = { Home, Shield, Hammer, Users };

const PROJECT_COLORS = [
  { from: "#C4B5A0", to: "#A69279", accent: "#8B7355" },
  { from: "#7BA23F", to: "#5A7A2D", accent: "#4A6741" },
  { from: "#D4A76A", to: "#B8894A", accent: "#A07D4F" },
  { from: "#8B7D6B", to: "#6B5D4B", accent: "#5C4F3D" },
  { from: "#6B8E4E", to: "#4A6E33", accent: "#3D5A29" },
  { from: "#B8A088", to: "#9A826A", accent: "#7D6A55" },
];

interface Props {
  config: SiteConfig;
  editMode?: boolean;
  onFieldClick?: (fieldId: string, currentValue: string, fieldType: "text" | "image") => void;
  changedFields?: Set<string>;
}

/* ─── 編集可能ラッパー ─── */
function Editable({ fieldId, value, type = "text", editMode, onFieldClick, changedFields, children }: {
  fieldId: string; value: string; type?: "text" | "image";
  editMode: boolean;
  onFieldClick?: Props["onFieldClick"];
  changedFields?: Set<string>;
  children: React.ReactNode;
}) {
  if (!editMode) return <>{children}</>;
  const isChanged = changedFields?.has(fieldId);
  return (
    <div
      data-field-id={fieldId}
      onClick={(e) => { e.stopPropagation(); onFieldClick?.(fieldId, value, type); }}
      style={{
        cursor: "pointer", position: "relative", borderRadius: 4,
        outline: isChanged ? "2px solid #6c5ce7" : "1px dashed transparent",
        transition: "outline 0.15s",
      }}
      onMouseEnter={(e) => { if (!isChanged) (e.currentTarget as HTMLElement).style.outline = "1px dashed #a29bfe"; }}
      onMouseLeave={(e) => { if (!isChanged) (e.currentTarget as HTMLElement).style.outline = "1px dashed transparent"; }}
    >
      {isChanged && (
        <div style={{
          position: "absolute", top: -6, right: -6, zIndex: 10,
          width: 16, height: 16, borderRadius: "50%",
          background: "#6c5ce7", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <Check size={9} color="#fff" />
        </div>
      )}
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════
   各セクションの描画関数
   ═══════════════════════════════════════ */

type EP = Omit<Props, "config"> & { editMode: boolean };

function HeroSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const { company, style } = config;
  const primary = style?.colors?.primary || "#7BA23F";
  return (
    <section style={{
      background: `linear-gradient(135deg, ${primary} 0%, ${primary}dd 100%)`,
      padding: "80px 24px", color: "#fff", position: "relative",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Editable fieldId="company.tagline" value={company.tagline} {...ep}>
          <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 700, lineHeight: 1.4, marginBottom: 16 }}>
            {company.tagline}
          </h1>
        </Editable>
        <Editable fieldId="company.description" value={company.description} {...ep}>
          <p style={{ fontSize: 15, opacity: 0.9, maxWidth: 600, lineHeight: 1.8 }}>
            {company.description}
          </p>
        </Editable>
      </div>
    </section>
  );
}

function WorksSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const { style } = config;
  const accent = style?.colors?.accent || "#D4A76A";
  const bg = style?.colors?.background || "#FAF7F2";
  const projects = config.projects.map((p, i) => ({
    ...p, desc: p.description,
    colors: PROJECT_COLORS[i % PROJECT_COLORS.length],
  }));
  return (
    <section id="works" style={{ padding: "64px 24px", background: bg }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p style={{ fontSize: 11, color: accent, letterSpacing: "0.15em", marginBottom: 4 }}>WORKS</p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#333", marginBottom: 32 }}>施工実績</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {projects.map((p, i) => (
            <Editable key={p.id} fieldId={`projects.${i}.title`} value={p.title} {...ep}>
              <div style={{
                background: "#fff", borderRadius: 12, overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}>
                <div style={{ height: 180, background: `linear-gradient(135deg, ${p.colors.from}, ${p.colors.to})` }} />
                <div style={{ padding: 16 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: "#333", marginBottom: 4 }}>{p.title}</p>
                  <p style={{ fontSize: 12, color: "#888" }}>{p.category} / {p.year}</p>
                  <p style={{ fontSize: 13, color: "#666", marginTop: 8, lineHeight: 1.7 }}>{p.desc}</p>
                </div>
              </div>
            </Editable>
          ))}
        </div>
      </div>
    </section>
  );
}

function StrengthsSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const { style } = config;
  const accent = style?.colors?.accent || "#D4A76A";
  const primary = style?.colors?.primary || "#7BA23F";
  const strengths = config.strengths.map((s) => ({
    ...s, desc: s.description,
    icon: ICON_MAP[s.icon || "Home"] || Home,
  }));
  if (strengths.length === 0) return null;
  return (
    <section id="strength" style={{ padding: "64px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p style={{ fontSize: 11, color: accent, letterSpacing: "0.15em", marginBottom: 4 }}>STRENGTHS</p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#333", marginBottom: 32 }}>私たちの強み</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
          {strengths.map((s, i) => (
            <Editable key={i} fieldId={`strengths.${i}.title`} value={s.title} {...ep}>
              <div style={{ padding: 24, borderRadius: 12, border: "1px solid #eee" }}>
                <s.icon size={24} color={primary} style={{ marginBottom: 12 }} />
                <h3 style={{ fontWeight: 700, fontSize: 15, color: "#333", marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            </Editable>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const { company, style } = config;
  const accent = style?.colors?.accent || "#D4A76A";
  const bg = style?.colors?.background || "#FAF7F2";
  return (
    <section id="about" style={{ padding: "64px 24px", background: bg }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p style={{ fontSize: 11, color: accent, letterSpacing: "0.15em", marginBottom: 4 }}>ABOUT</p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#333", marginBottom: 32 }}>会社案内</h2>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <Editable fieldId="company.ceo" value={company.ceo || ""} {...ep}>
              <h3 style={{ fontWeight: 700, fontSize: 18, color: "#333", marginBottom: 8 }}>
                {company.ceo || "代表者名"}
              </h3>
            </Editable>
            <p style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>{company.ceoTitle || ""}</p>
            <Editable fieldId="company.bio" value={company.bio} {...ep}>
              <div style={{ fontSize: 14, color: "#555", lineHeight: 2.0 }}>
                {company.bio.split("\n\n").map((para, i) => (
                  <p key={i} style={{ marginBottom: i < company.bio.split("\n\n").length - 1 ? 16 : 0 }}>{para}</p>
                ))}
              </div>
            </Editable>
          </div>
          <div style={{ minWidth: 200 }}>
            <div style={{ fontSize: 13, color: "#666", lineHeight: 2.2 }}>
              <Editable fieldId="company.address" value={company.address} {...ep}>
                <p>📍 {company.address}</p>
              </Editable>
              <Editable fieldId="company.phone" value={company.phone} {...ep}>
                <p>📞 {company.phone}</p>
              </Editable>
              <p>📧 {company.email}</p>
              <p>🕐 {company.hours}</p>
              <p>創業 {company.since}年</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const testimonials = config.testimonials;
  if (!testimonials || testimonials.length === 0) return null;
  const accent = config.style?.colors?.accent || "#D4A76A";
  return (
    <section id="testimonials" style={{ padding: "64px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p style={{ fontSize: 11, color: accent, letterSpacing: "0.15em", marginBottom: 4 }}>VOICE</p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#333", marginBottom: 32 }}>お客様の声</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {testimonials.map((t, i) => (
            <Editable key={i} fieldId={`testimonials.${i}.text`} value={t.text} {...ep}>
              <div style={{ padding: 24, borderRadius: 12, border: "1px solid #eee", background: "#fafafa" }}>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.8, marginBottom: 12 }}>「{t.text}」</p>
                <p style={{ fontSize: 12, color: "#888" }}>{t.name} — {t.project}</p>
              </div>
            </Editable>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const news = config.news;
  if (!news || news.length === 0) return null;
  const accent = config.style?.colors?.accent || "#D4A76A";
  const bg = config.style?.colors?.background || "#FAF7F2";
  return (
    <section id="news" style={{ padding: "64px 24px", background: bg }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p style={{ fontSize: 11, color: accent, letterSpacing: "0.15em", marginBottom: 4 }}>NEWS</p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#333", marginBottom: 32 }}>お知らせ</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {news.map((n, i) => (
            <Editable key={i} fieldId={`news.${i}.title`} value={n.title} {...ep}>
              <div style={{ display: "flex", gap: 16, padding: "12px 0", borderBottom: "1px solid #eee", alignItems: "baseline" }}>
                <span style={{ fontSize: 12, color: "#999", flexShrink: 0 }}>{n.date}</span>
                <span style={{ fontSize: 11, color: accent, background: `${accent}15`, padding: "2px 8px", borderRadius: 4, flexShrink: 0 }}>{n.category}</span>
                <span style={{ fontSize: 14, color: "#333" }}>{n.title}</span>
              </div>
            </Editable>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({ config, ep }: { config: SiteConfig; ep: EP }) {
  const { company, style } = config;
  const primary = style?.colors?.primary || "#7BA23F";
  const accent = style?.colors?.accent || "#D4A76A";
  return (
    <section id="contact" style={{ padding: "64px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: accent, letterSpacing: "0.15em", marginBottom: 4 }}>CONTACT</p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#333", marginBottom: 16 }}>お問い合わせ</h2>
        <p style={{ fontSize: 14, color: "#666", marginBottom: 32, lineHeight: 1.8 }}>
          お気軽にご相談ください。お見積もりは無料です。
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={`tel:${company.phone}`} style={{
            padding: "12px 24px", borderRadius: 10, background: primary,
            color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <Phone size={16} /> 電話で相談
          </a>
          <a href={`mailto:${company.email}`} style={{
            padding: "12px 24px", borderRadius: 10, border: `1px solid ${primary}`,
            color: primary, fontSize: 14, fontWeight: 600, textDecoration: "none",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <Mail size={16} /> メールで相談
          </a>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   セクション→コンポーネントのマッピング
   ═══════════════════════════════════════ */

const SECTION_COMPONENTS: Record<string, (props: { config: SiteConfig; ep: EP }) => React.ReactNode> = {
  hero: HeroSection,
  works: WorksSection,
  strengths: StrengthsSection,
  about: AboutSection,
  testimonials: TestimonialsSection,
  news: NewsSection,
  contact: ContactSection,
};

/* ═══════════════════════════════════════
   メインRenderer
   ═══════════════════════════════════════ */

export default function WarmCraftRenderer({ config, editMode = false, onFieldClick, changedFields }: Props) {
  const company = config.company;
  const style = config.style;
  const primary = style?.colors?.primary || "#7BA23F";
  const bg = style?.colors?.background || "#FAF7F2";

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!editMode) {
      const h = () => setScrolled(window.scrollY > 50);
      window.addEventListener("scroll", h, { passive: true });
      return () => window.removeEventListener("scroll", h);
    }
  }, [editMode]);

  const sections = getSections(config);
  const ep: EP = { editMode, onFieldClick, changedFields };

  return (
    <div style={{ background: bg, fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* ─── Header（常に表示） ─── */}
      <header style={{
        position: editMode ? "relative" : "sticky", top: 0, zIndex: 40,
        background: `${bg}f0`, backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        padding: "12px 24px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Editable fieldId="company.name" value={company.name} {...ep}>
            <span style={{ fontWeight: 700, color: primary, fontSize: 16 }}>
              {company.name}
            </span>
          </Editable>
          <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#666" }}>
            <span>📞 {company.phone}</span>
          </div>
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
      <footer style={{ background: "#333", color: "#fff", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{company.name}</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            〒000-0000 {company.address}
          </p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 16 }}>
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
