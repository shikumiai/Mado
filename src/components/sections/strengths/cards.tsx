"use client";

/**
 * strengths / カード — 面で見せる。
 * warm-craft の今の強みカードを引き取った型。ただし同じ大きさを3枚並べない。
 * 先頭の1枚だけ横長の主役にして、残りを小さめに続ける（大小の差でリズムを作る）。
 */

import type { SectionProps } from "../types";
import { strengthsOf } from "../data";
import { Base, F, HeadStack, Icon, Styles, pad2 } from "../shared";

const CSS = `
.scd-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 18px;
  max-width: 1140px; margin: 0 auto; }
.scd-card { grid-column: span 2; background: var(--tpl-surface); border-radius: 10px;
  padding: 30px 26px; box-shadow: 0 3px 14px var(--tpl-shadow-weak);
  border-top: 3px solid transparent; transition: box-shadow 0.25s, border-color 0.25s; }
.scd-card:hover { box-shadow: 0 14px 32px var(--tpl-shadow-mid); border-top-color: var(--tpl-primary); }
.scd-lead { grid-column: span 6; display: grid; grid-template-columns: 88px minmax(0, 1fr);
  gap: 26px; align-items: start; padding: clamp(30px, 3.6vw, 42px); border-top-color: var(--tpl-primary); }
.scd-icon { width: 60px; height: 60px; border-radius: 14px; display: flex; align-items: center;
  justify-content: center; background: var(--tpl-primary-soft); color: var(--tpl-primary); margin-bottom: 18px; }
.scd-lead .scd-icon { width: 88px; height: 88px; border-radius: 20px; margin: 0; }
.scd-no { font-size: 12px; font-weight: 700; color: var(--tpl-primary); letter-spacing: 0.14em;
  display: block; margin-bottom: 8px; }
.scd-title { font-size: 17px; line-height: 1.5; color: var(--tpl-ink); margin: 0 0 10px; font-weight: 600; }
.scd-lead .scd-title { font-size: clamp(1.25rem, 2.4vw, 1.6rem); }
.scd-text { font-size: 14px; line-height: 1.95; color: var(--tpl-ink2); }
.scd-lead .scd-text { font-size: 15px; max-width: 62ch; }
@media (max-width: 980px) {
  .scd-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .scd-card { grid-column: span 2; }
  .scd-lead { grid-column: span 4; }
}
@media (max-width: 620px) {
  .scd-grid { grid-template-columns: 1fr; }
  .scd-card, .scd-lead { grid-column: span 1; }
  .scd-lead { grid-template-columns: 1fr; gap: 18px; }
  .scd-lead .scd-icon { width: 64px; height: 64px; border-radius: 16px; }
}
`;

export default function StrengthsCards(p: SectionProps) {
  const d = strengthsOf(p.config, p.data);
  if (d.items.length === 0) return null;
  const [lead, ...rest] = d.items;
  return (
    <section id={p.id} className="ms scd">
      <Base />
      <Styles id="strengths-cards" css={CSS} />
      <HeadStack p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} />
      <div className="scd-grid">
        <div className="scd-card scd-lead">
          <span className="scd-icon"><Icon name={lead.icon} size={34} /></span>
          <div>
            <span className="scd-no ms-num">{pad2(0)}</span>
            <F p={p} at={["items", 0, "title"]} v={lead.title}>
              <h3 className="scd-title ms-serif">{lead.title}</h3>
            </F>
            <F p={p} at={["items", 0, "description"]} v={lead.description}>
              <p className="scd-text">{lead.description}</p>
            </F>
          </div>
        </div>
        {rest.map((s, i) => (
          <div key={i} className="scd-card">
            <span className="scd-icon"><Icon name={s.icon} size={24} /></span>
            <span className="scd-no ms-num">{pad2(i + 1)}</span>
            <F p={p} at={["items", i + 1, "title"]} v={s.title}>
              <h3 className="scd-title ms-serif">{s.title}</h3>
            </F>
            <F p={p} at={["items", i + 1, "description"]} v={s.description}>
              <p className="scd-text">{s.description}</p>
            </F>
          </div>
        ))}
      </div>
    </section>
  );
}
