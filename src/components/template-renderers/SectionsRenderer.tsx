"use client";

/**
 * サイトを描く1本のディスパッチャ。
 *
 * これまではテンプレートごとに巨大な Renderer を持っていたが、
 * 今は「機能（type）× 見せ方（variant）」で部品を選んで上から並べるだけになった。
 * だから業種を足しても、ここも部品も書き換えなくてよい（増えるのはテンプレート定義だけ）。
 *
 * 描くものの決め方
 *   1. site.config.json に sections があればそれ。無ければテンプレート定義の既定。
 *   2. 表示を消したもの・プランの上位でしか出さないものを落とす。
 *   3. 昔の種類名（about / stats / testimonials …）は今の機能へ読み替える。
 *
 * 色は style.brand（お客さんが選んだ色）→ 無ければテンプレートの初期色。
 * ここで作った1組の色を CSS 変数として流し込むので、全セクション・全SVGが同時に塗り替わる。
 *
 * 枕と足（ヘッダー・フッター）は SiteChrome が受け持つ。
 */

import { Fragment, useMemo } from "react";
import { buildPalette, normalizeHex, type BrandColors } from "@/lib/palette";
import { resolveSections, type Resolved } from "@/lib/templates/sections";
import { getSection } from "@/components/sections";
import { Styles, DetailScopeProvider } from "@/components/sections/shared";
import type { SiteConfig } from "@/lib/site-config-schema";
import { getTemplateOrDefault } from "@/lib/templates/catalog";
import SiteChrome, { type ChromeNavItem } from "./SiteChrome";
import { TplRoot } from "./TplPalette";

/* ═══════════════════════════════════════
   描くものを決める
   ═══════════════════════════════════════ */

/**
 * ヘッダーの案内に出す項目（メインビジュアルは飛び先にしない）。
 * いちばん下の「お問い合わせ」「ご予約」には印を付ける。
 * 横に並びきらないときも、行動につながる1つだけは必ず残すため。
 */
function navOf(sections: Resolved[]): ChromeNavItem[] {
  const items = sections.filter((s) => s.type !== "hero");
  const actionIndex = (() => {
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].type === "contact") return i;
    }
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].type === "booking") return i;
    }
    return -1;
  })();
  return items.map((s, i) => ({ id: s.anchor, label: s.label, action: i === actionIndex }));
}

/* ═══════════════════════════════════════
   サイト全体の土台
   ═══════════════════════════════════════ */

/**
 * ヘッダーが上に貼り付くので、案内から飛んだセクションが頭を隠されないように余白を取る。
 * 地の色をここにも置いておくと、セクションの継ぎ目に白い線が出ない。
 */
const SITE_CSS = `
.mado-site { background: var(--tpl-bg); color: var(--tpl-ink2);
  font-family: var(--font-sans), "Noto Sans JP", system-ui, sans-serif; }
.mado-site section[id] { scroll-margin-top: 78px; }
@media (max-width: 1000px) { .mado-site section[id] { scroll-margin-top: 70px; } }
@media (prefers-reduced-motion: no-preference) { html:has(.mado-site) { scroll-behavior: smooth; } }
`;

/* ═══════════════════════════════════════
   色
   ═══════════════════════════════════════ */

/** お客さんが選んだ色 → 無ければテンプレートの初期色 */
function brandOf(
  preset: BrandColors,
  primary: string | null,
  sub1: string | null,
  sub2: string | null,
): BrandColors {
  if (!primary) return preset;
  return { primary, sub1: sub1 ?? undefined, sub2: sub2 ?? undefined };
}

/* ═══════════════════════════════════════
   本体
   ═══════════════════════════════════════ */

export interface SectionsRendererProps {
  config: SiteConfig;
  editMode?: boolean;
  onFieldClick?: (fieldId: string, currentValue: string, fieldType: "text" | "image") => void;
  changedFields?: Set<string>;
  onSectionEdit?: (index: number | "company") => void;
}

export default function SectionsRenderer({
  config,
  editMode = false,
  onFieldClick,
  changedFields,
  onSectionEdit,
}: SectionsRendererProps) {
  const sections = useMemo(() => resolveSections(config, editMode), [config, editMode]);
  const nav = useMemo(() => navOf(sections), [sections]);

  // 色は「選ばれた色」か「テンプレートの初期色」。
  // 変わったときだけ作り直せるよう、比べるのは色コードそのものにする。
  const preset = getTemplateOrDefault(config.templateId).palettePreset;
  const primary = normalizeHex(config.style?.brand?.primary);
  const sub1 = normalizeHex(config.style?.brand?.sub1);
  const sub2 = normalizeHex(config.style?.brand?.sub2);
  const palette = useMemo(
    () => buildPalette(brandOf(preset, primary, sub1, sub2)),
    [preset, primary, sub1, sub2],
  );

  return (
    <TplRoot
      palette={palette}
      fontChoice={config.style?.fontChoice}
      className="mado-site"
      // 編集中はリンクで画面が飛ばないようにする
      onClick={(e) => {
        if (editMode && (e.target as HTMLElement).closest("a")) e.preventDefault();
      }}
    >
      <Styles id="site" css={SITE_CSS} />
      <SiteChrome config={config} nav={nav} editMode={editMode} onEditCompany={() => onSectionEdit?.("company")}>
        {sections.map((s) => {
          const Component = getSection(s.type, s.variant);
          if (!Component) return null;
          return (
            <Fragment key={s.key}>
            {editMode && onSectionEdit && <div className="border-y border-line bg-surface px-4 py-2 text-right"><button type="button" className="rounded-md px-3 py-2 text-sm font-bold text-ink hover:bg-surface2" onClick={() => onSectionEdit(s.orderIndex)}>{s.label}の内容を編集</button></div>}
            <DetailScopeProvider scope={Array.isArray(s.data?.items) ? s.anchor : null}>
            <Component
              id={s.anchor}
              config={config}
              data={s.data}
              fieldPath={`sections.${s.orderIndex}`}
              editMode={editMode}
              onFieldClick={onFieldClick}
              changedFields={changedFields}
            />
            </DetailScopeProvider>
            </Fragment>
          );
        })}
      </SiteChrome>
    </TplRoot>
  );
}
