"use client";

/**
 * contact / フォーム＋情報 — 左でフォーム、右に電話・受付時間・所在地。
 * 「書くのは面倒」という人が電話へ逃げられるようにしてある。
 * 会社サイトのお問い合わせでいちばん外れが無い形。
 */

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { SectionProps } from "../types";
import { contactOf } from "../data";
import { Base, F, Styles } from "../shared";
import { InquiryForm } from "../forms";

const CSS = `
.cfi { background: var(--tpl-bg); }
.cfi-grid { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.8fr);
  gap: clamp(28px, 5vw, 58px); max-width: 1100px; margin: 0 auto; align-items: start; }
.cfi-h { font-size: clamp(1.4rem, 3vw, 2.05rem); line-height: 1.28; color: var(--tpl-ink); margin: 0; }
.cfi-lead { font-size: 14.5px; line-height: 2.05; color: var(--tpl-ink2);
  margin: 16px 0 clamp(26px, 4vw, 34px); max-width: 48ch; }
.cfi-form { background: var(--tpl-surface); border: 1px solid var(--tpl-line); border-radius: 8px;
  padding: clamp(24px, 3.4vw, 34px); }
.cfi-side { display: grid; gap: 0; }
.cfi-tel { background: var(--tpl-primary-deep); border-radius: 8px; padding: 26px 24px;
  margin-bottom: 16px; }
.cfi-tel small { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.16em;
  color: var(--tpl-primary-tint); margin-bottom: 10px; }
.cfi-tel a { display: flex; align-items: center; gap: 11px; font-size: clamp(1.3rem, 3vw, 1.75rem);
  color: var(--tpl-on-dark); font-weight: 600; transition: color 0.2s; }
.cfi-tel a:hover { color: var(--tpl-primary-tint); }
.cfi-tel p { font-size: 12.5px; line-height: 1.85; color: var(--tpl-on-dark-3); margin-top: 12px; }
.cfi-rows { background: var(--tpl-surface); border: 1px solid var(--tpl-line); border-radius: 8px;
  padding: 22px 24px; display: grid; gap: 16px; }
.cfi-row { display: grid; grid-template-columns: 18px minmax(0, 1fr); gap: 12px; align-items: start; }
.cfi-row svg { color: var(--tpl-primary); margin-top: 3px; }
.cfi-row small { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  color: var(--tpl-ink3); margin-bottom: 3px; }
.cfi-row span { font-size: 14px; line-height: 1.8; color: var(--tpl-ink); word-break: break-word; }
@media (max-width: 900px) { .cfi-grid { grid-template-columns: 1fr; } }
`;

const ICONS = { 電話: Phone, メール: Mail, 受付時間: Clock, 所在地: MapPin } as const;

export default function ContactFormInfo(p: SectionProps) {
  const d = contactOf(p.config, p.data);
  const c = d.company;
  const tel = c.phone ? `tel:${c.phone.replace(/[^\d+]/g, "")}` : undefined;
  return (
    <section id={p.id || "contact"} className="ms cfi">
      <Base />
      <Styles id="contact-form-info" css={CSS} />
      <div className="cfi-grid">
        <div>
          <p className="ms-eyebrow">{d.eyebrow}</p>
          <F p={p} at={["heading"]} v={d.heading}>
            <h2 className="cfi-h ms-serif">{d.heading}</h2>
          </F>
          <F p={p} at={["lead"]} v={d.lead}>
            <p className="cfi-lead">{d.lead}</p>
          </F>
          <div className="cfi-form">
            <InquiryForm
              kind="contact"
              purposes={d.purposes}
              source="contact/form-info"
              submitLabel={d.primary.label}
              note={d.note ?? "いただいた内容はご返信にだけ使います。"}
            />
          </div>
        </div>

        <aside className="cfi-side">
          {c.phone && (
            <div className="cfi-tel">
              <small>電話でのお問い合わせ</small>
              <a className="ms-serif ms-num" href={tel}>
                <Phone size={20} strokeWidth={1.8} />
                {c.phone}
              </a>
              <p>{c.hours}</p>
            </div>
          )}
          <div className="cfi-rows">
            {d.rows.map((r) => {
              const I = ICONS[r.label as keyof typeof ICONS] ?? Mail;
              return (
                <div key={r.label} className="cfi-row">
                  <I size={16} strokeWidth={1.8} />
                  <div>
                    <small>{r.label}</small>
                    <span className={r.label === "電話" ? "ms-num" : undefined}>{r.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </section>
  );
}
