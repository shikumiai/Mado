"use client";

/**
 * テンプレートの振り分け。
 *
 * 顧客の本番サイト・エディタのプレビュー・デモページの3つを、
 * この1本の入口から同じ Renderer で描く。
 * 描く場所が1つになるので、見た目がズレる余地が無くなる。
 *
 * templateId は warm-craft / warm-craft-mid / warm-craft-pro のように
 * プラン付きで入ってくる。プラン差は「見せるセクションの数」で表すので、
 * ここでは系統（warm-craft / trust-navy / clean-arch）まで丸めて選ぶ。
 */

import type { SiteConfig } from "@/lib/site-config-schema";
import WarmCraftRenderer from "./WarmCraftRenderer";
import CleanArchRenderer from "./CleanArchRenderer";
import TrustNavyRenderer from "./TrustNavyRenderer";

type RendererProps = {
  config: SiteConfig;
  editMode?: boolean;
  onFieldClick?: (fieldId: string, currentValue: string, fieldType: "text" | "image") => void;
  changedFields?: Set<string>;
};

const RENDERERS: Record<string, React.ComponentType<RendererProps>> = {
  "warm-craft": WarmCraftRenderer,
  "clean-arch": CleanArchRenderer,
  "trust-navy": TrustNavyRenderer,
};

/** warm-craft-pro → warm-craft のように系統名へ丸める */
export function toTemplateFamily(templateId: string): string {
  return (templateId || "warm-craft").replace(/-(?:mid|pro)$/, "");
}

/** その templateId に対応する Renderer があるか */
export function hasRenderer(templateId: string): boolean {
  return Boolean(RENDERERS[toTemplateFamily(templateId)]);
}

export default function TemplateRenderer({
  templateId,
  ...rest
}: RendererProps & { templateId: string }) {
  const Renderer = RENDERERS[toTemplateFamily(templateId)];

  if (!Renderer) {
    return (
      <div style={{ padding: 48, textAlign: "center", fontFamily: "sans-serif", color: "#8B7D6B" }}>
        <p style={{ fontSize: 15, marginBottom: 8 }}>このテンプレートはまだ表示できません。</p>
        <p style={{ fontSize: 12 }}>template: {templateId}</p>
      </div>
    );
  }

  return <Renderer {...rest} />;
}
