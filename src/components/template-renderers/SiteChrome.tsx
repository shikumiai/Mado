"use client";

/**
 * サイトの枕と足（ヘッダーとフッター）。
 *
 * セクションはお客さんが並べ替えられるが、上の帯と下の会社情報はどのサイトにも要る。
 * ここを共通の部品にしておくと、10業種どれでも「電話がすぐ押せる」「住所と営業時間が
 * 必ず載っている」状態になる。日本の会社サイトで最初に見られるのはこの2か所なので、
 * テンプレートごとに作り分けない。
 *
 * ヘッダー … 会社名 / セクションへの案内 / 電話。狭い画面では右上のボタンから開く一枚に畳む。
 * フッター … 会社名と一言 / 連絡先 / 営業時間・住所 / SNS / 著作権表示。
 *
 * 色はすべて var(--tpl-*)。生の色コードは書かない。
 */

import { useEffect, useState } from "react";
import { Clock, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import type { SiteConfig } from "@/lib/site-config-schema";
import { Styles } from "@/components/sections/shared";

/** ヘッダーの案内に出す1つ */
export interface ChromeNavItem {
  /** 飛び先のアンカー（#works の works） */
  id: string;
  label: string;
  /** 行動につながる項目（お問い合わせ・ご予約）。横に並びきらなくても残す */
  action?: boolean;
}

/** 横に並べられる数は限りがあるので、頭から詰めつつ、行動の1つは最後に必ず残す */
function headerMenu(nav: ChromeNavItem[], max = 6): ChromeNavItem[] {
  if (nav.length <= max) return nav;
  const action = nav.find((n) => n.action);
  if (!action) return nav.slice(0, max);
  const head = nav.filter((n) => n !== action).slice(0, max - 1);
  return [...head, action];
}

const CSS = `
.sc-head { position: sticky; top: 0; z-index: 60; background: var(--tpl-bg-veil);
  backdrop-filter: blur(10px); border-bottom: 1px solid var(--tpl-line);
  font-family: var(--font-sans), "Noto Sans JP", system-ui, sans-serif; }
.sc-head-static { position: relative; }
.sc-head-in { max-width: 1180px; margin: 0 auto; padding: 13px clamp(16px, 4vw, 28px);
  display: flex; align-items: center; gap: 18px; }
.sc-brand { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.sc-brand-name { font-family: var(--font-serif), "Zen Old Mincho", "Yu Mincho", serif;
  font-size: clamp(16px, 2.4vw, 19px); font-weight: 600; letter-spacing: 0.01em;
  color: var(--tpl-ink); line-height: 1.3; font-feature-settings: "palt" 1; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis; }
.sc-brand-sub { font-size: 10.5px; letter-spacing: 0.22em; color: var(--tpl-ink3);
  text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sc-nav { display: flex; align-items: center; gap: 20px; margin-left: auto; }
.sc-nav a { font-size: 13px; color: var(--tpl-ink2); text-decoration: none; white-space: nowrap;
  position: relative; padding: 4px 0; transition: color 0.2s; }
.sc-nav a::after { content: ""; position: absolute; left: 0; right: 100%; bottom: 0; height: 1.5px;
  background: var(--tpl-primary); transition: right 0.24s ease; }
.sc-nav a:hover { color: var(--tpl-primary); }
.sc-nav a:hover::after { right: 0; }
.sc-tel { display: inline-flex; align-items: center; gap: 7px; padding: 9px 17px; border-radius: 5px;
  background: var(--tpl-primary); color: var(--tpl-on-primary); font-size: 13.5px; font-weight: 700;
  text-decoration: none; white-space: nowrap; font-variant-numeric: tabular-nums;
  transition: background 0.2s; }
.sc-tel:hover { background: var(--tpl-primary-strong); }
.sc-burger { display: none; margin-left: auto; align-items: center; justify-content: center;
  width: 42px; height: 42px; border-radius: 5px; border: 1px solid var(--tpl-line-strong);
  background: var(--tpl-surface); color: var(--tpl-ink); cursor: pointer; }
.sc-head :focus-visible, .sc-foot :focus-visible, .sc-sheet :focus-visible {
  outline: 2px solid var(--tpl-primary); outline-offset: 3px; border-radius: 3px; }

/* 狭い画面で開く一枚 */
.sc-scrim { position: fixed; inset: 0; z-index: 70; background: var(--tpl-primary-deep-veil);
  border: 0; padding: 0; cursor: pointer; }
.sc-sheet { position: fixed; top: 0; right: 0; bottom: 0; z-index: 71; width: min(86vw, 340px);
  background: var(--tpl-surface); box-shadow: -18px 0 44px var(--tpl-shadow-strong);
  display: flex; flex-direction: column; overflow-y: auto;
  font-family: var(--font-sans), "Noto Sans JP", system-ui, sans-serif; }
.sc-sheet-head { display: flex; align-items: center; gap: 12px; padding: 16px 18px;
  border-bottom: 1px solid var(--tpl-line); }
.sc-sheet-head span { font-family: var(--font-serif), "Zen Old Mincho", "Yu Mincho", serif;
  font-size: 16px; font-weight: 600; color: var(--tpl-ink); }
.sc-sheet-close { margin-left: auto; width: 38px; height: 38px; border-radius: 5px;
  border: 1px solid var(--tpl-line-strong); background: transparent; color: var(--tpl-ink);
  display: flex; align-items: center; justify-content: center; cursor: pointer; }
.sc-sheet-nav { display: flex; flex-direction: column; padding: 6px 0; }
.sc-sheet-nav a { padding: 15px 18px; font-size: 15px; color: var(--tpl-ink); text-decoration: none;
  border-bottom: 1px solid var(--tpl-line); }
.sc-sheet-nav a:hover { background: var(--tpl-bg-deep); color: var(--tpl-primary); }
.sc-sheet-foot { margin-top: auto; padding: 18px; display: grid; gap: 10px; }
.sc-sheet-foot .sc-tel { justify-content: center; padding: 14px; font-size: 15px; }
.sc-sheet-note { font-size: 12px; line-height: 1.8; color: var(--tpl-ink3); }

/* フッター */
.sc-foot { background: var(--tpl-ink-deep); color: var(--tpl-on-dark);
  font-family: var(--font-sans), "Noto Sans JP", system-ui, sans-serif; }
.sc-foot a { color: inherit; text-decoration: none; }
.sc-foot-in { max-width: 1180px; margin: 0 auto; padding: clamp(44px, 6vw, 68px) clamp(18px, 4vw, 28px) 0; }
.sc-foot-grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(28px, 4vw, 56px); align-items: start; }
.sc-foot-name { font-family: var(--font-serif), "Zen Old Mincho", "Yu Mincho", serif;
  font-size: 21px; font-weight: 600; margin: 0; letter-spacing: 0.01em; font-feature-settings: "palt" 1; }
.sc-foot-tag { font-size: 13.5px; line-height: 2; color: var(--tpl-on-dark-2); margin: 12px 0 0;
  max-width: 34ch; }
.sc-foot-h { font-size: 11px; letter-spacing: 0.2em; font-weight: 700; color: var(--tpl-primary-tint);
  margin: 0 0 14px; }
.sc-foot-list { display: grid; gap: 11px; font-size: 13px; line-height: 1.8; color: var(--tpl-on-dark-2); }
.sc-foot-row { display: flex; gap: 9px; align-items: flex-start; }
.sc-foot-row svg { flex: none; margin-top: 3px; color: var(--tpl-primary-tint); }
.sc-foot-row b { color: var(--tpl-on-dark); font-weight: 600; font-variant-numeric: tabular-nums; }
.sc-foot-row a:hover { color: var(--tpl-primary-tint); }
.sc-foot-sns { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.sc-foot-sns a { display: inline-flex; align-items: center; font-size: 12px; font-weight: 600;
  padding: 8px 13px; border: 1px solid var(--tpl-on-dark-line); border-radius: 4px;
  color: var(--tpl-on-dark-2); transition: border-color 0.2s, color 0.2s; }
.sc-foot-sns a:hover { border-color: var(--tpl-primary-tint); color: var(--tpl-on-dark); }
.sc-foot-bar { max-width: 1180px; margin: clamp(34px, 5vw, 52px) auto 0;
  padding: 18px clamp(18px, 4vw, 28px) 22px; border-top: 1px solid var(--tpl-on-dark-line);
  display: flex; flex-wrap: wrap; gap: 6px 18px; align-items: center;
  font-size: 11.5px; color: var(--tpl-on-dark-4); }
.sc-foot-bar .sc-foot-license { margin-left: auto; text-align: right; }

@media (max-width: 1000px) {
  .sc-nav { display: none; }
  .sc-burger { display: inline-flex; }
  .sc-head-in .sc-tel { display: none; }
}
@media (max-width: 760px) {
  .sc-foot-grid { grid-template-columns: 1fr; gap: 30px; }
  .sc-foot-bar .sc-foot-license { margin-left: 0; text-align: left; }
}
@media (prefers-reduced-motion: reduce) {
  .sc-head *, .sc-foot *, .sc-sheet * { transition: none !important; animation: none !important; }
}
`;

/** 電話番号を tel: に使える形へ（ハイフンや空白を落とす） */
function telHref(phone: string): string {
  return `tel:${(phone || "").replace(/[^0-9+]/g, "")}`;
}

export interface SiteChromeProps {
  config: SiteConfig;
  /** ヘッダーの案内に出す項目（描いたセクションから作る） */
  nav: ChromeNavItem[];
  /** 編集中はヘッダーを固定しない（編集パネルと重ならないように） */
  editMode?: boolean;
  children: React.ReactNode;
}

export default function SiteChrome({ config, nav, editMode = false, children }: SiteChromeProps) {
  const c = config.company;
  const [open, setOpen] = useState(false);

  // 開いている間は後ろが動かないようにする
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const menu = headerMenu(nav);
  const year = new Date().getFullYear();
  const social = c.social ?? [];

  return (
    <>
      <Styles id="chrome" css={CSS} />

      <header className={`sc-head${editMode ? " sc-head-static" : ""}`}>
        <div className="sc-head-in">
          <a className="sc-brand" href="#home">
            <span className="sc-brand-name">{c.name}</span>
            {c.nameEn && <span className="sc-brand-sub">{c.nameEn}</span>}
          </a>

          {menu.length > 0 && (
            <nav className="sc-nav" aria-label="サイト内の案内">
              {menu.map((n) => (
                <a key={n.id} href={`#${n.id}`}>
                  {n.label}
                </a>
              ))}
            </nav>
          )}

          {c.phone && (
            <a className="sc-tel" href={telHref(c.phone)}>
              <Phone size={14} /> {c.phone}
            </a>
          )}

          <button
            type="button"
            className="sc-burger"
            aria-label="メニューを開く"
            aria-expanded={open}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {open && (
        <>
          <button
            type="button"
            className="sc-scrim"
            aria-label="メニューを閉じる"
            onClick={() => setOpen(false)}
          />
          <div className="sc-sheet" role="dialog" aria-label="サイト内の案内">
            <div className="sc-sheet-head">
              <span>{c.name}</span>
              <button
                type="button"
                className="sc-sheet-close"
                aria-label="閉じる"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <nav className="sc-sheet-nav">
              {nav.map((n) => (
                <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)}>
                  {n.label}
                </a>
              ))}
            </nav>
            <div className="sc-sheet-foot">
              {c.phone && (
                <a className="sc-tel" href={telHref(c.phone)}>
                  <Phone size={16} /> {c.phone}
                </a>
              )}
              {c.hours && <p className="sc-sheet-note">{c.hours}</p>}
              {c.address && <p className="sc-sheet-note">{c.address}</p>}
            </div>
          </div>
        </>
      )}

      {children}

      <footer className="sc-foot">
        <div className="sc-foot-in">
          <div className="sc-foot-grid">
            <div>
              <p className="sc-foot-name">{c.name}</p>
              {(c.tagline || c.description) && (
                <p className="sc-foot-tag">{c.tagline || c.description}</p>
              )}
              {social.length > 0 && (
                <div className="sc-foot-sns">
                  {social.map((s) => (
                    <a key={s.href} href={s.href} target="_blank" rel="noreferrer noopener">
                      {s.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="sc-foot-h">CONTACT</p>
              <div className="sc-foot-list">
                {c.phone && (
                  <p className="sc-foot-row">
                    <Phone size={14} />
                    <span>
                      <a href={telHref(c.phone)}>
                        <b>{c.phone}</b>
                      </a>
                      {c.fax && <br />}
                      {c.fax && `FAX ${c.fax}`}
                    </span>
                  </p>
                )}
                {c.email && (
                  <p className="sc-foot-row">
                    <Mail size={14} />
                    <a href={`mailto:${c.email}`}>{c.email}</a>
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="sc-foot-h">ACCESS</p>
              <div className="sc-foot-list">
                {c.address && (
                  <p className="sc-foot-row">
                    <MapPin size={14} />
                    <span>{c.address}</span>
                  </p>
                )}
                {c.hours && (
                  <p className="sc-foot-row">
                    <Clock size={14} />
                    <span>{c.hours}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="sc-foot-bar">
          <span>
            © {year} {c.name}
          </span>
          {c.license && <span className="sc-foot-license">{c.license}</span>}
        </div>
      </footer>
    </>
  );
}
