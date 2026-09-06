"use client";

/**
 * booking / 大きなCTA帯 — 濃い地の帯を1本、画面いっぱいに。
 * 「次にすること」をここだけに絞る。窓から差す光を地紋に敷いて、
 * 押し売りではなく「開いている」印象にしてある。
 */

import { ArrowRight, Phone } from "lucide-react";
import type { SectionProps } from "../types";
import { bookingOf } from "../data";
import { Base, F, Styles } from "../shared";

const CSS = `
.bcb { padding: 0; background: var(--tpl-primary-deep); position: relative; overflow: hidden; }
.bcb::before { content: ""; position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(120% 90% at 18% -20%, var(--tpl-primary-veil) 0%, transparent 62%),
    repeating-linear-gradient(90deg, transparent 0 92px, var(--tpl-on-dark-line) 92px 93px); }
.bcb-inner { position: relative; max-width: 1000px; margin: 0 auto;
  padding: clamp(56px, 8vw, 92px) clamp(20px, 4vw, 28px); text-align: center; }
.bcb-eyebrow { font-size: 11px; letter-spacing: 0.32em; font-weight: 700; color: var(--tpl-primary-tint);
  margin: 0 0 16px; }
.bcb-h { font-size: clamp(1.6rem, 4vw, 2.6rem); line-height: 1.3; color: var(--tpl-on-dark); margin: 0; }
.bcb-lead { font-size: 15px; line-height: 2.05; color: var(--tpl-on-dark-2); margin: 20px auto 0;
  max-width: 50ch; }
.bcb-acts { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px;
  margin-top: clamp(28px, 4vw, 40px); }
.bcb-main { background: var(--tpl-primary); color: var(--tpl-on-primary); border-radius: 6px;
  padding: 17px 34px; font-size: 15.5px; font-weight: 700; display: inline-flex; align-items: center;
  gap: 10px; transition: background 0.2s, gap 0.2s; }
.bcb-main:hover { background: var(--tpl-primary-strong); gap: 14px; }
.bcb-tel { display: inline-flex; align-items: center; gap: 10px; padding: 16px 28px; border-radius: 6px;
  border: 1px solid var(--tpl-on-dark-line); color: var(--tpl-on-dark); font-size: 17px;
  font-weight: 600; transition: border-color 0.2s, background 0.2s; }
.bcb-tel:hover { border-color: var(--tpl-primary-tint); background: var(--tpl-on-dark-fill); }
.bcb-note { font-size: 12.5px; line-height: 1.9; color: var(--tpl-on-dark-3); margin: 22px auto 0;
  max-width: 46ch; }
`;

export default function BookingCtaBand(p: SectionProps) {
  const d = bookingOf(p.config, p.data);
  return (
    <section id={p.id} className="ms bcb">
      <Base />
      <Styles id="booking-cta-band" css={CSS} />
      <div className="bcb-inner">
        <p className="bcb-eyebrow">{d.eyebrow}</p>
        <F p={p} at={["heading"]} v={d.heading}>
          <h2 className="bcb-h ms-serif">{d.heading}</h2>
        </F>
        <F p={p} at={["lead"]} v={d.lead}>
          <p className="bcb-lead">{d.lead}</p>
        </F>
        <div className="bcb-acts">
          <a className="bcb-main" href={d.primary.href}>
            {d.primary.label} <ArrowRight size={17} strokeWidth={2.2} />
          </a>
          {d.secondary && (
            <a className="bcb-tel ms-num" href={d.secondary.href}>
              <Phone size={17} strokeWidth={1.8} />
              {d.secondary.label}
            </a>
          )}
        </div>
        {d.note && <p className="bcb-note">{d.note}</p>}
      </div>
    </section>
  );
}
