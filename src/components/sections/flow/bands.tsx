"use client";

/**
 * flow / 帯 — 1手順を画面いっぱいの帯で1行ずつ。
 * 番号・見出し・説明・所要が毎行同じ位置に来るので、
 * 「どこで何が決まるか」を上から下へ比べながら読める。工事・施術など、
 * 手順そのものが商品の説明になる商売向き。
 */

import type { SectionProps } from "../types";
import { flowOf } from "../data";
import { Base, F, Styles, pad2 } from "../shared";

const CSS = `
.fbd { padding-left: 0; padding-right: 0; background: var(--tpl-bg); }
.fbd-head { max-width: 1140px; margin: 0 auto clamp(28px, 4vw, 44px);
  padding: 0 clamp(20px, 4vw, 28px); }
.fbd-h { font-size: clamp(1.5rem, 3.4vw, 2.2rem); color: var(--tpl-ink); margin: 0; line-height: 1.25; }
.fbd-lead { font-size: 15px; line-height: 2; color: var(--tpl-ink2); margin: 14px 0 0; max-width: 58ch; }
.fbd-band { border-top: 1px solid var(--tpl-line); transition: background 0.25s; }
.fbd-band:nth-child(even) { background: var(--tpl-surface); }
.fbd-band:last-child { border-bottom: 1px solid var(--tpl-line); }
.fbd-band:hover { background: var(--tpl-primary-soft); }
.fbd-inner { max-width: 1140px; margin: 0 auto;
  padding: clamp(24px, 3vw, 34px) clamp(20px, 4vw, 28px);
  display: grid; grid-template-columns: 78px minmax(0, 0.85fr) minmax(0, 1.5fr) 128px;
  gap: 24px; align-items: baseline; }
.fbd-no { font-size: 30px; line-height: 1; color: var(--tpl-primary); font-weight: 600; }
.fbd-no small { display: block; font-size: 10px; letter-spacing: 0.2em; color: var(--tpl-ink3);
  margin-bottom: 6px; font-weight: 700; }
.fbd-title { font-size: clamp(1.05rem, 2vw, 1.32rem); line-height: 1.45; color: var(--tpl-ink);
  margin: 0; font-weight: 600; }
.fbd-text { font-size: 14px; line-height: 1.95; color: var(--tpl-ink2); }
.fbd-when { font-size: 12.5px; line-height: 1.7; color: var(--tpl-ink3); text-align: right;
  border-left: 1px solid var(--tpl-line); padding-left: 20px; }
.fbd-note { max-width: 1140px; margin: 24px auto 0; padding: 0 clamp(20px, 4vw, 28px); }
@media (max-width: 900px) {
  .fbd-inner { grid-template-columns: 60px minmax(0, 1fr); gap: 6px 16px; align-items: start; }
  .fbd-text, .fbd-when { grid-column: 2; }
  .fbd-when { text-align: left; border-left: 0; padding-left: 0; margin-top: 8px; }
}
`;

export default function FlowBands(p: SectionProps) {
  const d = flowOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms fbd">
      <Base />
      <Styles id="flow-bands" css={CSS} />
      <div className="fbd-head">
        <p className="ms-eyebrow">{d.eyebrow}</p>
        <F p={p} at={["heading"]} v={d.heading}>
          <h2 className="fbd-h ms-serif">{d.heading}</h2>
        </F>
        {d.lead && (
          <F p={p} at={["lead"]} v={d.lead}>
            <p className="fbd-lead">{d.lead}</p>
          </F>
        )}
      </div>
      <div>
        {d.items.map((s, i) => (
          <div key={i} className="fbd-band">
            <div className="fbd-inner">
              <span className="fbd-no ms-serif ms-num">
                <small>STEP</small>
                {pad2(i)}
              </span>
              <F p={p} at={["items", i, "title"]} v={s.title}>
                <h3 className="fbd-title ms-serif">{s.title}</h3>
              </F>
              <F p={p} at={["items", i, "description"]} v={s.description}>
                <p className="fbd-text">{s.description}</p>
              </F>
              <span className="fbd-when">{s.duration}</span>
            </div>
          </div>
        ))}
      </div>
      {d.note && <p className="ms-note fbd-note">{d.note}</p>}
    </section>
  );
}
