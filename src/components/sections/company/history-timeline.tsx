"use client";

/**
 * company / 沿革主役 — 年表を主役にして、会社概要は右に添える。
 * 続けてきた年数そのものが信用になる会社（建設・製造・老舗）向き。
 * 年が縦に並び、いちばん下が今。長さがそのまま歴史の長さに見える。
 */

import type { SectionProps } from "../types";
import { companyOf } from "../data";
import { Base, F, Styles } from "../shared";

const CSS = `
.cht { background: var(--tpl-surface); }
.cht-wrap { max-width: 1080px; margin: 0 auto; }
.cht-head { margin-bottom: clamp(32px, 5vw, 52px); }
.cht-h { font-size: clamp(1.5rem, 3.4vw, 2.25rem); line-height: 1.25; color: var(--tpl-ink); margin: 0; }
.cht-lead { font-size: 15px; line-height: 2; color: var(--tpl-ink2); margin: 14px 0 0; max-width: 56ch; }
.cht-grid { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.85fr);
  gap: clamp(28px, 5vw, 56px); align-items: start; }
.cht-row { display: grid; grid-template-columns: 96px 30px minmax(0, 1fr); position: relative; }
.cht-year { font-size: 19px; color: var(--tpl-primary); font-weight: 600; padding-top: 1px;
  letter-spacing: 0.01em; }
.cht-rail { position: relative; display: flex; justify-content: center; }
.cht-rail::before { content: ""; position: absolute; top: 0; bottom: 0; width: 1px;
  background: var(--tpl-line-strong); }
.cht-row:first-child .cht-rail::before { top: 11px; }
.cht-row:last-child .cht-rail::before { bottom: auto; height: 11px; }
.cht-dot { position: relative; margin-top: 6px; width: 11px; height: 11px; border-radius: 50%;
  background: var(--tpl-surface); border: 2px solid var(--tpl-line-strong); flex: none;
  transition: border-color 0.25s, background 0.25s; }
.cht-row:hover .cht-dot { border-color: var(--tpl-primary); background: var(--tpl-primary); }
.cht-body { padding: 0 0 clamp(24px, 3vw, 34px) 20px; }
.cht-row:last-child .cht-body { padding-bottom: 0; }
.cht-t { font-size: 15.5px; line-height: 1.65; color: var(--tpl-ink); margin: 0; font-weight: 600; }
.cht-d { font-size: 13.5px; line-height: 1.95; color: var(--tpl-ink2); margin: 7px 0 0; max-width: 48ch; }
.cht-side { background: var(--tpl-bg-deep); border: 1px solid var(--tpl-line); border-radius: 8px;
  padding: 6px 22px 10px; position: sticky; top: 24px; }
.cht-side h3 { font-size: 13px; letter-spacing: 0.1em; color: var(--tpl-primary); margin: 18px 0 6px;
  font-weight: 600; }
@media (max-width: 900px) {
  .cht-grid { grid-template-columns: 1fr; }
  .cht-side { position: static; }
  .cht-row { grid-template-columns: 76px 26px minmax(0, 1fr); }
}
`;

export default function CompanyHistoryTimeline(p: SectionProps) {
  const d = companyOf(p.config, p.data);
  if (d.history.length === 0) return null;
  return (
    <section id={p.id} className="ms cht">
      <Base />
      <Styles id="company-history-timeline" css={CSS} />
      <div className="cht-wrap">
        <div className="cht-head">
          <p className="ms-eyebrow">{d.eyebrow}</p>
          <F p={p} at={["heading"]} v={d.historyHeading}>
            <h2 className="cht-h ms-serif">{d.historyHeading}</h2>
          </F>
          {d.lead && (
            <F p={p} at={["lead"]} v={d.lead}>
              <p className="cht-lead">{d.lead}</p>
            </F>
          )}
        </div>

        <div className="cht-grid">
          <div>
            {d.history.map((h, i) => (
              <div key={i} className="cht-row">
                <span className="cht-year ms-serif ms-num">{h.year}</span>
                <span className="cht-rail">
                  <span className="cht-dot" />
                </span>
                <div className="cht-body">
                  <F p={p} at={["history", i, "title"]} v={h.title}>
                    <h3 className="cht-t ms-serif">{h.title}</h3>
                  </F>
                  {h.description && <p className="cht-d">{h.description}</p>}
                </div>
              </div>
            ))}
          </div>

          <aside className="cht-side">
            <h3 className="ms-serif">{d.heading}</h3>
            <table className="ms-table">
              <tbody>
                {d.rows.slice(0, 7).map((r) => (
                  <tr key={r.label}>
                    <th scope="row">{r.label}</th>
                    <td>{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </aside>
        </div>
      </div>
    </section>
  );
}
