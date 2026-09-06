"use client";

/**
 * booking / 写真＋CTA — 左に現場の絵、右に申し込む理由とボタン。
 * 「行ってみたら何が見られるか」を絵で見せてから誘う形。
 * 見学会・体験レッスン・内覧のように、行く前の想像が大事なときに向く。
 */

import { ArrowRight, Check, Phone } from "lucide-react";
import type { SectionProps } from "../types";
import { bookingOf } from "../data";
import { Base, F, Media, Styles } from "../shared";
import { WindowArt } from "../art";

const CSS = `
.bpc { padding-left: 0; padding-right: 0; background: var(--tpl-bg); }
.bpc-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: stretch; }
.bpc-media { position: relative; min-height: clamp(280px, 40vw, 480px); }
.bpc-frame { position: absolute; inset: 0; border-radius: 0; }
.bpc-tag { position: absolute; left: clamp(20px, 3vw, 32px); top: clamp(20px, 3vw, 32px);
  background: var(--tpl-surface-veil); backdrop-filter: blur(5px); color: var(--tpl-primary);
  font-size: 11.5px; font-weight: 700; letter-spacing: 0.06em; padding: 8px 14px; border-radius: 4px; }
.bpc-body { background: var(--tpl-surface); padding: clamp(40px, 6vw, 76px) clamp(24px, 4vw, 60px);
  display: flex; flex-direction: column; justify-content: center; }
.bpc-h { font-size: clamp(1.4rem, 3.2vw, 2.1rem); line-height: 1.3; color: var(--tpl-ink); margin: 0; }
.bpc-lead { font-size: 14.5px; line-height: 2.05; color: var(--tpl-ink2); margin: 16px 0 0; max-width: 42ch; }
.bpc-points { list-style: none; padding: 0; margin: 26px 0 0; display: grid; gap: 12px; }
.bpc-points li { display: grid; grid-template-columns: 18px minmax(0, 1fr); gap: 11px;
  font-size: 14px; line-height: 1.8; color: var(--tpl-ink2); }
.bpc-points svg { color: var(--tpl-primary); margin-top: 4px; }
.bpc-acts { display: flex; flex-wrap: wrap; gap: 12px; margin-top: clamp(26px, 4vw, 36px); }
.bpc-note { margin-top: 18px; }
@media (max-width: 880px) {
  .bpc-grid { grid-template-columns: 1fr; }
  .bpc-media { min-height: 240px; }
}
`;

export default function BookingPhotoCta(p: SectionProps) {
  const d = bookingOf(p.config, p.data);
  return (
    <section id={p.id} className="ms bpc">
      <Base />
      <Styles id="booking-photo-cta" css={CSS} />
      <div className="bpc-grid">
        <div className="bpc-media">
          <F p={p} at={["image"]} v={d.image || ""} type="image">
            <Media
              src={d.image}
              alt={d.heading}
              art={<WindowArt seed={1} />}
              className="bpc-frame"
            />
          </F>
          <span className="bpc-tag">{d.eyebrow}</span>
        </div>
        <div className="bpc-body">
          <F p={p} at={["heading"]} v={d.heading}>
            <h2 className="bpc-h ms-serif">{d.heading}</h2>
          </F>
          <F p={p} at={["lead"]} v={d.lead}>
            <p className="bpc-lead">{d.lead}</p>
          </F>
          <ul className="bpc-points">
            <li><Check size={15} strokeWidth={2.4} /><span>その場で契約をお願いすることはありません。</span></li>
            <li><Check size={15} strokeWidth={2.4} /><span>お子さま連れでお越しいただけます。</span></li>
            <li><Check size={15} strokeWidth={2.4} /><span>ご都合が合わなければ、別日でも調整します。</span></li>
          </ul>
          <div className="bpc-acts">
            <a className="ms-btn ms-btn-fill" href={d.primary.href}>
              {d.primary.label} <ArrowRight size={15} strokeWidth={2.2} />
            </a>
            {d.secondary && (
              <a className="ms-btn ms-btn-line ms-num" href={d.secondary.href}>
                <Phone size={15} strokeWidth={1.9} />
                {d.secondary.label}
              </a>
            )}
          </div>
          {d.note && <p className="ms-note bpc-note">{d.note}</p>}
        </div>
      </div>
    </section>
  );
}
