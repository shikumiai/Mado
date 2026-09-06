"use client";

/**
 * faq / 開閉 — 見出しを押すと答えが開く。
 * 質問が多くてもページが長くならない。details/summary で作ってあるので、
 * キーボードだけでも開閉でき、ページ内検索にも引っかかる。
 */

import { ChevronDown } from "lucide-react";
import type { SectionProps } from "../types";
import { faqOf } from "../data";
import { Base, F, HeadStack, Styles, pad2 } from "../shared";

const CSS = `
.fac { background: var(--tpl-bg); }
.fac-wrap { max-width: 840px; margin: 0 auto; }
.fac-item { border-bottom: 1px solid var(--tpl-line); }
.fac-item:first-of-type { border-top: 1px solid var(--tpl-line); }
.fac-q { display: grid; grid-template-columns: 44px minmax(0, 1fr) 24px; gap: 14px;
  align-items: baseline; padding: 22px 4px; cursor: pointer; list-style: none;
  transition: color 0.2s; }
.fac-q::-webkit-details-marker { display: none; }
.fac-q:hover { color: var(--tpl-primary); }
.fac-no { font-size: 12px; letter-spacing: 0.1em; font-weight: 700; color: var(--tpl-primary); }
.fac-qt { font-size: 15.5px; line-height: 1.65; color: var(--tpl-ink); font-weight: 600; margin: 0; }
.fac-item[open] .fac-qt { color: var(--tpl-primary); }
.fac-chev { color: var(--tpl-ink3); transition: transform 0.25s; align-self: center; }
.fac-item[open] .fac-chev { transform: rotate(180deg); color: var(--tpl-primary); }
.fac-a { display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 14px;
  padding: 0 4px 26px; }
.fac-a-mark { font-size: 12px; letter-spacing: 0.1em; font-weight: 700; color: var(--tpl-ink3); }
.fac-a-text { font-size: 14px; line-height: 2.05; color: var(--tpl-ink2); white-space: pre-line;
  max-width: 58ch; }
.fac-note { margin-top: 28px; padding-top: 16px; border-top: 1px solid var(--tpl-line); }
@media (max-width: 620px) {
  .fac-q { grid-template-columns: 34px minmax(0, 1fr) 20px; gap: 10px; }
  .fac-a { grid-template-columns: 34px minmax(0, 1fr); gap: 10px; }
}
`;

export default function FaqAccordion(p: SectionProps) {
  const d = faqOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms fac">
      <Base />
      <Styles id="faq-accordion" css={CSS} />
      <div className="fac-wrap">
        <HeadStack p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} />
        {d.items.map((q, i) => (
          <details key={i} className="fac-item" open={i === 0}>
            <summary className="fac-q">
              <span className="fac-no ms-num">Q{pad2(i)}</span>
              <p className="fac-qt ms-serif">{q.question}</p>
              <ChevronDown className="fac-chev" size={18} strokeWidth={2} />
            </summary>
            <div className="fac-a">
              <span className="fac-a-mark ms-serif">A</span>
              <F p={p} at={["items", i, "answer"]} v={q.answer}>
                <p className="fac-a-text">{q.answer}</p>
              </F>
            </div>
          </details>
        ))}
        {d.note && <p className="ms-note fac-note">{d.note}</p>}
      </div>
    </section>
  );
}
