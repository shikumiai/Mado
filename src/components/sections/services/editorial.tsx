"use client";

/**
 * services / 誌面 — 目次のあとに記事が続く形。
 * 上に「何があるか」の目次を置き、下は1件ずつ、左の細い段に番号、
 * 本文は読みやすい幅で組む。扱う分野が多い商売（士業・建設）に向く。
 */

import type { SectionProps } from "../types";
import { servicesOf } from "../data";
import { Base, F, Styles, pad2 } from "../shared";

const CSS = `
.ved-wrap { max-width: 1060px; margin: 0 auto; }
.ved-top { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 30px; align-items: end; padding-bottom: 20px; border-bottom: 2px solid var(--tpl-ink); }
.ved-h { font-size: clamp(1.5rem, 3.4vw, 2.2rem); color: var(--tpl-ink); margin: 0; line-height: 1.25; }
.ved-index { display: flex; flex-wrap: wrap; gap: 8px 10px; }
.ved-index span { font-size: 12px; color: var(--tpl-ink2); border: 1px solid var(--tpl-line-strong);
  border-radius: 2px; padding: 5px 11px; }
.ved-item { display: grid; grid-template-columns: 116px minmax(0, 1fr); gap: clamp(16px, 3vw, 34px);
  padding: clamp(30px, 4vw, 46px) 0; border-bottom: 1px solid var(--tpl-line); }
.ved-gutter { font-size: 11px; letter-spacing: 0.16em; color: var(--tpl-ink3); line-height: 1.9; }
.ved-gutter b { display: block; font-size: 26px; letter-spacing: 0; color: var(--tpl-primary);
  font-weight: 600; margin-bottom: 6px; }
.ved-title { font-size: clamp(1.2rem, 2.4vw, 1.55rem); line-height: 1.45; color: var(--tpl-ink);
  margin: 0 0 14px; font-weight: 600; }
.ved-text { font-size: 15px; line-height: 2.1; color: var(--tpl-ink2); max-width: 62ch; }
.ved-detail { font-size: 13px; line-height: 2; color: var(--tpl-ink3); margin-top: 12px;
  padding-left: 16px; border-left: 2px solid var(--tpl-sub1); max-width: 62ch; }
.ved-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
@media (max-width: 780px) {
  .ved-top { grid-template-columns: 1fr; align-items: start; gap: 18px; }
  .ved-item { grid-template-columns: 1fr; gap: 12px; }
  .ved-gutter b { display: inline-block; margin: 0 10px 0 0; font-size: 20px; }
}
`;

export default function ServicesEditorial(p: SectionProps) {
  const d = servicesOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms ved">
      <Base />
      <Styles id="services-editorial" css={CSS} />
      <div className="ved-wrap">
        <div className="ved-top">
          <div>
            <p className="ms-eyebrow">{d.eyebrow}</p>
            <F p={p} at={["heading"]} v={d.heading}>
              <h2 className="ved-h ms-serif">{d.heading}</h2>
            </F>
          </div>
          <div className="ved-index">
            {d.items.map((s, i) => (
              <span key={i}>{s.title}</span>
            ))}
          </div>
        </div>
        {d.items.map((s, i) => (
          <article key={i} className="ved-item">
            <div className="ved-gutter">
              <b className="ms-serif ms-num">{pad2(i)}</b>
              {s.duration || s.targetAudience
                ? (Array.isArray(s.targetAudience) ? s.targetAudience.join("・") : s.targetAudience) || s.duration
                : null}
            </div>
            <div>
              <F p={p} at={["items", i, "title"]} v={s.title}>
                <h3 className="ved-title ms-serif">{s.title}</h3>
              </F>
              <F p={p} at={["items", i, "description"]} v={s.description}>
                <p className="ved-text">{s.description}</p>
              </F>
              {s.details && <p className="ved-detail">{s.details}</p>}
              {(s.price || s.results) && (
                <div className="ved-tags">
                  {s.price && <span className="ms-chip">{s.price}</span>}
                  {s.results && <span className="ms-chip ms-chip-line">{s.results}</span>}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
