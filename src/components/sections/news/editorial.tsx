"use client";

/**
 * news / 誌面 — 年でまとめて、月日を明朝で大きく。
 * 続けてきた年数がそのまま画面に出るので、「長くやっている会社」が伝わる。
 * 記録が何年ぶんもある商売（設計・工務店・士業）向き。
 */

import { ArrowRight } from "lucide-react";
import type { SectionProps } from "../types";
import { groupNewsByYear, newsOf, splitDate } from "../data";
import { Base, DetailLink, F, Styles } from "../shared";

const CSS = `
.ned { background: var(--tpl-surface); }
.ned-wrap { max-width: 1000px; margin: 0 auto; }
.ned-head { display: grid; grid-template-columns: 148px minmax(0, 1fr); gap: 24px;
  align-items: end; margin-bottom: clamp(34px, 5vw, 56px); }
.ned-h { font-size: clamp(1.5rem, 3.4vw, 2.2rem); line-height: 1.25; color: var(--tpl-ink); margin: 0; }
.ned-lead { font-size: 14.5px; line-height: 2; color: var(--tpl-ink2); margin: 14px 0 0; max-width: 54ch; }
.ned-year { display: grid; grid-template-columns: 148px minmax(0, 1fr); gap: 24px;
  border-top: 2px solid var(--tpl-ink); padding-top: 20px; margin-bottom: 34px; }
.ned-year-no { font-size: clamp(2rem, 5vw, 3.1rem); line-height: 0.95; color: var(--tpl-primary);
  font-weight: 600; position: sticky; top: 24px; align-self: start; }
.ned-year-no small { display: block; font-size: 11px; letter-spacing: 0.2em; color: var(--tpl-ink3);
  margin-top: 10px; font-weight: 700; }
.ned-item { display: grid; grid-template-columns: 72px minmax(0, 1fr); gap: 20px;
  padding: 16px 0; border-bottom: 1px solid var(--tpl-line); align-items: baseline; }
.ned-md { font-size: 17px; color: var(--tpl-ink); font-weight: 500; letter-spacing: 0.02em; }
.ned-cat { display: inline-block; font-size: 10.5px; font-weight: 700; letter-spacing: 0.06em;
  color: var(--tpl-primary); margin-bottom: 5px; }
.ned-title { font-size: 15px; line-height: 1.7; color: var(--tpl-ink2); margin: 0; font-weight: 500;
  transition: color 0.2s; }
.ned-item:hover .ned-title { color: var(--tpl-primary); }
.ned-excerpt { font-size: 13px; line-height: 1.9; color: var(--tpl-ink3); margin: 6px 0 0; }
.ned-foot { display: flex; justify-content: flex-end; }
@media (max-width: 760px) {
  .ned-head, .ned-year { grid-template-columns: 1fr; gap: 12px; }
  .ned-year-no { position: static; }
  .ned-item { grid-template-columns: 62px minmax(0, 1fr); gap: 14px; }
}
`;

export default function NewsEditorial(p: SectionProps) {
  const d = newsOf(p.config, p.data);
  if (d.items.length === 0) return null;
  const years = groupNewsByYear(d.items);
  return (
    <section id={p.id} className="ms ned">
      <Base />
      <Styles id="news-editorial" css={CSS} />
      <div className="ned-wrap">
        <div className="ned-head">
          <p className="ms-eyebrow" style={{ margin: 0 }}>{d.eyebrow}</p>
          <div>
            <F p={p} at={["heading"]} v={d.heading}>
              <h2 className="ned-h ms-serif">{d.heading}</h2>
            </F>
            {d.lead && (
              <F p={p} at={["lead"]} v={d.lead}>
                <p className="ned-lead">{d.lead}</p>
              </F>
            )}
          </div>
        </div>

        {years.map((g) => (
          <div key={g.year} className="ned-year">
            <span className="ned-year-no ms-serif ms-num">
              {g.year}
              <small>{g.items.length} 件</small>
            </span>
            <div>
              {g.items.map((n) => {
                const i = d.items.indexOf(n);
                const { md } = splitDate(n.date);
                return (
                  <div key={i} className="ned-item">
                    <span className="ned-md ms-serif ms-num">{md}</span>
                    <DetailLink section="news" item={n} index={i}>
                      {n.category && <span className="ned-cat">{n.category}</span>}
                      <F p={p} at={["items", i, "title"]} v={n.title}>
                        <h3 className="ned-title ms-serif">{n.title}</h3>
                      </F>
                      {n.excerpt && <p className="ned-excerpt">{n.excerpt}</p>}
                    </DetailLink>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {d.moreCta && (
          <div className="ned-foot">
            <a className="ms-btn-text" href={d.moreCta.href}>
              {d.moreCta.label} <ArrowRight size={14} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
