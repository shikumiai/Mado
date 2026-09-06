"use client";

/**
 * works / 大画像＋一覧 — 1件を大きく見せながら、他も同時に見える。
 * 右の一覧を選ぶと左の写真と説明が入れ替わる。件数が多くても縦に伸びない。
 */

import { useState } from "react";
import type { SectionProps } from "../types";
import { worksOf } from "../data";
import { Base, DetailLink, F, HeadStack, Media, Styles, pad2 } from "../shared";
import { SceneArt } from "../art";

const CSS = `
.wfl-grid { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.65fr);
  gap: clamp(20px, 3.4vw, 44px); max-width: 1140px; margin: 0 auto; align-items: start; }
.wfl-stage { background: var(--tpl-surface); border-radius: 10px; overflow: hidden;
  box-shadow: 0 6px 24px var(--tpl-shadow-weak); }
.wfl-img { height: clamp(240px, 33vw, 420px); border-radius: 0; }
.wfl-cap { padding: clamp(20px, 2.6vw, 30px); }
.wfl-cat { display: inline-block; font-size: 11px; font-weight: 700; color: var(--tpl-primary);
  letter-spacing: 0.1em; margin-bottom: 10px; }
.wfl-title { font-size: clamp(1.25rem, 2.6vw, 1.75rem); line-height: 1.35; color: var(--tpl-ink);
  margin: 0 0 12px; font-weight: 600; }
.wfl-text { font-size: 14.5px; line-height: 2; color: var(--tpl-ink2); max-width: 58ch; }
.wfl-facts { display: flex; flex-wrap: wrap; gap: 8px 22px; margin-top: 18px; padding-top: 16px;
  border-top: 1px solid var(--tpl-line); font-size: 12.5px; color: var(--tpl-ink3); }
.wfl-facts b { color: var(--tpl-ink2); font-weight: 600; }
.wfl-list { display: flex; flex-direction: column; }
.wfl-row { display: grid; grid-template-columns: 34px 62px minmax(0, 1fr); gap: 12px; align-items: center;
  padding: 12px 10px; background: none; border: 0; border-bottom: 1px solid var(--tpl-line);
  text-align: left; cursor: pointer; font-family: inherit; transition: background 0.2s; }
.wfl-row:first-child { border-top: 1px solid var(--tpl-line); }
.wfl-row:hover { background: var(--tpl-surface); }
.wfl-row[aria-current="true"] { background: var(--tpl-surface); box-shadow: inset 3px 0 0 var(--tpl-primary); }
.wfl-row-no { font-size: 11px; color: var(--tpl-ink3); font-weight: 700; letter-spacing: 0.08em; }
.wfl-thumb { height: 44px; border-radius: 3px; }
.wfl-row-title { display: block; font-size: 13.5px; line-height: 1.5; color: var(--tpl-ink);
  font-weight: 600; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wfl-row-meta { display: block; font-size: 11px; color: var(--tpl-ink3); margin-top: 2px; }
@media (max-width: 900px) {
  .wfl-grid { grid-template-columns: 1fr; }
}
`;

export default function WorksFeatureList(p: SectionProps) {
  const d = worksOf(p.config, p.data);
  const [active, setActive] = useState(0);
  if (d.items.length === 0) return null;
  const i = Math.min(active, d.items.length - 1);
  const cur = d.items[i];
  return (
    <section id={p.id} className="ms wfl">
      <Base />
      <Styles id="works-feature-list" css={CSS} />
      <HeadStack p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} />
      <div className="wfl-grid">
        <div className="wfl-stage">
          <F p={p} at={["items", i, "image"]} v={cur.image || ""} type="image">
            <Media
              src={cur.image}
              alt={cur.title}
              art={<SceneArt seed={i} category={cur.category} />}
              className="wfl-img"
            />
          </F>
          <div className="wfl-cap">
            {cur.category && <span className="wfl-cat">{cur.category}</span>}
            <DetailLink section="works" item={cur} index={i}>
              <F p={p} at={["items", i, "title"]} v={cur.title}>
                <h3 className="wfl-title ms-serif">{cur.title}</h3>
              </F>
            </DetailLink>
            <F p={p} at={["items", i, "description"]} v={cur.description}>
              <p className="wfl-text">{cur.description}</p>
            </F>
            <div className="wfl-facts">
              {cur.specs && <span><b>仕様</b> {cur.specs}</span>}
              {cur.client && <span><b>お客様</b> {cur.client}</span>}
              <span className="ms-num"><b>竣工</b> {cur.year}</span>
            </div>
          </div>
        </div>
        <div className="wfl-list">
          {d.items.map((w, n) => (
            <button
              key={w.id ?? n}
              type="button"
              className="wfl-row"
              aria-current={n === i}
              onClick={() => setActive(n)}
            >
              <span className="wfl-row-no ms-num">{pad2(n)}</span>
              <Media
                src={w.image}
                alt=""
                art={<SceneArt seed={n} category={w.category} />}
                className="wfl-thumb"
              />
              <span>
                <span className="wfl-row-title ms-serif">{w.title}</span>
                <span className="wfl-row-meta ms-num">{w.category} ・ {w.year}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
