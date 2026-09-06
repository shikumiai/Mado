"use client";

/**
 * staff / 誌面 — 大きい1人と、小さい何人か。
 * 名札を写真に重ねる雑誌の組み方。写真の縦横比を変えてあるので、
 * 同じ大きさの箱が並ぶのとは別物の見え方になる。
 */

import type { SectionProps } from "../types";
import { staffOf } from "../data";
import { Base, F, Media, Styles, pad2 } from "../shared";
import { PortraitArt } from "../art";

const CSS = `
.ted { background: var(--tpl-bg-deep); }
.ted-wrap { max-width: 1140px; margin: 0 auto; }
.ted-top { display: flex; align-items: baseline; gap: 18px; flex-wrap: wrap; margin-bottom: clamp(28px, 4vw, 46px); }
.ted-h { font-size: clamp(1.5rem, 3.4vw, 2.2rem); color: var(--tpl-ink); margin: 0; line-height: 1.25; }
.ted-lead-note { margin-left: auto; font-size: 13px; color: var(--tpl-ink3); max-width: 40ch; line-height: 1.9; }
.ted-grid { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  gap: clamp(20px, 3.4vw, 44px); align-items: start; }
.ted-hero { position: relative; }
.ted-hero-img { aspect-ratio: 5 / 4; border-radius: 6px; }
.ted-plate { position: relative; margin: -46px 0 0 clamp(0px, 3vw, 32px); background: var(--tpl-surface);
  padding: 22px 26px; border-radius: 4px; box-shadow: 0 16px 36px var(--tpl-shadow-mid);
  border-left: 3px solid var(--tpl-primary); max-width: 82%; }
.ted-no { font-size: 11px; letter-spacing: 0.14em; color: var(--tpl-primary); font-weight: 700; }
.ted-name { font-size: clamp(1.25rem, 2.4vw, 1.6rem); line-height: 1.35; color: var(--tpl-ink);
  margin: 6px 0 4px; font-weight: 600; }
.ted-role { font-size: 12.5px; color: var(--tpl-ink3); }
.ted-text { font-size: 14px; line-height: 2.05; color: var(--tpl-ink2); margin-top: 14px; }
.ted-rest { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.ted-rest-img { aspect-ratio: 1 / 1; border-radius: 6px; }
.ted-rest-name { font-size: 15px; color: var(--tpl-ink); margin: 12px 0 0; font-weight: 600; }
.ted-rest-role { font-size: 11.5px; color: var(--tpl-ink3); margin-top: 3px; }
.ted-rest-text { font-size: 12.5px; line-height: 1.85; color: var(--tpl-ink2); margin-top: 7px; }
@media (max-width: 880px) {
  .ted-grid { grid-template-columns: 1fr; }
  .ted-plate { max-width: 92%; }
}
`;

export default function StaffEditorial(p: SectionProps) {
  const d = staffOf(p.config, p.data);
  if (d.items.length === 0) return null;
  const [lead, ...rest] = d.items;
  return (
    <section id={p.id} className="ms ted">
      <Base />
      <Styles id="staff-editorial" css={CSS} />
      <div className="ted-wrap">
        <div className="ted-top">
          <div>
            <p className="ms-eyebrow">{d.eyebrow}</p>
            <F p={p} at={["heading"]} v={d.heading}>
              <h2 className="ted-h ms-serif">{d.heading}</h2>
            </F>
          </div>
          {d.lead && <p className="ted-lead-note">{d.lead}</p>}
        </div>
        <div className="ted-grid">
          <div className="ted-hero">
            <F p={p} at={["items", 0, "image"]} v={lead.image || ""} type="image">
              <Media src={lead.image} alt={lead.name} art={<PortraitArt seed={0} />} className="ted-hero-img" />
            </F>
            <div className="ted-plate">
              <span className="ted-no ms-num">{pad2(0)}</span>
              <F p={p} at={["items", 0, "name"]} v={lead.name}>
                <h3 className="ted-name ms-serif">{lead.name}</h3>
              </F>
              <p className="ted-role">{[lead.role, lead.experience].filter(Boolean).join("　/　")}</p>
              {(lead.philosophy || lead.bio) && (
                <F p={p} at={["items", 0, "bio"]} v={lead.philosophy || lead.bio || ""}>
                  <p className="ted-text">{lead.philosophy || lead.bio}</p>
                </F>
              )}
            </div>
          </div>
          <div className="ted-rest">
            {rest.map((s, i) => (
              <div key={s.id ?? i}>
                <F p={p} at={["items", i + 1, "image"]} v={s.image || ""} type="image">
                  <Media src={s.image} alt={s.name} art={<PortraitArt seed={i + 1} />} className="ted-rest-img" />
                </F>
                <F p={p} at={["items", i + 1, "name"]} v={s.name}>
                  <h3 className="ted-rest-name ms-serif">{s.name}</h3>
                </F>
                <p className="ted-rest-role">{s.role}</p>
                {s.bio && <p className="ted-rest-text">{s.bio}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
