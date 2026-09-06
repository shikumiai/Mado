"use client";

/**
 * access / 帯 — 濃い地の帯に、住所・電話・時間を横並びで1本。
 * ページの終わりに置いて「最後にここだけ見ればいい」を作る形。
 * 下に地図を細く敷くので、帯だけで用が足りる。
 */

import { Clock, MapPin, Phone } from "lucide-react";
import type { SectionProps } from "../types";
import { accessOf } from "../data";
import { Base, F, Styles } from "../shared";
import { MapFrame } from "./parts";

const CSS = `
.abd { padding: 0; background: var(--tpl-ink-deep); }
.abd-inner { max-width: 1140px; margin: 0 auto; padding: clamp(44px, 6vw, 68px) clamp(20px, 4vw, 28px); }
.abd-top { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.4fr); gap: 28px;
  align-items: end; margin-bottom: clamp(28px, 4vw, 40px); }
.abd-eyebrow { font-size: 11px; letter-spacing: 0.3em; font-weight: 700; color: var(--tpl-on-dark-3);
  margin: 0 0 10px; }
.abd-h { font-size: clamp(1.4rem, 3vw, 2.05rem); line-height: 1.25; color: var(--tpl-on-dark); margin: 0; }
.abd-lead { font-size: 14px; line-height: 2; color: var(--tpl-on-dark-2); margin: 0; max-width: 52ch; }
.abd-row { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 1px; background: var(--tpl-on-dark-line); border: 1px solid var(--tpl-on-dark-line);
  border-radius: 6px; overflow: hidden; }
.abd-cell { background: var(--tpl-ink-deep); padding: 22px 24px; }
.abd-cell small { display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 700;
  letter-spacing: 0.14em; color: var(--tpl-on-dark-3); margin-bottom: 10px; }
.abd-cell svg { color: var(--tpl-primary-tint); }
.abd-cell p { font-size: 15px; line-height: 1.8; color: var(--tpl-on-dark); }
.abd-cell a { color: var(--tpl-on-dark); }
.abd-cell a:hover { color: var(--tpl-primary-tint); }
.abd-ways { margin-top: 18px; font-size: 12.5px; line-height: 1.95; color: var(--tpl-on-dark-3); }
.abd-map { height: clamp(200px, 26vw, 280px); }
.abd-map .acc-map { border: 0; border-radius: 0; height: 100%; }
.abd-note { padding-top: 16px; color: var(--tpl-on-dark-3); }
@media (max-width: 900px) {
  .abd-top { grid-template-columns: 1fr; align-items: start; gap: 14px; }
  .abd-row { grid-template-columns: 1fr; }
}
`;

export default function AccessBand(p: SectionProps) {
  const d = accessOf(p.config, p.data);
  const c = p.config.company;
  if (!c.address && !c.phone) return null;
  const tel = c.phone ? `tel:${c.phone.replace(/[^\d+]/g, "")}` : undefined;
  return (
    <section id={p.id} className="ms abd">
      <Base />
      <Styles id="access-band" css={CSS} />
      <div className="abd-inner">
        <div className="abd-top">
          <div>
            <p className="abd-eyebrow">{d.eyebrow}</p>
            <F p={p} at={["heading"]} v={d.heading}>
              <h2 className="abd-h ms-serif">{d.heading}</h2>
            </F>
          </div>
          {d.lead && (
            <F p={p} at={["lead"]} v={d.lead}>
              <p className="abd-lead">{d.lead}</p>
            </F>
          )}
        </div>

        <div className="abd-row">
          <div className="abd-cell">
            <small><MapPin size={14} strokeWidth={2} />所在地</small>
            <p>{c.address}</p>
            {d.ways.length > 0 && <p className="abd-ways">{d.ways.join("　／　")}</p>}
          </div>
          <div className="abd-cell">
            <small><Phone size={14} strokeWidth={2} />電話</small>
            <p className="ms-num">{tel ? <a href={tel}>{c.phone}</a> : c.phone}</p>
          </div>
          <div className="abd-cell">
            <small><Clock size={14} strokeWidth={2} />営業時間</small>
            <p>{c.hours}</p>
          </div>
        </div>
        {d.note && <p className="ms-note abd-note">{d.note}</p>}
      </div>
      <div className="abd-map">
        <MapFrame embedUrl={d.mapEmbedUrl} label={c.name} height="100%" />
      </div>
    </section>
  );
}
