"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Phone,
  MessageCircle,
} from "lucide-react";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, Voice } from "@/lib/site-config-schema";
import siteConfig from "../site.config.json";

const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const VOICES = (config.voices || []) as Voice[];

export default function VoicesPage() {
  return (
    <>
      <DemoBanner />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md shadow-sm">
        <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/portfolio-templates/prism" className="flex items-center gap-2 text-[#7A7090] text-sm hover:text-[#4A3F6B] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            トップに戻る
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
        <section className="relative py-20 sm:py-28 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/templates/prism/session.jpg"
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[#2D2640]/75" />
          </div>
          <div className="relative max-w-[900px] mx-auto px-5 text-center">
            <motion.p
              className="text-[#E8A449] text-xs tracking-[0.3em] mb-3 font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              VOICES
            </motion.p>
            <motion.h1
              className="text-white font-bold text-3xl sm:text-4xl mb-5"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              お客様の声
            </motion.h1>
            <motion.p
              className="text-white/70 text-sm sm:text-base max-w-[560px] mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              同じような悩みを抱えていた方が、<br className="hidden sm:block" />
              コーチングを通じてどう変わったのか。その一部をご紹介します。
            </motion.p>
          </div>
        </section>

        {/* Reassurance */}
        <section className="py-10 bg-[#FAF8F5] border-b border-[#E5E0ED]">
          <div className="max-w-[800px] mx-auto px-5 text-center">
            <p className="text-[#7A7090] text-sm leading-relaxed">
              掲載しているのはごく一部です。さまざまな業種・年齢・立場の方にご利用いただいています。<br className="hidden sm:block" />
              「自分と似た状況の方がいるだろうか」と思ったら、まずは無料相談でお話しください。
            </p>
          </div>
        </section>

        {/* Voices List */}
        <section className="py-16 sm:py-24 bg-[#FAF8F5]">
          <div className="max-w-[900px] mx-auto px-5 space-y-6">
            {VOICES.map((voice, i) => (
              <motion.div
                key={voice.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={`/portfolio-templates/prism/voices/${voice.slug}`} className="block group">
                  <div className="bg-white rounded-2xl border border-[#E5E0ED] p-7 sm:p-9 hover:shadow-lg hover:shadow-[#4A3F6B]/5 transition-all duration-300 group-hover:border-[#4A3F6B]/20">
                    <div className="sm:flex sm:items-start sm:gap-6">
                      {/* Avatar */}
                      <div className="flex-shrink-0 mb-4 sm:mb-0">
                        <div className="w-14 h-14 rounded-full bg-[#4A3F6B]/8 flex items-center justify-center">
                          <span className="text-[#4A3F6B] text-sm font-bold" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                            {voice.initial}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-[#2D2640] text-sm font-bold">{voice.initial} 様</p>
                            <p className="text-[#7A7090] text-xs mt-0.5">{voice.attribute}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-[#E8A449] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1 ml-3" />
                        </div>

                        {/* Challenge summary */}
                        <p className="text-[#7A7090] text-sm leading-[1.8] mb-4 line-clamp-2">
                          {voice.challenge}
                        </p>

                        {/* Numbers highlight */}
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0ED] w-fit">
                          <MessageCircle className="w-4 h-4 text-[#E8A449] flex-shrink-0" />
                          <p className="text-[#2D2640] text-sm font-bold" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                            {voice.numbers}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 bg-[#4A3F6B]">
          <div className="max-w-[600px] mx-auto px-5 text-center">
            <h2 className="text-white font-bold text-2xl sm:text-3xl mb-4" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              同じお悩みの方は、多くいらっしゃいます
            </h2>
            <p className="text-white/70 text-sm mb-8 leading-relaxed">
              「自分だけが悩んでいるのでは」と感じていませんか。<br />
              これまで200名以上の方が、同じような悩みを抱えてご相談くださいました。<br />
              まずは30分、お話を聞かせてください。
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
