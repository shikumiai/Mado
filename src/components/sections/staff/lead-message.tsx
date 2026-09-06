"use client";

/**
 * staff / 代表1人＋メッセージ — 挨拶で人柄を伝える。
 * warm-craft と trust-navy の今の「会社案内・代表挨拶」を引き取った型。
 * 顔と長い文章を並べて、最後に署名。残りのスタッフは下に小さく添える。
 */

import type { SectionProps } from "../types";
import { staffOf } from "../data";
import { Base, F, Media, Styles } from "../shared";
import { PortraitArt } from "../art";

const CSS = `
.tlm { background: var(--tpl-surface); }
.tlm-wrap { max-width: 1100px; margin: 0 auto; }
.tlm-main { display: grid; grid-template-columns: minmax(0, 0.78fr) minmax(0, 1.22fr);
  gap: clamp(26px, 5vw, 66px); align-items: start; }
.tlm-photo { aspect-ratio: 4 / 5; border-radius: 8px; box-shadow: 0 18px 44px var(--tpl-shadow-mid); }
.tlm-plate { margin-top: 18px; padding-left: 16px; border-left: 3px solid var(--tpl-primary); }
.tlm-plate-name { font-size: 19px; color: var(--tpl-ink); margin: 0; font-weight: 600; }
.tlm-plate-role { font-size: 12.5px; color: var(--tpl-ink3); margin-top: 4px; }
.tlm-h { font-size: clamp(1.4rem, 3vw, 2rem); line-height: 1.45; color: var(--tpl-ink); margin: 10px 0 0; }
.tlm-msg { margin-top: 24px; }
.tlm-msg p { font-size: 15px; line-height: 2.2; color: var(--tpl-ink2); }
.tlm-msg p + p { margin-top: 18px; }
.tlm-facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px;
  margin-top: 30px; padding-top: 22px; border-top: 1px solid var(--tpl-line); }
.tlm-fact { font-size: 12px; color: var(--tpl-ink3); }
.tlm-fact b { display: block; font-size: 14.5px; color: var(--tpl-ink); font-weight: 600; margin-top: 4px; }
.tlm-rest { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 22px; margin-top: clamp(40px, 6vw, 70px); padding-top: clamp(26px, 4vw, 40px);
  border-top: 1px solid var(--tpl-line); }
.tlm-rest-img { aspect-ratio: 1 / 1; border-radius: 50%; width: 92px; }
.tlm-rest-name { font-size: 14.5px; color: var(--tpl-ink); margin: 12px 0 0; font-weight: 600; }
.tlm-rest-role { font-size: 12px; color: var(--tpl-ink3); margin-top: 3px; }
@media (max-width: 880px) {
  .tlm-main { grid-template-columns: 1fr; }
  .tlm-photo { max-width: 320px; }
}
`;

export default function StaffLeadMessage(p: SectionProps) {
  const d = staffOf(p.config, p.data);
  const c = p.config.company;
  const lead = d.items[0];
  const name = lead?.name || c.ceo;
  const role = lead?.role || c.ceoTitle || "代表";
  const message = lead?.philosophy || lead?.bio || c.bio || "";
  const paragraphs = message.split(/\n{2,}|\n/).filter((t) => t.trim() !== "");
  const facts: [string, string | undefined][] = [
    ["創業", c.since ? `${c.since}年` : undefined],
    ["所在地", c.address],
    ["資格", lead?.qualifications?.join("・") || c.ceoTitle],
    ["経歴", lead?.experience || c.license],
  ];
  if (!name) return null;
  return (
    <section id={p.id} className="ms tlm">
      <Base />
      <Styles id="staff-lead-message" css={CSS} />
      <div className="tlm-wrap">
        <div className="tlm-main">
          <div>
            <F p={p} at={["items", 0, "image"]} v={lead?.image || c.ceoPhoto || ""} type="image">
              <Media
                src={lead?.image || c.ceoPhoto}
                alt={name}
                art={<PortraitArt seed={0} />}
                className="tlm-photo"
              />
            </F>
            <div className="tlm-plate">
              <F p={p} at={["items", 0, "name"]} v={name}>
                <p className="tlm-plate-name ms-serif">{name}</p>
              </F>
              <p className="tlm-plate-role">{role}</p>
            </div>
          </div>
          <div>
            <p className="ms-eyebrow">{d.eyebrow}</p>
            <F p={p} at={["heading"]} v={d.heading}>
              <h2 className="tlm-h ms-serif">{d.heading}</h2>
            </F>
            <div className="tlm-msg">
              {paragraphs.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>
            <div className="tlm-facts">
              {facts.filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="tlm-fact">
                  {k}
                  <b>{v}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
        {d.items.length > 1 && (
          <div className="tlm-rest">
            {d.items.slice(1).map((s, i) => (
              <div key={s.id ?? i}>
                <Media
                  src={s.image}
                  alt={s.name}
                  art={<PortraitArt seed={i + 1} />}
                  className="tlm-rest-img"
                />
                <p className="tlm-rest-name ms-serif">{s.name}</p>
                <p className="tlm-rest-role">{s.role}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
