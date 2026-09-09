"use client";

/**
 * 見せ方の縮小プレビュー。
 *
 * 絵や説明文で見せるのではなく、公開サイトと同じ部品をそのまま小さく描く。
 * 色はお客さんの色（TplRoot が --tpl-* を配る）、中身はその業種の手本なので、
 * 「押したら何が出るか」が見たままになる。
 *
 * iframe は使わない。中の部品にはさわれないようにして（inert）、
 * 外側のボタンが押されるようにする。
 */

import { useEffect, useRef, useState } from "react";
import { getSection } from "@/components/sections";
import { TplRoot } from "@/components/template-renderers/TplPalette";
import type { Palette } from "@/lib/palette";
import type { SiteConfig } from "@/lib/site-config-schema";

/** 描くときの横幅。この幅で描いて、枠に合わせて縮める */
const CANVAS_WIDTH = 1200;

/**
 * 部品を1つ描く。
 * アンカー（id）は渡さない。本物のプレビューと同じ id を作らないため。
 */
function draw(
  type: string,
  variant: string,
  config: SiteConfig,
  palette: Palette,
  data?: Record<string, unknown>,
) {
  const Component = getSection(type, variant);
  if (!Component) return null;
  return (
    <TplRoot palette={palette} className="mado-site">
      <Component config={config} data={data} />
    </TplRoot>
  );
}

export default function SectionMiniPreview({
  config,
  palette,
  type,
  variant,
  data,
  height = 200,
}: {
  config: SiteConfig;
  palette: Palette;
  type: string;
  variant: string;
  /** 手本の中身 */
  data?: Record<string, unknown>;
  height?: number;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  // 枠の幅に合わせて縮める。幅が変わったら測り直す
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(w / CANVAS_WIDTH);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={boxRef}
      aria-hidden
      className="relative overflow-hidden bg-surface2"
      style={{ height }}
    >
      <div
        // 中の文字やボタンにはさわらせない（押されるのは外側のボタン）
        inert
        style={{
          width: CANVAS_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {draw(type, variant, config, palette, data)}
      </div>
    </div>
  );
}
