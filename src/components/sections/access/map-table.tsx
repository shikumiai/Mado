"use client";

/**
 * access / 地図＋表 — 左に地図、右に住所・電話・時間の表。
 * 「行ける店かどうか」を1画面で判断させる形。店舗・クリニック・事務所の標準。
 * 地図の埋め込みが無いうちは、設計された地図の絵が入るので空白にならない。
 */

import { Clock, MapPin, Phone } from "lucide-react";
import type { SectionProps } from "../types";
import { accessOf } from "../data";
import { Base, F, HeadSplit, Styles } from "../shared";
import { HoursGrid, MapFrame } from "./parts";

const CSS = `
.amt { background: var(--tpl-bg); }
.amt-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: clamp(24px, 4vw, 44px); max-width: 1140px; margin: 0 auto; align-items: start; }
.amt-info { background: var(--tpl-surface); border: 1px solid var(--tpl-line); border-radius: 8px;
  overflow: hidden; }
.amt-ways { display: grid; gap: 10px; padding: 20px 22px; border-top: 1px solid var(--tpl-line);
  background: var(--tpl-bg-deep); }
.amt-way { display: flex; gap: 10px; font-size: 13.5px; line-height: 1.8; color: var(--tpl-ink2); }
.amt-way svg { color: var(--tpl-primary); flex: none; margin-top: 3px; }
.amt-quick { display: flex; flex-wrap: wrap; gap: 20px; padding: 18px 22px;
  border-bottom: 1px solid var(--tpl-line); }
.amt-quick div { display: flex; gap: 9px; align-items: center; font-size: 14px; color: var(--tpl-ink); }
.amt-quick svg { color: var(--tpl-primary); flex: none; }
.amt-quick b { font-weight: 600; }
.amt-hours { margin-top: clamp(24px, 3vw, 34px); }
.amt-hours-h { font-size: 13px; letter-spacing: 0.1em; color: var(--tpl-primary); font-weight: 700;
  margin: 0 0 12px; }
.amt-note { max-width: 1140px; margin: 22px auto 0; }
@media (max-width: 900px) { .amt-grid { grid-template-columns: 1fr; } }
`;

export default function AccessMapTable(p: SectionProps) {
  const d = accessOf(p.config, p.data);
  const c = p.config.company;
  if (d.rows.length === 0 && !d.mapEmbedUrl) return null;
  return (
    <section id={p.id} className="ms amt">
      <Base />
      <Styles id="access-map-table" css={CSS} />
      <HeadSplit p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} />
      <div className="amt-grid">
        <MapFrame
          embedUrl={d.mapEmbedUrl}
          label={c.name}
          height="clamp(300px, 42vw, 440px)"
          caption={c.address}
        />
        <div>
          <div className="amt-info">
            <div className="amt-quick">
              {c.phone && (
                <div>
                  <Phone size={16} strokeWidth={1.8} />
                  <b className="ms-num">{c.phone}</b>
                </div>
              )}
              {c.hours && (
                <div>
                  <Clock size={16} strokeWidth={1.8} />
                  <b>{c.hours}</b>
                </div>
              )}
            </div>
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
            {d.ways.length > 0 && (
              <div className="amt-ways">
                {d.ways.map((w, i) => (
                  <p key={i} className="amt-way">
                    <MapPin size={15} strokeWidth={1.8} />
                    <span>{w}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
          {d.hoursTable && (
            <div className="amt-hours">
              <h3 className="amt-hours-h">営業・受付の時間</h3>
              <HoursGrid table={d.hoursTable} />
            </div>
          )}
        </div>
      </div>
      {d.note && <p className="ms-note amt-note">{d.note}</p>}
    </section>
  );
}
