"use client";

/**
 * services / 整列カード — 面で並べる。
 * trust-navy の今の事業内容カードを引き取った型。先頭の1つだけ横長の主役にして、
 * 同じ大きさの3枚横並べにならないようにしている。
 */

import { ArrowRight } from "lucide-react";
import type { SectionProps } from "../types";
import { servicesOf } from "../data";
import { Base, F, HeadSplit, Icon, Styles, pad2 } from "../shared";

const CSS = `
.vgr { background: var(--tpl-surface); }
.vgr-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 16px;
  max-width: 1140px; margin: 0 auto; }
.vgr-card { grid-column: span 2; background: var(--tpl-bg); border: 1px solid var(--tpl-line);
  border-radius: 8px; padding: 28px 24px; display: flex; flex-direction: column;
  transition: border-color 0.25s, box-shadow 0.25s; }
.vgr-card:hover { border-color: var(--tpl-primary); box-shadow: 0 12px 28px var(--tpl-shadow-weak); }
.vgr-lead { grid-column: span 6; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  gap: clamp(20px, 4vw, 48px); align-items: center; background: var(--tpl-primary-soft);
  border-color: transparent; padding: clamp(28px, 3.6vw, 40px); }
.vgr-icon { width: 52px; height: 52px; border-radius: 8px; display: flex; align-items: center;
  justify-content: center; background: var(--tpl-surface); color: var(--tpl-primary);
  border: 1px solid var(--tpl-line); margin-bottom: 18px; }
.vgr-lead .vgr-icon { width: 62px; height: 62px; }
.vgr-no { font-size: 11px; letter-spacing: 0.16em; color: var(--tpl-ink3); font-weight: 700; }
.vgr-title { font-size: 18px; line-height: 1.45; color: var(--tpl-ink); margin: 8px 0 12px; font-weight: 600; }
.vgr-lead .vgr-title { font-size: clamp(1.3rem, 2.6vw, 1.75rem); }
.vgr-text { font-size: 14px; line-height: 1.95; color: var(--tpl-ink2); flex: 1; }
.vgr-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.vgr-foot { margin-top: 18px; }
@media (max-width: 980px) {
  .vgr-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .vgr-lead { grid-column: span 4; grid-template-columns: 1fr; }
}
@media (max-width: 620px) {
  .vgr-grid { grid-template-columns: 1fr; }
  .vgr-card, .vgr-lead { grid-column: span 1; }
}
`;

export default function ServicesGrid(p: SectionProps) {
  const d = servicesOf(p.config, p.data);
  if (d.items.length === 0) return null;
  const [lead, ...rest] = d.items;
  return (
    <section id={p.id} className="ms vgr">
      <Base />
      <Styles id="services-grid" css={CSS} />
      <HeadSplit p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} />
      <div className="vgr-grid">
        <div className="vgr-card vgr-lead">
          <div>
            <span className="vgr-icon"><Icon name={lead.icon} size={28} /></span>
            <span className="vgr-no ms-num">{pad2(0)}</span>
            <F p={p} at={["items", 0, "title"]} v={lead.title}>
              <h3 className="vgr-title ms-serif">{lead.title}</h3>
            </F>
          </div>
          <div>
            <F p={p} at={["items", 0, "description"]} v={lead.description}>
              <p className="vgr-text">{lead.description}</p>
            </F>
            <div className="vgr-meta">
              {lead.duration && <span className="ms-chip ms-chip-line">{lead.duration}</span>}
              {lead.price && <span className="ms-chip">{lead.price}</span>}
            </div>
          </div>
        </div>
        {rest.map((s, i) => (
          <div key={i} className="vgr-card">
            <span className="vgr-icon"><Icon name={s.icon} size={24} /></span>
            <span className="vgr-no ms-num">{pad2(i + 1)}</span>
            <F p={p} at={["items", i + 1, "title"]} v={s.title}>
              <h3 className="vgr-title ms-serif">{s.title}</h3>
            </F>
            <F p={p} at={["items", i + 1, "description"]} v={s.description}>
              <p className="vgr-text">{s.description}</p>
            </F>
            {s.price && (
              <div className="vgr-meta">
                <span className="ms-chip">{s.price}</span>
              </div>
            )}
            <div className="vgr-foot">
              <span className="ms-btn-text">くわしく <ArrowRight size={14} /></span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
