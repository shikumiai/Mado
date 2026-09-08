"use client";

/**
 * /start — 申し込みの入口（v4・名前先行）
 *
 * 変えたところ:
 *   先に「名前（URL）」を取る → ログイン → その場で名前を確保 → 続きは下書き保存つき。
 *   途中でブラウザを閉じても、次に開いたときサーバーの下書きから続きに戻れる。
 *
 * 流れ:
 *   0 アドレス → 1 ログイン →（名前を確保）→ 2 色 → 3 業種 → 4 見せ方
 *   → 5 プラン → 6 会社情報 → 7 確認して公開
 *
 * 色を早い段階で決めるのは、テンプレートを選ぶ時点で「自分の色になったサイト」を
 * 見比べてほしいから。選んだ色は見出し・地・帯・線・ボタン・イラストまで行き渡る。
 *
 * 業種は10系統。細かい商売の名前（35業種）は src/lib/industry-registry.ts の
 * 対応表から近い系統へ寄せる。構成の正は src/lib/templates/catalog.ts。
 *
 * 保存先はサーバー（Supabase）。sessionStorage への退避は、ログインで画面を
 * 離れている間だけの補助として残してある。
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import Link from "next/link";
import {
  Check,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  Maximize2,
  Mail,
  AlertCircle,
  Search,
  KeyRound,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase/client";
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
} from "@/lib/supabase/sign-in";
import { GoogleIcon, PasskeyButton } from "@/components/auth/AuthButtons";
import {
  checkSlugAvailability,
  reserveSite,
  saveSignupDraft,
  loadSignupDraft,
  publishFreeSite,
  startPaidCheckoutForSite,
  type SignupDraftPatch,
} from "@/lib/signup";
import { type Plan, PLAN_LABELS, PLAN_PRICES } from "@/lib/stripe";
import { customerSiteLabel, SITE_URL_PREFIX } from "@/lib/resolve-site";
import {
  type BrandColors,
  type Palette as TplPalette,
  buildPalette,
  normalizeHex,
  resolveBrand,
  templatePreviewUrl,
} from "@/lib/palette";
import { useSettled } from "@/lib/use-settled";
import { TEMPLATES, TEMPLATE_IDS, getTemplateOrDefault } from "@/lib/templates/catalog";
import { industriesByTemplate, industryNamesFor, findIndustry } from "@/lib/industry-registry";
import {
  Button,
  Card,
  Badge,
  Field,
  Sheet,
  ThemeToggle,
  Mascot,
  useToast,
} from "@/components/ui";
import BrandPicker, {
  BrandStrip,
  PaletteBoard,
  colorSetName,
  type BrandChoice,
} from "@/components/brand/BrandPicker";
import StructureList from "@/components/templates/StructureList";
import { WindowMark } from "@/components/marketing/WindowMark";

/* ═══════════════════════════════════════
   プラン
   ═══════════════════════════════════════ */

type PlanCard = {
  id: Plan;
  blurb: string;
  features: string[];
};

const PLANS: PlanCard[] = [
  {
    id: "otameshi",
    blurb: "まずは無料で持てる。写真とテンプレートですぐ公開。",
    features: [
      "テンプレートから選んで公開",
      "写真・会社情報の掲載",
      "お問い合わせフォーム",
      "独自ドメインに対応",
    ],
  },
  {
    id: "omakase",
    blurb: "集客の土台がそろう。実績もお客様の声も載せられる。",
    features: [
      "おためしの内容ぜんぶ",
      "実績ページ・お客様の声・ブログ",
      "Google マップの掲載",
      "編集おまかせ 月3回まで",
    ],
  },
  {
    id: "omakase-pro",
    blurb: "できることを全部。予約も採用もAIチャットも。",
    features: [
      "おまかせの内容ぜんぶ",
      "予約フォーム・採用ページ",
      "AIチャットの設置",
      "編集おまかせ 回数のしばりなし",
    ],
  },
];

const STEP_LABELS = [
  "アドレス",
  "ログイン",
  "色",
  "業種",
  "見せ方",
  "プラン",
  "会社情報",
  "確認",
];
const STEP_ADDRESS = 0;
const STEP_LOGIN = 1;
const STEP_COLOR = 2;
const STEP_INDUSTRY = 3;
const STEP_LOOK = 4;
const STEP_PLAN = 5;
const STEP_COMPANY = 6;
const STEP_CONFIRM = 7;
const LAST_STEP = STEP_LABELS.length - 1;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 入力された名前を、そのまま URL に使える形にそろえる */
function cleanSlug(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

/* ═══════════════════════════════════════
   進み具合（細い帯 + 現在地）
   ═══════════════════════════════════════ */
function Progress({ step }: { step: number }) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        {STEP_LABELS.map((label, i) => (
          <div
            key={label}
            className={[
              "h-1.5 flex-1 rounded-pill transition-colors duration-300 ease-brand",
              i <= step ? "bg-accent" : "bg-surface2",
            ].join(" ")}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-ink2">
        <span className="tnum">
          ステップ {step + 1} / {STEP_LABELS.length}
        </span>
        <span className="mx-1.5 text-ink3">·</span>
        {STEP_LABELS[step]}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════
   1つだけ選ぶ集まり（矢印キーで移動・selected を子に渡す）
   ═══════════════════════════════════════ */
function Choice<T extends { id: string }>({
  items,
  value,
  onValueChange,
  ariaLabel,
  className = "",
  children,
}: {
  items: T[];
  value: string | null;
  onValueChange: (id: string) => void;
  ariaLabel: string;
  className?: string;
  children: (item: T, selected: boolean) => React.ReactNode;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (index + dir + items.length) % items.length;
    onValueChange(items[nextIndex].id);
    refs.current[nextIndex]?.focus();
  }

  return (
    <div role="radiogroup" aria-label={ariaLabel} className={className}>
      {items.map((item, i) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (value == null && i === 0) ? 0 : -1}
            onClick={() => onValueChange(item.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className="h-full w-full rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            {children(item, selected)}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════
   ライブプレビュー（選んだテンプレを、選んだ色そのままで出す）
   会社名を入れると iframe の中の名前がその場で入れ替わる。
   ═══════════════════════════════════════ */
function PreviewPanel({
  src,
  displayName,
  urlLabel,
  palette,
  note,
  height = 360,
  scale = 0.34,
}: {
  src: string;
  displayName: string;
  urlLabel: string;
  palette: TplPalette;
  note?: string;
  /** 窓の高さ（大きく見せたい画面では上げる） */
  height?: number;
  /** 中のサイトの縮尺 */
  scale?: number;
}) {
  const smallRef = useRef<HTMLIFrameElement>(null);
  const bigRef = useRef<HTMLIFrameElement>(null);
  const [expanded, setExpanded] = useState(false);

  // 中の会社名を差し替える（テンプレ側の usePreviewName が受け取る）
  const postName = useCallback(() => {
    const name = displayName.trim();
    if (!name) return;
    const msg = { type: "shikumiya-preview-name", name };
    smallRef.current?.contentWindow?.postMessage(msg, "*");
    bigRef.current?.contentWindow?.postMessage(msg, "*");
  }, [displayName]);

  useEffect(() => {
    postName();
  }, [postName]);

  return (
    <>
      <Card padded={false} className="overflow-hidden">
        {/* 窓の下枠ふうの帯（掛け金＝暖色の小さな点 + アドレス） */}
        <div className="flex items-center gap-2 border-b border-line bg-surface2 px-3 py-2">
          <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent" />
          <span className="mx-1 min-w-0 flex-1 truncate rounded-sm bg-surface px-2 py-0.5 text-[11px] text-ink3 tnum">
            {urlLabel}
          </span>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="大きく見る"
            className="rounded-md p-1 text-ink3 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Maximize2 className="size-3.5" aria-hidden />
          </button>
        </div>
        {/* 縮小したサイト。key を src にして系統・プラン・色の変更で読み直す */}
        <div className="relative overflow-hidden" style={{ height, background: palette.bg }}>
          <iframe
            key={src}
            ref={smallRef}
            src={src}
            title="サイトのプレビュー"
            onLoad={postName}
            loading="lazy"
            tabIndex={-1}
            className="absolute left-0 top-0 origin-top-left border-0"
            style={{
              width: 1280,
              height: Math.round(height / scale),
              transform: `scale(${scale})`,
              pointerEvents: "none",
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <BrandStrip palette={palette} />
            <p className="truncate text-xs text-ink2">{note ?? "選んだ色で表示中"}</p>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="shrink-0 rounded text-xs font-medium text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            大きく見る
          </button>
        </div>
      </Card>

      {/* 大きく見る（割り込みモーダルの代わりに下から出るシート） */}
      <Sheet
        open={expanded}
        onClose={() => setExpanded(false)}
        side="bottom"
        title="サイトのプレビュー"
        description={urlLabel}
      >
        <div className="h-[68vh] overflow-hidden rounded-lg border border-line bg-surface2">
          <iframe
            key={`big-${src}`}
            ref={bigRef}
            src={src}
            title="サイトのプレビュー（拡大）"
            onLoad={postName}
            className="h-full w-full border-0"
          />
        </div>
      </Sheet>
    </>
  );
}

/* ═══════════════════════════════════════
   確認欄の1行
   ═══════════════════════════════════════ */
function SummaryRow({
  label,
  children,
  first,
}: {
  label: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-start justify-between gap-4 px-4 py-3",
        first ? "" : "border-t border-line",
      ].join(" ")}
    >
      <dt className="shrink-0 text-sm text-ink2">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium text-ink">{children}</dd>
    </div>
  );
}

/* ═══════════════════════════════════════
   本体
   ═══════════════════════════════════════ */
export default function StartPage() {
  const { toast } = useToast();

  // 認証（Supabase 一本）
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // 入力
  const [step, setStep] = useState(STEP_ADDRESS);
  const [brandChoice, setBrandChoice] = useState<BrandChoice>({
    primary: null,
    sub1: null,
    sub2: null,
    setId: null,
  });
  const [family, setFamily] = useState<string | null>(null);
  const [industryId, setIndustryId] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan>("otameshi");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [slug, setSlug] = useState("");

  // サーバーに押さえた枠
  const [siteId, setSiteId] = useState<string | null>(null);
  const [reservedSlug, setReservedSlug] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);
  const [resumed, setResumed] = useState(false);

  // サイトURLの空き状況
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "ok" | "ng">("idle");
  const [slugMsg, setSlugMsg] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const { primary, sub1, sub2, setId: colorSetId } = brandChoice;

  /* --- 選んだ色 --- */
  const brand: BrandColors | null = useMemo(
    () => (primary ? { primary, sub1: sub1 ?? undefined, sub2: sub2 ?? undefined } : null),
    [primary, sub1, sub2],
  );
  // 色つまみを動かしている間はプレビューを読み直さない
  const settledBrand = useSettled(brand);

  const displayName = companyName.trim();
  const previewUrlLabel = slug ? customerSiteLabel(slug) : `${SITE_URL_PREFIX}your-site`;

  /** 色を決める画面の見本（まだ業種を選んでいなければ最初の業種で見せる） */
  const sampleFamily = family ?? TEMPLATES[0].id;
  // プレビューは系統そのもの + ?plan= で出す（-mid / -pro のページは建築3系統にしかない）
  const previewSrc = templatePreviewUrl(sampleFamily, settledBrand, plan);

  const boardPalette = useMemo(
    () => buildPalette(resolveBrand(brand, sampleFamily)),
    [brand, sampleFamily],
  );

  const template = family ? getTemplateOrDefault(family) : null;
  const industryGroups = useMemo(() => industriesByTemplate(), []);

  /** いま画面に出ている決定内容（下書き保存・公開に送る形） */
  const patch: SignupDraftPatch = useMemo(
    () => ({
      brand: brand ?? null,
      colorSetId,
      family,
      industryId,
      plan,
      companyName: companyName.trim(),
      email: (email || user?.email || "").trim(),
      phone: phone.trim(),
      step,
    }),
    [brand, colorSetId, family, industryId, plan, companyName, email, phone, step, user],
  );

  /* --- ログイン状態を見張る --- */
  useEffect(() => {
    const supabase = getBrowserClient();
    if (!supabase) {
      setAuthReady(true);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  /* --- 画面を開いたときの初期値（サーバーの下書きより前の段階） --- */
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);

      // トップページのヒーローで入れた名前
      const askedSlug = q.get("slug");
      if (askedSlug) setSlug(cleanSlug(askedSlug));

      // ログインで離れている間の退避（補助。サーバーの下書きがあればそちらが勝つ）
      const raw = sessionStorage.getItem("startDraft");
      if (raw) {
        const d = JSON.parse(raw) as {
          primary?: string;
          sub1?: string;
          sub2?: string;
          colorSetId?: string;
          family?: string;
          industryId?: string;
          plan?: string;
          companyName?: string;
          email?: string;
          phone?: string;
          slug?: string;
          step?: number;
        };
        setBrandChoice({
          primary: normalizeHex(d.primary),
          sub1: normalizeHex(d.sub1),
          sub2: normalizeHex(d.sub2),
          setId: typeof d.colorSetId === "string" ? d.colorSetId : null,
        });
        if (typeof d.family === "string") setFamily(d.family);
        if (typeof d.industryId === "string") setIndustryId(d.industryId);
        if (d.plan === "otameshi" || d.plan === "omakase" || d.plan === "omakase-pro") {
          setPlan(d.plan);
        }
        if (typeof d.companyName === "string") setCompanyName(d.companyName);
        if (typeof d.email === "string") setEmail(d.email);
        if (typeof d.phone === "string") setPhone(d.phone);
        if (!askedSlug && typeof d.slug === "string") setSlug(cleanSlug(d.slug));
        // トップページで別の名前を入れ直して来たときは、古い途中経過の位置は使わない
        const sameSlug = !askedSlug || cleanSlug(askedSlug) === cleanSlug(d.slug ?? "");
        if (sameSlug && typeof d.step === "number") {
          setStep(Math.min(Math.max(d.step, 0), LAST_STEP));
        }
      } else {
        // トップページで入れたアドレスがあれば引き継ぐ
        const pendingSlug = sessionStorage.getItem("pendingSlug");
        if (!askedSlug && pendingSlug) {
          setSlug(cleanSlug(pendingSlug));
          sessionStorage.removeItem("pendingSlug");
        }
      }

      // 業種別テンプレート一覧から「この業種で始める」で来たときは、
      // 選んだ業種とプランをそのまま引き継ぐ（もう一度選ばせない）
      const askedIndustry = q.get("industry");
      if (askedIndustry) {
        if (TEMPLATE_IDS.includes(askedIndustry)) {
          setFamily(askedIndustry);
        } else {
          const viaDetail = findIndustry(askedIndustry);
          if (viaDetail && TEMPLATE_IDS.includes(viaDetail.templateId)) {
            setFamily(viaDetail.templateId);
            setIndustryId(viaDetail.id);
          }
        }
      }
      const askedPlan = q.get("plan");
      if (askedPlan === "otameshi" || askedPlan === "omakase" || askedPlan === "omakase-pro") {
        setPlan(askedPlan);
      }
    } catch {
      /* 壊れていたら無視 */
    }
  }, []);

  /* --- ログイン済みならメールを自動で入れる --- */
  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
  }, [user, email]);

  /* ═══ サーバーの下書き ═══ */

  /** 保存済みの内容と同じなら書きに行かないための控え */
  const lastSavedRef = useRef<string | null>(null);
  const draftCheckedRef = useRef(false);

  /** 下書きが消えていた（期限切れ・別ブラウザ）ときの戻し方 */
  const handleGone = useCallback(
    (message: string) => {
      setSiteId(null);
      setReservedSlug(null);
      lastSavedRef.current = null;
      setStep(STEP_ADDRESS);
      toast({ title: "もう一度名前から", description: message, tone: "danger" });
    },
    [toast],
  );

  /* --- 前回の続きを読む（ログイン済みで下書きがあるとき） --- */
  useEffect(() => {
    if (!authReady || !user || draftCheckedRef.current) return;
    draftCheckedRef.current = true;

    let alive = true;
    (async () => {
      const res = await loadSignupDraft();
      if (!alive || !res.ok) return;

      const d = res.draft;
      setSiteId(d.siteId);
      setReservedSlug(d.slug);
      setSlug(d.slug);
      setSlugStatus("ok");
      setSlugMsg(null);
      setBrandChoice({
        primary: normalizeHex(d.brand?.primary),
        sub1: normalizeHex(d.brand?.sub1),
        sub2: normalizeHex(d.brand?.sub2),
        setId: d.colorSetId,
      });
      if (d.family) setFamily(d.family);
      if (d.industryId) setIndustryId(d.industryId);
      setPlan(d.plan);
      if (d.companyName) setCompanyName(d.companyName);
      if (d.email) setEmail(d.email);
      if (d.phone) setPhone(d.phone);

      const resumeStep = Math.min(Math.max(d.step, STEP_COLOR), LAST_STEP);
      setStep(resumeStep);
      setResumed(true);

      // 読み込んだ直後に同じ内容を書き戻さない
      lastSavedRef.current = JSON.stringify({
        brand: d.brand ?? null,
        colorSetId: d.colorSetId,
        family: d.family,
        industryId: d.industryId,
        plan: d.plan,
        companyName: d.companyName,
        email: d.email,
        phone: d.phone,
        step: resumeStep,
      });
    })();

    return () => {
      alive = false;
    };
  }, [authReady, user]);

  /* --- 決めるたびにサーバーへ預ける（少し待ってからまとめて） --- */
  useEffect(() => {
    if (!siteId) return;
    const sig = JSON.stringify(patch);
    if (lastSavedRef.current === sig) return;

    const timer = setTimeout(async () => {
      lastSavedRef.current = sig;
      const res = await saveSignupDraft(siteId, patch);
      if (!res.ok) {
        lastSavedRef.current = null;
        if (res.reason === "not_found") handleGone(res.message);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [siteId, patch, handleGone]);

  /* --- ログインで離れている間の退避（補助） --- */
  useEffect(() => {
    try {
      sessionStorage.setItem(
        "startDraft",
        JSON.stringify({
          primary,
          sub1,
          sub2,
          colorSetId,
          family,
          industryId,
          plan,
          companyName,
          email,
          phone,
          slug,
          step,
        }),
      );
    } catch {
      /* 保存できなくても先へ進める */
    }
  }, [primary, sub1, sub2, colorSetId, family, industryId, plan, companyName, email, phone, slug, step]);

  /* --- サイトURLの空き確認（少し待ってから問い合わせる） --- */
  useEffect(() => {
    const s = slug.trim();
    if (!s) {
      setSlugStatus("idle");
      setSlugMsg(null);
      return;
    }
    // すでに自分が押さえている名前は、そのまま使える
    if (reservedSlug && s === reservedSlug) {
      setSlugStatus("ok");
      setSlugMsg(null);
      return;
    }
    setSlugStatus("checking");
    setSlugMsg(null);
    const timer = setTimeout(async () => {
      const res = await checkSlugAvailability(s);
      if (res.ok) {
        setSlugStatus("ok");
        setSlugMsg(null);
      } else {
        setSlugStatus("ng");
        setSlugMsg(res.message);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [slug, reservedSlug]);

  /* --- 業種を選ぶ（カードは系統、選び直しで細目は外す） --- */
  const pickFamily = useCallback((id: string) => {
    setFamily(id);
    setIndustryId((current) => (findIndustry(current)?.templateId === id ? current : null));
  }, []);

  /** 細かい業種名から選んだとき（対応表で近い系統へ寄せる） */
  const pickIndustry = useCallback((id: string) => {
    const found = findIndustry(id);
    if (!found) return;
    setIndustryId(found.id);
    setFamily(found.templateId);
  }, []);

  /* --- 名前を確保する（ログイン直後・アドレスを変えたとき） --- */
  const reserve = useCallback(async (): Promise<string | null> => {
    const s = slug.trim();
    if (!s) return null;
    if (siteId && reservedSlug === s) return siteId;

    setReserving(true);
    const res = await reserveSite(s);
    setReserving(false);

    if (!res.ok) {
      if (res.reason === "taken" || res.reason === "slug") {
        setSlugStatus("ng");
        setSlugMsg(res.message);
        setStep(STEP_ADDRESS);
      }
      toast({ title: "名前を確保できませんでした", description: res.message, tone: "danger" });
      return null;
    }

    setSiteId(res.siteId);
    setReservedSlug(res.slug);
    setSlug(res.slug);
    setSlugStatus("ok");
    setSlugMsg(null);
    // 確保した直後は、いまの内容をそのまま1回書き込ませる
    lastSavedRef.current = null;
    return res.siteId;
  }, [slug, siteId, reservedSlug, toast]);

  /* --- ログインしてこの画面に戻ってきたら、そのまま名前を確保して先へ --- */
  const autoReserveRef = useRef(false);
  useEffect(() => {
    if (!authReady || !user || step !== STEP_LOGIN) return;
    if (autoReserveRef.current) return;
    autoReserveRef.current = true;
    (async () => {
      const id = await reserve();
      autoReserveRef.current = false;
      if (id) setStep(STEP_COLOR);
    })();
  }, [authReady, user, step, reserve]);

  /* --- 送信（無料はその場で公開・有料は Stripe へ） --- */
  const submit = useCallback(async () => {
    if (!user) {
      setStep(STEP_LOGIN);
      return;
    }
    // 何かの拍子に枠が無いまま来たら、ここで押さえてから進む
    const id = siteId ?? (await reserve());
    if (!id) return;

    setSubmitting(true);
    try {
      if (plan === "otameshi") {
        const res = await publishFreeSite(id, patch);
        if (!res.ok) {
          if (res.reason === "not_found") handleGone(res.message);
          else toast({ title: "サイトを作れませんでした", description: res.message, tone: "danger" });
          setSubmitting(false);
          return;
        }
        window.location.href = "/app";
      } else {
        const res = await startPaidCheckoutForSite(id, plan, patch);
        if (!res.ok) {
          if (res.reason === "not_found") handleGone(res.message);
          else
            toast({
              title: "お申し込みを始められませんでした",
              description: res.message,
              tone: "danger",
            });
          setSubmitting(false);
          return;
        }
        window.location.href = res.url;
      }
    } catch {
      toast({
        title: "エラーが発生しました",
        description: "時間をおいてもう一度お試しください。",
        tone: "danger",
      });
      setSubmitting(false);
    }
  }, [user, siteId, plan, patch, reserve, handleGone, toast]);

  /* --- 次へ進めるか --- */
  const slugReady = slugStatus === "ok";
  const canNext =
    step === STEP_ADDRESS
      ? slugReady && !reserving
      : step === STEP_LOGIN
        ? false
        : step === STEP_COLOR
          ? !!primary
          : step === STEP_INDUSTRY
            ? !!family
            : step === STEP_LOOK || step === STEP_PLAN
              ? true
              : step === STEP_COMPANY
                ? companyName.trim().length >= 1
                : false;

  /** アドレスの次へ。ログイン済みならその場で名前を確保して色へ進む */
  const nextFromAddress = useCallback(async () => {
    if (!user) {
      setStep(STEP_LOGIN);
      return;
    }
    const id = await reserve();
    if (id) setStep(STEP_COLOR);
  }, [user, reserve]);

  const next = () => {
    if (step === STEP_ADDRESS) {
      void nextFromAddress();
      return;
    }
    setStep((s) => Math.min(s + 1, LAST_STEP));
  };

  const back = () =>
    setStep((s) => {
      // ログイン済みなら、戻るときにログインの画面は飛ばす
      if (s === STEP_COLOR && user) return STEP_ADDRESS;
      return Math.max(0, s - 1);
    });

  const colorName = colorSetName(colorSetId);
  const industryName = template ? template.industry : "";
  const ctaLabel =
    plan === "otameshi" ? "無料でサイトをつくる" : `お支払いに進む（${PLAN_PRICES[plan]}/月）`;

  const nextLabel =
    step === STEP_ADDRESS
      ? "この名前で進む"
      : step === STEP_COLOR
        ? "次へ・業種を選ぶ"
        : step === STEP_INDUSTRY
          ? "次へ・サイトを見る"
          : step === STEP_LOOK
            ? "次へ・プランを選ぶ"
            : step === STEP_COMPANY
              ? "次へ・確認する"
              : "次へ";

  /** 選んだ色の控え（上に出す小さな帯） */
  const colorBar = (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface2 px-3.5 py-2.5">
      <BrandStrip palette={boardPalette} />
      <p className="min-w-0 flex-1 text-sm text-ink2">
        {colorName ? `「${colorName}」の色` : "選んだ色"}で表示しています。
      </p>
      <button
        type="button"
        onClick={() => setStep(STEP_COLOR)}
        className="shrink-0 rounded text-xs font-medium text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
      >
        色を変える
      </button>
    </div>
  );

  return (
    <MotionConfig reducedMotion="user">
      <div data-mado-marketing className="min-h-screen bg-bg text-ink">
        {/* ヘッダー */}
        <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <Link
            href="/"
            aria-label="トップへ"
            className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <WindowMark className="size-8" />
            <span className="font-serif text-xl font-bold tracking-tight text-ink">Mado</span>
          </Link>
          <div className="flex items-center gap-2">
            {authReady && !user && step !== STEP_LOGIN && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(STEP_LOGIN)}
                leftIcon={<Mail className="size-4" aria-hidden />}
              >
                ログイン
              </Button>
            )}
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-5 pb-24 pt-4">
          <Progress step={step} />

          {resumed && step > STEP_LOGIN && (
            <p className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-surface2 px-3.5 py-2.5 text-sm text-ink2">
              <Check className="size-4 shrink-0 text-success" aria-hidden />
              前回の続きから始めます。
              <span className="tnum text-ink">{customerSiteLabel(slug)}</span>
            </p>
          )}

          <div className="mt-8">
            {step === STEP_ADDRESS ? (
              /* ── STEP 0: サイトの名前（アドレス） ── */
              <AnimatePresence mode="wait">
                <motion.div
                  key="step-address"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-2xl"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent-soft">
                      <Mascot size={40} />
                    </span>
                    <p className="text-sm text-ink2">
                      むずかしい設定はありません。まず、サイトの名前を決めましょう。
                    </p>
                  </div>

                  <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
                    サイトの名前を決めましょう
                  </h1>
                  <p className="mt-1.5 text-sm text-ink2">
                    あなたのサイトの住所になります。半角の英小文字・数字・ハイフンが使えます。
                    あとから変えることもできます。
                  </p>

                  <div className="mt-7 flex flex-col gap-1.5">
                    <label htmlFor="site-slug" className="text-sm font-medium text-ink">
                      サイトの名前
                      <span className="ml-1 text-danger">*</span>
                    </label>
                    <div className="flex items-stretch overflow-hidden rounded-md border border-line bg-surface focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:ring-offset-bg">
                      <span className="flex items-center whitespace-nowrap border-r border-line bg-surface2 px-3 text-xs text-ink2 tnum">
                        {SITE_URL_PREFIX}
                      </span>
                      <input
                        id="site-slug"
                        value={slug}
                        onChange={(e) => setSlug(cleanSlug(e.target.value))}
                        placeholder="yamada-koumuten"
                        inputMode="url"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        aria-describedby="slug-status"
                        className="tnum h-13 min-w-0 flex-1 bg-transparent px-3 text-base text-ink outline-none placeholder:text-ink3"
                      />
                    </div>
                    <p id="slug-status" role="status" className="min-h-4 text-xs">
                      {slugStatus === "checking" && (
                        <span className="flex items-center gap-1 text-ink2">
                          <Loader2 className="size-3 animate-spin" aria-hidden /> 空きを確認しています…
                        </span>
                      )}
                      {slugStatus === "ok" && (
                        <span className="flex items-center gap-1 text-success">
                          <Check className="size-3" aria-hidden /> この名前は使えます：
                          <strong className="font-medium">{customerSiteLabel(slug)}</strong>
                        </span>
                      )}
                      {slugStatus === "ng" && (
                        <span className="flex items-center gap-1 text-danger">
                          <AlertCircle className="size-3" aria-hidden />{" "}
                          {slugMsg ?? "この名前は使えません。"}
                        </span>
                      )}
                      {slugStatus === "idle" && (
                        <span className="text-ink3">英小文字・数字・ハイフンで3〜50文字。</span>
                      )}
                    </p>
                  </div>

                  <p className="mt-6 text-xs text-ink3">
                    次の画面でログインすると、この名前をあなたのものとして押さえます。
                    そのあとの色や業種の選択は、一つずつ自動で保存されます。
                  </p>
                </motion.div>
              </AnimatePresence>
            ) : step === STEP_LOGIN ? (
              /* ── STEP 1: ログイン（名前を押さえる） ── */
              <AnimatePresence mode="wait">
                <motion.div
                  key="step-login"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-lg"
                >
                  <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
                    ログインして、この名前を押さえましょう
                  </h1>
                  <p className="mt-1.5 text-sm text-ink2">
                    <span className="tnum font-medium text-ink">{customerSiteLabel(slug)}</span>
                    {" "}をあなたのものとして確保します。ここから先は自動で保存されるので、
                    途中でやめても続きから始められます。
                  </p>

                  <div className="mt-7">
                    {reserving || (authReady && user) ? (
                      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-5 text-sm text-ink2">
                        <Loader2 className="size-4 animate-spin text-accent" aria-hidden />
                        名前を確保しています…
                      </div>
                    ) : (
                      <SignInPanel slug={slug} />
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : step === STEP_COLOR ? (
              /* ── STEP 2: 色を決める ── */
              <AnimatePresence mode="wait">
                <motion.div
                  key="step-color"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="grid gap-6 lg:grid-cols-[1fr_minmax(0,360px)]"
                >
                  <div>
                    <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
                      サイトの色を決めましょう
                    </h1>
                    <p className="mt-1.5 text-sm text-ink2">
                      会社の顔になる色をひとつ選ぶだけ。見出しも、地の色も、ボタンも、
                      この色から作られてサイト全体でそろいます。あとから変えられます。
                    </p>

                    <div className="mt-7">
                      <BrandPicker value={brandChoice} onChange={setBrandChoice} />
                    </div>

                    {/* 何が変わるかを見せる帯 */}
                    <div className="mt-6">
                      <PaletteBoard
                        palette={boardPalette}
                        chosen={!!primary}
                        hasSubs={!!sub1 || !!sub2}
                      />
                    </div>
                  </div>

                  {/* 右：その色のサイトを実際に出す */}
                  <aside className="lg:sticky lg:top-6 h-fit">
                    <PreviewPanel
                      src={templatePreviewUrl(sampleFamily, settledBrand)}
                      displayName={displayName}
                      urlLabel={previewUrlLabel}
                      palette={boardPalette}
                      note={primary ? "選んだ色で表示中" : "テンプレートのもとの色"}
                    />
                    <p className="mt-2 text-xs text-ink3">
                      色を変えると、この見本もその場で塗り替わります。
                    </p>
                  </aside>
                </motion.div>
              </AnimatePresence>
            ) : step === STEP_INDUSTRY ? (
              /* ── STEP 3: 業種（10） ── */
              <AnimatePresence mode="wait">
                <motion.div
                  key="step-industry"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {colorBar}

                  <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
                    どんな商売のサイトですか？
                  </h1>
                  <p className="mt-1.5 text-sm text-ink2">
                    業種を選ぶと、その商売に欠かせない内容が最初から並んだサイトになります。
                  </p>

                  <Choice
                    items={TEMPLATES}
                    value={family}
                    onValueChange={pickFamily}
                    ariaLabel="業種"
                    className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {(t, selected) => (
                      <div
                        className={[
                          "flex h-full flex-col overflow-hidden rounded-xl border bg-surface transition-[border-color,box-shadow] duration-200 ease-brand",
                          selected
                            ? "border-accent shadow-sh2"
                            : "border-line shadow-sh1 hover:border-brand/40",
                        ].join(" ")}
                      >
                        {/* その業種の初期パレット帯 */}
                        <div className="flex h-2.5" aria-hidden>
                          <span className="flex-[3]" style={{ background: t.palettePreset.primary }} />
                          <span className="flex-1" style={{ background: t.palettePreset.sub1 }} />
                          <span className="flex-1" style={{ background: t.palettePreset.sub2 }} />
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-ink">{t.industry}</h3>
                            {selected && (
                              <Badge tone="accent">
                                <Check className="size-3" aria-hidden /> 選択中
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-ink2">{t.tagline}</p>
                          <p className="mt-auto pt-3 text-[11px] text-ink3">
                            {industryNamesFor(t.id, 3).join("・")} など
                          </p>
                        </div>
                      </div>
                    )}
                  </Choice>

                  {/* 細かい業種名から探す */}
                  <div className="mt-6 rounded-xl border border-line bg-surface p-4">
                    <label
                      htmlFor="industry-detail"
                      className="flex items-center gap-2 text-sm font-medium text-ink"
                    >
                      <Search className="size-4 text-accent" aria-hidden />
                      自分の商売が見つからないときは
                    </label>
                    <p className="mt-1 text-xs text-ink3">
                      商売の名前を選ぶと、いちばん近い業種のサイトを用意します。
                    </p>
                    <select
                      id="industry-detail"
                      value={industryId ?? ""}
                      onChange={(e) => pickIndustry(e.target.value)}
                      className="mt-3 h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">選んでください</option>
                      {industryGroups.map((g) => (
                        <optgroup key={g.templateId} label={g.label}>
                          {g.items.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    {industryId && template && (
                      <p className="mt-2 text-xs text-ink2">
                        「{findIndustry(industryId)?.name}」は
                        <span className="font-medium text-ink">{template.industry}</span>
                        のサイトで作ります。
                      </p>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              /* ── STEP 4〜7: 左が決めること・右にプレビュー ── */
              <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,400px)]">
                <div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* 選んだ色・業種・プランの控え（プラン以降） */}
                      {step >= STEP_PLAN && (
                        <div className="mb-5 flex items-center gap-3 rounded-lg border border-line bg-surface2 px-3.5 py-2.5">
                          <BrandStrip palette={boardPalette} />
                          <div className="min-w-0 flex-1 text-sm">
                            <span className="font-medium text-ink">{industryName}</span>
                            <span className="mx-1.5 text-ink3">·</span>
                            <span className="text-ink2">{PLAN_LABELS[plan]}</span>
                            <span className="tnum text-ink2"> {PLAN_PRICES[plan]}/月</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStep(STEP_COLOR)}
                            className="shrink-0 rounded text-xs font-medium text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            変更
                          </button>
                        </div>
                      )}

                      {/* STEP 4: 見せ方（選んだ色の実物） */}
                      {step === STEP_LOOK && template && (
                        <>
                          {colorBar}
                          <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
                            {template.industry}のサイトは、こうなります
                          </h1>
                          <p className="mt-1.5 text-sm text-ink2">
                            選んだ色で塗った実物です。{template.tagline}。
                            中の文字や写真は、公開したあとで自由に差し替えられます。
                          </p>

                          {/* 大きく1枚 */}
                          <div className="mt-6">
                            <PreviewPanel
                              src={previewSrc}
                              displayName={displayName}
                              urlLabel={previewUrlLabel}
                              palette={boardPalette}
                              height={520}
                              scale={0.52}
                              note={displayName ? `「${displayName}」で表示中` : "選んだ色で表示中"}
                            />
                          </div>

                          {/* 別の業種も見る */}
                          <div className="mt-5">
                            <p className="text-xs font-medium text-ink2">別の業種の見せ方も見る</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {TEMPLATES.map((t) => (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => pickFamily(t.id)}
                                  aria-pressed={t.id === family}
                                  className={[
                                    "rounded-pill px-3 py-1.5 text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
                                    t.id === family
                                      ? "bg-accent-soft text-ink ring-1 ring-accent/50"
                                      : "bg-surface2 text-ink2 hover:text-ink",
                                  ].join(" ")}
                                >
                                  {t.industry}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* STEP 5: プラン */}
                      {step === STEP_PLAN && (
                        <>
                          <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
                            プランを選びましょう
                          </h1>
                          <p className="mt-1.5 text-sm text-ink2">
                            まずは無料の「おためし」でも始められます。プランを変えると、
                            右の構成とプレビューもその場で変わります。
                          </p>
                          <Choice
                            items={PLANS}
                            value={plan}
                            onValueChange={(id) => setPlan(id as Plan)}
                            ariaLabel="料金プラン"
                            className="mt-6 flex flex-col gap-3"
                          >
                            {(p, selected) => (
                              <div
                                className={[
                                  "relative rounded-xl border bg-surface p-5 transition-[border-color,box-shadow] duration-200 ease-brand",
                                  selected
                                    ? "border-accent shadow-sh2"
                                    : "border-line shadow-sh1 hover:border-brand/40",
                                ].join(" ")}
                              >
                                {p.id === "omakase" && (
                                  <span className="absolute -top-2.5 left-5">
                                    <Badge tone="accent">人気</Badge>
                                  </span>
                                )}
                                <div className="flex items-baseline justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-ink">{PLAN_LABELS[p.id]}</h3>
                                    {selected && <Check className="size-4 text-accent" aria-hidden />}
                                  </div>
                                  <p>
                                    <span className="tnum text-xl font-bold text-ink">
                                      {PLAN_PRICES[p.id]}
                                    </span>
                                    <span className="text-sm text-ink2"> /月</span>
                                  </p>
                                </div>
                                <p className="mt-1 text-sm text-ink2">{p.blurb}</p>
                                <ul className="mt-3 flex flex-col gap-1.5">
                                  {p.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2 text-sm text-ink2">
                                      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </Choice>
                        </>
                      )}

                      {/* STEP 6: 会社の情報 */}
                      {step === STEP_COMPANY && (
                        <>
                          <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
                            会社のことを教えてください
                          </h1>
                          <p className="mt-1.5 text-sm text-ink2">
                            サイトに載せる基本の情報です。あとから直せます。
                          </p>
                          <div className="mt-6 flex flex-col gap-5">
                            <Field
                              label="会社名・お店の名前"
                              required
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              placeholder="例）まど工務店"
                              helper="入力すると右のプレビューに反映されます。"
                              autoComplete="organization"
                            />
                            <Field
                              label="メールアドレス"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="you@example.com"
                              helper="ログイン中のメールが入っています。変えても大丈夫です。"
                              autoComplete="email"
                            />
                            <Field
                              label="電話番号（任意）"
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="例）03-1234-5678"
                              helper="サイトに載せたくなければ空のままで大丈夫です。"
                              autoComplete="tel"
                            />
                          </div>
                        </>
                      )}

                      {/* STEP 7: 確認して公開 */}
                      {step === STEP_CONFIRM && (
                        <>
                          <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
                            内容を確認して公開しましょう
                          </h1>
                          <p className="mt-1.5 text-sm text-ink2">
                            この内容でよければ、ボタンひとつで完成です。
                          </p>

                          <dl className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
                            <SummaryRow label="サイトの名前" first>
                              <span className="tnum break-all">{customerSiteLabel(slug)}</span>
                            </SummaryRow>
                            <SummaryRow label="色">
                              <span className="flex items-center justify-end gap-2">
                                <BrandStrip palette={boardPalette} />
                                <span>{colorName ?? boardPalette.primary}</span>
                              </span>
                            </SummaryRow>
                            <SummaryRow label="業種">
                              {industryName}
                              {industryId && (
                                <span className="ml-1.5 text-ink2">
                                  （{findIndustry(industryId)?.name}）
                                </span>
                              )}
                            </SummaryRow>
                            <SummaryRow label="プラン">
                              {PLAN_LABELS[plan]}
                              <span className="tnum ml-1.5 text-ink2">{PLAN_PRICES[plan]}/月</span>
                            </SummaryRow>
                            <SummaryRow label="会社名">{companyName.trim() || "—"}</SummaryRow>
                            <SummaryRow label="メール">{email || user?.email || "—"}</SummaryRow>
                            <SummaryRow label="電話">{phone.trim() || "未入力"}</SummaryRow>
                          </dl>

                          <div className="mt-4 flex items-start gap-2 rounded-lg bg-surface2 px-3.5 py-3 text-xs text-ink2">
                            <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                            <span>
                              制作費は0円。いつでも解約でき、違約金もありません。解約後もサイトは残ります。
                            </span>
                          </div>

                          <div className="mt-6">
                            <Button
                              variant="cta"
                              size="lg"
                              block
                              loading={submitting}
                              disabled={submitting || !slugReady || companyName.trim().length < 1}
                              leftIcon={submitting ? undefined : <Sparkles className="size-4" aria-hidden />}
                              onClick={submit}
                            >
                              {ctaLabel}
                            </Button>
                            {plan !== "otameshi" && (
                              <p className="mt-2 text-center text-xs text-ink3">
                                お支払いの画面（Stripe）に移ります。
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* 右：構成と（見せ方以外では）プレビュー。色・業種・プランの変更で読み直す */}
                <aside className="lg:sticky lg:top-6 h-fit">
                  {step !== STEP_LOOK && (
                    <PreviewPanel
                      src={previewSrc}
                      displayName={displayName}
                      urlLabel={previewUrlLabel}
                      palette={boardPalette}
                      note={
                        displayName
                          ? `「${displayName}」で表示中`
                          : primary
                            ? "選んだ色で表示中"
                            : "テンプレートのもとの色"
                      }
                    />
                  )}
                  {family && (
                    <Card className={step === STEP_LOOK ? "" : "mt-4"}>
                      <StructureList templateId={family} plan={plan} />
                    </Card>
                  )}
                </aside>
              </div>
            )}
          </div>

          {/* 進む・戻る（確認ステップの決定ボタンは本文の中にある） */}
          <div className="mt-10 flex items-center gap-3">
            {step > STEP_ADDRESS && (
              <Button variant="ghost" onClick={back} leftIcon={<ArrowLeft className="size-4" aria-hidden />}>
                戻る
              </Button>
            )}
            {step < LAST_STEP && step !== STEP_LOGIN && (
              <Button
                variant="primary"
                className="ml-auto"
                onClick={next}
                disabled={!canNext}
                loading={step === STEP_ADDRESS && reserving}
                rightIcon={<ArrowRight className="size-4" aria-hidden />}
              >
                {nextLabel}
              </Button>
            )}
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}

/* ═══════════════════════════════════════
   ログインの入り口（パスキー / Google / メール）
   ═══════════════════════════════════════ */
function SignInPanel({ slug }: { slug: string }) {
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailErr, setEmailErr] = useState<string | undefined>(undefined);
  const [pwErr, setPwErr] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [sentMail, setSentMail] = useState(false);

  async function handleGoogle() {
    setGoogleBusy(true);
    // Google の画面に移る前に、いまの入力を控えておく（戻ってきたら復元する）
    const r = await signInWithGoogle("/start");
    if (!r.ok) {
      toast({
        title: "Google に進めませんでした",
        description: r.message ?? "時間をおいて試してください。",
        tone: "danger",
      });
      setGoogleBusy(false);
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailErr(undefined);
    setPwErr(undefined);

    let bad = false;
    if (!EMAIL_RE.test(email.trim())) {
      setEmailErr("メールアドレスの形をご確認ください。");
      bad = true;
    }
    if (password.length < (mode === "signup" ? 8 : 1)) {
      setPwErr(mode === "signup" ? "8文字以上にしてください。" : "パスワードを入れてください。");
      bad = true;
    }
    if (bad) return;

    setBusy(true);
    const r =
      mode === "signup"
        ? await signUpWithEmail(email, password, "/start")
        : await signInWithEmail(email, password);
    setBusy(false);

    if (!r.ok) {
      setPwErr(r.message);
      return;
    }
    if (mode === "signup" && r.needsEmailConfirm) {
      setSentMail(true);
      return;
    }
    // 成功したら onAuthStateChange が拾い、そのまま名前の確保へ進む
  }

  if (sentMail) {
    return (
      <div className="rounded-xl border border-line bg-surface p-5">
        <h2 className="font-bold text-ink">確認のメールを送りました</h2>
        <p className="mt-1.5 text-sm text-ink2">
          届いたメールのリンクを開くと、この続きに戻ります。
          <span className="tnum"> {slug}</span> の名前はそのまま押さえます。
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-sh1">
      <PasskeyButton next="/start" variant="primary" />

      <div className="my-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" aria-hidden />
        <span className="text-xs text-ink3">または</span>
        <span className="h-px flex-1 bg-line" aria-hidden />
      </div>

      <Button
        variant="secondary"
        size="lg"
        block
        loading={googleBusy}
        onClick={handleGoogle}
        leftIcon={<GoogleIcon />}
      >
        Google で続ける
      </Button>

      <form onSubmit={handleEmail} className="mt-5 flex flex-col gap-4" noValidate>
        <Field
          label="メールアドレス"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          error={emailErr}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="パスワード"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          placeholder="8文字以上"
          value={password}
          error={pwErr}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="submit"
          variant="secondary"
          size="lg"
          block
          loading={busy}
          leftIcon={<KeyRound className="size-[18px]" aria-hidden />}
        >
          {mode === "signup" ? "メールではじめる" : "メールでログイン"}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-ink2">
        {mode === "signup" ? "すでにアカウントをお持ちですか？" : "メールではじめての方は"}{" "}
        <button
          type="button"
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          className="rounded font-medium text-accent underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          {mode === "signup" ? "ログイン" : "新規登録"}
        </button>
      </p>
    </div>
  );
}
