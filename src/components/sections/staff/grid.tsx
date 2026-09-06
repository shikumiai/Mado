"use client";

/**
 * staff / 顔写真グリッド — 人の顔で選んでもらう。
 * 医院・サロン・スクールのように「誰に見てもらえるか」が決め手の商売向き。
 * 先頭（院長・店長）だけ大きく置いて、序列が一目で分かるようにしている。
 */

import type { SectionProps } from "../types";
import { staffOf } from "../data";
import { Base, DetailLink, F, HeadStack, Media, Styles } from "../shared";
import { PortraitArt } from "../art";

const CSS = `
.tgr-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px;
  max-width: 1140px; margin: 0 auto; }
.tgr-card { background: var(--tpl-surface); border-radius: 10px; overflow: hidden;
  box-shadow: 0 3px 14px var(--tpl-shadow-weak); transition: box-shadow 0.25s; }
.tgr-card:hover { box-shadow: 0 16px 34px var(--tpl-shadow-mid); }
.tgr-lead { grid-column: span 2; grid-row: span 2; display: flex; flex-direction: column; }
.tgr-img { aspect-ratio: 3 / 4; border-radius: 0; }
.tgr-lead .tgr-img { aspect-ratio: auto; flex: 1; min-height: 260px; }
.tgr-body { padding: 18px 20px 22px; }
.tgr-lead .tgr-body { padding: clamp(22px, 2.6vw, 30px); }
.tgr-role { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: var(--tpl-primary); }
.tgr-name { font-size: 18px; line-height: 1.4; color: var(--tpl-ink); margin: 7px 0 0; font-weight: 600; }
.tgr-lead .tgr-name { font-size: clamp(1.3rem, 2.4vw, 1.7rem); }
.tgr-name small { font-size: 12px; color: var(--tpl-ink3); font-weight: 400; margin-left: 8px; }
.tgr-text { font-size: 13px; line-height: 1.9; color: var(--tpl-ink2); margin-top: 10px; }
.tgr-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.tgr-meta { font-size: 12px; color: var(--tpl-ink3); margin-top: 12px; padding-top: 10px;
  border-top: 1px solid var(--tpl-line); }
@media (max-width: 900px) {
  .tgr-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tgr-lead { grid-column: span 2; grid-row: span 1; }
  .tgr-lead .tgr-img { aspect-ratio: 4 / 3; min-height: 0; }
}
@media (max-width: 560px) {
  .tgr-grid { grid-template-columns: 1fr; }
  .tgr-lead { grid-column: span 1; }
}
`;

export default function StaffGrid(p: SectionProps) {
  const d = staffOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms tgr">
      <Base />
      <Styles id="staff-grid" css={CSS} />
      <HeadStack p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} />
      <div className="tgr-grid">
        {d.items.map((s, i) => (
          <article key={s.id ?? i} className={`tgr-card${i === 0 ? " tgr-lead" : ""}`}>
            <F p={p} at={["items", i, "image"]} v={s.image || ""} type="image">
              <Media
                src={s.image}
                alt={s.name}
                art={<PortraitArt seed={i} />}
                className="tgr-img"
              />
            </F>
            <div className="tgr-body">
              <span className="tgr-role">{s.role}</span>
              <DetailLink section="staff" item={s} index={i}>
                <F p={p} at={["items", i, "name"]} v={s.name}>
                  <h3 className="tgr-name ms-serif">
                    {s.name}
                    {s.experience && <small>{s.experience}</small>}
                  </h3>
                </F>
              </DetailLink>
              {s.bio && (
                <F p={p} at={["items", i, "bio"]} v={s.bio}>
                  <p className="tgr-text">{s.bio}</p>
                </F>
              )}
              {s.qualifications && s.qualifications.length > 0 && (
                <div className="tgr-tags">
                  {s.qualifications.map((q, n) => (
                    <span key={n} className="ms-chip ms-chip-line">{q}</span>
                  ))}
                </div>
              )}
              {s.schedule && <p className="tgr-meta">出勤 {s.schedule}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
