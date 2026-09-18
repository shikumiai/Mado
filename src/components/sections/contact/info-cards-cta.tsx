"use client";

/**
 * contact / 情報カード＋CTA — 連絡の手段を、大きさを変えて3つ。
 * 同じ大きさの箱を横に3つ並べる形は取らない。いちばん通じやすい手段（電話）を
 * 大きく置いて、メール・来社は小さく添える。フォームは別のセクションへ送る。
 */

import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import type { SectionProps } from "../types";
import { contactOf } from "../data";
import { Base, HeadStack, Styles } from "../shared";

const CSS = `
.cic { background: var(--tpl-bg); }
.cic-grid { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: 18px; max-width: 1060px; margin: 0 auto; align-items: stretch; }
.cic-main { background: var(--tpl-surface); border: 1px solid var(--tpl-line); border-radius: 10px;
  padding: clamp(28px, 4vw, 42px); display: flex; flex-direction: column; justify-content: center;
  transition: border-color 0.25s, box-shadow 0.25s; }
.cic-main:hover { border-color: var(--tpl-primary); box-shadow: 0 14px 32px var(--tpl-shadow-weak); }
.cic-label { display: flex; align-items: center; gap: 9px; font-size: 12px; font-weight: 700;
  letter-spacing: 0.12em; color: var(--tpl-primary); margin-bottom: 14px; }
.cic-tel { font-size: clamp(1.7rem, 4.4vw, 2.7rem); line-height: 1.1; color: var(--tpl-ink);
  font-weight: 600; letter-spacing: 0.01em; transition: color 0.2s; }
a.cic-tel:hover { color: var(--tpl-primary); }
.cic-hours { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--tpl-ink2);
  margin-top: 14px; }
.cic-hours svg { color: var(--tpl-ink3); }
.cic-side { display: grid; gap: 18px; }
.cic-card { background: var(--tpl-surface); border: 1px solid var(--tpl-line); border-radius: 10px;
  padding: 22px 24px; transition: border-color 0.25s; }
.cic-card:hover { border-color: var(--tpl-primary); }
.cic-card b { display: block; font-size: 15px; color: var(--tpl-ink); font-weight: 600; margin-top: 8px;
  word-break: break-word; }
.cic-card p { font-size: 12.5px; line-height: 1.85; color: var(--tpl-ink3); margin-top: 6px; }
.cic-cta { max-width: 1060px; margin: 18px auto 0; background: var(--tpl-primary-deep);
  border-radius: 10px; padding: clamp(24px, 3.4vw, 34px) clamp(24px, 4vw, 40px);
  display: flex; flex-wrap: wrap; align-items: center; gap: 18px; }
.cic-cta div { margin-right: auto; }
.cic-cta h3 { font-size: clamp(1.05rem, 2.2vw, 1.35rem); color: var(--tpl-on-dark); margin: 0;
  font-weight: 600; line-height: 1.4; }
.cic-cta p { font-size: 13px; line-height: 1.85; color: var(--tpl-on-dark-3); margin-top: 8px;
  max-width: 46ch; }
.cic-btn, .ms a.cic-btn { display: inline-flex; align-items: center; gap: 9px; background: var(--tpl-primary);
  color: var(--tpl-on-primary); border-radius: 6px; padding: 15px 28px; font-size: 14.5px;
  font-weight: 700; transition: background 0.2s, gap 0.2s; white-space: nowrap; }
.cic-btn:hover, .ms a.cic-btn:hover { background: var(--tpl-primary-strong); color: var(--tpl-on-primary); gap: 13px; }
@media (max-width: 860px) { .cic-grid { grid-template-columns: 1fr; } }
`;

export default function ContactInfoCardsCta(p: SectionProps) {
  const d = contactOf(p.config, p.data);
  const c = d.company;
  const tel = c.phone ? `tel:${c.phone.replace(/[^\d+]/g, "")}` : undefined;
  return (
    <section id={p.id || "contact"} className="ms cic">
      <Base />
      <Styles id="contact-info-cards-cta" css={CSS} />
      <HeadStack p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} />
      <div className="cic-grid">
        <div className="cic-main">
          <span className="cic-label">
            <Phone size={15} strokeWidth={2} />
            いちばん早いのは、お電話です
          </span>
          {tel ? (
            <a className="cic-tel ms-serif ms-num" href={tel}>{c.phone}</a>
          ) : (
            <span className="cic-tel ms-serif ms-num">{c.phone}</span>
          )}
          {c.hours && (
            <p className="cic-hours">
              <Clock size={14} strokeWidth={1.8} />
              {c.hours}
            </p>
          )}
        </div>

        <div className="cic-side">
          {c.email && (
            <div className="cic-card">
              <span className="cic-label" style={{ marginBottom: 0 }}>
                <Mail size={14} strokeWidth={2} />
                メール
              </span>
              <b>{c.email}</b>
              <p>お急ぎでなければ、こちらでも承ります。</p>
            </div>
          )}
          {c.address && (
            <div className="cic-card">
              <span className="cic-label" style={{ marginBottom: 0 }}>
                <MapPin size={14} strokeWidth={2} />
                ご来社
              </span>
              <b>{c.address}</b>
              <p>お越しの前にひとことご連絡ください。</p>
            </div>
          )}
        </div>
      </div>

      <div className="cic-cta">
        <div>
          <h3 className="ms-serif">書いて送るほうが気楽な方へ</h3>
          <p>{d.lead}</p>
        </div>
        <a className="cic-btn" href={d.primary.href}>
          {d.primary.label} <ArrowRight size={15} strokeWidth={2.2} />
        </a>
      </div>
    </section>
  );
}
