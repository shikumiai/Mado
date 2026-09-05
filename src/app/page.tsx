"use client";

/**
 * トップ（公開LP）。旗艦。世界観 = 窓・職人・あたたかい光。
 * 主張は「写真を送るだけ。あとは全部おまかせ。」を明朝で大きく。
 *
 * 守っていること（ART_DIRECTION_V2 / 40%除外リスト）:
 *  - 均等3カラムの同一カードを使わない（大小差・非対称で組む）
 *  - 浮遊UIカードのヒーローにしない（窓から差す光＋実物プレビューの1枚）
 *  - 紫グラデCTAを使わない（暖色オレンジの実面＋あかり）
 *  - スクロール fade-in を撒かない（ページロードの段階表示は1回だけ）
 *  - 中央寄せの連続を避ける（見出しは基本左寄せ、最後のCTAだけ中央）
 *  - 動きを減らす設定では静止
 */

import Link from "next/link";
import LazyIframe from "@/components/LazyIframe";
import { Mascot } from "@/components/ui";
import { LinkButton } from "@/components/marketing/LinkButton";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { PricingCards } from "@/components/marketing/PricingCards";
import { WindowFrame } from "@/components/marketing/WindowFrame";
import { Faq, type FaqItem } from "@/components/marketing/Faq";
import {
  ArrowRight,
  Camera,
  Sparkles,
  Rocket,
  Wallet,
  RefreshCw,
  ShieldCheck,
  Check,
  ChevronRight,
} from "lucide-react";

/* ── 区切り。地の色を変えて密度に緩急をつける ── */
type Tone = "bg" | "surface" | "surface2";
const TONE: Record<Tone, string> = {
  bg: "bg-bg",
  surface: "bg-surface",
  surface2: "bg-surface2",
};

function Section({
  id,
  tone = "bg",
  className = "",
  children,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={["scroll-mt-20", TONE[tone], className].join(" ")}>
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-terracotta">
      <span aria-hidden className="h-px w-6 bg-terracotta/60" />
      {children}
    </p>
  );
}

/* 屋根のラインアート（職人・建築のニュアンスを線で） */
function RoofLine({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 60"
      fill="none"
      aria-hidden
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d="M8 52 L120 10 L232 52"
        stroke="var(--brand)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      <path
        d="M32 52 V30 M120 22 V52 M208 52 V30"
        stroke="var(--brand)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path d="M104 34 h32 v18 h-32 z" stroke="var(--accent)" strokeWidth="1.5" opacity="0.9" />
    </svg>
  );
}

/* ═══════════════ Hero ═══════════════ */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-bg">
      {/* 窓から差す暖色の光（1枚の設計。静止） */}
      <div
        aria-hidden
        className="window-light pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
      />
      <div aria-hidden className="paper-grain pointer-events-none absolute inset-0 -z-10 opacity-60" />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:pb-28">
        {/* 主張 */}
        <div>
          <span className="mado-load inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-1.5 text-xs text-ink2 shadow-sh1" style={{ animationDelay: "60ms" }}>
            <Sparkles className="size-3.5 text-accent" aria-hidden />
            制作費0円・パソコン操作いらず
          </span>

          <h1
            className="mado-load font-serif mt-6 text-balance text-4xl font-bold leading-[1.14] tracking-tight text-ink sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "120ms" }}
          >
            写真を送るだけ。
            <br />
            あとは<span className="text-accent">全部おまかせ</span>。
          </h1>

          <p
            className="mado-load mt-6 max-w-md text-base leading-relaxed text-ink2 sm:text-lg"
            style={{ animationDelay: "200ms" }}
          >
            工務店・建設会社・設計事務所のホームページを、制作費0円・月額0円から。
            独自ドメインも全プランで使えて、最短翌日に公開できます。
          </p>

          <div
            className="mado-load mt-9 flex flex-col gap-3 sm:flex-row"
            style={{ animationDelay: "280ms" }}
          >
            <LinkButton
              href="/start"
              variant="cta"
              size="lg"
              rightIcon={<ArrowRight className="size-4" aria-hidden />}
            >
              サイトを作る
            </LinkButton>
            <LinkButton href="/pricing" variant="secondary" size="lg">
              料金を見る
            </LinkButton>
          </div>

          <ul
            className="mado-load mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink2"
            style={{ animationDelay: "340ms" }}
          >
            {["初期費用0円", "最短翌日で公開", "いつでも解約OK"].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-accent" strokeWidth={2.5} aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* 窓から見える実物（ライブプレビュー1枚。浮遊カードの寄せ集めにしない） */}
        <div
          className="mado-load relative mx-auto w-full max-w-xl"
          style={{ animationDelay: "180ms" }}
        >
          <WindowFrame caption="施工事例が主役のサイト（実物プレビュー）">
            <LazyIframe
              src="/portfolio-templates/warm-craft"
              title="完成サイトの例（ウォームクラフト）"
              fallbackBg="#fbf7f0"
              fallbackColors={["#c2703d", "#e8dccb"]}
              className="h-72 sm:h-[22rem]"
              iframeWidth={1280}
              iframeHeight={860}
              scale={0.52}
            />
          </WindowFrame>
          <RoofLine className="pointer-events-none absolute -bottom-9 right-2 h-14 w-48 opacity-90" />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ 悩み → 解決 ═══════════════ */
const PROBLEMS = [
  "ホームページがない。名刺にURLも載せられない。",
  "何年も前に作ったきり。スマホで見ると崩れている。",
  "いい仕事をしているのに、写真がスマホに眠ったまま。",
];

function ProblemSolve() {
  return (
    <Section tone="surface">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <Eyebrow>こんな状態、ありませんか</Eyebrow>
          <h2 className="font-serif text-3xl font-bold leading-snug text-ink sm:text-4xl">
            ホームページのことは、
            <br className="hidden sm:block" />
            ずっと後回しになりがち。
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink2">
            作る時間も、頼む相手も、費用の見当もつかない。だから後回しになる。
            その一番面倒なところを、まるごと引き受けます。
          </p>
        </div>

        <ul className="flex flex-col">
          {PROBLEMS.map((p, i) => (
            <li
              key={p}
              className="flex items-start gap-4 border-l-2 border-line py-4 pl-5 first:pt-0"
            >
              <span className="tnum mt-0.5 font-serif text-lg font-bold text-ink3">
                0{i + 1}
              </span>
              <p className="text-base text-ink">{p}</p>
            </li>
          ))}
          <li className="mt-4 flex items-center gap-3 pl-5">
            <ArrowRight className="size-5 text-accent" aria-hidden />
            <span className="font-serif text-xl font-bold text-ink">
              Mado なら、ぜんぶ<span className="text-accent">解決</span>。
            </span>
          </li>
        </ul>
      </div>
    </Section>
  );
}

/* ═══════════════ 使い方 3ステップ（1本の光の線でつなぐ） ═══════════════ */
const STEPS = [
  {
    icon: Camera,
    title: "写真を送る",
    desc: "スマホで撮った写真でOK。メールやLINEで送るだけ。むずかしい準備はいりません。",
  },
  {
    icon: Sparkles,
    title: "おまかせで作る",
    desc: "業種に合ったテンプレートを選べば、あとはこちらで形にします。文章づくりもお手伝い。",
  },
  {
    icon: Rocket,
    title: "公開する",
    desc: "できあがりを確認したら、最短翌日で公開。独自ドメインもそのまま使えます。",
  },
];

function Steps() {
  return (
    <Section id="features" tone="bg">
      <Eyebrow>使い方</Eyebrow>
      <h2 className="font-serif text-3xl font-bold leading-snug text-ink sm:text-4xl">
        やることは、3つだけ。
      </h2>

      <ol className="relative mt-14 grid gap-y-10 sm:grid-cols-3 sm:gap-x-8">
        {/* つなぐ光の線（デスクトップ・番号の後ろを通す） */}
        <span
          aria-hidden
          className="absolute left-8 right-8 top-7 hidden h-[2px] bg-gradient-to-r from-accent/50 via-accent/30 to-transparent sm:block"
        />
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={s.title} className="relative">
              <div className="flex items-center gap-3">
                <span className="relative z-10 grid size-14 place-items-center rounded-full border border-line bg-surface font-serif text-xl font-bold text-accent shadow-sh1">
                  0{i + 1}
                </span>
                <Icon className="size-5 text-ink3" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="font-serif mt-5 text-xl font-bold text-ink">
                {s.title}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink2">
                {s.desc}
              </p>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

/* ═══════════════ テンプレート（窓の中にライブプレビュー・非対称に並べる） ═══════════════ */
const TEMPLATES = [
  {
    id: "warm-craft",
    name: "ウォームクラフト",
    tag: "温もりと地域密着。工務店・リフォーム向け。",
    fallbackBg: "#fbf7f0",
    fallbackColors: ["#c2703d", "#e8dccb"],
  },
  {
    id: "trust-navy",
    name: "トラストネイビー",
    tag: "堅実で信頼感。建設会社・ゼネコン向け。",
    fallbackBg: "#0f1e33",
    fallbackColors: ["#5680c0", "#dbe4f0"],
  },
  {
    id: "clean-arch",
    name: "クリーンアーチ",
    tag: "洗練とミニマル。設計事務所向け。",
    fallbackBg: "#f4f4f2",
    fallbackColors: ["#2b2b2b", "#d8d8d4"],
  },
];

function TemplateWindow({
  t,
  big = false,
}: {
  t: (typeof TEMPLATES)[number];
  big?: boolean;
}) {
  return (
    <Link
      href={`/portfolio-templates/${t.id}`}
      className="group block rounded-xl outline-none transition-transform duration-200 ease-brand hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <WindowFrame caption={t.name}>
        <LazyIframe
          src={`/portfolio-templates/${t.id}`}
          title={`${t.name}のデモ`}
          fallbackBg={t.fallbackBg}
          fallbackColors={t.fallbackColors}
          className={big ? "h-72 sm:h-[24rem]" : "h-44"}
          iframeWidth={1280}
          iframeHeight={860}
          scale={big ? 0.5 : 0.34}
        />
      </WindowFrame>
      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <p className="text-sm leading-relaxed text-ink2">{t.tag}</p>
        <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-sm font-medium text-accent">
          見てみる
          <ChevronRight
            className="size-4 transition-transform duration-200 ease-brand group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}

function Templates() {
  const [warmCraft, trustNavy, cleanArch] = TEMPLATES;
  return (
    <Section id="templates" tone="surface">
      <div className="max-w-2xl">
        <Eyebrow>テンプレート</Eyebrow>
        <h2 className="font-serif text-3xl font-bold leading-snug text-ink sm:text-4xl">
          業種に合わせた、3つの窓。
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-ink2">
          下はどれも実際に動くサイトです。窓ごしに中を見て、しっくりくる一枚を選んでください。
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-7">
          <TemplateWindow t={warmCraft} big />
        </div>
        <div className="flex flex-col gap-8 lg:col-span-5">
          <TemplateWindow t={trustNavy} />
          <TemplateWindow t={cleanArch} />
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════ 料金 ═══════════════ */
function Pricing() {
  return (
    <Section id="pricing" tone="bg">
      <div className="max-w-2xl">
        <Eyebrow>料金</Eyebrow>
        <h2 className="font-serif text-3xl font-bold leading-snug text-ink sm:text-4xl">
          0円からはじめて、必要なら広げる。
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-ink2">
          まずは無料のおためしから。あとからいつでもプランを変えられます。
        </p>
      </div>

      <PricingCards className="mt-14" />

      <p className="mt-8 text-sm">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 font-medium text-ink2 underline-offset-4 transition-colors hover:text-ink hover:underline"
        >
          料金の詳しい比較を見る
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </p>
    </Section>
  );
}

/* ═══════════════ 安心（暖色の間（ま）に、むすびの実在感） ═══════════════ */
const REASSURE = [
  {
    icon: Wallet,
    title: "制作費は0円",
    desc: "初期費用はかかりません。月額0円のおためしから始められます。",
  },
  {
    icon: RefreshCw,
    title: "いつでも解約OK",
    desc: "違約金はありません。合わないと思ったら、いつでもやめられます。",
  },
  {
    icon: ShieldCheck,
    title: "解約後もすぐ消えない",
    desc: "解約した月の末までサイトは公開されたまま。再開もいつでもできます。",
  },
  {
    icon: Sparkles,
    title: "自分で管理できる",
    desc: "申し込みもプラン変更も解約も、同じ手軽さで。今の状況はいつでも確認できます。",
  },
];

function Reassurance() {
  return (
    <Section tone="surface2">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <Eyebrow>安心して使える理由</Eyebrow>
          <h2 className="font-serif text-3xl font-bold leading-snug text-ink sm:text-4xl">
            はじめやすく、
            <br className="hidden sm:block" />
            やめやすく。
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink2">
            むずかしいことは、こちらで引き受けます。困ったら、そばで手伝います。
          </p>

          {/* むすびの置き場（ふわっとしたリングでなく、棚の上の定位置に） */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-sh1">
            <span className="grid size-14 place-items-center rounded-lg bg-accent-soft">
              <Mascot size={44} />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-ink">むすび</span>
              <span className="block text-xs text-ink2">あなたの伴走役</span>
            </span>
          </div>
        </div>

        <ul className="flex flex-col divide-y divide-line">
          {REASSURE.map((r) => {
            const Icon = r.icon;
            return (
              <li key={r.title} className="flex items-start gap-4 py-5 first:pt-0">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface shadow-sh1">
                  <Icon className="size-5 text-accent" strokeWidth={1.75} aria-hidden />
                </span>
                <div>
                  <h3 className="font-bold text-ink">{r.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink2">{r.desc}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}

/* ═══════════════ FAQ ═══════════════ */
const FAQ_ITEMS: FaqItem[] = [
  {
    q: "パソコンが苦手でも大丈夫ですか？",
    a: "大丈夫です。写真を送っていただくだけで、サイトの作成も公開もこちらで行います。むずかしい操作はありません。",
  },
  {
    q: "どのくらいで公開できますか？",
    a: "写真とご要望をいただいてから、最短翌日で公開できます。内容によって前後する場合はその都度お伝えします。",
  },
  {
    q: "あとから写真や文章を変えられますか？",
    a: "変えられます。編集画面からいつでも直せますし、おまかせプランならAIに文章づくりを頼むこともできます。",
  },
  {
    q: "解約したらサイトは消えますか？",
    a: "解約した月の末までは公開されたままです。再開もいつでもできます。",
  },
  {
    q: "独自ドメインは使えますか？",
    a: "全プランで使えます（○○.com など）。お持ちのドメインの設定もお手伝いします。",
  },
  {
    q: "どんな業種でも対応していますか？",
    a: "工務店・建設会社・設計事務所を中心に、幅広い業種に対応します。まずはお気軽にご相談ください。",
  },
];

function FaqSection() {
  return (
    <Section id="faq" tone="bg">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <Eyebrow>よくある質問</Eyebrow>
          <h2 className="font-serif text-3xl font-bold leading-snug text-ink sm:text-4xl">
            気になることに、
            <br className="hidden sm:block" />
            先に答えます。
          </h2>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink2">
            ここにない質問も、申し込み前に気軽に聞いてください。
          </p>
        </div>
        <Faq items={FAQ_ITEMS} />
      </div>
    </Section>
  );
}

/* ═══════════════ 最後のCTA（1か所だけ中央・窓の光で締める） ═══════════════ */
function FinalCta() {
  return (
    <Section tone="surface">
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-line bg-bg px-6 py-16 text-center shadow-sh2 sm:px-12">
        <div
          aria-hidden
          className="window-light pointer-events-none absolute inset-x-0 -top-10 h-56"
        />
        <div className="relative">
          <h2 className="font-serif text-3xl font-bold leading-snug text-ink sm:text-4xl">
            まずは無料で、
            <br className="sm:hidden" />
            あなたの窓を開けてみませんか。
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ink2">
            写真を送るだけ。制作費0円・月額0円から、最短翌日で公開できます。
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton
              href="/start"
              variant="cta"
              size="lg"
              rightIcon={<ArrowRight className="size-4" aria-hidden />}
            >
              サイトを作る
            </LinkButton>
            <LinkButton href="/pricing" variant="secondary" size="lg">
              料金を見る
            </LinkButton>
          </div>
        </div>
      </div>
    </Section>
  );
}

export default function HomePage() {
  return (
    <div data-mado-marketing className="min-h-screen bg-bg text-ink">
      <SiteHeader />
      <main>
        <Hero />
        <ProblemSolve />
        <Steps />
        <Templates />
        <Pricing />
        <Reassurance />
        <FaqSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
