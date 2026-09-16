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
  title: "Mado｜できたサイト。お客さまは、先へ進める？",
  description:
    "紹介ページから問い合わせまで。人の実操作とAIの視点で、顧客の導線を確かめるMadoの初期版です。",
  metadataBase: new URL("https://mado.shikumiai.com"),
  openGraph: {
    title: "Mado｜できたサイト。お客さまは、先へ進める？",
    description: "人の実操作とAIの視点で、顧客の導線を確かめる。",
    type: "website",
    siteName: "Mado",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary",
    title: "Mado｜できたサイト。お客さまは、先へ進める？",
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
