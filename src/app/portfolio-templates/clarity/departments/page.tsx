"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  Stethoscope,
  Shield,
  Clock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  Building2,
  ChevronRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import type { SiteConfig } from "@/lib/site-config-schema";
import siteConfig from "../site.config.json";

const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const SERVICES = (config.services || []) as Array<{
  title: string;
  slug?: string;
  description: string;
  icon?: string;
  diseases?: string[];
}>;

const ICON_MAP: Record<string, typeof Heart> = {
  Heart,
  Stethoscope,
  Shield,
  Clock,
  Calendar,
  Activity,
  MapPin,
  Building2,
};

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
        <li className="text-[#1A2E33] font-medium">診療科目一覧</li>
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
export default function DepartmentsPage() {
  return (
    <>
      <Header />
      <Breadcrumb />

      <main className="pb-20">
        {/* ページタイトル */}
        <section className="bg-[#F5F9FA] border-b border-[#D8E8EC] py-12 sm:py-16">
          <div className="max-w-[1000px] mx-auto px-5 text-center">
            <p className="text-[#2E7D8C] text-xs tracking-[0.3em] mb-2 font-medium">DEPARTMENTS</p>
            <h1 className="text-[#1A2E33] font-bold text-2xl sm:text-3xl mb-3">
              診療科目一覧
            </h1>
            <p className="text-[#5A7A82] text-sm">
              幅広い症状に対応しています。お気軽にご相談ください。
            </p>
          </div>
        </section>

        {/* 科目カード一覧 */}
        <section className="max-w-[1000px] mx-auto px-5 py-12 sm:py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, i) => {
              const Icon = ICON_MAP[service.icon || "Stethoscope"] || Stethoscope;
              const slug = service.slug || `dept-${i}`;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <Link
                    href={`/portfolio-templates/clarity/departments/${slug}`}
                    className="block bg-white rounded-2xl border border-[#D8E8EC] p-6 hover:shadow-md hover:shadow-[#2E7D8C]/5 hover:border-[#5BA4B5]/40 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#2E7D8C]/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-[#2E7D8C]" strokeWidth={1.5} />
                    </div>

                    <h2 className="font-bold text-[#1A2E33] text-base mb-2 group-hover:text-[#2E7D8C] transition-colors">
                      {service.title}
                    </h2>

                    {/* 主な対応疾患 */}
                    {service.diseases && service.diseases.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[#5A7A82] text-xs font-medium mb-1.5">主な対応疾患</p>
                        <div className="flex flex-wrap gap-1.5">
                          {service.diseases.slice(0, 4).map((d) => (
                            <span key={d} className="px-2 py-0.5 rounded-full bg-[#F5F9FA] border border-[#D8E8EC] text-[#5A7A82] text-xs">
                              {d}
                            </span>
                          ))}
                          {service.diseases.length > 4 && (
                            <span className="px-2 py-0.5 text-[#2E7D8C] text-xs">
                              ほか{service.diseases.length - 4}件
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <span className="inline-flex items-center gap-1 text-[#2E7D8C] text-xs font-medium group-hover:gap-2 transition-all">
                      詳しく見る <ChevronRight className="w-3 h-3" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* 予約CTA */}
        <section className="max-w-[800px] mx-auto px-5">
          <div className="bg-[#F5F9FA] rounded-2xl border border-[#D8E8EC] p-8 text-center">
            <p className="text-[#1A2E33] font-bold text-lg mb-2">
              症状でお悩みの方はお気軽にご相談ください
            </p>
            <p className="text-[#5A7A82] text-sm mb-5">
              どの診療科を受診すればよいかわからない場合も、まずはお電話ください。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`tel:${COMPANY.phone}`}
                className="px-8 py-3 rounded-lg bg-[#2E7D8C] text-white font-medium text-sm hover:bg-[#24656F] transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4" /> {COMPANY.phone}
              </a>
              <Link
                href="/portfolio-templates/clarity#contact"
                className="px-8 py-3 rounded-lg bg-white border border-[#D8E8EC] text-[#1A2E33] text-sm hover:bg-[#F5F9FA] transition-colors"
              >
                webで予約する
              </Link>
            </div>
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
