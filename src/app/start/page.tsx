"use client";

/**
 * /start — 申し込みの入口（作り直し・rebuild-v2）
 *
 * 落ち着いた、迷わないウィザード。1画面1決定・平易な日本語・その場フィードバック。
 * 認証は Supabase 一本。未ログインなら送信の直前に入力を退避して Google へ送り、
 * 戻ってきたら復元する。エラーは画面を飛ばさず、下のトーストにそっと出す。
 *
 * 流れ:
 *   0 雰囲気（テンプレの系統）→ 1 プラン → 2 会社の情報 → 3 サイトのアドレス → 4 確認して公開
 *
 * v1 は建築3系統（warm-craft / trust-navy / clean-arch）に集中する。
 * 業種レジストリ（35業種）はこの画面では使わない。
 */

import { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase/client";
import { signInWithGoogle } from "@/lib/supabase/sign-in";
import { createFreeSite, startPaidCheckout, checkSlugAvailability } from "@/lib/signup";
import { type Plan, PLAN_LABELS, PLAN_PRICES } from "@/lib/stripe";
import { customerSiteLabel, SITE_URL_PREFIX } from "@/lib/resolve-site";
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
import LazyIframe from "@/components/LazyIframe";
import { WindowMark } from "@/components/marketing/WindowMark";

/* ═══════════════════════════════════════
   選べる系統・プラン（v1 は建築3系統）
   ═══════════════════════════════════════ */

type Family = {
  id: string;
  name: string;
  /** どんな人向けか（一言） */
  for: string;
  blurb: string;
  fallbackBg: string;
  fallbackColors: string[];
};

const FAMILIES: Family[] = [
  {
    id: "warm-craft",
    name: "ウォームクラフト",
    for: "工務店・リフォーム",
    blurb: "木のぬくもりが伝わる、地域に根ざしたあたたかいデザイン。",
    fallbackBg: "#f6efe6",
    fallbackColors: ["#c47a3d", "#e0a45e"],
  },
  {
    id: "trust-navy",
    name: "トラストネイビー",
    for: "建設会社",
    blurb: "落ち着いたネイビー基調。実績と規模をしっかり見せる。",
    fallbackBg: "#eef1f6",
    fallbackColors: ["#25314f", "#4a73c4"],
  },
  {
    id: "clean-arch",
    name: "クリーンアーチ",
    for: "設計事務所",
    blurb: "余白を生かしたミニマル。作品そのものを主役にする。",
    fallbackBg: "#f1f1ef",
    fallbackColors: ["#3a3a3a", "#8f8f8f"],
  },
];

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

/** 系統ごとの業種（config 生成のため。レジストリは使わない） */
const FAMILY_INDUSTRY: Record<string, string> = {
  "warm-craft": "construction",
  "trust-navy": "builder",
  "clean-arch": "architect",
};

const STEP_LABELS = ["雰囲気", "プラン", "会社情報", "アドレス", "確認"];
const LAST_STEP = STEP_LABELS.length - 1;

/** 系統 + プラン → テンプレートID（おまかせ=-mid / プロ=-pro / おためし=無印） */
function toTemplateId(family: string | null, plan: Plan): string | null {
  if (!family) return null;
  const suffix = plan === "omakase" ? "-mid" : plan === "omakase-pro" ? "-pro" : "";
  return family + suffix;
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
   ライブプレビュー（選んだテンプレをそのまま出す）
   会社名を入れると iframe の中の名前がその場で入れ替わる。
   ═══════════════════════════════════════ */
function PreviewPanel({
  src,
  displayName,
  urlLabel,
}: {
  src: string;
  displayName: string;
  urlLabel: string;
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
        {/* 縮小したサイト。key を src にして系統・プランの変更で読み直す */}
        <div className="relative h-[360px] overflow-hidden bg-surface2">
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
              height: 900,
              transform: "scale(0.34)",
              pointerEvents: "none",
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-2">
          <p className="truncate text-xs text-ink2">
            {displayName.trim() ? `「${displayName.trim()}」で表示中` : "会社名を入れると反映されます"}
          </p>
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
  const [step, setStep] = useState(0);
  const [family, setFamily] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan>("otameshi");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [slug, setSlug] = useState("");

  // サイトURLの空き状況
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "ok" | "ng">("idle");
  const [slugMsg, setSlugMsg] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const templateId = toTemplateId(family, plan);
  const previewSrc = templateId ? `/portfolio-templates/${templateId}` : null;
  const displayName = companyName.trim();
  const previewUrlLabel = slug ? customerSiteLabel(slug) : `${SITE_URL_PREFIX}your-site`;

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

  /* --- ログインで離脱→復帰したときに入力を戻す（初回のみ） --- */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("startDraft");
      if (raw) {
        const d = JSON.parse(raw) as {
          family?: string;
          plan?: string;
          companyName?: string;
          phone?: string;
          slug?: string;
          step?: number;
        };
        if (typeof d.family === "string") setFamily(d.family);
        if (d.plan === "otameshi" || d.plan === "omakase" || d.plan === "omakase-pro") {
          setPlan(d.plan);
        }
        if (typeof d.companyName === "string") setCompanyName(d.companyName);
        if (typeof d.phone === "string") setPhone(d.phone);
        if (typeof d.slug === "string") setSlug(d.slug);
        if (typeof d.step === "number") setStep(Math.min(Math.max(d.step, 0), LAST_STEP));
        sessionStorage.removeItem("startDraft");
      } else {
        // トップページで入れたアドレスがあれば引き継ぐ
        const pendingSlug = sessionStorage.getItem("pendingSlug");
        if (pendingSlug) {
          setSlug(pendingSlug);
          sessionStorage.removeItem("pendingSlug");
        }
      }
    } catch {
      /* 壊れていたら無視 */
    }
  }, []);

  /* --- ログイン済みならメールを自動で入れる --- */
  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
  }, [user, email]);

  /* --- サイトURLの空き確認（少し待ってから問い合わせる） --- */
  useEffect(() => {
    const s = slug.trim();
    if (!s) {
      setSlugStatus("idle");
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
    }, 500);
    return () => clearTimeout(timer);
  }, [slug]);

  /* --- Google ログイン。直前に入力を控える --- */
  const goLogin = useCallback(async () => {
    try {
      sessionStorage.setItem(
        "startDraft",
        JSON.stringify({ family, plan, companyName, phone, slug, step }),
      );
    } catch {
      /* 保存できなくてもログインは進める */
    }
    const r = await signInWithGoogle("/start");
    if (!r.ok) {
      toast({
        title: "ログインを始められませんでした",
        description: r.message ?? "時間をおいて試してください。",
        tone: "danger",
      });
    }
    return r.ok;
  }, [family, plan, companyName, phone, slug, step, toast]);

  /* --- 送信（無料はその場で公開・有料は Stripe へ） --- */
  const submit = useCallback(async () => {
    if (!templateId || !family) return;

    // 未ログインなら、まず Google へ。戻ってきたら復元して続きから
    if (!user) {
      setSubmitting(true);
      const started = await goLogin();
      if (!started) setSubmitting(false);
      return;
    }

    setSubmitting(true);
    const input = {
      companyName: companyName.trim(),
      email: (email || user.email || "").trim(),
      phone: phone.trim() || undefined,
      industry: FAMILY_INDUSTRY[family] ?? "other",
      templateId,
      slug: slug.trim(),
    };

    try {
      if (plan === "otameshi") {
        const res = await createFreeSite(input);
        if (!res.ok) {
          toast({ title: "サイトを作れませんでした", description: res.message, tone: "danger" });
          setSubmitting(false);
          return;
        }
        window.location.href = "/app";
      } else {
        const res = await startPaidCheckout(input);
        if (!res.ok) {
          toast({ title: "お申し込みを始められませんでした", description: res.message, tone: "danger" });
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
  }, [templateId, family, user, companyName, email, phone, slug, plan, goLogin, toast]);

  /* --- 次へ進めるか --- */
  const canNext =
    step === 0
      ? !!family
      : step === 1
        ? true
        : step === 2
          ? companyName.trim().length >= 1
          : step === 3
            ? slugStatus === "ok"
            : false;

  const next = () => setStep((s) => Math.min(s + 1, LAST_STEP));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const familyName = family ? FAMILIES.find((f) => f.id === family)?.name ?? "" : "";
  const ctaLabel = !user
    ? "Google でログインして進む"
    : plan === "otameshi"
      ? "無料でサイトをつくる"
      : `お支払いに進む（${PLAN_PRICES[plan]}/月）`;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-bg text-ink">
        {/* ヘッダー */}
        <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" aria-label="トップへ" className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <WindowMark className="size-8" />
            <span className="font-serif text-xl font-bold tracking-tight text-ink">Mado</span>
          </Link>
          <div className="flex items-center gap-2">
            {authReady && !user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goLogin}
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

          <div className="mt-8">
            {step === 0 ? (
              /* ── STEP 0: 雰囲気を選ぶ ── */
              <AnimatePresence mode="wait">
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-5 flex items-center gap-3">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent-soft">
                      <Mascot size={40} />
                    </span>
                    <p className="text-sm text-ink2">
                      むずかしい設定はありません。順番に選ぶだけで、あなたのサイトができます。
                    </p>
                  </div>
                  <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">どんな雰囲気にしますか？</h1>
                  <p className="mt-1.5 text-sm text-ink2">
                    ピンときたものを選んでください。あとから変えられます。
                  </p>

                  <Choice
                    items={FAMILIES}
                    value={family}
                    onValueChange={setFamily}
                    ariaLabel="サイトの雰囲気"
                    className="mt-6 grid gap-4 sm:grid-cols-3"
                  >
                    {(fam, selected) => (
                      <div
                        className={[
                          "flex h-full flex-col overflow-hidden rounded-xl border bg-surface transition-[border-color,box-shadow] duration-200 ease-brand",
                          selected
                            ? "border-accent shadow-sh2"
                            : "border-line shadow-sh1 hover:border-brand/40",
                        ].join(" ")}
                      >
                        <div className="relative">
                          <LazyIframe
                            src={`/portfolio-templates/${fam.id}`}
                            title={`${fam.name}のプレビュー`}
                            fallbackBg={fam.fallbackBg}
                            fallbackColors={fam.fallbackColors}
                            className="h-40"
                            scale={0.26}
                            iframeHeight={820}
                          />
                          {selected && (
                            <span className="absolute right-2 top-2">
                              <Badge tone="accent">
                                <Check className="size-3" aria-hidden /> 選択中
                              </Badge>
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-baseline justify-between gap-2">
                            <h3 className="font-bold text-ink">{fam.name}</h3>
                            <span className="shrink-0 text-xs text-ink3">{fam.for}</span>
                          </div>
                          <p className="mt-1 text-sm text-ink2">{fam.blurb}</p>
                        </div>
                      </div>
                    )}
                  </Choice>
                </motion.div>
              </AnimatePresence>
            ) : (
              /* ── STEP 1〜4: 左が決めること・右にプレビュー ── */
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
                      {/* 選んだ系統・プランの控え（2以降） */}
                      {step >= 2 && (
                        <div className="mb-5 flex items-center gap-3 rounded-lg border border-line bg-surface2 px-3.5 py-2.5">
                          <div className="min-w-0 flex-1 text-sm">
                            <span className="font-medium text-ink">{familyName}</span>
                            <span className="mx-1.5 text-ink3">·</span>
                            <span className="text-ink2">{PLAN_LABELS[plan]}</span>
                            <span className="tnum text-ink2"> {PLAN_PRICES[plan]}/月</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStep(0)}
                            className="shrink-0 rounded text-xs font-medium text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            変更
                          </button>
                        </div>
                      )}

                      {/* STEP 1: プラン */}
                      {step === 1 && (
                        <>
                          <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">プランを選びましょう</h1>
                          <p className="mt-1.5 text-sm text-ink2">
                            まずは無料の「おためし」でも始められます。あとから変えられます。
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

                      {/* STEP 2: 会社の情報 */}
                      {step === 2 && (
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
                              helper={
                                user
                                  ? "ログイン中のメールを使います。"
                                  : "ログインすると自動で入ります。先に入れておいても大丈夫です。"
                              }
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

                      {/* STEP 3: サイトのアドレス */}
                      {step === 3 && (
                        <>
                          <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
                            サイトのアドレスを決めましょう
                          </h1>
                          <p className="mt-1.5 text-sm text-ink2">
                            あなたのサイトの住所になります。半角の英小文字・数字・ハイフンが使えます。
                          </p>

                          <div className="mt-6 flex flex-col gap-1.5">
                            <label htmlFor="site-slug" className="text-sm font-medium text-ink">
                              サイトのアドレス
                              <span className="ml-1 text-danger">*</span>
                            </label>
                            <div className="flex items-stretch overflow-hidden rounded-md border border-line bg-surface focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:ring-offset-bg">
                              <span className="flex items-center whitespace-nowrap border-r border-line bg-surface2 px-3 text-xs text-ink2 tnum">
                                {SITE_URL_PREFIX}
                              </span>
                              <input
                                id="site-slug"
                                value={slug}
                                onChange={(e) =>
                                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                                }
                                placeholder="madokoumuten"
                                inputMode="url"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                                aria-describedby="slug-status"
                                className="tnum h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-ink3"
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
                                  <Check className="size-3" aria-hidden /> このアドレスは使えます：
                                  <strong className="font-medium">{customerSiteLabel(slug)}</strong>
                                </span>
                              )}
                              {slugStatus === "ng" && (
                                <span className="flex items-center gap-1 text-danger">
                                  <AlertCircle className="size-3" aria-hidden />{" "}
                                  {slugMsg ?? "このアドレスは使えません。"}
                                </span>
                              )}
                              {slugStatus === "idle" && (
                                <span className="text-ink3">3〜50文字で入力してください。</span>
                              )}
                            </p>
                          </div>
                        </>
                      )}

                      {/* STEP 4: 確認して公開 */}
                      {step === 4 && (
                        <>
                          <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
                            内容を確認して公開しましょう
                          </h1>
                          <p className="mt-1.5 text-sm text-ink2">
                            この内容でよければ、ボタンひとつで完成です。
                          </p>

                          <dl className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
                            <SummaryRow label="雰囲気" first>
                              {familyName}
                            </SummaryRow>
                            <SummaryRow label="プラン">
                              {PLAN_LABELS[plan]}
                              <span className="tnum ml-1.5 text-ink2">{PLAN_PRICES[plan]}/月</span>
                            </SummaryRow>
                            <SummaryRow label="会社名">{companyName.trim() || "—"}</SummaryRow>
                            <SummaryRow label="メール">
                              {email || user?.email || "ログイン後に自動で入ります"}
                            </SummaryRow>
                            <SummaryRow label="電話">{phone.trim() || "未入力"}</SummaryRow>
                            <SummaryRow label="サイトのアドレス">
                              <span className="tnum break-all">{customerSiteLabel(slug)}</span>
                            </SummaryRow>
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
                              disabled={submitting || slugStatus !== "ok"}
                              leftIcon={
                                submitting ? undefined : !user ? (
                                  <Mail className="size-4" aria-hidden />
                                ) : (
                                  <Sparkles className="size-4" aria-hidden />
                                )
                              }
                              onClick={submit}
                            >
                              {ctaLabel}
                            </Button>
                            {!user && (
                              <p className="mt-2 text-center text-xs text-ink3">
                                Google でログインすると、この内容のまま続きから公開できます。
                              </p>
                            )}
                            {plan !== "otameshi" && user && (
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

                {/* 右のプレビュー（1〜4で出しっぱなし。系統・プラン変更で読み直す） */}
                <aside className="lg:sticky lg:top-6 h-fit">
                  {previewSrc && (
                    <PreviewPanel
                      src={previewSrc}
                      displayName={displayName}
                      urlLabel={previewUrlLabel}
                    />
                  )}
                </aside>
              </div>
            )}
          </div>

          {/* 進む・戻る（確認ステップの決定ボタンは本文の中にある） */}
          <div className="mt-10 flex items-center gap-3">
            {step > 0 && (
              <Button
                variant="ghost"
                onClick={back}
                leftIcon={<ArrowLeft className="size-4" aria-hidden />}
              >
                戻る
              </Button>
            )}
            {step < LAST_STEP && (
              <Button
                variant="primary"
                className="ml-auto"
                onClick={next}
                disabled={!canNext}
                rightIcon={<ArrowRight className="size-4" aria-hidden />}
              >
                {step === 0 ? "次へ・プランを選ぶ" : step === 3 ? "次へ・確認する" : "次へ"}
              </Button>
            )}
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}
