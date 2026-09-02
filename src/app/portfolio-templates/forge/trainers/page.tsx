"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Dumbbell,
  ArrowLeft,
  ArrowRight,
  Phone,
  Zap,
  Check,
} from "lucide-react";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, StaffMember } from "@/lib/site-config-schema";
import { usePreviewName } from "@/lib/use-preview-name";
import siteConfig from "../site.config.json";

const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const STAFF = (config.staff || []) as StaffMember[];

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
   トレーナー一覧ページ
   ═══════════════════════════════════════ */
export default function TrainersPage() {
  return (
    <>
      <DemoBanner />
      <SubPageHeader />

      <main className="pt-16">
        {/* ページヒーロー */}
        <section className="relative py-20 sm:py-28 bg-[#1A1A1A] overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/templates/forge/hero.jpg"
              alt=""
              fill
              className="object-cover opacity-20"
              sizes="100vw"
            />
          </div>
          <div className="relative z-10 max-w-[1100px] mx-auto px-5">
            <Link
              href="/portfolio-templates/forge"
              className="inline-flex items-center gap-2 text-white/50 text-sm mb-6 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              トップに戻る
            </Link>
            <motion.p
              className="text-[#FF6B35] text-xs tracking-[0.3em] mb-3 font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              TRAINERS
            </motion.p>
            <motion.h1
              className="text-white font-bold text-3xl sm:text-4xl mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              トレーナー紹介
            </motion.h1>
            <motion.p
              className="text-white/60 text-sm sm:text-base max-w-[600px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              全員が有資格者。それぞれの専門分野を持つトレーナーが、
              あなたの目標達成を全力でサポートします。
            </motion.p>
          </div>
        </section>

        {/* トレーナー一覧 */}
        <section className="py-16 sm:py-24 bg-[#F5F5F5]">
          <div className="max-w-[1100px] mx-auto px-5">
            <div className="space-y-6">
              {STAFF.map((member, i) => {
                const trainerSlug = member.slug || `trainer-${member.id}`;
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={`/portfolio-templates/forge/trainers/${trainerSlug}`}
                      className="block group"
                    >
                      <div className="relative rounded-2xl border border-[#E0E0E0] bg-white hover:border-[#FF6B35]/30 hover:shadow-lg transition-all overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          {/* 写真 */}
                          <div className="sm:w-64 lg:w-72 flex-shrink-0">
                            <div className="aspect-[4/5] sm:aspect-auto sm:h-full relative overflow-hidden">
                              {member.image ? (
                                <Image
                                  src={member.image}
                                  alt={member.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                  sizes="(max-width: 640px) 100vw, 288px"
                                />
                              ) : (
                                <Image
                                  src="/images/templates/forge/trainer.jpg"
                                  alt={member.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                  sizes="(max-width: 640px) 100vw, 288px"
                                />
                              )}
                            </div>
                          </div>

                          {/* コンテンツ */}
                          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-[#FF6B35] text-xs font-bold tracking-wider mb-1">{member.role}</p>
                                <h2 className="font-bold text-[#1A1A1A] text-xl sm:text-2xl mb-3 group-hover:text-[#FF6B35] transition-colors">
                                  {member.name}
                                </h2>
                              </div>
                              <ArrowRight className="w-5 h-5 text-[#CCCCCC] group-hover:text-[#FF6B35] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1.5 hidden sm:block" />
                            </div>

                            {/* 資格バッジ */}
                            {member.qualifications && member.qualifications.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {member.qualifications.map((q, qi) => (
                                  <span key={qi} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F5F5F5] text-[#6B6B6B] text-xs">
                                    <Check className="w-3 h-3 text-[#FF6B35]" />
                                    {q}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* 得意分野 */}
                            {member.specialty && (
                              <p className="text-[#1A1A1A] text-sm font-medium mb-3">
                                得意分野: {member.specialty}
                              </p>
                            )}

                            {member.bio && (
                              <p className="text-[#6B6B6B] text-sm leading-[1.9] line-clamp-3">
                                {member.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 bg-[#1A1A1A]">
          <div className="max-w-[600px] mx-auto px-5 text-center">
            <p className="text-[#FF6B35] text-xs tracking-[0.3em] mb-3 font-bold">TRIAL</p>
            <h2 className="text-white font-bold text-2xl sm:text-3xl mb-4">
              まずは無料体験から
            </h2>
            <p className="text-white/50 text-sm mb-8">
              カウンセリング + 体験トレーニング（60分）であなたに最適なトレーナーをご紹介します。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/portfolio-templates/forge#contact"
                className="px-8 py-4 rounded-lg bg-[#FF6B35] text-white font-bold text-sm hover:bg-[#E85A25] transition-colors shadow-lg shadow-[#FF6B35]/20"
              >
                無料体験を予約する
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
          <Zap className="w-5 h-5" /> 無料体験を予約
        </Link>
        <a href={`tel:${COMPANY.phone}`} className="flex items-center justify-center gap-2 px-5 py-3.5 bg-[#1A1A1A] text-white font-bold text-base">
          <Phone className="w-5 h-5" />
        </a>
      </div>

      <SubPageFooter />
    </>
  );
}
