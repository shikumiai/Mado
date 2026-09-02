import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Phone,
  Scissors,
  ChevronRight,
  Calendar,
  Star,
  Clock,
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
  return STAFF.filter((s) => s.slug).map((s) => ({ slug: s.slug! }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return {
    title: `スタイリスト紹介 | ${COMPANY.name}`,
  };
}

/* ═══════════════════════════════════════
   Page
   ═══════════════════════════════════════ */
export default async function StaffDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = STAFF.find((s) => s.slug === slug);
  if (!member) notFound();

  // 担当したスタイルを取得
  const relatedStyles = GALLERY.filter((g) => g.stylist === member.name);

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
            <Link href="/portfolio-templates/velvet/styles" className="text-sm text-[#8A7070] hover:text-[#9B6B6B] transition-colors">スタイル</Link>
            <Link href="/portfolio-templates/velvet/staff" className="text-sm text-[#9B6B6B] font-medium">スタイリスト</Link>
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
          <li><Link href="/portfolio-templates/velvet/staff" className="hover:text-[#9B6B6B] transition-colors">スタイリスト紹介</Link></li>
          <li><ChevronRight className="w-3 h-3" /></li>
          <li className="text-[#3A2828] font-medium">{member.name}</li>
        </ol>
      </nav>

      <main className="pb-20">
        {/* プロフィール */}
        <section className="py-8 sm:py-12 bg-white">
          <div className="max-w-[900px] mx-auto px-5">
            <div className="bg-[#FAF6F5] rounded-2xl border border-[#E8DEDD] p-8 sm:p-10">
              <div className="sm:flex sm:gap-10">
                {/* 写真 */}
                <div className="flex-shrink-0 mb-6 sm:mb-0">
                  <div className="w-[180px] h-[230px] relative rounded-xl bg-gradient-to-b from-[#E8DEDD] to-[#DDD5D3] mx-auto sm:mx-0 overflow-hidden">
                    {member.id === 1 ? (
                      <Image
                        src="/images/templates/velvet/owner.jpg"
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="180px"
                        priority
                      />
                    ) : (
                      <svg viewBox="0 0 180 230" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <rect width="180" height="230" fill="#E8DEDD" />
                        <circle cx="90" cy="75" r="32" fill="#C4B0AE" />
                        <ellipse cx="90" cy="180" rx="50" ry="48" fill="#C4B0AE" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* 情報 */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-[#3A2828] font-bold text-2xl sm:text-3xl">{member.name}</h1>
                    <span className="text-[#9B6B6B] text-xs px-3 py-1 rounded-full bg-[#9B6B6B]/8 font-medium">
                      {member.role}
                    </span>
                  </div>

                  {member.experience && (
                    <p className="text-[#8A7070] text-sm mb-4">{member.experience}</p>
                  )}

                  {member.bio && (
                    <p className="text-[#3A2828] text-sm leading-[2] mb-6">{member.bio}</p>
                  )}

                  {/* 詳細情報 */}
                  <div className="space-y-3">
                    {member.specialty && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#9B6B6B]/8 flex items-center justify-center flex-shrink-0">
                          <Star className="w-4 h-4 text-[#C4956A]" fill="currentColor" />
                        </div>
                        <div>
                          <p className="text-[#8A7070] text-[10px] tracking-wider">得意スタイル</p>
                          <p className="text-[#3A2828] text-sm font-medium">{member.specialty}</p>
                        </div>
                      </div>
                    )}
                    {member.schedule && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#9B6B6B]/8 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 text-[#9B6B6B]" />
                        </div>
                        <div>
                          <p className="text-[#8A7070] text-[10px] tracking-wider">出勤日</p>
                          <p className="text-[#3A2828] text-sm font-medium">{member.schedule}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 担当スタイルギャラリー */}
        {relatedStyles.length > 0 && (
          <section className="py-12 sm:py-16 bg-[#FAF6F5]">
            <div className="max-w-[1000px] mx-auto px-5">
              <div className="text-center mb-10">
                <p className="text-[#9B6B6B] text-xs tracking-[0.3em] mb-2 font-medium">WORKS</p>
                <h2 className="text-[#3A2828] font-bold text-xl sm:text-2xl">
                  {member.name}の担当スタイル
                </h2>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedStyles.map((style, i) => {
                  const globalIndex = GALLERY.findIndex((g) => g.id === style.id);
                  return (
                    <Link
                      key={style.id}
                      href={`/portfolio-templates/velvet/styles/${style.slug || style.id}`}
                      className="block group"
                    >
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#E8DEDD] mb-2">
                        <Image
                          src={GALLERY_IMAGES[globalIndex % GALLERY_IMAGES.length]}
                          alt={style.caption || "スタイル"}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                        {style.category && (
                          <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[#9B6B6B] text-[10px] font-medium">
                            {style.category}
                          </span>
                        )}
                      </div>
                      <h3 className="text-[#3A2828] text-sm font-medium group-hover:text-[#9B6B6B] transition-colors">
                        {style.caption}
                      </h3>
                      {style.treatment && (
                        <div className="flex items-center gap-1.5 text-[#8A7070] text-xs mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{style.treatment}</span>
                        </div>
                      )}
                      {style.price && (
                        <p className="text-[#9B6B6B] font-bold text-sm mt-1">{style.price}</p>
                      )}
                    </Link>
                  );
                })}
              </div>

              <div className="text-center mt-8">
                <Link
                  href="/portfolio-templates/velvet/styles"
                  className="inline-flex items-center gap-2 text-[#9B6B6B] text-sm font-medium hover:underline"
                >
                  すべてのスタイルを見る <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 bg-white">
          <div className="max-w-[600px] mx-auto px-5 text-center">
            <h2 className="text-[#3A2828] font-bold text-xl mb-3">
              {member.name}を指名してご予約いただけます
            </h2>
            <p className="text-[#8A7070] text-sm mb-8 leading-relaxed">
              「このスタイリストにお願いしたい」とお伝えください。カウンセリングでじっくりご要望をお伺いします。
            </p>
            <a
              href={`tel:${COMPANY.phone}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[#9B6B6B] text-white font-bold text-sm tracking-wider hover:bg-[#846060] transition-colors shadow-lg shadow-[#9B6B6B]/20"
            >
              <Phone className="w-4 h-4" />
              このスタイリストを指名する
            </a>
            <p className="text-[#8A7070] text-xs mt-2">
              ※ お電話でのご予約が確実です
            </p>
          </div>
        </section>
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
