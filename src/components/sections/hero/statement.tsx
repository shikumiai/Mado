"use client";

/**
 * hero / 主張1枚 — 言いたいことを大きく1つ、絵は1枚。
 * 大見出しが画面の主役。読んだあとに横長の絵が1枚だけ続く。
 */

import { ArrowRight } from "lucide-react";
import type { SectionProps } from "../types";
import { heroOf } from "../data";
import { Base, F, Media, Styles } from "../shared";
import { WindowArt } from "../art";

const CSS = `
.hst { padding-bottom: 0; overflow: hidden; }
.hst-top { max-width: 1140px; margin: 0 auto; }
.hst-badge { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700;
  letter-spacing: 0.06em; color: var(--tpl-primary); border: 1px solid var(--tpl-sub1-line);
  padding: 7px 14px; border-radius: 3px; }
.hst-title { font-size: clamp(2.2rem, 6.4vw, 4.3rem); line-height: 1.14; color: var(--tpl-ink);
  margin: 26px 0 0; max-width: 17ch; }
.hst-row { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: clamp(24px, 5vw, 64px); align-items: end; margin-top: 34px; }
.hst-lead { font-size: 16px; line-height: 2.05; color: var(--tpl-ink2); max-width: 46ch; }
.hst-side { display: flex; flex-direction: column; gap: 18px; align-items: flex-start; }
.hst-cta { display: flex; flex-wrap: wrap; gap: 12px; }
.hst-facts { display: flex; flex-wrap: wrap; gap: 0; border-top: 1px solid var(--tpl-line); width: 100%; }
.hst-fact { flex: 1 1 120px; padding: 14px 16px 0 0; font-size: 13px; color: var(--tpl-ink3); }
.hst-fact b { display: block; font-size: 20px; color: var(--tpl-ink); font-weight: 600; margin-bottom: 2px; }
.hst-art { margin-top: clamp(40px, 6vw, 72px); height: clamp(240px, 34vw, 430px);
  border-radius: 8px 8px 0 0; max-width: 1240px; margin-left: auto; margin-right: auto; }
@media (max-width: 860px) {
  .hst-row { grid-template-columns: 1fr; align-items: start; gap: 24px; }
}
`;

export default function HeroStatement(p: SectionProps) {
  const d = heroOf(p.config, p.data);
  return (
    <section id={p.id} className="ms hst">
      <Base />
      <Styles id="hero-statement" css={CSS} />
      <div className="hst-top">
        {d.badge && <span className="hst-badge">{d.badge}</span>}
        <F p={p} at={["title"]} v={d.title}>
          <h1 className="hst-title ms-serif">{d.title}</h1>
        </F>
        <div className="hst-row">
          {d.lead && (
            <F p={p} at={["lead"]} v={d.lead}>
              <p className="hst-lead">{d.lead}</p>
            </F>
          )}
          <div className="hst-side">
            <div className="hst-cta">
              <a href={d.primary.href} className="ms-btn ms-btn-fill">{d.primary.label}</a>
              <a href={d.secondary.href} className="ms-btn ms-btn-line">
                {d.secondary.label} <ArrowRight size={15} />
              </a>
            </div>
            {d.facts.length > 0 && (
              <div className="hst-facts">
                {d.facts.map((f, i) => {
                  const [head, ...rest] = f.split("／");
                  return (
                    <div key={i} className="hst-fact">
                      <b className="ms-serif ms-num">{head}</b>
                      {rest.join("／")}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Media src={d.image} alt={d.company.name} art={<WindowArt />} className="hst-art" />
    </section>
  );
}
