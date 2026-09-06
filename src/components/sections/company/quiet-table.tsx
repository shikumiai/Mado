"use client";

/**
 * company / 静寂の表 — 罫と余白だけの会社概要。
 * 背景の塗りもバッジも使わない。項目名を小さく、値を明朝で。
 * 白と余白で見せるテンプレ（設計・写真・工芸）で、他のセクションと調子が揃う。
 */

import type { SectionProps } from "../types";
import { companyOf } from "../data";
import { Base, F, Styles } from "../shared";

const CSS = `
.cqt2 { background: var(--tpl-bg); padding-top: clamp(76px, 10vw, 132px);
  padding-bottom: clamp(76px, 10vw, 132px); }
.cqt2-wrap { max-width: 720px; margin: 0 auto; }
.cqt2-eyebrow { font-size: 10px; letter-spacing: 0.42em; color: var(--tpl-ink3); font-weight: 600;
  margin: 0 0 18px; }
.cqt2-h { font-size: clamp(1.3rem, 2.8vw, 1.85rem); line-height: 1.4; color: var(--tpl-ink); margin: 0;
  font-weight: 500; }
.cqt2-lead { font-size: 14px; line-height: 2.2; color: var(--tpl-ink2); margin: 18px 0 0; max-width: 44ch; }
.cqt2-list { margin-top: clamp(44px, 6vw, 68px); }
.cqt2-row { display: grid; grid-template-columns: 130px minmax(0, 1fr); gap: 24px;
  padding: 17px 0; border-bottom: 1px solid var(--tpl-line); align-items: baseline; }
.cqt2-row:first-child { border-top: 1px solid var(--tpl-line); }
.cqt2-label { font-size: 10.5px; letter-spacing: 0.22em; color: var(--tpl-ink3); font-weight: 600; }
.cqt2-value { font-size: 15px; line-height: 1.9; color: var(--tpl-ink); letter-spacing: 0.01em; }
.cqt2-hist { margin-top: clamp(46px, 6vw, 70px); }
.cqt2-hist-h { font-size: 10.5px; letter-spacing: 0.26em; color: var(--tpl-ink3); font-weight: 600;
  margin: 0 0 18px; }
.cqt2-hist-row { display: grid; grid-template-columns: 74px minmax(0, 1fr); gap: 20px;
  padding: 11px 0; align-items: baseline; }
.cqt2-hist-y { font-size: 13px; color: var(--tpl-ink3); }
.cqt2-hist-t { font-size: 14px; line-height: 1.8; color: var(--tpl-ink2); margin: 0; font-weight: 400; }
@media (max-width: 600px) {
  .cqt2-row, .cqt2-hist-row { grid-template-columns: 1fr; gap: 6px; }
}
`;

export default function CompanyQuietTable(p: SectionProps) {
  const d = companyOf(p.config, p.data);
  if (d.rows.length === 0) return null;
  return (
    <section id={p.id} className="ms cqt2">
      <Base />
      <Styles id="company-quiet-table" css={CSS} />
      <div className="cqt2-wrap">
        <p className="cqt2-eyebrow">{d.eyebrow}</p>
        <F p={p} at={["heading"]} v={d.heading}>
          <h2 className="cqt2-h ms-serif">{d.heading}</h2>
        </F>
        {d.lead && (
          <F p={p} at={["lead"]} v={d.lead}>
            <p className="cqt2-lead">{d.lead}</p>
          </F>
        )}
        <div className="cqt2-list">
          {d.rows.map((r, i) => (
            <div key={r.label} className="cqt2-row">
              <span className="cqt2-label">{r.label}</span>
              <F p={p} at={["rows", i, "value"]} v={r.value}>
                <span className="cqt2-value ms-serif">{r.value}</span>
              </F>
            </div>
          ))}
        </div>
        {d.history.length > 0 && (
          <div className="cqt2-hist">
            <p className="cqt2-hist-h">{d.historyHeading}</p>
            {d.history.map((h, i) => (
              <div key={i} className="cqt2-hist-row">
                <span className="cqt2-hist-y ms-num">{h.year}</span>
                <p className="cqt2-hist-t">{h.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
