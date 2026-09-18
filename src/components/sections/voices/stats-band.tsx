"use client";

/**
 * voices / 数字の帯 — 実績を数字で言い切る。
 * trust-navy の今の「数字で見る実績」を引き取った型。濃い地の帯にして、
 * ページの流れを一度止める。件数や年数が強い商売（建設・士業）向き。
 *
 * 数字が用意されていないときは、いただいた声の数と平均評価から作る（空白にしない）。
 */

import type { Stat } from "@/lib/site-config-schema";
import type { SectionProps } from "../types";
import { voicesOf } from "../data";
import { Base, F, Styles } from "../shared";

const CSS = `
.ost { background: var(--tpl-primary-deep); padding: clamp(52px, 7vw, 88px) clamp(20px, 4vw, 28px); }
.ost-wrap { max-width: 1140px; margin: 0 auto; }
.ost-top { display: flex; align-items: baseline; gap: 18px; flex-wrap: wrap; margin-bottom: clamp(28px, 4vw, 44px); }
.ost-eyebrow { font-size: 11px; letter-spacing: 0.32em; color: var(--tpl-primary-tint); margin: 0; font-weight: 700; }
.ost-h { font-size: clamp(1.35rem, 3vw, 1.95rem); color: var(--tpl-on-dark); margin: 0; line-height: 1.3; }
.ost-lead { margin-left: auto; font-size: 13px; line-height: 1.95; color: var(--tpl-on-dark-3); max-width: 42ch; }
.ost-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 2px;
  background: var(--tpl-on-dark-line); border: 1px solid var(--tpl-on-dark-line); }
.ost-cell { background: var(--tpl-primary-deep); padding: clamp(24px, 3vw, 36px) 22px; }
.ost-num { font-size: clamp(2.2rem, 5vw, 3.4rem); line-height: 1; color: var(--tpl-on-dark);
  font-weight: 600; display: flex; align-items: baseline; gap: 4px; }
.ost-num span { font-size: 15px; color: var(--tpl-primary-tint); font-weight: 400; }
.ost-tick { display: block; width: 26px; height: 2px; background: var(--tpl-sub1); margin: 16px 0 12px; }
.ost-label { font-size: 13px; line-height: 1.7; color: var(--tpl-on-dark-2); }
.ost-quote { margin-top: clamp(28px, 4vw, 44px); padding-top: 22px; border-top: 1px solid var(--tpl-on-dark-line);
  display: flex; flex-wrap: wrap; gap: 12px 28px; }
.ost-quote p { font-size: 13.5px; line-height: 1.95; color: var(--tpl-on-dark-2); flex: 1 1 260px; }
.ost-quote b { display: block; font-size: 12px; color: var(--tpl-on-dark-3); font-weight: 400; margin-top: 6px; }
`;

/** 数字が無いときの受け皿。声の数と平均評価から作る */
function fallbackStats(count: number, avg: number): Stat[] {
  return [
    { num: String(count), unit: "件", label: "いただいたお客様の声" },
    { num: avg.toFixed(1), unit: "", label: "5段階の平均評価" },
  ];
}

export default function VoicesStatsBand(p: SectionProps) {
  const d = voicesOf(p.config, p.data);
  const avg = d.items.length
    ? d.items.reduce((a, v) => a + (v.rating ?? 5), 0) / d.items.length
    : 5;
  const stats = d.stats.length > 0 ? d.stats : d.items.length > 0 ? fallbackStats(d.items.length, avg) : [];
  if (stats.length === 0) return null;
  return (
    <section id={p.id} className="ms ost">
      <Base />
      <Styles id="voices-stats-band" css={CSS} />
      <div className="ost-wrap">
        <div className="ost-top">
          <div>
            <p className="ost-eyebrow">{d.eyebrow}</p>
            <F p={p} at={["heading"]} v={d.heading}>
              <h2 className="ost-h ms-serif" style={{ marginTop: 10 }}>{d.heading}</h2>
            </F>
          </div>
          {d.lead && <p className="ost-lead">{d.lead}</p>}
        </div>
        <div className="ost-grid">
          {stats.map((s, i) => (
            <div key={i} className="ost-cell">
              <p className="ost-num ms-serif ms-num">
                {s.num}
                {s.unit && <span>{s.unit}</span>}
              </p>
              <span className="ost-tick" />
              <p className="ost-label">{s.label}</p>
            </div>
          ))}
        </div>
        {d.items.length > 0 && (
          <div className="ost-quote">
            {d.items.slice(0, 2).map((v, i) => (
              <p key={i}>
                {v.text}
                <b>— {v.name}　{v.project}</b>
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
