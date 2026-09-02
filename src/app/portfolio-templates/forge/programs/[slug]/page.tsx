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
  Phone,
  Clock,
  TrendingUp,
  Check,
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
   成果数値カード
   ═══════════════════════════════════════ */
function ResultCard({ text }: { text: string }) {
  // 数値を太字で強調表示する（例: "平均-8.2kg" → "-8.2kg" を大きく）
  const parts = text.split("。").filter(Boolean);
  return (
    <div className="space-y-4">
      {parts.map((part, i) => {
        // 数値部分を抽出（-8.2kg, +25kg, 92%, 12% など）
        const numMatch = part.match(/([+-]?\d+[.,]?\d*[%㎏kg秒cmヶ月回名]*)/i);
        return (
          <motion.div
            key={i}
            className="p-5 rounded-xl bg-white border border-[#E0E0E0]"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            {numMatch ? (
              <div>
                <p className="text-[#FF6B35] font-bold text-2xl sm:text-3xl mb-1">{numMatch[1]}</p>
                <p className="text-[#6B6B6B] text-sm">{part.trim()}</p>
              </div>
            ) : (
              <p className="text-[#6B6B6B] text-sm">{part.trim()}</p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════
   プログラム詳細ページ
   ═══════════════════════════════════════ */
export default function ProgramDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const service = SERVICES.find((s) => s.slug === slug);

  // 担当トレーナーを検索
  const assignedTrainers = STAFF.filter(
    (member) => member.programs && member.programs.includes(slug)
  );

  if (!service) {
    return (
      <>
        <DemoBanner />
        <SubPageHeader />
        <main className="pt-16">
          <div className="min-h-[60vh] flex items-center justify-center bg-[#F5F5F5]">
            <div className="text-center">
              <p className="text-[#6B6B6B] text-lg mb-4">プログラムが見つかりません</p>
              <Link
                href="/portfolio-templates/forge/programs"
                className="inline-flex items-center gap-2 text-[#FF6B35] text-sm font-bold hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                プログラム一覧に戻る
              </Link>
            </div>
          </div>
        </main>
        <SubPageFooter />
      </>
    );
  }

  const Icon = ICON_MAP[service.icon || "Dumbbell"] || Dumbbell;

  return (
    <>
      <DemoBanner />
      <SubPageHeader />

      <main className="pt-16">
        {/* ヒーロー */}
        <section className="relative py-20 sm:py-28 bg-[#1A1A1A] overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/templates/forge/hero.jpg"
              alt=""
              fill
              className="object-cover opacity-15"
              sizes="100vw"
            />
          </div>
          <div className="relative z-10 max-w-[900px] mx-auto px-5">
            <Link
              href="/portfolio-templates/forge/programs"
              className="inline-flex items-center gap-2 text-white/50 text-sm mb-6 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              プログラム一覧に戻る
            </Link>

            <motion.div
              className="flex items-center gap-4 mb-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-14 h-14 rounded-xl bg-[#FF6B35]/20 flex items-center justify-center">
                <Icon className="w-7 h-7 text-[#FF6B35]" strokeWidth={1.8} />
              </div>
              <div>
                <h1 className="text-white font-bold text-2xl sm:text-3xl lg:text-4xl">
                  {service.title}
                </h1>
              </div>
            </motion.div>

            {service.targetAudience && (
              <motion.p
                className="text-[#FF6B35] text-sm font-bold mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {service.targetAudience}
              </motion.p>
            )}

            <motion.p
              className="text-white/60 text-sm sm:text-base leading-relaxed max-w-[700px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {service.description}
            </motion.p>
          </div>
        </section>

        {/* トレーニング内容詳細 */}
        {service.details && (
          <section className="py-16 sm:py-24 bg-white">
            <div className="max-w-[900px] mx-auto px-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-[#FF6B35] text-xs tracking-[0.3em] mb-2 font-bold">TRAINING DETAILS</p>
                <h2 className="text-[#1A1A1A] font-bold text-xl sm:text-2xl mb-8">
                  トレーニング内容
                </h2>
              </motion.div>

              <motion.div
                className="text-[#6B6B6B] text-sm sm:text-base leading-[2] whitespace-pre-line"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                {service.details}
              </motion.div>
            </div>
          </section>
        )}

        {/* 期間・頻度 + 成果実績 */}
        <section className="py-16 sm:py-24 bg-[#F5F5F5]">
          <div className="max-w-[900px] mx-auto px-5">
            <div className="grid md:grid-cols-2 gap-8">
              {/* 期間・頻度 */}
              {service.duration && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#FF6B35]" />
                    </div>
                    <h3 className="text-[#1A1A1A] font-bold text-lg">期間・頻度の目安</h3>
                  </div>
                  <div className="p-6 rounded-xl bg-white border border-[#E0E0E0]">
                    <p className="text-[#1A1A1A] font-bold text-lg mb-2">{service.duration}</p>
                    <p className="text-[#6B6B6B] text-sm">
                      個人の目標や体力レベルに応じて調整します。
                    </p>
                  </div>
                </motion.div>
              )}

              {/* 料金 */}
              {service.price && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center">
                      <Star className="w-5 h-5 text-[#FF6B35]" />
                    </div>
                    <h3 className="text-[#1A1A1A] font-bold text-lg">料金</h3>
                  </div>
                  <div className="p-6 rounded-xl bg-white border border-[#E0E0E0]">
                    <p className="text-[#FF6B35] font-bold text-xl mb-2">{service.price}</p>
                    <p className="text-[#6B6B6B] text-sm">
                      体験トレーニング後、当日入会で入会金無料。
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* 成果実績 */}
            {service.results && (
              <motion.div
                className="mt-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#FF6B35]" />
                  </div>
                  <h3 className="text-[#1A1A1A] font-bold text-lg">成果実績</h3>
                </div>
                <ResultCard text={service.results} />
              </motion.div>
            )}
          </div>
        </section>

        {/* 担当トレーナー */}
        {assignedTrainers.length > 0 && (
          <section className="py-16 sm:py-24 bg-white">
            <div className="max-w-[900px] mx-auto px-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-[#FF6B35] text-xs tracking-[0.3em] mb-2 font-bold">TRAINERS</p>
                <h2 className="text-[#1A1A1A] font-bold text-xl sm:text-2xl mb-8">
                  担当トレーナー
                </h2>
              </motion.div>

              <div className="grid sm:grid-cols-2 gap-6">
                {assignedTrainers.map((trainer, i) => (
                  <motion.div
                    key={trainer.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={`/portfolio-templates/forge/trainers/${trainer.slug || `trainer-${trainer.id}`}`}
                      className="block group"
                    >
                      <div className="p-6 rounded-2xl border border-[#E0E0E0] bg-white hover:border-[#FF6B35]/30 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-[#E0E0E0] flex-shrink-0">
                            {trainer.image ? (
                              <Image src={trainer.image} alt={trainer.name} width={64} height={64} className="object-cover w-full h-full" />
                            ) : (
                              <Image
                                src="/images/templates/forge/trainer.jpg"
                                alt={trainer.name}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-[#FF6B35] text-xs font-bold">{trainer.role}</p>
                            <h3 className="font-bold text-[#1A1A1A] text-lg group-hover:text-[#FF6B35] transition-colors">{trainer.name}</h3>
                          </div>
                        </div>
                        {trainer.qualifications && trainer.qualifications.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {trainer.qualifications.slice(0, 2).map((q, qi) => (
                              <span key={qi} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F5F5F5] text-[#6B6B6B] text-xs">
                                <Check className="w-3 h-3 text-[#FF6B35]" />
                                {q}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 sm:py-20 bg-[#1A1A1A]">
          <div className="max-w-[600px] mx-auto px-5 text-center">
            <p className="text-[#FF6B35] text-xs tracking-[0.3em] mb-3 font-bold">TRIAL</p>
            <h2 className="text-white font-bold text-2xl sm:text-3xl mb-4">
              無料体験を予約する
            </h2>
            <p className="text-white/50 text-sm mb-8">
              まずは体験トレーニングで、{service.title}の効果を実感してください。
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
