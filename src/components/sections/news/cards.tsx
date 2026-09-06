"use client";

/**
 * news / カード — 写真つきで数件。先頭の1件だけ横長の主役にする。
 * 同じ大きさの箱を3つ並べる形は取らない。更新している会社だと一目で伝わる。
 */

import { ArrowRight } from "lucide-react";
import type { SectionProps } from "../types";
import { newsOf } from "../data";
import { Base, DetailLink, F, HeadSplit, Media, Styles } from "../shared";
import { NoticeArt } from "../art";

const CSS = `
.ncd { background: var(--tpl-bg); }
.ncd-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 20px;
  max-width: 1140px; margin: 0 auto; }
.ncd-card { grid-column: span 2; background: var(--tpl-surface); border-radius: 8px; overflow: hidden;
  border: 1px solid var(--tpl-line); transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s; }
.ncd-card:hover { transform: translateY(-3px); border-color: var(--tpl-primary);
  box-shadow: 0 14px 30px var(--tpl-shadow-weak); }
.ncd-lead { grid-column: span 6; display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); }
.ncd-img { height: 168px; border-radius: 0; }
.ncd-lead .ncd-img { height: 100%; min-height: 262px; }
.ncd-body { padding: 18px 20px 22px; }
.ncd-lead .ncd-body { padding: clamp(24px, 3vw, 38px); display: flex; flex-direction: column;
  justify-content: center; }
.ncd-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.ncd-date { font-size: 12px; color: var(--tpl-ink3); letter-spacing: 0.04em; }
.ncd-cat { font-size: 10.5px; font-weight: 700; letter-spacing: 0.06em; color: var(--tpl-primary);
  background: var(--tpl-primary-soft); border-radius: 3px; padding: 4px 9px; }
.ncd-title { font-size: 15.5px; line-height: 1.6; color: var(--tpl-ink); margin: 0; font-weight: 600; }
.ncd-lead .ncd-title { font-size: clamp(1.15rem, 2.4vw, 1.6rem); line-height: 1.45; }
.ncd-text { font-size: 13.5px; line-height: 1.95; color: var(--tpl-ink2); margin: 10px 0 0; }
.ncd-more { margin-top: 16px; }
.ncd-foot { max-width: 1140px; margin: clamp(28px, 4vw, 40px) auto 0; display: flex;
  justify-content: flex-end; }
@media (max-width: 980px) {
  .ncd-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .ncd-lead { grid-column: span 4; }
}
@media (max-width: 700px) {
  .ncd-grid { grid-template-columns: 1fr; }
  .ncd-card, .ncd-lead { grid-column: span 1; grid-template-columns: 1fr; }
  .ncd-lead .ncd-img { min-height: 190px; height: 190px; }
}
`;

export default function NewsCards(p: SectionProps) {
  const d = newsOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms ncd">
      <Base />
      <Styles id="news-cards" css={CSS} />
      <HeadSplit p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} />
      <div className="ncd-grid">
        {d.items.map((n, i) => (
          <article key={i} className={`ncd-card${i === 0 ? " ncd-lead" : ""}`}>
            <DetailLink section="news" item={n} index={i}>
              <F p={p} at={["items", i, "image"]} v={n.image || ""} type="image">
                <Media
                  src={n.image}
                  alt={n.title}
                  art={<NoticeArt seed={i} category={n.category} />}
                  className="ncd-img"
                />
              </F>
            </DetailLink>
            <div className="ncd-body">
              <div className="ncd-meta">
                <span className="ncd-date ms-num">{n.date}</span>
                {n.category && <span className="ncd-cat">{n.category}</span>}
              </div>
              <DetailLink section="news" item={n} index={i}>
                <F p={p} at={["items", i, "title"]} v={n.title}>
                  <h3 className="ncd-title ms-serif">{n.title}</h3>
                </F>
                {i === 0 && n.excerpt && <p className="ncd-text">{n.excerpt}</p>}
                <span className="ms-more ncd-more">
                  つづきを読む <ArrowRight size={13} />
                </span>
              </DetailLink>
            </div>
          </article>
        ))}
      </div>
      {d.moreCta && (
        <div className="ncd-foot">
          <a className="ms-btn ms-btn-line" href={d.moreCta.href}>
            {d.moreCta.label} <ArrowRight size={15} />
          </a>
        </div>
      )}
    </section>
  );
}
