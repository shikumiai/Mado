"use client";

/**
 * hero / 分割 — 文と絵を左右に。
 * warm-craft の今のヒーローをこの型として引き取った（左に言葉、右に絵が画面端まで）。
 */

import { ArrowRight, Leaf } from "lucide-react";
import type { SectionProps } from "../types";
import { heroOf } from "../data";
import { Base, F, Media, Styles } from "../shared";
import { WindowArt } from "../art";

const CSS = `
.hsp { padding: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: stretch; min-height: min(76vh, 620px); }
.hsp-text { padding: clamp(48px, 6vw, 84px) clamp(20px, 4vw, 56px); display: flex;
  flex-direction: column; justify-content: center; }
.hsp-inner { max-width: 520px; margin-left: auto; }
.hsp-badge { display: inline-flex; align-items: center; gap: 7px; align-self: flex-start;
  font-size: 12px; font-weight: 700; color: var(--tpl-primary); background: var(--tpl-primary-soft);
  padding: 7px 14px; border-radius: 999px; }
.hsp-title { font-size: clamp(1.9rem, 4vw, 3rem); line-height: 1.24; color: var(--tpl-ink); margin: 20px 0 0; }
.hsp-lead { font-size: 15px; line-height: 2.05; color: var(--tpl-ink2); margin: 18px 0 0; }
.hsp-cta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 30px; }
.hsp-facts { display: flex; flex-wrap: wrap; gap: 10px 24px; margin-top: 28px;
  padding-top: 20px; border-top: 1px solid var(--tpl-line); font-size: 13px; color: var(--tpl-ink3); }
.hsp-facts span { display: inline-flex; align-items: center; gap: 7px; }
.hsp-facts span::before { content: ""; width: 5px; height: 5px; border-radius: 50%;
  background: var(--tpl-primary); }
.hsp-art { border-radius: 0; min-height: 320px; }
@media (max-width: 900px) {
  .hsp { grid-template-columns: 1fr; }
  .hsp-art { order: -1; min-height: 260px; height: 44vw; }
  .hsp-inner { margin-left: 0; }
}
`;

export default function HeroSplit(p: SectionProps) {
  const d = heroOf(p.config, p.data);
  return (
    <section id={p.id} className="ms hsp">
      <Base />
      <Styles id="hero-split" css={CSS} />
      <div className="hsp-text">
        <div className="hsp-inner">
          {d.badge && (
            <span className="hsp-badge">
              <Leaf size={13} /> {d.badge}
            </span>
          )}
          <F p={p} at={["title"]} v={d.title}>
            <h1 className="hsp-title ms-serif">{d.title}</h1>
          </F>
          {d.lead && (
            <F p={p} at={["lead"]} v={d.lead}>
              <p className="hsp-lead">{d.lead}</p>
            </F>
          )}
          <div className="hsp-cta">
            <a href={d.primary.href} className="ms-btn ms-btn-fill">{d.primary.label}</a>
            <a href={d.secondary.href} className="ms-btn ms-btn-line">
              {d.secondary.label} <ArrowRight size={15} />
            </a>
          </div>
          {d.facts.length > 0 && (
            <div className="hsp-facts">
              {d.facts.map((f, i) => (
                <span key={i}>{f.replace("／", " ")}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <Media src={d.image} alt={d.company.name} art={<WindowArt seed={1} />} className="hsp-art" />
    </section>
  );
}
