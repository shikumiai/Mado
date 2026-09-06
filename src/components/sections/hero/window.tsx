"use client";

/**
 * hero / 窓 — 枠の中に実物が見える。
 * Mado の名前どおり、太い窓枠と桟の向こうに仕事の風景。
 * 言葉は紙のカードにして、枠の左下に重ねる。
 */

import { ArrowRight } from "lucide-react";
import type { SectionProps } from "../types";
import { heroOf } from "../data";
import { Base, F, Media, Styles } from "../shared";
import { SceneArt } from "../art";

const CSS = `
.hwn { padding-bottom: clamp(72px, 9vw, 128px); }
.hwn-wrap { max-width: 1140px; margin: 0 auto; position: relative; }
.hwn-eyebrow { font-size: 11px; letter-spacing: 0.34em; font-weight: 700; color: var(--tpl-primary);
  margin: 0 0 18px; }
.hwn-pane { position: relative; border: 14px solid var(--tpl-primary); border-radius: 4px;
  box-shadow: 0 26px 60px var(--tpl-shadow-mid); }
.hwn-art { height: clamp(280px, 42vw, 520px); border-radius: 0; }
.hwn-mullion { position: absolute; inset: 0; pointer-events: none; }
.hwn-mullion::before, .hwn-mullion::after { content: ""; position: absolute; background: var(--tpl-primary); }
.hwn-mullion::before { left: 50%; top: 0; bottom: 0; width: 10px; transform: translateX(-50%); }
.hwn-mullion::after { top: 46%; left: 0; right: 0; height: 10px; }
.hwn-sill { height: 14px; background: var(--tpl-primary-strong); border-radius: 0 0 4px 4px;
  margin: 0 -6px; box-shadow: 0 10px 22px var(--tpl-shadow-weak); }
.hwn-card { position: relative; z-index: 2; background: var(--tpl-surface); border-radius: 6px;
  padding: clamp(26px, 3.4vw, 40px); box-shadow: 0 20px 44px var(--tpl-shadow-mid);
  border-left: 4px solid var(--tpl-primary); max-width: 560px; margin: -68px 0 0 clamp(0px, 3vw, 44px); }
.hwn-title { font-size: clamp(1.7rem, 3.6vw, 2.6rem); line-height: 1.24; color: var(--tpl-ink); margin: 0; }
.hwn-lead { font-size: 15px; line-height: 2; color: var(--tpl-ink2); margin: 16px 0 0; }
.hwn-cta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 26px; }
.hwn-badge { display: inline-block; font-size: 12px; font-weight: 700; color: var(--tpl-primary);
  margin-bottom: 12px; letter-spacing: 0.04em; }
@media (max-width: 760px) {
  .hwn-card { margin: -32px 12px 0; }
  .hwn-pane { border-width: 10px; }
  .hwn-mullion::before { width: 7px; }
  .hwn-mullion::after { height: 7px; }
}
`;

export default function HeroWindow(p: SectionProps) {
  const d = heroOf(p.config, p.data);
  return (
    <section id={p.id} className="ms hwn">
      <Base />
      <Styles id="hero-window" css={CSS} />
      <div className="hwn-wrap">
        {d.eyebrow && <p className="hwn-eyebrow">{d.eyebrow}</p>}
        <div className="hwn-pane">
          <Media
            src={d.image}
            alt={d.company.name}
            art={<SceneArt seed={2} category={d.company.name} />}
            className="hwn-art"
          />
          <span className="hwn-mullion" aria-hidden />
        </div>
        <div className="hwn-sill" />
        <div className="hwn-card">
          {d.badge && <span className="hwn-badge">{d.badge}</span>}
          <F p={p} at={["title"]} v={d.title}>
            <h1 className="hwn-title ms-serif">{d.title}</h1>
          </F>
          {d.lead && (
            <F p={p} at={["lead"]} v={d.lead}>
              <p className="hwn-lead">{d.lead}</p>
            </F>
          )}
          <div className="hwn-cta">
            <a href={d.primary.href} className="ms-btn ms-btn-fill">{d.primary.label}</a>
            <a href={d.secondary.href} className="ms-btn-text">
              {d.secondary.label} <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
