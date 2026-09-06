"use client";

/**
 * staff / 一覧行 — 人数が多いときに。
 * 顔・名前・担当・出勤が同じ位置で縦に揃うので、探している人が見つけやすい。
 * 医院やジムのように「誰がいつ居るか」が大事な商売向き。
 */

import type { SectionProps } from "../types";
import { staffOf } from "../data";
import { Base, DetailLink, F, HeadRule, Media, Styles } from "../shared";
import { PortraitArt } from "../art";

const CSS = `
.tls-wrap { max-width: 1060px; margin: 0 auto; }
.tls-row { display: grid; grid-template-columns: 76px minmax(0, 0.85fr) minmax(0, 1.15fr) auto;
  gap: 22px; align-items: center; padding: 18px 12px 18px 0; border-top: 1px solid var(--tpl-line);
  transition: background 0.2s; }
.tls-row:last-child { border-bottom: 1px solid var(--tpl-line); }
.tls-row:hover { background: var(--tpl-surface); }
.tls-img { width: 76px; height: 76px; border-radius: 50%; }
.tls-role { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: var(--tpl-primary); }
.tls-name { font-size: 17px; line-height: 1.4; color: var(--tpl-ink); margin: 5px 0 0; font-weight: 600; }
.tls-exp { font-size: 12px; color: var(--tpl-ink3); margin-top: 4px; }
.tls-text { font-size: 13.5px; line-height: 1.9; color: var(--tpl-ink2); }
.tls-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.tls-sched { text-align: right; font-size: 12px; color: var(--tpl-ink3); white-space: nowrap; }
.tls-sched b { display: block; font-size: 14px; color: var(--tpl-ink2); font-weight: 600; margin-top: 3px; }
@media (max-width: 820px) {
  .tls-row { grid-template-columns: 64px minmax(0, 1fr); gap: 8px 16px; align-items: start; }
  .tls-img { width: 64px; height: 64px; }
  .tls-text, .tls-sched { grid-column: 2; text-align: left; }
}
`;

export default function StaffList(p: SectionProps) {
  const d = staffOf(p.config, p.data);
  if (d.items.length === 0) return null;
  return (
    <section id={p.id} className="ms tls">
      <Base />
      <Styles id="staff-list" css={CSS} />
      <div className="tls-wrap">
        <HeadRule
          p={p}
          eyebrow={d.eyebrow}
          heading={d.heading}
          right={<span className="ms-note ms-num">{d.items.length} 名</span>}
        />
        <div>
          {d.items.map((s, i) => (
            <div key={s.id ?? i} className="tls-row">
              <Media src={s.image} alt={s.name} art={<PortraitArt seed={i} />} className="tls-img" />
              <div>
                <span className="tls-role">{s.role}</span>
                <DetailLink section="staff" item={s} index={i}>
                  <F p={p} at={["items", i, "name"]} v={s.name}>
                    <h3 className="tls-name ms-serif">{s.name}</h3>
                  </F>
                </DetailLink>
                {s.experience && <p className="tls-exp">{s.experience}</p>}
              </div>
              <div>
                {s.bio && (
                  <F p={p} at={["items", i, "bio"]} v={s.bio}>
                    <p className="tls-text">{s.bio}</p>
                  </F>
                )}
                {s.specialty && (
                  <div className="tls-tags">
                    <span className="ms-chip">{s.specialty}</span>
                  </div>
                )}
              </div>
              {s.schedule && (
                <p className="tls-sched">
                  出勤
                  <b>{s.schedule}</b>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
