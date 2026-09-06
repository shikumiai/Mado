"use client";

/**
 * faq / 静寂 — 質問を明朝で大きく、答えを細く小さく。
 * 罫と余白だけで組む。質問が5件前後で、1つ1つに重みがあるときに向く。
 * よくある「Q」「A」の丸バッジは置かない。
 */

import type { SectionProps } from "../types";
import { faqOf } from "../data";
import { Base, F, Styles } from "../shared";

const CSS = `
.fqt { background: var(--tpl-bg); padding-top: clamp(72px, 10vw, 128px);
  padding-bottom: clamp(72px, 10vw, 128px); }
.fqt-wrap { max-width: 760px; margin: 0 auto; }
.fqt-eyebrow { font-size: 10px; letter-spacing: 0.42em; color: var(--tpl-ink3); font-weight: 600;
  margin: 0 0 18px; }
.fqt-h { font-size: clamp(1.35rem, 2.8vw, 1.9rem); line-height: 1.4; color: var(--tpl-ink); margin: 0;
  font-weight: 500; }
.fqt-lead { font-size: 14.5px; line-height: 2.2; color: var(--tpl-ink2); margin: 20px 0 0; max-width: 46ch; }
.fqt-item { margin-top: clamp(44px, 6vw, 64px); padding-top: clamp(30px, 4vw, 40px);
  border-top: 1px solid var(--tpl-line); }
.fqt-item:first-of-type { border-top: 0; }
.fqt-q { font-size: clamp(1.1rem, 2.2vw, 1.4rem); line-height: 1.65; color: var(--tpl-ink);
  margin: 0; font-weight: 500; letter-spacing: 0.01em; }
.fqt-a { font-size: 14px; line-height: 2.2; color: var(--tpl-ink2); margin: 18px 0 0;
  max-width: 44ch; white-space: pre-line; padding-left: 22px; border-left: 1px solid var(--tpl-primary); }
.fqt-note { margin-top: clamp(44px, 6vw, 64px); font-size: 12px; color: var(--tpl-ink3); line-height: 1.9; }
`;

export default function FaqQuiet(p: SectionProps) {
  const d = faqOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms fqt">
      <Base />
      <Styles id="faq-quiet" css={CSS} />
      <div className="fqt-wrap">
        <p className="fqt-eyebrow">{d.eyebrow}</p>
        <F p={p} at={["heading"]} v={d.heading}>
          <h2 className="fqt-h ms-serif">{d.heading}</h2>
        </F>
        {d.lead && (
          <F p={p} at={["lead"]} v={d.lead}>
            <p className="fqt-lead">{d.lead}</p>
          </F>
        )}
        {d.items.map((q, i) => (
          <div key={i} className="fqt-item">
            <F p={p} at={["items", i, "question"]} v={q.question}>
              <h3 className="fqt-q ms-serif">{q.question}</h3>
            </F>
            <F p={p} at={["items", i, "answer"]} v={q.answer}>
              <p className="fqt-a">{q.answer}</p>
            </F>
          </div>
        ))}
        {d.note && <p className="fqt-note">{d.note}</p>}
      </div>
    </section>
  );
}
