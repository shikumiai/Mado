"use client";

/**
 * テンプレートの入口。
 *
 * 顧客の本番サイト・エディタのプレビュー・デモページの3つを、
 * この1本の入口から同じ描き方で出す（描く場所が1つなので見た目がズレない）。
 *
 * 中身は SectionsRenderer が受け持つ。
 * どの業種でも「機能（type）× 見せ方（variant）」の組み合わせで描くので、
 * テンプレートごとの Renderer は要らなくなった。構成と初期色は
 * src/lib/templates/catalog.ts のテンプレート定義にある。
 *
 * templateId は warm-craft / warm-craft-mid / warm-craft-pro のようにプラン付きで
 * 入ってくることがある。プラン差は「見せるセクションの数」で表すので、
 * 系統名（warm-craft）まで丸めて扱う。
 */

import type { SiteConfig } from "@/lib/site-config-schema";
import { getTemplate, toTemplateFamily } from "@/lib/templates/catalog";
import SectionsRenderer from "./SectionsRenderer";

type RendererProps = {
  config: SiteConfig;
  editMode?: boolean;
  onFieldClick?: (fieldId: string, currentValue: string, fieldType: "text" | "image") => void;
  changedFields?: Set<string>;
};

export { toTemplateFamily };

/** その templateId に対応するテンプレート定義があるか */
export function hasRenderer(templateId: string): boolean {
  return getTemplate(templateId) !== null;
}

export default function TemplateRenderer({
  templateId,
  config,
  ...rest
}: RendererProps & { templateId: string }) {
  if (!hasRenderer(templateId)) {
    return (
      <div style={{ padding: 48, textAlign: "center", fontFamily: "sans-serif", color: "#8B7D6B" }}>
        <p style={{ fontSize: 15, marginBottom: 8 }}>このテンプレートはまだ表示できません。</p>
        <p style={{ fontSize: 12 }}>template: {templateId}</p>
      </div>
    );
  }

  // config の templateId が空・古いときも、渡された id で描けるようにそろえる
  const shown: SiteConfig =
    config.templateId === templateId ? config : { ...config, templateId };

  return <SectionsRenderer config={shown} {...rest} />;
}
