"use client";

/**
 * staff / 静寂 — 名前と一言だけ。
 * 顔写真を出したくない商売（士業・設計・作家）のため。
 * 頭文字の丸だけを小さく添えて、名前を明朝で大きく読ませる。
 */

import type { SectionProps } from "../types";
import { staffOf } from "../data";
import { Base, F, Monogram, Styles } from "../shared";

const CSS = `
.tqt { background: var(--tpl-surface); padding-top: clamp(72px, 10vw, 128px);
  padding-bottom: clamp(72px, 10vw, 128px); }
.tqt-wrap { max-width: 860px; margin: 0 auto; }
.tqt-eyebrow { font-size: 11px; letter-spacing: 0.4em; color: var(--tpl-ink3); margin: 0 0 16px; }
.tqt-h { font-size: clamp(1.3rem, 2.8vw, 1.8rem); color: var(--tpl-ink); margin: 0;
  font-weight: 400; letter-spacing: 0.03em; }
.tqt-list { margin-top: clamp(44px, 6vw, 74px); }
.tqt-item { display: grid; grid-template-columns: 56px minmax(0, 1fr) auto; gap: 20px;
  align-items: baseline; padding: clamp(22px, 3vw, 32px) 0; border-top: 1px solid var(--tpl-line); }
.tqt-item:last-child { border-bottom: 1px solid var(--tpl-line); }
.tqt-name { font-size: 19px; line-height: 1.5; color: var(--tpl-ink); margin: 0; font-weight: 400;
  letter-spacing: 0.05em; }
.tqt-text { font-size: 13px; line-height: 2; color: var(--tpl-ink3); margin-top: 8px; max-width: 52ch; }
.tqt-role { font-size: 12px; color: var(--tpl-ink3); letter-spacing: 0.08em; white-space: nowrap; }
@media (max-width: 620px) {
  .tqt-item { grid-template-columns: 44px minmax(0, 1fr); }
  .tqt-role { grid-column: 2; }
}
`;

export default function StaffQuiet(p: SectionProps) {
  const d = staffOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms tqt">
      <Base />
      <Styles id="staff-quiet" css={CSS} />
      <div className="tqt-wrap">
        <p className="tqt-eyebrow">{d.eyebrow}</p>
        <F p={p} at={["heading"]} v={d.heading}>
          <h2 className="tqt-h ms-serif">{d.heading}</h2>
        </F>
        <div className="tqt-list">
          {d.items.map((s, i) => (
            <div key={s.id ?? i} className="tqt-item">
              <Monogram label={s.name} size={44} />
              <div>
                <F p={p} at={["items", i, "name"]} v={s.name}>
                  <h3 className="tqt-name ms-serif">{s.name}</h3>
                </F>
                {(s.bio || s.specialty) && (
                  <F p={p} at={["items", i, "bio"]} v={s.bio || s.specialty || ""}>
                    <p className="tqt-text">{s.bio || s.specialty}</p>
                  </F>
                )}
              </div>
              <span className="tqt-role">{s.role}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
