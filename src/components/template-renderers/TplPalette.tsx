"use client";

/**
 * テンプレートの色を配るところ。
 *
 * 顧客サイトの色は site.config.json の style.brand（代表カラー＋サブ最大2色）で決まる。
 * 色が入っていなければテンプレートの初期色を使うので、古い config でもそのまま動く。
 *
 * ルート要素に --tpl-* の CSS 変数を流し込みつつ、同じ色一式を中の部品にも配る。
 * CSS（見出し・帯・線・ボタン）は変数で、SVG の絵は実際の色の値で塗る。
 * SVG の fill / stroke 属性は CSS 変数を受け付けない環境があるため、色そのものを渡す。
 */

import { createContext, useContext, useMemo } from "react";
import {
  buildPalette,
  paletteToCssVars,
  resolveBrand,
  type Palette,
} from "@/lib/palette";
import type { SiteConfig } from "@/lib/site-config-schema";

const PaletteContext = createContext<Palette | null>(null);

/** 中の部品から色一式を取り出す */
export function useTplPalette(): Palette {
  const p = useContext(PaletteContext);
  if (!p) {
    // 単体で置かれた時の保険。テンプレートの初期色で描く
    return buildPalette(resolveBrand(null, "warm-craft"));
  }
  return p;
}

/** config から色一式を作る（テンプレートの初期色にフォールバック） */
export function useConfigPalette(config: SiteConfig): Palette {
  const primary = config.style?.brand?.primary;
  const sub1 = config.style?.brand?.sub1;
  const sub2 = config.style?.brand?.sub2;
  const templateId = config.templateId;
  return useMemo(
    () => buildPalette(resolveBrand({ primary: primary ?? "", sub1, sub2 }, templateId)),
    [primary, sub1, sub2, templateId],
  );
}

/** テンプレートのいちばん外側。色の変数を流し込み、中の部品にも同じ色を配る */
export function TplRoot({
  palette,
  className,
  onClick,
  children,
}: {
  palette: Palette;
  className: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children: React.ReactNode;
}) {
  return (
    <PaletteContext.Provider value={palette}>
      <div
        className={className}
        style={paletteToCssVars(palette) as React.CSSProperties}
        onClick={onClick}
      >
        {children}
      </div>
    </PaletteContext.Provider>
  );
}
