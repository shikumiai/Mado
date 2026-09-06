"use client";

/**
 * menu / 一枚看板 — 主役を1つだけ、大きく。
 * 看板メニュー・主力商品・入会プランのように「まずこれ」が決まっている商売のため。
 * 残りは脇に小さく置いて、主役の邪魔をしない。
 */

import { Star } from "lucide-react";
import type { SectionProps } from "../types";
import { menuOf } from "../data";
import { Base, F, Media, Styles } from "../shared";
import { DishArt } from "../art";

const CSS = `
.msb { background: var(--tpl-bg-deep); }
.msb-wrap { max-width: 1140px; margin: 0 auto; }
.msb-board { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  background: var(--tpl-primary-deep); border-radius: 12px; overflow: hidden;
  box-shadow: 0 24px 56px var(--tpl-shadow-mid); }
.msb-img { min-height: 320px; border-radius: 0; }
.msb-body { padding: clamp(30px, 4vw, 56px); display: flex; flex-direction: column; justify-content: center; }
.msb-badge { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
  font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: var(--tpl-on-dark-2);
  border: 1px solid var(--tpl-on-dark-line); padding: 6px 12px; border-radius: 2px; }
.msb-eyebrow { font-size: 11px; letter-spacing: 0.34em; color: var(--tpl-primary-tint); margin: 0 0 14px; }
.msb-name { font-size: clamp(1.6rem, 3.6vw, 2.6rem); line-height: 1.32; color: var(--tpl-on-dark);
  margin: 18px 0 0; font-weight: 600; }
.msb-text { font-size: 14.5px; line-height: 2.05; color: var(--tpl-on-dark-2); margin: 16px 0 0; max-width: 44ch; }
.msb-price { font-size: clamp(1.9rem, 4vw, 2.8rem); color: var(--tpl-on-dark); font-weight: 600;
  margin-top: 26px; }
.msb-price small { font-size: 13px; color: var(--tpl-on-dark-3); font-weight: 400; margin-left: 10px; }
.msb-rest { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 0 34px; margin-top: clamp(28px, 4vw, 44px); }
.msb-row { display: flex; align-items: baseline; gap: 12px; padding: 13px 0;
  border-bottom: 1px solid var(--tpl-line); }
.msb-row-name { font-size: 14.5px; color: var(--tpl-ink); font-weight: 500; }
.msb-row-cat { font-size: 11px; color: var(--tpl-ink3); }
.msb-row-price { margin-left: auto; font-size: 14.5px; color: var(--tpl-ink2); font-weight: 600; }
.msb-note { margin-top: 22px; }
@media (max-width: 860px) {
  .msb-board { grid-template-columns: 1fr; }
  .msb-img { min-height: 230px; }
}
`;

export default function MenuSignboard(p: SectionProps) {
  const d = menuOf(p.config, p.data);
  if (d.items.length === 0) return null;
  const heroIndex = Math.max(0, d.items.findIndex((m) => m.isRecommended));
  const hero = d.items[heroIndex];
  const rest = d.items.filter((_, i) => i !== heroIndex);
  return (
    <section id={p.id} className="ms msb">
      <Base />
      <Styles id="menu-signboard" css={CSS} />
      <div className="msb-wrap">
        <div className="msb-board">
          <Media
            src={hero.image}
            alt={hero.name}
            art={<DishArt seed={heroIndex} category={hero.category} name={hero.name} />}
            className="msb-img"
          />
          <div className="msb-body">
            <p className="msb-eyebrow">{d.eyebrow}</p>
            <span className="msb-badge">
              <Star size={11} fill="currentColor" /> {hero.category || "看板"}
            </span>
            <F p={p} at={["items", heroIndex, "name"]} v={hero.name}>
              <h2 className="msb-name ms-serif">{hero.name}</h2>
            </F>
            {hero.description && (
              <F p={p} at={["items", heroIndex, "description"]} v={hero.description}>
                <p className="msb-text">{hero.description}</p>
              </F>
            )}
            <F p={p} at={["items", heroIndex, "price"]} v={hero.price}>
              <p className="msb-price ms-serif ms-num">
                {hero.price}
                <small>税込</small>
              </p>
            </F>
          </div>
        </div>
        <div className="msb-rest">
          {rest.map((m, i) => {
            const idx = d.items.indexOf(m);
            return (
              <div key={m.id ?? i} className="msb-row">
                <F p={p} at={["items", idx, "name"]} v={m.name}>
                  <span className="msb-row-name ms-serif">{m.name}</span>
                </F>
                <span className="msb-row-cat">{m.category}</span>
                <span className="msb-row-price ms-num">{m.price}</span>
              </div>
            );
          })}
        </div>
        {d.note && <p className="ms-note msb-note">{d.note}</p>}
      </div>
    </section>
  );
}
