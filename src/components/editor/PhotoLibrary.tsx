"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Camera, Check, ImagePlus, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui";
import { customerSiteUrl } from "@/lib/resolve-site";
import { loadSiteForEdit, saveSiteConfig, uploadSiteImage, type LoadResult } from "@/lib/site-editor";
import { isSamplePhoto, photoSlots, replacePhoto, type PhotoSlot } from "@/lib/editor/photo-slots";
import { preparePhoto } from "@/lib/editor/prepare-photo";

type LoadedSite = Extract<LoadResult, { ok: true }>;
export type PhotoOperations = {
  load: typeof loadSiteForEdit;
  upload: typeof uploadSiteImage;
  save: typeof saveSiteConfig;
};
const operations: PhotoOperations = { load: loadSiteForEdit, upload: uploadSiteImage, save: saveSiteConfig };
type Pending = { slot: PhotoSlot; file: File; preview: string; uploadedUrl?: string };
type Phase = "idle" | "preparing" | "uploading" | "saving" | "reloading";
const PHASE_TEXT: Record<Phase, string> = {
  idle: "写真を押して、端末から選ぶだけ。",
  preparing: "写真の大きさを整えています…",
  uploading: "写真を送っています…",
  saving: "サイトに反映しています…",
  reloading: "最新の写真を読み込んでいます…",
};

export function PhotoLibrary({ initial }: { initial: LoadedSite }) {
  return <PhotoLibraryView initial={initial} operations={operations} />;
}

/** 操作の境界を分け、通信失敗や競合も本番DBを書き換えずに検証する。 */
export function PhotoLibraryView({ initial, operations }: { initial: LoadedSite; operations: PhotoOperations }) {
  const router = useRouter();
  const [site, setSite] = useState(initial);
  const [phase, setPhase] = useState<Phase>("idle");
  const [pending, setPending] = useState<Pending | null>(null);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [savedPath, setSavedPath] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [onlySamples, setOnlySamples] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const selection = useRef<PhotoSlot | null>(null);
  const busy = useRef(false);
  const objectUrl = useRef<string | null>(null);
  const slots = useMemo(() => photoSlots(site.config), [site.config]);
  const remaining = slots.filter((s) => !s.src || isSamplePhoto(s.src)).length;
  const shown = slots.filter((s) => !onlySamples || !s.src || isSamplePhoto(s.src) || pending?.slot.path === s.path);
  const groups = [...new Set(shown.map((s) => s.group))];
  const locked = phase !== "idle" || pending !== null || conflict;

  useEffect(() => () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
  }, []);

  // 保存前にヘッダー・ブラウザから離れて、選んだ写真が失われることを防ぐ。
  useEffect(() => {
    if (!locked) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    const onClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (link && !window.confirm("まだ保存できていない写真があります。この画面を離れますか？")) {
        event.preventDefault(); event.stopPropagation();
      }
    };
    const onSubmit = (event: SubmitEvent) => {
      if (!window.confirm("まだ保存できていない写真があります。この画面を離れますか？")) event.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, [locked]);

  function clearPending() {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
    setPending(null);
  }

  function pick(slot: PhotoSlot) {
    if (busy.current || locked) return;
    selection.current = slot;
    input.current?.click();
  }

  async function save(chosen: Pending) {
    if (busy.current || conflict) return;
    busy.current = true;
    setError("");
    setSavedPath("");
    try {
      let url = chosen.uploadedUrl;
      if (!url) {
        setPhase("uploading");
        const form = new FormData();
        form.append("file", chosen.file);
        const uploaded = await operations.upload(site.siteId, form);
        if (!uploaded.ok) throw new Error(uploaded.message);
        url = uploaded.url;
        chosen = { ...chosen, uploadedUrl: url };
        setPending(chosen);
      }
      setPhase("saving");
      const updated = replacePhoto(site.config, chosen.slot.path, url);
      const result = await operations.save(site.siteId, updated, site.version, `写真を差し替え: ${chosen.slot.label}`);
      if (!result.ok) {
        if (result.reason === "conflict") {
          setConflict(true);
          throw new Error("別の画面で先に更新されています。選んだ写真はこの画面に残っています。最新の内容を確認してから、もう一度選んでください。");
        }
        throw new Error(result.reason === "unauthenticated"
          ? "ログインの有効期限が切れました。ログインし直してから、もう一度写真を選んでください。"
          : result.reason === "forbidden" ? "このアカウントでは保存できません。サイトの所有者にご確認ください。"
          : result.message || "保存できませんでした。通信を確認して、もう一度お試しください。");
      }
      setSite({ ...site, config: updated, version: result.version });
      clearPending();
      setSavedPath(chosen.slot.path);
      setAnnouncement(`${chosen.slot.label}を保存しました。${site.status === "live" ? "公開サイトにも反映しました。" : "下書きに反映しました。"}`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "通信が途切れました。写真は残っています。「もう一度保存」でお試しください。");
    } finally {
      busy.current = false;
      setPhase("idle");
    }
  }

  async function onFile(file: File | undefined) {
    const slot = selection.current;
    if (!file || !slot || busy.current || locked) return;
    busy.current = true;
    setError(""); setAnnouncement(""); setSavedPath(""); setPhase("preparing");
    try {
      const prepared = await preparePhoto(file);
      const preview = URL.createObjectURL(prepared);
      objectUrl.current = preview;
      const chosen = { slot, file: prepared, preview };
      setPending(chosen);
      busy.current = false;
      await save(chosen);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "写真を読み込めませんでした。別の写真でお試しください。");
    } finally {
      busy.current = false;
      setPhase("idle");
    }
  }

  async function reload() {
    if (busy.current) return;
    busy.current = true; setPhase("reloading"); setError("");
    try {
      const latest = await operations.load(site.siteId);
      if (!latest.ok) throw new Error("最新の内容を開けませんでした。ログイン状態と通信をご確認ください。");
      setSite(latest); clearPending(); setConflict(false); setSavedPath("");
      setAnnouncement("最新の内容に更新しました。差し替える写真をもう一度選んでください。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "最新の内容を開けませんでした。もう一度お試しください。");
    } finally { busy.current = false; setPhase("idle"); }
  }

  return (
    <div className="space-y-8">
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="sr-only" tabIndex={-1} aria-label="差し替える写真" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; void onFile(file); }} />
      <header>
        <Link href="/app" className="inline-flex min-h-11 items-center gap-1 text-sm text-ink2 underline-offset-4 hover:underline"><ArrowLeft size={16} aria-hidden />マイページ</Link>
        <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">写真で、あなたのサイトに。</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-ink2">入れ替えたい写真を押して、スマホやパソコンから選んでください。大きさは自動で整え、一枚ずつ保存します。</p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-line py-4">
          <div><p className="text-sm font-medium">{site.orgName || site.slug}</p><p className="mt-1 text-xs text-ink3">{site.status === "live" ? "保存すると公開サイトにも反映されます。" : "保存した写真は下書きに反映されます。"}</p></div>
          {site.status === "live" && <a href={customerSiteUrl(site.slug)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 text-sm underline underline-offset-4">サイトを見る<ArrowUpRight size={16} aria-hidden /></a>}
        </div>
      </header>

      <div className="sticky top-[61px] z-10 -mx-1 rounded-md border border-line bg-bg/95 p-4 shadow-sh1 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">{remaining ? `あと${remaining}枚を、あなたの写真に。` : slots.length ? "すべての写真を入れ替えました。" : "今の構成には写真枠がありません。"}</p>
          <span className="text-xs text-ink3">{slots.length - remaining} / {slots.length}枚</span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface2"><div className="h-full bg-accent" style={{ width: `${slots.length ? ((slots.length - remaining) / slots.length) * 100 : 0}%` }} /></div>
        {!(phase === "idle" && error) && <p role="status" aria-live="polite" className="mt-3 flex items-center gap-2 text-xs leading-5 text-ink2">{phase !== "idle" && <Loader2 size={14} className="shrink-0 animate-spin" aria-hidden />}{phase === "idle" ? announcement || PHASE_TEXT.idle : PHASE_TEXT[phase]}</p>}

      {error && <div role="alert" className="mt-3 space-y-3 border-t border-danger/30 pt-3">
        <p className="text-sm leading-6 text-danger">{error}</p>
        {pending && !conflict && <div className="flex flex-wrap gap-2"><Button onClick={() => void save(pending)} disabled={phase !== "idle"} className="min-h-11">もう一度保存</Button><Button variant="ghost" onClick={() => { clearPending(); setError(""); }} disabled={phase !== "idle"} className="min-h-11">選び直す</Button></div>}
        {conflict && <Button variant="secondary" onClick={() => void reload()} loading={phase === "reloading"} className="min-h-11 h-auto whitespace-normal py-2">選んだ写真を取り消して、最新を読み込む</Button>}
      </div>}
      </div>

      {slots.length > 0 && <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={onlySamples} onChange={(event) => setOnlySamples(event.target.checked)} className="size-5 accent-accent" />見本・未設定の写真だけ見る</label>}
      {groups.map((group) => <section key={group} className="space-y-4">
        <h2 className="font-serif text-xl">{group}</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6">
          {shown.filter((slot) => slot.group === group).map((slot) => {
            const staged = pending?.slot.path === slot.path;
            const src = staged ? pending.preview : slot.src;
            const sample = isSamplePhoto(slot.src);
            return <article key={slot.path} className={slot.kind === "hero" ? "col-span-2" : "min-w-0"}>
              <button type="button" onClick={() => pick(slot)} disabled={locked} aria-label={`${slot.label}を入れ替える`} className={`group relative block w-full overflow-hidden rounded-lg border border-line bg-surface2 outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait ${slot.kind === "portrait" ? "aspect-[4/5]" : "aspect-[3/2]"}`}>
                <PhotoThumb key={src} src={src} />
                <span className="absolute bottom-3 right-3 flex min-h-11 items-center gap-2 rounded-md bg-bg px-3 text-sm text-ink shadow-sh1"><Camera size={18} aria-hidden /><span>{staged ? "保存前" : "入れ替える"}</span></span>
                {staged && phase !== "idle" && <span className="absolute inset-0 grid place-items-center bg-bg/40"><Loader2 className="size-8 animate-spin" aria-hidden /></span>}
              </button>
              <div className="mt-3 flex items-start justify-between gap-2"><h3 className="min-w-0 break-words text-sm font-medium leading-6">{slot.label}</h3><span className={`shrink-0 rounded px-2 py-1 text-xs ${staged ? "bg-accent-soft text-ink" : sample || !src ? "bg-surface2 text-ink2" : "bg-success/10 text-success"}`}>{staged ? "保存前" : savedPath === slot.path ? <span className="inline-flex items-center gap-1"><Check size={12} aria-hidden />保存済み</span> : sample ? "見本" : src ? "差し替え済み" : "未設定"}</span></div>
              {slot.locations.length > 1 && <p className="mt-1 text-xs leading-5 text-ink3">{slot.locations.join("・")}で共通の写真です。</p>}
            </article>;
          })}
        </div>
      </section>)}
      {!shown.length && <div className="rounded-lg border border-dashed border-line p-8 text-center"><ImagePlus className="mx-auto mb-3 text-accent" aria-hidden /><p className="text-sm leading-6 text-ink2">{slots.length ? "見本・未設定の写真はありません。チェックを外すと、入れ替えた写真を確認できます。" : "「ページを編集する」から、写真を使う部品を追加できます。"}</p></div>}
      <footer className="space-y-4 border-t border-line pt-6">
        <p className="text-xs leading-6 text-ink3">「見本」はテンプレートのサンプル画像です。表示中の構成に使われる写真を並べています。写真の切り抜き方や構成を変える場合は、編集画面から調整できます。</p>
        <Link href={`/app/sites/${site.siteId}/editor`} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line px-4 text-sm hover:bg-surface2"><RotateCcw size={16} aria-hidden />ページを編集する</Link>
      </footer>
    </div>
  );
}

function PhotoThumb({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <span className="absolute inset-0 grid place-content-center gap-2 text-sm text-ink3"><ImagePlus className="mx-auto" size={32} aria-hidden />{failed ? "写真を選び直す" : "写真を選ぶ"}</span>;
  // 可変のStorage URLと端末内プレビューを表示する。
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" className="size-full object-cover" onError={() => setFailed(true)} />;
}
