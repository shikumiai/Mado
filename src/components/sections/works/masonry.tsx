"use client";

/**
 * works / メイソンリー誌面 — 高さの違う写真を積む。
 * 縦長・横長が混ざる実物（住宅の外観と内観、料理と店内）をそのままの形で並べられる。
 * 箱の高さを揃えないので、写真を切り落とさずに済む。
 */

import type { SectionProps } from "../types";
import { worksOf } from "../data";
import { Base, DetailLink, F, HeadRule, Media, Styles, pad2 } from "../shared";
import { SceneArt } from "../art";

const CSS = `
.wms { background: var(--tpl-surface); }
.wms-wrap { max-width: 1140px; margin: 0 auto; }
.wms-cols { column-count: 3; column-gap: 24px; }
.wms-item { break-inside: avoid; margin-bottom: 34px; }
.wms-img { border-radius: 4px; }
.wms-a1 { aspect-ratio: 4 / 5; }
.wms-a2 { aspect-ratio: 1 / 1; }
.wms-a3 { aspect-ratio: 5 / 4; }
.wms-a4 { aspect-ratio: 3 / 4; }
.wms-cap { display: flex; align-items: baseline; gap: 10px; margin-top: 14px;
  border-top: 1px solid var(--tpl-line); padding-top: 12px; }
.wms-no { font-size: 11px; letter-spacing: 0.12em; color: var(--tpl-primary); font-weight: 700; }
.wms-title { font-size: 16px; line-height: 1.5; color: var(--tpl-ink); margin: 0; font-weight: 600; }
.wms-meta { font-size: 12px; color: var(--tpl-ink3); margin-left: auto; white-space: nowrap; }
.wms-text { font-size: 13px; line-height: 1.95; color: var(--tpl-ink2); margin-top: 8px; }
@media (max-width: 980px) { .wms-cols { column-count: 2; } }
@media (max-width: 600px) { .wms-cols { column-count: 1; } }
`;

const RATIOS = ["wms-a1", "wms-a3", "wms-a4", "wms-a2", "wms-a3", "wms-a1"];

export default function WorksMasonry(p: SectionProps) {
  const d = worksOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms wms">
      <Base />
      <Styles id="works-masonry" css={CSS} />
      <div className="wms-wrap">
        <HeadRule
          p={p}
          eyebrow={d.eyebrow}
          heading={d.heading}
          right={<span className="ms-note ms-num">{d.items.length} projects</span>}
        />
        <div className="wms-cols">
          {d.items.map((w, i) => {
            const ratio = w.size === "portrait" ? "wms-a4" : w.size === "square" ? "wms-a2"
              : w.size === "landscape" ? "wms-a3" : RATIOS[i % RATIOS.length];
            return (
              <article key={w.id ?? i} className="wms-item">
                <F p={p} at={["items", i, "image"]} v={w.image || ""} type="image">
                  <Media
                    src={w.image}
                    alt={w.title}
                    art={<SceneArt seed={i + 1} category={w.category} />}
                    className={`wms-img ${ratio}`}
                  />
                </F>
                <div className="wms-cap">
                  <span className="wms-no ms-num">{pad2(i)}</span>
                  <DetailLink section="works" item={w} index={i}>
                    <F p={p} at={["items", i, "title"]} v={w.title}>
                      <h3 className="wms-title ms-serif">{w.title}</h3>
                    </F>
                  </DetailLink>
                  <span className="wms-meta ms-num">{w.year}</span>
                </div>
                <F p={p} at={["items", i, "description"]} v={w.description}>
                  <p className="wms-text">{w.description}</p>
                </F>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
