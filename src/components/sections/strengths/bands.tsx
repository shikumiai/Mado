"use client";

/**
 * strengths / 帯 — 1行ずつ、画面いっぱいの帯で。
 * 横に長く読ませる形。番号・見出し・説明が同じ位置で揃うので、比べやすい。
 */

import type { SectionProps } from "../types";
import { strengthsOf } from "../data";
import { Base, F, Icon, Styles, pad2 } from "../shared";

const CSS = `
.sbd { padding-left: 0; padding-right: 0; }
.sbd-head { max-width: 1140px; margin: 0 auto clamp(28px, 4vw, 44px);
  padding: 0 clamp(20px, 4vw, 28px); }
.sbd-h { font-size: clamp(1.5rem, 3.4vw, 2.2rem); color: var(--tpl-ink); margin: 0; line-height: 1.25; }
.sbd-lead { font-size: 15px; line-height: 2; color: var(--tpl-ink2); margin: 14px 0 0; max-width: 58ch; }
.sbd-band { border-top: 1px solid var(--tpl-line); transition: background 0.25s; }
.sbd-band:nth-child(odd) { background: var(--tpl-surface); }
.sbd-band:last-child { border-bottom: 1px solid var(--tpl-line); }
.sbd-band:hover { background: var(--tpl-primary-soft); }
.sbd-inner { max-width: 1140px; margin: 0 auto; padding: clamp(22px, 3vw, 34px) clamp(20px, 4vw, 28px);
  display: grid; grid-template-columns: 64px 34px minmax(0, 0.9fr) minmax(0, 1.3fr); gap: 20px;
  align-items: center; }
.sbd-no { font-size: 22px; color: var(--tpl-primary); font-weight: 600; }
.sbd-icon { color: var(--tpl-ink3); display: flex; }
.sbd-title { font-size: clamp(1.05rem, 2vw, 1.35rem); line-height: 1.45; color: var(--tpl-ink);
  margin: 0; font-weight: 600; }
.sbd-text { font-size: 14px; line-height: 1.95; color: var(--tpl-ink2); }
@media (max-width: 860px) {
  .sbd-inner { grid-template-columns: 48px minmax(0, 1fr); gap: 8px 16px; align-items: start; }
  .sbd-icon { display: none; }
  .sbd-text { grid-column: 2; }
}
`;

export default function StrengthsBands(p: SectionProps) {
  const d = strengthsOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms sbd">
      <Base />
      <Styles id="strengths-bands" css={CSS} />
      <div className="sbd-head">
        <p className="ms-eyebrow">{d.eyebrow}</p>
        <F p={p} at={["heading"]} v={d.heading}>
          <h2 className="sbd-h ms-serif">{d.heading}</h2>
        </F>
        {d.lead && (
          <F p={p} at={["lead"]} v={d.lead}>
            <p className="sbd-lead">{d.lead}</p>
          </F>
        )}
      </div>
      <div>
        {d.items.map((s, i) => (
          <div key={i} className="sbd-band">
            <div className="sbd-inner">
              <span className="sbd-no ms-serif ms-num">{pad2(i)}</span>
              <span className="sbd-icon"><Icon name={s.icon} size={22} /></span>
              <F p={p} at={["items", i, "title"]} v={s.title}>
                <h3 className="sbd-title ms-serif">{s.title}</h3>
              </F>
              <F p={p} at={["items", i, "description"]} v={s.description}>
                <p className="sbd-text">{s.description}</p>
              </F>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
