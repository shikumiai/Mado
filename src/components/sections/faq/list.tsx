"use client";

/**
 * faq / 一覧 — 1行1問。左に質問、右に答え。
 * 質問だけを縦になぞって、気になった行の右を読む形。
 * 質問が多い商売（クリニック・スクール・不動産）で、上から順に潰していける。
 */

import type { SectionProps } from "../types";
import { faqOf } from "../data";
import { Base, F, HeadRule, Styles, pad2 } from "../shared";

const CSS = `
.fls { padding-left: 0; padding-right: 0; background: var(--tpl-bg); }
.fls-head { max-width: 1080px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 28px); }
.fls-row { border-top: 1px solid var(--tpl-line); transition: background 0.2s; }
.fls-row:last-child { border-bottom: 1px solid var(--tpl-line); }
.fls-row:hover { background: var(--tpl-surface); }
.fls-inner { max-width: 1080px; margin: 0 auto; padding: clamp(22px, 3vw, 30px) clamp(20px, 4vw, 28px);
  display: grid; grid-template-columns: 54px minmax(0, 0.85fr) minmax(0, 1.25fr); gap: 22px;
  align-items: baseline; }
.fls-no { font-size: 12px; letter-spacing: 0.1em; font-weight: 700; color: var(--tpl-primary); }
.fls-q { font-size: 15.5px; line-height: 1.7; color: var(--tpl-ink); font-weight: 600; margin: 0; }
.fls-cat { display: block; font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em;
  color: var(--tpl-ink3); margin-bottom: 7px; }
.fls-a { font-size: 13.5px; line-height: 2.05; color: var(--tpl-ink2); white-space: pre-line;
  border-left: 1px solid var(--tpl-line); padding-left: 22px; }
.fls-note { max-width: 1080px; margin: 22px auto 0; padding: 0 clamp(20px, 4vw, 28px); }
@media (max-width: 860px) {
  .fls-inner { grid-template-columns: 44px minmax(0, 1fr); gap: 10px 14px; }
  .fls-a { grid-column: 2; border-left: 0; padding-left: 0; padding-top: 4px; }
}
`;

export default function FaqList(p: SectionProps) {
  const d = faqOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms fls">
      <Base />
      <Styles id="faq-list" css={CSS} />
      <div className="fls-head">
        <HeadRule p={p} eyebrow={d.eyebrow} heading={d.heading} />
      </div>
      <div>
        {d.items.map((q, i) => (
          <div key={i} className="fls-row">
            <div className="fls-inner">
              <span className="fls-no ms-num">Q{pad2(i)}</span>
              <div>
                {q.category && <span className="fls-cat">{q.category}</span>}
                <F p={p} at={["items", i, "question"]} v={q.question}>
                  <h3 className="fls-q ms-serif">{q.question}</h3>
                </F>
              </div>
              <F p={p} at={["items", i, "answer"]} v={q.answer}>
                <p className="fls-a">{q.answer}</p>
              </F>
            </div>
          </div>
        ))}
      </div>
      {d.note && <p className="ms-note fls-note">{d.note}</p>}
    </section>
  );
}
