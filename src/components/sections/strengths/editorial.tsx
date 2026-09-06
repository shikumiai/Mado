"use client";

/**
 * strengths / 誌面 — 雑誌の見開き。
 * いちばん言いたい1つを大きく組み、残りは右の細い段に小さく積む。
 * 大小の差そのものが「どれが大事か」を伝える。
 */

import type { SectionProps } from "../types";
import { strengthsOf } from "../data";
import { Base, F, Icon, Styles, pad2 } from "../shared";

const CSS = `
.sed { background: var(--tpl-bg-deep); }
.sed-wrap { max-width: 1140px; margin: 0 auto; }
.sed-top { display: flex; align-items: baseline; gap: 20px; flex-wrap: wrap;
  padding-bottom: 22px; border-bottom: 2px solid var(--tpl-ink); margin-bottom: clamp(28px, 4vw, 44px); }
.sed-h { font-size: clamp(1.5rem, 3.4vw, 2.2rem); color: var(--tpl-ink); margin: 0; line-height: 1.2; }
.sed-count { font-size: 12px; color: var(--tpl-ink3); letter-spacing: 0.14em; margin-left: auto; }
.sed-grid { display: grid; grid-template-columns: minmax(0, 1.42fr) minmax(0, 0.58fr);
  gap: clamp(28px, 4.5vw, 64px); align-items: start; }
.sed-hero-no { font-size: clamp(3rem, 7vw, 5rem); line-height: 0.9; color: var(--tpl-primary);
  font-weight: 600; display: block; }
.sed-hero-title { font-size: clamp(1.5rem, 3.2vw, 2.1rem); line-height: 1.4; color: var(--tpl-ink);
  margin: 18px 0 16px; font-weight: 600; }
.sed-hero-text { font-size: 15px; line-height: 2.15; color: var(--tpl-ink2); column-count: 2;
  column-gap: 34px; }
.sed-hero-icon { color: var(--tpl-primary); margin-top: 24px; display: block; }
.sed-item { padding: 20px 0; border-top: 1px solid var(--tpl-line-strong); }
.sed-item:first-child { border-top: 0; padding-top: 0; }
.sed-item-head { display: flex; align-items: baseline; gap: 10px; }
.sed-item-no { font-size: 12px; font-weight: 700; color: var(--tpl-primary); letter-spacing: 0.1em; }
.sed-item-title { font-size: 16px; line-height: 1.5; color: var(--tpl-ink); margin: 0; font-weight: 600; }
.sed-item-text { font-size: 13px; line-height: 1.95; color: var(--tpl-ink2); margin-top: 7px; }
@media (max-width: 900px) {
  .sed-grid { grid-template-columns: 1fr; gap: 34px; }
  .sed-hero-text { column-count: 1; }
}
`;

export default function StrengthsEditorial(p: SectionProps) {
  const d = strengthsOf(p.config, p.data);
  if (d.items.length === 0) return null;
  const [lead, ...rest] = d.items;
  return (
    <section id={p.id} className="ms sed">
      <Base />
      <Styles id="strengths-editorial" css={CSS} />
      <div className="sed-wrap">
        <div className="sed-top">
          <p className="ms-eyebrow" style={{ margin: 0 }}>{d.eyebrow}</p>
          <F p={p} at={["heading"]} v={d.heading}>
            <h2 className="sed-h ms-serif">{d.heading}</h2>
          </F>
          <span className="sed-count ms-num">{d.items.length} REASONS</span>
        </div>
        <div className="sed-grid">
          <div>
            <span className="sed-hero-no ms-serif ms-num">{pad2(0)}</span>
            <F p={p} at={["items", 0, "title"]} v={lead.title}>
              <h3 className="sed-hero-title ms-serif">{lead.title}</h3>
            </F>
            <F p={p} at={["items", 0, "description"]} v={lead.description}>
              <p className="sed-hero-text">{lead.description}</p>
            </F>
            <span className="sed-hero-icon"><Icon name={lead.icon} size={30} /></span>
          </div>
          <div>
            {rest.map((s, i) => (
              <div key={i} className="sed-item">
                <div className="sed-item-head">
                  <span className="sed-item-no ms-num">{pad2(i + 1)}</span>
                  <F p={p} at={["items", i + 1, "title"]} v={s.title}>
                    <h3 className="sed-item-title ms-serif">{s.title}</h3>
                  </F>
                </div>
                <F p={p} at={["items", i + 1, "description"]} v={s.description}>
                  <p className="sed-item-text">{s.description}</p>
                </F>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
