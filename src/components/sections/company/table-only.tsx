"use client";

/**
 * company / 表のみ — 会社概要の表を1枚だけ。
 * 代表あいさつを別のセクション（staff）に置いている構成のときに使う。
 * 会社名・代表者・設立・資本金・従業員数・所在地・事業内容と、
 * 日本の会社サイトで聞かれる項目を落とさない。
 */

import type { SectionProps } from "../types";
import { companyOf } from "../data";
import { Base, F, HeadRule, Styles } from "../shared";

const CSS = `
.cto { background: var(--tpl-surface); }
.cto-wrap { max-width: 880px; margin: 0 auto; }
.cto-table { border-top: 2px solid var(--tpl-ink); }
.cto-row { display: grid; grid-template-columns: 168px minmax(0, 1fr); gap: 24px;
  padding: 18px 6px; border-bottom: 1px solid var(--tpl-line); align-items: baseline;
  transition: background 0.2s; }
.cto-row:hover { background: var(--tpl-bg-deep); }
.cto-label { font-size: 13px; font-weight: 600; color: var(--tpl-primary); letter-spacing: 0.06em; }
.cto-value { font-size: 14.5px; line-height: 1.95; color: var(--tpl-ink); }
.cto-foot { margin-top: 24px; display: flex; flex-wrap: wrap; gap: 10px; }
@media (max-width: 620px) {
  .cto-row { grid-template-columns: 1fr; gap: 6px; }
}
`;

export default function CompanyTableOnly(p: SectionProps) {
  const d = companyOf(p.config, p.data);
  const c = d.company;
  if (d.rows.length === 0) return null;
  return (
    <section id={p.id} className="ms cto">
      <Base />
      <Styles id="company-table-only" css={CSS} />
      <div className="cto-wrap">
        <HeadRule p={p} eyebrow={d.eyebrow} heading={d.heading} />
        <div className="cto-table">
          {d.rows.map((r, i) => (
            <div key={r.label} className="cto-row">
              <span className="cto-label">{r.label}</span>
              <F p={p} at={["rows", i, "value"]} v={r.value}>
                <span className="cto-value">{r.value}</span>
              </F>
            </div>
          ))}
        </div>
        <div className="cto-foot">
          {c.license && <span className="ms-chip ms-chip-line">{c.license}</span>}
          {c.iso && <span className="ms-chip ms-chip-line">{c.iso}</span>}
        </div>
      </div>
    </section>
  );
}
