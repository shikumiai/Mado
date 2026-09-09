"use client";

/**
 * 部品のカタログ（追加するときに開く引き出し）。
 *
 * 画面は覆わない。プレビューを見たまま、右から出た引き出しで部品を選ぶ。
 *   1画面目 … 14の機能を「興味 / 信頼 / 行動」の3つに分けて並べる
 *   2画面目 … 選んだ機能の5つの見せ方を、お客さんの色とその業種の手本で実際に描いて見せる
 * 押すと、その位置に部品が入る。
 *
 * 上のプランでしか出せない機能は薄く出して、どのプランで使えるかを一言添える。
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Plus } from "lucide-react";
import { Sheet } from "@/components/ui";
import { SECTION_CATALOG, type SectionTypeEntry } from "@/components/sections";
import SectionMiniPreview from "./SectionMiniPreview";
import { useConfigPalette } from "@/components/template-renderers/TplPalette";
import { sampleSectionData } from "@/lib/templates/sample-content";
import { findSectionDef, planAllows } from "@/lib/templates/catalog";
import { PLAN_LABELS, type Plan } from "@/lib/stripe";
import type { SiteConfig } from "@/lib/site-config-schema";

/* ═══════════════════════════════════════
   並べ方（興味 → 信頼 → 行動）
   ═══════════════════════════════════════ */

const GROUPS: { name: string; note: string; types: string[] }[] = [
  {
    name: "興味",
    note: "何をやっているかを見せる",
    types: ["hero", "services", "works", "menu"],
  },
  {
    name: "信頼",
    note: "任せていいと思ってもらう",
    types: ["strengths", "staff", "voices", "flow", "faq", "news", "company"],
  },
  {
    name: "行動",
    note: "次の一歩へ運ぶ",
    types: ["booking", "access", "contact"],
  },
];

const BY_TYPE = new Map(SECTION_CATALOG.map((t) => [t.type, t]));

/* ═══════════════════════════════════════
   本体
   ═══════════════════════════════════════ */

export interface CatalogDrawerProps {
  open: boolean;
  onClose: () => void;
  /** いま編集しているサイト（色と会社情報をプレビューに使う） */
  config: SiteConfig;
  templateId: string;
  plan: Plan;
  /** 何番目に入るか（0 なら先頭） */
  insertAt: number;
  /** いまページにある部品の数 */
  total: number;
  onPick: (type: string, variant: string) => void;
}

export default function SectionCatalogDrawer({
  open,
  onClose,
  config,
  templateId,
  plan,
  insertAt,
  total,
  onPick,
}: CatalogDrawerProps) {
  const [picked, setPicked] = useState<SectionTypeEntry | null>(null);
  const palette = useConfigPalette(config);

  const place = insertAt >= total ? "いちばん下に入ります" : `${insertAt + 1}番目に入ります`;

  function close() {
    setPicked(null);
    onClose();
  }

  function choose(entry: SectionTypeEntry, variant: string) {
    setPicked(null);
    onPick(entry.type, variant);
  }

  /** そのプランでこの機能を出せるか。出せないときは必要なプラン名 */
  function lockedPlanOf(type: string): Plan | null {
    const def = findSectionDef(templateId, { type });
    if (!def?.plan) return null;
    return planAllows(plan, def.plan) ? null : (def.plan as Plan);
  }

  return (
    <Sheet
      open={open}
      onClose={close}
      side="right"
      modal={false}
      width="wide"
      title={picked ? `${picked.label}の見せ方` : "部品を追加"}
      description={
        picked
          ? `押すと、この見せ方で${place}。あとから変えられます。`
          : `足したい部品を選んでください。${place}。`
      }
      headerLeading={
        picked ? (
          <button
            type="button"
            onClick={() => setPicked(null)}
            className="-m-1 shrink-0 rounded-md p-1 text-ink2 outline-none transition hover:bg-surface2 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-5" aria-hidden />
            <span className="sr-only">部品の一覧に戻る</span>
          </button>
        ) : undefined
      }
    >
      {picked ? (
        <VariantList entry={picked} config={config} palette={palette} onChoose={choose} />
      ) : (
        <div className="flex flex-col gap-6">
          {GROUPS.map((g) => (
            <section key={g.name}>
              <h3 className="text-sm font-semibold text-ink">{g.name}</h3>
              <p className="mt-0.5 text-xs text-ink3">{g.note}</p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {g.types.map((type) => {
                  const entry = BY_TYPE.get(type);
                  if (!entry) return null;
                  const needs = lockedPlanOf(type);
                  return (
                    <li key={type}>
                      {needs ? (
                        <div className="rounded-lg border border-line bg-surface2 px-3 py-2.5 opacity-60">
                          <p className="flex items-center gap-1.5 text-sm font-medium text-ink2">
                            <Lock className="size-3.5 shrink-0 text-ink3" aria-hidden />
                            {entry.label}
                          </p>
                          <Link
                            href="/app/billing"
                            className="mt-0.5 inline-block text-xs text-accent underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {PLAN_LABELS[needs]}で使えます
                          </Link>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPicked(entry)}
                          className="flex w-full items-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-2.5 text-left outline-none transition hover:border-accent hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Plus className="size-4 shrink-0 text-accent" aria-hidden />
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-ink">{entry.label}</span>
                            <span className="block text-xs text-ink2">{entry.role}</span>
                          </span>
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Sheet>
  );
}

/* ═══════════════════════════════════════
   見せ方5つ（実物の縮小）
   ═══════════════════════════════════════ */

function VariantList({
  entry,
  config,
  palette,
  onChoose,
}: {
  entry: SectionTypeEntry;
  config: SiteConfig;
  palette: ReturnType<typeof useConfigPalette>;
  onChoose: (entry: SectionTypeEntry, variant: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {entry.variants.map((v) => (
        <VariantCard
          key={v.id}
          entry={entry}
          variantId={v.id}
          label={v.label}
          note={v.note}
          config={config}
          palette={palette}
          onChoose={onChoose}
        />
      ))}
    </div>
  );
}

function VariantCard({
  entry,
  variantId,
  label,
  note,
  config,
  palette,
  onChoose,
}: {
  entry: SectionTypeEntry;
  variantId: string;
  label: string;
  note: string;
  config: SiteConfig;
  palette: ReturnType<typeof useConfigPalette>;
  onChoose: (entry: SectionTypeEntry, variant: string) => void;
}) {
  // 手本の中身はその業種のデモから。足した直後に空にならない
  const data = useMemo(
    () => sampleSectionData(config.templateId, entry.type, variantId),
    [config.templateId, entry.type, variantId],
  );

  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface transition focus-within:border-accent hover:border-accent">
      <SectionMiniPreview
        config={config}
        palette={palette}
        type={entry.type}
        variant={variantId}
        data={data}
      />
      <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{label}</p>
          <p className="truncate text-xs text-ink2">{note}</p>
        </div>
        <span className="shrink-0 rounded-pill bg-accent-soft px-2.5 py-1 text-xs font-medium text-ink">
          追加
        </span>
      </div>
      {/* 押すところ。中の部品は inert なので、ここだけが反応する */}
      <button
        type="button"
        onClick={() => onChoose(entry, variantId)}
        className="absolute inset-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="sr-only">{`${entry.label}を「${label}」の見せ方で追加する`}</span>
      </button>
    </div>
  );
}
