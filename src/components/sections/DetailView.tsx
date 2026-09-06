"use client";

/**
 * 一覧の1件を1ページで見せるところ（works / staff / menu / news の共通の詳細）。
 *
 * 部品と同じ土台（ms-* の CSS）と同じ色（--tpl-*）で描くので、
 * トップから詳細へ移っても同じサイトの中にいる感じが切れない。
 * 写真が無い項目は、機能に合った設計された絵が入るので空白にならない。
 */

import { ArrowLeft, ArrowRight, Phone } from "lucide-react";
import type { SiteConfig } from "@/lib/site-config-schema";
import { TplRoot, useConfigPalette } from "@/components/template-renderers/TplPalette";
import { Base, Media, Styles } from "./shared";
import { DishArt, NoticeArt, PortraitArt, SceneArt } from "./art";
import type { DetailItem } from "./detail-data";

const CSS = `
.dtl { background: var(--tpl-bg); min-height: 100vh;
  font-family: var(--font-sans), "Noto Sans JP", system-ui, sans-serif; color: var(--tpl-ink2); }
.dtl a { color: inherit; text-decoration: none; }
.dtl :focus-visible { outline: 2px solid var(--tpl-primary); outline-offset: 3px; }

.dtl-bar { position: sticky; top: 0; z-index: 10; background: var(--tpl-surface-veil);
  backdrop-filter: blur(8px); border-bottom: 1px solid var(--tpl-line); }
.dtl-bar-in { max-width: 1000px; margin: 0 auto; padding: 14px clamp(18px, 4vw, 28px);
  display: flex; align-items: center; gap: 16px; }
.dtl-home { font-size: 15px; color: var(--tpl-ink); font-weight: 600; letter-spacing: 0.02em; }
.dtl-home:hover { color: var(--tpl-primary); }
.dtl-back { margin-left: auto; display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px;
  font-weight: 700; color: var(--tpl-primary); transition: gap 0.2s; }
.dtl-back:hover { gap: 11px; }

.dtl-main { max-width: 1000px; margin: 0 auto; padding: clamp(34px, 5vw, 60px) clamp(18px, 4vw, 28px)
  clamp(60px, 8vw, 96px); }
.dtl-eyebrow { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  color: var(--tpl-primary); background: var(--tpl-primary-soft); border-radius: 3px;
  padding: 5px 11px; margin-bottom: 16px; }
.dtl-h1 { font-size: clamp(1.6rem, 4.4vw, 2.7rem); line-height: 1.25; color: var(--tpl-ink);
  margin: 0; font-weight: 600; letter-spacing: -0.015em; font-feature-settings: "palt" 1; }
.dtl-sub { font-size: 15px; line-height: 1.8; color: var(--tpl-ink3); margin: 12px 0 0;
  letter-spacing: 0.04em; }
.dtl-hero { margin: clamp(26px, 4vw, 40px) 0; }
.dtl-img { height: clamp(240px, 42vw, 460px); border-radius: 8px; }

.dtl-cols { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.8fr);
  gap: clamp(28px, 5vw, 56px); align-items: start; }
.dtl-body p { font-size: 15px; line-height: 2.15; color: var(--tpl-ink2); margin: 0 0 1.4em;
  max-width: 60ch; }
.dtl-block { margin-top: clamp(30px, 4vw, 44px); }
.dtl-block h2 { font-size: 15px; letter-spacing: 0.08em; color: var(--tpl-primary); margin: 0 0 12px;
  font-weight: 600; }
.dtl-block p { font-size: 14.5px; line-height: 2.1; color: var(--tpl-ink2); margin: 0; max-width: 58ch;
  white-space: pre-line; }
.dtl-side { position: sticky; top: 76px; display: grid; gap: 18px; }
.dtl-card { background: var(--tpl-surface); border: 1px solid var(--tpl-line); border-radius: 8px;
  overflow: hidden; }
.dtl-card h2 { font-size: 12px; letter-spacing: 0.14em; color: var(--tpl-ink3); font-weight: 700;
  margin: 0; padding: 15px 18px; border-bottom: 1px solid var(--tpl-line); background: var(--tpl-bg-deep); }
.dtl-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.dtl-table th, .dtl-table td { text-align: left; padding: 12px 18px; line-height: 1.8;
  border-bottom: 1px solid var(--tpl-line); vertical-align: top; }
.dtl-table th { width: 6.5em; color: var(--tpl-ink3); font-weight: 600; white-space: nowrap; }
.dtl-table td { color: var(--tpl-ink); }
.dtl-table tr:last-child th, .dtl-table tr:last-child td { border-bottom: 0; }
.dtl-tags { display: flex; flex-wrap: wrap; gap: 8px; padding: 16px 18px; }
.dtl-tag { font-size: 11.5px; font-weight: 600; color: var(--tpl-ink2); border: 1px solid var(--tpl-line-strong);
  border-radius: 3px; padding: 5px 10px; }
.dtl-cta { background: var(--tpl-primary-deep); border-radius: 8px; padding: 22px 20px; }
.dtl-cta h2 { font-size: 14px; color: var(--tpl-on-dark); margin: 0 0 8px; font-weight: 600;
  border: 0; padding: 0; background: none; letter-spacing: 0.02em; }
.dtl-cta p { font-size: 12.5px; line-height: 1.85; color: var(--tpl-on-dark-3); margin: 0 0 16px; }
.dtl-cta-btn { display: flex; align-items: center; justify-content: center; gap: 9px;
  background: var(--tpl-primary); color: var(--tpl-on-primary); border-radius: 5px; padding: 13px 18px;
  font-size: 13.5px; font-weight: 700; transition: background 0.2s, gap 0.2s; }
.dtl-cta-btn:hover { background: var(--tpl-primary-strong); gap: 13px; }
.dtl-cta-tel { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px;
  font-size: 15px; color: var(--tpl-on-dark); font-weight: 600; }
.dtl-cta-tel:hover { color: var(--tpl-primary-tint); }

.dtl-nav { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px;
  margin-top: clamp(44px, 6vw, 68px); padding-top: 26px; border-top: 1px solid var(--tpl-line); }
.dtl-nav-item { background: var(--tpl-surface); border: 1px solid var(--tpl-line); border-radius: 8px;
  padding: 16px 18px; transition: border-color 0.2s; }
.dtl-nav-item:hover { border-color: var(--tpl-primary); }
.dtl-nav-item small { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700;
  letter-spacing: 0.1em; color: var(--tpl-primary); margin-bottom: 7px; }
.dtl-nav-item b { font-size: 14px; line-height: 1.6; color: var(--tpl-ink); font-weight: 600; }
.dtl-nav-next { text-align: right; }
.dtl-nav-next small { justify-content: flex-end; }

.dtl-foot { border-top: 1px solid var(--tpl-line); background: var(--tpl-surface); }
.dtl-foot-in { max-width: 1000px; margin: 0 auto; padding: 26px clamp(18px, 4vw, 28px);
  display: flex; flex-wrap: wrap; gap: 8px 22px; font-size: 12.5px; color: var(--tpl-ink3); }
.dtl-foot-in b { color: var(--tpl-ink); font-weight: 600; }

@media (max-width: 880px) {
  .dtl-cols { grid-template-columns: 1fr; }
  .dtl-side { position: static; }
}
@media (max-width: 560px) {
  .dtl-nav { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .dtl *, .dtl *::before, .dtl *::after { transition: none !important; animation: none !important; }
}
`;

/** 写真が無いときの絵。機能ごとに描き分ける */
function artFor(item: DetailItem) {
  switch (item.section) {
    case "works": return <SceneArt seed={item.index} category={item.eyebrow} />;
    case "staff": return <PortraitArt seed={item.index} />;
    case "menu": return <DishArt seed={item.index} category={item.eyebrow} name={item.title} />;
    case "news": return <NoticeArt seed={item.index} category={item.eyebrow} />;
  }
}

export default function DetailView({
  config, slug, item,
}: {
  config: SiteConfig;
  slug: string;
  item: DetailItem;
}) {
  const palette = useConfigPalette(config);
  const c = config.company;
  const listHref = `/${slug}#${item.section}`;
  const tel = c.phone ? `tel:${c.phone.replace(/[^\d+]/g, "")}` : undefined;
  const paragraphs = item.body.split(/\n{2,}/).filter((t) => t.trim() !== "");

  return (
    <TplRoot palette={palette} className="dtl">
      <Base />
      <Styles id="detail-view" css={CSS} />

      <header className="dtl-bar">
        <div className="dtl-bar-in">
          <a className="dtl-home ms-serif" href={`/${slug}`}>{c.name}</a>
          <a className="dtl-back" href={listHref}>
            <ArrowLeft size={14} strokeWidth={2.2} />
            {item.backLabel}
          </a>
        </div>
      </header>

      <main className="dtl-main">
        {item.eyebrow && <span className="dtl-eyebrow">{item.eyebrow}</span>}
        <h1 className="dtl-h1 ms-serif">{item.title}</h1>
        {item.subtitle && <p className="dtl-sub ms-num">{item.subtitle}</p>}

        <div className="dtl-hero">
          <Media src={item.image} alt={item.title} art={artFor(item)} className="dtl-img" />
        </div>

        <div className="dtl-cols">
          <div>
            <div className="dtl-body">
              {paragraphs.length > 0 ? (
                paragraphs.map((t, i) => <p key={i}>{t}</p>)
              ) : (
                <p>{`${item.title}についてのご案内です。くわしくはお問い合わせください。`}</p>
              )}
            </div>
            {item.blocks.map((b) => (
              <section key={b.heading} className="dtl-block">
                <h2 className="ms-serif">{b.heading}</h2>
                <p>{b.text}</p>
              </section>
            ))}
          </div>

          <aside className="dtl-side">
            {(item.rows.length > 0 || item.tags.length > 0) && (
              <div className="dtl-card">
                <h2>くわしい内容</h2>
                {item.rows.length > 0 && (
                  <table className="dtl-table">
                    <tbody>
                      {item.rows.map((r) => (
                        <tr key={r.label}>
                          <th scope="row">{r.label}</th>
                          <td className="ms-num">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {item.tags.length > 0 && (
                  <div className="dtl-tags">
                    {item.tags.map((t) => (
                      <span key={t} className="dtl-tag">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="dtl-cta">
              <h2 className="ms-serif">この件について聞いてみる</h2>
              <p>ご覧のページのことでも、それ以外のことでも構いません。</p>
              <a className="dtl-cta-btn" href={`/${slug}#contact`}>
                お問い合わせへ <ArrowRight size={14} strokeWidth={2.2} />
              </a>
              {tel && (
                <a className="dtl-cta-tel ms-serif ms-num" href={tel}>
                  <Phone size={15} strokeWidth={1.8} />
                  {c.phone}
                </a>
              )}
            </div>
          </aside>
        </div>

        {(item.prev || item.next) && (
          <nav className="dtl-nav" aria-label="前後の項目">
            {item.prev ? (
              <a className="dtl-nav-item" href={`/${slug}/${item.section}/${item.prev.key}`}>
                <small><ArrowLeft size={12} strokeWidth={2.4} />前へ</small>
                <b className="ms-serif">{item.prev.title}</b>
              </a>
            ) : (
              <span />
            )}
            {item.next && (
              <a className="dtl-nav-item dtl-nav-next" href={`/${slug}/${item.section}/${item.next.key}`}>
                <small>次へ<ArrowRight size={12} strokeWidth={2.4} /></small>
                <b className="ms-serif">{item.next.title}</b>
              </a>
            )}
          </nav>
        )}
      </main>

      <footer className="dtl-foot">
        <div className="dtl-foot-in">
          <b>{c.name}</b>
          {c.address && <span>{c.address}</span>}
          {c.phone && <span className="ms-num">{c.phone}</span>}
          {c.hours && <span>{c.hours}</span>}
        </div>
      </footer>
    </TplRoot>
  );
}
