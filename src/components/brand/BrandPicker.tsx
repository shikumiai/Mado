"use client";

/**
 * 色を決める部品。申し込み画面（/start）と編集画面の「色を変える」で同じものを使う。
 *
 * 決めるのは代表カラー1つとサブ2つだけ。見出し・地・線・ボタン・イラストの色は
 * そこから自動で作られる（src/lib/palette.ts）。だから選んだ瞬間に全体が塗り替わる。
 */

import { useRef, useState } from "react";
import { Check, Palette, X } from "lucide-react";
import {
  COLOR_SETS,
  normalizeHex,
  type Palette as TplPalette,
} from "@/lib/palette";

/* ═══════════════════════════════════════
   色ひとそろい（外から渡す値）
   ═══════════════════════════════════════ */

export interface BrandChoice {
  primary: string | null;
  sub1: string | null;
  sub2: string | null;
  /** 選んだ組の名前（自分で色を入れたら null） */
  setId: string | null;
}

export const EMPTY_BRAND: BrandChoice = { primary: null, sub1: null, sub2: null, setId: null };

/** 組の名前（確認画面などに出す） */
export function colorSetName(setId: string | null): string | null {
  return setId ? COLOR_SETS.find((c) => c.id === setId)?.name ?? null : null;
}

/* ═══════════════════════════════════════
   小さな部品
   ═══════════════════════════════════════ */

/** 色の小片。名前を下に添えられる */
export function Chip({ color, label }: { color: string; label?: string }) {
  return (
    <div className="min-w-0">
      <span className="block h-7 rounded-md border border-line" style={{ background: color }} />
      {label && <span className="mt-1 block truncate text-[10px] text-ink3">{label}</span>}
    </div>
  );
}

/** 選んだ色の3つ並び（どこにでも置ける小さな帯） */
export function BrandStrip({ palette, className = "" }: { palette: TplPalette; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-hidden>
      <span className="size-3.5 rounded-sm border border-line" style={{ background: palette.primary }} />
      <span className="size-3.5 rounded-sm border border-line" style={{ background: palette.sub1 }} />
      <span className="size-3.5 rounded-sm border border-line" style={{ background: palette.sub2 }} />
    </span>
  );
}

/**
 * 選んだ色から作られる一式を並べて見せる帯。
 * 「代表カラーを決めると、地も見出しも線もこの色から作られる」を目で確かめてもらう。
 */
export function PaletteBoard({
  palette,
  chosen,
  hasSubs,
}: {
  palette: TplPalette;
  chosen: boolean;
  hasSubs: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sh1">
      <div className="flex items-stretch gap-3 border-b border-line p-4">
        <div className="min-w-0 flex-[1.6]">
          <span className="block h-16 rounded-lg border border-line" style={{ background: palette.primary }} />
          <p className="mt-1.5 text-xs font-medium text-ink">代表カラー</p>
          <p className="tnum text-[11px] text-ink3">{palette.primary}</p>
        </div>
        <div className="min-w-0 flex-1">
          <span className="block h-16 rounded-lg border border-line" style={{ background: palette.sub1 }} />
          <p className="mt-1.5 text-xs text-ink2">サブ 1</p>
          <p className="tnum text-[11px] text-ink3">{palette.sub1}</p>
        </div>
        <div className="min-w-0 flex-1">
          <span className="block h-16 rounded-lg border border-line" style={{ background: palette.sub2 }} />
          <p className="mt-1.5 text-xs text-ink2">サブ 2</p>
          <p className="tnum text-[11px] text-ink3">{palette.sub2}</p>
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs font-medium text-ink">この色から作られるもの</p>
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
          <Chip color={palette.primarySoft} label="淡い面" />
          <Chip color={palette.primaryStrong} label="押した時" />
          <Chip color={palette.bg} label="地" />
          <Chip color={palette.bgDeep} label="ひとつ濃い段" />
          <Chip color={palette.ink} label="見出し" />
          <Chip color={palette.ink2} label="本文" />
          <Chip color={palette.line} label="線" />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink2">
          {chosen
            ? "この色でサイト全体が統一されます。文字は読みやすい濃さに自動で調整します。"
            : "まだ色を選んでいないので、テンプレートのもとの色を出しています。"}
          {chosen && !hasSubs && (
            <>
              <br />
              サブカラーは、代表カラーになじむ色を自動で作りました。自分で選ぶこともできます。
            </>
          )}
        </p>
      </div>
    </div>
  );
}

/** 色をひとつ入れる欄（色つまみ + 16進の文字入力） */
export function ColorInput({
  id,
  label,
  value,
  placeholder,
  required = false,
  onChange,
  onClear,
}: {
  id: string;
  label: string;
  value: string | null;
  placeholder: string;
  required?: boolean;
  onChange: (hex: string) => void;
  onClear?: () => void;
}) {
  // 入力中の文字。null なら外から来た値をそのまま出す。
  // 外の値が変わったら入力中の文字は捨てる（描画中に直す・React 推奨の書き方）。
  const [typed, setTyped] = useState<string | null>(null);
  const [seen, setSeen] = useState(value);
  if (seen !== value) {
    setSeen(value);
    setTyped(null);
  }
  const text = typed ?? value ?? "";
  const invalid = text.trim().length > 0 && normalizeHex(text) === null;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label}を色見本から選ぶ`}
          value={normalizeHex(value) ?? "#C05A2E"}
          onChange={(e) => onChange(e.target.value)}
          className="size-11 shrink-0 cursor-pointer rounded-md border border-line bg-surface p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <input
          id={id}
          value={text}
          onChange={(e) => {
            setTyped(e.target.value);
            const hex = normalizeHex(e.target.value);
            if (hex) onChange(hex);
          }}
          placeholder={placeholder}
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          aria-invalid={invalid}
          className="tnum h-11 min-w-0 flex-1 rounded-md border border-line bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink3 focus-visible:ring-2 focus-visible:ring-ring"
        />
        {onClear && value && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-md p-2 text-ink3 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${label}を使わない`}
            title="使わない"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>
      {invalid && (
        <p className="text-xs text-danger">色の書き方が違います。#C05A2E のように入れてください。</p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   色を選ぶ本体
   ═══════════════════════════════════════ */

export default function BrandPicker({
  value,
  onChange,
  columns = "grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4",
}: {
  value: BrandChoice;
  onChange: (next: BrandChoice) => void;
  /** 組み合わせを並べる列（画面の幅に合わせて外から渡す） */
  columns?: string;
}) {
  const [customOpen, setCustomOpen] = useState(false);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function pickSet(id: string) {
    const set = COLOR_SETS.find((c) => c.id === id);
    if (!set) return;
    onChange({ primary: set.primary, sub1: set.sub1, sub2: set.sub2, setId: set.id });
  }

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (index + dir + COLOR_SETS.length) % COLOR_SETS.length;
    pickSet(COLOR_SETS[nextIndex].id);
    refs.current[nextIndex]?.focus();
  }

  return (
    <div>
      <h2 className="text-sm font-medium text-ink">選ぶだけの組み合わせ</h2>
      <p className="mt-1 text-xs text-ink3">代表カラーとサブカラー2つが、あらかじめ組んであります。</p>

      <div role="radiogroup" aria-label="色の組み合わせ" className={`mt-3 grid ${columns}`}>
        {COLOR_SETS.map((set, i) => {
          const selected = set.id === value.setId;
          return (
            <button
              key={set.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected || (value.setId == null && i === 0) ? 0 : -1}
              onClick={() => pickSet(set.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={[
                "overflow-hidden rounded-lg border bg-surface text-left outline-none transition-[border-color,box-shadow] duration-200 ease-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                selected ? "border-accent shadow-sh2" : "border-line shadow-sh1 hover:border-brand/40",
              ].join(" ")}
            >
              <div className="relative h-14" style={{ background: set.primary }}>
                <span className="absolute inset-x-0 bottom-0 flex h-3.5">
                  <span className="flex-1" style={{ background: set.sub1 }} />
                  <span className="w-1/3" style={{ background: set.sub2 }} />
                </span>
                {selected && (
                  <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-surface">
                    <Check className="size-3 text-accent" aria-hidden />
                  </span>
                )}
              </div>
              <div className="px-2.5 py-2">
                <p className="truncate text-xs font-medium text-ink">{set.name}</p>
                <p className="truncate text-[11px] text-ink3">{set.forWho}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 自分の色を入れる */}
      <div className="mt-6 rounded-xl border border-line bg-surface">
        <button
          type="button"
          onClick={() => setCustomOpen((v) => !v)}
          aria-expanded={customOpen}
          className="flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Palette className="size-4 shrink-0 text-accent" aria-hidden />
          <span className="flex-1 text-sm font-medium text-ink">自分の色を入れる</span>
          <span className="text-xs text-ink3">
            {customOpen ? "閉じる" : "会社のロゴの色などを直接指定"}
          </span>
        </button>
        {customOpen && (
          <div className="flex flex-col gap-4 border-t border-line p-4">
            <ColorInput
              id="brand-primary"
              label="代表カラー"
              required
              value={value.primary}
              placeholder="#C05A2E"
              onChange={(hex) => onChange({ ...value, primary: hex, setId: null })}
            />
            <ColorInput
              id="brand-sub1"
              label="サブカラー 1（任意）"
              value={value.sub1}
              placeholder="なくても大丈夫です"
              onChange={(hex) => onChange({ ...value, sub1: hex, setId: null })}
              onClear={() => onChange({ ...value, sub1: null, setId: null })}
            />
            <ColorInput
              id="brand-sub2"
              label="サブカラー 2（任意）"
              value={value.sub2}
              placeholder="なくても大丈夫です"
              onChange={(hex) => onChange({ ...value, sub2: hex, setId: null })}
              onClear={() => onChange({ ...value, sub2: null, setId: null })}
            />
            <p className="text-xs text-ink3">
              サブカラーは空のままでも大丈夫です。代表カラーになじむ色を自動で作ります。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
