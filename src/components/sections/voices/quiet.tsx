"use client";

/**
 * voices / 静寂 — 1文ずつ、間をあけて。
 * 短い一言だけを明朝で置く。飾りを足さないぶん、言葉が残る。
 * 声が少ない時期でも、さみしく見えないのが利点。
 */

import type { SectionProps } from "../types";
import { voicesOf } from "../data";
import { Base, F, Styles } from "../shared";

const CSS = `
.oqt { background: var(--tpl-surface); padding-top: clamp(76px, 11vw, 140px);
  padding-bottom: clamp(76px, 11vw, 140px); }
.oqt-wrap { max-width: 720px; margin: 0 auto; text-align: center; }
.oqt-eyebrow { font-size: 11px; letter-spacing: 0.42em; color: var(--tpl-ink3); margin: 0 0 44px; }
.oqt-item + .oqt-item { margin-top: clamp(44px, 6vw, 72px); }
.oqt-item + .oqt-item::before { content: ""; display: block; width: 40px; height: 1px;
  background: var(--tpl-line-strong); margin: 0 auto clamp(44px, 6vw, 72px); }
.oqt-text { font-size: clamp(1.05rem, 2.2vw, 1.35rem); line-height: 2.2; color: var(--tpl-ink);
  font-weight: 400; letter-spacing: 0.02em; }
.oqt-who { font-size: 12px; color: var(--tpl-ink3); margin-top: 18px; letter-spacing: 0.1em; }
`;

export default function VoicesQuiet(p: SectionProps) {
  const d = voicesOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms oqt">
      <Base />
      <Styles id="voices-quiet" css={CSS} />
      <div className="oqt-wrap">
        <p className="oqt-eyebrow">{d.eyebrow}</p>
        {d.items.map((v, i) => (
          <div key={i} className="oqt-item">
            <F p={p} at={["items", i, "text"]} v={v.text}>
              <p className="oqt-text ms-serif">{v.text}</p>
            </F>
            <p className="oqt-who">
              {v.name}　{v.project}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
