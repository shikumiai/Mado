"use client";

/**
 * news / 一覧行 — 日付・分類・見出しを1行に。
 * 会社サイトでいちばん多い形。写真が無くても成立し、件数が増えても崩れない。
 * 日付が縦に揃うので「いつから止まっているか」も正直に見える。
 */

import { ArrowRight } from "lucide-react";
import type { SectionProps } from "../types";
import { newsOf } from "../data";
import { Base, DetailLink, F, HeadRule, Styles } from "../shared";

const CSS = `
.nlr { background: var(--tpl-surface); }
.nlr-wrap { max-width: 980px; margin: 0 auto; }
.nlr-row { border-top: 1px solid var(--tpl-line); }
.nlr-row:last-child { border-bottom: 1px solid var(--tpl-line); }
.nlr-inner { display: grid; grid-template-columns: 104px 116px minmax(0, 1fr) 22px; gap: 18px;
  align-items: center; padding: 18px 6px; transition: background 0.2s, padding 0.2s; }
.nlr-row:hover .nlr-inner { background: var(--tpl-primary-soft); padding-left: 14px; }
.nlr-date { font-size: 13px; color: var(--tpl-ink3); letter-spacing: 0.04em; }
.nlr-cat { justify-self: start; font-size: 10.5px; font-weight: 700; letter-spacing: 0.06em;
  color: var(--tpl-ink2); border: 1px solid var(--tpl-line-strong); border-radius: 3px;
  padding: 4px 10px; white-space: nowrap; }
.nlr-title { font-size: 14.5px; line-height: 1.65; color: var(--tpl-ink); margin: 0; font-weight: 500; }
.nlr-arrow { color: var(--tpl-line-strong); transition: color 0.2s, transform 0.2s; }
.nlr-row:hover .nlr-arrow { color: var(--tpl-primary); transform: translateX(3px); }
.nlr-foot { display: flex; justify-content: flex-end; margin-top: 26px; }
@media (max-width: 720px) {
  .nlr-inner { grid-template-columns: 100px minmax(0, 1fr); gap: 6px 14px; padding: 16px 6px; }
  .nlr-title { grid-column: 1 / 3; }
  .nlr-arrow { display: none; }
}
`;

export default function NewsListRows(p: SectionProps) {
  const d = newsOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms nlr">
      <Base />
      <Styles id="news-list-rows" css={CSS} />
      <div className="nlr-wrap">
        <HeadRule p={p} eyebrow={d.eyebrow} heading={d.heading} />
        <div>
          {d.items.map((n, i) => (
            <div key={i} className="nlr-row">
              <DetailLink section="news" item={n} index={i}>
                <div className="nlr-inner">
                  <span className="nlr-date ms-num">{n.date}</span>
                  {n.category ? <span className="nlr-cat">{n.category}</span> : <span />}
                  <F p={p} at={["items", i, "title"]} v={n.title}>
                    <h3 className="nlr-title">{n.title}</h3>
                  </F>
                  <ArrowRight className="nlr-arrow" size={16} strokeWidth={2} />
                </div>
              </DetailLink>
            </div>
          ))}
        </div>
        {d.moreCta && (
          <div className="nlr-foot">
            <a className="ms-btn-text" href={d.moreCta.href}>
              {d.moreCta.label} <ArrowRight size={14} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
