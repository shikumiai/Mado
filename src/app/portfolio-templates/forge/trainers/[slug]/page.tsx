"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Dumbbell,
  Target,
  Flame,
  Trophy,
  Heart,
  Zap,
  Star,
  User,
  ArrowLeft,
  ArrowRight,
  Phone,
  Check,
  Award,
} from "lucide-react";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, Service, StaffMember } from "@/lib/site-config-schema";
import { usePreviewName } from "@/lib/use-preview-name";
import siteConfig from "../../site.config.json";

const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const SERVICES = (config.services || []) as Service[];
const STAFF = (config.staff || []) as StaffMember[];

const ICON_MAP: Record<string, typeof Dumbbell> = {
  Dumbbell,
  Target,
  Flame,
  Trophy,
  Heart,
  Zap,
  Star,
  User,
};

/* ═══════════════════════════════════════
   Header（簡易版）
   ═══════════════════════════════════════ */
function SubPageHeader() {
  const displayName = usePreviewName(COMPANY.name);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F5F5F5]/95 backdrop-blur-md shadow-sm">
      <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/portfolio-templates/forge" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B35] flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <p className="font-bold text-sm tracking-wide text-[#1A1A1A]">
            {displayName}
          </p>
        </Link>

        <Link
          href="/portfolio-templates/forge#contact"
          className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FF6B35] text-white text-sm font-bold hover:bg-[#E85A25] transition-colors"
        >
          無料体験を予約
        </Link>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════
   Footer（簡易版）
   ═══════════════════════════════════════ */
function SubPageFooter() {
  const displayName = usePreviewName(COMPANY.name);
  return (
    <footer className="py-10 bg-[#111111] pb-24 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-white/30 text-xs">
          <Link href="/portfolio-templates/forge" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <Dumbbell className="w-4 h-4" />
            <span className="font-bold text-sm">{displayName}</span>
          </Link>
          <p>&copy; {new Date().getFullYear()} {displayName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════
   トレーナー詳細ページ
   ═══════════════════════════════════════ */
export default function TrainerDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const member = STAFF.find((s) => s.slug === slug);

  // 担当プログラムを取得
  const assignedPrograms = member?.programs
    ? SERVICES.filter((s) => s.slug && member.programs!.includes(s.slug))
    : [];

  if (!member) {
    return (
      <>
        <DemoBanner />
        <SubPageHeader />
        <main className="pt-16">
          <div className="min-h-[60vh] flex items-center justify-center bg-[#F5F5F5]">
            <div className="text-center">
              <p className="text-[#6B6B6B] text-lg mb-4">トレーナーが見つかりません</p>
              <Link
                href="/portfolio-templates/forge/trainers"
                className="inline-flex items-center gap-2 text-[#FF6B35] text-sm font-bold hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                トレーナー一覧に戻る
              </Link>
            </div>
          </div>
        </main>
        <SubPageFooter />
      </>
    );
  }

  return (
    <>
      <DemoBanner />
      <SubPageHeader />

      <main className="pt-16">
        {/* ヒーロー */}
        <section className="relative bg-[#1A1A1A] overflow-hidden">
          <div className="max-w-[1100px] mx-auto px-5 py-20 sm:py-28">
            <Link
              href="/portfolio-templates/forge/trainers"
              className="inline-flex items-center gap-2 text-white/50 text-sm mb-8 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              トレーナー一覧に戻る
            </Link>

            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
              {/* 写真 */}
              <motion.div
                className="lg:w-[380px] flex-shrink-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="aspect-[3/4] rounded-2xl overflow-hidden relative">
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 380px"
                      priority
                    />
                  ) : (
                    <Image
                      src="/images/templates/forge/trainer.jpg"
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 380px"
                      priority
                    />
                  )}
                </div>
              </motion.div>

              {/* 基本情報 */}
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <p className="text-[#FF6B35] text-xs font-bold tracking-wider mb-2">{member.role}</p>
                <h1 className="text-white font-bold text-3xl sm:text-4xl mb-6">{member.name}</h1>

                {/* 資格バッジ */}
                {member.qualifications && member.qualifications.length > 0 && (
                  <div className="space-y-2 mb-8">
                    {member.qualifications.map((q, qi) => (
                      <div
                        key={qi}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm mr-2"
                      >
                        <Award className="w-4 h-4 text-[#FF6B35]" />
                        {q}
                      </div>
                    ))}
                  </div>
                )}

                {/* 得意分野 */}
                {member.specialty && (
                  <div className="mb-6">
                    <p className="text-white/40 text-xs tracking-wider mb-2 font-bold">得意分野</p>
                    <p className="text-white text-base font-medium">{member.specialty}</p>
                  </div>
                )}

                {/* 経歴サマリー */}
                {member.bio && (
                  <p className="text-white/60 text-sm leading-[1.9]">{member.bio}</p>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* 経歴・実績 */}
        {member.experience && (
          <section className="py-16 sm:py-24 bg-white">
            <div className="max-w-[900px] mx-auto px-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-[#FF6B35] text-xs tracking-[0.3em] mb-2 font-bold">CAREER</p>
                <h2 className="text-[#1A1A1A] font-bold text-xl sm:text-2xl mb-8">
                  経歴・実績
                </h2>
              </motion.div>

              <motion.div
                className="text-[#6B6B6B] text-sm sm:text-base leading-[2] whitespace-pre-line"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                {member.experience}
              </motion.div>
            </div>
          </section>
        )}

        {/* トレーニング哲学 */}
        {member.philosophy && (
          <section className="py-16 sm:py-24 bg-[#F5F5F5]">
            <div className="max-w-[900px] mx-auto px-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-[#FF6B35] text-xs tracking-[0.3em] mb-2 font-bold">PHILOSOPHY</p>
                <h2 className="text-[#1A1A1A] font-bold text-xl sm:text-2xl mb-8">
                  トレーニング哲学
                </h2>
              </motion.div>

              <motion.div
                className="relative p-8 sm:p-10 rounded-2xl bg-white border border-[#E0E0E0]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="absolute top-4 left-6 text-[#FF6B35]/20 text-6xl font-serif leading-none">&ldquo;</div>
                <p className="relative text-[#1A1A1A] text-base sm:text-lg leading-[2] whitespace-pre-line">
                  {member.philosophy}
                </p>
              </motion.div>
            </div>
          </section>
        )}

        {/* 担当プログラム */}
        {assignedPrograms.length > 0 && (
          <section className="py-16 sm:py-24 bg-white">
            <div className="max-w-[900px] mx-auto px-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-[#FF6B35] text-xs tracking-[0.3em] mb-2 font-bold">PROGRAMS</p>
                <h2 className="text-[#1A1A1A] font-bold text-xl sm:text-2xl mb-8">
                  担当プログラム
                </h2>
              </motion.div>

              <div className="space-y-4">
                {assignedPrograms.map((program, i) => {
                  const Icon = ICON_MAP[program.icon || "Dumbbell"] || Dumbbell;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link
                        href={`/portfolio-templates/forge/programs/${program.slug}`}
                        className="block group"
                      >
                        <div className="flex items-center gap-5 p-6 rounded-2xl border border-[#E0E0E0] bg-white hover:border-[#FF6B35]/30 hover:shadow-lg transition-all">
                          <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FF6B35]/15 transition-colors">
                            <Icon className="w-6 h-6 text-[#FF6B35]" strokeWidth={1.8} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[#1A1A1A] text-lg group-hover:text-[#FF6B35] transition-colors">
                              {program.title}
                            </h3>
                            <p className="text-[#6B6B6B] text-sm line-clamp-1">{program.description}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-[#CCCCCC] group-hover:text-[#FF6B35] group-hover:translate-x-1 transition-all flex-shrink-0 hidden sm:block" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 sm:py-20 bg-[#1A1A1A]">
          <div className="max-w-[600px] mx-auto px-5 text-center">
            <p className="text-[#FF6B35] text-xs tracking-[0.3em] mb-3 font-bold">TRIAL</p>
            <h2 className="text-white font-bold text-2xl sm:text-3xl mb-4">
              {member.name}のトレーニングを体験
            </h2>
            <p className="text-white/50 text-sm mb-8">
              まずは無料体験で、トレーニングの質を実感してください。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/portfolio-templates/forge#contact"
                className="px-8 py-4 rounded-lg bg-[#FF6B35] text-white font-bold text-sm hover:bg-[#E85A25] transition-colors shadow-lg shadow-[#FF6B35]/20"
              >
                このトレーナーで体験予約
              </Link>
              <a
                href={`tel:${COMPANY.phone}`}
                className="px-8 py-4 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                電話する
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* SP fixed bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-area-bottom flex">
        <Link href="/portfolio-templates/forge#contact" className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#FF6B35] text-white font-bold text-base">
          <Zap className="w-5 h-5" /> このトレーナーで体験予約
        </Link>
        <a href={`tel:${COMPANY.phone}`} className="flex items-center justify-center gap-2 px-5 py-3.5 bg-[#1A1A1A] text-white font-bold text-base">
          <Phone className="w-5 h-5" />
        </a>
      </div>

      <SubPageFooter />
    </>
  );
}
