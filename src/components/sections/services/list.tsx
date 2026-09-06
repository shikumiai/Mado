"use client";

/**
 * services / 一覧行 — 数が多いときに効く。
 * 1行1件。名前・内容・料金が同じ位置で縦に揃うので、上から順に比べられる。
 */

import { ArrowRight } from "lucide-react";
import type { SectionProps } from "../types";
import { servicesOf } from "../data";
import { Base, F, HeadRule, Icon, Styles, pad2 } from "../shared";

const CSS = `
.vls { background: var(--tpl-surface); }
.vls-wrap { max-width: 1080px; margin: 0 auto; }
.vls-row { display: grid; grid-template-columns: 52px 30px minmax(0, 0.72fr) minmax(0, 1.28fr) auto;
  gap: 18px; align-items: center; padding: 20px 14px 20px 0; border-top: 1px solid var(--tpl-line);
  position: relative; transition: background 0.2s; }
.vls-row:last-child { border-bottom: 1px solid var(--tpl-line); }
.vls-row::before { content: ""; position: absolute; left: 0; top: -1px; bottom: -1px; width: 0;
  background: var(--tpl-primary); transition: width 0.2s; }
.vls-row:hover { background: var(--tpl-bg); }
.vls-row:hover::before { width: 3px; }
.vls-no { font-size: 13px; color: var(--tpl-ink3); font-weight: 700; letter-spacing: 0.08em;
  padding-left: 14px; }
.vls-icon { color: var(--tpl-primary); display: flex; }
.vls-title { font-size: 16px; line-height: 1.5; color: var(--tpl-ink); margin: 0; font-weight: 600; }
.vls-sub { font-size: 12px; color: var(--tpl-ink3); margin-top: 4px; }
.vls-text { font-size: 13.5px; line-height: 1.9; color: var(--tpl-ink2); }
.vls-price { font-size: 15px; color: var(--tpl-ink); font-weight: 600; white-space: nowrap; }
.vls-price small { display: block; font-size: 11px; color: var(--tpl-ink3); font-weight: 400; }
.vls-go { color: var(--tpl-primary); display: flex; }
@media (max-width: 860px) {
  .vls-row { grid-template-columns: 44px minmax(0, 1fr) auto; gap: 6px 14px; align-items: start; }
  .vls-icon { display: none; }
  .vls-text { grid-column: 2 / 4; }
  .vls-go { display: none; }
}
`;

export default function ServicesList(p: SectionProps) {
  const d = servicesOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms vls">
      <Base />
      <Styles id="services-list" css={CSS} />
      <div className="vls-wrap">
        <HeadRule
          p={p}
          eyebrow={d.eyebrow}
          heading={d.heading}
          right={<span className="ms-note ms-num">全 {d.items.length} 分野</span>}
        />
        <div>
          {d.items.map((s, i) => (
            <div key={i} className="vls-row">
              <span className="vls-no ms-num">{pad2(i)}</span>
              <span className="vls-icon"><Icon name={s.icon} size={20} /></span>
              <div>
                <F p={p} at={["items", i, "title"]} v={s.title}>
                  <h3 className="vls-title ms-serif">{s.title}</h3>
                </F>
                {s.duration && <p className="vls-sub">{s.duration}</p>}
              </div>
              <F p={p} at={["items", i, "description"]} v={s.description}>
                <p className="vls-text">{s.description}</p>
              </F>
              {s.price ? (
                <p className="vls-price ms-num">
                  {s.price}
                  <small>目安</small>
                </p>
              ) : (
                <span className="vls-go"><ArrowRight size={18} /></span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
