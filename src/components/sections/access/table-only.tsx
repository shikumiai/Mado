"use client";

/**
 * access / 表のみ — 地図を出さず、曜日の時間表と住所の表だけ。
 * 診療時間・受付時間がいちばん知りたい情報になる商売（クリニック・整体・士業）向き。
 * 地図の読み込みが無いぶん軽く、印刷しても読める。
 */

import type { SectionProps } from "../types";
import { accessOf } from "../data";
import { Base, F, HeadStack, Styles } from "../shared";
import { HoursGrid } from "./parts";

const CSS = `
.ato { background: var(--tpl-surface); }
.ato-wrap { max-width: 940px; margin: 0 auto; }
.ato-hours { border: 1px solid var(--tpl-line-strong); border-radius: 8px; overflow: hidden;
  margin-bottom: clamp(26px, 4vw, 40px); }
.ato-hours-h { display: flex; align-items: baseline; gap: 12px; padding: 16px 20px;
  background: var(--tpl-primary); color: var(--tpl-on-primary); }
.ato-hours-h h3 { font-size: 15px; margin: 0; font-weight: 600; letter-spacing: 0.04em; }
.ato-hours-h span { font-size: 11.5px; opacity: 0.85; }
.ato-hours-body { padding: 18px 20px 20px; background: var(--tpl-surface); }
.ato-table { border: 1px solid var(--tpl-line); border-radius: 8px; overflow: hidden; }
.ato-ways { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px 26px;
  margin-top: 22px; }
.ato-way { display: flex; gap: 10px; font-size: 13.5px; line-height: 1.85; color: var(--tpl-ink2); }
.ato-way b { color: var(--tpl-primary); flex: none; font-weight: 700; }
.ato-note { margin-top: 20px; }
`;

export default function AccessTableOnly(p: SectionProps) {
  const d = accessOf(p.config, p.data);
  if (d.rows.length === 0) return null;
  return (
    <section id={p.id} className="ms ato">
      <Base />
      <Styles id="access-table-only" css={CSS} />
      <div className="ato-wrap">
        <HeadStack p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} />

        {d.hoursTable && (
          <div className="ato-hours">
            <div className="ato-hours-h">
              <h3 className="ms-serif">受付・営業の時間</h3>
              <span>{p.config.company.hours}</span>
            </div>
            <div className="ato-hours-body">
              <HoursGrid table={d.hoursTable} />
            </div>
          </div>
        )}

        <div className="ato-table">
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

        {d.ways.length > 0 && (
          <div className="ato-ways">
            {d.ways.map((w, i) => (
              <p key={i} className="ato-way">
                <b>―</b>
                <span>{w}</span>
              </p>
            ))}
          </div>
        )}
        {d.note && <p className="ms-note ato-note">{d.note}</p>}
      </div>
    </section>
  );
}
