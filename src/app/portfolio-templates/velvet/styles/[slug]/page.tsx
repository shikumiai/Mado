import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Phone,
  Scissors,
  ChevronRight,
  ChevronLeft,
  Clock,
  User,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, GalleryItem, StaffMember } from "@/lib/site-config-schema";
import siteConfig from "../../site.config.json";

/* ═══════════════════════════════════════
   データ読み込み
   ═══════════════════════════════════════ */
const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const GALLERY = (config.galleryItems || []) as GalleryItem[];
const STAFF = (config.staff || []) as StaffMember[];

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

/* ═══════════════════════════════════════
   Static params
   ═══════════════════════════════════════ */
export function generateStaticParams() {
  return GALLERY.filter((g) => g.slug).map((g) => ({ slug: g.slug! }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  // Next.js 15 async params -- we use synchronous data lookup
  // Metadata generation uses the slug from the URL
  return {
    title: `スタイルギャラリー | ${COMPANY.name}`,
  };
}

/* ═══════════════════════════════════════
   Page
   ═══════════════════════════════════════ */
export default async function StyleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const currentIndex = GALLERY.findIndex((g) => g.slug === slug);
  if (currentIndex === -1) notFound();

  const item = GALLERY[currentIndex];
  const prevItem = currentIndex > 0 ? GALLERY[currentIndex - 1] : null;
  const nextItem = currentIndex < GALLERY.length - 1 ? GALLERY[currentIndex + 1] : null;
  const stylistData = STAFF.find((s) => s.name === item.stylist);
  const imageUrl = GALLERY_IMAGES[currentIndex % GALLERY_IMAGES.length];

  return (
    <>
      <DemoBanner />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FAF6F5]/95 backdrop-blur-md shadow-sm">
        <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/portfolio-templates/velvet" className="flex items-center gap-3">
            <Scissors className="w-4 h-4 text-[#9B6B6B]" strokeWidth={1.5} />
            <p className="font-bold text-sm tracking-wider text-[#3A2828]">{COMPANY.name}</p>
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

      {/* Breadcrumb */}
      <nav className="max-w-[1100px] mx-auto px-5 py-4">
        <ol className="flex items-center gap-2 text-xs text-[#8A7070]">
          <li><Link href="/portfolio-templates/velvet" className="hover:text-[#9B6B6B] transition-colors">トップ</Link></li>
          <li><ChevronRight className="w-3 h-3" /></li>
          <li><Link href="/portfolio-templates/velvet/styles" className="hover:text-[#9B6B6B] transition-colors">スタイルギャラリー</Link></li>
          <li><ChevronRight className="w-3 h-3" /></li>
          <li className="text-[#3A2828] font-medium">{item.caption}</li>
        </ol>
      </nav>

      <main className="pb-20">
        <div className="max-w-[1000px] mx-auto px-5">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 py-8">
            {/* メイン画像 */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#E8DEDD]">
              <Image
                src={imageUrl}
                alt={item.caption || "スタイル写真"}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {item.category && (
                <span className="absolute top-4 left-4 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[#9B6B6B] text-xs font-medium">
                  {item.category}
                </span>
              )}
            </div>

            {/* 詳細情報 */}
            <div className="flex flex-col justify-center">
              <h1 className="text-[#3A2828] font-bold text-2xl sm:text-3xl mb-4">
                {item.caption}
              </h1>

              {item.description && (
                <p className="text-[#8A7070] text-sm leading-[2] mb-8">
                  {item.description}
                </p>
              )}

              {/* 施術情報テーブル */}
              <div className="bg-[#FAF6F5] rounded-xl border border-[#E8DEDD] overflow-hidden mb-8">
                <div className="divide-y divide-[#E8DEDD]">
                  {item.treatment && (
                    <div className="flex">
                      <div className="w-28 sm:w-32 px-4 py-3.5 bg-[#F0E8E7] text-[#8A7070] text-xs font-medium flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        施術内容
                      </div>
                      <div className="flex-1 px-4 py-3.5 text-[#3A2828] text-sm">{item.treatment}</div>
                    </div>
                  )}
                  {item.duration && (
                    <div className="flex">
                      <div className="w-28 sm:w-32 px-4 py-3.5 bg-[#F0E8E7] text-[#8A7070] text-xs font-medium flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        施術時間
                      </div>
                      <div className="flex-1 px-4 py-3.5 text-[#3A2828] text-sm">{item.duration}</div>
                    </div>
                  )}
                  {item.price && (
                    <div className="flex">
                      <div className="w-28 sm:w-32 px-4 py-3.5 bg-[#F0E8E7] text-[#8A7070] text-xs font-medium flex items-center gap-2">
                        料金
                      </div>
                      <div className="flex-1 px-4 py-3.5 text-[#9B6B6B] text-sm font-bold">{item.price}</div>
                    </div>
                  )}
                  {item.stylist && (
                    <div className="flex">
                      <div className="w-28 sm:w-32 px-4 py-3.5 bg-[#F0E8E7] text-[#8A7070] text-xs font-medium flex items-center gap-2">
                        <User className="w-3.5 h-3.5" />
                        担当
                      </div>
                      <div className="flex-1 px-4 py-3.5 text-[#3A2828] text-sm">
                        {stylistData?.slug ? (
                          <Link href={`/portfolio-templates/velvet/staff/${stylistData.slug}`} className="text-[#9B6B6B] hover:underline">
                            {item.stylist}
                          </Link>
                        ) : (
                          item.stylist
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 担当スタイリスト情報 */}
              {stylistData && (
                <div className="bg-white rounded-xl border border-[#E8DEDD] p-5 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-b from-[#E8DEDD] to-[#DDD5D3] flex-shrink-0 overflow-hidden relative">
                      {stylistData.id === 1 ? (
                        <Image
                          src="/images/templates/velvet/owner.jpg"
                          alt={stylistData.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                          <rect width="56" height="56" fill="#E8DEDD" />
                          <circle cx="28" cy="20" r="10" fill="#C4B0AE" />
                          <ellipse cx="28" cy="50" rx="18" ry="16" fill="#C4B0AE" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[#3A2828] font-bold text-sm">{stylistData.name}</p>
                        <span className="text-[#9B6B6B] text-[10px] px-2 py-0.5 rounded-full bg-[#9B6B6B]/8 font-medium">{stylistData.role}</span>
                      </div>
                      {stylistData.specialty && (
                        <p className="text-[#8A7070] text-xs">得意: {stylistData.specialty}</p>
                      )}
                    </div>
                    {stylistData.slug && (
                      <Link
                        href={`/portfolio-templates/velvet/staff/${stylistData.slug}`}
                        className="text-[#9B6B6B] text-xs hover:underline flex items-center gap-1 flex-shrink-0"
                      >
                        詳しく見る <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* CTA */}
              <a
                href={`tel:${COMPANY.phone}`}
                className="flex items-center justify-center gap-2 py-4 rounded-lg bg-[#9B6B6B] text-white font-bold text-sm tracking-wider hover:bg-[#846060] transition-colors shadow-lg shadow-[#9B6B6B]/20"
              >
                <Phone className="w-4 h-4" />
                このスタイルで予約する
              </a>
              <p className="text-[#8A7070] text-xs text-center mt-2">
                ※ お電話でのご予約が確実です
              </p>
            </div>
          </div>

          {/* 前後ナビゲーション */}
          <div className="flex items-center justify-between py-10 border-t border-[#E8DEDD] mt-8">
            {prevItem ? (
              <Link
                href={`/portfolio-templates/velvet/styles/${prevItem.slug || prevItem.id}`}
                className="flex items-center gap-3 text-[#8A7070] hover:text-[#9B6B6B] transition-colors group"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <div>
                  <p className="text-[10px] tracking-wider mb-0.5">PREV</p>
                  <p className="text-sm font-medium text-[#3A2828] group-hover:text-[#9B6B6B] transition-colors">{prevItem.caption}</p>
                </div>
              </Link>
            ) : (
              <div />
            )}
            {nextItem ? (
              <Link
                href={`/portfolio-templates/velvet/styles/${nextItem.slug || nextItem.id}`}
                className="flex items-center gap-3 text-[#8A7070] hover:text-[#9B6B6B] transition-colors group text-right"
              >
                <div>
                  <p className="text-[10px] tracking-wider mb-0.5">NEXT</p>
                  <p className="text-sm font-medium text-[#3A2828] group-hover:text-[#9B6B6B] transition-colors">{nextItem.caption}</p>
                </div>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 bg-[#3A2828] pb-24 md:pb-10">
        <div className="max-w-[1200px] mx-auto px-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-white/10">
            <Link href="/portfolio-templates/velvet" className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#C4956A]" strokeWidth={1.5} />
              <p className="text-white font-bold text-sm">{COMPANY.name}</p>
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
            <p>&copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* SP固定フッター */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#9B6B6B] safe-area-bottom">
        <a href={`tel:${COMPANY.phone}`} className="flex items-center justify-center gap-2 py-3.5 text-white font-bold text-base">
          <Phone className="w-5 h-5" /> 今すぐ予約
        </a>
      </div>
    </>
  );
}
