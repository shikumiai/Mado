"use client";

import { useId, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { SiteConfig } from "@/lib/site-config-schema";
import { Button, Field } from "@/components/ui";
import { COMPANY_FIELDS, contentPatches, fieldsForSection, isContentUrl, sectionContent, resetSectionContent, type ContentField, type ContentPatch } from "@/lib/editor/content-fields";
import { starterSectionData } from "@/lib/templates/starter-content";

function defaults(fields: ContentField[]): Record<string, unknown> {
  return Object.fromEntries(fields.map((f) => [f.key, f.item ? [] : f.fields ? defaults(f.fields) : f.kind === "boolean" ? false : f.kind === "number" ? 0 : ""]));
}
function invalid(fields: ContentField[], value: Record<string, unknown>): string | null {
  for (const f of fields) {
    const v = value[f.key];
    if (v === undefined) continue;
    if (f.item && Array.isArray(v) && Array.isArray(f.item)) {
      for (const item of v) { const error = invalid(f.item, item as Record<string, unknown>); if (error) return error; }
    } else if (f.fields && v && typeof v === "object") {
      const error = invalid(f.fields, v as Record<string, unknown>); if (error) return error;
    } else if ((f.kind === "url" || f.kind === "image") && typeof v === "string" && !isContentUrl(v, f.kind === "image")) {
      return `${f.label}には https:// から始まるURL、サイト内の / または # から始まるリンクを入力してください。`;
    } else if (f.kind === "number" && (typeof v !== "number" || !Number.isFinite(v) || v < 0 || (f.key === "rating" && v > 5))) {
      return `${f.label}を正しい数値で入力してください。`;
    }
  }
  return null;
}

function ContentInput({ field, value, onChange }: { field: ContentField; value: unknown; onChange: (value: unknown) => void }) {
  const uid = useId();
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  // Legacy fields such as targetAudience may contain either a string or an array.
  const item = field.item ?? (Array.isArray(value) ? "text" : undefined);
  if (item) {
    const items = Array.isArray(value) ? value : [];
    return <fieldset className="min-w-0 space-y-3 rounded-xl border border-line p-3">
      <legend className="px-1 text-sm font-bold">{field.label} <span className="font-normal text-ink3">{items.length}件</span></legend>
      {items.map((entry, i) => <div key={i} className="space-y-3 rounded-lg bg-surface2 p-3">
        <div className="flex items-center justify-between gap-2"><span className="text-xs font-bold">{field.label} {i + 1}</span><div className="flex gap-1">
          {[[-1, ArrowUp, "上へ"], [1, ArrowDown, "下へ"]].map(([d, Icon, title]) => {
            const delta = d as number; const I = Icon as typeof ArrowUp;
            return <button type="button" key={delta} aria-label={`${field.label} ${i + 1}を${title}`} disabled={i + delta < 0 || i + delta >= items.length} className="rounded p-2 hover:bg-surface disabled:opacity-25" onClick={() => { const next = [...items]; [next[i], next[i + delta]] = [next[i + delta], next[i]]; onChange(next); }}><I size={16} /></button>;
          })}
          <button type="button" aria-label={`${field.label} ${i + 1}を削除`} className="rounded p-2 text-danger hover:bg-surface" onClick={() => onChange(items.filter((_, n) => n !== i))}><Trash2 size={16} /></button>
        </div></div>
        {item === "text" ? <Field label={`${field.label} ${i + 1}の内容`} value={typeof entry === "string" ? entry : ""} onChange={(e) => onChange(items.map((old, n) => n === i ? e.target.value : old))} /> : <Fields fields={item} value={(entry ?? {}) as Record<string, unknown>} onChange={(next) => onChange(items.map((old, n) => n === i ? next : old))} />}
      </div>)}
      <Button size="sm" variant="secondary" leftIcon={<Plus size={15} />} onClick={() => {
        if (item === "text") { onChange([...items, ""]); return; }
        const entry = defaults(item);
        if (field.key === "items") {
          entry.id = Math.max(0, ...items.map((x) => typeof x?.id === "number" ? x.id : 0)) + 1;
          if ("step" in entry) entry.step = items.length + 1;
        }
        onChange([...items, entry]);
      }}>{field.label}を追加</Button>
    </fieldset>;
  }
  if (field.fields) return <fieldset className="min-w-0 space-y-3 rounded-xl border border-line p-3"><legend className="px-1 text-sm font-bold">{field.label}</legend><Fields fields={field.fields} value={(value && typeof value === "object" ? value : {}) as Record<string, unknown>} onChange={onChange} /></fieldset>;
  if (field.kind === "boolean") return <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} />{field.label}</label>;
  if (field.kind === "image") return <div className="space-y-2">
    <Field label={`${field.label}のURL`} value={typeof value === "string" && !value.startsWith("data:") ? value : ""} placeholder="https://… または /images/…" onChange={(e) => onChange(e.target.value)} />
    {typeof value === "string" && value && isContentUrl(value, true) && <img src={value} alt={`${field.label}のプレビュー`} className="h-28 w-full rounded-lg object-cover" /> /* eslint-disable-line @next/next/no-img-element */}
    <label htmlFor={uid} className="block text-xs text-ink2">{reading ? "読み込み中…" : "端末から写真を選ぶ"}</label>
    <input id={uid} type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={reading} className="block w-full text-xs" onChange={async (e) => {
      const file = e.target.files?.[0]; if (!file) return; setError("");
      if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type) || file.size > 3 * 1024 * 1024) { setError("3MB以下のJPEG・PNG・WebP・GIFを選んでください。"); return; }
      setReading(true);
      try { const url = await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = reject; r.readAsDataURL(file); }); onChange(url); }
      catch { setError("写真を読み込めませんでした。"); } finally { setReading(false); }
    }} />
    {error && <p role="alert" className="text-xs text-danger">{error}</p>}
    <Button size="sm" variant="ghost" onClick={() => onChange("")}>写真を外す</Button>
  </div>;
  return <Field label={field.label} multiline={field.kind === "long"} type={field.kind === "number" ? "number" : "text"} value={typeof value === "number" || typeof value === "string" ? value : ""} onChange={(e) => onChange(field.kind === "number" ? (e.target.value === "" ? undefined : Number(e.target.value)) : e.target.value)} />;
}
function Fields({ fields, value, onChange }: { fields: ContentField[]; value: Record<string, unknown>; onChange: (value: Record<string, unknown>) => void }) {
  return <div className="space-y-4">{fields.map((field) => <ContentInput key={field.key} field={field} value={value[field.key]} onChange={(v) => onChange({ ...value, [field.key]: v })} />)}</div>;
}

export default function ContentEditor({ config, index, onApply }: { config: SiteConfig; index: number | null; onApply: (patches: ContentPatch[]) => void }) {
  const [before] = useState<Record<string, unknown>>(() => structuredClone(index === null ? { ...config.company } : sectionContent(config, index)));
  const [draft, setDraft] = useState(before);
  const [error, setError] = useState("");
  const [resetting, setResetting] = useState(false);
  const fields = index === null ? COMPANY_FIELDS : fieldsForSection(config.sections![index].type);
  return <div className="space-y-5">
    <p className="text-xs text-ink2">空欄の項目も追加できます。一覧は並べ替え・追加・削除できます。変更後は「決定」、最後に「反映する」を押してください。</p>
    {fields.some(f => f.key === "rows") && <p className="text-xs text-ink3">案内表の値は会社情報と共通です。項目名や行数を変えると、この部品専用の表になります。</p>}
    <Fields fields={fields} value={draft} onChange={setDraft} />
    {index !== null && <div className="border-t border-line pt-4">
      {!resetting ? <Button size="sm" variant="ghost" onClick={() => setResetting(true)}>この部品を業種のひな形に戻す</Button> : <div className="space-y-2 rounded-lg bg-surface2 p-3"><p className="text-sm">この部品の文章と一覧をひな形に戻します。共通の会社情報と、写真のある項目は残します。決定するまでサイトは変わりません。</p><div className="flex gap-2"><Button size="sm" onClick={() => { const seed = starterSectionData(config.templateId, config.sections![index].type, config.industry); setDraft(resetSectionContent(config, index, draft, seed)); setResetting(false); }}>ひな形に戻す</Button><Button size="sm" variant="ghost" onClick={() => setResetting(false)}>やめる</Button></div></div>}
    </div>}
    {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    <div className="sticky bottom-0 border-t border-line bg-surface py-3"><Button variant="cta" onClick={() => { const e = invalid(fields, draft); setError(e ?? ""); if (!e) onApply(contentPatches(config, index, before, draft)); }}>決定</Button><Button variant="ghost" onClick={() => { setDraft(before); setError(""); }}>入力を元に戻す</Button></div>
  </div>;
}
