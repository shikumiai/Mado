/**
 * 「この構成」— そのテンプレートに並ぶ機能の一覧。
 *
 * 申し込み画面で、選んだ業種のサイトに何が載るのかを先に見せるためのもの。
 * ★ はその商売で欠かせない機能。プランが足りない機能は錠を付けて、
 * どのプランで増えるかを書く（買わせるためでなく、差が分かるように）。
 *
 * 中身は src/lib/templates/catalog.ts だけを見る。
 * 部品そのもの（70個）は読み込まないので、申し込み画面が重くならない。
 */

import { Lock, Star } from "lucide-react";
import { PLAN_LABELS, type Plan } from "@/lib/stripe";
import { getTemplateOrDefault, planAllows } from "@/lib/templates/catalog";

export default function StructureList({
  templateId,
  plan,
  className = "",
}: {
  templateId: string;
  plan: Plan;
  className?: string;
}) {
  const template = getTemplateOrDefault(templateId);
  const shown = template.sections.filter((s) => planAllows(plan, s.plan));
  const locked = template.sections.filter((s) => !planAllows(plan, s.plan));

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-ink">この構成</h3>
        <span className="tnum text-xs text-ink3">{shown.length} ブロック</span>
      </div>
      <p className="mt-1 text-xs text-ink3">
        上から順にこの並びでページになります。あとから並べ替え・非表示にできます。
      </p>

      <ol className="mt-3 flex flex-col">
        {shown.map((s, i) => (
          <li
            key={`${s.type}-${s.id}`}
            className="flex items-center gap-2.5 border-b border-line py-2 last:border-b-0"
          >
            <span className="tnum w-5 shrink-0 text-[11px] text-ink3">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-ink">{s.label}</span>
            {s.required && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-ink">
                <Star className="size-2.5 text-accent" aria-hidden fill="currentColor" />
                必須
              </span>
            )}
          </li>
        ))}
      </ol>

      {locked.length > 0 && (
        <div className="mt-3 rounded-lg bg-surface2 px-3 py-2.5">
          <p className="text-[11px] font-medium text-ink2">上のプランで増えるもの</p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {locked.map((s) => (
              <li key={`${s.type}-${s.id}`} className="flex items-center gap-2 text-xs text-ink3">
                <Lock className="size-3 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{s.label}</span>
                <span className="shrink-0">{PLAN_LABELS[s.plan as Plan]}以上</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
