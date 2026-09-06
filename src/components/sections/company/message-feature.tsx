"use client";

/**
 * company / 挨拶主役 — 代表の言葉を大きく、会社概要は下に小さく添える。
 * 会社の大きさより「誰がやっているか」で選ばれる商売（工務店・士業・教室）向き。
 * 写真が来るまでは設計された人物の絵が入るので、枠が空かない。
 */

import type { SectionProps } from "../types";
import { companyOf } from "../data";
import { Base, F, Media, Styles } from "../shared";
import { PortraitArt } from "../art";

const CSS = `
.cmf { background: var(--tpl-bg); }
.cmf-wrap { max-width: 1080px; margin: 0 auto; }
.cmf-grid { display: grid; grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.28fr);
  gap: clamp(28px, 5vw, 60px); align-items: start; }
.cmf-media { position: relative; }
.cmf-photo { height: clamp(320px, 42vw, 480px); border-radius: 8px; }
.cmf-caption { position: absolute; left: 0; right: 22px; bottom: -18px; background: var(--tpl-surface);
  border-left: 3px solid var(--tpl-primary); padding: 14px 18px; border-radius: 0 6px 6px 0;
  box-shadow: 0 10px 26px var(--tpl-shadow-weak); }
.cmf-caption small { display: block; font-size: 11px; color: var(--tpl-ink3); font-weight: 700;
  letter-spacing: 0.1em; margin-bottom: 4px; }
.cmf-caption b { font-size: 17px; color: var(--tpl-ink); font-weight: 600; }
.cmf-eyebrow { font-size: 11px; letter-spacing: 0.3em; font-weight: 700; color: var(--tpl-primary);
  margin: 0 0 14px; }
.cmf-h { font-size: clamp(1.4rem, 3.2vw, 2.15rem); line-height: 1.45; color: var(--tpl-ink); margin: 0; }
.cmf-body { font-size: 15px; line-height: 2.2; color: var(--tpl-ink2); margin: clamp(22px, 3vw, 30px) 0 0;
  white-space: pre-line; max-width: 56ch; }
.cmf-rows { margin-top: clamp(30px, 4vw, 42px); padding-top: 24px; border-top: 1px solid var(--tpl-line);
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px clamp(24px, 3vw, 40px); }
.cmf-row small { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  color: var(--tpl-ink3); margin-bottom: 4px; }
.cmf-row span { font-size: 13.5px; line-height: 1.75; color: var(--tpl-ink); }
@media (max-width: 880px) {
  .cmf-grid { grid-template-columns: 1fr; }
  .cmf-caption { position: static; margin-top: 14px; border-radius: 0 6px 6px 0; box-shadow: none; }
  .cmf-rows { grid-template-columns: 1fr; }
}
`;

export default function CompanyMessageFeature(p: SectionProps) {
  const d = companyOf(p.config, p.data);
  const c = d.company;
  if (!d.message) return null;
  // 表は補足なので、上から主要な6項目までにとどめる
  const brief = d.rows.filter((r) => r.label !== "事業内容").slice(0, 6);
  return (
    <section id={p.id} className="ms cmf">
      <Base />
      <Styles id="company-message-feature" css={CSS} />
      <div className="cmf-wrap">
        <div className="cmf-grid">
          <div className="cmf-media">
            <F p={p} at={["image"]} v={d.image || ""} type="image">
              <Media src={d.image} alt={c.ceo} art={<PortraitArt seed={1} />} className="cmf-photo" />
            </F>
            <div className="cmf-caption">
              <small>{c.ceoTitle || "代表"}</small>
              <b className="ms-serif">{c.ceo}</b>
            </div>
          </div>

          <div>
            <p className="cmf-eyebrow">{d.messageHeading}</p>
            <F p={p} at={["messageTitle"]} v={d.messageTitle || d.heading}>
              <h2 className="cmf-h ms-serif">{d.messageTitle || d.heading}</h2>
            </F>
            <F p={p} at={["message"]} v={d.message}>
              <p className="cmf-body">{d.message}</p>
            </F>
            {brief.length > 0 && (
              <div className="cmf-rows">
                {brief.map((r) => (
                  <div key={r.label} className="cmf-row">
                    <small>{r.label}</small>
                    <span>{r.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
