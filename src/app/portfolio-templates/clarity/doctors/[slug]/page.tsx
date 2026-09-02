"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Clock,
  Phone,
  User,
  ChevronRight,
  ArrowLeft,
  Award,
  Briefcase,
  MessageCircle,
} from "lucide-react";
import type { SiteConfig } from "@/lib/site-config-schema";
import siteConfig from "../../site.config.json";

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
  career?: string[];
  message?: string;
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
function Breadcrumb({ name }: { name: string }) {
  return (
    <nav className="max-w-[1000px] mx-auto px-5 py-4">
      <ol className="flex items-center gap-2 text-xs text-[#5A7A82]">
        <li>
          <Link href="/portfolio-templates/clarity" className="hover:text-[#2E7D8C] transition-colors">
            トップ
          </Link>
        </li>
        <li><ChevronRight className="w-3 h-3" /></li>
        <li>
          <Link href="/portfolio-templates/clarity/doctors" className="hover:text-[#2E7D8C] transition-colors">
            スタッフ紹介
          </Link>
        </li>
        <li><ChevronRight className="w-3 h-3" /></li>
        <li className="text-[#1A2E33] font-medium">{name}</li>
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
export default function DoctorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const member = STAFF.find((s) => s.slug === slug);
  const otherStaff = STAFF.filter((s) => s.slug !== slug);
  const memberIndex = STAFF.findIndex((s) => s.slug === slug);
  const isDoctor = memberIndex === 0;

  if (!member) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#1A2E33] font-bold text-xl mb-3">スタッフが見つかりません</p>
            <Link href="/portfolio-templates/clarity/doctors" className="text-[#2E7D8C] text-sm underline">
              スタッフ一覧に戻る
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <Breadcrumb name={member.name} />

      <main className="pb-20">
        {/* プロフィールヘッダー */}
        <section className="bg-[#F5F9FA] border-b border-[#D8E8EC] py-12 sm:py-16">
          <div className="max-w-[800px] mx-auto px-5">
            <motion.div
              className="sm:flex sm:gap-8 sm:items-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* 写真（大きく） */}
              <div className="flex-shrink-0 mb-6 sm:mb-0">
                <div className="relative w-[180px] h-[230px] sm:w-[200px] sm:h-[260px] rounded-2xl mx-auto sm:mx-0 overflow-hidden shadow-lg shadow-[#2E7D8C]/10">
                  {isDoctor ? (
                    <Image
                      src="/images/templates/clarity/doctor.jpg"
                      alt={member.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-[#D8E8EC] to-[#C5D9DD] flex items-center justify-center">
                      <User className="w-12 h-12 text-[#B0CDD3]" />
                    </div>
                  )}
                </div>
              </div>

              {/* テキスト */}
              <div className="flex-1 text-center sm:text-left">
                <span className="inline-block px-3 py-1 rounded-full bg-[#2E7D8C]/10 text-[#2E7D8C] text-xs font-medium mb-3">
                  {member.role}
                </span>
                <h1 className="text-[#1A2E33] font-bold text-2xl sm:text-3xl mb-4">
                  {member.name}
                </h1>

                {member.bio && (
                  <p className="text-[#5A7A82] text-sm leading-[2] mb-4">
                    {member.bio}
                  </p>
                )}

                {/* 資格バッジ */}
                {member.qualifications && member.qualifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {member.qualifications.map((q) => (
                      <span key={q} className="px-3 py-1 rounded-full bg-white border border-[#D8E8EC] text-[#1A2E33] text-xs font-medium">
                        {q}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        <div className="max-w-[800px] mx-auto px-5 py-12 sm:py-16 space-y-10">
          {/* 経歴 */}
          {member.career && member.career.length > 0 && (
            <motion.div
              className="bg-white rounded-2xl border border-[#D8E8EC] overflow-hidden"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="px-6 py-4 bg-[#EDF5F7] border-b border-[#D8E8EC]">
                <h2 className="text-[#1A2E33] font-bold text-base flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#2E7D8C]" />
                  経歴
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-0">
                  {member.career.map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#2E7D8C] flex-shrink-0 mt-1.5" />
                        {i < member.career!.length - 1 && (
                          <div className="w-px h-8 bg-[#D8E8EC]" />
                        )}
                      </div>
                      <p className="text-[#1A2E33] text-sm leading-relaxed pb-4">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 資格・専門分野 */}
          {member.qualifications && member.qualifications.length > 0 && (
            <motion.div
              className="bg-white rounded-2xl border border-[#D8E8EC] overflow-hidden"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="px-6 py-4 bg-[#EDF5F7] border-b border-[#D8E8EC]">
                <h2 className="text-[#1A2E33] font-bold text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#2E7D8C]" />
                  資格・専門分野
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-2.5">
                  {member.qualifications.map((q) => (
                    <div key={q} className="flex items-center gap-2.5 text-[#1A2E33] text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D8C] flex-shrink-0" />
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 患者様へのメッセージ */}
          {member.message && (
            <motion.div
              className="bg-[#F5F9FA] rounded-2xl border border-[#D8E8EC] p-6 sm:p-8"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-[#1A2E33] font-bold text-base mb-4 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#2E7D8C]" />
                患者様へのメッセージ
              </h2>
              <p className="text-[#1A2E33] text-sm sm:text-base leading-[2.2]">
                {member.message}
              </p>
            </motion.div>
          )}

          {/* 予約CTA */}
          <motion.div
            className="bg-[#2E7D8C] rounded-2xl p-8 text-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-white font-bold text-lg mb-2">
              この{member.role === "院長" ? "医師" : "スタッフ"}の診察を予約する
            </p>
            <p className="text-white/70 text-sm mb-5">
              お電話またはwebからご予約いただけます。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`tel:${COMPANY.phone}`}
                className="px-8 py-3 rounded-lg bg-white text-[#2E7D8C] font-bold text-sm hover:bg-white/90 transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4" /> {COMPANY.phone}
              </a>
              <Link
                href="/portfolio-templates/clarity#contact"
                className="px-8 py-3 rounded-lg bg-white/10 border border-white/30 text-white text-sm hover:bg-white/20 transition-colors"
              >
                webで予約する
              </Link>
            </div>
          </motion.div>

          {/* 他のスタッフ */}
          {otherStaff.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-[#1A2E33] font-bold text-lg mb-5">その他のスタッフ</h2>
              <div className="space-y-3">
                {otherStaff.map((s) => {
                  const otherIndex = STAFF.findIndex((st) => st.id === s.id);
                  const isOtherDoctor = otherIndex === 0;
                  return (
                    <Link
                      key={s.id}
                      href={`/portfolio-templates/clarity/doctors/${s.slug || `staff-${s.id}`}`}
                      className="flex items-center gap-4 p-4 rounded-xl border border-[#D8E8EC] bg-white hover:shadow-sm hover:border-[#5BA4B5]/40 transition-all group"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        {isOtherDoctor ? (
                          <Image
                            src="/images/templates/clarity/doctor.jpg"
                            alt={s.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-b from-[#D8E8EC] to-[#C5D9DD] flex items-center justify-center">
                            <User className="w-5 h-5 text-[#B0CDD3]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="text-[#2E7D8C] text-xs font-medium">{s.role}</span>
                        <p className="text-[#1A2E33] text-sm font-medium group-hover:text-[#2E7D8C] transition-colors">
                          {s.name}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#D8E8EC] group-hover:text-[#2E7D8C] transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
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

