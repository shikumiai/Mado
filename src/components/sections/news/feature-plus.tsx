"use client";

/**
 * news / 主役1件＋小 — いちばん見せたい1件を大きく、残りは右に並べる。
 * 見学会・入荷・キャンペーンなど「今これを見てほしい」があるときの形。
 * 大きい1件には写真と前置きが付き、右のリストは日付と見出しだけで数を見せる。
 */

import { ArrowRight } from "lucide-react";
import type { SectionProps } from "../types";
import { newsOf } from "../data";
import { Base, DetailLink, F, HeadSplit, Media, Styles } from "../shared";
import { NoticeArt } from "../art";

const CSS = `
.nfp { background: var(--tpl-bg); }
.nfp-grid { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  gap: clamp(24px, 4vw, 48px); max-width: 1140px; margin: 0 auto; align-items: start; }
.nfp-main { background: var(--tpl-surface); border: 1px solid var(--tpl-line); border-radius: 8px;
  overflow: hidden; transition: box-shadow 0.25s, border-color 0.25s; }
.nfp-main:hover { border-color: var(--tpl-primary); box-shadow: 0 16px 36px var(--tpl-shadow-weak); }
.nfp-img { height: clamp(220px, 30vw, 320px); border-radius: 0; }
.nfp-main-body { padding: clamp(22px, 3vw, 32px); }
.nfp-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.nfp-date { font-size: 12.5px; color: var(--tpl-ink3); letter-spacing: 0.04em; }
.nfp-cat { font-size: 10.5px; font-weight: 700; letter-spacing: 0.06em; color: var(--tpl-on-primary);
  background: var(--tpl-primary); border-radius: 3px; padding: 4px 10px; }
.nfp-title { font-size: clamp(1.2rem, 2.5vw, 1.6rem); line-height: 1.45; color: var(--tpl-ink);
  margin: 0; font-weight: 600; }
.nfp-text { font-size: 14px; line-height: 2; color: var(--tpl-ink2); margin: 14px 0 0; }
.nfp-more { margin-top: 18px; }
.nfp-side { border-top: 2px solid var(--tpl-ink); }
.nfp-side-h { font-size: 12px; letter-spacing: 0.16em; font-weight: 700; color: var(--tpl-ink3);
  padding: 14px 0 12px; margin: 0; }
.nfp-item { border-top: 1px solid var(--tpl-line); }
.nfp-item-in { padding: 15px 4px; transition: padding 0.2s, background 0.2s; }
.nfp-item:hover .nfp-item-in { background: var(--tpl-primary-soft); padding-left: 12px; }
.nfp-item-meta { display: flex; gap: 10px; align-items: baseline; margin-bottom: 5px; }
.nfp-item-cat { font-size: 10.5px; font-weight: 700; color: var(--tpl-primary); }
.nfp-item-title { font-size: 14px; line-height: 1.65; color: var(--tpl-ink); margin: 0; font-weight: 500; }
.nfp-foot { margin-top: 20px; display: flex; justify-content: flex-end; }
@media (max-width: 880px) { .nfp-grid { grid-template-columns: 1fr; } }
`;

export default function NewsFeaturePlus(p: SectionProps) {
  const d = newsOf(p.config, p.data);
  if (d.items.length === 0) return null;
  const [main, ...rest] = d.items;
  return (
    <section id={p.id} className="ms nfp">
      <Base />
      <Styles id="news-feature-plus" css={CSS} />
      <HeadSplit p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} />
      <div className="nfp-grid">
        <article className="nfp-main">
          <DetailLink section="news" item={main} index={0}>
            <F p={p} at={["items", 0, "image"]} v={main.image || ""} type="image">
              <Media
                src={main.image}
                alt={main.title}
                art={<NoticeArt seed={0} category={main.category} />}
                className="nfp-img"
              />
            </F>
          </DetailLink>
          <div className="nfp-main-body">
            <div className="nfp-meta">
              <span className="nfp-date ms-num">{main.date}</span>
              {main.category && <span className="nfp-cat">{main.category}</span>}
            </div>
            <DetailLink section="news" item={main} index={0}>
              <F p={p} at={["items", 0, "title"]} v={main.title}>
                <h3 className="nfp-title ms-serif">{main.title}</h3>
              </F>
              {main.excerpt && <p className="nfp-text">{main.excerpt}</p>}
              <span className="ms-more nfp-more">
                くわしく見る <ArrowRight size={13} />
              </span>
            </DetailLink>
          </div>
        </article>

        <div className="nfp-side">
          <h3 className="nfp-side-h">これまでのお知らせ</h3>
          {rest.map((n, k) => {
            const i = k + 1;
            return (
              <div key={i} className="nfp-item">
                <DetailLink section="news" item={n} index={i}>
                  <div className="nfp-item-in">
                    <div className="nfp-item-meta">
                      <span className="nfp-date ms-num">{n.date}</span>
                      {n.category && <span className="nfp-item-cat">{n.category}</span>}
                    </div>
                    <F p={p} at={["items", i, "title"]} v={n.title}>
                      <h4 className="nfp-item-title">{n.title}</h4>
                    </F>
                  </div>
                </DetailLink>
              </div>
            );
          })}
          {d.moreCta && (
            <div className="nfp-foot">
              <a className="ms-btn-text" href={d.moreCta.href}>
                {d.moreCta.label} <ArrowRight size={14} />
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
