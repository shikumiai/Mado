import type { Metadata } from "next";
import {
  Noto_Sans_JP,
  Zen_Old_Mincho,
  Zen_Kaku_Gothic_New,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// 本文: 読みやすい角ゴシック
const notoSansJP = Noto_Sans_JP({
  variable: "--font-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// 見出しの主役: 明朝（職人・信頼のたたずまい）。CJK なので preload はしない
const zenOldMincho = Zen_Old_Mincho({
  variable: "--font-serif-mincho",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  preload: false,
});

// 温かさ重視の見出し・帯に使う角ゴシック
const zenKakuGothic = Zen_Kaku_Gothic_New({
  variable: "--font-gothic-zen",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  preload: false,
});

// 数字（金額など）を桁で揃える等幅
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-jb",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const SITE_URL = "https://mado.shikumiai.com";

export const metadata: Metadata = {
  title: "Mado｜ホームページ制作 制作費0円・月額0円から",
  description:
    "全業種対応のホームページ制作SaaS。制作費0円、月額0円から。写真を送るだけで最短翌日完成。独自ドメイン全プラン対応。",
  keywords: [
    "ホームページ制作 安い",
    "ホームページ制作 0円",
    "ウェブサイト制作 月額",
    "工務店 ホームページ",
    "建設会社 ホームページ",
  ],
  openGraph: {
    title: "Mado｜ホームページ制作 制作費0円・月額0円から",
    description:
      "写真を送るだけでホームページが完成。制作費0円、月額0円から。全業種対応。",
    url: SITE_URL,
    type: "website",
    siteName: "Mado",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mado｜ホームページ制作 制作費0円",
    description:
      "写真を送るだけでホームページが完成。制作費0円、月額0円から。全業種対応。",
    creator: "@Lyo_shikumiai",
  },
  metadataBase: new URL(SITE_URL),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Mado",
      url: SITE_URL,
      description: "全業種対応のホームページ制作サービス。制作費0円、月額0円から。",
    },
    {
      "@type": "Service",
      name: "Mado ホームページ制作",
      provider: {
        "@type": "Organization",
        name: "Mado",
        url: SITE_URL,
      },
      description:
        "全業種対応のホームページ制作。写真を送るだけで最短翌日完成。制作費0円。",
      offers: [
        {
          "@type": "Offer",
          name: "おためしプラン",
          price: "0",
          priceCurrency: "JPY",
          description:
            "テンプレート選択、写真掲載、会社概要、お問い合わせフォーム、独自ドメイン対応。無料。",
        },
        {
          "@type": "Offer",
          name: "おまかせプラン",
          price: "1480",
          priceCurrency: "JPY",
          description: "実績詳細、お客様の声、ブログ、Google Maps、SEO強化。月額。",
        },
        {
          "@type": "Offer",
          name: "おまかせプロプラン",
          price: "4980",
          priceCurrency: "JPY",
          description:
            "AIチャットボット、予約システム、採用ページ、多言語対応。月額。",
        },
      ],
      areaServed: { "@type": "Country", name: "JP" },
      serviceType: "ウェブサイト制作",
    },
    {
      "@type": "Person",
      name: "Lyo",
      jobTitle: "Webサイトデザイナー / クリエイター",
      url: SITE_URL,
      sameAs: ["https://note.com/shikumiai", "https://x.com/Lyo_shikumiai"],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "ホームページはどのくらいで完成しますか？",
          acceptedAnswer: {
            "@type": "Answer",
            text: "写真をお送りいただいてから最短翌日で完成します。制作費は0円、月額0円からご利用いただけます。",
          },
        },
        {
          "@type": "Question",
          name: "解約したらサイトは消えますか？",
          acceptedAnswer: {
            "@type": "Answer",
            text: "解約月末までサイトは公開されます。再開はいつでも可能です。データは一定期間保管されます。",
          },
        },
        {
          "@type": "Question",
          name: "パソコンが苦手でも大丈夫ですか？",
          acceptedAnswer: {
            "@type": "Answer",
            text: "はい。写真を送るだけで、あとは全部おまかせです。更新や変更もこちらで対応します。",
          },
        },
      ],
    },
  ],
};

// 初回表示のちらつき防止。保存済みのテーマを描画前に <html> へ反映する。
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${zenOldMincho.variable} ${zenKakuGothic.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-bg text-ink font-sans antialiased overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
