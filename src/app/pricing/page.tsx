/**
 * 料金ページ。トップの料金セクションと同じ PricingCards を使い、
 * さらに含まれるものの比較表と、料金まわりのよくある質問を載せる。
 * サーバー部品として metadata を持ち、対話が要る部分（ヘッダー・FAQ）は
 * クライアント部品を差し込む。
 */

import type { Metadata } from "next";
import { Check } from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { PricingCards } from "@/components/marketing/PricingCards";
import { LinkButton } from "@/components/marketing/LinkButton";
import { Faq, type FaqItem } from "@/components/marketing/Faq";
import { PLAN_LABELS, PLAN_PRICES } from "@/lib/stripe";

const SITE_URL = "https://mado.shikumiai.com";

export const metadata: Metadata = {
  title: "料金 | Mado｜制作費0円・月額0円から",
  description:
    "Mado の料金プラン。おためし¥0 / おまかせ¥1,480 / おまかせプロ¥4,980（税込・月額）。制作費0円、独自ドメイン全プラン対応、いつでも解約OK。",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "料金 | Mado｜制作費0円・月額0円から",
    description:
      "おためし¥0 / おまかせ¥1,480 / おまかせプロ¥4,980（税込・月額）。制作費0円、独自ドメイン全プラン対応。",
    url: `${SITE_URL}/pricing`,
    type: "website",
    siteName: "Mado",
    locale: "ja_JP",
  },
};

/* ── 比較表のデータ（値は [おためし, おまかせ, おまかせプロ]） ── */
const COMPARE: { label: string; values: (boolean | string)[] }[] = [
  { label: "業種別テンプレート", values: [true, true, true] },
  { label: "施工写真の掲載", values: [true, true, true] },
  { label: "お問い合わせ・電話タップ", values: [true, true, true] },
  { label: "スマホ対応・SSL（https）", values: [true, true, true] },
  { label: "独自ドメイン", values: [true, true, true] },
  { label: "実績・お客様の声・ブログ", values: [false, true, true] },
  { label: "Googleマップ・SEO強化", values: [false, true, true] },
  { label: "AIにおまかせで編集", values: ["—", "月3回", "無制限"] },
  { label: "予約・問い合わせの自動化", values: [false, false, true] },
  { label: "採用ページ", values: [false, false, true] },
  { label: "多言語対応", values: [false, false, true] },
];

const PLAN_ORDER = ["otameshi", "omakase", "omakase-pro"] as const;

function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex justify-center">
        <Check className="size-4 text-success" strokeWidth={2.5} aria-label="対応" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="text-ink3" aria-label="非対応">
        —
      </span>
    );
  }
  return <span className="text-sm text-ink">{value}</span>;
}

const PRICING_FAQ: FaqItem[] = [
  {
    q: "ずっと無料で使えますか？",
    a: "はい。おためしプランは月額0円で、期限はありません。まずは無料のまま公開して、必要になったらプランを上げられます。",
  },
  {
    q: "あとからプランを変えられますか？",
    a: "変えられます。アップグレードも解約も同じ手軽さで、いつでもご自身の画面から。金額は日割りで調整されます。",
  },
  {
    q: "支払い方法は？",
    a: "クレジットカード（Stripe）でのお支払いです。次回の請求日や請求の中身は、いつでもご自身の画面で確認できます。",
  },
  {
    q: "解約したらどうなりますか？",
    a: "解約した月の末まではサイトは公開されたままです。再開もいつでもできます。違約金はありません。",
  },
  {
    q: "独自ドメインは有料ですか？",
    a: "独自ドメイン（○○.com など）は全プランで使えます。ドメイン自体の取得・更新費だけ実費でかかります。",
  },
  {
    q: "表示価格は税込ですか？",
    a: "はい。表示はすべて税込・月額です。あとから足される手数料はありません。",
  },
];

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* 見出し */}
        <section className="scroll-mt-20 pb-6 pt-16 sm:pt-20">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <p className="mb-3 text-sm font-medium tracking-wide text-accent">
              料金
            </p>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
              0円からはじめて、
              <br className="sm:hidden" />
              必要なら広げる。
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink2">
              制作費は0円。まずは無料のおためしから始めて、あとからいつでもプランを変えられます。
            </p>
          </div>
        </section>

        {/* カード */}
        <section className="pb-8">
          <div className="mx-auto max-w-6xl px-5">
            <PricingCards />
          </div>
        </section>

        {/* 比較表 */}
        <section className="scroll-mt-20 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-5">
            <h2 className="text-center text-2xl font-bold leading-snug text-ink sm:text-3xl">
              含まれるもの、ひと目で。
            </h2>

            <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-surface shadow-sh1">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line">
                    <th className="p-4 text-sm font-medium text-ink2">項目</th>
                    {PLAN_ORDER.map((plan) => (
                      <th
                        key={plan}
                        className={[
                          "p-4 text-center",
                          plan === "omakase" ? "bg-accent-soft/40" : "",
                        ].join(" ")}
                      >
                        <span className="block text-sm font-bold text-ink">
                          {PLAN_LABELS[plan]}
                        </span>
                        <span className="tnum mt-0.5 block text-xs text-ink3">
                          {PLAN_PRICES[plan]} / 月
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((row) => (
                    <tr
                      key={row.label}
                      className="border-b border-line last:border-0"
                    >
                      <th
                        scope="row"
                        className="p-4 text-left text-sm font-normal text-ink"
                      >
                        {row.label}
                      </th>
                      {row.values.map((v, i) => (
                        <td
                          key={PLAN_ORDER[i]}
                          className={[
                            "p-4 text-center",
                            PLAN_ORDER[i] === "omakase"
                              ? "bg-accent-soft/40"
                              : "",
                          ].join(" ")}
                        >
                          <Cell value={v} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-10 flex justify-center">
              <LinkButton
                href="/start"
                variant="cta"
                size="lg"
                pill
              >
                無料ではじめる
              </LinkButton>
            </div>
          </div>
        </section>

        {/* 料金のFAQ */}
        <section className="scroll-mt-20 bg-surface py-16 sm:py-20">
          <div className="mx-auto max-w-2xl px-5">
            <h2 className="text-center text-2xl font-bold leading-snug text-ink sm:text-3xl">
              料金についての質問
            </h2>
            <Faq items={PRICING_FAQ} className="mt-10" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
