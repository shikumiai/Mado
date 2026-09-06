"use client";

/**
 * menu / タブ分類 — 分類を選んで、その中だけ見る。
 * 品数が多くて分類がはっきりしている店（カフェ・物販・スクールのコース）向き。
 * 全部を1画面に積まないので、探している人が早くたどり着ける。
 */

import { useState } from "react";
import { Star } from "lucide-react";
import type { SectionProps } from "../types";
import { groupByCategory, menuOf } from "../data";
import { Base, F, HeadRule, Media, Styles } from "../shared";
import { DishArt } from "../art";

const CSS = `
.mtb-wrap { max-width: 1080px; margin: 0 auto; }
.mtb-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: clamp(24px, 3.4vw, 36px); }
.mtb-tab { padding: 10px 20px; border-radius: 4px; border: 1px solid var(--tpl-line-strong);
  background: none; font-family: inherit; font-size: 13.5px; font-weight: 600; color: var(--tpl-ink2);
  cursor: pointer; transition: background 0.2s, color 0.2s, border-color 0.2s; }
.mtb-tab:hover { border-color: var(--tpl-primary); color: var(--tpl-primary); }
.mtb-tab[aria-selected="true"] { background: var(--tpl-primary); border-color: var(--tpl-primary);
  color: var(--tpl-on-primary); }
.mtb-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.mtb-item { display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 16px;
  background: var(--tpl-surface); border-radius: 8px; padding: 14px; align-items: center;
  transition: box-shadow 0.2s; }
.mtb-item:hover { box-shadow: 0 10px 24px var(--tpl-shadow-weak); }
.mtb-img { aspect-ratio: 1 / 1; border-radius: 5px; }
.mtb-name { font-size: 15.5px; line-height: 1.45; color: var(--tpl-ink); margin: 0; font-weight: 600;
  display: flex; align-items: center; gap: 7px; }
.mtb-name svg { color: var(--tpl-primary); flex: none; }
.mtb-text { font-size: 12.5px; line-height: 1.85; color: var(--tpl-ink3); margin-top: 5px; }
.mtb-price { font-size: 16px; color: var(--tpl-primary); font-weight: 600; margin-top: 8px; }
.mtb-note { margin-top: 24px; }
`;

export default function MenuTabs(p: SectionProps) {
  const d = menuOf(p.config, p.data);
  const [active, setActive] = useState(0);
  if (d.items.length === 0) return null;
  const groups = groupByCategory(d.items);
  const cur = groups[Math.min(active, groups.length - 1)];
  return (
    <section id={p.id} className="ms mtb">
      <Base />
      <Styles id="menu-tabs" css={CSS} />
      <div className="mtb-wrap">
        <HeadRule p={p} eyebrow={d.eyebrow} heading={d.heading} />
        <div className="mtb-tabs" role="tablist" aria-label={d.heading}>
          {groups.map((g, i) => (
            <button
              key={g.name}
              type="button"
              role="tab"
              className="mtb-tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
            >
              {g.name}
              <span className="ms-num" style={{ marginLeft: 8, opacity: 0.7 }}>{g.items.length}</span>
            </button>
          ))}
        </div>
        <div className="mtb-list" role="tabpanel" aria-label={cur.name}>
          {cur.items.map((m, i) => {
            const idx = d.items.indexOf(m);
            return (
              <article key={m.id ?? i} className="mtb-item">
                <Media
                  src={m.image}
                  alt={m.name}
                  art={<DishArt seed={idx} category={m.category} name={m.name} />}
                  className="mtb-img"
                />
                <div>
                  <F p={p} at={["items", idx, "name"]} v={m.name}>
                    <h3 className="mtb-name ms-serif">
                      {m.isRecommended && <Star size={13} fill="currentColor" />}
                      {m.name}
                    </h3>
                  </F>
                  {m.description && <p className="mtb-text">{m.description}</p>}
                  <F p={p} at={["items", idx, "price"]} v={m.price}>
                    <p className="mtb-price ms-serif ms-num">{m.price}</p>
                  </F>
                </div>
              </article>
            );
          })}
        </div>
        {d.note && <p className="ms-note mtb-note">{d.note}</p>}
      </div>
    </section>
  );
}
