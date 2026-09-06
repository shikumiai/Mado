"use client";

/**
 * flow / 番号カード — 大きな番号を地に敷いたカードを、段違いに置く。
 * 同じ大きさの箱を横一列に並べるのを避けて、視線が「1→2→3」と落ちていくようにした。
 * 説明が長い商売（士業・設計・スクール）でも読める余白を確保してある。
 */

import type { SectionProps } from "../types";
import { flowOf } from "../data";
import { Base, F, HeadRule, Styles, pad2 } from "../shared";

const CSS = `
.fnc { background: var(--tpl-bg); }
.fnc-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(20px, 3vw, 30px); max-width: 1000px; margin: 0 auto; align-items: start; }
.fnc-card { position: relative; overflow: hidden; background: var(--tpl-surface);
  border: 1px solid var(--tpl-line); border-radius: 8px; padding: 30px 28px 28px;
  transition: border-color 0.25s, box-shadow 0.25s; }
.fnc-card:hover { border-color: var(--tpl-primary); box-shadow: 0 12px 30px var(--tpl-shadow-weak); }
.fnc-grid > .fnc-card:nth-child(even) { margin-top: clamp(24px, 4vw, 56px); }
.fnc-no { position: absolute; right: 12px; top: -14px; font-size: 84px; line-height: 1;
  color: var(--tpl-primary); opacity: 0.12; font-weight: 700; pointer-events: none; }
.fnc-when { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: var(--tpl-ink3);
  margin-bottom: 12px; display: block; }
.fnc-title { position: relative; font-size: clamp(1.05rem, 2vw, 1.28rem); line-height: 1.45;
  color: var(--tpl-ink); margin: 0 0 12px; font-weight: 600; padding-left: 16px; }
.fnc-title::before { content: ""; position: absolute; left: 0; top: 5px; bottom: 5px; width: 3px;
  background: var(--tpl-primary); border-radius: 2px; }
.fnc-text { font-size: 14px; line-height: 2; color: var(--tpl-ink2); }
.fnc-note { max-width: 1000px; margin: clamp(28px, 4vw, 40px) auto 0; padding-top: 16px;
  border-top: 1px solid var(--tpl-line); }
@media (max-width: 760px) {
  .fnc-grid { grid-template-columns: 1fr; }
  .fnc-grid > .fnc-card:nth-child(even) { margin-top: 0; }
}
`;

export default function FlowNumberedCards(p: SectionProps) {
  const d = flowOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms fnc">
      <Base />
      <Styles id="flow-numbered-cards" css={CSS} />
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <HeadRule p={p} eyebrow={d.eyebrow} heading={d.heading} />
      </div>
      <div className="fnc-grid">
        {d.items.map((s, i) => (
          <article key={i} className="fnc-card">
            <span className="fnc-no ms-serif ms-num" aria-hidden>{pad2(i)}</span>
            {s.duration && <span className="fnc-when">{s.duration}</span>}
            <F p={p} at={["items", i, "title"]} v={s.title}>
              <h3 className="fnc-title ms-serif">{s.title}</h3>
            </F>
            <F p={p} at={["items", i, "description"]} v={s.description}>
              <p className="fnc-text">{s.description}</p>
            </F>
          </article>
        ))}
      </div>
      {d.note && <p className="ms-note fnc-note">{d.note}</p>}
    </section>
  );
}
