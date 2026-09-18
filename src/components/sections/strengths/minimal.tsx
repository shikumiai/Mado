"use client";

/**
 * strengths / アイコン最小 — 塗りも影も使わない。
 * 細い罫と余白だけで区切る。文章が短い商売、静かな見せ方が合う商売のため。
 */

import type { SectionProps } from "../types";
import { strengthsOf } from "../data";
import { Base, F, Icon, Styles } from "../shared";

const CSS = `
.smn { background: var(--tpl-surface); }
.smn-wrap { max-width: 1040px; margin: 0 auto; }
.smn-h { font-size: clamp(1.35rem, 2.8vw, 1.9rem); color: var(--tpl-ink); margin: 0;
  line-height: 1.4; font-weight: 400; letter-spacing: 0.02em; }
.smn-lead { font-size: 14px; line-height: 2; color: var(--tpl-ink3); margin: 14px 0 0; max-width: 52ch; }
.smn-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: clamp(30px, 5vw, 60px) clamp(28px, 5vw, 56px); margin-top: clamp(44px, 6vw, 76px); }
.smn-item { padding-top: 20px; border-top: 1px solid var(--tpl-line); }
.smn-icon { color: var(--tpl-primary); display: block; margin-bottom: 16px; }
.smn-title { font-size: 15px; line-height: 1.6; color: var(--tpl-ink); margin: 0 0 8px; font-weight: 600; }
.smn-text { font-size: 13px; line-height: 2; color: var(--tpl-ink3); }
`;

export default function StrengthsMinimal(p: SectionProps) {
  const d = strengthsOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms smn">
      <Base />
      <Styles id="strengths-minimal" css={CSS} />
      <div className="smn-wrap">
        <F p={p} at={["heading"]} v={d.heading}>
          <h2 className="smn-h ms-serif">{d.heading}</h2>
        </F>
        {d.lead && (
          <F p={p} at={["lead"]} v={d.lead}>
            <p className="smn-lead">{d.lead}</p>
          </F>
        )}
        <div className="smn-grid">
          {d.items.map((s, i) => (
            <div key={i} className="smn-item">
              <span className="smn-icon"><Icon name={s.icon} size={22} /></span>
              <F p={p} at={["items", i, "title"]} v={s.title}>
                <h3 className="smn-title ms-serif">{s.title}</h3>
              </F>
              <F p={p} at={["items", i, "description"]} v={s.description}>
                <p className="smn-text">{s.description}</p>
              </F>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
