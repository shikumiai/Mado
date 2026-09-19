import type { Section, SectionType, SiteConfig } from "@/lib/site-config-schema";
import { sectionHasContent } from "@/components/sections/data";
import { defaultSectionsFor, findSectionDef, planAllows, LEGACY_SECTIONS as LEGACY } from "./catalog";

/** 実際に描く1つ。orderIndex は config.sections の何番目か（編集の宛先に使う） */
export interface Resolved {
  key: string;
  type: SectionType;
  variant?: string;
  anchor: string;
  label: string;
  data?: Record<string, unknown>;
  orderIndex: number;
}

export function resolveSections(config: SiteConfig, includeEmpty: boolean): Resolved[] {
  const templateId = config.templateId;
  const plan = config.plan;
  const written = config.sections ?? null;
  const list: Section[] = written ?? defaultSectionsFor(templateId, plan);

  const out: Resolved[] = [];
  const used = new Set<string>();

  list.forEach((s, orderIndex) => {
    if (s.visible === false) return;

    const def = findSectionDef(templateId, s);
    // 上位プランでしか出さない機能は、そのプランに満たなければ描かない
    if (!planAllows(plan, def?.plan)) return;

    const legacy = LEGACY[s.type];
    const type = (legacy?.type ?? s.type) as SectionType;
    const variant = s.variant ?? legacy?.variant ?? def?.variant;

    // アンカーは重複させない（同じ機能を2つ置く業種があるため）
    let anchor = s.id || def?.id || type;
    if (used.has(anchor)) anchor = `${anchor}-${orderIndex + 1}`;
    while (used.has(anchor)) anchor += "-extra";
    used.add(anchor);
    if (!includeEmpty && !sectionHasContent(config, type, variant, s.data)) return;

    out.push({
      key: `${type}-${anchor}`,
      type,
      variant,
      anchor,
      label: s.label || def?.label || type,
      data: s.data,
      orderIndex,
    });
  });

  return out;
}
