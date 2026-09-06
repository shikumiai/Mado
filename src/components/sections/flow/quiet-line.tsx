"use client";

/**
 * flow / 静寂 — 細い線と小さな点だけでつなぐ。
 * 塗りも影も箱も使わない。文字と余白で順番を見せる形。
 * 設計事務所・工芸・写真など、静かな見え方が信用になる商売向き。
 */

import type { SectionProps } from "../types";
import { flowOf } from "../data";
import { Base, F, Styles, pad2 } from "../shared";

const CSS = `
.fql { background: var(--tpl-surface); padding-top: clamp(72px, 10vw, 128px);
  padding-bottom: clamp(72px, 10vw, 128px); }
.fql-wrap { max-width: 720px; margin: 0 auto; }
.fql-eyebrow { font-size: 10px; letter-spacing: 0.42em; color: var(--tpl-ink3); font-weight: 600;
  margin: 0 0 18px; }
.fql-h { font-size: clamp(1.35rem, 2.8vw, 1.9rem); line-height: 1.4; color: var(--tpl-ink); margin: 0;
  font-weight: 500; }
.fql-lead { font-size: 14.5px; line-height: 2.2; color: var(--tpl-ink2); margin: 20px 0 0; max-width: 46ch; }
.fql-list { margin-top: clamp(48px, 7vw, 76px); }
.fql-item { display: grid; grid-template-columns: 62px minmax(0, 1fr); gap: 0 24px;
  padding-bottom: clamp(38px, 5vw, 54px); position: relative; }
.fql-item::before { content: ""; position: absolute; left: 4px; top: 14px; bottom: -6px; width: 1px;
  background: var(--tpl-line); }
.fql-item:last-child { padding-bottom: 0; }
.fql-item:last-child::before { display: none; }
.fql-no { position: relative; font-size: 12px; letter-spacing: 0.24em; color: var(--tpl-ink3);
  font-weight: 600; padding-left: 22px; line-height: 1.6; }
.fql-no::before { content: ""; position: absolute; left: 1px; top: 6px; width: 7px; height: 7px;
  border-radius: 50%; background: var(--tpl-surface); border: 1px solid var(--tpl-ink3); }
.fql-item:last-child .fql-no::before { background: var(--tpl-primary); border-color: var(--tpl-primary); }
.fql-title { font-size: 17px; line-height: 1.6; color: var(--tpl-ink); margin: 0; font-weight: 500;
  letter-spacing: 0.02em; }
.fql-text { font-size: 14px; line-height: 2.15; color: var(--tpl-ink2); margin: 10px 0 0; max-width: 44ch; }
.fql-when { font-size: 11.5px; color: var(--tpl-ink3); margin-top: 10px; letter-spacing: 0.06em; }
.fql-note { margin-top: clamp(44px, 6vw, 64px); font-size: 12px; color: var(--tpl-ink3);
  line-height: 1.9; }
@media (max-width: 600px) {
  .fql-item { grid-template-columns: 1fr; gap: 8px; }
  .fql-item::before { display: none; }
}
`;

export default function FlowQuietLine(p: SectionProps) {
  const d = flowOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms fql">
      <Base />
      <Styles id="flow-quiet-line" css={CSS} />
      <div className="fql-wrap">
        <p className="fql-eyebrow">{d.eyebrow}</p>
        <F p={p} at={["heading"]} v={d.heading}>
          <h2 className="fql-h ms-serif">{d.heading}</h2>
        </F>
        {d.lead && (
          <F p={p} at={["lead"]} v={d.lead}>
            <p className="fql-lead">{d.lead}</p>
          </F>
        )}
        <div className="fql-list">
          {d.items.map((s, i) => (
            <div key={i} className="fql-item">
              <span className="fql-no ms-num">{pad2(i)}</span>
              <div>
                <F p={p} at={["items", i, "title"]} v={s.title}>
                  <h3 className="fql-title ms-serif">{s.title}</h3>
                </F>
                <F p={p} at={["items", i, "description"]} v={s.description}>
                  <p className="fql-text">{s.description}</p>
                </F>
                {s.duration && <p className="fql-when">{s.duration}</p>}
              </div>
            </div>
          ))}
        </div>
        {d.note && <p className="fql-note">{d.note}</p>}
      </div>
    </section>
  );
}
