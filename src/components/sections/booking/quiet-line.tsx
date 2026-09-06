"use client";

/**
 * booking / 静寂の1行 — 1文と、下線のリンクだけ。
 * ボタンの塗りも帯も置かない。予約が「お願いする」ものではなく
 * 「声をかける」ものである商売（設計・工房・撮影）向き。
 */

import type { SectionProps } from "../types";
import { bookingOf } from "../data";
import { Base, F, Styles } from "../shared";

const CSS = `
.bql { background: var(--tpl-bg); padding-top: clamp(84px, 12vw, 148px);
  padding-bottom: clamp(84px, 12vw, 148px); }
.bql-wrap { max-width: 640px; margin: 0 auto; text-align: center; }
.bql-eyebrow { font-size: 10px; letter-spacing: 0.44em; color: var(--tpl-ink3); font-weight: 600;
  margin: 0 0 22px; }
.bql-h { font-size: clamp(1.4rem, 3.2vw, 2.1rem); line-height: 1.6; color: var(--tpl-ink); margin: 0;
  font-weight: 500; letter-spacing: 0.02em; }
.bql-lead { font-size: 14px; line-height: 2.25; color: var(--tpl-ink2); margin: 22px auto 0; max-width: 38ch; }
.bql-acts { display: flex; flex-wrap: wrap; justify-content: center; gap: 28px;
  margin-top: clamp(36px, 5vw, 52px); }
.bql-link { font-size: 15px; letter-spacing: 0.06em; color: var(--tpl-ink); font-weight: 500;
  border-bottom: 1px solid var(--tpl-primary); padding-bottom: 6px;
  transition: color 0.2s, border-color 0.2s; }
.bql-link:hover { color: var(--tpl-primary); }
.bql-sub { font-size: 15px; letter-spacing: 0.06em; color: var(--tpl-ink2);
  border-bottom: 1px solid var(--tpl-line-strong); padding-bottom: 6px;
  transition: color 0.2s, border-color 0.2s; }
.bql-sub:hover { color: var(--tpl-primary); border-color: var(--tpl-primary); }
.bql-note { font-size: 12px; line-height: 2; color: var(--tpl-ink3); margin: clamp(32px, 4vw, 44px) auto 0;
  max-width: 34ch; }
`;

export default function BookingQuietLine(p: SectionProps) {
  const d = bookingOf(p.config, p.data);
  return (
    <section id={p.id} className="ms bql">
      <Base />
      <Styles id="booking-quiet-line" css={CSS} />
      <div className="bql-wrap">
        <p className="bql-eyebrow">{d.eyebrow}</p>
        <F p={p} at={["heading"]} v={d.heading}>
          <h2 className="bql-h ms-serif">{d.heading}</h2>
        </F>
        <F p={p} at={["lead"]} v={d.lead}>
          <p className="bql-lead">{d.lead}</p>
        </F>
        <div className="bql-acts">
          <a className="bql-link ms-serif" href={d.primary.href}>
            {d.primary.label}
          </a>
          {d.secondary && (
            <a className="bql-sub ms-serif ms-num" href={d.secondary.href}>
              {d.secondary.label}
            </a>
          )}
        </div>
        {d.note && <p className="bql-note">{d.note}</p>}
      </div>
    </section>
  );
}
