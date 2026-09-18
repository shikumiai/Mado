"use client";

/**
 * access / 静寂 — 住所も時間も、文章のように置く。
 * 表組みも地図も出さず、細い罫と余白だけ。
 * 予約制の設計事務所・工房・撮影スタジオのように、
 * 「来る前に必ず連絡がある」商売で成立する形。
 */

import type { SectionProps } from "../types";
import { accessOf } from "../data";
import { Base, F, Styles } from "../shared";

const CSS = `
.aqt { background: var(--tpl-surface); padding-top: clamp(76px, 10vw, 128px);
  padding-bottom: clamp(76px, 10vw, 128px); }
.aqt-wrap { max-width: 660px; margin: 0 auto; }
.aqt-eyebrow { font-size: 10px; letter-spacing: 0.42em; color: var(--tpl-ink3); font-weight: 600;
  margin: 0 0 18px; }
.aqt-h { font-size: clamp(1.3rem, 2.6vw, 1.8rem); line-height: 1.4; color: var(--tpl-ink); margin: 0;
  font-weight: 500; }
.aqt-lead { font-size: 14px; line-height: 2.2; color: var(--tpl-ink2); margin: 18px 0 0; max-width: 42ch; }
.aqt-list { margin-top: clamp(44px, 6vw, 66px); }
.aqt-item { padding: 22px 0; border-bottom: 1px solid var(--tpl-line); }
.aqt-item:first-child { border-top: 1px solid var(--tpl-line); }
.aqt-label { display: block; font-size: 10.5px; letter-spacing: 0.26em; color: var(--tpl-ink3);
  font-weight: 600; margin-bottom: 8px; }
.aqt-value { font-size: 16px; line-height: 1.9; color: var(--tpl-ink); letter-spacing: 0.02em; }
.aqt-ways { margin-top: clamp(34px, 5vw, 48px); font-size: 13px; line-height: 2.2;
  color: var(--tpl-ink2); }
.aqt-ways span { display: block; }
.aqt-note { margin-top: 26px; font-size: 12px; color: var(--tpl-ink3); line-height: 1.9; }
`;

export default function AccessQuiet(p: SectionProps) {
  const d = accessOf(p.config, p.data);
  if (d.rows.length === 0) return null;
  return (
    <section id={p.id} className="ms aqt">
      <Base />
      <Styles id="access-quiet" css={CSS} />
      <div className="aqt-wrap">
        <p className="aqt-eyebrow">{d.eyebrow}</p>
        <F p={p} at={["heading"]} v={d.heading}>
          <h2 className="aqt-h ms-serif">{d.heading}</h2>
        </F>
        {d.lead && (
          <F p={p} at={["lead"]} v={d.lead}>
            <p className="aqt-lead">{d.lead}</p>
          </F>
        )}
        <div className="aqt-list">
          {d.rows.map((r, i) => (
            <div key={r.label} className="aqt-item">
              <span className="aqt-label">{r.label}</span>
              <F p={p} at={["rows", i, "value"]} v={r.value}>
                <p className="aqt-value ms-serif">{r.value}</p>
              </F>
            </div>
          ))}
        </div>
        {d.ways.length > 0 && (
          <div className="aqt-ways">
            {d.ways.map((w, i) => (
              <span key={i}>{w}</span>
            ))}
          </div>
        )}
        {d.note && <p className="aqt-note">{d.note}</p>}
      </div>
    </section>
  );
}
