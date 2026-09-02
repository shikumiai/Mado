import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "建築業のホームページ制作｜Mado — 制作費0円・月額0円から",
  description:
    "工務店・建設会社・設計事務所のホームページ制作。写真を送るだけで最短翌日完成。制作費0円、月額0円から。",
  openGraph: {
    title: "建築業のホームページ制作｜Mado — 制作費0円",
    description:
      "写真を送るだけでホームページが完成。制作費0円、月額0円から。独自ドメイン全プラン対応。",
    images: ["/lp-service.webp"],
    type: "website",
    siteName: "Mado by Lyo Vision",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "建築業のホームページ制作｜Mado — 制作費0円",
    description:
      "写真を送るだけでホームページが完成。制作費0円、月額0円から。独自ドメイン全プラン対応。",
    images: ["/lp-service.webp"],
    creator: "@Lyo_shikumiai",
  },
};

export default function LPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
