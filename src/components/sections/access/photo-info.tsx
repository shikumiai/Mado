"use client";

/**
 * access / 写真＋情報 — 外観の写真を大きく敷いて、その上に情報を重ねる。
 * 「この建物を探せばいい」が先に伝わるので、初めて来る人が迷いにくい。
 * 写真が来るまでは設計された建物の絵が入るので、空白の帯にならない。
 */

import { Clock, MapPin, Phone } from "lucide-react";
import type { SectionProps } from "../types";
import { accessOf } from "../data";
import { Base, F, Media, Styles } from "../shared";
import { SceneArt } from "../art";
import { MapFrame } from "./parts";

const CSS = `
.api { padding-left: 0; padding-right: 0; background: var(--tpl-bg); }
.api-stage { position: relative; }
.api-photo { height: clamp(300px, 44vw, 470px); border-radius: 0; }
.api-shade { position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(100deg, var(--tpl-primary-deep-veil) 0%, transparent 62%); }
.api-over { position: relative; max-width: 1140px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 28px);
  margin-top: clamp(-150px, -16vw, -110px); }
.api-card { background: var(--tpl-surface); border-radius: 8px; box-shadow: 0 20px 44px var(--tpl-shadow-mid);
  display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); overflow: hidden; }
.api-body { padding: clamp(26px, 3.4vw, 40px); }
.api-h { font-size: clamp(1.35rem, 3vw, 2rem); line-height: 1.25; color: var(--tpl-ink); margin: 0; }
.api-lead { font-size: 14.5px; line-height: 2; color: var(--tpl-ink2); margin: 14px 0 0; max-width: 46ch; }
.api-facts { display: grid; gap: 14px; margin-top: 24px; padding-top: 22px;
  border-top: 1px solid var(--tpl-line); }
.api-fact { display: grid; grid-template-columns: 20px minmax(0, 1fr); gap: 12px; align-items: start; }
.api-fact svg { color: var(--tpl-primary); margin-top: 3px; }
.api-fact small { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  color: var(--tpl-ink3); margin-bottom: 3px; }
.api-fact span { font-size: 14.5px; line-height: 1.8; color: var(--tpl-ink); }
.api-ways { margin-top: 20px; font-size: 13px; line-height: 1.95; color: var(--tpl-ink2); }
.api-map { border-left: 1px solid var(--tpl-line); }
.api-map .acc-map { border: 0; border-radius: 0; height: 100%; min-height: 280px; }
.api-note { max-width: 1140px; margin: 22px auto 0; padding: 0 clamp(20px, 4vw, 28px); }
@media (max-width: 900px) {
  .api-card { grid-template-columns: 1fr; }
  .api-map { border-left: 0; border-top: 1px solid var(--tpl-line); }
  .api-map .acc-map { height: 260px; }
  .api-over { margin-top: clamp(-70px, -9vw, -50px); }
}
`;

export default function AccessPhotoInfo(p: SectionProps) {
  const d = accessOf(p.config, p.data);
  const c = p.config.company;
  if (d.rows.length === 0) return null;
  return (
    <section id={p.id} className="ms api">
      <Base />
      <Styles id="access-photo-info" css={CSS} />
      <div className="api-stage">
        <F p={p} at={["image"]} v={d.image || ""} type="image">
          <Media
            src={d.image}
            alt={`${c.name}の外観`}
            art={<SceneArt seed={2} category={c.business || "店舗"} />}
            className="api-photo"
          />
        </F>
        <span className="api-shade" />
      </div>

      <div className="api-over">
        <div className="api-card">
          <div className="api-body">
            <p className="ms-eyebrow">{d.eyebrow}</p>
            <F p={p} at={["heading"]} v={d.heading}>
              <h2 className="api-h ms-serif">{d.heading}</h2>
            </F>
            {d.lead && (
              <F p={p} at={["lead"]} v={d.lead}>
                <p className="api-lead">{d.lead}</p>
              </F>
            )}
            <div className="api-facts">
              {c.address && (
                <div className="api-fact">
                  <MapPin size={17} strokeWidth={1.7} />
                  <div>
                    <small>所在地</small>
                    <span>{c.address}</span>
                  </div>
                </div>
              )}
              {c.hours && (
                <div className="api-fact">
                  <Clock size={17} strokeWidth={1.7} />
                  <div>
                    <small>営業時間</small>
                    <span>{c.hours}</span>
                  </div>
                </div>
              )}
              {c.phone && (
                <div className="api-fact">
                  <Phone size={17} strokeWidth={1.7} />
                  <div>
                    <small>電話</small>
                    <span className="ms-num">{c.phone}</span>
                  </div>
                </div>
              )}
            </div>
            {d.ways.length > 0 && (
              <p className="api-ways">{d.ways.join("　／　")}</p>
            )}
          </div>
          <div className="api-map">
            <MapFrame embedUrl={d.mapEmbedUrl} label={c.name} height="100%" />
          </div>
        </div>
      </div>
      {d.note && <p className="ms-note api-note">{d.note}</p>}
    </section>
  );
}
