"use client";

import { useMemo } from "react";
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
import { GripVertical, Eye, EyeOff } from "lucide-react";
import type { Section } from "@/lib/site-config-schema";

/**
 * セクション管理パネル
 * - ドラッグ&ドロップで並び替え → 即座にプレビュー反映
 * - 表示/非表示トグル → 即座にプレビュー反映
 * - 外部への保存は親コンポーネントの「反映する」ボタンで一括
 *
 * 見た目は rebuild-v2 の設計トークン（surface / ink / line / accent）に合わせている。
 * 並び替え・トグルの中身（dnd-kit）の挙動は変えていない。
 */

interface Props {
  sections: Section[];
  onChange: (sections: Section[]) => void;
}

function SortableItem({ section, index, onToggle }: {
  section: Section; index: number;
  onToggle: (index: number) => void;
}) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: section.type });

  // dnd-kit が出す transform / transition はインラインで渡す必要がある
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "mb-1.5 flex items-center gap-2 rounded-lg border px-2.5 py-2",
        section.visible ? "bg-surface" : "bg-surface2",
        isDragging ? "border-accent shadow-sh1" : "border-line",
      ].join(" ")}
    >
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
      <span
        className={[
          "flex-1 text-sm font-medium",
          section.visible ? "text-ink" : "text-ink3 line-through",
        ].join(" ")}
      >
        {section.label}
      </span>

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
  );
}

export default function SectionPanel({ sections, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  const ids = useMemo(() => sections.map((s) => s.type), [sections]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.type === active.id);
    const newIndex = sections.findIndex((s) => s.type === over.id);
    onChange(arrayMove(sections, oldIndex, newIndex));
  }

  function handleToggle(index: number) {
    const next = sections.map((s, i) =>
      i === index ? { ...s, visible: !s.visible } : s
    );
    onChange(next);
  }

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {sections.map((section, index) => (
            <SortableItem
              key={section.type}
              section={section}
              index={index}
              onToggle={handleToggle}
            />
          ))}
        </SortableContext>
      </DndContext>
      <p className="mt-2 text-xs text-ink3">
        ハンドルをつまんで並び替え。目のマークで表示・非表示を切り替えます。
      </p>
    </div>
  );
}
