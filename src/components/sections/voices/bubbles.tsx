"use client";

/**
 * voices / 吹き出しカード — 話し言葉として見せる。
 * warm-craft の今のお客様の声を引き取った型。しっぽ付きの吹き出しにして、
 * 段ごとに高さをずらしてある（同じ箱が整列するだけにしない）。
 */

import { Star } from "lucide-react";
import type { SectionProps } from "../types";
import { voicesOf } from "../data";
import { Base, F, HeadStack, Monogram, Styles } from "../shared";

const CSS = `
.obb-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 22px; max-width: 1140px; margin: 0 auto; align-items: start; }
.obb-item:nth-child(even) { margin-top: 28px; }
.obb-card { position: relative; background: var(--tpl-surface); border-radius: 12px; padding: 26px 24px;
  box-shadow: 0 4px 16px var(--tpl-shadow-weak); }
.obb-card::after { content: ""; position: absolute; left: 34px; bottom: -11px; width: 22px; height: 22px;
  background: var(--tpl-surface); transform: rotate(45deg); border-radius: 0 0 4px 0;
  box-shadow: 4px 4px 10px var(--tpl-shadow-weak); }
.obb-stars { display: flex; gap: 3px; color: var(--tpl-primary); margin-bottom: 14px; }
.obb-text { font-size: 14.5px; line-height: 2; color: var(--tpl-ink); }
.obb-who { display: flex; align-items: center; gap: 12px; margin: 22px 0 0 12px; }
.obb-name { font-size: 13.5px; color: var(--tpl-ink); font-weight: 600; margin: 0; }
.obb-proj { font-size: 12px; color: var(--tpl-ink3); margin-top: 2px; }
@media (max-width: 700px) { .obb-item:nth-child(even) { margin-top: 0; } }
`;

export default function VoicesBubbles(p: SectionProps) {
  const d = voicesOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms obb">
      <Base />
      <Styles id="voices-bubbles" css={CSS} />
      <HeadStack p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} />
      <div className="obb-grid">
        {d.items.map((v, i) => (
          <div key={i} className="obb-item">
            <div className="obb-card">
              <div className="obb-stars" aria-label={`5段階で${v.rating ?? 5}`}>
                {Array.from({ length: v.rating ?? 5 }).map((_, n) => (
                  <Star key={n} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <F p={p} at={["items", i, "text"]} v={v.text}>
                <p className="obb-text">{v.text}</p>
              </F>
            </div>
            <div className="obb-who">
              <Monogram label={v.name} size={38} />
              <div>
                <F p={p} at={["items", i, "name"]} v={v.name}>
                  <p className="obb-name ms-serif">{v.name}</p>
                </F>
                <p className="obb-proj">{v.project}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
