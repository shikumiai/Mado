"use client";

/**
 * booking / フォーム — その場で予約の希望を書いて送る。
 * 右に「予約の前に知っておきたいこと」を並べて、書く手が止まらないようにしてある。
 * 公開後のサイトでは、送信内容がそのまま会社に届く。
 */

import { Clock, Phone } from "lucide-react";
import type { SectionProps } from "../types";
import { bookingOf } from "../data";
import { Base, F, Styles } from "../shared";
import { InquiryForm } from "../forms";

const CSS = `
.bfm { background: var(--tpl-surface); }
.bfm-grid { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.85fr);
  gap: clamp(28px, 5vw, 56px); max-width: 1060px; margin: 0 auto; align-items: start; }
.bfm-h { font-size: clamp(1.4rem, 3vw, 2.05rem); line-height: 1.28; color: var(--tpl-ink); margin: 0; }
.bfm-lead { font-size: 14.5px; line-height: 2.05; color: var(--tpl-ink2); margin: 16px 0 clamp(26px, 4vw, 34px);
  max-width: 48ch; }
.bfm-side { background: var(--tpl-bg-deep); border: 1px solid var(--tpl-line); border-radius: 8px;
  padding: 26px 24px; position: sticky; top: 24px; }
.bfm-side h3 { font-size: 14px; margin: 0 0 16px; color: var(--tpl-ink); font-weight: 600;
  letter-spacing: 0.04em; }
.bfm-points { display: grid; gap: 14px; margin: 0 0 22px; padding: 0; list-style: none; }
.bfm-points li { display: grid; grid-template-columns: 18px minmax(0, 1fr); gap: 10px;
  font-size: 13.5px; line-height: 1.85; color: var(--tpl-ink2); }
.bfm-points b { color: var(--tpl-primary); font-weight: 700; }
.bfm-contact { border-top: 1px solid var(--tpl-line); padding-top: 18px; display: grid; gap: 12px; }
.bfm-contact div { display: grid; grid-template-columns: 18px minmax(0, 1fr); gap: 10px;
  align-items: center; font-size: 14px; color: var(--tpl-ink); }
.bfm-contact svg { color: var(--tpl-primary); }
.bfm-contact small { display: block; font-size: 11px; color: var(--tpl-ink3); font-weight: 700;
  letter-spacing: 0.08em; margin-bottom: 2px; }
@media (max-width: 900px) {
  .bfm-grid { grid-template-columns: 1fr; }
  .bfm-side { position: static; }
}
`;

export default function BookingForm(p: SectionProps) {
  const d = bookingOf(p.config, p.data);
  const c = p.config.company;
  return (
    <section id={p.id || "booking-form"} className="ms bfm">
      <Base />
      <Styles id="booking-form" css={CSS} />
      <div className="bfm-grid">
        <div>
          <p className="ms-eyebrow">{d.eyebrow}</p>
          <F p={p} at={["heading"]} v={d.heading}>
            <h2 className="bfm-h ms-serif">{d.heading}</h2>
          </F>
          <F p={p} at={["lead"]} v={d.lead}>
            <p className="bfm-lead">{d.lead}</p>
          </F>
          <InquiryForm
            kind="booking"
            purposes={d.purposes}
            withPreferred
            source="booking/form"
            submitLabel={d.primary.label}
            messageLabel="ご希望・ご事情"
            note="いただいた内容は予約のご連絡にだけ使います。"
          />
        </div>

        <aside className="bfm-side">
          <h3 className="ms-serif">お申し込みの前に</h3>
          <ul className="bfm-points">
            <li><b>1</b><span>この場では仮のお申し込みです。こちらから折り返して日時を確定します。</span></li>
            <li><b>2</b><span>ご希望の日にちは第2希望まで書いていただけると、調整が早く済みます。</span></li>
            <li><b>3</b><span>当日のご都合が変わっても、前日までにご連絡いただければ大丈夫です。</span></li>
          </ul>
          <div className="bfm-contact">
            {c.phone && (
              <div>
                <Phone size={16} strokeWidth={1.8} />
                <span>
                  <small>電話でも受け付けます</small>
                  <b className="ms-num">{c.phone}</b>
                </span>
              </div>
            )}
            {c.hours && (
              <div>
                <Clock size={16} strokeWidth={1.8} />
                <span>
                  <small>受付時間</small>
                  {c.hours}
                </span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
