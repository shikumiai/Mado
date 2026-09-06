"use client";

/**
 * menu / 写真カード — 見て選んでもらう。
 * 料理・商品・コースのように、写真があるだけで決まるものに向く。
 * おすすめの1品だけ大きく置いて、残りを同じ形で並べる。
 */

import { Star } from "lucide-react";
import type { SectionProps } from "../types";
import { menuOf } from "../data";
import { Base, DetailLink, F, HeadStack, Media, Styles } from "../shared";
import { DishArt } from "../art";

const CSS = `
.mpc-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 20px;
  max-width: 1140px; margin: 0 auto; }
.mpc-card { grid-column: span 2; background: var(--tpl-surface); border-radius: 10px; overflow: hidden;
  display: flex; flex-direction: column; box-shadow: 0 3px 14px var(--tpl-shadow-weak);
  transition: transform 0.25s, box-shadow 0.25s; }
.mpc-card:hover { transform: translateY(-4px); box-shadow: 0 16px 34px var(--tpl-shadow-mid); }
.mpc-hero { grid-column: span 4; flex-direction: row; }
.mpc-img { aspect-ratio: 4 / 3; border-radius: 0; }
.mpc-hero .mpc-img { flex: 0 0 52%; aspect-ratio: auto; }
.mpc-body { padding: 20px 22px 24px; display: flex; flex-direction: column; flex: 1; }
.mpc-hero .mpc-body { justify-content: center; padding: clamp(22px, 3vw, 34px); }
.mpc-badge { display: inline-flex; align-items: center; gap: 5px; align-self: flex-start;
  font-size: 11px; font-weight: 700; color: var(--tpl-on-primary); background: var(--tpl-primary);
  padding: 4px 10px; border-radius: 3px; margin-bottom: 10px; }
.mpc-name { font-size: 17px; line-height: 1.5; color: var(--tpl-ink); margin: 0; font-weight: 600; }
.mpc-hero .mpc-name { font-size: clamp(1.2rem, 2.4vw, 1.6rem); }
.mpc-text { font-size: 13px; line-height: 1.95; color: var(--tpl-ink2); margin-top: 8px; flex: 1; }
.mpc-foot { display: flex; align-items: baseline; gap: 10px; margin-top: 16px; padding-top: 12px;
  border-top: 1px solid var(--tpl-line); }
.mpc-cat { font-size: 11px; color: var(--tpl-ink3); }
.mpc-price { margin-left: auto; font-size: 19px; color: var(--tpl-primary); font-weight: 600; }
.mpc-note { max-width: 1140px; margin: 22px auto 0; text-align: right; }
@media (max-width: 980px) {
  .mpc-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .mpc-hero { grid-column: span 4; }
}
@media (max-width: 640px) {
  .mpc-grid { grid-template-columns: 1fr; }
  .mpc-card, .mpc-hero { grid-column: span 1; }
  .mpc-hero { flex-direction: column; }
  .mpc-hero .mpc-img { flex: none; aspect-ratio: 4 / 3; }
}
`;

export default function MenuPhotoCards(p: SectionProps) {
  const d = menuOf(p.config, p.data);
  if (d.items.length === 0) return null;
  const heroIndex = Math.max(0, d.items.findIndex((m) => m.isRecommended));
  return (
    <section id={p.id} className="ms mpc">
      <Base />
      <Styles id="menu-photo-cards" css={CSS} />
      <HeadStack p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} />
      <div className="mpc-grid">
        {d.items.map((m, i) => (
          <article key={m.id ?? i} className={`mpc-card${i === heroIndex ? " mpc-hero" : ""}`}>
            <F p={p} at={["items", i, "image"]} v={m.image || ""} type="image">
              <Media
                src={m.image}
                alt={m.name}
                art={<DishArt seed={i} category={m.category} name={m.name} />}
                className="mpc-img"
              />
            </F>
            <div className="mpc-body">
              {m.isRecommended && (
                <span className="mpc-badge">
                  <Star size={11} fill="currentColor" /> おすすめ
                </span>
              )}
              <DetailLink section="menu" item={m} index={i}>
                <F p={p} at={["items", i, "name"]} v={m.name}>
                  <h3 className="mpc-name ms-serif">{m.name}</h3>
                </F>
              </DetailLink>
              {m.description && (
                <F p={p} at={["items", i, "description"]} v={m.description}>
                  <p className="mpc-text">{m.description}</p>
                </F>
              )}
              <div className="mpc-foot">
                <span className="mpc-cat">{m.category}</span>
                <F p={p} at={["items", i, "price"]} v={m.price}>
                  <span className="mpc-price ms-serif ms-num">{m.price}</span>
                </F>
              </div>
            </div>
          </article>
        ))}
      </div>
      {d.note && <p className="ms-note mpc-note">{d.note}</p>}
    </section>
  );
}
