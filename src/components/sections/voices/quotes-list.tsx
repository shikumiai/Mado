"use client";

/**
 * voices / 一覧引用 — 引用符を左の段に置いて、上から読み下す。
 * 声の数が多いときに向く。カードにしないので、文章そのものが目に入る。
 */

import type { SectionProps } from "../types";
import { voicesOf } from "../data";
import { Base, F, HeadRule, Styles } from "../shared";

const CSS = `
.oql { background: var(--tpl-surface); }
.oql-wrap { max-width: 1000px; margin: 0 auto; }
.oql-row { display: grid; grid-template-columns: 74px minmax(0, 1fr) 190px; gap: clamp(14px, 3vw, 30px);
  padding: clamp(24px, 3.4vw, 36px) 0; border-top: 1px solid var(--tpl-line); align-items: start; }
.oql-row:last-child { border-bottom: 1px solid var(--tpl-line); }
.oql-mark { font-size: 52px; line-height: 0.7; color: var(--tpl-primary-soft); }
.oql-text { font-size: 15.5px; line-height: 2.15; color: var(--tpl-ink); }
.oql-who { text-align: right; }
.oql-name { font-size: 14px; color: var(--tpl-ink); font-weight: 600; margin: 0; }
.oql-proj { font-size: 12px; color: var(--tpl-ink3); margin-top: 5px; }
.oql-rate { display: inline-block; font-size: 11px; color: var(--tpl-primary); letter-spacing: 0.16em;
  margin-top: 8px; }
@media (max-width: 780px) {
  .oql-row { grid-template-columns: 48px minmax(0, 1fr); }
  .oql-who { grid-column: 2; text-align: left; }
}
`;

export default function VoicesQuotesList(p: SectionProps) {
  const d = voicesOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms oql">
      <Base />
      <Styles id="voices-quotes-list" css={CSS} />
      <div className="oql-wrap">
        <HeadRule
          p={p}
          eyebrow={d.eyebrow}
          heading={d.heading}
          right={<span className="ms-note ms-num">{d.items.length} 件</span>}
        />
        <div>
          {d.items.map((v, i) => (
            <div key={i} className="oql-row">
              <span className="oql-mark ms-serif" aria-hidden>“</span>
              <F p={p} at={["items", i, "text"]} v={v.text}>
                <p className="oql-text">{v.text}</p>
              </F>
              <div className="oql-who">
                <F p={p} at={["items", i, "name"]} v={v.name}>
                  <p className="oql-name ms-serif">{v.name}</p>
                </F>
                <p className="oql-proj">{v.project}</p>
                <span className="oql-rate ms-num">★ {(v.rating ?? 5).toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
