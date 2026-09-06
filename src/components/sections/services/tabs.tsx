"use client";

/**
 * services / タブ分類 — 見出しを選ぶと、その内容だけ出る。
 * 1件あたりの説明が長い商売（士業・スクール・クリニック）で、
 * ページを縦に伸ばさずに全部を載せられる。
 */

import { useId, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import type { SectionProps } from "../types";
import { servicesOf } from "../data";
import { Base, F, HeadStack, Icon, Styles, pad2 } from "../shared";

const CSS = `
.vtb-panel { display: grid; grid-template-columns: minmax(0, 0.42fr) minmax(0, 1fr); gap: 0;
  max-width: 1140px; margin: 0 auto; background: var(--tpl-surface); border: 1px solid var(--tpl-line);
  border-radius: 10px; overflow: hidden; }
.vtb-rail { display: flex; flex-direction: column; background: var(--tpl-bg-deep); }
.vtb-tab { display: flex; align-items: center; gap: 12px; text-align: left; padding: 18px 20px;
  background: none; border: 0; border-bottom: 1px solid var(--tpl-line); cursor: pointer;
  font-family: inherit; font-size: 14.5px; font-weight: 600; color: var(--tpl-ink2);
  transition: background 0.2s, color 0.2s; }
.vtb-tab:last-child { border-bottom: 0; }
.vtb-tab:hover { background: var(--tpl-surface-veil); color: var(--tpl-ink); }
.vtb-tab[aria-selected="true"] { background: var(--tpl-surface); color: var(--tpl-primary);
  box-shadow: inset 3px 0 0 var(--tpl-primary); }
.vtb-tab-no { font-size: 11px; letter-spacing: 0.1em; color: var(--tpl-ink3); font-weight: 700; }
.vtb-body { padding: clamp(28px, 4vw, 44px); }
.vtb-icon { color: var(--tpl-primary); display: block; margin-bottom: 16px; }
.vtb-title { font-size: clamp(1.25rem, 2.6vw, 1.7rem); line-height: 1.4; color: var(--tpl-ink);
  margin: 0 0 14px; font-weight: 600; }
.vtb-text { font-size: 15px; line-height: 2.1; color: var(--tpl-ink2); max-width: 60ch; }
.vtb-steps { list-style: none; padding: 0; margin: 22px 0 0; display: grid; gap: 10px; }
.vtb-steps li { display: flex; gap: 10px; font-size: 13.5px; line-height: 1.8; color: var(--tpl-ink2); }
.vtb-steps svg { color: var(--tpl-primary); flex: none; margin-top: 4px; }
.vtb-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; padding-top: 20px;
  border-top: 1px solid var(--tpl-line); align-items: center; }
.vtb-price { font-size: 20px; color: var(--tpl-ink); font-weight: 600; margin-right: auto; }
@media (max-width: 820px) {
  .vtb-panel { grid-template-columns: 1fr; }
  .vtb-rail { flex-direction: row; overflow-x: auto; }
  .vtb-tab { border-bottom: 0; border-right: 1px solid var(--tpl-line); white-space: nowrap; }
  .vtb-tab[aria-selected="true"] { box-shadow: inset 0 -3px 0 var(--tpl-primary); }
}
`;

export default function ServicesTabs(p: SectionProps) {
  const d = servicesOf(p.config, p.data);
  const [active, setActive] = useState(0);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  if (d.items.length === 0) return null;
  const cur = d.items[Math.min(active, d.items.length - 1)];
  const steps = cur.steps || cur.sessionContent || cur.expectedChanges || [];
  return (
    <section id={p.id} className="ms vtb">
      <Base />
      <Styles id="services-tabs" css={CSS} />
      <HeadStack p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} />
      <div className="vtb-panel">
        <div className="vtb-rail" role="tablist" aria-label={d.heading} aria-orientation="vertical">
          {d.items.map((s, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              id={`${uid}-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`${uid}-panel`}
              className="vtb-tab"
              onClick={() => setActive(i)}
            >
              <span className="vtb-tab-no ms-num">{pad2(i)}</span>
              {s.title}
            </button>
          ))}
        </div>
        <div
          className="vtb-body"
          role="tabpanel"
          id={`${uid}-panel`}
          aria-labelledby={`${uid}-tab-${active}`}
        >
          <span className="vtb-icon"><Icon name={cur.icon} size={30} /></span>
          <F p={p} at={["items", active, "title"]} v={cur.title}>
            <h3 className="vtb-title ms-serif">{cur.title}</h3>
          </F>
          <F p={p} at={["items", active, "description"]} v={cur.description}>
            <p className="vtb-text">{cur.description}</p>
          </F>
          {steps.length > 0 && (
            <ul className="vtb-steps">
              {steps.map((t, i) => (
                <li key={i}>
                  <Check size={15} strokeWidth={2.4} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="vtb-meta">
            {cur.price && <span className="vtb-price ms-serif ms-num">{cur.price}</span>}
            {cur.duration && <span className="ms-chip ms-chip-line">{cur.duration}</span>}
            <span className="ms-btn-text">相談してみる <ArrowRight size={14} /></span>
          </div>
        </div>
      </div>
    </section>
  );
}
