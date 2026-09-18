"use client";

/**
 * news / 静寂 — 日付と見出しだけを、間をあけて。
 * 分類のバッジも罫の囲みも置かない。更新が月に1本くらいの落ち着いた商売で、
 * 「無理に賑やかにしていない」ことがそのまま品になる形。
 */

import type { SectionProps } from "../types";
import { newsOf } from "../data";
import { Base, DetailLink, F, Styles } from "../shared";

const CSS = `
.nqt { background: var(--tpl-bg); padding-top: clamp(72px, 10vw, 120px);
  padding-bottom: clamp(72px, 10vw, 120px); }
.nqt-wrap { max-width: 700px; margin: 0 auto; }
.nqt-eyebrow { font-size: 10px; letter-spacing: 0.42em; color: var(--tpl-ink3); font-weight: 600;
  margin: 0 0 18px; }
.nqt-h { font-size: clamp(1.3rem, 2.6vw, 1.8rem); line-height: 1.4; color: var(--tpl-ink); margin: 0;
  font-weight: 500; }
.nqt-lead { font-size: 14px; line-height: 2.2; color: var(--tpl-ink2); margin: 18px 0 0; max-width: 44ch; }
.nqt-list { margin-top: clamp(44px, 6vw, 68px); }
.nqt-item { padding: clamp(20px, 3vw, 28px) 0; border-bottom: 1px solid var(--tpl-line); }
.nqt-item:first-child { border-top: 1px solid var(--tpl-line); }
.nqt-date { display: block; font-size: 11px; letter-spacing: 0.2em; color: var(--tpl-ink3);
  margin-bottom: 9px; }
.nqt-title { font-size: 16px; line-height: 1.75; color: var(--tpl-ink); margin: 0; font-weight: 500;
  letter-spacing: 0.01em; transition: color 0.2s; }
.nqt-item:hover .nqt-title { color: var(--tpl-primary); }
.nqt-more { display: inline-block; margin-top: clamp(36px, 5vw, 52px); font-size: 12.5px;
  letter-spacing: 0.1em; color: var(--tpl-ink2); border-bottom: 1px solid var(--tpl-line-strong);
  padding-bottom: 5px; transition: color 0.2s, border-color 0.2s; }
.nqt-more:hover { color: var(--tpl-primary); border-color: var(--tpl-primary); }
`;

export default function NewsQuiet(p: SectionProps) {
  const d = newsOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms nqt">
      <Base />
      <Styles id="news-quiet" css={CSS} />
      <div className="nqt-wrap">
        <p className="nqt-eyebrow">{d.eyebrow}</p>
        <F p={p} at={["heading"]} v={d.heading}>
          <h2 className="nqt-h ms-serif">{d.heading}</h2>
        </F>
        {d.lead && (
          <F p={p} at={["lead"]} v={d.lead}>
            <p className="nqt-lead">{d.lead}</p>
          </F>
        )}
        <div className="nqt-list">
          {d.items.map((n, i) => (
            <div key={i} className="nqt-item">
              <DetailLink section="news" item={n} index={i}>
                <span className="nqt-date ms-num">
                  {n.date}
                  {n.category ? `　${n.category}` : ""}
                </span>
                <F p={p} at={["items", i, "title"]} v={n.title}>
                  <h3 className="nqt-title ms-serif">{n.title}</h3>
                </F>
              </DetailLink>
            </div>
          ))}
        </div>
        {d.moreCta && (
          <a className="nqt-more" href={d.moreCta.href}>
            {d.moreCta.label}
          </a>
        )}
      </div>
    </section>
  );
}
