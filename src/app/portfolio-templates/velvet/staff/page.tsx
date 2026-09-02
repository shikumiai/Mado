"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Phone,
  Scissors,
  ChevronRight,
  Calendar,
  Star,
} from "lucide-react";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, StaffMember } from "@/lib/site-config-schema";
import { usePreviewName } from "@/lib/use-preview-name";
import siteConfig from "../site.config.json";

/* ═══════════════════════════════════════
   データ読み込み
   ═══════════════════════════════════════ */
const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const STAFF = (config.staff || []) as StaffMember[];

/* ═══════════════════════════════════════
   Header
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
  );
}

/* ═══════════════════════════════════════
   Footer
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
   Page
   ═══════════════════════════════════════ */
export default function StaffListPage() {
  return (
    <>
      <DemoBanner />
      <Header />

      {/* Breadcrumb */}
      <nav className="max-w-[1100px] mx-auto px-5 py-4">
        <ol className="flex items-center gap-2 text-xs text-[#8A7070]">
          <li><Link href="/portfolio-templates/velvet" className="hover:text-[#9B6B6B] transition-colors">トップ</Link></li>
          <li><ChevronRight className="w-3 h-3" /></li>
          <li className="text-[#3A2828] font-medium">スタイリスト紹介</li>
        </ol>
      </nav>

      <main className="pb-20">
        {/* ページヘッダー */}
        <section className="py-12 sm:py-16 bg-[#FAF6F5]">
          <div className="max-w-[1100px] mx-auto px-5 text-center">
            <p className="text-[#9B6B6B] text-xs tracking-[0.3em] mb-2 font-medium">STYLIST</p>
            <h1 className="text-[#3A2828] font-bold text-2xl sm:text-3xl mb-3">
              スタイリスト紹介
            </h1>
            <p className="text-[#8A7070] text-sm max-w-[500px] mx-auto">
              一人ひとりの「似合う」を見つけるプロフェッショナル。担当制でじっくり向き合います。
            </p>
          </div>
        </section>

        {/* スタッフ一覧 */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-[900px] mx-auto px-5">
            <div className="space-y-6">
              {STAFF.map((member, i) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={`/portfolio-templates/velvet/staff/${member.slug || member.id}`}
                    className="block group"
                  >
                    <div className={`bg-white rounded-2xl border border-[#E8DEDD] overflow-hidden hover:border-[#9B6B6B]/30 hover:shadow-lg hover:shadow-[#9B6B6B]/5 transition-all ${
                      i === 0 ? "p-8 sm:p-10" : "p-6 sm:p-8"
                    }`}>
                      <div className={`${i === 0 ? "sm:flex sm:gap-8" : "sm:flex sm:gap-6"}`}>
                        {/* 写真 */}
                        <div className="flex-shrink-0 mb-5 sm:mb-0">
                          <div className={`${
                            i === 0 ? "w-[160px] h-[200px]" : "w-[120px] h-[150px]"
                          } relative rounded-xl bg-gradient-to-b from-[#E8DEDD] to-[#DDD5D3] mx-auto sm:mx-0 overflow-hidden`}>
                            {i === 0 ? (
                              <Image
                                src="/images/templates/velvet/owner.jpg"
                                alt={member.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="160px"
                              />
                            ) : (
                              <svg viewBox="0 0 140 180" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                <rect width="140" height="180" fill="#E8DEDD" />
                                <circle cx="70" cy="60" r="25" fill="#C4B0AE" />
                                <ellipse cx="70" cy="140" rx="40" ry="38" fill="#C4B0AE" />
                              </svg>
                            )}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h2 className="text-[#3A2828] font-bold text-lg group-hover:text-[#9B6B6B] transition-colors">{member.name}</h2>
                            <span className="text-[#9B6B6B] text-xs px-3 py-1 rounded-full bg-[#9B6B6B]/8 font-medium">
                              {member.role}
                            </span>
                          </div>

                          {member.specialty && (
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="w-3.5 h-3.5 text-[#C4956A]" fill="currentColor" />
                              <p className="text-[#3A2828] text-sm font-medium">{member.specialty}</p>
                            </div>
                          )}

                          {member.experience && (
                            <p className="text-[#8A7070] text-xs mb-3">{member.experience}</p>
                          )}

                          {member.bio && (
                            <p className="text-[#8A7070] text-sm leading-[1.9] line-clamp-2">{member.bio}</p>
                          )}

                          {member.schedule && (
                            <div className="flex items-center gap-2 mt-3 text-[#8A7070] text-xs">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>出勤: {member.schedule}</span>
                            </div>
                          )}

                          <p className="text-[#9B6B6B] text-xs font-medium mt-4 flex items-center gap-1 group-hover:underline">
                            詳しく見る <ChevronRight className="w-3 h-3" />
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-[#FAF6F5]">
          <div className="max-w-[600px] mx-auto px-5 text-center">
            <h2 className="text-[#3A2828] font-bold text-xl mb-3">
              スタイリストを指名してご予約いただけます
            </h2>
            <p className="text-[#8A7070] text-sm mb-8 leading-relaxed">
              初めての方でもお気軽にどうぞ。カウンセリングで髪のお悩みをじっくりお伺いします。
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
