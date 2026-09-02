"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Sparkles,
  Phone,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  CheckCircle,
} from "lucide-react";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, Voice } from "@/lib/site-config-schema";
import siteConfig from "../../site.config.json";

const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const VOICES = (config.voices || []) as Voice[];

export default function VoiceDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const voice = VOICES.find((v) => v.slug === slug);

  if (!voice) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#2D2640] text-xl font-bold mb-4" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            記事が見つかりません
          </p>
          <Link href="/portfolio-templates/prism/voices" className="text-[#E8A449] text-sm hover:underline">
            お客様の声一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <DemoBanner />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md shadow-sm">
        <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/portfolio-templates/prism/voices" className="flex items-center gap-2 text-[#7A7090] text-sm hover:text-[#4A3F6B] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            お客様の声一覧
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
              src="/images/templates/prism/hero.jpg"
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[#2D2640]/80" />
          </div>
          <div className="relative max-w-[800px] mx-auto px-5">
            <motion.p
              className="text-[#E8A449] text-xs tracking-[0.2em] mb-4 font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              CLIENT VOICE
            </motion.p>

            {/* Client info */}
            <motion.div
              className="flex items-center gap-4 mb-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <span className="text-white text-sm font-bold" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                  {voice.initial}
                </span>
              </div>
              <div>
                <p className="text-white text-lg font-bold" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                  {voice.initial} 様
                </p>
                <p className="text-white/60 text-sm">{voice.attribute}</p>
              </div>
            </motion.div>

            {/* Numbers - large display */}
            <motion.div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-[#E8A449]/20 backdrop-blur-sm border border-[#E8A449]/30"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TrendingUp className="w-5 h-5 text-[#E8A449]" />
              <p className="text-white font-bold text-lg" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                {voice.numbers}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Challenge */}
        <section className="py-14 sm:py-20 bg-[#FAF8F5]">
          <div className="max-w-[800px] mx-auto px-5">
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#7A7090]/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-[#7A7090]" />
                </div>
                <div>
                  <p className="text-[#E8A449] text-xs tracking-[0.2em] font-medium">BEFORE</p>
                  <h2 className="text-[#2D2640] font-bold text-xl" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                    相談前の状態
                  </h2>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl border border-[#E5E0ED] p-7 sm:p-9"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-[#2D2640] text-base leading-[2.2]" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                {voice.challenge}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Insight */}
        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-[800px] mx-auto px-5">
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#E8A449]/10 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-[#E8A449]" />
                </div>
                <div>
                  <p className="text-[#E8A449] text-xs tracking-[0.2em] font-medium">INSIGHT</p>
                  <h2 className="text-[#2D2640] font-bold text-xl" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                    セッションでの気づき
                  </h2>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-[#FAF8F5] rounded-2xl border border-[#E5E0ED] p-7 sm:p-9"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-[#2D2640] text-base leading-[2.2]" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                {voice.insight}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Result */}
        <section className="py-14 sm:py-20 bg-[#FAF8F5]">
          <div className="max-w-[800px] mx-auto px-5">
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#4A3F6B]/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#4A3F6B]" />
                </div>
                <div>
                  <p className="text-[#E8A449] text-xs tracking-[0.2em] font-medium">AFTER</p>
                  <h2 className="text-[#2D2640] font-bold text-xl" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                    現在の状態
                  </h2>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl border border-[#E5E0ED] p-7 sm:p-9 mb-8"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-[#2D2640] text-base leading-[2.2]" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                {voice.result}
              </p>
            </motion.div>

            {/* Numbers - big display */}
            <motion.div
              className="text-center p-8 sm:p-10 bg-white rounded-2xl border-2 border-[#E8A449]/30"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <TrendingUp className="w-8 h-8 text-[#E8A449] mx-auto mb-3" />
              <p
                className="text-[#2D2640] font-bold leading-tight mb-2"
                style={{ fontSize: "clamp(1.4rem, 3.5vw, 2rem)", fontFamily: "'Noto Serif JP', serif" }}
              >
                {voice.numbers}
              </p>
              <p className="text-[#7A7090] text-xs">具体的な変化</p>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 bg-[#4A3F6B]">
          <div className="max-w-[600px] mx-auto px-5 text-center">
            <h2 className="text-white font-bold text-2xl sm:text-3xl mb-4" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              同じお悩みをお持ちの方へ
            </h2>
            <p className="text-white/70 text-sm mb-8 leading-relaxed">
              {voice.initial}様と同じような悩みを抱えている方は、決して少なくありません。<br />
              まずは30分の無料相談で、今のお気持ちを聞かせてください。<br />
              あなたに合った解決の方向性を、一緒に探しましょう。
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
