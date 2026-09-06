"use client";

/**
 * hero / 全面 — 絵が画面いっぱい、その上に文。
 * trust-navy の今のヒーローをこの型として引き取った（濃い地に金の建築線、左に言葉）。
 */

import { ArrowRight } from "lucide-react";
import type { SectionProps } from "../types";
import { heroOf } from "../data";
import { Base, F, Media, Styles } from "../shared";
import { SceneArt } from "../art";

const CSS = `
.hfl { padding: 0; position: relative; min-height: min(84vh, 720px); display: flex; align-items: flex-end;
  overflow: hidden; }
.hfl-art { position: absolute; inset: 0; border-radius: 0; }
.hfl-scrim { position: absolute; inset: 0;
  background: linear-gradient(100deg, var(--tpl-primary-deep-veil) 0%, var(--tpl-primary-deep-veil) 40%,
    transparent 86%); }
.hfl-inner { position: relative; width: 100%; max-width: 1140px; margin: 0 auto;
  padding: clamp(56px, 9vw, 120px) clamp(20px, 4vw, 28px) clamp(48px, 7vw, 90px); }
.hfl-badge { display: inline-flex; align-items: center; gap: 9px; font-size: 12px; font-weight: 700;
  letter-spacing: 0.1em; color: var(--tpl-on-dark-2); border: 1px solid var(--tpl-on-dark-line);
  padding: 7px 15px; border-radius: 2px; }
.hfl-badge i { width: 6px; height: 6px; border-radius: 50%; background: var(--tpl-sub1); }
.hfl-title { font-size: clamp(2rem, 5.4vw, 3.6rem); line-height: 1.2; color: var(--tpl-on-dark);
  margin: 22px 0 0; max-width: 20ch; text-shadow: 0 2px 24px var(--tpl-shadow-strong); }
.hfl-lead { font-size: 15px; line-height: 2.05; color: var(--tpl-on-dark-2); margin: 20px 0 0; max-width: 48ch; }
.hfl-cta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }
.hfl-ghost { border-color: var(--tpl-on-dark-line); color: var(--tpl-on-dark); }
.hfl-ghost:hover { border-color: var(--tpl-on-dark); color: var(--tpl-on-dark); background: var(--tpl-on-dark-fill); }
.hfl-facts { display: flex; flex-wrap: wrap; gap: 0 40px; margin-top: 40px; padding-top: 22px;
  border-top: 1px solid var(--tpl-on-dark-line); }
.hfl-fact { font-size: 12px; color: var(--tpl-on-dark-3); }
.hfl-fact b { display: block; font-size: 26px; color: var(--tpl-on-dark); font-weight: 600; margin-bottom: 2px; }
@media (max-width: 900px) {
  .hfl-scrim { background: linear-gradient(180deg, var(--tpl-primary-deep-veil) 30%,
    var(--tpl-primary-deep-veil) 100%); }
}
`;

export default function HeroFull(p: SectionProps) {
  const d = heroOf(p.config, p.data);
  return (
    <section id={p.id} className="ms hfl">
      <Base />
      <Styles id="hero-full" css={CSS} />
      <Media
        src={d.image}
        alt={d.company.name}
        art={<SceneArt seed={3} category="オフィス" />}
        className="hfl-art"
      />
      <div className="hfl-scrim" />
      <div className="hfl-inner">
        {d.badge && (
          <span className="hfl-badge">
            <i /> {d.badge}
          </span>
        )}
        <F p={p} at={["title"]} v={d.title}>
          <h1 className="hfl-title ms-serif">{d.title}</h1>
        </F>
        {d.lead && (
          <F p={p} at={["lead"]} v={d.lead}>
            <p className="hfl-lead">{d.lead}</p>
          </F>
        )}
        <div className="hfl-cta">
          <a href={d.primary.href} className="ms-btn ms-btn-fill">{d.primary.label}</a>
          <a href={d.secondary.href} className="ms-btn ms-btn-line hfl-ghost">
            {d.secondary.label} <ArrowRight size={15} />
          </a>
        </div>
        {d.facts.length > 0 && (
          <div className="hfl-facts">
            {d.facts.map((f, i) => {
              const [head, ...rest] = f.split("／");
              return (
                <div key={i} className="hfl-fact">
                  <b className="ms-serif ms-num">{head}</b>
                  {rest.join("／")}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
