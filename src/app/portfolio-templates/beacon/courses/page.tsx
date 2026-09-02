"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Users,
  Target,
  ArrowLeft,
  ArrowRight,
  Phone,
} from "lucide-react";
import Link from "next/link";
import type { SiteConfig } from "@/lib/site-config-schema";
import siteConfig from "../site.config.json";

/* ═══════════════════════════════════════
   データ読み込み
   ═══════════════════════════════════════ */
const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const SERVICES = (config.services || []) as Array<{
  title: string;
  slug: string;
  description: string;
  icon?: string;
  grade: string;
  price: string;
  subjects: string[];
}>;

const ICON_MAP: Record<string, typeof GraduationCap> = {
  GraduationCap,
  BookOpen,
  Users,
  Target,
};

const GRADE_ICON: Record<string, string> = {
  "小4〜小6": "小",
  "中1〜中3": "中",
  "高1〜高3": "高",
  "小4〜高3": "全",
};

/* ═══════════════════════════════════════
   Header
   ═══════════════════════════════════════ */
function Header() {
  return (
    <header className="bg-white border-b border-[#DDE3E8]">
      <div className="max-w-[1200px] mx-auto px-5 h-14 flex items-center justify-between">
        <Link
          href="/portfolio-templates/beacon"
          className="flex items-center gap-2 text-[#5C7080] text-sm hover:text-[#2C5F7C] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> トップに戻る
        </Link>
        <div className="text-right">
          <p className="text-[#1E2D3D] font-bold text-sm">{COMPANY.name}</p>
          <p className="text-[#5C7080] text-[9px] tracking-wider">コース一覧</p>
        </div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════
   Breadcrumb
   ═══════════════════════════════════════ */
function Breadcrumb() {
  return (
    <nav className="max-w-[1000px] mx-auto px-5 py-4" aria-label="パンくず">
      <ol className="flex items-center gap-2 text-xs text-[#5C7080]">
        <li>
          <Link href="/portfolio-templates/beacon" className="hover:text-[#2C5F7C] transition-colors">
            トップ
          </Link>
        </li>
        <li>/</li>
        <li className="text-[#1E2D3D] font-medium">コース一覧</li>
      </ol>
    </nav>
  );
}

/* ═══════════════════════════════════════
   Course Card
   ═══════════════════════════════════════ */
function CourseCard({
  service,
  index,
}: {
  service: (typeof SERVICES)[0];
  index: number;
}) {
  const Icon = ICON_MAP[service.icon || "BookOpen"] || BookOpen;
  const gradeLabel = GRADE_ICON[service.grade] || "他";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link
        href={`/portfolio-templates/beacon/courses/${service.slug}`}
        className="block bg-white rounded-2xl border border-[#DDE3E8] p-7 hover:shadow-md hover:border-[#2C5F7C]/20 transition-all group"
      >
        <div className="flex items-start gap-5">
          {/* 対象学年アイコン */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="w-14 h-14 rounded-xl bg-[#2C5F7C]/8 flex items-center justify-center">
              <Icon className="w-7 h-7 text-[#2C5F7C]" strokeWidth={1.5} />
            </div>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#E8963A]/10 text-[#E8963A] text-xs font-bold">
              {gradeLabel}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#5C7080] text-xs">{service.grade}</span>
            </div>
            <h3 className="font-bold text-[#1E2D3D] text-lg mb-2 group-hover:text-[#2C5F7C] transition-colors">
              {service.title}
            </h3>
            <p className="text-[#5C7080] text-sm leading-[1.9] mb-4">
              {service.description}
            </p>

            {/* 科目タグ */}
            <div className="flex flex-wrap gap-2 mb-4">
              {service.subjects.map((sub) => (
                <span
                  key={sub}
                  className="px-3 py-1 rounded-full bg-[#F8F6F2] border border-[#DDE3E8] text-[#5C7080] text-xs"
                >
                  {sub}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-[#E8963A] font-bold text-base">{service.price}</p>
              <span className="text-[#2C5F7C] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                詳しく見る <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   Page
   ═══════════════════════════════════════ */
export default function CoursesPage() {
  return (
    <>
      <Header />

      <main className="bg-[#F8F6F2] min-h-screen">
        {/* Hero */}
        <section className="bg-[#2C5F7C] py-14 sm:py-18 px-5">
          <div className="max-w-[1000px] mx-auto text-center">
            <motion.p
              className="text-[#E8963A] text-xs tracking-[0.3em] mb-3 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              COURSES
            </motion.p>
            <motion.h1
              className="text-white font-bold text-2xl sm:text-3xl mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              コース一覧
            </motion.h1>
            <motion.p
              className="text-white/60 text-sm max-w-[500px] mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              お子さまの学年と目標に合わせて、最適なコースをお選びいただけます。
            </motion.p>
          </div>
        </section>

        <Breadcrumb />

        {/* Course List */}
        <div className="max-w-[1000px] mx-auto px-5 pb-16 space-y-5">
          {SERVICES.map((service, i) => (
            <CourseCard key={service.slug} service={service} index={i} />
          ))}
        </div>

        {/* CTA */}
        <section className="py-16 bg-white">
          <div className="max-w-[600px] mx-auto px-5 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-[#1E2D3D] font-bold text-xl sm:text-2xl mb-3">
                まずは無料体験授業へ
              </h2>
              <p className="text-[#5C7080] text-sm mb-6 leading-relaxed">
                実際の授業を体験いただいてから、ご入塾をご検討ください。
                <br />
                お子さまに合ったコースをご提案いたします。
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`tel:${COMPANY.phone}`}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[#E8963A] text-white font-medium text-sm hover:bg-[#D4862E] transition-colors shadow-lg shadow-[#E8963A]/20"
                >
                  <Phone className="w-4 h-4" /> 無料体験を申し込む
                </a>
                <Link
                  href="/portfolio-templates/beacon#contact"
                  className="px-8 py-3.5 rounded-lg border border-[#DDE3E8] text-[#5C7080] text-sm hover:border-[#2C5F7C]/30 transition-colors"
                >
                  メールで問い合わせ
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-[#1E2D3D]">
          <div className="max-w-[1200px] mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/30 text-xs">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-[#E8963A]" />
              <span className="text-white/50 font-medium">{COMPANY.name}</span>
            </div>
            <p>&copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </>
  );
}
