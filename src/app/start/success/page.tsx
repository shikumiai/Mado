"use client";

/**
 * /start/success — お申し込み・お支払いのあとに戻ってくる完了画面（作り直し・rebuild-v2）
 *
 * 世界観は Mado ＝ 窓・職人・あたたかい光。旧デザイン（紫グラデ＋Google前提の文言）を廃し、
 * 暖色ライト・明朝見出し・窓モチーフでそろえる。「写真を送るだけ」の世界観に合う、
 * 落ち着いた完了体験にする。次の一手はマイページ（/app）へ。
 *
 * ページを開いた1回だけそっと立ち上がる（mado-load・reduced-motion で静止）。
 * 純粋な表示だけの画面（送信・課金のロジックは持たない）。
 */

import Link from "next/link";
import { LinkButton } from "@/components/marketing/LinkButton";
import { WindowMark } from "@/components/marketing/WindowMark";
import { Check, Mail, Sparkles, ArrowRight } from "lucide-react";

/** 完成までの流れ（3つ）。番号は明朝で品を出し、1本の光の線でつなぐ */
const FLOW = [
  {
    icon: Mail,
    title: "確認メールをお送りしました",
    desc: "届いていないときは、迷惑メールのフォルダもご確認ください。",
  },
  {
    icon: Sparkles,
    title: "サイトを仕上げています",
    desc: "いただいた写真と情報をもとに、最短翌日で公開できるよう準備します。",
  },
  {
    icon: Check,
    title: "完成したらお知らせします",
    desc: "公開できたら、サイトのアドレスをメールでお届けします。",
  },
];

export default function StartSuccessPage() {
  return (
    <main data-mado-marketing className="relative grid min-h-dvh place-items-center overflow-hidden bg-bg px-5 py-12 text-ink">
      {/* 窓から差す暖色の光（装飾・静止） */}
      <div aria-hidden className="window-light pointer-events-none absolute inset-x-0 top-0 h-[46vh]" />
      <div aria-hidden className="paper-grain pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative z-10 w-full max-w-xl">
        {/* 窓の印＋完了の合図 */}
        <div className="mado-load flex flex-col items-center text-center" style={{ animationDelay: "40ms" }}>
          <span className="relative inline-flex">
            <WindowMark className="size-16" />
            <span className="absolute -bottom-1.5 -right-1.5 grid size-7 place-items-center rounded-full bg-success text-white shadow-sh1 ring-2 ring-bg">
              <Check className="size-4" strokeWidth={3} aria-hidden />
            </span>
          </span>

          <h1 className="mado-load font-serif mt-6 text-3xl font-bold leading-tight text-ink sm:text-[2.1rem]" style={{ animationDelay: "120ms" }}>
            お申し込み、
            <br className="sm:hidden" />
            ありがとうございます。
          </h1>
          <p className="mado-load mt-4 max-w-md text-sm leading-relaxed text-ink2 sm:text-base" style={{ animationDelay: "200ms" }}>
            あとは、こちらにおまかせください。写真をもとにサイトを仕上げて、
            最短翌日にはあなたの窓を開けます。
          </p>
        </div>

        {/* 完成までの流れ（縦の光の線でつなぐ・紫の丸は使わない） */}
        <ol className="mado-load relative mt-10 flex flex-col" style={{ animationDelay: "280ms" }}>
          <span
            aria-hidden
            className="absolute bottom-8 left-[1.35rem] top-8 w-px bg-gradient-to-b from-accent/50 via-accent/25 to-transparent"
          />
          {FLOW.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.title} className="relative flex items-start gap-4 py-3.5">
                <span className="relative z-10 grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface shadow-sh1">
                  <span className="tnum absolute -left-1 -top-1 grid size-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-on-accent">
                    {i + 1}
                  </span>
                  <Icon className="size-5 text-accent" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="pt-1">
                  <h2 className="text-[15px] font-bold text-ink">{s.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-ink2">{s.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>

        {/* 次の一手（マイページへ） */}
        <div className="mado-load mt-10 rounded-2xl border border-line bg-surface p-6 shadow-sh2 sm:p-7" style={{ animationDelay: "360ms" }}>
          <h2 className="font-serif text-xl font-bold text-ink">サイトの編集は、マイページから。</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink2">
            ログイン中のアカウントで、いつでもマイページを開けます。写真や文章の差し替え、
            プランの変更もそちらからできます。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/app" variant="cta" size="lg" rightIcon={<ArrowRight className="size-4" aria-hidden />}>
              マイページを開く
            </LinkButton>
            <LinkButton href="/" variant="secondary" size="lg">
              トップにもどる
            </LinkButton>
          </div>
        </div>
      </div>
    </main>
  );
}
