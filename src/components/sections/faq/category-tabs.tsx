"use client";

/**
 * faq / 分類タブ — 「料金のこと」「工事のこと」で絞ってから読む。
 * 質問が20件を超えても、知りたい所だけ見せられる。
 * 中は開閉なので、選んだ分類の中でもさらに絞り込める。
 */

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { SectionProps } from "../types";
import { faqOf, groupFaq } from "../data";
import { Base, F, HeadStack, Styles } from "../shared";

const CSS = `
.fct { background: var(--tpl-surface); }
.fct-wrap { max-width: 900px; margin: 0 auto; }
.fct-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;
  border-bottom: 1px solid var(--tpl-line); padding-bottom: 0; }
.fct-tab { position: relative; background: none; border: 0; border-bottom: 2px solid transparent;
  font-family: inherit; font-size: 14px; font-weight: 600; color: var(--tpl-ink3); cursor: pointer;
  padding: 12px 16px; transition: color 0.2s, border-color 0.2s; }
.fct-tab:hover { color: var(--tpl-ink); }
.fct-tab[aria-selected="true"] { color: var(--tpl-primary); border-bottom-color: var(--tpl-primary); }
.fct-tab span { font-size: 11px; color: var(--tpl-ink3); margin-left: 6px; font-weight: 700; }
.fct-item { border-bottom: 1px solid var(--tpl-line); }
.fct-q { display: flex; gap: 12px; align-items: baseline; padding: 20px 4px; cursor: pointer;
  list-style: none; transition: color 0.2s; }
.fct-q::-webkit-details-marker { display: none; }
.fct-q:hover { color: var(--tpl-primary); }
.fct-q-mark { font-size: 17px; line-height: 1; color: var(--tpl-primary); font-weight: 700; flex: none; }
.fct-qt { font-size: 15.5px; line-height: 1.65; color: var(--tpl-ink); font-weight: 600; margin: 0;
  flex: 1; }
.fct-chev { color: var(--tpl-ink3); transition: transform 0.25s; flex: none; align-self: center; }
.fct-item[open] .fct-chev { transform: rotate(180deg); color: var(--tpl-primary); }
.fct-a { padding: 0 4px 24px 29px; font-size: 13.5px; line-height: 2.05; color: var(--tpl-ink2);
  white-space: pre-line; max-width: 58ch; }
.fct-note { margin-top: 26px; }
`;

export default function FaqCategoryTabs(p: SectionProps) {
  const d = faqOf(p.config, p.data);
  const [active, setActive] = useState(0);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  if (d.items.length === 0) return null;

  const groups = groupFaq(d.items);
  const cur = groups[Math.min(active, groups.length - 1)];

  return (
    <section id={p.id} className="ms fct">
      <Base />
      <Styles id="faq-category-tabs" css={CSS} />
      <div className="fct-wrap">
        <HeadStack p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} />
        {groups.length > 1 && (
          <div className="fct-tabs" role="tablist" aria-label={d.heading}>
            {groups.map((g, i) => (
              <button
                key={g.name}
                type="button"
                role="tab"
                id={`${uid}-tab-${i}`}
                aria-selected={i === active}
                aria-controls={`${uid}-panel`}
                className="fct-tab"
                onClick={() => setActive(i)}
              >
                {g.name}
                <span className="ms-num">{g.items.length}</span>
              </button>
            ))}
          </div>
        )}
        <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${active}`}>
          {cur.items.map((q) => {
            const i = d.items.indexOf(q);
            return (
              <details key={i} className="fct-item">
                <summary className="fct-q">
                  <span className="fct-q-mark ms-serif">Q</span>
                  <span className="fct-qt ms-serif">{q.question}</span>
                  <ChevronDown className="fct-chev" size={18} strokeWidth={2} />
                </summary>
                <F p={p} at={["items", i, "answer"]} v={q.answer}>
                  <p className="fct-a">{q.answer}</p>
                </F>
              </details>
            );
          })}
        </div>
        {d.note && <p className="ms-note fct-note">{d.note}</p>}
      </div>
    </section>
  );
}
