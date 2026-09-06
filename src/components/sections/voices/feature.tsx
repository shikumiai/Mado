"use client";

/**
 * voices / 主役1件＋小 — いちばん強い声を1つ大きく。
 * 長い体験談が1本あるなら、それを主役にしたほうが伝わる。
 * 残りは右に小さく積んで「他にもある」ことだけ見せる。
 */

import { Star } from "lucide-react";
import type { SectionProps } from "../types";
import { voicesOf } from "../data";
import { Base, F, HeadStack, Monogram, Styles } from "../shared";
import { QuoteField } from "../art";

const CSS = `
.ofe-grid { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.6fr);
  gap: clamp(20px, 3.4vw, 40px); max-width: 1140px; margin: 0 auto; align-items: start; }
.ofe-main { position: relative; border-radius: 12px; overflow: hidden;
  box-shadow: 0 10px 34px var(--tpl-shadow-weak); }
.ofe-bg { position: absolute; inset: 0; }
.ofe-body { position: relative; padding: clamp(30px, 4.4vw, 54px); }
.ofe-stars { display: flex; gap: 4px; color: var(--tpl-primary); margin-bottom: 20px; }
.ofe-mark { font-size: 60px; line-height: 0.6; color: var(--tpl-primary-soft); display: block; }
.ofe-text { font-size: clamp(1.05rem, 2vw, 1.35rem); line-height: 2.1; color: var(--tpl-ink);
  margin-top: 14px; font-weight: 500; }
.ofe-who { display: flex; align-items: center; gap: 14px; margin-top: 28px; padding-top: 20px;
  border-top: 1px solid var(--tpl-line); }
.ofe-name { font-size: 15px; color: var(--tpl-ink); font-weight: 600; margin: 0; }
.ofe-proj { font-size: 12.5px; color: var(--tpl-ink3); margin-top: 3px; }
.ofe-side { display: flex; flex-direction: column; gap: 14px; }
.ofe-mini { background: var(--tpl-surface); border-radius: 8px; padding: 20px;
  border-left: 3px solid var(--tpl-sub1); }
.ofe-mini-text { font-size: 13.5px; line-height: 1.95; color: var(--tpl-ink2); }
.ofe-mini-who { font-size: 12px; color: var(--tpl-ink3); margin-top: 10px; }
.ofe-mini-who b { color: var(--tpl-ink); font-weight: 600; }
@media (max-width: 880px) { .ofe-grid { grid-template-columns: 1fr; } }
`;

export default function VoicesFeature(p: SectionProps) {
  const d = voicesOf(p.config, p.data);
  if (d.items.length === 0) return null;
  const [lead, ...rest] = d.items;
  return (
    <section id={p.id} className="ms ofe">
      <Base />
      <Styles id="voices-feature" css={CSS} />
      <HeadStack p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} />
      <div className="ofe-grid">
        <div className="ofe-main">
          <div className="ofe-bg" aria-hidden><QuoteField /></div>
          <div className="ofe-body">
            <div className="ofe-stars" aria-label={`5段階で${lead.rating ?? 5}`}>
              {Array.from({ length: lead.rating ?? 5 }).map((_, n) => (
                <Star key={n} size={16} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <span className="ofe-mark ms-serif" aria-hidden>“</span>
            <F p={p} at={["items", 0, "text"]} v={lead.text}>
              <p className="ofe-text ms-serif">{lead.text}</p>
            </F>
            <div className="ofe-who">
              <Monogram label={lead.name} size={48} />
              <div>
                <F p={p} at={["items", 0, "name"]} v={lead.name}>
                  <p className="ofe-name ms-serif">{lead.name}</p>
                </F>
                <p className="ofe-proj">{lead.project}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="ofe-side">
          {rest.map((v, i) => (
            <div key={i} className="ofe-mini">
              <F p={p} at={["items", i + 1, "text"]} v={v.text}>
                <p className="ofe-mini-text">{v.text}</p>
              </F>
              <p className="ofe-mini-who">
                <b>{v.name}</b>　{v.project}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
