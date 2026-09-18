"use client";

/**
 * 業種別テンプレートの選び場（/portfolio-templates の本体）。
 *
 * ねらいは3つだけ。
 *   1. 自分の商売を見つける（10業種を、情景の絵と「含まれる商売」で探せる）
 *   2. 何が手に入るか分かる（選んだ業種の実物プレビューと、載る機能の一覧）
 *   3. そのまま始められる（その業種を選んだ状態で申し込みへ進む）
 *
 * 守っていること（ART_DIRECTION_V2 / 40%除外リスト）:
 *  - 均等3カラムの同一カードを並べない（左に選ぶ列、右に大きく実物。非対称）
 *  - 一度に読み込む iframe は1つだけ（10枚のサムネ表をやめた）
 *  - ピルだらけにしない。角丸に強弱をつける
 *  - スクロール fade-in を撒かない（ページロードの段階表示は1回だけ）
 *  - 絵が無いときも空白にしない（実写が来るまでは線画で成立させる）
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, ExternalLink, Star } from "lucide-react";

import LazyIframe from "@/components/LazyIframe";
import { LinkButton } from "@/components/marketing/LinkButton";
import { WindowFrame } from "@/components/marketing/WindowFrame";
import BrandPicker, {
  BrandStrip,
  EMPTY_BRAND,
  colorSetName,
  type BrandChoice,
} from "@/components/brand/BrandPicker";
import StructureList from "@/components/templates/StructureList";
import { SceneArt } from "@/components/sections/art";
import { TplRoot } from "@/components/template-renderers/TplPalette";

import { TEMPLATES, type TemplateDef } from "@/lib/templates/catalog";
import { INDUSTRIES, industryNamesFor } from "@/lib/industry-registry";
import {
  buildPalette,
  resolveBrand,
  templatePreviewUrl,
  type BrandColors,
  type Palette,
} from "@/lib/palette";
import { PLAN_LABELS, type Plan } from "@/lib/stripe";
import { useSettled } from "@/lib/use-settled";

/* ═══════════════════════════════════════
   決め打ちの値
   ═══════════════════════════════════════ */

const PLANS: Plan[] = ["otameshi", "omakase", "omakase-pro"];

/** プレビューを描くときの元の横幅（この幅で描いて、枠に合わせて縮める） */
const BASE_WIDTH = 1280;

/**
 * 絵が無いときに描く線画の題材。
 * 業種の空気に近い言葉を渡すと、SceneArt が住宅／店舗／ビル／施設を描き分ける。
 */
const SCENE_CATEGORY: Record<string, string> = {
  "warm-craft": "リフォーム",
  "trust-navy": "オフィスビル",
  "clean-arch": "住宅",
  saveur: "カフェ",
  velvet: "サロン",
  clarity: "医療施設",
  credence: "事務所",
  beacon: "学校",
  forge: "施設",
  marche: "店",
};

/* ═══════════════════════════════════════
   小さな部品
   ═══════════════════════════════════════ */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-terracotta">
      <span aria-hidden className="h-px w-6 bg-terracotta/60" />
      {children}
    </p>
  );
}

/**
 * 業種の情景。
 * public/images/industries/<id>.jpg があればそれを、無ければ線画を同じ枠に描く。
 * どちらの場合も枠の大きさは変わらないので、あとから実写を入れてもレイアウトは動かない。
 */
function IndustryScene({
  photo,
  alt,
  palette,
  category,
  seed,
  sizes,
}: {
  photo?: string;
  alt: string;
  palette: Palette;
  category: string;
  seed: number;
  sizes: string;
}) {
  const [failed, setFailed] = useState(false);

  if (photo && !failed) {
    return (
      <Image
        src={photo}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <TplRoot palette={palette} className="absolute inset-0">
      <SceneArt seed={seed} category={category} />
    </TplRoot>
  );
}

/**
 * 実物のプレビュー。
 * 枠の幅を測って、1280px で描いたサイトをちょうど収まる大きさに縮める。
 * 業種が変わったときだけ描き直す（色やプランの変更は同じ画面のまま塗り替わる）。
 */
function LivePreview({
  src,
  title,
  palette,
  reloadKey,
}: {
  src: string;
  title: string;
  palette: Palette;
  reloadKey: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const update = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = box.w > 0 ? box.w / BASE_WIDTH : 0;

  return (
    <div
      ref={boxRef}
      className="relative aspect-[3/4] w-full sm:aspect-[4/3] lg:aspect-[16/11]"
      style={{ background: palette.bg }}
    >
      {scale > 0 && (
        <LazyIframe
          key={reloadKey}
          src={src}
          title={title}
          fallbackBg={palette.bg}
          fallbackColors={[palette.primary, palette.sub1]}
          className="h-full w-full"
          iframeWidth={BASE_WIDTH}
          iframeHeight={Math.round(box.h / scale)}
          scale={scale}
        />
      )}
    </div>
  );
}

/** プランの切り替え（ピルにしない。押している面をはっきり出す） */
function PlanSwitch({ plan, onChange }: { plan: Plan; onChange: (p: Plan) => void }) {
  return (
    <div
      role="group"
      aria-label="プラン"
      className="inline-flex items-center gap-0.5 rounded-md border border-line bg-surface2 p-0.5"
    >
      {PLANS.map((p) => (
        <button
          key={p}
          type="button"
          aria-pressed={plan === p}
          onClick={() => onChange(p)}
          className={[
            "rounded-[5px] px-3 py-1.5 text-xs font-medium outline-none transition-colors duration-200 ease-brand focus-visible:ring-2 focus-visible:ring-ring",
            plan === p ? "bg-surface text-ink shadow-sh1" : "text-ink3 hover:text-ink",
          ].join(" ")}
        >
          {PLAN_LABELS[p]}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   本体
   ═══════════════════════════════════════ */

export default function IndustryExplorer({
  photos,
}: {
  /** 業種ID → public 以下の絵のパス（ビルド時に数えた実在ぶんだけ） */
  photos: Record<string, string>;
}) {
  const [selected, setSelected] = useState(0);
  const [plan, setPlan] = useState<Plan>("omakase");
  const [brandChoice, setBrandChoice] = useState<BrandChoice>(EMPTY_BRAND);

  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  /* --- 選んだ色（未選択ならテンプレートのもとの色） --- */
  const brand: BrandColors | null = useMemo(
    () =>
      brandChoice.primary
        ? {
            primary: brandChoice.primary,
            sub1: brandChoice.sub1 ?? undefined,
            sub2: brandChoice.sub2 ?? undefined,
          }
        : null,
    [brandChoice],
  );
  // 色つまみを動かしている間はプレビューを読み直さない
  const settledBrand = useSettled(brand);
  const usingOwnColor = brand !== null;

  /* --- 10業種ぶんの色一式（絵と色帯に使う） --- */
  const palettes = useMemo(
    () => TEMPLATES.map((t) => buildPalette(resolveBrand(brand, t.id))),
    [brand],
  );

  const active: TemplateDef = TEMPLATES[selected];
  const activePalette = palettes[selected];
  const previewSrc = templatePreviewUrl(active.id, settledBrand, plan);
  const fullscreenSrc = templatePreviewUrl(active.id, brand, plan);
  const colorLabel = usingOwnColor
    ? colorSetName(brandChoice.setId) ?? "自分の色"
    : "業種のもとの色";

  /* --- 業種を選ぶ --- */
  function choose(index: number) {
    setSelected(index);
    if (typeof window === "undefined") return;
    // 幅の狭い画面では、選んだ結果が下に出るので、そこまで運ぶ
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
    });
  }

  /** 上下左右キーで業種を移る（表と同じ感覚で選べるように） */
  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    let next = index;
    if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TEMPLATES.length - 1;
    else {
      const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
      next = (index + dir + TEMPLATES.length) % TEMPLATES.length;
    }
    setSelected(next);
    rowRefs.current[next]?.focus();
  }

  return (
    <>
      {/* ═══════════ 主張 ＋ 色で見比べる ═══════════ */}
      <section className="relative overflow-hidden bg-bg">
        <div
          aria-hidden
          className="window-light pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px]"
        />
        <div
          aria-hidden
          className="paper-grain pointer-events-none absolute inset-0 -z-10 opacity-60"
        />

        <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-14 sm:pt-20 lg:grid-cols-[1fr_0.92fr] lg:items-start lg:gap-14">
          <div className="lg:pt-6">
            <div className="mado-load" style={{ animationDelay: "60ms" }}>
              <Eyebrow>業種別テンプレート</Eyebrow>
            </div>

            <h1
              className="mado-load font-serif text-4xl font-bold leading-[1.18] tracking-tight text-ink sm:text-5xl lg:text-[3.2rem]"
              style={{ animationDelay: "120ms" }}
            >
              あなたの商売に、
              <br />
              ちょうどいい<span className="text-accent">窓</span>を。
            </h1>

            <p
              className="mado-load mt-6 max-w-md text-base leading-relaxed text-ink2"
              style={{ animationDelay: "200ms" }}
            >
              10の業種ごとに、その仕事に必要な機能をそろえました。色はあなたの色に。
            </p>

            <dl
              className="mado-load mt-8 flex flex-wrap items-end gap-x-8 gap-y-4"
              style={{ animationDelay: "260ms" }}
            >
              {[
                { n: String(TEMPLATES.length), unit: "業種", note: "そのまま使える型" },
                { n: String(INDUSTRIES.length), unit: "の商売", note: "細かい業種から選べる" },
                { n: "0", unit: "円", note: "制作費・月額0円から" },
              ].map((s) => (
                <div key={s.unit}>
                  <dt className="sr-only">{s.note}</dt>
                  <dd>
                    <span className="tnum font-serif text-3xl font-bold text-ink">{s.n}</span>
                    <span className="ml-1 text-sm text-ink2">{s.unit}</span>
                    <span className="mt-0.5 block text-xs text-ink3">{s.note}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <ul
              className="mado-load mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink2"
              style={{ animationDelay: "320ms" }}
            >
              {["どれも実際に動く本物", "色を変えてその場で確認", "選んだ業種のまま申し込める"].map(
                (t) => (
                  <li key={t} className="inline-flex items-center gap-1.5">
                    <Check className="size-4 text-accent" strokeWidth={2.5} aria-hidden />
                    {t}
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* 色で見比べる操作（申し込み画面と同じ仕組み） */}
          <div
            className="mado-load rounded-2xl border border-line bg-surface p-5 shadow-sh2 sm:p-6"
            style={{ animationDelay: "180ms" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-ink">色で見比べる</h2>
                <p className="mt-1 text-xs text-ink3">
                  選んだ色で、下の見本がその場で塗り替わります。
                </p>
              </div>
              <div className="flex items-center gap-2">
                <BrandStrip palette={activePalette} />
                <span className="text-xs text-ink2">{colorLabel}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setBrandChoice(EMPTY_BRAND)}
              aria-pressed={!usingOwnColor}
              className={[
                "mt-4 w-full rounded-lg border px-4 py-2.5 text-left text-sm outline-none transition-colors duration-200 ease-brand focus-visible:ring-2 focus-visible:ring-ring",
                usingOwnColor
                  ? "border-line bg-surface2 text-ink2 hover:text-ink"
                  : "border-accent bg-accent-soft text-ink",
              ].join(" ")}
            >
              業種のもとの色にもどす
            </button>

            <div className="mt-6 border-t border-line pt-5">
              <BrandPicker
                value={brandChoice}
                onChange={setBrandChoice}
                columns="grid-cols-3 gap-2 sm:grid-cols-4"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 業種を選ぶ ═══════════ */}
      <section id="industries" className="scroll-mt-20 bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <div className="max-w-2xl">
            <Eyebrow>10の業種</Eyebrow>
            <h2 className="font-serif text-3xl font-bold leading-snug text-ink sm:text-4xl">
              自分の商売に近いものを、選んでください。
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink2">
              選ぶと、その色・そのプランの実物と、サイトに載る機能が出ます。
              ぴったりの名前が無くても、近いものを選べば大丈夫です。
            </p>
          </div>

          <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,21rem)_1fr] lg:gap-10">
            {/* 選ぶ列 */}
            <div
              role="radiogroup"
              aria-label="業種"
              className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:gap-2"
            >
              {TEMPLATES.map((t, i) => {
                const on = i === selected;
                const required = t.sections.filter((s) => s.required);
                return (
                  <button
                    key={t.id}
                    ref={(el) => {
                      rowRefs.current[i] = el;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    tabIndex={on ? 0 : -1}
                    onClick={() => choose(i)}
                    onKeyDown={(e) => onKeyDown(e, i)}
                    className={[
                      "group flex flex-col gap-2.5 rounded-lg border p-2 text-left outline-none transition-[border-color,background-color,box-shadow] duration-200 ease-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface lg:flex-row lg:items-center lg:gap-3",
                      on
                        ? "border-accent bg-accent-soft shadow-sh1"
                        : "border-line bg-bg hover:border-brand/35 hover:bg-surface2",
                    ].join(" ")}
                  >
                    <span className="relative aspect-[3/2] w-full shrink-0 overflow-hidden rounded-md border border-line bg-surface2 lg:w-[7.5rem]">
                      <IndustryScene
                        photo={photos[t.id]}
                        alt={`${t.industry}のサイトの雰囲気`}
                        palette={palettes[i]}
                        category={SCENE_CATEGORY[t.id] ?? t.industry}
                        seed={i}
                        sizes="(min-width: 1024px) 120px, 45vw"
                      />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-serif text-sm font-bold leading-snug text-ink lg:text-[0.95rem]">
                        {t.industry}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-ink3 lg:truncate">
                        {industryNamesFor(t.id, 4).join("・")} など
                      </span>
                      <span className="mt-1.5 hidden flex-wrap gap-1 lg:flex">
                        {required.slice(0, 3).map((s) => (
                          <span
                            key={s.id}
                            className="inline-flex items-center gap-1 rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] font-medium text-ink2"
                          >
                            <Star
                              className="size-2.5 text-accent"
                              aria-hidden
                              fill="currentColor"
                            />
                            {s.label}
                          </span>
                        ))}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 選んだ業種 */}
            <div ref={panelRef} className="scroll-mt-20 lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-2xl border border-line bg-bg shadow-sh2">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-5 sm:px-6">
                  <div className="min-w-0">
                    <p className="text-xs text-ink3">選んでいる業種</p>
                    <h3 className="font-serif mt-0.5 text-2xl font-bold text-ink">
                      {active.industry}
                    </h3>
                    <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ink2">
                      {active.tagline}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <PlanSwitch plan={plan} onChange={setPlan} />
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-ink3">
                      <BrandStrip palette={activePalette} />
                      {colorLabel}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-5 sm:px-6">
                  <WindowFrame
                    caption={`${active.industry}のサイト（${PLAN_LABELS[plan]}・実物）`}
                  >
                    <LivePreview
                      src={previewSrc}
                      title={`${active.industry}のテンプレート`}
                      palette={activePalette}
                      reloadKey={active.id}
                    />
                  </WindowFrame>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <LinkButton
                      href={`/start?industry=${active.id}&plan=${plan}`}
                      variant="cta"
                      size="lg"
                      rightIcon={<ArrowRight className="size-4" aria-hidden />}
                    >
                      この業種で始める
                    </LinkButton>
                    <a
                      href={fullscreenSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-13 items-center justify-center gap-2 rounded-md border border-brand/45 px-6 text-sm font-medium text-ink outline-none transition-colors duration-200 ease-brand hover:border-brand/70 hover:bg-surface2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                    >
                      <ExternalLink className="size-4" aria-hidden />
                      全画面で見る
                    </a>
                  </div>

                  <StructureList
                    templateId={active.id}
                    plan={plan}
                    className="mt-8 border-t border-line pt-6"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
