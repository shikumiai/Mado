"use client";

/**
 * works / 静寂 — 1点ずつ、間をあけて。
 * clean-arch の今の作品一覧を引き取った型。飾りを足さず、写真と短い注記だけ。
 * 作品そのものを見てほしい商売（設計・写真・工芸）のため。
 */

import type { SectionProps } from "../types";
import { worksOf } from "../data";
import { Base, DetailLink, F, Media, Styles, pad2 } from "../shared";
import { SceneArt } from "../art";

const CSS = `
.wqt { background: var(--tpl-surface); padding-top: clamp(70px, 9vw, 120px); }
.wqt-wrap { max-width: 1000px; margin: 0 auto; }
.wqt-eyebrow { font-size: 11px; letter-spacing: 0.4em; color: var(--tpl-ink3); margin: 0 0 16px; }
.wqt-h { font-size: clamp(1.3rem, 2.8vw, 1.8rem); color: var(--tpl-ink); margin: 0;
  font-weight: 400; letter-spacing: 0.03em; }
.wqt-item { margin-top: clamp(52px, 8vw, 104px); }
.wqt-img { aspect-ratio: 16 / 9; border-radius: 2px; }
.wqt-cap { display: grid; grid-template-columns: 40px minmax(0, 1fr) auto; gap: 18px;
  align-items: baseline; margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--tpl-line); }
.wqt-no { font-size: 11px; color: var(--tpl-ink3); letter-spacing: 0.1em; }
.wqt-title { font-size: 17px; line-height: 1.6; color: var(--tpl-ink); margin: 0; font-weight: 400;
  letter-spacing: 0.04em; }
.wqt-sub { font-size: 12px; color: var(--tpl-ink3); margin-top: 6px; line-height: 1.9; max-width: 56ch; }
.wqt-meta { font-size: 12px; color: var(--tpl-ink3); letter-spacing: 0.06em; white-space: nowrap; }
@media (max-width: 640px) {
  .wqt-cap { grid-template-columns: 34px minmax(0, 1fr); }
  .wqt-meta { grid-column: 2; }
}
`;

export default function WorksQuiet(p: SectionProps) {
  const d = worksOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms wqt">
      <Base />
      <Styles id="works-quiet" css={CSS} />
      <div className="wqt-wrap">
        <p className="wqt-eyebrow">{d.eyebrow}</p>
        <F p={p} at={["heading"]} v={d.heading}>
          <h2 className="wqt-h ms-serif">{d.heading}</h2>
        </F>
        {d.items.map((w, i) => (
          <article key={w.id ?? i} className="wqt-item">
            <F p={p} at={["items", i, "image"]} v={w.image || ""} type="image">
              <Media
                src={w.image}
                alt={w.title}
                art={<SceneArt seed={i + 3} category={w.category} />}
                className="wqt-img"
              />
            </F>
            <div className="wqt-cap">
              <span className="wqt-no ms-num">{pad2(i)}</span>
              <div>
                <DetailLink section="works" item={w} index={i}>
                  <F p={p} at={["items", i, "title"]} v={w.title}>
                    <h3 className="wqt-title ms-serif">{w.titleEn || w.title}</h3>
                  </F>
                </DetailLink>
                {w.description && (
                  <F p={p} at={["items", i, "description"]} v={w.description}>
                    <p className="wqt-sub">{w.description}</p>
                  </F>
                )}
              </div>
              <span className="wqt-meta ms-num">{[w.category, w.year].filter(Boolean).join("　")}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
