import type { Metadata } from "next";
import SectionsGallery from "./gallery";

/**
 * 機能（セクション）部品の見本ページ。社内で見るためのもので、案内には出さない。
 * 検索にも載せない（noindex）。
 */
export const metadata: Metadata = {
  title: "部品カタログ | Mado",
  description: "機能ごとの見せ方を並べて、色を変えながら見比べる社内向けのページ。",
  robots: { index: false, follow: false },
};

export default function SectionsPage() {
  return <SectionsGallery />;
}
