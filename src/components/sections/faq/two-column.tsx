"use client";

/**
 * faq / 2列 — 答えを最初から全部見せる。
 * 押して開く手間が無いので、「読めば分かる」を先に渡せる。
 * 質問が10件前後までのときに向く。段組みなので、答えの長短で高さが揃わなくても崩れない。
 */

import type { SectionProps } from "../types";
import { faqOf } from "../data";
import { Base, F, HeadSplit, Styles } from "../shared";

const CSS = `
.f2c { background: var(--tpl-surface); }
.f2c-cols { max-width: 1080px; margin: 0 auto; column-count: 2; column-gap: clamp(32px, 5vw, 64px); }
.f2c-item { break-inside: avoid; padding-bottom: 30px; margin-bottom: 30px;
  border-bottom: 1px solid var(--tpl-line); }
.f2c-q { display: flex; gap: 10px; align-items: baseline; margin: 0 0 12px; }
.f2c-q-mark { font-size: 19px; line-height: 1; color: var(--tpl-primary); font-weight: 700; flex: none; }
.f2c-qt { font-size: 16px; line-height: 1.6; color: var(--tpl-ink); font-weight: 600; margin: 0; }
.f2c-a { display: flex; gap: 10px; align-items: baseline; }
.f2c-a-mark { font-size: 15px; line-height: 1; color: var(--tpl-ink3); font-weight: 700; flex: none;
  width: 13px; }
.f2c-a-text { font-size: 13.5px; line-height: 2.05; color: var(--tpl-ink2); white-space: pre-line; }
.f2c-cat { display: inline-block; font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em;
  color: var(--tpl-ink3); border: 1px solid var(--tpl-line-strong); border-radius: 3px;
  padding: 3px 8px; margin-bottom: 10px; }
.f2c-note { max-width: 1080px; margin: 10px auto 0; }
@media (max-width: 820px) { .f2c-cols { column-count: 1; } }
`;

export default function FaqTwoColumn(p: SectionProps) {
  const d = faqOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms f2c">
      <Base />
      <Styles id="faq-two-column" css={CSS} />
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <HeadSplit p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} />
      </div>
      <div className="f2c-cols">
        {d.items.map((q, i) => (
          <div key={i} className="f2c-item">
            {q.category && <span className="f2c-cat">{q.category}</span>}
            <div className="f2c-q">
              <span className="f2c-q-mark ms-serif">Q</span>
              <F p={p} at={["items", i, "question"]} v={q.question}>
                <h3 className="f2c-qt ms-serif">{q.question}</h3>
              </F>
            </div>
            <div className="f2c-a">
              <span className="f2c-a-mark ms-serif">A</span>
              <F p={p} at={["items", i, "answer"]} v={q.answer}>
                <p className="f2c-a-text">{q.answer}</p>
              </F>
            </div>
          </div>
        ))}
      </div>
      {d.note && <p className="ms-note f2c-note">{d.note}</p>}
    </section>
  );
}
