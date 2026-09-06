"use client";

/**
 * company / 表＋挨拶＋沿革 — 日本の会社サイトの標準形を1つに。
 * 上に会社概要の表、右に代表あいさつ、下に沿革。
 * 取引先や求職者が「どういう会社か」を確かめる順番のまま並べてある。
 */

import type { SectionProps } from "../types";
import { companyOf } from "../data";
import { Base, F, HeadSplit, Media, Styles } from "../shared";
import { PortraitArt } from "../art";

const CSS = `
.ctm { background: var(--tpl-bg); }
.ctm-wrap { max-width: 1100px; margin: 0 auto; }
.ctm-top { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: clamp(28px, 4vw, 48px); align-items: start; }
.ctm-table { background: var(--tpl-surface); border: 1px solid var(--tpl-line); border-radius: 8px;
  overflow: hidden; }
.ctm-msg { background: var(--tpl-surface); border: 1px solid var(--tpl-line); border-radius: 8px;
  overflow: hidden; }
.ctm-photo { height: clamp(200px, 26vw, 260px); border-radius: 0; }
.ctm-msg-body { padding: 24px 24px 26px; }
.ctm-msg-h { font-size: 12px; letter-spacing: 0.16em; font-weight: 700; color: var(--tpl-primary);
  margin: 0 0 12px; }
.ctm-msg-t { font-size: clamp(1.05rem, 2.2vw, 1.3rem); line-height: 1.5; color: var(--tpl-ink);
  margin: 0 0 14px; font-weight: 600; }
.ctm-msg-p { font-size: 13.5px; line-height: 2.05; color: var(--tpl-ink2); white-space: pre-line; }
.ctm-sign { margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--tpl-line);
  display: flex; align-items: baseline; gap: 10px; }
.ctm-sign small { font-size: 11.5px; color: var(--tpl-ink3); }
.ctm-sign b { font-size: 16px; color: var(--tpl-ink); font-weight: 600; }
.ctm-hist { margin-top: clamp(36px, 5vw, 56px); }
.ctm-hist-h { display: flex; align-items: center; gap: 16px; margin-bottom: 22px; }
.ctm-hist-h h3 { font-size: 15px; letter-spacing: 0.1em; color: var(--tpl-primary); margin: 0;
  font-weight: 600; }
.ctm-hist-h span { flex: 1; height: 1px; background: var(--tpl-line-strong); }
.ctm-hist-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 clamp(28px, 4vw, 52px); }
.ctm-hist-row { display: grid; grid-template-columns: 74px minmax(0, 1fr); gap: 16px;
  padding: 13px 0; border-bottom: 1px solid var(--tpl-line); align-items: baseline; }
.ctm-hist-y { font-size: 15px; color: var(--tpl-primary); font-weight: 600; }
.ctm-hist-t { font-size: 14px; line-height: 1.75; color: var(--tpl-ink); margin: 0; font-weight: 500; }
.ctm-hist-d { font-size: 12.5px; line-height: 1.85; color: var(--tpl-ink3); margin-top: 4px; }
@media (max-width: 900px) {
  .ctm-top { grid-template-columns: 1fr; }
  .ctm-hist-list { grid-template-columns: 1fr; }
}
`;

export default function CompanyTableMessageHistory(p: SectionProps) {
  const d = companyOf(p.config, p.data);
  const c = d.company;
  if (d.rows.length === 0) return null;
  return (
    <section id={p.id} className="ms ctm">
      <Base />
      <Styles id="company-table-message-history" css={CSS} />
      <div className="ctm-wrap">
        <HeadSplit p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} />

        <div className="ctm-top">
          <div className="ctm-table">
            <table className="ms-table">
              <tbody>
                {d.rows.map((r, i) => (
                  <tr key={r.label}>
                    <th scope="row">{r.label}</th>
                    <td>
                      <F p={p} at={["rows", i, "value"]} v={r.value}>
                        <span>{r.value}</span>
                      </F>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {d.message && (
            <div className="ctm-msg">
              <F p={p} at={["image"]} v={d.image || ""} type="image">
                <Media
                  src={d.image}
                  alt={c.ceo}
                  art={<PortraitArt seed={0} />}
                  className="ctm-photo"
                />
              </F>
              <div className="ctm-msg-body">
                <p className="ctm-msg-h">{d.messageHeading}</p>
                {d.messageTitle && <h3 className="ctm-msg-t ms-serif">{d.messageTitle}</h3>}
                <F p={p} at={["message"]} v={d.message}>
                  <p className="ctm-msg-p">{d.message}</p>
                </F>
                <div className="ctm-sign">
                  <small>{c.ceoTitle || "代表"}</small>
                  <b className="ms-serif">{c.ceo}</b>
                </div>
              </div>
            </div>
          )}
        </div>

        {d.history.length > 0 && (
          <div className="ctm-hist">
            <div className="ctm-hist-h">
              <h3 className="ms-serif">{d.historyHeading}</h3>
              <span />
            </div>
            <div className="ctm-hist-list">
              {d.history.map((h, i) => (
                <div key={i} className="ctm-hist-row">
                  <span className="ctm-hist-y ms-serif ms-num">{h.year}</span>
                  <div>
                    <F p={p} at={["history", i, "title"]} v={h.title}>
                      <h4 className="ctm-hist-t">{h.title}</h4>
                    </F>
                    {h.description && <p className="ctm-hist-d">{h.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
