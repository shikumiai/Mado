"use client";

/**
 * services / 静寂リスト — 名前と一言だけ。
 * 説明を足さないことで、扱っている仕事の輪郭だけを伝える。
 * 設計・写真・工芸のように、押しの弱さが品になる商売のため。
 */

import type { SectionProps } from "../types";
import { servicesOf } from "../data";
import { Base, F, Styles } from "../shared";

const CSS = `
.vqt { background: var(--tpl-surface); padding-top: clamp(72px, 10vw, 130px);
  padding-bottom: clamp(72px, 10vw, 130px); }
.vqt-wrap { max-width: 720px; margin: 0 auto; }
.vqt-eyebrow { font-size: 11px; letter-spacing: 0.4em; color: var(--tpl-ink3); margin: 0 0 18px; }
.vqt-h { font-size: clamp(1.3rem, 2.8vw, 1.8rem); color: var(--tpl-ink); margin: 0 0 8px;
  font-weight: 400; letter-spacing: 0.03em; }
.vqt-list { margin-top: clamp(44px, 6vw, 72px); }
.vqt-item { padding: clamp(26px, 3.4vw, 38px) 0; border-top: 1px solid var(--tpl-line); }
.vqt-item:last-child { border-bottom: 1px solid var(--tpl-line); }
.vqt-title { font-size: 18px; line-height: 1.6; color: var(--tpl-ink); margin: 0; font-weight: 400;
  letter-spacing: 0.04em; }
.vqt-text { font-size: 13px; line-height: 2.1; color: var(--tpl-ink3); margin-top: 10px; }
.vqt-meta { font-size: 12px; color: var(--tpl-ink3); margin-top: 12px; letter-spacing: 0.06em; }
`;

export default function ServicesQuiet(p: SectionProps) {
  const d = servicesOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms vqt">
      <Base />
      <Styles id="services-quiet" css={CSS} />
      <div className="vqt-wrap">
        <p className="vqt-eyebrow">{d.eyebrow}</p>
        <F p={p} at={["heading"]} v={d.heading}>
          <h2 className="vqt-h ms-serif">{d.heading}</h2>
        </F>
        <div className="vqt-list">
          {d.items.map((s, i) => (
            <div key={i} className="vqt-item">
              <F p={p} at={["items", i, "title"]} v={s.title}>
                <h3 className="vqt-title ms-serif">{s.title}</h3>
              </F>
              <F p={p} at={["items", i, "description"]} v={s.description}>
                <p className="vqt-text">{s.description}</p>
              </F>
              {s.price && <p className="vqt-meta ms-num">{s.price}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
