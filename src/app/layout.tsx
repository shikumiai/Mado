import type { Metadata } from "next";
import {
  Playfair_Display,
  Noto_Sans_JP,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});
const noto = Noto_Sans_JP({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});
const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});
export const metadata: Metadata = {
  title: "Mado｜AIでつくる。人の声で、選ぶ。",
  description:
    "商品写真から3つの制作案。人が選んだ理由を参考に、使う1案を決めるMadoの初期版です。",
  metadataBase: new URL("https://mado.shikumiai.com"),
  openGraph: {
    title: "Mado｜AIでつくる。人の声で、選ぶ。",
    description:
      "商品写真から3つの制作案。人が選んだ理由まで届く、制作の窓口。",
    type: "website",
    siteName: "Mado",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary",
    title: "Mado｜AIでつくる。人の声で、選ぶ。",
    description: "AIと人間では、分かることが違う。",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ja"
      className={`${playfair.variable} ${noto.variable} ${mono.variable} antialiased`}
    >
      <body className="min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
