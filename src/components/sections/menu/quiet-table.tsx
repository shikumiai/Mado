"use client";

/**
 * menu / 静寂の表 — 罫と余白だけの品書き。
 * 写真を出さない店（割烹・バー・会計事務所の料金）向き。
 * 分類は左の細い段に小さく置き、品名と値段だけを大きめに読ませる。
 */

import type { SectionProps } from "../types";
import { groupByCategory, menuOf } from "../data";
import { Base, F, Styles } from "../shared";

const CSS = `
.mqt { background: var(--tpl-surface); padding-top: clamp(72px, 10vw, 130px);
  padding-bottom: clamp(72px, 10vw, 130px); }
.mqt-wrap { max-width: 820px; margin: 0 auto; }
.mqt-eyebrow { font-size: 11px; letter-spacing: 0.4em; color: var(--tpl-ink3); margin: 0 0 16px; }
.mqt-h { font-size: clamp(1.3rem, 2.8vw, 1.8rem); color: var(--tpl-ink); margin: 0;
  font-weight: 400; letter-spacing: 0.03em; }
.mqt-group { display: grid; grid-template-columns: 130px minmax(0, 1fr); gap: clamp(14px, 3vw, 34px);
  padding: clamp(26px, 3.6vw, 40px) 0; border-top: 1px solid var(--tpl-line); }
.mqt-group:first-of-type { margin-top: clamp(40px, 6vw, 68px); }
.mqt-group:last-child { border-bottom: 1px solid var(--tpl-line); }
.mqt-cat { font-size: 12px; letter-spacing: 0.2em; color: var(--tpl-ink3); line-height: 2; }
.mqt-row { display: flex; align-items: baseline; gap: 16px; padding: 9px 0; }
.mqt-name { font-size: 15.5px; color: var(--tpl-ink); font-weight: 400; letter-spacing: 0.03em; }
.mqt-desc { font-size: 12px; color: var(--tpl-ink3); line-height: 1.9; margin-top: 2px; }
.mqt-price { margin-left: auto; font-size: 14px; color: var(--tpl-ink2); white-space: nowrap;
  letter-spacing: 0.04em; }
.mqt-note { margin-top: 26px; text-align: center; }
@media (max-width: 640px) {
  .mqt-group { grid-template-columns: 1fr; gap: 10px; }
}
`;

export default function MenuQuietTable(p: SectionProps) {
  const d = menuOf(p.config, p.data);
  if (d.items.length === 0) return null;
  const groups = groupByCategory(d.items);
  return (
    <section id={p.id} className="ms mqt">
      <Base />
      <Styles id="menu-quiet-table" css={CSS} />
      <div className="mqt-wrap">
        <p className="mqt-eyebrow">{d.eyebrow}</p>
        <F p={p} at={["heading"]} v={d.heading}>
          <h2 className="mqt-h ms-serif">{d.heading}</h2>
        </F>
        {groups.map((g) => (
          <div key={g.name} className="mqt-group">
            <p className="mqt-cat ms-serif">{g.name}</p>
            <div>
              {g.items.map((m, i) => {
                const idx = d.items.indexOf(m);
                return (
                  <div key={m.id ?? i}>
                    <div className="mqt-row">
                      <F p={p} at={["items", idx, "name"]} v={m.name}>
                        <span className="mqt-name ms-serif">{m.name}</span>
                      </F>
                      <F p={p} at={["items", idx, "price"]} v={m.price}>
                        <span className="mqt-price ms-num">{m.price}</span>
                      </F>
                    </div>
                    {m.description && <p className="mqt-desc">{m.description}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {d.note && <p className="ms-note mqt-note">{d.note}</p>}
      </div>
    </section>
  );
}
