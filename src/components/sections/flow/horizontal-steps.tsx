"use client";

/**
 * flow / 横ステップ — 左から右へ、順番に読ませる。
 * 番号の丸を1本の線でつないであるので、「これで終わり」までの長さが一目で分かる。
 * 数が多いときは折り返して2段になる。
 */

import type { SectionProps } from "../types";
import { flowOf } from "../data";
import { Base, F, HeadStack, Styles, pad2 } from "../shared";

const CSS = `
.fhs { background: var(--tpl-bg); }
.fhs-row { display: grid; gap: 0; max-width: 1140px; margin: 0 auto;
  grid-template-columns: repeat(var(--fhs-n, 4), minmax(0, 1fr)); }
.fhs-step { position: relative; padding: 0 14px; }
.fhs-rail { position: relative; height: 54px; display: flex; align-items: center; }
.fhs-rail::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 2px;
  background: var(--tpl-line-strong); }
.fhs-step:first-child .fhs-rail::before { left: 50%; }
.fhs-step:last-child .fhs-rail::before { right: 50%; }
.fhs-dot { position: relative; margin: 0 auto; width: 52px; height: 52px; border-radius: 50%;
  background: var(--tpl-surface); border: 2px solid var(--tpl-primary); color: var(--tpl-primary);
  display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 600;
  transition: background 0.25s, color 0.25s; }
.fhs-step:hover .fhs-dot { background: var(--tpl-primary); color: var(--tpl-on-primary); }
.fhs-body { padding: 20px 4px 0; text-align: center; }
.fhs-when { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
  color: var(--tpl-primary); background: var(--tpl-primary-soft); border-radius: 3px;
  padding: 4px 10px; margin-bottom: 10px; }
.fhs-title { font-size: 16px; line-height: 1.5; color: var(--tpl-ink); margin: 0 0 8px; font-weight: 600; }
.fhs-text { font-size: 13.5px; line-height: 1.9; color: var(--tpl-ink2); }
.fhs-note { max-width: 1140px; margin: clamp(28px, 4vw, 40px) auto 0; padding-top: 16px;
  border-top: 1px solid var(--tpl-line); }
@media (max-width: 1000px) {
  .fhs-row { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 32px; }
  .fhs-step:nth-child(2n) .fhs-rail::before { right: 50%; }
  .fhs-step:nth-child(2n+1) .fhs-rail::before { left: 50%; }
}
@media (max-width: 560px) {
  .fhs-row { grid-template-columns: 1fr; row-gap: 0; }
  .fhs-step { position: relative; display: grid; grid-template-columns: 52px minmax(0, 1fr);
    gap: 0 16px; padding: 0; }
  /* 縦になったら、丸の真下へ線を通す */
  .fhs-step::before { content: ""; position: absolute; left: 25px; top: 26px; bottom: 0; width: 2px;
    background: var(--tpl-line-strong); }
  .fhs-step:last-child::before { display: none; }
  .fhs-rail { height: 52px; }
  .fhs-rail::before { display: none; }
  .fhs-body { padding: 12px 0 26px; text-align: left; }
}
`;

/** 何列で組むと余りが出ないか（1段に収める・6件なら3列2段） */
function columnsFor(n: number): number {
  if (n <= 5) return n;
  if (n === 6) return 3;
  if (n % 4 === 0) return 4;
  if (n % 3 === 0) return 3;
  return 4;
}

export default function FlowHorizontalSteps(p: SectionProps) {
  const d = flowOf(p.config, p.data);
  if (d.items.length === 0) return null;
  const cols = columnsFor(d.items.length);
  return (
    <section id={p.id} className="ms fhs">
      <Base />
      <Styles id="flow-horizontal-steps" css={CSS} />
      <HeadStack p={p} eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} center />
      <div className="fhs-row" style={{ "--fhs-n": cols } as React.CSSProperties}>
        {d.items.map((s, i) => (
          <div key={i} className="fhs-step">
            <div className="fhs-rail">
              <span className="fhs-dot ms-serif ms-num">{pad2(i)}</span>
            </div>
            <div className="fhs-body">
              {s.duration && <span className="fhs-when">{s.duration}</span>}
              <F p={p} at={["items", i, "title"]} v={s.title}>
                <h3 className="fhs-title ms-serif">{s.title}</h3>
              </F>
              <F p={p} at={["items", i, "description"]} v={s.description}>
                <p className="fhs-text">{s.description}</p>
              </F>
            </div>
          </div>
        ))}
      </div>
      {d.note && <p className="ms-note fhs-note">{d.note}</p>}
    </section>
  );
}
