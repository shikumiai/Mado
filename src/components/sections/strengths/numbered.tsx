"use client";

/**
 * strengths / 番号列 — 理由を1・2・3と数えて読ませる。
 * 左に見出しを置いたまま、右の列を順番に読み下す形。カードにはしない。
 */

import type { SectionProps } from "../types";
import { strengthsOf } from "../data";
import { Base, F, Styles, pad2 } from "../shared";

const CSS = `
.snm { background: var(--tpl-surface); }
.snm-grid { display: grid; grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.28fr);
  gap: clamp(28px, 5vw, 72px); max-width: 1140px; margin: 0 auto; align-items: start; }
.snm-side { position: sticky; top: 32px; }
.snm-h { font-size: clamp(1.5rem, 3.2vw, 2.2rem); line-height: 1.3; color: var(--tpl-ink); margin: 0; }
.snm-lead { font-size: 14px; line-height: 2; color: var(--tpl-ink2); margin: 18px 0 0; }
.snm-row { display: grid; grid-template-columns: 78px minmax(0, 1fr); gap: 8px;
  padding: 26px 0; border-top: 1px solid var(--tpl-line); }
.snm-row:last-child { border-bottom: 1px solid var(--tpl-line); }
.snm-no { font-size: 30px; line-height: 1; color: var(--tpl-primary); font-weight: 600; }
.snm-title { font-size: 19px; line-height: 1.5; color: var(--tpl-ink); margin: 0 0 8px; font-weight: 600; }
.snm-text { font-size: 14px; line-height: 2; color: var(--tpl-ink2); }
@media (max-width: 900px) {
  .snm-grid { grid-template-columns: 1fr; gap: 28px; }
  .snm-side { position: static; }
  .snm-row { grid-template-columns: 54px minmax(0, 1fr); }
  .snm-no { font-size: 24px; }
}
`;

export default function StrengthsNumbered(p: SectionProps) {
  const d = strengthsOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms snm">
      <Base />
      <Styles id="strengths-numbered" css={CSS} />
      <div className="snm-grid">
        <div className="snm-side">
          <p className="ms-eyebrow">{d.eyebrow}</p>
          <F p={p} at={["heading"]} v={d.heading}>
            <h2 className="snm-h ms-serif">{d.heading}</h2>
          </F>
          {d.lead && (
            <F p={p} at={["lead"]} v={d.lead}>
              <p className="snm-lead">{d.lead}</p>
            </F>
          )}
        </div>
        <div>
          {d.items.map((s, i) => (
            <div key={i} className="snm-row">
              <span className="snm-no ms-serif ms-num">{pad2(i)}</span>
              <div>
                <F p={p} at={["items", i, "title"]} v={s.title}>
                  <h3 className="snm-title ms-serif">{s.title}</h3>
                </F>
                <F p={p} at={["items", i, "description"]} v={s.description}>
                  <p className="snm-text">{s.description}</p>
                </F>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
