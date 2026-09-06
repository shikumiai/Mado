"use client";

/**
 * booking / 日程カード — 開催日ごとに1枚。残り枠も出す。
 * 見学会・体験・説明会のように「日にちが決まっている」商売向き。
 * 日付が主役なので、日にちを大きく、詳細は下に小さく置いている。
 */

import { ArrowRight, Clock, MapPin } from "lucide-react";
import type { SectionProps } from "../types";
import { bookingOf } from "../data";
import { Base, F, HeadSplit, Styles } from "../shared";

const CSS = `
.bsc { background: var(--tpl-bg); }
.bsc-list { display: grid; gap: 14px; max-width: 1000px; margin: 0 auto; }
.bsc-card { display: grid; grid-template-columns: 168px minmax(0, 1fr) auto; gap: 0;
  background: var(--tpl-surface); border: 1px solid var(--tpl-line); border-radius: 8px;
  overflow: hidden; transition: border-color 0.25s, box-shadow 0.25s; }
.bsc-card:hover { border-color: var(--tpl-primary); box-shadow: 0 12px 28px var(--tpl-shadow-weak); }
.bsc-when { background: var(--tpl-bg-deep); border-right: 1px solid var(--tpl-line);
  padding: 22px 20px; text-align: center; display: flex; flex-direction: column;
  align-items: center; justify-content: center; }
.bsc-date { font-size: clamp(1.3rem, 2.6vw, 1.7rem); line-height: 1.2; color: var(--tpl-primary);
  font-weight: 600; }
.bsc-time { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--tpl-ink2);
  margin-top: 8px; }
.bsc-body { padding: 22px 24px; }
.bsc-title { font-size: 16.5px; line-height: 1.5; color: var(--tpl-ink); margin: 0 0 8px; font-weight: 600; }
.bsc-where { display: flex; align-items: center; gap: 7px; font-size: 13px; color: var(--tpl-ink2); }
.bsc-where svg { color: var(--tpl-primary); flex: none; }
.bsc-side { display: flex; flex-direction: column; align-items: flex-end; justify-content: center;
  gap: 10px; padding: 22px 24px; border-left: 1px solid var(--tpl-line); }
.bsc-spots { font-size: 12px; font-weight: 700; letter-spacing: 0.04em; padding: 5px 11px;
  border-radius: 3px; white-space: nowrap; }
.bsc-open { background: var(--tpl-primary-soft); color: var(--tpl-primary); }
.bsc-few { background: var(--tpl-sub1-soft); color: var(--tpl-sub1); }
.bsc-full { background: var(--tpl-muted-fill); color: var(--tpl-ink3); }
.bsc-apply { display: inline-flex; align-items: center; gap: 7px; padding: 11px 20px; border-radius: 5px;
  background: var(--tpl-primary); color: var(--tpl-on-primary); font-size: 13.5px; font-weight: 700;
  white-space: nowrap; transition: background 0.2s, gap 0.2s; }
.bsc-apply:hover { background: var(--tpl-primary-strong); gap: 11px; }
.bsc-foot { max-width: 1000px; margin: clamp(24px, 3vw, 34px) auto 0; padding-top: 16px;
  border-top: 1px solid var(--tpl-line); display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }
.bsc-foot .ms-note { margin-right: auto; max-width: 52ch; }
@media (max-width: 800px) {
  .bsc-card { grid-template-columns: 1fr; }
  .bsc-when { border-right: 0; border-bottom: 1px solid var(--tpl-line); flex-direction: row;
    gap: 14px; padding: 16px 20px; }
  .bsc-time { margin-top: 0; }
  .bsc-side { border-left: 0; border-top: 1px solid var(--tpl-line); flex-direction: row;
    align-items: center; justify-content: space-between; }
}
`;

export default function BookingSlotsCards(p: SectionProps) {
  const d = bookingOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms bsc">
      <Base />
      <Styles id="booking-slots-cards" css={CSS} />
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <HeadSplit p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} />
      </div>
      <div className="bsc-list">
        {d.items.map((b, i) => {
          const full = b.spots <= 0;
          const few = !full && b.spots <= 2;
          return (
            <article key={b.id ?? i} className="bsc-card">
              <div className="bsc-when">
                <span className="bsc-date ms-serif ms-num">{b.date}</span>
                <span className="bsc-time ms-num">
                  <Clock size={13} strokeWidth={1.9} />
                  {b.time}
                </span>
              </div>
              <div className="bsc-body">
                <F p={p} at={["items", i, "title"]} v={b.title}>
                  <h3 className="bsc-title ms-serif">{b.title}</h3>
                </F>
                <p className="bsc-where">
                  <MapPin size={14} strokeWidth={1.8} />
                  {b.location}
                </p>
              </div>
              <div className="bsc-side">
                <span className={`bsc-spots ${full ? "bsc-full" : few ? "bsc-few" : "bsc-open"}`}>
                  {full ? "満席" : `残り ${b.spots} 組`}
                </span>
                {!full && (
                  <a className="bsc-apply" href={d.primary.href}>
                    申し込む <ArrowRight size={14} strokeWidth={2.2} />
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <div className="bsc-foot">
        {d.note && <p className="ms-note">{d.note}</p>}
        {d.secondary && (
          <a className="ms-btn ms-btn-line ms-num" href={d.secondary.href}>
            {d.secondary.label}
          </a>
        )}
      </div>
    </section>
  );
}
