"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Clock,
  Phone,
  User,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import type { SiteConfig } from "@/lib/site-config-schema";
import siteConfig from "../site.config.json";

const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;

type ExtendedStaff = {
  id: number;
  name: string;
  slug?: string;
  role: string;
  bio?: string;
  image?: string;
  qualifications?: string[];
};

const STAFF = (config.staff || []) as ExtendedStaff[];

/* ═══════════════════════════════════════
   診療時間テーブルデータ
   ═══════════════════════════════════════ */
const SCHEDULE = [
  { day: "月", am: true, pm: true },
  { day: "火", am: true, pm: true },
  { day: "水", am: true, pm: true },
  { day: "木", am: true, pm: true },
  { day: "金", am: true, pm: true },
  { day: "土", am: true, pm: false },
  { day: "日", am: false, pm: false },
  { day: "祝", am: false, pm: false },
];

/* ═══════════════════════════════════════
   Header
   ═══════════════════════════════════════ */
function Header() {
  return (
    <header className="bg-white border-b border-[#D8E8EC]">
      <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
        <Link
          href="/portfolio-templates/clarity"
          className="flex items-center gap-2 text-[#5A7A82] text-sm hover:text-[#2E7D8C] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          トップページに戻る
        </Link>
        <a
          href={`tel:${COMPANY.phone}`}
          className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2E7D8C] text-white text-sm font-medium hover:bg-[#24656F] transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          <span className="tracking-wider">{COMPANY.phone}</span>
        </a>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════
   パンくずナビ
   ═══════════════════════════════════════ */
function Breadcrumb() {
  return (
    <nav className="max-w-[1000px] mx-auto px-5 py-4">
      <ol className="flex items-center gap-2 text-xs text-[#5A7A82]">
        <li>
          <Link href="/portfolio-templates/clarity" className="hover:text-[#2E7D8C] transition-colors">
            トップ
          </Link>
        </li>
        <li><ChevronRight className="w-3 h-3" /></li>
        <li className="text-[#1A2E33] font-medium">スタッフ紹介</li>
      </ol>
    </nav>
  );
}

/* ═══════════════════════════════════════
   診療時間バー（フッター上）
   ═══════════════════════════════════════ */
function ScheduleBar() {
  return (
    <section className="bg-[#EDF5F7] border-t border-[#D8E8EC] py-10">
      <div className="max-w-[800px] mx-auto px-5">
        <h3 className="text-[#1A2E33] font-bold text-base mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#2E7D8C]" /> 診療時間
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#5A7A82]">
              <th className="py-2 text-left font-medium">曜日</th>
              {SCHEDULE.map((s) => (
                <th key={s.day} className="py-2 text-center font-medium">{s.day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[#D8E8EC]">
              <td className="py-2.5 text-[#5A7A82] text-xs">午前 9:00-12:30</td>
              {SCHEDULE.map((s) => (
                <td key={s.day} className="py-2.5 text-center">
                  {s.am ? <span className="text-[#2E7D8C] font-bold">○</span> : <span className="text-[#5A7A82]">×</span>}
                </td>
              ))}
            </tr>
            <tr className="border-t border-[#D8E8EC]">
              <td className="py-2.5 text-[#5A7A82] text-xs">午後 15:00-18:30</td>
              {SCHEDULE.map((s) => (
                <td key={s.day} className="py-2.5 text-center">
                  {s.pm ? <span className="text-[#2E7D8C] font-bold">○</span> : <span className="text-[#5A7A82]">×</span>}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <p className="text-[#5A7A82] text-xs mt-3">※ 受付は診療終了の30分前までです。</p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Footer
   ═══════════════════════════════════════ */
function Footer() {
  return (
    <footer className="py-8 bg-[#1A2E33] pb-24 md:pb-8">
      <div className="max-w-[1200px] mx-auto px-5 text-center">
        <p className="text-white/30 text-xs">
          &copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════
   Page
   ═══════════════════════════════════════ */
export default function DoctorsPage() {
  return (
    <>
      <Header />
      <Breadcrumb />

      <main className="pb-20">
        {/* ページタイトル */}
        <section className="bg-[#F5F9FA] border-b border-[#D8E8EC] py-12 sm:py-16">
          <div className="max-w-[1000px] mx-auto px-5 text-center">
            <p className="text-[#2E7D8C] text-xs tracking-[0.3em] mb-2 font-medium">STAFF</p>
            <h1 className="text-[#1A2E33] font-bold text-2xl sm:text-3xl mb-3">
              スタッフ紹介
            </h1>
            <p className="text-[#5A7A82] text-sm">
              患者さんに寄り添う医療を目指すスタッフをご紹介します。
            </p>
          </div>
        </section>

        {/* スタッフカード一覧 */}
        <section className="max-w-[900px] mx-auto px-5 py-12 sm:py-16">
          <div className="space-y-6">
            {STAFF.map((member, i) => {
              const slug = member.slug || `staff-${member.id}`;
              const isDoctor = i === 0;

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Link
                    href={`/portfolio-templates/clarity/doctors/${slug}`}
                    className="block bg-white rounded-2xl border border-[#D8E8EC] overflow-hidden hover:shadow-md hover:shadow-[#2E7D8C]/5 hover:border-[#5BA4B5]/40 transition-all group"
                  >
                    <div className={`p-6 sm:p-8 ${isDoctor ? "sm:flex sm:gap-8" : "sm:flex sm:gap-6"}`}>
                      {/* 写真 */}
                      <div className="flex-shrink-0 mb-5 sm:mb-0">
                        <div className={`relative ${isDoctor ? "w-[140px] h-[180px]" : "w-[100px] h-[120px]"} rounded-xl mx-auto sm:mx-0 overflow-hidden`}>
                          {isDoctor ? (
                            <Image
                              src="/images/templates/clarity/doctor.jpg"
                              alt={member.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-b from-[#D8E8EC] to-[#C5D9DD] flex items-center justify-center">
                              <User className="w-8 h-8 text-[#B0CDD3]" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* テキスト情報 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 rounded-full bg-[#2E7D8C]/10 text-[#2E7D8C] text-xs font-medium">
                            {member.role}
                          </span>
                        </div>

                        <h2 className={`font-bold text-[#1A2E33] mb-2 group-hover:text-[#2E7D8C] transition-colors ${isDoctor ? "text-xl" : "text-base"}`}>
                          {member.name}
                        </h2>

                        {/* 資格 */}
                        {member.qualifications && member.qualifications.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {member.qualifications.map((q) => (
                              <span key={q} className="px-2 py-0.5 rounded-full bg-[#F5F9FA] border border-[#D8E8EC] text-[#5A7A82] text-xs">
                                {q}
                              </span>
                            ))}
                          </div>
                        )}

                        {member.bio && (
                          <p className="text-[#5A7A82] text-sm leading-[1.9] line-clamp-2">
                            {member.bio}
                          </p>
                        )}

                        <span className="inline-flex items-center gap-1 text-[#2E7D8C] text-xs font-medium mt-3 group-hover:gap-2 transition-all">
                          詳しく見る <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>

      <ScheduleBar />
      <Footer />

      {/* SP固定フッター */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#2E7D8C] safe-area-bottom">
        <a href={`tel:${COMPANY.phone}`} className="flex items-center justify-center gap-2 py-3.5 text-white font-bold text-base">
          <Phone className="w-5 h-5" /> 今すぐ電話
        </a>
      </div>
    </>
  );
}
