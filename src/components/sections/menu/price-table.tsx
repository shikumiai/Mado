"use client";

/**
 * menu / 価格表 — 分類ごとに、名前と値段を行で。
 * 品数が多い店（飲食・サロン・整体）向き。点線で名前と値段をつなぐので、
 * 目が横に迷わない。写真が無くても成立する。
 */

import type { SectionProps } from "../types";
import { groupByCategory, menuOf } from "../data";
import { Base, F, HeadStack, Styles } from "../shared";

const CSS = `
.mpt { background: var(--tpl-surface); }
.mpt-wrap { max-width: 980px; margin: 0 auto; }
.mpt-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: clamp(30px, 5vw, 56px); }
.mpt-group + .mpt-group { }
.mpt-cat { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
.mpt-cat h3 { font-size: 15px; letter-spacing: 0.12em; color: var(--tpl-primary); margin: 0; font-weight: 600; }
.mpt-cat span { flex: 1; height: 1px; background: var(--tpl-line-strong); }
.mpt-row { display: flex; align-items: baseline; gap: 8px; padding: 11px 0;
  border-bottom: 1px dotted var(--tpl-line-strong); }
.mpt-name { font-size: 15px; color: var(--tpl-ink); font-weight: 500; }
.mpt-star { color: var(--tpl-primary); font-size: 11px; margin-left: 6px; font-weight: 700; }
.mpt-dots { flex: 1; border-bottom: 1px dotted var(--tpl-line-strong); transform: translateY(-4px);
  min-width: 20px; }
.mpt-price { font-size: 15px; color: var(--tpl-ink); font-weight: 600; white-space: nowrap; }
.mpt-desc { font-size: 12.5px; line-height: 1.85; color: var(--tpl-ink3); margin: 4px 0 10px; }
.mpt-note { margin-top: 30px; padding-top: 16px; border-top: 1px solid var(--tpl-line); }
`;

export default function MenuPriceTable(p: SectionProps) {
  const d = menuOf(p.config, p.data);
  if (d.items.length === 0) return null;
  const groups = groupByCategory(d.items);
  return (
    <section id={p.id} className="ms mpt">
      <Base />
      <Styles id="menu-price-table" css={CSS} />
      <div className="mpt-wrap">
        <HeadStack p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} />
        <div className="mpt-cols">
          {groups.map((g) => (
            <div key={g.name} className="mpt-group">
              <div className="mpt-cat">
                <h3 className="ms-serif">{g.name}</h3>
                <span />
              </div>
              {g.items.map((m) => {
                const i = d.items.indexOf(m);
                return (
                  <div key={m.id ?? i}>
                    <div className="mpt-row">
                      <F p={p} at={["items", i, "name"]} v={m.name}>
                        <span className="mpt-name ms-serif">
                          {m.name}
                          {m.isRecommended && <span className="mpt-star">おすすめ</span>}
                        </span>
                      </F>
                      <span className="mpt-dots" />
                      <F p={p} at={["items", i, "price"]} v={m.price}>
                        <span className="mpt-price ms-num">{m.price}</span>
                      </F>
                    </div>
                    {m.description && <p className="mpt-desc">{m.description}</p>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {d.note && <p className="ms-note mpt-note">{d.note}</p>}
      </div>
    </section>
  );
}
