"use client";

/**
 * サイト編集画面（新しい住所 /app/sites/[siteId]/editor）。
 *
 * 中身（保存・AI・並び替え・画像・履歴）の挙動は旧エディタ
 * （/member/site/[siteId]/editor）から引き継ぎ、見た目だけ rebuild-v2 の
 * 設計トークン + 共通UI部品（Tabs / Sheet / Button / Field / Toast / Skeleton）へ
 * 差し替えている。保存は DB を1行書き換えるだけなので、その場で即反映される。
 *
 * /app のレイアウト（ヘッダー + 中央寄せ）は編集画面には狭いので、
 * この画面は画面全体を覆う（fixed inset-0）専用の枠として立ち上げる。
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Eye, Pencil, Bot, Smartphone, Monitor, Check, Lock,
  Camera, LayoutList, History, Type as TypeIcon, ArrowLeft,
  Sparkles, RotateCcw, Crop, ExternalLink, Loader2, Palette,
} from "lucide-react";

import type { SiteConfig, Section } from "@/lib/site-config-schema";
import { getSections } from "@/lib/site-config-schema";
import { normalizePlanId, type Plan } from "@/lib/stripe";
import {
  loadSiteForEdit, saveSiteConfig, uploadSiteImage,
  listSiteHistory, getSiteVersion, type HistoryEntry, type LoadResult,
} from "@/lib/site-editor";
import { customerSiteUrl, customerSiteLabel } from "@/lib/resolve-site";
import { resolveFieldTarget } from "@/lib/editor/field-target";
import { buildPalette, resolveBrand, styleWithBrand, COLOR_SETS, normalizeHex } from "@/lib/palette";

import SectionPanel from "@/components/editor/SectionPanel";
import BrandPicker, { PaletteBoard, type BrandChoice } from "@/components/brand/BrandPicker";
import TemplateRenderer from "@/components/template-renderers/TemplateRenderer";
import { Button, Card, Badge, Field, Skeleton, Tabs, Sheet, useToast } from "@/components/ui";

/* ═══════════════════════════════════════
   画像の切り取り（react-easy-crop）
   SSR では動かないので client 専用で読み込む
   ═══════════════════════════════════════ */
type CropArea = { x: number; y: number; width: number; height: number };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Cropper = dynamic(() => import("react-easy-crop"), { ssr: false }) as unknown as React.ComponentType<{
  image: string;
  crop: { x: number; y: number };
  zoom: number;
  aspect: number;
  onCropChange: (c: { x: number; y: number }) => void;
  onZoomChange: (z: number) => void;
  onCropComplete: (area: CropArea, areaPixels: CropArea) => void;
  showGrid?: boolean;
  objectFit?: "contain" | "cover" | "horizontal-cover" | "vertical-cover";
}>;

/* ═══════════════════════════════════════
   フォント
   ═══════════════════════════════════════ */
const FONTS = [
  { id: "gothic", label: "ゴシック体", css: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif" },
  { id: "mincho", label: "明朝体", css: "'Noto Serif JP', 'Hiragino Mincho ProN', serif" },
  { id: "maru", label: "丸ゴシック", css: "'M PLUS Rounded 1c', 'Noto Sans JP', sans-serif" },
  { id: "mono", label: "等幅", css: "'JetBrains Mono', 'Noto Sans JP', monospace" },
  { id: "elegant", label: "エレガント", css: "'Playfair Display', 'Noto Serif JP', serif" },
];

/* ═══════════════════════════════════════
   AI 質問（旧エディタと同じ）
   ═══════════════════════════════════════ */
const AI_QUESTIONS = [
  {
    id: "impression", question: "サイトを見た人に、どんな印象を持ってほしいですか？",
    type: "select" as const,
    options: ["信頼感のある・安心できる", "親しみやすい・話しかけやすい", "洗練された・プロフェッショナル", "力強い・頼れる", "温かみのある・アットホーム", "モダンで先進的"],
    freeInputPlaceholder: "その他（自由に書いてください）",
  },
  {
    id: "strength", question: "一番伝えたいことは何ですか？",
    type: "select" as const,
    options: ["実績の豊富さ（施工件数・年数）", "技術力の高さ（資格・専門性）", "お客様との距離の近さ（丁寧な対応）", "価格の手頃さ（コストパフォーマンス）", "地域に根ざしている安心感", "デザイン力・提案力", "アフターサポートの手厚さ"],
    freeInputPlaceholder: "その他（自由に書いてください）",
  },
  {
    id: "target", question: "どんなお客様に来てほしいですか？",
    type: "select" as const,
    options: ["新築を考えている家族", "リフォーム・リノベーションしたい方", "法人・オフィス・店舗", "初めて家を建てる若い世代", "二世帯住宅を検討中の方", "幅広く、すべてのお客様"],
    freeInputPlaceholder: "その他（自由に書いてください）",
  },
  {
    id: "tone", question: "文章のトーンはどれが近いですか？",
    type: "select" as const,
    options: ["丁寧語で堅すぎない（「〜します」「〜です」）", "少しくだけた親しみやすい口調", "格式のある落ち着いた文体", "簡潔でシンプルに"],
    freeInputPlaceholder: "その他（自由に書いてください）",
  },
  { id: "avoid", question: "避けたい表現や、やめてほしいことはありますか？", type: "text" as const, placeholder: "例: 安さだけをアピールしないでほしい、堅すぎる表現は避けたい" },
  { id: "keywords", question: "サイトに入れたい言葉やこだわりがあれば教えてください", type: "text" as const, placeholder: "例: 地域密着、自然素材、笑顔、家族の安心、手仕事" },
];

const AI_FIELD_LABELS: Record<string, string> = {
  tagline: "キャッチコピー",
  description: "説明文",
  bio: "代表挨拶",
};

/* ═══════════════════════════════════════
   小道具
   ═══════════════════════════════════════ */

/** 設定の入れ子パスに値を書き込む（"company.tagline" など） */
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split(".");
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current) || typeof current[keys[i]] !== "object") current[keys[i]] = {};
    current = current[keys[i]] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

/* ═══════════════════════════════════════
   色（代表カラー＋サブ2）
   ═══════════════════════════════════════ */

/** 色を選ぶ部品の値 → palette に渡す形。代表カラーが無ければ null */
function brandToColors(b: BrandChoice) {
  return b.primary
    ? { primary: b.primary, sub1: b.sub1 ?? undefined, sub2: b.sub2 ?? undefined }
    : null;
}

/** 保存されている色 → 色を選ぶ部品の値（あらかじめ組んである色と一致すればその名前も） */
function brandFromConfig(config: SiteConfig): BrandChoice {
  const primary = normalizeHex(config.style?.brand?.primary);
  const sub1 = normalizeHex(config.style?.brand?.sub1);
  const sub2 = normalizeHex(config.style?.brand?.sub2);
  const set = primary
    ? COLOR_SETS.find((c) => c.primary === primary && c.sub1 === sub1 && c.sub2 === sub2)
    : undefined;
  return { primary, sub1, sub2, setId: set?.id ?? null };
}

/** フィールドのパスを、なるべく分かりやすい日本語ラベルにする（表示用のみ） */
function fieldLabel(path: string): string {
  const last = path.split(".").pop() || path;
  const map: Record<string, string> = {
    tagline: "キャッチコピー", description: "説明文", bio: "代表挨拶",
    name: "会社名", phone: "電話番号", fax: "FAX", email: "メール",
    address: "住所", hours: "営業時間", ceo: "代表者名", ceoTitle: "代表の肩書き",
    title: "タイトル", ceoPhoto: "代表の写真", image: "写真",
  };
  return map[last] || path;
}

/** 画面で選んだ画像（data URL）を Storage に上げて、公開 URL を受け取る */
async function uploadDataUrl(
  siteId: string,
  dataUrl: string
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const ext = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
    const form = new FormData();
    form.append("file", new File([blob], `upload.${ext}`, { type: blob.type }));
    const res = await uploadSiteImage(siteId, form);
    return res.ok ? { ok: true, url: res.url } : { ok: false, message: res.message };
  } catch {
    return { ok: false, message: "画像を送れませんでした" };
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("読み込みに失敗しました"));
    reader.readAsDataURL(blob);
  });
}

function loadImageEl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("画像を開けませんでした"));
    img.src = src;
  });
}

/** 切り取り範囲（元画像のピクセル座標）を canvas で切り出して JPEG Blob にする */
async function getCroppedBlob(src: string, area: CropArea): Promise<Blob> {
  const img = await loadImageEl(src);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(area.width));
  canvas.height = Math.max(1, Math.round(area.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas が使えません");
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("切り取りに失敗しました"))), "image/jpeg", 0.92);
  });
}

/** 画像を軽くして data URL にする（送信前にブラウザ側で圧縮） */
async function compressToDataUrl(blob: Blob): Promise<string> {
  const mod = await import("browser-image-compression");
  const imageCompression = mod.default;
  const file = new File([blob], "image.jpg", { type: blob.type || "image/jpeg" });
  const out = await imageCompression(file, {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 2000,
    useWebWorker: true,
  });
  return blobToDataUrl(out);
}

/* ═══════════════════════════════════════
   画像フィールド（選ぶ → 切り取る → 軽くする → プレビュー）
   ═══════════════════════════════════════ */
const ASPECTS = [
  { label: "横長", value: 16 / 9 },
  { label: "標準", value: 4 / 3 },
  { label: "正方形", value: 1 },
  { label: "縦長", value: 3 / 4 },
];

function ImageField({ initialUrl, onChange }: { initialUrl: string; onChange: (dataUrl: string) => void }) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileSrc, setFileSrc] = useState<string | null>(null);
  const [preview, setPreview] = useState<string>(initialUrl?.startsWith("data:") || /^https?:\/\//.test(initialUrl || "") ? initialUrl : "");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(4 / 3);
  const [croppedPixels, setCroppedPixels] = useState<CropArea | null>(null);
  const [busy, setBusy] = useState(false);

  // アンマウント時に object URL を片付ける
  useEffect(() => {
    return () => {
      if (fileSrc) URL.revokeObjectURL(fileSrc);
    };
  }, [fileSrc]);

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "画像を選んでください", description: "JPEG・PNG・WebP などの画像ファイルに対応しています。", tone: "warn" });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast({ title: "写真が大きすぎます", description: "15MB より小さい写真を選んでください（送る前に自動で軽くします）。", tone: "warn" });
      return;
    }
    if (fileSrc) URL.revokeObjectURL(fileSrc);
    const url = URL.createObjectURL(file);
    setFileSrc(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedPixels(null);
    // 同じファイルを選び直せるように値をリセット
    e.target.value = "";
  }

  async function applyCrop() {
    if (!fileSrc || !croppedPixels) return;
    setBusy(true);
    try {
      const blob = await getCroppedBlob(fileSrc, croppedPixels);
      const dataUrl = await compressToDataUrl(blob);
      onChange(dataUrl);
      setPreview(dataUrl);
      URL.revokeObjectURL(fileSrc);
      setFileSrc(null);
    } catch {
      toast({ title: "写真を用意できませんでした", description: "別の写真でもう一度お試しください。", tone: "danger" });
    } finally {
      setBusy(false);
    }
  }

  async function useWholeImage() {
    if (!fileSrc) return;
    setBusy(true);
    try {
      const blob = await (await fetch(fileSrc)).blob();
      const dataUrl = await compressToDataUrl(blob);
      onChange(dataUrl);
      setPreview(dataUrl);
      URL.revokeObjectURL(fileSrc);
      setFileSrc(null);
    } catch {
      toast({ title: "写真を用意できませんでした", description: "別の写真でもう一度お試しください。", tone: "danger" });
    } finally {
      setBusy(false);
    }
  }

  function cancelCrop() {
    if (fileSrc) URL.revokeObjectURL(fileSrc);
    setFileSrc(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <input ref={fileRef} type="file" accept="image/*" onChange={pickFile} hidden />

      {/* 切り取り中 */}
      {fileSrc ? (
        <div className="flex flex-col gap-3">
          <div className="relative h-64 w-full overflow-hidden rounded-lg bg-surface2">
            <Cropper
              image={fileSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_area, px) => setCroppedPixels(px)}
              showGrid
              objectFit="contain"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 inline-flex items-center gap-1 text-xs text-ink3">
              <Crop className="size-3.5" aria-hidden /> 形
            </span>
            {ASPECTS.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => setAspect(a.value)}
                className={[
                  "rounded-pill px-2.5 py-1 text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
                  Math.abs(aspect - a.value) < 0.001
                    ? "bg-accent-soft text-ink ring-1 ring-accent/50"
                    : "bg-surface2 text-ink2 hover:text-ink",
                ].join(" ")}
              >
                {a.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-ink2">
            <RotateCcw className="size-3.5" aria-hidden />
            大きさ
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1"
              style={{ accentColor: "var(--accent)" }}
              aria-label="拡大・縮小"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="primary" onClick={applyCrop} loading={busy} leftIcon={<Crop className="size-4" aria-hidden />}>
              切り取って使う
            </Button>
            <Button size="sm" variant="secondary" onClick={useWholeImage} disabled={busy}>
              そのまま使う
            </Button>
            <Button size="sm" variant="ghost" onClick={cancelCrop} disabled={busy}>
              やめる
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* いまの写真 or 選び直し */}
          {preview ? (
            <div className="flex flex-col gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="選んだ写真のプレビュー" className="max-h-52 w-full rounded-lg object-cover" />
              <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()} leftIcon={<Camera className="size-4" aria-hidden />}>
                別の写真を選ぶ
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-line bg-surface2 px-4 py-8 text-ink2 outline-none transition hover:border-accent/60 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Camera className="size-6" aria-hidden />
              <span className="text-sm font-medium">写真を選んでください</span>
              <span className="text-xs text-ink3">JPG・PNG・WebP（送る前に自動で軽くします）</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   メイン
   ═══════════════════════════════════════ */
export default function EditorPage() {
  const params = useParams();
  const siteId = String(params?.siteId ?? "");
  const { toast } = useToast();

  // 読み込んだデータ
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [templateId, setTemplateId] = useState<string>("");
  const [plan, setPlan] = useState<Plan>("otameshi");
  const [slug, setSlug] = useState("");
  const [version, setVersion] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsReload, setNeedsReload] = useState(false);

  // セクション（ローカル state・変更は即プレビュー反映）
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionsChanged, setSectionsChanged] = useState(false);
  const [initialSectionsJson, setInitialSectionsJson] = useState("");

  // 色（代表カラー＋サブ2）。変えるとその場で全体が塗り替わる
  const [brand, setBrand] = useState<BrandChoice>({ primary: null, sub1: null, sub2: null, setId: null });
  const [brandChanged, setBrandChanged] = useState(false);
  const [initialBrandJson, setInitialBrandJson] = useState("");

  // 表示の設定
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [device, setDevice] = useState<"mobile" | "desktop">("desktop");

  // モードとパネル
  const [mode, setMode] = useState<"view" | "edit" | "ai">("edit");
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [applying, setApplying] = useState(false);

  // 編集中のフィールド
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [activeFieldValue, setActiveFieldValue] = useState("");
  const [activeFieldType, setActiveFieldType] = useState<"text" | "image">("text");
  const [editText, setEditText] = useState("");
  // 直した項目。path は「設定のどこに書くか」で、直した時点で決めてしまう
  // （あとでセクションを並び替えても宛先がずれない）
  const [changes, setChanges] = useState<
    Map<string, { label: string; oldValue: string; newValue: string; path: string }>
  >(new Map());

  // 履歴
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [restoringVersion, setRestoringVersion] = useState<number | null>(null);

  // AI
  const [aiStep, setAiStep] = useState(0);
  const [aiAnswers, setAiAnswers] = useState<Record<string, string>>({});
  const [aiSuggestions, setAiSuggestions] = useState<{ field: string; before: string; after: string }[]>([]);
  const [aiApplying, setAiApplying] = useState(false);
  const [aiDone, setAiDone] = useState(false);

  const aiLocked = plan === "otameshi";
  const changedFieldSet = new Set(changes.keys());
  const totalChanges = changes.size + (sectionsChanged ? 1 : 0) + (brandChanged ? 1 : 0);

  /* ── 読み込み ───────────────────────── */
  const applyLoaded = useCallback((res: Extract<LoadResult, { ok: true }>) => {
    // 構成は必ず手元に取り出しておく。config に書かれていなくてもテンプレートの既定が入るので、
    // 編集の宛先（sections.2.…）と実際に描かれるサイトの並びが必ず一致する。
    // プランは DB の行が正。config 側が古くても、構成の出し分けはこちらに合わせる
    const loadedPlan = normalizePlanId(res.plan || res.config.plan || "otameshi");
    const initialSections = getSections({ ...res.config, plan: loadedPlan });
    setSiteConfig({ ...res.config, plan: loadedPlan, sections: initialSections });
    setTemplateId(res.templateId || "warm-craft");
    setPlan(loadedPlan);
    setSlug(res.slug);
    setVersion(res.version);
    setSections(initialSections);
    setInitialSectionsJson(JSON.stringify(initialSections));
    const initialBrand = brandFromConfig(res.config);
    setBrand(initialBrand);
    setInitialBrandJson(JSON.stringify(initialBrand));
    // 編集中の状態はまっさらに戻す
    setChanges(new Map());
    setSectionsChanged(false);
    setBrandChanged(false);
    setActiveFieldId(null);
    setNeedsReload(false);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await loadSiteForEdit(siteId);
      if (!alive) return;
      if (!res.ok) {
        setError(
          res.reason === "unauthenticated"
            ? "ログインしてからお試しください。"
            : "このサイトを編集する権限がありません。"
        );
        setLoading(false);
        return;
      }
      applyLoaded(res);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [siteId, applyLoaded]);

  const reload = useCallback(async () => {
    setReloading(true);
    const res = await loadSiteForEdit(siteId);
    setReloading(false);
    if (!res.ok) {
      toast({ title: "読み込めませんでした", description: "時間をおいてもう一度お試しください。", tone: "danger" });
      return;
    }
    applyLoaded(res);
    toast({ title: "最新の内容を読み込みました", tone: "info" });
  }, [siteId, applyLoaded, toast]);

  /* ── パネルの開閉（重ならないように） ── */
  const cancelEdit = useCallback(() => {
    setActiveFieldId(null);
    setEditText("");
  }, []);

  const closePanels = useCallback(() => {
    setSectionsOpen(false);
    setBrandOpen(false);
    setHistoryOpen(false);
    setShowFontMenu(false);
  }, []);

  function switchMode(next: string) {
    if (next === "ai" && aiLocked) {
      toast({
        title: "AI編集はおまかせプラン以上で使えます",
        description: "プランを見直すと、質問に答えるだけで文章を整えられます。",
        tone: "info",
      });
      return;
    }
    cancelEdit();
    closePanels();
    setMode(next as "view" | "edit" | "ai");
  }

  /* ── セクション変更 → 即プレビュー反映 ── */
  const handleSectionsChange = useCallback((newSections: Section[]) => {
    setSections(newSections);
    setSectionsChanged(JSON.stringify(newSections) !== initialSectionsJson);
    if (siteConfig) setSiteConfig({ ...siteConfig, sections: newSections });
  }, [siteConfig, initialSectionsJson]);

  /* ── 色の変更 → 即プレビュー反映 ── */
  const handleBrandChange = useCallback((next: BrandChoice) => {
    setBrand(next);
    setBrandChanged(JSON.stringify(next) !== initialBrandJson);
    if (siteConfig) {
      setSiteConfig({ ...siteConfig, style: styleWithBrand(siteConfig.style, brandToColors(next)) });
    }
  }, [siteConfig, initialBrandJson]);

  /* ── フィールドのクリック → 編集パネル ── */
  const handleFieldClick = useCallback((fieldId: string, currentValue: string, fieldType: "text" | "image") => {
    if (mode !== "edit") return;
    setSectionsOpen(false);
    setBrandOpen(false);
    setHistoryOpen(false);
    setActiveFieldId(fieldId);
    setActiveFieldValue(currentValue);
    setActiveFieldType(fieldType);
    setEditText(changes.get(fieldId)?.newValue || currentValue);
  }, [mode, changes]);

  const confirmEdit = useCallback(() => {
    if (!activeFieldId || !siteConfig) return;
    if (editText !== activeFieldValue) {
      // 保存先はここで決める。一覧の中身は config の一番上の配列（詳細ページが読む側）へ。
      const t = resolveFieldTarget(siteConfig, activeFieldId);
      const stored = t.toStored ? t.toStored(editText) : editText;

      setChanges((prev) => {
        const next = new Map(prev);
        next.set(activeFieldId, {
          label: activeFieldId,
          oldValue: activeFieldValue,
          newValue: stored,
          path: t.path,
        });
        return next;
      });

      // プレビューも同じ場所を書く（映るところと保存するところを1本にする）
      const updated = JSON.parse(JSON.stringify(siteConfig));
      setNestedValue(updated, t.path, stored);
      setSiteConfig(updated);
    }
    setActiveFieldId(null);
    setEditText("");
  }, [activeFieldId, activeFieldValue, editText, siteConfig]);

  /* ── 履歴の取得（保存のたびに更新） ── */
  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    const list = await listSiteHistory(siteId);
    setHistory(list);
    setHistoryLoading(false);
  }, [siteId]);

  /* ── 反映（保存）───────────────────────
     手元の設定に全部の変更を当ててから1回だけ保存する。
     画像は先に Storage へ上げ、返った URL を設定に書く。 */
  const handleApply = useCallback(async () => {
    if (!siteConfig) return;
    setApplying(true);
    try {
      const next: SiteConfig = JSON.parse(JSON.stringify(siteConfig));
      const target = next as unknown as Record<string, unknown>;
      const failed: Array<{ field: string; error: string }> = [];
      let applied = 0;

      for (const c of changes.values()) {
        if (c.newValue.startsWith("data:image/")) {
          const up = await uploadDataUrl(siteId, c.newValue);
          if (!up.ok) {
            failed.push({ field: fieldLabel(c.label), error: up.message });
            continue;
          }
          setNestedValue(target, c.path, up.url);
        } else {
          setNestedValue(target, c.path, c.newValue);
        }
        applied++;
      }

      if (sectionsChanged) {
        next.sections = sections;
        applied++;
      }

      if (brandChanged) {
        // 色は style.brand が正。style.colors も同じ色から作り直して食い違わせない
        next.style = styleWithBrand(next.style, brandToColors(brand));
        applied++;
      }

      const res = await saveSiteConfig(siteId, next, version, "編集画面から保存");

      if (res.ok) {
        setVersion(res.version);
        setSiteConfig(next);
        setChanges(new Map());
        setSectionsChanged(false);
        setInitialSectionsJson(JSON.stringify(getSections(next)));
        const savedBrand = brandFromConfig(next);
        setBrand(savedBrand);
        setInitialBrandJson(JSON.stringify(savedBrand));
        setBrandChanged(false);
        setReviewing(false);
        if (failed.length) {
          toast({
            title: "一部だけ反映しました",
            description: `${applied}件を反映しました。写真 ${failed.length}件はうまく送れませんでした。もう一度お試しください。`,
            tone: "warn",
            duration: 8000,
          });
        } else {
          toast({ title: "反映しました", description: `${applied}件の変更をサイトに反映しました。`, tone: "success" });
        }
        void refreshHistory();
      } else if (res.reason === "conflict") {
        setReviewing(false);
        setNeedsReload(true);
        toast({
          title: "別の画面で先に保存されています",
          description: "上書きを止めました。「最新を読み込む」で読み直してから、もう一度保存してください。",
          tone: "danger",
          duration: 0,
        });
      } else {
        setReviewing(false);
        toast({
          title: "反映できませんでした",
          description: res.reason === "failed" && res.message ? res.message : "時間をおいてもう一度お試しください。",
          tone: "danger",
        });
      }
    } catch {
      setReviewing(false);
      toast({ title: "通信できませんでした", description: "接続を確かめて、もう一度お試しください。", tone: "danger" });
    } finally {
      setApplying(false);
    }
    // refreshHistory / toast は依存に含めない（関数は下で安定）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changes, siteId, version, siteConfig, sectionsChanged, sections, brandChanged, brand]);

  /* ── 履歴 ───────────────────────────── */
  function openHistory() {
    cancelEdit();
    setSectionsOpen(false);
    setShowFontMenu(false);
    setHistoryOpen(true);
    void refreshHistory();
  }

  async function restoreVersion(v: number) {
    setRestoringVersion(v);
    try {
      const cfg = await getSiteVersion(siteId, v);
      if (!cfg) {
        toast({ title: "この履歴を読み込めませんでした", tone: "danger" });
        return;
      }
      const res = await saveSiteConfig(siteId, cfg, version, `v${v} の内容に戻す`);
      if (res.ok) {
        setVersion(res.version);
        setSiteConfig(cfg);
        const s = getSections(cfg);
        setSections(s);
        setInitialSectionsJson(JSON.stringify(s));
        const restoredBrand = brandFromConfig(cfg);
        setBrand(restoredBrand);
        setInitialBrandJson(JSON.stringify(restoredBrand));
        setChanges(new Map());
        setSectionsChanged(false);
        setBrandChanged(false);
        setHistoryOpen(false);
        toast({ title: "元に戻しました", description: `v${v} の内容をサイトに反映しました。`, tone: "success" });
        void refreshHistory();
      } else if (res.reason === "conflict") {
        setNeedsReload(true);
        toast({
          title: "別の画面で先に保存されています",
          description: "「最新を読み込む」で読み直してから、もう一度お試しください。",
          tone: "danger",
          duration: 0,
        });
      } else {
        toast({ title: "戻せませんでした", description: "時間をおいてもう一度お試しください。", tone: "danger" });
      }
    } finally {
      setRestoringVersion(null);
    }
  }

  /* ── AI ─────────────────────────────── */
  const handleAiGenerate = useCallback(async () => {
    setAiStep(AI_QUESTIONS.length + 1);
    try {
      const res = await fetch("/api/ai-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: Object.entries(aiAnswers).map(([questionId, answer]) => ({ questionId, answer })),
          currentConfig: siteConfig,
          editTarget: "full",
        }),
      });
      const data = await res.json();
      setAiSuggestions(data.suggestions || []);
      setAiStep(AI_QUESTIONS.length + 2);
    } catch {
      setAiSuggestions([]);
      setAiStep(AI_QUESTIONS.length + 2);
    }
  }, [aiAnswers, siteConfig]);

  const handleAiAnswer = useCallback((qId: string, answer: string) => {
    setAiAnswers((prev) => ({ ...prev, [qId]: answer }));
    if (aiStep < AI_QUESTIONS.length) setAiStep(aiStep + 1);
  }, [aiStep]);

  useEffect(() => {
    if (aiStep === AI_QUESTIONS.length && Object.keys(aiAnswers).length >= AI_QUESTIONS.length) {
      const timer = setTimeout(() => handleAiGenerate(), 400);
      return () => clearTimeout(timer);
    }
  }, [aiStep, aiAnswers, handleAiGenerate]);

  const handleAiApprove = useCallback(async () => {
    if (!siteConfig) return;
    setAiApplying(true);
    try {
      const updated: SiteConfig = JSON.parse(JSON.stringify(siteConfig));
      for (const s of aiSuggestions) {
        setNestedValue(updated as unknown as Record<string, unknown>, `company.${s.field}`, s.after);
      }
      const res = await saveSiteConfig(siteId, updated, version, "AI編集を承認");
      if (!res.ok) {
        if (res.reason === "conflict") {
          setNeedsReload(true);
          toast({
            title: "別の画面で先に保存されています",
            description: "「最新を読み込む」で読み直してから、もう一度お試しください。",
            tone: "danger",
            duration: 0,
          });
        } else {
          toast({ title: "反映できませんでした", description: "時間をおいてもう一度お試しください。", tone: "danger" });
        }
        return;
      }
      setVersion(res.version);
      setSiteConfig(updated);
      setAiDone(true);
      void refreshHistory();
    } catch {
      toast({ title: "反映に失敗しました", tone: "danger" });
    } finally {
      setAiApplying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiSuggestions, siteId, version, siteConfig]);

  const resetAi = useCallback(() => {
    setAiStep(0); setAiAnswers({}); setAiSuggestions([]); setAiApplying(false); setAiDone(false);
  }, []);

  /* ═══════════════════ 読み込み中・エラー ═══════════════════ */
  if (loading) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-bg">
        <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-2.5">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="flex flex-1 items-start justify-center overflow-hidden p-4">
          <div className="flex w-full max-w-3xl flex-col gap-4">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !siteConfig) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-bg p-6 text-center">
        <p className="text-sm text-danger">{error || "サイトのデータが見つかりませんでした。"}</p>
        <Link
          href="/app"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-brand/40 px-4 text-sm text-ink outline-none transition hover:bg-surface2 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-4" aria-hidden /> マイページに戻る
        </Link>
      </div>
    );
  }

  /* ═══════════════════ 本体 ═══════════════════ */
  const modeTabs = [
    { value: "view", label: "見る", icon: <Eye className="size-4" aria-hidden /> },
    { value: "edit", label: "編集", icon: <Pencil className="size-4" aria-hidden /> },
    { value: "ai", label: "AI", icon: aiLocked ? <Lock className="size-4" aria-hidden /> : <Bot className="size-4" aria-hidden /> },
  ];

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg text-ink">
      {/* ── ヘッダー ── */}
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/app"
            title="マイページに戻る"
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-ink2 outline-none transition hover:bg-surface2 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4" aria-hidden />
            <span className="sr-only">マイページに戻る</span>
          </Link>

          <Tabs tabs={modeTabs} value={mode} onValueChange={switchMode} aria-label="編集モード" />

          {mode === "edit" && (
            <div className="hidden items-center gap-1 sm:flex">
              <button
                type="button"
                onClick={() => { cancelEdit(); closePanels(); setSectionsOpen(true); }}
                aria-pressed={sectionsOpen}
                className={[
                  "inline-flex h-8 items-center gap-1.5 rounded-pill px-3 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
                  sectionsOpen ? "bg-accent-soft text-ink" : "text-ink2 hover:bg-surface2 hover:text-ink",
                ].join(" ")}
              >
                <LayoutList className="size-4" aria-hidden /> 構成
              </button>
              <button
                type="button"
                onClick={() => { cancelEdit(); closePanels(); setBrandOpen(true); }}
                aria-pressed={brandOpen}
                className={[
                  "inline-flex h-8 items-center gap-1.5 rounded-pill px-3 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
                  brandOpen ? "bg-accent-soft text-ink" : "text-ink2 hover:bg-surface2 hover:text-ink",
                ].join(" ")}
              >
                <Palette className="size-4" aria-hidden /> 色
              </button>
              <button
                type="button"
                onClick={openHistory}
                aria-pressed={historyOpen}
                className={[
                  "inline-flex h-8 items-center gap-1.5 rounded-pill px-3 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
                  historyOpen ? "bg-accent-soft text-ink" : "text-ink2 hover:bg-surface2 hover:text-ink",
                ].join(" ")}
              >
                <History className="size-4" aria-hidden /> 履歴
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {needsReload && (
            <Button size="sm" variant="secondary" onClick={reload} loading={reloading}>
              最新を読み込む
            </Button>
          )}

          {slug && (
            <a
              href={customerSiteUrl(slug)}
              target="_blank"
              rel="noreferrer"
              title={customerSiteLabel(slug)}
              className="hidden h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-xs text-ink2 outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
            >
              <ExternalLink className="size-3.5" aria-hidden /> サイトを見る
            </a>
          )}

          {/* フォント切替 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFontMenu((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={showFontMenu}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-xs text-ink outline-none transition hover:bg-surface2 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <TypeIcon className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">{selectedFont.label}</span>
            </button>
            {showFontMenu && (
              <>
                <button type="button" aria-hidden tabIndex={-1} className="fixed inset-0 z-[45] cursor-default" onClick={() => setShowFontMenu(false)} />
                <div role="menu" className="absolute right-0 top-full z-[46] mt-1 min-w-44 rounded-lg border border-line bg-surface p-1 shadow-sh2">
                  {FONTS.map((f) => (
                    <button
                      key={f.id}
                      role="menuitemradio"
                      aria-checked={selectedFont.id === f.id}
                      type="button"
                      onClick={() => { setSelectedFont(f); setShowFontMenu(false); }}
                      style={{ fontFamily: f.css }}
                      className={[
                        "block w-full rounded-md px-3 py-2 text-left text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
                        selectedFont.id === f.id ? "bg-accent-soft font-bold text-ink" : "text-ink2 hover:bg-surface2 hover:text-ink",
                      ].join(" ")}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 端末の見え方 */}
          <div role="group" aria-label="画面の大きさ" className="inline-flex items-center gap-0.5 rounded-pill bg-surface2 p-0.5">
            {(["mobile", "desktop"] as const).map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={device === d}
                title={d === "mobile" ? "スマホの見え方" : "パソコンの見え方"}
                onClick={() => setDevice(d)}
                className={[
                  "inline-flex size-7 items-center justify-center rounded-pill outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
                  device === d ? "bg-surface text-ink shadow-sh1" : "text-ink3 hover:text-ink",
                ].join(" ")}
              >
                {d === "mobile" ? <Smartphone className="size-4" aria-hidden /> : <Monitor className="size-4" aria-hidden />}
              </button>
            ))}
          </div>

          {/* 反映（編集モードで変更があるとき） */}
          {mode === "edit" && totalChanges > 0 && (
            <Button size="sm" variant="cta" onClick={() => { cancelEdit(); closePanels(); setReviewing(true); }}>
              反映する（{totalChanges}件）
            </Button>
          )}
        </div>
      </header>

      {/* ── メイン ── */}
      <div className="flex-1 overflow-hidden">
        {mode === "ai" ? (
          <div className="h-full overflow-y-auto">
            <div className="mx-auto max-w-lg px-4 py-8">
              {renderAi()}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="flex min-h-full justify-center p-3 sm:p-5">
              <div
                className="w-full self-start overflow-hidden rounded-xl bg-white shadow-sh2"
                style={{
                  maxWidth: device === "mobile" ? 390 : 1200,
                  fontFamily: selectedFont.css,
                }}
              >
                <TemplateRenderer
                  templateId={templateId}
                  config={siteConfig}
                  editMode={mode === "edit"}
                  onFieldClick={handleFieldClick}
                  changedFields={changedFieldSet}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 編集モードの操作ヒント（下・薄く） */}
      {mode === "edit" && totalChanges === 0 && !activeFieldId && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
          <p className="pointer-events-none rounded-pill bg-surface/90 px-4 py-1.5 text-xs text-ink2 shadow-sh1 backdrop-blur">
            直したい文字や写真をタップすると編集できます
          </p>
        </div>
      )}

      {/* ── 編集パネル（フィールド：右から） ── */}
      <Sheet
        open={mode === "edit" && activeFieldId !== null}
        onClose={cancelEdit}
        side="right"
        title={activeFieldId ? fieldLabel(activeFieldId) : "編集"}
        description={activeFieldType === "image" ? "写真を選んで、形を整えて差し替えます。" : "文字を書き替えて「決定」を押してください。"}
      >
        {activeFieldId && (
          <div className="flex flex-col gap-4">
            {activeFieldType === "text" ? (
              <Field
                label="内容"
                multiline
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                autoFocus
              />
            ) : (
              <ImageField initialUrl={activeFieldValue} onChange={(dataUrl) => setEditText(dataUrl)} />
            )}

            <div className="flex gap-2">
              <Button variant="primary" onClick={confirmEdit} leftIcon={<Check className="size-4" aria-hidden />}>
                決定
              </Button>
              <Button variant="ghost" onClick={cancelEdit}>やめる</Button>
            </div>
            <p className="text-xs text-ink3">
              ここでの変更はプレビューにすぐ映ります。サイトへ反映するには、右上の「反映する」を押してください。
            </p>
          </div>
        )}
      </Sheet>

      {/* ── セクション構成（右から） ── */}
      <Sheet
        open={sectionsOpen && mode === "edit"}
        onClose={() => setSectionsOpen(false)}
        side="right"
        title="ページの構成"
        description="表示する内容・並び順・見せ方を決めます。変更はすぐプレビューに映ります。"
      >
        <SectionPanel
          sections={sections}
          onChange={handleSectionsChange}
          templateId={templateId}
          plan={plan}
        />
      </Sheet>

      {/* ── 色（右から） ── */}
      <Sheet
        open={brandOpen && mode === "edit"}
        onClose={() => setBrandOpen(false)}
        side="right"
        title="サイトの色"
        description="代表カラーを決めると、見出し・地の色・線・ボタンまでこの色から作られます。"
      >
        <div className="flex flex-col gap-5">
          <BrandPicker value={brand} onChange={handleBrandChange} columns="grid-cols-2 gap-2.5" />
          <PaletteBoard
            palette={buildPalette(resolveBrand(brandToColors(brand), templateId))}
            chosen={!!brand.primary}
            hasSubs={!!brand.sub1 || !!brand.sub2}
          />
          <p className="text-xs text-ink3">
            変更はプレビューにすぐ映ります。サイトへ反映するには、右上の「反映する」を押してください。
          </p>
        </div>
      </Sheet>

      {/* ── 履歴（右から） ── */}
      <Sheet
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        side="right"
        title="保存の履歴"
        description="前の状態に戻せます。戻すと、いま編集中で未反映の変更は消えます。"
      >
        {historyLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-ink2">まだ履歴がありません。保存すると、ここに残ります。</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {history.map((h, i) => {
              const isCurrent = h.version === version;
              return (
                <li key={h.version}>
                  <Card padded={false} className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="tnum text-sm font-bold">v{h.version}</span>
                        {isCurrent && <Badge tone="success">いま</Badge>}
                        {i === 0 && !isCurrent && <Badge tone="neutral">最新</Badge>}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-ink2">{h.note || "（メモなし）"}</p>
                      <p className="tnum mt-0.5 text-xs text-ink3">{formatDate(h.createdAt)}</p>
                    </div>
                    {!isCurrent && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => restoreVersion(h.version)}
                        loading={restoringVersion === h.version}
                        leftIcon={<RotateCcw className="size-4" aria-hidden />}
                      >
                        戻す
                      </Button>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </Sheet>

      {/* ── 反映の確認（下から） ── */}
      <Sheet
        open={reviewing}
        onClose={() => { if (!applying) setReviewing(false); }}
        side="bottom"
        title="この内容で反映しますか？"
        description="サイトに保存します。保存した内容はすぐに公開ページへ映ります。"
      >
        <div className="mx-auto flex max-w-lg flex-col gap-4">
          <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
            {Array.from(changes.entries()).map(([fieldId, c]) => (
              <li key={fieldId} className="flex items-start gap-2 p-3">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{fieldLabel(fieldId)}</p>
                  <p className="truncate text-xs text-ink2">
                    → {c.newValue.startsWith("data:image/") ? "写真を差し替え" : c.newValue.slice(0, 40) + (c.newValue.length > 40 ? "…" : "")}
                  </p>
                </div>
              </li>
            ))}
            {sectionsChanged && (
              <li className="flex items-start gap-2 p-3">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                <div>
                  <p className="text-sm font-medium">ページの構成</p>
                  <p className="text-xs text-ink2">→ 並び順・表示・見せ方の変更</p>
                </div>
              </li>
            )}
            {brandChanged && (
              <li className="flex items-start gap-2 p-3">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-medium">サイトの色</p>
                  <p className="flex items-center gap-1.5 text-xs text-ink2">
                    →
                    <span className="inline-block size-3 rounded-sm border border-line" style={{ background: brand.primary ?? "transparent" }} />
                    <span className="tnum">{brand.primary}</span>
                  </p>
                </div>
              </li>
            )}
          </ul>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setReviewing(false)} disabled={applying} block>
              戻る
            </Button>
            <Button variant="cta" onClick={handleApply} loading={applying} block>
              反映する
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );

  /* ═══════════════════ AI モードの中身 ═══════════════════ */
  function renderAi() {
    if (aiDone) {
      return (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-pill bg-accent-soft text-accent">
            <Check className="size-6" aria-hidden />
          </span>
          <p className="text-lg font-bold">反映しました</p>
          <Button variant="primary" onClick={() => { resetAi(); setMode("view"); }}>
            サイトを確認する
          </Button>
        </div>
      );
    }

    if (aiApplying) {
      return (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Loader2 className="size-7 animate-spin text-accent" aria-hidden />
          <p className="text-base font-bold">サイトに反映しています…</p>
        </div>
      );
    }

    // 導入
    if (aiStep === 0) {
      return (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-accent">
            <Sparkles className="size-5" aria-hidden />
            <h2 className="text-lg font-bold text-ink">AIでサイトを整える</h2>
          </div>
          <p className="text-sm leading-relaxed text-ink2">
            {AI_QUESTIONS.length}つの質問に答えるだけで、あなたのお店に合ったキャッチコピーや説明文をAIが下書きします。
            気に入ったものだけを反映できます。
          </p>
          <Button variant="cta" onClick={() => setAiStep(1)} rightIcon={<Sparkles className="size-4" aria-hidden />}>
            はじめる
          </Button>
        </Card>
      );
    }

    // 質問
    if (aiStep >= 1 && aiStep <= AI_QUESTIONS.length) {
      const q = AI_QUESTIONS[aiStep - 1];
      const current = aiAnswers[q.id];
      return (
        <div className="flex flex-col gap-5">
          {/* 進み具合 */}
          <div className="flex gap-1.5">
            {AI_QUESTIONS.map((_, i) => (
              <div key={i} className={["h-1.5 flex-1 rounded-pill", i < aiStep ? "bg-accent" : "bg-surface2"].join(" ")} />
            ))}
          </div>
          <p className="tnum text-xs font-medium text-accent">{aiStep} / {AI_QUESTIONS.length}</p>
          <h2 className="text-base font-bold leading-relaxed text-ink">{q.question}</h2>

          {q.type === "select" ? (
            <div className="flex flex-col gap-2">
              {q.options?.map((opt) => {
                const selected = current === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAiAnswers((p) => ({ ...p, [q.id]: opt }))}
                    className={[
                      "w-full rounded-lg border px-4 py-3 text-left text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
                      selected ? "border-accent bg-accent-soft font-bold text-ink" : "border-line bg-surface text-ink2 hover:border-brand/40 hover:text-ink",
                    ].join(" ")}
                  >
                    {opt}
                  </button>
                );
              })}
              {"freeInputPlaceholder" in q && (
                <textarea
                  value={current?.startsWith("【自由記述】") ? current.replace("【自由記述】", "") : ""}
                  placeholder={q.freeInputPlaceholder}
                  onChange={(e) => setAiAnswers((p) => ({ ...p, [q.id]: e.target.value ? `【自由記述】${e.target.value}` : "" }))}
                  rows={2}
                  className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink3 focus-visible:ring-2 focus-visible:ring-ring"
                />
              )}
              <div className="mt-1">
                <Button variant="primary" onClick={() => handleAiAnswer(q.id, current || "特になし")} disabled={!current}>
                  次へ
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <textarea
                value={current || ""}
                placeholder={q.placeholder}
                onChange={(e) => setAiAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                rows={4}
                className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-ink outline-none transition placeholder:text-ink3 focus-visible:ring-2 focus-visible:ring-ring"
              />
              <div>
                <Button variant="primary" onClick={() => handleAiAnswer(q.id, current || "特になし")}>
                  次へ
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // 生成中
    if (aiStep === AI_QUESTIONS.length + 1) {
      return (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Loader2 className="size-7 animate-spin text-accent" aria-hidden />
          <p className="text-base font-bold">AIが考えています…</p>
        </div>
      );
    }

    // 提案（Before / After）
    if (aiStep === AI_QUESTIONS.length + 2) {
      return (
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-bold">AIの提案</h2>
          {aiSuggestions.length === 0 ? (
            <p className="text-sm text-ink2">うまく提案を作れませんでした。もう一度お試しください。</p>
          ) : (
            aiSuggestions.map((s) => (
              <Card key={s.field} className="flex flex-col gap-3">
                <p className="text-xs font-bold text-accent">{AI_FIELD_LABELS[s.field] || s.field}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-[10px] font-bold text-ink3">いま</p>
                    <p className="rounded-md bg-surface2 p-2.5 text-xs leading-relaxed text-ink2">{s.before || "（未設定）"}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-bold text-accent">AIの案</p>
                    <p className="rounded-md bg-accent-soft p-2.5 text-xs font-medium leading-relaxed text-ink">{s.after}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={resetAi} block>やめる</Button>
            <Button variant="cta" onClick={handleAiApprove} disabled={aiSuggestions.length === 0} block>
              この内容で反映する
            </Button>
          </div>
        </div>
      );
    }

    return null;
  }
}

/** 保存日時をやさしい表記にする */
function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  } catch {
    return iso;
  }
}
