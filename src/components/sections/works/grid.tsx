"use client";

/**
 * works / 整列グリッド — 数を見せる。
 * warm-craft と trust-navy の今の実績カードを合わせて引き取った型。
 * 先頭の1件だけ大きく置いて、同じ大きさの箱が並ぶだけにならないようにしている。
 */

import type { SectionProps } from "../types";
import { worksOf } from "../data";
import { Base, F, HeadSplit, Media, Styles } from "../shared";
import { SceneArt } from "../art";

const CSS = `
.wgr-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 20px;
  max-width: 1140px; margin: 0 auto; }
.wgr-card { grid-column: span 2; background: var(--tpl-surface); border-radius: 10px; overflow: hidden;
  box-shadow: 0 3px 14px var(--tpl-shadow-weak); transition: transform 0.25s, box-shadow 0.25s; }
.wgr-card:hover { transform: translateY(-4px); box-shadow: 0 16px 34px var(--tpl-shadow-mid); }
.wgr-lead { grid-column: span 4; }
.wgr-media { position: relative; }
.wgr-img { height: 190px; border-radius: 0; }
.wgr-lead .wgr-img { height: 300px; }
.wgr-cat { position: absolute; left: 14px; top: 14px; background: var(--tpl-surface-veil);
  color: var(--tpl-primary); font-size: 11px; font-weight: 700; padding: 5px 11px; border-radius: 3px;
  backdrop-filter: blur(4px); }
.wgr-body { padding: 20px 22px 24px; }
.wgr-title { font-size: 17px; line-height: 1.45; color: var(--tpl-ink); margin: 0 0 8px; font-weight: 600; }
.wgr-lead .wgr-title { font-size: clamp(1.2rem, 2.4vw, 1.55rem); }
.wgr-specs { font-size: 12px; color: var(--tpl-ink3); margin-bottom: 10px; }
.wgr-text { font-size: 14px; line-height: 1.95; color: var(--tpl-ink2); }
.wgr-foot { display: flex; align-items: center; gap: 10px; margin-top: 14px; padding-top: 12px;
  border-top: 1px solid var(--tpl-line); font-size: 12px; color: var(--tpl-ink3); }
.wgr-foot b { color: var(--tpl-ink2); font-weight: 600; }
@media (max-width: 980px) {
  .wgr-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .wgr-lead { grid-column: span 4; }
}
@media (max-width: 640px) {
  .wgr-grid { grid-template-columns: 1fr; }
  .wgr-card, .wgr-lead { grid-column: span 1; }
  .wgr-lead .wgr-img { height: 220px; }
}
`;

export default function WorksGrid(p: SectionProps) {
  const d = worksOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms wgr">
      <Base />
      <Styles id="works-grid" css={CSS} />
      <HeadSplit p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} />
      <div className="wgr-grid">
        {d.items.map((w, i) => (
          <article key={w.id ?? i} className={`wgr-card${i === 0 ? " wgr-lead" : ""}`}>
            <div className="wgr-media">
              <F p={p} at={["items", i, "image"]} v={w.image || ""} type="image">
                <Media
                  src={w.image}
                  alt={w.title}
                  art={<SceneArt seed={i} category={w.category} />}
                  className="wgr-img"
                />
              </F>
              {w.category && <span className="wgr-cat">{w.category}</span>}
            </div>
            <div className="wgr-body">
              <F p={p} at={["items", i, "title"]} v={w.title}>
                <h3 className="wgr-title ms-serif">{w.title}</h3>
              </F>
              {w.specs && <p className="wgr-specs">{w.specs}</p>}
              <F p={p} at={["items", i, "description"]} v={w.description}>
                <p className="wgr-text">{w.description}</p>
              </F>
              <div className="wgr-foot">
                {w.client && <b>{w.client}</b>}
                <span className="ms-num" style={{ marginLeft: "auto" }}>{w.year}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
