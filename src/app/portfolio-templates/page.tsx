"use client";

/**
 * テンプレート一覧（10業種）。
 *
 * 業種ごとに1つ。中身は本番と同じ描画（TemplateRenderer）なので、
 * ここで見えているものが、そのまま公開されるサイトになる。
 *
 * 上のバーで色を変えると、並んでいる10枚が一斉にその色へ塗り替わる。
 * 「色はお客のもの」を、説明でなく画面で見せるための一覧。
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Monitor, Smartphone, Star } from "lucide-react";
import { TEMPLATES } from "@/lib/templates/catalog";
import { industryNamesFor } from "@/lib/industry-registry";
import {
  COLOR_SETS,
  buildPalette,
  normalizeHex,
  templatePreviewUrl,
  type BrandColors,
} from "@/lib/palette";
import { PLAN_LABELS, type Plan } from "@/lib/stripe";
import { WindowMark } from "@/components/marketing/WindowMark";

const PLANS: Plan[] = ["otameshi", "omakase", "omakase-pro"];

/** 端末の見え方 */
const DEVICES = {
  desktop: { label: "パソコン", width: 1280, height: 760, scale: 0.34, icon: Monitor },
  mobile: { label: "スマートフォン", width: 420, height: 760, scale: 0.52, icon: Smartphone },
} as const;

type DeviceId = keyof typeof DEVICES;

export default function PortfolioTemplatesPage() {
  const [device, setDevice] = useState<DeviceId>("desktop");
  const [plan, setPlan] = useState<Plan>("omakase-pro");
  const [colorSetId, setColorSetId] = useState<string | null>(null);
  const [custom, setCustom] = useState("");

  const brand: BrandColors | null = useMemo(() => {
    const hex = normalizeHex(custom);
    if (hex) return { primary: hex };
    const set = COLOR_SETS.find((c) => c.id === colorSetId);
    return set ? { primary: set.primary, sub1: set.sub1, sub2: set.sub2 } : null;
  }, [colorSetId, custom]);

  const d = DEVICES[device];

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* ─── 上のバー ─── */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-5 py-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/" className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <WindowMark className="size-7" />
              <span className="font-serif text-lg font-bold tracking-tight">Mado</span>
            </Link>

            <div className="min-w-0">
              <h1 className="font-serif text-base font-semibold text-ink">業種別テンプレート</h1>
              <p className="text-xs text-ink3">
                10業種ぶん。色とプランを変えると、下の見本がその場で変わります。
              </p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              {/* プラン */}
              <div role="group" aria-label="プラン" className="inline-flex items-center gap-0.5 rounded-pill bg-surface2 p-0.5">
                {PLANS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={plan === p}
                    onClick={() => setPlan(p)}
                    className={[
                      "rounded-pill px-3 py-1.5 text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
                      plan === p ? "bg-surface text-ink shadow-sh1" : "text-ink3 hover:text-ink",
                    ].join(" ")}
                  >
                    {PLAN_LABELS[p]}
                  </button>
                ))}
              </div>

              {/* 端末 */}
              <div role="group" aria-label="画面の大きさ" className="inline-flex items-center gap-0.5 rounded-pill bg-surface2 p-0.5">
                {(Object.keys(DEVICES) as DeviceId[]).map((id) => {
                  const Icon = DEVICES[id].icon;
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={device === id}
                      title={DEVICES[id].label}
                      onClick={() => setDevice(id)}
                      className={[
                        "inline-flex size-7 items-center justify-center rounded-pill outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
                        device === id ? "bg-surface text-ink shadow-sh1" : "text-ink3 hover:text-ink",
                      ].join(" ")}
                    >
                      <Icon className="size-4" aria-hidden />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 色 */}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
            <span className="text-xs text-ink3">色で見比べる</span>
            <button
              type="button"
              aria-pressed={!colorSetId && !normalizeHex(custom)}
              onClick={() => {
                setColorSetId(null);
                setCustom("");
              }}
              className={[
                "rounded-pill px-3 py-1.5 text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
                !colorSetId && !normalizeHex(custom)
                  ? "bg-accent-soft text-ink ring-1 ring-accent/50"
                  : "bg-surface2 text-ink2 hover:text-ink",
              ].join(" ")}
            >
              業種ごとのもとの色
            </button>
            {COLOR_SETS.slice(0, 8).map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={colorSetId === c.id}
                title={c.forWho}
                onClick={() => {
                  setColorSetId(c.id);
                  setCustom("");
                }}
                className={[
                  "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1.5 text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
                  colorSetId === c.id && !normalizeHex(custom)
                    ? "bg-accent-soft text-ink ring-1 ring-accent/50"
                    : "bg-surface2 text-ink2 hover:text-ink",
                ].join(" ")}
              >
                <span className="size-3 rounded-sm border border-line" style={{ background: c.primary }} />
                {c.name}
              </button>
            ))}
            <label className="ml-1 flex items-center gap-1.5 text-xs text-ink3">
              自分の色
              <input
                type="color"
                value={normalizeHex(custom) ?? "#C05A2E"}
                onChange={(e) => setCustom(e.target.value)}
                aria-label="自分の色を選ぶ"
                className="size-8 cursor-pointer rounded-md border border-line bg-surface p-0.5"
              />
            </label>
          </div>
        </div>
      </header>

      {/* ─── 一覧 ─── */}
      <main className="mx-auto max-w-[1400px] px-5 pb-20 pt-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {TEMPLATES.map((t) => {
            const palette = buildPalette(brand ?? t.palettePreset);
            const src = templatePreviewUrl(t.id, brand, plan);
            const required = t.sections.filter((s) => s.required);
            return (
              <article
                key={t.id}
                className="overflow-hidden rounded-xl border border-line bg-surface shadow-sh1 transition hover:shadow-sh2"
              >
                <div className="flex items-center gap-2.5 border-b border-line px-4 py-2.5">
                  <span className="flex overflow-hidden rounded-sm border border-line" aria-hidden>
                    <span className="size-3.5" style={{ background: palette.primary }} />
                    <span className="size-3.5" style={{ background: palette.sub1 }} />
                    <span className="size-3.5" style={{ background: palette.sub2 }} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{t.industry}</span>
                  <Link
                    href={src}
                    target="_blank"
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border border-line px-2 py-1 text-[11px] text-ink2 outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ExternalLink className="size-3" aria-hidden />
                    全画面
                  </Link>
                </div>

                {/* 見本（本番と同じ描画） */}
                <div
                  className="relative overflow-hidden"
                  style={{ height: 320, background: palette.bg }}
                >
                  <iframe
                    key={`${src}-${device}`}
                    src={src}
                    title={`${t.industry}のテンプレート`}
                    loading="lazy"
                    tabIndex={-1}
                    className="absolute left-1/2 top-0 origin-top border-0"
                    style={{
                      width: d.width,
                      height: Math.round(320 / d.scale),
                      transform: `translateX(-50%) scale(${d.scale})`,
                      transformOrigin: "top center",
                      pointerEvents: "none",
                    }}
                  />
                </div>

                <div className="px-4 py-3">
                  <p className="text-sm text-ink2">{t.tagline}</p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {required.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center gap-1 rounded-pill bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-ink"
                      >
                        <Star className="size-2.5 text-accent" aria-hidden fill="currentColor" />
                        {s.label}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-ink3">
                    {industryNamesFor(t.id, 4).join("・")} など
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* ─── 締め ─── */}
        <section className="mx-auto mt-16 max-w-xl text-center">
          <h2 className="font-serif text-2xl font-bold text-ink">この見た目で、自分の会社のサイトを</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink2">
            色を選んで、業種を選ぶだけ。制作費は0円、月額0円から持てます。
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/start"
              className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-7 text-sm font-bold text-on-accent outline-none transition hover:bg-accent-strong focus-visible:ring-2 focus-visible:ring-ring"
            >
              サイトをつくる
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-md border border-line px-7 text-sm text-ink2 outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
            >
              トップに戻る
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
