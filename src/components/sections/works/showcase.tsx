"use client";

/**
 * works / 横送りショーケース — 1件を大きいまま、横に送って見せる。
 * 写真の力で選ばれる商売（住宅・料理・美容）向き。縦に長くならず、
 * 画面の外にまだ続いていることが見えるので、最後まで送ってもらいやすい。
 */

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SectionProps } from "../types";
import { worksOf } from "../data";
import { Base, F, Media, Styles, pad2 } from "../shared";
import { SceneArt } from "../art";

const CSS = `
.wsc { padding-right: 0; overflow: hidden; }
.wsc-head { display: flex; align-items: flex-end; gap: 20px; flex-wrap: wrap;
  max-width: 1140px; margin: 0 auto clamp(26px, 4vw, 40px); padding-right: clamp(20px, 4vw, 28px); }
.wsc-h { font-size: clamp(1.5rem, 3.4vw, 2.2rem); color: var(--tpl-ink); margin: 0; line-height: 1.25; }
.wsc-nav { margin-left: auto; display: flex; gap: 10px; }
.wsc-nav button { width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--tpl-line-strong);
  background: var(--tpl-surface); color: var(--tpl-ink); display: flex; align-items: center;
  justify-content: center; cursor: pointer; transition: border-color 0.2s, color 0.2s, background 0.2s; }
.wsc-nav button:hover { border-color: var(--tpl-primary); color: var(--tpl-primary); }
.wsc-rail { display: flex; gap: 22px; overflow-x: auto; scroll-snap-type: x mandatory;
  padding: 4px clamp(20px, 4vw, 28px) 22px 0; scrollbar-width: thin; }
.wsc-card { scroll-snap-align: start; flex: 0 0 min(72%, 720px); position: relative;
  border-radius: 10px; overflow: hidden; background: var(--tpl-surface);
  box-shadow: 0 6px 24px var(--tpl-shadow-weak); }
.wsc-img { height: clamp(230px, 32vw, 400px); border-radius: 0; }
.wsc-body { position: absolute; left: 0; right: 0; bottom: 0; padding: 26px 24px 20px;
  background: linear-gradient(to top, var(--tpl-primary-deep-veil), transparent); }
.wsc-cat { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: var(--tpl-on-dark-2); }
.wsc-title { font-size: clamp(1.15rem, 2.2vw, 1.5rem); line-height: 1.4; color: var(--tpl-on-dark);
  margin: 6px 0 0; font-weight: 600; }
.wsc-meta { font-size: 12px; color: var(--tpl-on-dark-3); margin-top: 8px; }
.wsc-no { position: absolute; top: 16px; right: 18px; font-size: 12px; letter-spacing: 0.1em;
  color: var(--tpl-on-dark-2); background: var(--tpl-primary-deep-veil); padding: 5px 10px; border-radius: 3px; }
@media (max-width: 720px) { .wsc-card { flex-basis: 86%; } }
`;

export default function WorksShowcase(p: SectionProps) {
  const d = worksOf(p.config, p.data);
  const rail = useRef<HTMLDivElement>(null);
  const move = (dir: number) => {
    const el = rail.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.74, behavior: "smooth" });
  };
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms wsc">
      <Base />
      <Styles id="works-showcase" css={CSS} />
      <div className="wsc-head">
        <div>
          <p className="ms-eyebrow">{d.eyebrow}</p>
          <F p={p} at={["heading"]} v={d.heading}>
            <h2 className="wsc-h ms-serif">{d.heading}</h2>
          </F>
        </div>
        <div className="wsc-nav">
          <button type="button" onClick={() => move(-1)} aria-label="前の実績へ">
            <ChevronLeft size={20} />
          </button>
          <button type="button" onClick={() => move(1)} aria-label="次の実績へ">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="wsc-rail" ref={rail} tabIndex={0} role="group" aria-label={`${d.heading}（横にスクロールできます）`}>
        {d.items.map((w, i) => (
          <article key={w.id ?? i} className="wsc-card">
            <F p={p} at={["items", i, "image"]} v={w.image || ""} type="image">
              <Media
                src={w.image}
                alt={w.title}
                art={<SceneArt seed={i + 2} category={w.category} />}
                className="wsc-img"
              />
            </F>
            <span className="wsc-no ms-num">{pad2(i)} / {pad2(d.items.length - 1)}</span>
            <div className="wsc-body">
              <span className="wsc-cat">{w.category}</span>
              <F p={p} at={["items", i, "title"]} v={w.title}>
                <h3 className="wsc-title ms-serif">{w.title}</h3>
              </F>
              <p className="wsc-meta ms-num">{[w.specs, w.year].filter(Boolean).join("　/　")}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
