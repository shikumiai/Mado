"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Phone,
  Scissors,
  ChevronRight,
  Clock,
  User,
} from "lucide-react";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, GalleryItem } from "@/lib/site-config-schema";
import { usePreviewName } from "@/lib/use-preview-name";
import siteConfig from "../site.config.json";

/* ═══════════════════════════════════════
   データ読み込み
   ═══════════════════════════════════════ */
const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const GALLERY = (config.galleryItems || []) as GalleryItem[];

const GALLERY_IMAGES = [
  "/images/templates/velvet/style-1.jpg",
  "/images/templates/velvet/style-2.jpg",
  "/images/templates/velvet/style-3.jpg",
  "/images/templates/velvet/style-4.jpg",
  "/images/templates/velvet/salon.jpg",
  "/images/templates/velvet/salon-2.jpg",
  "/images/templates/velvet/style-1.jpg",
  "/images/templates/velvet/style-2.jpg",
];

const CATEGORIES = ["すべて", ...Array.from(new Set(GALLERY.map((g) => g.category).filter(Boolean)))];

/* ═══════════════════════════════════════
   Header（トップと共通パターン）
   ═══════════════════════════════════════ */
function Header() {
  const displayName = usePreviewName(COMPANY.name);

  return (
    <header className="sticky top-0 z-50 bg-[#FAF6F5]/95 backdrop-blur-md shadow-sm">
      <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/portfolio-templates/velvet" className="flex items-center gap-3">
          <Scissors className="w-4 h-4 text-[#9B6B6B]" strokeWidth={1.5} />
          <p className="font-bold text-sm tracking-wider text-[#3A2828]">
            {displayName}
          </p>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          <Link href="/portfolio-templates/velvet" className="text-sm text-[#8A7070] hover:text-[#9B6B6B] transition-colors">トップ</Link>
          <Link href="/portfolio-templates/velvet/styles" className="text-sm text-[#9B6B6B] font-medium">スタイル</Link>
          <Link href="/portfolio-templates/velvet/staff" className="text-sm text-[#8A7070] hover:text-[#9B6B6B] transition-colors">スタイリスト</Link>
          <Link href="/portfolio-templates/velvet#menu" className="text-sm text-[#8A7070] hover:text-[#9B6B6B] transition-colors">メニュー</Link>
          <Link href="/portfolio-templates/velvet#contact" className="text-sm text-[#8A7070] hover:text-[#9B6B6B] transition-colors">ご予約</Link>
        </nav>

        <a
          href={`tel:${COMPANY.phone}`}
          className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#9B6B6B] text-white text-sm font-medium hover:bg-[#846060] transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          <span className="tracking-wider">{COMPANY.phone}</span>
        </a>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════
   Footer（トップと共通パターン）
   ═══════════════════════════════════════ */
function Footer() {
  const displayName = usePreviewName(COMPANY.name);
  return (
    <footer className="py-10 bg-[#3A2828] pb-24 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-white/10">
          <Link href="/portfolio-templates/velvet" className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-[#C4956A]" strokeWidth={1.5} />
            <p className="text-white font-bold text-sm">{displayName}</p>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link href="/portfolio-templates/velvet" className="text-white/50 text-xs hover:text-white transition-colors">トップ</Link>
            <Link href="/portfolio-templates/velvet/styles" className="text-white/50 text-xs hover:text-white transition-colors">スタイル</Link>
            <Link href="/portfolio-templates/velvet/staff" className="text-white/50 text-xs hover:text-white transition-colors">スタイリスト</Link>
            <Link href="/portfolio-templates/velvet#menu" className="text-white/50 text-xs hover:text-white transition-colors">メニュー</Link>
            <Link href="/portfolio-templates/velvet#contact" className="text-white/50 text-xs hover:text-white transition-colors">ご予約</Link>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-white/30 text-xs">
          <p>{COMPANY.address}</p>
          <p>&copy; {new Date().getFullYear()} {displayName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════
   Breadcrumb
   ═══════════════════════════════════════ */
function Breadcrumb() {
  return (
    <nav className="max-w-[1100px] mx-auto px-5 py-4">
      <ol className="flex items-center gap-2 text-xs text-[#8A7070]">
        <li><Link href="/portfolio-templates/velvet" className="hover:text-[#9B6B6B] transition-colors">トップ</Link></li>
        <li><ChevronRight className="w-3 h-3" /></li>
        <li className="text-[#3A2828] font-medium">スタイルギャラリー</li>
      </ol>
    </nav>
  );
}

/* ═══════════════════════════════════════
   Page
   ═══════════════════════════════════════ */
export default function StylesListPage() {
  const [filter, setFilter] = useState("すべて");
  const filtered = filter === "すべて" ? GALLERY : GALLERY.filter((g) => g.category === filter);

  return (
    <>
      <DemoBanner />
      <Header />
      <Breadcrumb />

      <main className="pb-20">
        {/* ページヘッダー */}
        <section className="py-12 sm:py-16 bg-[#FAF6F5]">
          <div className="max-w-[1100px] mx-auto px-5 text-center">
            <p className="text-[#9B6B6B] text-xs tracking-[0.3em] mb-2 font-medium">STYLE GALLERY</p>
            <h1 className="text-[#3A2828] font-bold text-2xl sm:text-3xl mb-3">
              スタイルギャラリー
            </h1>
            <p className="text-[#8A7070] text-sm max-w-[500px] mx-auto">
              お客様の実際のスタイルをご紹介します。気になるスタイルがあればお気軽にご相談ください。
            </p>
          </div>
        </section>

        {/* フィルター */}
        <section className="py-8 bg-white">
          <div className="max-w-[1100px] mx-auto px-5">
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c as string)}
                  className={`px-5 py-2 rounded-full text-sm transition-all ${
                    filter === c
                      ? "bg-[#9B6B6B] text-white"
                      : "bg-white text-[#8A7070] border border-[#E8DEDD] hover:border-[#9B6B6B]/30"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* スタイル一覧 */}
        <section className="py-10 bg-white">
          <div className="max-w-[1100px] mx-auto px-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Link
                    href={`/portfolio-templates/velvet/styles/${item.slug || item.id}`}
                    className="block group"
                  >
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#E8DEDD] mb-3">
                      <Image
                        src={GALLERY_IMAGES[i % GALLERY_IMAGES.length]}
                        alt={item.caption || `スタイル ${i + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      {item.category && (
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[#9B6B6B] text-[10px] font-medium">
                          {item.category}
                        </span>
                      )}
                    </div>

                    <h3 className="text-[#3A2828] font-medium text-sm mb-1 group-hover:text-[#9B6B6B] transition-colors">
                      {item.caption}
                    </h3>

                    {item.stylist && (
                      <div className="flex items-center gap-1.5 text-[#8A7070] text-xs">
                        <User className="w-3 h-3" />
                        <span>{item.stylist}</span>
                      </div>
                    )}

                    {item.treatment && (
                      <div className="flex items-center gap-1.5 text-[#8A7070] text-xs mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.treatment}</span>
                      </div>
                    )}

                    {item.price && (
                      <p className="text-[#9B6B6B] font-bold text-sm mt-2">{item.price}</p>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-[#8A7070] text-sm py-16">
                該当するスタイルがありません
              </p>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-[#FAF6F5]">
          <div className="max-w-[600px] mx-auto px-5 text-center">
            <h2 className="text-[#3A2828] font-bold text-xl mb-3">
              気になるスタイルはありましたか？
            </h2>
            <p className="text-[#8A7070] text-sm mb-8 leading-relaxed">
              「このスタイルにしてみたい」「自分に似合うか相談したい」など、お気軽にお電話ください。
              カウンセリングで一緒に最適なスタイルを見つけましょう。
            </p>
            <a
              href={`tel:${COMPANY.phone}`}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[#9B6B6B] text-white font-medium text-sm hover:bg-[#846060] transition-colors shadow-lg shadow-[#9B6B6B]/20"
            >
              <Phone className="w-4 h-4" />
              電話で予約する
            </a>
          </div>
        </section>
      </main>

      <Footer />

      {/* SP固定フッター */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#9B6B6B] safe-area-bottom">
        <a href={`tel:${COMPANY.phone}`} className="flex items-center justify-center gap-2 py-3.5 text-white font-bold text-base">
          <Phone className="w-5 h-5" /> 今すぐ予約
        </a>
      </div>
    </>
  );
}
