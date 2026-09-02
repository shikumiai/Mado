"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Target,
  Users,
  Heart,
  Lightbulb,
  Check,
  Sparkles,
  TrendingUp,
  MessageCircle,
  Clock,
  Phone,
} from "lucide-react";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, Service } from "@/lib/site-config-schema";
import siteConfig from "../../site.config.json";

const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const SERVICES = (config.services || []) as Service[];

const ICON_MAP: Record<string, typeof Target> = {
  Target,
  Users,
  Heart,
  Lightbulb,
};

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const service = SERVICES.find((s) => s.slug === slug);

  if (!service) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#2D2640] text-xl font-bold mb-4" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            サービスが見つかりません
          </p>
          <Link href="/portfolio-templates/prism/services" className="text-[#E8A449] text-sm hover:underline">
            サービス一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const Icon = ICON_MAP[service.icon || "Target"] || Target;

  return (
    <>
      <DemoBanner />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md shadow-sm">
        <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/portfolio-templates/prism/services" className="flex items-center gap-2 text-[#7A7090] text-sm hover:text-[#4A3F6B] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            サービス一覧
          </Link>
          <p className="font-bold text-sm tracking-wide text-[#2D2640]" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            {COMPANY.name}
          </p>
          <a
            href="/portfolio-templates/prism#contact"
            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E8A449] text-white text-sm font-medium hover:bg-[#D4942E] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            初回無料相談
          </a>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/templates/prism/session.jpg"
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[#2D2640]/80" />
          </div>
          <div className="relative max-w-[800px] mx-auto px-5">
            <motion.div
              className="flex items-center gap-3 mb-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Icon className="w-6 h-6 text-[#E8A449]" strokeWidth={1.5} />
              </div>
              <p className="text-[#E8A449] text-xs tracking-[0.2em] font-medium">SERVICE</p>
            </motion.div>

            <motion.h1
              className="text-white font-bold text-3xl sm:text-4xl mb-4"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {service.title}
            </motion.h1>

            {service.targetAudience && (
              <motion.p
                className="text-[#E8A449] text-sm font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {service.targetAudience}
              </motion.p>
            )}
          </div>
        </section>

        {/* Overview */}
        <section className="py-14 sm:py-20 bg-[#FAF8F5]">
          <div className="max-w-[800px] mx-auto px-5">
            <motion.p
              className="text-[#2D2640] text-base sm:text-lg leading-[2.2]"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {service.description}
            </motion.p>
          </div>
        </section>

        {/* Session Content */}
        {service.sessionContent && service.sessionContent.length > 0 && (
          <section className="py-14 sm:py-20 bg-white">
            <div className="max-w-[800px] mx-auto px-5">
              <motion.div
                className="mb-10"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-[#E8A449] text-xs tracking-[0.3em] mb-2 font-medium">SESSION CONTENT</p>
                <h2 className="text-[#2D2640] font-bold text-2xl" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                  セッション内容
                </h2>
              </motion.div>

              <div className="space-y-4">
                {service.sessionContent.map((content, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-4 p-5 bg-[#FAF8F5] rounded-xl border border-[#E5E0ED]"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#4A3F6B]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#4A3F6B] text-sm font-bold">{i + 1}</span>
                    </div>
                    <p className="text-[#2D2640] text-sm leading-[1.8] pt-1">{content}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Expected Changes */}
        {service.expectedChanges && service.expectedChanges.length > 0 && (
          <section className="py-14 sm:py-20 bg-[#FAF8F5]">
            <div className="max-w-[800px] mx-auto px-5">
              <motion.div
                className="mb-10"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-[#E8A449] text-xs tracking-[0.3em] mb-2 font-medium">EXPECTED CHANGES</p>
                <h2 className="text-[#2D2640] font-bold text-2xl" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                  期待できる変化
                </h2>
              </motion.div>

              <div className="space-y-4">
                {service.expectedChanges.map((change, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-4 p-5 bg-white rounded-xl border border-[#E5E0ED]"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#E8A449]/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-[#E8A449]" />
                    </div>
                    <p className="text-[#2D2640] text-sm leading-[1.8] pt-1 font-medium">{change}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Testimonial */}
        {service.testimonial && (
          <section className="py-14 sm:py-20 bg-white">
            <div className="max-w-[800px] mx-auto px-5">
              <motion.div
                className="mb-10"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-[#E8A449] text-xs tracking-[0.3em] mb-2 font-medium">VOICE</p>
                <h2 className="text-[#2D2640] font-bold text-2xl" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                  体験された方の声
                </h2>
              </motion.div>

              <motion.div
                className="bg-[#FAF8F5] rounded-2xl border border-[#E5E0ED] p-7 sm:p-9"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-[#4A3F6B]/10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-[#4A3F6B]" />
                  </div>
                  <div>
                    <p className="text-[#2D2640] text-sm font-bold">{service.testimonial.initial} 様</p>
                    <p className="text-[#7A7090] text-xs">{service.testimonial.attribute}</p>
                  </div>
                </div>
                <p className="text-[#2D2640] text-sm leading-[2.0]" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                  {service.testimonial.text}
                </p>
              </motion.div>
            </div>
          </section>
        )}

        {/* Duration & Price */}
        {(service.duration || service.price) && (
          <section className="py-14 sm:py-20 bg-[#FAF8F5]">
            <div className="max-w-[800px] mx-auto px-5">
              <motion.div
                className="mb-10"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-[#E8A449] text-xs tracking-[0.3em] mb-2 font-medium">PRICING</p>
                <h2 className="text-[#2D2640] font-bold text-2xl" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                  料金・期間
                </h2>
              </motion.div>

              <motion.div
                className="bg-white rounded-2xl border border-[#E5E0ED] p-7 sm:p-9"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="grid sm:grid-cols-2 gap-6">
                  {service.duration && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#4A3F6B]/8 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-[#4A3F6B]" />
                      </div>
                      <div>
                        <p className="text-[#7A7090] text-xs mb-1 font-medium">期間</p>
                        <p className="text-[#2D2640] text-base font-bold" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                          {service.duration}
                        </p>
                      </div>
                    </div>
                  )}
                  {service.price && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#E8A449]/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-[#E8A449]" />
                      </div>
                      <div>
                        <p className="text-[#7A7090] text-xs mb-1 font-medium">料金</p>
                        <p className="text-[#2D2640] text-base font-bold" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                          {service.price}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 sm:py-20 bg-[#4A3F6B]">
          <div className="max-w-[600px] mx-auto px-5 text-center">
            <h2 className="text-white font-bold text-2xl sm:text-3xl mb-4" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              無料相談を予約する
            </h2>
            <p className="text-white/70 text-sm mb-8 leading-relaxed">
              初回30分の無料相談で、あなたの課題を一緒に整理します。<br />
              無理な勧誘は一切ありません。
            </p>
            <a
              href="/portfolio-templates/prism#contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[#E8A449] text-white font-bold text-sm hover:bg-[#D4942E] transition-colors shadow-lg shadow-[#E8A449]/20"
            >
              <Sparkles className="w-4 h-4" />
              無料相談を予約する
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-[#2D2640] pb-20 md:pb-8">
        <div className="max-w-[1200px] mx-auto px-5 text-center">
          <p className="text-white/30 text-xs">
            &copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </p>
        </div>
      </footer>

      {/* SP固定フッター */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#4A3F6B] safe-area-bottom">
        <a href={`tel:${COMPANY.phone}`} className="flex items-center justify-center gap-2 py-3.5 text-white font-bold text-base">
          <Phone className="w-5 h-5" /> 無料相談を予約する
        </a>
      </div>
    </>
  );
}
