"use client";

/**
 * access の中で使い回す小さな部品。
 *
 * ・MapFrame  … 地図の埋め込みURLがあれば地図、無ければ設計された地図の絵。空白にしない
 * ・HoursGrid … 曜日ごとの営業・診療時間の表（●／の表に対応）
 */

import type { HoursTable } from "../types";
import { Styles } from "../shared";
import { MapArt } from "../art";

export const ACCESS_PARTS_CSS = `
.acc-map { position: relative; overflow: hidden; border-radius: 6px; background: var(--tpl-bg-deep);
  border: 1px solid var(--tpl-line); }
.acc-map > iframe { display: block; width: 100%; height: 100%; border: 0; }
.acc-map > svg { display: block; width: 100%; height: 100%; }
.acc-map-cap { position: absolute; left: 12px; bottom: 12px; background: var(--tpl-surface-veil);
  backdrop-filter: blur(4px); color: var(--tpl-ink); font-size: 11.5px; font-weight: 600;
  padding: 6px 12px; border-radius: 4px; }

.acc-hours { width: 100%; border-collapse: collapse; font-size: 13px; }
.acc-hours th, .acc-hours td { border: 1px solid var(--tpl-line); padding: 10px 6px;
  text-align: center; color: var(--tpl-ink2); }
.acc-hours thead th { background: var(--tpl-bg-deep); color: var(--tpl-ink); font-weight: 700;
  font-size: 12px; }
.acc-hours tbody th { text-align: left; padding-left: 12px; white-space: nowrap;
  color: var(--tpl-ink); font-weight: 600; background: var(--tpl-surface); }
.acc-hours-mark { color: var(--tpl-primary); font-size: 15px; font-weight: 700; }
.acc-hours-off { color: var(--tpl-ink3); }
.acc-hours-wrap { overflow-x: auto; }
.acc-hours-note { margin-top: 10px; }
`;

/** 地図。埋め込みURLが無いときは、それだけで読める地図の絵を出す */
export function MapFrame({
  embedUrl, label, height, caption,
}: {
  embedUrl?: string;
  label?: string;
  height: string;
  caption?: string;
}) {
  return (
    <div className="acc-map" style={{ height }}>
      <Styles id="access-parts" css={ACCESS_PARTS_CSS} />
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title={label ? `${label}の地図` : "地図"}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <MapArt label={label} />
      )}
      {caption && <span className="acc-map-cap">{caption}</span>}
    </div>
  );
}

/** ●／を使った曜日の表。診療時間・営業時間のどちらにも使う */
export function HoursGrid({ table }: { table: HoursTable }) {
  return (
    <div className="acc-hours-wrap">
      <Styles id="access-parts" css={ACCESS_PARTS_CSS} />
      <table className="acc-hours">
        <thead>
          <tr>
            <th scope="col" />
            {table.head.map((h) => (
              <th key={h} scope="col">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              {table.head.map((h, c) => {
                const v = r.cells[c] ?? "";
                const off = v === "" || v === "/" || v === "／" || v === "-" || v === "―";
                return (
                  <td key={h} className={off ? "acc-hours-off" : "acc-hours-mark"}>
                    {off ? "／" : v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {table.note && <p className="ms-note acc-hours-note">{table.note}</p>}
    </div>
  );
}
