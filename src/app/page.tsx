"use client";

/**
 * トップ（公開LP）。「写真を送るだけ。あとは全部おまかせ。」
 * 落ち着いた・低リテラシーでも読める設計。トークン + 共通部品 + テーマ対応。
 * 料金は共通部品 PricingCards（/pricing と同じ）を使い、表示のズレを防ぐ。
 */

import Link from "next/link";
import LazyIframe from "@/components/LazyIframe";
import { Mascot } from "@/components/ui";
import { LinkButton } from "@/components/marketing/LinkButton";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { PricingCards } from "@/components/marketing/PricingCards";
import { Faq, type FaqItem } from "@/components/marketing/Faq";
import { Reveal } from "@/components/marketing/Reveal";
import {
  ArrowRight,
  Camera,
  Sparkles,
  Rocket,
  Globe,
  Smartphone,
  Zap,
  Wallet,
  RefreshCw,
  ShieldCheck,
  Check,
  ChevronRight,
} from "lucide-react";

/* ── 共通の区切り ── */
function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={["scroll-mt-20 py-20 sm:py-24", className].join(" ")}
    >
      <div className="mx-auto max-w-6xl px-5">{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-sm font-medium tracking-wide text-accent">
      {children}
    </p>
  );
}

/* ═══════════════ Hero ═══════════════ */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div
          className="absolute -right-[12%] -top-[25%] h-[560px] w-[560px] rounded-full opacity-70"
          style={{
            background:
              "radial-gradient(circle, var(--accent-soft), transparent 70%)",
          }}
        />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 sm:pt-20 lg:grid-cols-2 lg:gap-10 lg:pb-24">
        {/* 文言 */}
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-3.5 py-1.5 text-xs text-ink2 shadow-sh1">
            <Sparkles className="size-3.5 text-accent" aria-hidden />
            制作費0円・パソコン操作いらず
          </span>

          <h1 className="mt-5 text-balance text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
            写真を送るだけ。
            <br />
            あとは<span className="text-accent">全部おまかせ</span>。
          </h1>

          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-ink2 lg:mx-0">
            工務店・建設会社・設計事務所のホームページを、制作費0円・月額0円から。
            独自ドメインも全プランで使えて、最短翌日に公開できます。
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
            <LinkButton
              href="/start"
              variant="cta"
              size="lg"
              pill
              rightIcon={<ArrowRight className="size-4" aria-hidden />}
            >
              サイトを作る
            </LinkButton>
            <LinkButton href="/pricing" variant="secondary" size="lg" pill>
              料金を見る
            </LinkButton>
          </div>

          <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-ink2 lg:justify-start">
            {["初期費用0円", "最短翌日で公開", "いつでも解約OK"].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-success" strokeWidth={2.5} aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* ビジュアル: 窓の中に実物プレビュー + むすび */}
        <div className="relative mx-auto w-full max-w-lg">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sh3">
            <div className="flex items-center gap-2 border-b border-line bg-surface2 px-4 py-2.5">
              <span className="flex gap-1.5" aria-hidden>
                <span className="size-2.5 rounded-full bg-ink3/40" />
                <span className="size-2.5 rounded-full bg-ink3/40" />
                <span className="size-2.5 rounded-full bg-ink3/40" />
              </span>
              <span className="mx-2 flex-1 truncate rounded-md bg-surface px-3 py-1 text-center text-[11px] text-ink3">
                your-company.com
              </span>
            </div>
            <LazyIframe
              src="/portfolio-templates/warm-craft"
              title="完成サイトの例（ウォームクラフト）"
              fallbackBg="#fbf7f0"
              fallbackColors={["#c2703d", "#e8dccb"]}
              className="h-64 sm:h-80"
              iframeWidth={1280}
              iframeHeight={800}
              scale={0.5}
            />
          </div>

          {/* 情報チップ（静止・割り込まない） */}
          <div className="absolute -bottom-4 left-3 flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2 shadow-sh2 sm:-left-4">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft">
              <Zap className="size-4 text-accent" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block text-[11px] text-ink3">公開まで</span>
              <span className="block text-sm font-bold text-ink">最短翌日</span>
            </span>
          </div>

          {/* むすび（副操縦士・そっと寄り添う） */}
          <div className="absolute -bottom-5 right-2 flex items-center gap-2 sm:-right-3">
            <Mascot size={56} />
            <span className="hidden rounded-pill border border-line bg-surface px-2.5 py-1 text-[11px] text-ink2 shadow-sh1 sm:inline">
              むすびが伴走します
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ 悩み → 解決 ═══════════════ */
const PROBLEMS = [
  {
    icon: Globe,
    text: "ホームページがない。名刺にURLも載せられない。",
  },
  {
    icon: Smartphone,
    text: "何年も前に作ったきり。スマホで見ると崩れている。",
  },
  {
    icon: Camera,
    text: "いい仕事をしているのに、写真がスマホに眠ったまま。",
  },
];

function ProblemSolve() {
  return (
    <Section className="bg-surface">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <Eyebrow>こんな状態、ありませんか</Eyebrow>
          <h2 className="text-2xl font-bold leading-snug text-ink sm:text-3xl">
            ホームページのことは、
            <br className="sm:hidden" />
            ずっと後回しになりがち。
          </h2>
        </Reveal>
      </div>

      <div className="mx-auto mt-12 flex max-w-2xl flex-col gap-3">
        {PROBLEMS.map((p, i) => {
          const Icon = p.icon;
          return (
            <Reveal key={p.text} delay={i * 0.06}>
              <div className="flex items-center gap-4 rounded-xl border border-line bg-bg px-5 py-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface2">
                  <Icon className="size-5 text-ink2" strokeWidth={1.75} aria-hidden />
                </span>
                <p className="text-sm text-ink sm:text-base">{p.text}</p>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-10 flex flex-col items-center gap-3">
          <span className="h-8 w-px bg-line" aria-hidden />
          <p className="text-lg font-bold">
            <span className="text-grad-accent">Mado なら、ぜんぶ解決。</span>
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

/* ═══════════════ 使い方 3ステップ ═══════════════ */
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
    <Section id="features">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <Eyebrow>使い方</Eyebrow>
          <h2 className="text-2xl font-bold leading-snug text-ink sm:text-3xl">
            やることは、3つだけ。
          </h2>
        </Reveal>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <Reveal key={s.title} delay={i * 0.08}>
              <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-sh1">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft">
                    <Icon className="size-5 text-accent" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="tnum text-sm font-medium text-ink3">
                    STEP {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink2">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* ═══════════════ テンプレート紹介（ライブプレビュー） ═══════════════ */
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

function Templates() {
  return (
    <Section id="templates" className="bg-surface">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <Eyebrow>テンプレート</Eyebrow>
          <h2 className="text-2xl font-bold leading-snug text-ink sm:text-3xl">
            業種に合わせた3系統。
          </h2>
          <p className="mt-3 text-sm text-ink2">
            下のプレビューは実際に動くサイトです。「見てみる」でデモを開けます。
          </p>
        </Reveal>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t, i) => (
          <Reveal key={t.id} delay={i * 0.08}>
            <Link
              href={`/portfolio-templates/${t.id}`}
              className="group block overflow-hidden rounded-2xl border border-line bg-bg shadow-sh1 outline-none transition-shadow duration-200 ease-brand hover:shadow-sh2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <div className="border-b border-line">
                <LazyIframe
                  src={`/portfolio-templates/${t.id}`}
                  title={`${t.name}のデモ`}
                  fallbackBg={t.fallbackBg}
                  fallbackColors={t.fallbackColors}
                  className="h-44"
                  iframeWidth={1280}
                  iframeHeight={860}
                  scale={0.32}
                />
              </div>
              <div className="flex items-start justify-between gap-3 p-5">
                <div>
                  <p className="font-bold text-ink">{t.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink2">
                    {t.tag}
                  </p>
                </div>
                <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-sm font-medium text-accent">
                  見てみる
                  <ChevronRight
                    className="size-4 transition-transform duration-200 ease-brand group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════ 料金 ═══════════════ */
function Pricing() {
  return (
    <Section id="pricing">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <Eyebrow>料金</Eyebrow>
          <h2 className="text-2xl font-bold leading-snug text-ink sm:text-3xl">
            0円からはじめて、必要なら広げる。
          </h2>
          <p className="mt-3 text-sm text-ink2">
            まずは無料のおためしから。あとからいつでもプランを変えられます。
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.05}>
        <PricingCards className="mt-12" />
      </Reveal>

      <Reveal delay={0.05}>
        <p className="mt-8 text-center text-sm">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 font-medium text-ink2 underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            料金の詳しい比較を見る
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </p>
      </Reveal>
    </Section>
  );
}

/* ═══════════════ 安心 ═══════════════ */
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
    <Section className="bg-surface">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <Eyebrow>安心して使える理由</Eyebrow>
          <h2 className="text-2xl font-bold leading-snug text-ink sm:text-3xl">
            はじめやすく、やめやすく。
          </h2>
        </Reveal>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {REASSURE.map((r, i) => {
          const Icon = r.icon;
          return (
            <Reveal key={r.title} delay={i * 0.06}>
              <div className="flex h-full items-start gap-4 rounded-2xl border border-line bg-bg p-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft">
                  <Icon className="size-5 text-accent" strokeWidth={1.75} aria-hidden />
                </span>
                <div>
                  <h3 className="font-bold text-ink">{r.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink2">
                    {r.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={0.1}>
        <div className="mx-auto mt-10 flex max-w-xl items-center gap-4 rounded-2xl border border-line bg-bg px-5 py-4">
          <Mascot size={48} />
          <p className="text-sm text-ink2">
            むずかしいことは、こちらで引き受けます。困ったら、むすびがそばで手伝います。
          </p>
        </div>
      </Reveal>
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
    <Section id="faq">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <Reveal>
            <Eyebrow>よくある質問</Eyebrow>
            <h2 className="text-2xl font-bold leading-snug text-ink sm:text-3xl">
              気になることに、先に答えます。
            </h2>
          </Reveal>
        </div>
        <Reveal delay={0.05}>
          <Faq items={FAQ_ITEMS} className="mt-10" />
        </Reveal>
      </div>
    </Section>
  );
}

/* ═══════════════ 最後のCTA ═══════════════ */
function FinalCta() {
  return (
    <Section className="bg-surface">
      <Reveal>
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-line bg-bg px-6 py-14 text-center shadow-sh2 sm:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-24 -z-0 mx-auto h-64 w-64 rounded-full opacity-60"
            style={{
              background:
                "radial-gradient(circle, var(--accent-soft), transparent 70%)",
            }}
          />
          <div className="relative">
            <h2 className="text-2xl font-bold leading-snug text-ink sm:text-3xl">
              まずは無料で、あなたの窓を開けてみませんか。
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink2">
              写真を送るだけ。制作費0円・月額0円から、最短翌日で公開できます。
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <LinkButton
                href="/start"
                variant="cta"
                size="lg"
                pill
                rightIcon={<ArrowRight className="size-4" aria-hidden />}
              >
                サイトを作る
              </LinkButton>
              <LinkButton href="/pricing" variant="secondary" size="lg" pill>
                料金を見る
              </LinkButton>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

export default function HomePage() {
  return (
    <>
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
    </>
  );
}
