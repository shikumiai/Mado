"use client";

/**
 * ページの構成パネル。
 *
 * できること
 *  - ドラッグで並び替え（すぐプレビューに映る）
 *  - 目のマークで表示・非表示
 *  - 「見せ方を変える」で、同じ機能の5つのレイアウトから選ぶ
 *  - 上のプランで増える機能は錠を付けて、料金の画面へ案内する
 *
 * 外への保存は親の「反映する」でまとめて。ここは手元の状態を変えるだけ。
 * 見せ方の名前と使いどころは src/components/sections（部品カタログ）から取る。
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext, closestCenter,
  KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, LayoutTemplate, Check, Lock, Star } from "lucide-react";
import type { Section } from "@/lib/site-config-schema";
import { SECTION_CATALOG, type SectionTypeEntry } from "@/components/sections";
import {
  getTemplateOrDefault,
  normalizeSectionType,
  planAllows,
  type TemplateSectionDef,
} from "@/lib/templates/catalog";
import { PLAN_LABELS, type Plan } from "@/lib/stripe";

interface Props {
  sections: Section[];
  onChange: (sections: Section[]) => void;
  /** 業種テンプレート（プランで増える機能を出すために使う） */
  templateId: string;
  plan: Plan;
}

const BY_TYPE = new Map(SECTION_CATALOG.map((t) => [t.type, t]));

/** 並び替えの目印。同じ機能が2つある業種（料金とコースなど）でもぶつからない */
function keyOf(section: Section, index: number): string {
  return `${section.type}:${section.id ?? index}`;
}

function catalogOf(section: Section): SectionTypeEntry | undefined {
  return BY_TYPE.get(normalizeSectionType(section.type));
}

/** いま選ばれている見せ方の名前 */
function variantLabel(section: Section): string {
  const entry = catalogOf(section);
  if (!entry) return "既定";
  const id = section.variant ?? entry.defaultVariant;
  return entry.variants.find((v) => v.id === id)?.label ?? entry.variants[0].label;
}

/* ═══════════════════════════════════════
   1行
   ═══════════════════════════════════════ */

function SortableItem({
  section, index, open, onToggle, onOpenVariants, onPickVariant,
}: {
  section: Section;
  index: number;
  open: boolean;
  onToggle: (index: number) => void;
  onOpenVariants: (key: string | null) => void;
  onPickVariant: (index: number, variant: string) => void;
}) {
  const id = keyOf(section, index);
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id });

  // dnd-kit が出す transform / transition はインラインで渡す必要がある
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const entry = catalogOf(section);
  const current = section.variant ?? entry?.defaultVariant;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "mb-1.5 rounded-lg border",
        section.visible ? "bg-surface" : "bg-surface2",
        isDragging ? "border-accent shadow-sh1" : "border-line",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 px-2.5 py-2">
        {/* ドラッグハンドル */}
        <div
          {...attributes}
          {...listeners}
          aria-label="ドラッグして並び替え"
          className="flex cursor-grab touch-none items-center text-ink3 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <GripVertical className="size-4" aria-hidden />
        </div>

        {/* ラベル */}
        <div className="min-w-0 flex-1">
          <span
            className={[
              "block truncate text-sm font-medium",
              section.visible ? "text-ink" : "text-ink3 line-through",
            ].join(" ")}
          >
            {section.label}
          </span>
          {entry && (
            <span className="block truncate text-[11px] text-ink3">
              見せ方：{variantLabel(section)}
            </span>
          )}
        </div>

        {/* 見せ方 */}
        {entry && (
          <button
            type="button"
            onClick={() => onOpenVariants(open ? null : id)}
            aria-expanded={open}
            title="見せ方を変える"
            className={[
              "flex items-center rounded p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring",
              open ? "text-accent" : "text-ink3 hover:text-ink",
            ].join(" ")}
          >
            <LayoutTemplate className="size-4" aria-hidden />
            <span className="sr-only">見せ方を変える</span>
          </button>
        )}

        {/* 表示/非表示トグル */}
        <button
          type="button"
          onClick={() => onToggle(index)}
          className={[
            "flex items-center rounded p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring",
            section.visible ? "text-accent" : "text-ink3 hover:text-ink",
          ].join(" ")}
          title={section.visible ? "非表示にする" : "表示する"}
          aria-pressed={section.visible}
        >
          {section.visible ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
        </button>
      </div>

      {/* 見せ方の一覧（5つ） */}
      {open && entry && (
        <div className="border-t border-line p-2">
          <p className="mb-1.5 px-1 text-[11px] text-ink3">
            {entry.label}の見せ方。選ぶとすぐプレビューに映ります。
          </p>
          <div role="radiogroup" aria-label={`${entry.label}の見せ方`} className="flex flex-col gap-1">
            {entry.variants.map((v) => {
              const selected = v.id === current;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onPickVariant(index, v.id)}
                  className={[
                    "flex items-start gap-2 rounded-md border px-2.5 py-2 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? "border-accent bg-accent-soft"
                      : "border-transparent hover:bg-surface2",
                  ].join(" ")}
                >
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                    {selected && <Check className="size-3.5 text-accent" aria-hidden />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">{v.label}</span>
                    <span className="block text-[11px] leading-relaxed text-ink2">{v.note}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   本体
   ═══════════════════════════════════════ */

export default function SectionPanel({ sections, onChange, templateId, plan }: Props) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  const ids = useMemo(() => sections.map((s, i) => keyOf(s, i)), [sections]);

  /** このプランではまだ出せない機能（テンプレート定義にあって、いま無いもの） */
  const locked = useMemo<TemplateSectionDef[]>(() => {
    const here = new Set(sections.map((s) => `${normalizeSectionType(s.type)}:${s.id ?? ""}`));
    return getTemplateOrDefault(templateId)
      .sections.filter((d) => !planAllows(plan, d.plan))
      .filter((d) => !here.has(`${d.type}:${d.id}`));
  }, [sections, templateId, plan]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(sections, oldIndex, newIndex));
  }

  function handleToggle(index: number) {
    onChange(sections.map((s, i) => (i === index ? { ...s, visible: !s.visible } : s)));
  }

  function handlePickVariant(index: number, variant: string) {
    onChange(sections.map((s, i) => (i === index ? { ...s, variant } : s)));
  }

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {sections.map((section, index) => (
            <SortableItem
              key={ids[index]}
              section={section}
              index={index}
              open={openKey === ids[index]}
              onToggle={handleToggle}
              onOpenVariants={setOpenKey}
              onPickVariant={handlePickVariant}
            />
          ))}
        </SortableContext>
      </DndContext>

      <p className="mt-2 text-xs text-ink3">
        ハンドルをつまんで並び替え。目のマークで表示・非表示、四角のマークで見せ方を変えます。
      </p>

      {/* 上のプランで増えるもの */}
      {locked.length > 0 && (
        <div className="mt-5 rounded-lg border border-line bg-surface2 p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-ink">
            <Lock className="size-3.5 text-ink3" aria-hidden />
            上のプランで増える内容
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {locked.map((d) => (
              <li key={`${d.type}-${d.id}`} className="flex items-center gap-2 text-xs text-ink2">
                {d.required && <Star className="size-3 shrink-0 text-accent" aria-hidden fill="currentColor" />}
                <span className="min-w-0 flex-1 truncate">{d.label}</span>
                <span className="shrink-0 text-ink3">{PLAN_LABELS[d.plan as Plan]}以上で表示</span>
              </li>
            ))}
          </ul>
          <Link
            href="/app/billing"
            className="mt-3 inline-flex h-8 items-center rounded-md border border-brand/40 px-3 text-xs font-medium text-ink outline-none transition hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring"
          >
            プランを見る
          </Link>
        </div>
      )}
    </div>
  );
}
