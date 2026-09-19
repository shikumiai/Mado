"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { saveSiteConfig, type SaveResult } from "@/lib/site-editor";
import type { SiteConfig } from "@/lib/site-config-schema";
import { AI_COST, AI_RESET_NOTE, AI_SOURCE_LIMIT, type AiBalance, type AiKind } from "@/lib/ai/policy";
import { applyAiSuggestions, COMPANY_BRIEF, type AiSuggestion } from "@/lib/ai/content";

export interface AiResponse { suggestions?: AiSuggestion[]; version?: number; balance?: AiBalance | null; error?: string; code?: string; available?: boolean }
export interface AiOperations {
  balance(siteId: string): Promise<AiResponse>;
  generate(input: { siteId: string; requestId: string; version: number; kind: AiKind; source: string }): Promise<AiResponse>;
  save(siteId: string, config: SiteConfig, version: number, note: string): Promise<SaveResult>;
}
const operations: AiOperations = {
  balance: async (siteId) => (await fetch(`/api/ai-edit?siteId=${encodeURIComponent(siteId)}`)).json(),
  generate: async (input) => (await fetch("/api/ai-edit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) })).json(),
  save: saveSiteConfig,
};

export function AiEditor({ siteId, config, version, hasUnsavedChanges, onSaved, onSavingChange, onConflict, api = operations }: {
  siteId: string; config: SiteConfig; version: number; hasUnsavedChanges: boolean;
  onSaved(config: SiteConfig, version: number): void; onSavingChange?(saving: boolean): void; onConflict?(): void; api?: AiOperations;
}) {
  const [kind, setKind] = useState<AiKind>("company");
  const [source, setSource] = useState("");
  const [balance, setBalance] = useState<AiBalance | null>(null);
  const [available, setAvailable] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [proposal, setProposal] = useState<{ suggestions: AiSuggestion[]; version: number } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const request = useRef<{ key: string; id: string } | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    let alive = true;
    api.balance(siteId).then(data => {
      if (!alive) return;
      setBalance(data.balance ?? null); setAvailable(data.available === true); setError(data.error ?? "");
    }).catch(() => { if (alive) setError("利用枠を読み込めませんでした。画面を開き直してください。"); });
    return () => { alive = false; };
  }, [siteId, api]);

  async function generate() {
    if (inFlight.current || hasUnsavedChanges) return;
    inFlight.current = true; setBusy(true); setError(""); setDone(false);
    const key = JSON.stringify({ kind, source, version });
    if (request.current?.key !== key) request.current = { key, id: crypto.randomUUID() };
    try {
      const data = await api.generate({ siteId, kind, source, version, requestId: request.current.id });
      if (data.balance) setBalance(data.balance);
      if (data.error || !data.suggestions?.length || data.version !== version) {
        setError(data.error ?? "変更案を受け取れませんでした。");
        if (data.code === "failed") request.current = null;
        return;
      }
      setProposal({ suggestions: data.suggestions, version: data.version });
      setSelected(new Set(data.suggestions.map(s => s.path)));
    } catch { setError("通信が途切れました。同じ内容で結果を確認できます。二重には生成しません。"); }
    finally { inFlight.current = false; setBusy(false); }
  }

  async function apply() {
    if (!proposal || hasUnsavedChanges || conflict || inFlight.current) return;
    inFlight.current = true; setSaving(true); onSavingChange?.(true); setError("");
    try {
      if (proposal.version !== version) { setConflict(true); setError("サイトが更新されています。最新の内容を読み込んでください。"); return; }
      const updated = applyAiSuggestions(config, proposal.suggestions.filter(s => selected.has(s.path)));
      const result = await api.save(siteId, updated, proposal.version, "会社情報のAI提案を確認して反映");
      if (!result.ok) {
        if (result.reason === "conflict") { setConflict(true); onConflict?.(); }
        setError(result.reason === "conflict" ? "別の画面で保存されています。案は残しています。エディタで最新の内容を読み込んでください。" : "保存できませんでした。案は残しています。追加クレジットなしで保存を再試行できます。");
        return;
      }
      setDone(true); setProposal(null); request.current = null; onSaved(updated, result.version);
    } catch { setError("保存を確認できませんでした。案は残しています。再試行で追加クレジットは消費しません。"); }
    finally { inFlight.current = false; setSaving(false); onSavingChange?.(false); }
  }

  const cost = AI_COST[kind];
  // A request with an unknown response can be fetched again even if its reservation used the last credits.
  const recovering = request.current?.key === JSON.stringify({ kind, source, version });
  const enough = balance && balance.remaining >= cost && balance.budgetRemaining >= cost;
  return <div className="flex flex-col gap-5">
    <header>
      <p className="text-xs font-semibold text-accent">会社情報から、あなたのサイトへ</p>
      <h2 className="mt-2 font-serif text-2xl">AIで内容を整える</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink2">会社案内や要件メモを貼り付けてください。変更前・変更後と入力の根拠を確かめ、選んだ文章だけ反映できます。</p>
    </header>
    <Card className="text-sm">
      <p className="font-semibold">{balance ? `今月の残り ${balance.remaining} / ${balance.limit} クレジット` : "利用枠を確認中…"}</p>
      {balance && <p className="mt-1 text-xs text-ink2">次回更新：{new Date(balance.resetsAt).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}</p>}
      <p className="mt-2 text-xs leading-relaxed text-ink2">{AI_RESET_NOTE}</p>
      {balance?.limit === 0 && <Link href="/app/billing" className="mt-3 inline-block underline">有料プランを確認する</Link>}
    </Card>
    {hasUnsavedChanges && <p role="status" className="rounded-lg bg-warn/10 p-3 text-sm">先に編集中の内容を保存してください。</p>}
    {done && <p role="status" className="rounded-lg bg-accent-soft p-3 text-sm">選んだ内容をサイトに反映しました。</p>}
    {error && <p role="alert" className="rounded-lg border border-danger/30 bg-surface p-3 text-sm text-danger">{error}</p>}
    {!proposal ? <>
      <fieldset disabled={busy} className="flex flex-wrap gap-3">
        <legend className="mb-2 text-sm font-semibold">何を整えますか？</legend>
        {([ ["company", "会社情報をまとめて反映", 5], ["text", "紹介文・キャッチコピーの修正", 1] ] as const).map(([value, label, credits]) => <label key={value} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line p-3 text-sm"><input type="radio" name="ai-kind" value={value} checked={kind === value} onChange={() => setKind(value)} />{label}（{credits}）</label>)}
      </fieldset>
      <div>
        <label htmlFor="company-brief" className="text-sm font-semibold">会社情報・変更したい内容</label>
        <textarea id="company-brief" rows={9} value={source} maxLength={AI_SOURCE_LIMIT[kind]} disabled={busy} onChange={e => setSource(e.target.value)} placeholder={COMPANY_BRIEF} className="mt-2 w-full rounded-lg border border-line bg-surface p-3 text-sm leading-relaxed text-ink focus-visible:outline-accent" />
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-ink2"><span>{source.length} / {AI_SOURCE_LIMIT[kind]} 文字</span><Button variant="ghost" size="sm" disabled={busy || Boolean(source)} onClick={() => setSource(COMPANY_BRIEF)}>入力ひな形を入れる</Button></div>
        <p className="mt-2 text-xs leading-relaxed text-ink2">未確認の数字や実績は空欄で構いません。資料は文章作成のためOpenAIに送信します。提案にない項目、写真、色、部品の配置は保持します。</p>
      </div>
      <div className="sticky bottom-0 rounded-lg border border-line bg-surface p-3 shadow-sh1">
        <p className="mb-2 text-xs text-ink2">変更案の生成で{cost}クレジット。保存では消費しません。生成失敗時は返却します。</p>
        <Button variant="cta" block loading={busy} disabled={!available || hasUnsavedChanges || source.trim().length < 10 || source.length > AI_SOURCE_LIMIT[kind] || (!enough && !recovering)} onClick={generate}>{recovering ? "同じ内容の結果を確認する" : `変更案を作る（${cost}クレジット）`}</Button>
        {!available && balance && <p className="mt-2 text-xs text-ink2">AIの準備が整い次第、ご利用いただけます。</p>}
      </div>
    </> : <>
      <p className="text-sm text-ink2">反映する項目にチェックを入れてください。事実が正しいか、引用した入力情報とあわせて確認してください。</p>
      {proposal.suggestions.map(s => <Card key={s.path} className="flex flex-col gap-3">
        <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={selected.has(s.path)} disabled={saving} onChange={() => setSelected(previous => { const next = new Set(previous); if (next.has(s.path)) next.delete(s.path); else next.add(s.path); return next; })} />{s.label}</label>
        <div className="grid gap-3 sm:grid-cols-2"><div><p className="text-xs text-ink2">変更前</p><p className="mt-1 whitespace-pre-wrap break-words text-sm">{s.before || "未設定"}</p></div><div className="rounded-lg bg-accent-soft p-3"><p className="text-xs text-ink2">変更後</p><p className="mt-1 whitespace-pre-wrap break-words text-sm">{s.after}</p></div></div>
        <p className="border-t border-line pt-2 text-xs text-ink2">入力の根拠：{s.evidence}</p>
      </Card>)}
      <div className="sticky bottom-0 flex flex-wrap gap-2 rounded-lg border border-line bg-surface p-3 shadow-sh1"><Button variant="ghost" disabled={saving} onClick={() => { setProposal(null); request.current = null; }}>入力に戻る</Button><Button variant="cta" loading={saving} disabled={!selected.size || conflict || hasUnsavedChanges} onClick={apply}>選んだ{selected.size}項目を反映する</Button></div>
    </>}
  </div>;
}
