"use client";

/**
 * contact / フォームのみ — 用紙のように、1枚で完結させる。
 * 項目名を左、入力欄を右に置いた2段組みなので、書く順番で迷わない。
 * 連絡先を別のセクション（access）で出している構成のときに使う。
 */

import type { SectionProps } from "../types";
import { contactOf } from "../data";
import { Base, F, Styles } from "../shared";
import { InquiryForm } from "../forms";

const CSS = `
.cfo { background: var(--tpl-surface); }
.cfo-wrap { max-width: 720px; margin: 0 auto; }
.cfo-head { border-bottom: 2px solid var(--tpl-ink); padding-bottom: 18px;
  margin-bottom: clamp(28px, 4vw, 40px); }
.cfo-h { font-size: clamp(1.4rem, 3vw, 2rem); line-height: 1.3; color: var(--tpl-ink); margin: 0; }
.cfo-lead { font-size: 14.5px; line-height: 2.05; color: var(--tpl-ink2); margin: 14px 0 0; max-width: 50ch; }
/* 項目名を左、入力を右に置く（用紙の見え方） */
.cfo-sheet .ms-field { display: grid; grid-template-columns: 148px minmax(0, 1fr); gap: 0 20px;
  align-items: start; margin-bottom: 18px; }
.cfo-sheet .ms-field > span { padding-top: 13px; margin-bottom: 0; font-size: 13px; }
.cfo-sheet .ms-form-row { display: block; }
.cfo-sheet form > div:last-of-type { padding-left: 168px; }
@media (max-width: 700px) {
  .cfo-sheet .ms-field { grid-template-columns: 1fr; gap: 6px; }
  .cfo-sheet .ms-field > span { padding-top: 0; }
  .cfo-sheet form > div:last-of-type { padding-left: 0; }
}
`;

export default function ContactFormOnly(p: SectionProps) {
  const d = contactOf(p.config, p.data);
  return (
    <section id={p.id || "contact"} className="ms cfo">
      <Base />
      <Styles id="contact-form-only" css={CSS} />
      <div className="cfo-wrap">
        <div className="cfo-head">
          <p className="ms-eyebrow">{d.eyebrow}</p>
          <F p={p} at={["heading"]} v={d.heading}>
            <h2 className="cfo-h ms-serif">{d.heading}</h2>
          </F>
          <F p={p} at={["lead"]} v={d.lead}>
            <p className="cfo-lead">{d.lead}</p>
          </F>
        </div>
        <div className="cfo-sheet">
          <InquiryForm
            kind="contact"
            purposes={d.purposes}
            source="contact/form-only"
            submitLabel={d.primary.label}
            note={d.note ?? "いただいた内容はご返信にだけ使います。"}
          />
        </div>
      </div>
    </section>
  );
}
