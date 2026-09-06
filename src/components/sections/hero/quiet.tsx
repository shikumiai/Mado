"use client";

/**
 * hero / 静寂 — 文字と余白だけ。
 * clean-arch の今のヒーローをこの型として引き取った（設計事務所・写真・工芸のように、
 * 語りすぎないほうが伝わる商売のため）。絵は置かず、細い罫と大きな余白で品を出す。
 */

import { ArrowRight } from "lucide-react";
import type { SectionProps } from "../types";
import { heroOf } from "../data";
import { Base, F, Styles } from "../shared";

const CSS = `
.hqt { min-height: min(78vh, 660px); display: flex; align-items: center;
  padding: clamp(80px, 12vw, 160px) clamp(20px, 4vw, 28px); background: var(--tpl-surface); }
.hqt-inner { max-width: 900px; margin: 0 auto; }
.hqt-eyebrow { font-size: 11px; letter-spacing: 0.42em; color: var(--tpl-ink3); margin: 0 0 30px; font-weight: 500; }
.hqt-title { font-size: clamp(1.7rem, 4.2vw, 3.1rem); line-height: 1.72; color: var(--tpl-ink);
  margin: 0; font-weight: 400; letter-spacing: 0.02em; }
.hqt-rule { width: 64px; height: 1px; background: var(--tpl-ink3); margin: 44px 0; }
.hqt-meta { display: flex; flex-wrap: wrap; align-items: baseline; gap: 14px;
  font-size: 13px; color: var(--tpl-ink3); line-height: 2; }
.hqt-meta b { font-weight: 600; color: var(--tpl-ink2); }
.hqt-sep { color: var(--tpl-line-strong); }
.hqt-cta { margin-top: 46px; }
.hqt-link { display: inline-flex; align-items: center; gap: 10px; font-size: 13px; letter-spacing: 0.08em;
  color: var(--tpl-ink); border-bottom: 1px solid var(--tpl-line-strong); padding-bottom: 8px;
  transition: gap 0.2s, border-color 0.2s; }
.hqt-link:hover { gap: 16px; border-color: var(--tpl-primary); }
`;

export default function HeroQuiet(p: SectionProps) {
  const d = heroOf(p.config, p.data);
  const c = d.company;
  return (
    <section id={p.id} className="ms hqt">
      <Base />
      <Styles id="hero-quiet" css={CSS} />
      <div className="hqt-inner">
        {d.eyebrow && <p className="hqt-eyebrow">{d.eyebrow}</p>}
        <F p={p} at={["title"]} v={d.title}>
          <h1 className="hqt-title ms-serif">{d.title}</h1>
        </F>
        <div className="hqt-rule" />
        <div className="hqt-meta">
          <F p={p} at={["name"]} v={c.name}>
            <b>{c.name}</b>
          </F>
          <span className="hqt-sep">/</span>
          {d.lead && (
            <F p={p} at={["lead"]} v={d.lead}>
              <span>{d.lead}</span>
            </F>
          )}
        </div>
        <div className="hqt-cta">
          <a href={d.primary.href} className="hqt-link">
            {d.primary.label} <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
