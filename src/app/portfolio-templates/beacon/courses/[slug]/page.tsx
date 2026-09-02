"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Users,
  Target,
  ArrowLeft,
  Phone,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { SiteConfig } from "@/lib/site-config-schema";
import siteConfig from "../../site.config.json";

/* ═══════════════════════════════════════
   データ読み込み
   ═══════════════════════════════════════ */
const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;

interface ScheduleItem {
  day: string;
  time: string;
  subject: string;
}

interface CourseService {
  title: string;
  slug: string;
  description: string;
  icon?: string;
  grade: string;
  price: string;
  subjects: string[];
  curriculum: Record<string, string>;
  schedule: ScheduleItem[];
}

const SERVICES = (config.services || []) as unknown as CourseService[];

const ICON_MAP: Record<string, typeof GraduationCap> = {
  GraduationCap,
  BookOpen,
  Users,
  Target,
};

/* ═══════════════════════════════════════
   Header
   ═══════════════════════════════════════ */
function Header() {
  return (
    <header className="bg-white border-b border-[#DDE3E8]">
      <div className="max-w-[1200px] mx-auto px-5 h-14 flex items-center justify-between">
        <Link
          href="/portfolio-templates/beacon/courses"
          className="flex items-center gap-2 text-[#5C7080] text-sm hover:text-[#2C5F7C] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> コース一覧に戻る
        </Link>
        <div className="text-right">
          <p className="text-[#1E2D3D] font-bold text-sm">{COMPANY.name}</p>
          <p className="text-[#5C7080] text-[9px] tracking-wider">コース詳細</p>
        </div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════
   Breadcrumb
   ═══════════════════════════════════════ */
function Breadcrumb({ title }: { title: string }) {
  return (
    <nav className="max-w-[1000px] mx-auto px-5 py-4" aria-label="パンくず">
      <ol className="flex items-center gap-2 text-xs text-[#5C7080]">
        <li>
          <Link href="/portfolio-templates/beacon" className="hover:text-[#2C5F7C] transition-colors">
            トップ
          </Link>
        </li>
        <li>/</li>
        <li>
          <Link href="/portfolio-templates/beacon/courses" className="hover:text-[#2C5F7C] transition-colors">
            コース一覧
          </Link>
        </li>
        <li>/</li>
        <li className="text-[#1E2D3D] font-medium">{title}</li>
      </ol>
    </nav>
  );
}

/* ═══════════════════════════════════════
   Not Found
   ═══════════════════════════════════════ */
function NotFound() {
  return (
    <>
      <Header />
      <main className="bg-[#F8F6F2] min-h-screen flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-[#5C7080] text-sm mb-4">指定されたコースが見つかりませんでした。</p>
          <Link
            href="/portfolio-templates/beacon/courses"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#2C5F7C] text-white text-sm font-medium hover:bg-[#1E4A63] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> コース一覧に戻る
          </Link>
        </div>
      </main>
    </>
  );
}

/* ═══════════════════════════════════════
   Page
   ═══════════════════════════════════════ */
export default function CourseDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const course = SERVICES.find((s) => s.slug === slug);

  if (!course) return <NotFound />;

  const Icon = ICON_MAP[course.icon || "BookOpen"] || BookOpen;
  const otherCourses = SERVICES.filter((s) => s.slug !== slug);

  return (
    <>
      <Header />

      <main className="bg-[#F8F6F2] min-h-screen">
        {/* Hero */}
        <section className="bg-[#2C5F7C] py-14 sm:py-18 px-5">
          <div className="max-w-[1000px] mx-auto text-center">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 mb-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Icon className="w-4 h-4 text-[#E8963A]" />
              <span className="text-white/70 text-xs tracking-wider">{course.grade}</span>
            </motion.div>
            <motion.h1
              className="text-white font-bold text-2xl sm:text-3xl mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {course.title}
            </motion.h1>
            <motion.p
              className="text-white/60 text-sm max-w-[600px] mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {course.description}
            </motion.p>
          </div>
        </section>

        <Breadcrumb title={course.title} />

        <div className="max-w-[900px] mx-auto px-5 pb-16 space-y-10">
          {/* カリキュラム */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-[#1E2D3D] font-bold text-xl mb-6 flex items-center gap-3">
              <span className="w-1 h-6 bg-[#E8963A] rounded-full" />
              カリキュラム内容
            </h2>
            <div className="space-y-4">
              {Object.entries(course.curriculum).map(([subject, desc], i) => (
                <motion.div
                  key={subject}
                  className="bg-white rounded-2xl border border-[#DDE3E8] p-6"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#2C5F7C]/8 text-[#2C5F7C] text-xs font-bold">
                      {subject.slice(0, 2)}
                    </span>
                    <h3 className="text-[#1E2D3D] font-bold text-base">{subject}</h3>
                  </div>
                  <p className="text-[#5C7080] text-sm leading-[1.9] pl-11">{desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* 時間割 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-[#1E2D3D] font-bold text-xl mb-6 flex items-center gap-3">
              <span className="w-1 h-6 bg-[#E8963A] rounded-full" />
              時間割
            </h2>
            <div className="bg-white rounded-2xl border border-[#DDE3E8] overflow-hidden">
              {/* テーブルヘッダー */}
              <div className="grid grid-cols-3 bg-[#F0EDE9] border-b border-[#DDE3E8]">
                <div className="px-5 py-3 text-[#5C7080] text-xs font-medium flex items-center gap-1.5">
                  曜日
                </div>
                <div className="px-5 py-3 text-[#5C7080] text-xs font-medium flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> 時間
                </div>
                <div className="px-5 py-3 text-[#5C7080] text-xs font-medium">科目</div>
              </div>
              {/* テーブル本体 */}
              <div className="divide-y divide-[#DDE3E8]">
                {course.schedule.map((item, i) => (
                  <div key={i} className="grid grid-cols-3">
                    <div className="px-5 py-4 text-[#1E2D3D] text-sm font-medium">
                      {item.day}
                    </div>
                    <div className="px-5 py-4 text-[#1E2D3D] text-sm">{item.time}</div>
                    <div className="px-5 py-4 text-[#5C7080] text-sm">{item.subject}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[#5C7080] text-xs mt-3">
              ※ 時間割は変更になる場合があります。詳しくはお問い合わせください。
            </p>
          </motion.section>

          {/* 料金詳細 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-[#1E2D3D] font-bold text-xl mb-6 flex items-center gap-3">
              <span className="w-1 h-6 bg-[#E8963A] rounded-full" />
              料金
            </h2>
            <div className="bg-white rounded-2xl border border-[#DDE3E8] p-6 sm:p-8">
              <div className="flex items-baseline gap-2 mb-4">
                <p className="text-[#E8963A] font-bold text-2xl">{course.price}</p>
              </div>
              <div className="space-y-2 text-[#5C7080] text-sm">
                <p>別途、入塾金 ¥10,000（初回のみ。兄弟割引あり）と教材費（年間 ¥8,000〜）がかかります。</p>
                <p>定期テスト対策講座は追加料金なしでご参加いただけます。</p>
              </div>
            </div>
          </motion.section>

          {/* CTA */}
          <motion.section
            className="bg-[#2C5F7C] rounded-2xl p-8 sm:p-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-white font-bold text-xl sm:text-2xl mb-3">
              無料体験授業を申し込む
            </h2>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              実際の授業を体験いただいてから、ご入塾をご検討ください。
              <br />
              {course.title}の体験授業を随時受け付けています。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`tel:${COMPANY.phone}`}
                className="flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[#E8963A] text-white font-medium text-sm hover:bg-[#D4862E] transition-colors shadow-lg shadow-black/20"
              >
                <Phone className="w-4 h-4" /> {COMPANY.phone}
              </a>
              <Link
                href="/portfolio-templates/beacon#contact"
                className="px-8 py-3.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition-colors"
              >
                メールで問い合わせ
              </Link>
            </div>
            <p className="text-white/40 text-xs mt-4">{COMPANY.hours}</p>
          </motion.section>

          {/* 他のコース */}
          {otherCourses.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="text-[#1E2D3D] font-bold text-xl mb-6 flex items-center gap-3">
                <span className="w-1 h-6 bg-[#E8963A] rounded-full" />
                他のコース
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherCourses.map((other) => {
                  const OtherIcon = ICON_MAP[other.icon || "BookOpen"] || BookOpen;
                  return (
                    <Link
                      key={other.slug}
                      href={`/portfolio-templates/beacon/courses/${other.slug}`}
                      className="bg-white rounded-xl border border-[#DDE3E8] p-5 hover:shadow-md hover:border-[#2C5F7C]/20 transition-all group"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-[#2C5F7C]/8 flex items-center justify-center flex-shrink-0">
                          <OtherIcon className="w-5 h-5 text-[#2C5F7C]" strokeWidth={1.5} />
                        </div>
                        <div>
                          <h3 className="text-[#1E2D3D] font-bold text-sm group-hover:text-[#2C5F7C] transition-colors">
                            {other.title}
                          </h3>
                          <p className="text-[#5C7080] text-xs">{other.grade}</p>
                        </div>
                      </div>
                      <p className="text-[#E8963A] text-sm font-medium flex items-center gap-1">
                        {other.price}
                        <ArrowRight className="w-3.5 h-3.5 ml-auto text-[#2C5F7C] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                    </Link>
                  );
                })}
              </div>
            </motion.section>
          )}
        </div>

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

      {/* SP fixed bottom CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#E8963A] safe-area-bottom">
        <a
          href={`tel:${COMPANY.phone}`}
          className="flex items-center justify-center gap-2 py-3.5 text-white font-bold text-base"
        >
          <Phone className="w-5 h-5" /> 無料体験を申し込む
        </a>
      </div>
    </>
  );
}
