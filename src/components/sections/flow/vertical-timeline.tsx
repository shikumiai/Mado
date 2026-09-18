"use client";

/**
 * flow / 縦タイムライン — 上から下へ1本の線。
 * 左に「いつ・どのくらい」、右に「何をするか」。
 * 期間の目安が縦に揃うので、全体でどれくらいかかるかが読み取れる。
 */

import type { SectionProps } from "../types";
import { flowOf } from "../data";
import { Base, F, HeadSplit, Styles, pad2 } from "../shared";

const CSS = `
.fvt { background: var(--tpl-surface); }
.fvt-wrap { max-width: 900px; margin: 0 auto; }
.fvt-item { display: grid; grid-template-columns: 108px 46px minmax(0, 1fr); gap: 0 4px;
  position: relative; }
.fvt-when { text-align: right; padding: 4px 18px 0 0; font-size: 12.5px; font-weight: 700;
  color: var(--tpl-primary); line-height: 1.7; }
.fvt-when small { display: block; font-size: 11px; font-weight: 600; color: var(--tpl-ink3);
  letter-spacing: 0.1em; margin-bottom: 4px; }
.fvt-line { position: relative; display: flex; justify-content: center; }
.fvt-line::before { content: ""; position: absolute; top: 0; bottom: 0; width: 1px;
  background: var(--tpl-line-strong); }
.fvt-item:first-child .fvt-line::before { top: 13px; }
.fvt-item:last-child .fvt-line::before { bottom: auto; height: 13px; }
.fvt-mark { position: relative; margin-top: 6px; width: 15px; height: 15px; border-radius: 50%;
  background: var(--tpl-surface); border: 2px solid var(--tpl-primary); flex: none; }
.fvt-item:last-child .fvt-mark { background: var(--tpl-primary); }
.fvt-body { padding: 0 0 clamp(30px, 4vw, 44px) 18px; }
.fvt-item:last-child .fvt-body { padding-bottom: 0; }
.fvt-title { font-size: clamp(1.05rem, 2vw, 1.3rem); line-height: 1.45; color: var(--tpl-ink);
  margin: 0 0 8px; font-weight: 600; }
.fvt-text { font-size: 14px; line-height: 2; color: var(--tpl-ink2); max-width: 54ch; }
.fvt-note { margin-top: 26px; padding-top: 16px; border-top: 1px solid var(--tpl-line); }
@media (max-width: 720px) {
  .fvt-item { grid-template-columns: 34px minmax(0, 1fr); }
  .fvt-when { grid-column: 2; text-align: left; padding: 0 0 6px; }
  .fvt-when small { display: inline; margin-right: 10px; }
  .fvt-line { grid-row: 1 / 3; grid-column: 1; }
  .fvt-body { grid-column: 2; padding-left: 12px; }
}
`;

export default function FlowVerticalTimeline(p: SectionProps) {
  const d = flowOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms fvt">
      <Base />
      <Styles id="flow-vertical-timeline" css={CSS} />
      <div className="fvt-wrap">
        <HeadSplit p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} />
        {d.items.map((s, i) => (
          <div key={i} className="fvt-item">
            <div className="fvt-when">
              <small className="ms-num">STEP {pad2(i)}</small>
              {s.duration}
            </div>
            <div className="fvt-line">
              <span className="fvt-mark" />
            </div>
            <div className="fvt-body">
              <F p={p} at={["items", i, "title"]} v={s.title}>
                <h3 className="fvt-title ms-serif">{s.title}</h3>
              </F>
              <F p={p} at={["items", i, "description"]} v={s.description}>
                <p className="fvt-text">{s.description}</p>
              </F>
            </div>
          </div>
        ))}
        {d.note && <p className="ms-note fvt-note">{d.note}</p>}
      </div>
    </section>
  );
}
