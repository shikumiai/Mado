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
  title: "Mado｜サイトを作る。そこまでの道も、見える。",
  description:
    "写真を送るだけでホームページができます。さらに X・LINE・Discord から自分のサイトまでの道のりが、どこで切れているか・何人来ているか分かります。制作費0円、月額0円から。",
  keywords: [
    "ホームページ制作 安い",
    "ホームページ制作 0円",
    "ウェブサイト制作 月額",
    "個人事業主 ホームページ",
    "サロン ホームページ",
    "教室 ホームページ",
    "導線 チェック LINE",
  ],
  openGraph: {
    title: "Mado｜サイトを作る。そこまでの道も、見える。",
    description:
      "写真を送るだけでホームページができます。X・LINE・Discord からサイトまでの道のりも、どこで切れているか確かめられます。制作費0円、月額0円から。",
    url: SITE_URL,
    type: "website",
    siteName: "Mado",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mado｜サイトを作る。そこまでの道も、見える。",
    description:
      "写真を送るだけでホームページができます。X・LINE・Discord からサイトまでの道のりも、どこで切れているか確かめられます。制作費0円、月額0円から。",
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
      description:
        "写真を送るだけでホームページができ、X・LINE・Discord からサイトまでの道のりも確かめられる。制作費0円、月額0円から。",
    },
    {
      "@type": "Service",
      name: "Mado ホームページ作成と導線チェック",
      provider: {
        "@type": "Organization",
        name: "Mado",
        url: SITE_URL,
      },
      description:
        "美容・飲食・教室・ジム・士業・医療・小売・工務店・建設・設計事務所の10業種に専用の作り。写真を送るだけで公開でき、導線チェックで X・LINE・Discord からサイトまでの道がどこで切れているか分かる。",
      offers: [
        {
          "@type": "Offer",
          name: "おためしプラン",
          price: "0",
          priceCurrency: "JPY",
          description:
            "10業種の作りから選んで公開。写真の差し替え、お問い合わせフォーム、公開前チェック、独自ドメイン対応。無料。",
        },
        {
          "@type": "Offer",
          name: "おまかせプラン",
          price: "1480",
          priceCurrency: "JPY",
          description:
            "部品の追加、AI 月30クレジット、導線チェック 3本と追跡リンク。月額。",
        },
        {
          "@type": "Offer",
          name: "おまかせプロプラン",
          price: "4980",
          priceCurrency: "JPY",
          description:
            "AI 月100クレジット、導線チェック 無制限、予約と採用の部品。月額。",
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
