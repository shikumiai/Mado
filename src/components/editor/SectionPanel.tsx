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
 */

const C = {
  purple: "#6c5ce7",
  purpleBg: "rgba(108, 92, 231, 0.06)",
  border: "#e8e8e8",
  text: "#222",
  textSub: "#777",
  textMuted: "#bbb",
};

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 10px", borderRadius: 8,
        background: section.visible ? "#fff" : "#f8f8f8",
        border: `1px solid ${isDragging ? C.purple : C.border}`,
        marginBottom: 4,
      }}
    >
      {/* ドラッグハンドル */}
      <div
        {...attributes}
        {...listeners}
        style={{
          cursor: "grab", color: C.textMuted,
          display: "flex", alignItems: "center",
          touchAction: "none",
        }}
      >
        <GripVertical size={16} />
      </div>

      {/* ラベル */}
      <span style={{
        flex: 1, fontSize: 13,
        color: section.visible ? C.text : C.textMuted,
        fontWeight: 500,
        textDecoration: section.visible ? "none" : "line-through",
      }}>
        {section.label}
      </span>

      {/* 表示/非表示トグル */}
      <button
        onClick={() => onToggle(index)}
        style={{
          border: "none", background: "none", cursor: "pointer",
          color: section.visible ? C.purple : C.textMuted,
          display: "flex", alignItems: "center",
          padding: 4, borderRadius: 4,
        }}
        title={section.visible ? "非表示にする" : "表示する"}
      >
        {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
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
      <p style={{ fontSize: 11, fontWeight: 700, color: C.textSub, marginBottom: 8, letterSpacing: "0.05em" }}>
        セクション構成
      </p>
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
      <p style={{ fontSize: 10, color: C.textMuted, marginTop: 8 }}>
        ドラッグで並び替え
      </p>
    </div>
  );
}
