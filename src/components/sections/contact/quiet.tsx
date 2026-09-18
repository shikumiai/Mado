"use client";

/**
 * contact / 静寂 — 連絡先を明朝で大きく置くだけ。
 * ボタンも枠も塗りも使わない。載っている文字が全部、実際に使える連絡先。
 * 設計事務所・工房・写真など、名刺のような佇まいが信用になる商売向き。
 */

import type { SectionProps } from "../types";
import { contactOf } from "../data";
import { Base, F, Styles } from "../shared";

const CSS = `
.cqt { background: var(--tpl-surface); padding-top: clamp(84px, 12vw, 152px);
  padding-bottom: clamp(84px, 12vw, 152px); }
.cqt-wrap { max-width: 620px; margin: 0 auto; }
.cqt-eyebrow { font-size: 10px; letter-spacing: 0.44em; color: var(--tpl-ink3); font-weight: 600;
  margin: 0 0 20px; }
.cqt-h { font-size: clamp(1.3rem, 2.8vw, 1.85rem); line-height: 1.5; color: var(--tpl-ink); margin: 0;
  font-weight: 500; }
.cqt-lead { font-size: 14px; line-height: 2.25; color: var(--tpl-ink2); margin: 20px 0 0; max-width: 38ch; }
.cqt-list { margin-top: clamp(48px, 7vw, 76px); display: grid; gap: clamp(26px, 4vw, 36px); }
.cqt-item small { display: block; font-size: 10.5px; letter-spacing: 0.26em; color: var(--tpl-ink3);
  font-weight: 600; margin-bottom: 10px; }
.cqt-item a, .cqt-item span { font-size: clamp(1.1rem, 2.6vw, 1.5rem); line-height: 1.5;
  color: var(--tpl-ink); letter-spacing: 0.01em; display: inline-block;
  border-bottom: 1px solid transparent; transition: color 0.2s, border-color 0.2s; }
.cqt-item a:hover { color: var(--tpl-primary); border-bottom-color: var(--tpl-primary); }
.cqt-item p { font-size: 13px; line-height: 1.95; color: var(--tpl-ink2); margin-top: 8px; }
.cqt-note { margin-top: clamp(44px, 6vw, 62px); padding-top: 22px; border-top: 1px solid var(--tpl-line);
  font-size: 12px; line-height: 2; color: var(--tpl-ink3); }
`;

export default function ContactQuiet(p: SectionProps) {
  const d = contactOf(p.config, p.data);
  const c = d.company;
  const tel = c.phone ? `tel:${c.phone.replace(/[^\d+]/g, "")}` : undefined;
  return (
    <section id={p.id || "contact"} className="ms cqt">
      <Base />
      <Styles id="contact-quiet" css={CSS} />
      <div className="cqt-wrap">
        <p className="cqt-eyebrow">{d.eyebrow}</p>
        <F p={p} at={["heading"]} v={d.heading}>
          <h2 className="cqt-h ms-serif">{d.heading}</h2>
        </F>
        <F p={p} at={["lead"]} v={d.lead}>
          <p className="cqt-lead">{d.lead}</p>
        </F>
        <div className="cqt-list">
          {c.email && (
            <div className="cqt-item">
              <small>MAIL</small>
              <a className="ms-serif" href={`mailto:${c.email}`}>{c.email}</a>
            </div>
          )}
          {c.phone && (
            <div className="cqt-item">
              <small>TEL</small>
              <a className="ms-serif ms-num" href={tel}>{c.phone}</a>
              {c.hours && <p>{c.hours}</p>}
            </div>
          )}
          {c.address && (
            <div className="cqt-item">
              <small>ADDRESS</small>
              <span className="ms-serif">{c.address}</span>
              <p>ご来所は事前にご連絡ください。</p>
            </div>
          )}
        </div>
        {d.note && <p className="cqt-note">{d.note}</p>}
      </div>
    </section>
  );
}
