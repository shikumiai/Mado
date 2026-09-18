"use client";

/**
 * contact / 帯 — ページの終わりに1本。電話番号を主役に。
 * 濃い地の帯で「ここで終わり、次はこれ」を作る。
 * 上にフォームを持つページの締めとしても、単独の締めとしても置ける。
 */

import { ArrowRight, Mail, Phone } from "lucide-react";
import type { SectionProps } from "../types";
import { contactOf } from "../data";
import { Base, F, Styles } from "../shared";

const CSS = `
.cbd { padding: 0; background: var(--tpl-ink-deep); position: relative; overflow: hidden; }
.cbd::before { content: ""; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(90% 130% at 88% 0%, var(--tpl-primary-veil) 0%, transparent 58%); }
.cbd-inner { position: relative; max-width: 1140px; margin: 0 auto;
  padding: clamp(48px, 7vw, 84px) clamp(20px, 4vw, 28px);
  display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: clamp(28px, 5vw, 60px);
  align-items: center; }
.cbd-eyebrow { font-size: 11px; letter-spacing: 0.3em; font-weight: 700; color: var(--tpl-primary-tint);
  margin: 0 0 14px; }
.cbd-h { font-size: clamp(1.4rem, 3.4vw, 2.3rem); line-height: 1.3; color: var(--tpl-on-dark); margin: 0; }
.cbd-lead { font-size: 14.5px; line-height: 2; color: var(--tpl-on-dark-2); margin: 16px 0 0; max-width: 46ch; }
.cbd-acts { display: grid; gap: 14px; justify-items: stretch; min-width: min(320px, 100%); }
.cbd-tel, .ms a.cbd-tel { display: flex; align-items: center; gap: 12px; padding: 18px 24px; border-radius: 6px;
  border: 1px solid var(--tpl-on-dark-line); background: var(--tpl-on-dark-fill);
  color: var(--tpl-on-dark); transition: border-color 0.2s, background 0.2s; }
.cbd-tel:hover, .ms a.cbd-tel:hover { border-color: var(--tpl-primary-tint); background: var(--tpl-on-dark-fill-2); }
.cbd-tel small { display: block; font-size: 10.5px; font-weight: 700; letter-spacing: 0.14em;
  color: var(--tpl-on-dark-3); margin-bottom: 4px; }
.cbd-tel b { font-size: 21px; font-weight: 600; letter-spacing: 0.01em; }
.cbd-btn, .ms a.cbd-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  background: var(--tpl-primary); color: var(--tpl-on-primary); border-radius: 6px; padding: 17px 28px;
  font-size: 15px; font-weight: 700; transition: background 0.2s, gap 0.2s; }
.cbd-btn:hover, .ms a.cbd-btn:hover { background: var(--tpl-primary-strong); color: var(--tpl-on-primary); gap: 14px; }
.cbd-mail { font-size: 12.5px; color: var(--tpl-on-dark-3); display: flex; align-items: center; gap: 8px;
  justify-content: center; }
.cbd-mail a { color: var(--tpl-on-dark-2); border-bottom: 1px solid var(--tpl-on-dark-line); }
.cbd-mail a:hover { color: var(--tpl-primary-tint); }
@media (max-width: 860px) { .cbd-inner { grid-template-columns: 1fr; } }
`;

export default function ContactBand(p: SectionProps) {
  const d = contactOf(p.config, p.data);
  const c = d.company;
  const tel = c.phone ? `tel:${c.phone.replace(/[^\d+]/g, "")}` : undefined;
  return (
    <section id={p.id || "contact"} className="ms cbd">
      <Base />
      <Styles id="contact-band" css={CSS} />
      <div className="cbd-inner">
        <div>
          <p className="cbd-eyebrow">{d.eyebrow}</p>
          <F p={p} at={["heading"]} v={d.heading}>
            <h2 className="cbd-h ms-serif">{d.heading}</h2>
          </F>
          <F p={p} at={["lead"]} v={d.lead}>
            <p className="cbd-lead">{d.lead}</p>
          </F>
        </div>
        <div className="cbd-acts">
          {c.phone && (
            <a className="cbd-tel" href={tel}>
              <Phone size={20} strokeWidth={1.7} />
              <span>
                <small>{c.hours || "受付時間内に承ります"}</small>
                <b className="ms-serif ms-num">{c.phone}</b>
              </span>
            </a>
          )}
          <a className="cbd-btn" href={d.primary.href}>
            {d.primary.label} <ArrowRight size={15} strokeWidth={2.2} />
          </a>
          {c.email && (
            <p className="cbd-mail">
              <Mail size={13} strokeWidth={1.9} />
              <a href={`mailto:${c.email}`}>{c.email}</a>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
