"use client";

/**
 * 部品カタログの中身。
 *
 * 上のバーで機能を選ぶと、その機能の5つの見せ方だけを描く。
 * 70個を一度に描くと重いので、見るのは1機能ずつにしてある。
 * 色を変えると、出ている部品が一斉に塗り替わる。
 * 「色はお客のもの」「機能ごとに5つの見せ方」の2つを、その場で目で確かめるための画面。
 */

import { useMemo, useState } from "react";
import {
  buildPalette,
  normalizeHex,
  paletteToCssVars,
  resolveBrand,
  TEMPLATE_BRAND_PRESETS,
  type BrandColors,
} from "@/lib/palette";
import { TplRoot } from "@/components/template-renderers/TplPalette";
import { SECTION_CATALOG } from "@/components/sections";
import { DEMO_CONFIG, SAMPLE_BY_TYPE, SAMPLE_INDUSTRY } from "./samples";

const PRESETS = [
  { id: "warm-craft", name: "木のぬくもり", forWho: "工務店・リフォーム" },
  { id: "trust-navy", name: "信頼のネイビー", forWho: "建設・設備" },
  { id: "clean-arch", name: "落ち着いた墨", forWho: "設計・写真・工芸" },
];

/** パレットの主な色を帯で見せる（色を変えたことが一目で分かる） */
const SWATCHES: [string, string][] = [
  ["代表", "--tpl-primary"],
  ["濃地", "--tpl-primary-deep"],
  ["淡", "--tpl-primary-soft"],
  ["サブ1", "--tpl-sub1"],
  ["サブ2", "--tpl-sub2"],
  ["地", "--tpl-bg"],
  ["面", "--tpl-surface"],
  ["段", "--tpl-bg-deep"],
  ["見出し", "--tpl-ink"],
  ["本文", "--tpl-ink2"],
  ["罫", "--tpl-line-strong"],
  ["あかり", "--tpl-glow-1"],
];

export default function SectionsGallery() {
  const [presetId, setPresetId] = useState("warm-craft");
  const [typeId, setTypeId] = useState(SECTION_CATALOG[0].type);
  const [custom, setCustom] = useState<BrandColors>({ primary: "", sub1: "", sub2: "" });

  const brand: BrandColors = useMemo(() => {
    const base = TEMPLATE_BRAND_PRESETS[presetId] || TEMPLATE_BRAND_PRESETS["warm-craft"];
    return {
      primary: normalizeHex(custom.primary) || base.primary,
      sub1: normalizeHex(custom.sub1) || base.sub1,
      sub2: normalizeHex(custom.sub2) || base.sub2,
    };
  }, [presetId, custom]);

  const palette = useMemo(() => buildPalette(resolveBrand(brand, presetId)), [brand, presetId]);
  const vars = paletteToCssVars(palette) as React.CSSProperties;

  const setField = (key: keyof BrandColors) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCustom((c) => ({ ...c, [key]: e.target.value }));

  const total = SECTION_CATALOG.reduce((n, t) => n + t.variants.length, 0);
  const active = SECTION_CATALOG.find((t) => t.type === typeId) ?? SECTION_CATALOG[0];

  return (
    <div className="min-h-screen bg-bg">
      {/* ─── 操作バー ─── */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto max-w-[1240px] px-5 py-4">
          <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
            <div>
              <h1 className="font-serif text-xl font-semibold text-ink">部品カタログ</h1>
              <p className="mt-1 text-xs text-ink3">
                機能 {SECTION_CATALOG.length} 種 × 見せ方5つ = {total} 部品。
                下のボタンで機能を選ぶと、その5つだけを描きます。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {PRESETS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setPresetId(t.id);
                    setCustom({ primary: "", sub1: "", sub2: "" });
                  }}
                  aria-pressed={presetId === t.id && !normalizeHex(custom.primary)}
                  className={`rounded-sm border px-3 py-2 text-xs font-semibold transition ${
                    presetId === t.id && !normalizeHex(custom.primary)
                      ? "border-accent bg-accent text-on-accent"
                      : "border-line bg-surface text-ink2 hover:border-accent hover:text-ink"
                  }`}
                  title={t.forWho}
                >
                  {t.name}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-ink3">
              {(["primary", "sub1", "sub2"] as const).map((k) => {
                const label = k === "primary" ? "代表" : k === "sub1" ? "サブ1" : "サブ2";
                const value = custom[k] ?? "";
                const shown = normalizeHex(value) || (k === "primary" ? brand.primary : k === "sub1" ? brand.sub1 : brand.sub2) || "";
                return (
                  <label key={k} className="flex items-center gap-2">
                    <span>{label}</span>
                    <input
                      type="color"
                      value={shown}
                      onChange={(e) => setCustom((c) => ({ ...c, [k]: e.target.value }))}
                      className="h-8 w-9 cursor-pointer rounded-sm border border-line bg-surface p-0.5"
                      aria-label={`${label}の色を選ぶ`}
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={setField(k)}
                      placeholder={shown}
                      spellCheck={false}
                      className="tnum w-24 rounded-sm border border-line bg-surface px-2 py-1.5 text-xs text-ink outline-none focus:border-accent"
                      aria-label={`${label}の色コード`}
                    />
                  </label>
                );
              })}
              <button
                type="button"
                onClick={() => setCustom({ primary: "", sub1: "", sub2: "" })}
                className="rounded-sm border border-line px-3 py-1.5 text-xs text-ink2 hover:border-accent hover:text-ink"
              >
                もどす
              </button>
            </div>
          </div>

          {/* 出来上がった色一式 */}
          <div className="mt-3 flex flex-wrap gap-1.5" style={vars}>
            {SWATCHES.map(([name, v]) => (
              <div key={v} className="flex items-center gap-1.5 text-[10px] text-ink3">
                <span
                  className="inline-block h-5 w-5 rounded-sm border border-line"
                  style={{ background: `var(${v})` }}
                />
                {name}
              </div>
            ))}
          </div>

          {/* 見る機能を選ぶ */}
          <div
            role="radiogroup"
            aria-label="見る機能"
            className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3"
          >
            {SECTION_CATALOG.map((t) => {
              const on = t.type === active.type;
              return (
                <button
                  key={t.type}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setTypeId(t.type)}
                  className={`rounded-sm border px-2.5 py-1.5 text-xs font-semibold transition ${
                    on
                      ? "border-accent bg-accent text-on-accent"
                      : "border-line bg-surface text-ink2 hover:border-accent hover:text-ink"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ─── 部品（選んだ機能の5つだけ） ─── */}
      <main className="mx-auto max-w-[1240px] px-5 pb-24">
        <section key={active.type} className="pt-10">
          <div className="border-b-2 border-ink pb-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="font-serif text-2xl font-semibold text-ink">{active.label}</h2>
              <span className="tnum text-sm text-ink3">{active.type}</span>
              <span className="ml-auto text-xs text-ink3">見本：{SAMPLE_INDUSTRY[active.type]}</span>
            </div>
            <p className="mt-1.5 text-sm text-ink2">{active.role}</p>
          </div>

          {active.variants.map((v) => (
            <article key={v.id} className="mt-8">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pb-2">
                <span className="tnum rounded-sm bg-surface2 px-2 py-1 text-xs font-semibold text-ink">
                  {active.type}/{v.id}
                </span>
                <h3 className="font-serif text-base font-semibold text-ink">{v.label}</h3>
                <span className="text-xs text-ink3">{v.note}</span>
                {v.id === active.defaultVariant && (
                  <span className="rounded-sm border border-accent px-2 py-0.5 text-[10px] font-semibold text-accent">
                    既定
                  </span>
                )}
              </div>
              <div className="overflow-hidden rounded-md border border-line shadow-sh1">
                <TplRoot palette={palette} className="mado-section-demo">
                  <v.Component config={DEMO_CONFIG} data={SAMPLE_BY_TYPE[active.type]} />
                </TplRoot>
              </div>
            </article>
          ))}
        </section>
      </main>

    </div>
  );
}
