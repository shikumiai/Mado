"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  Stethoscope,
  Shield,
  Clock,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Building2,
  ChevronRight,
  ArrowLeft,
  Check,
  ClipboardList,
} from "lucide-react";
import type { SiteConfig } from "@/lib/site-config-schema";
import siteConfig from "../../site.config.json";

const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;

type ExtendedService = {
  title: string;
  slug?: string;
  description: string;
  icon?: string;
  diseases?: string[];
  examinations?: string[];
  treatmentFlow?: string[];
};

const SERVICES = (config.services || []) as ExtendedService[];

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
function Breadcrumb({ title }: { title: string }) {
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
          <Link href="/portfolio-templates/clarity/departments" className="hover:text-[#2E7D8C] transition-colors">
            診療科目一覧
          </Link>
        </li>
        <li><ChevronRight className="w-3 h-3" /></li>
        <li className="text-[#1A2E33] font-medium">{title}</li>
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
export default function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const service = SERVICES.find((s) => s.slug === slug);
  const otherServices = SERVICES.filter((s) => s.slug !== slug);

  if (!service) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#1A2E33] font-bold text-xl mb-3">診療科目が見つかりません</p>
            <Link href="/portfolio-templates/clarity/departments" className="text-[#2E7D8C] text-sm underline">
              診療科目一覧に戻る
            </Link>
          </div>
        </div>
      </>
    );
  }

  const Icon = ICON_MAP[service.icon || "Stethoscope"] || Stethoscope;

  return (
    <>
      <Header />
      <Breadcrumb title={service.title} />

      <main className="pb-20">
        {/* ページタイトル */}
        <section className="bg-[#F5F9FA] border-b border-[#D8E8EC] py-12 sm:py-16">
          <div className="max-w-[800px] mx-auto px-5">
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-14 h-14 rounded-xl bg-[#2E7D8C]/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-7 h-7 text-[#2E7D8C]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[#2E7D8C] text-xs tracking-[0.2em] mb-1 font-medium">DEPARTMENT</p>
                <h1 className="text-[#1A2E33] font-bold text-2xl sm:text-3xl">{service.title}</h1>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="max-w-[800px] mx-auto px-5 py-12 sm:py-16 space-y-12">
          {/* 概要 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-[#1A2E33] text-sm sm:text-base leading-[2.2]">
              {service.description}
            </p>
          </motion.div>

          {/* 対応疾患 */}
          {service.diseases && service.diseases.length > 0 && (
            <motion.div
              className="bg-white rounded-2xl border border-[#D8E8EC] overflow-hidden"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="px-6 py-4 bg-[#EDF5F7] border-b border-[#D8E8EC]">
                <h2 className="text-[#1A2E33] font-bold text-base flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[#2E7D8C]" />
                  主な対応疾患
                </h2>
              </div>
              <div className="p-6">
                <div className="grid sm:grid-cols-2 gap-3">
                  {service.diseases.map((disease) => (
                    <div key={disease} className="flex items-center gap-2.5 text-[#1A2E33] text-sm">
                      <Check className="w-4 h-4 text-[#2E7D8C] flex-shrink-0" strokeWidth={2} />
                      {disease}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 検査項目 */}
          {service.examinations && service.examinations.length > 0 && (
            <motion.div
              className="bg-white rounded-2xl border border-[#D8E8EC] overflow-hidden"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="px-6 py-4 bg-[#EDF5F7] border-b border-[#D8E8EC]">
                <h2 className="text-[#1A2E33] font-bold text-base flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#2E7D8C]" />
                  主な検査
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-2.5">
                  {service.examinations.map((exam) => (
                    <div key={exam} className="flex items-center gap-2.5 text-[#1A2E33] text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D8C] flex-shrink-0" />
                      {exam}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 診察・治療の流れ */}
          {service.treatmentFlow && service.treatmentFlow.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-[#1A2E33] font-bold text-lg mb-6 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2E7D8C]" />
                診察の流れ
              </h2>
              <div className="space-y-0">
                {service.treatmentFlow.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    {/* ステップ番号 + 縦線 */}
                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-[#2E7D8C] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      {i < service.treatmentFlow!.length - 1 && (
                        <div className="w-px h-8 bg-[#D8E8EC]" />
                      )}
                    </div>
                    <div className="pt-2 pb-4">
                      <p className="text-[#1A2E33] text-sm font-medium">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 予約CTA */}
          <motion.div
            className="bg-[#2E7D8C] rounded-2xl p-8 text-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-white font-bold text-lg mb-2">ご予約はこちら</p>
            <p className="text-white/70 text-sm mb-5">
              {service.title}の診察をご希望の方は、お電話またはwebからご予約ください。
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

          {/* 他の診療科目 */}
          {otherServices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-[#1A2E33] font-bold text-lg mb-5">その他の診療科目</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {otherServices.map((s, i) => {
                  const OtherIcon = ICON_MAP[s.icon || "Stethoscope"] || Stethoscope;
                  return (
                    <Link
                      key={i}
                      href={`/portfolio-templates/clarity/departments/${s.slug || `dept-${i}`}`}
                      className="flex items-center gap-3 p-4 rounded-xl border border-[#D8E8EC] bg-white hover:shadow-sm hover:border-[#5BA4B5]/40 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#2E7D8C]/10 flex items-center justify-center flex-shrink-0">
                        <OtherIcon className="w-5 h-5 text-[#2E7D8C]" strokeWidth={1.5} />
                      </div>
                      <span className="text-[#1A2E33] text-sm font-medium group-hover:text-[#2E7D8C] transition-colors">
                        {s.title}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#D8E8EC] ml-auto group-hover:text-[#2E7D8C] transition-colors" />
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

