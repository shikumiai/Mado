"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  X,
  Menu,
  Send,
  Check,
  Star,
  Sparkles,
  MessageCircle,
  Lightbulb,
  Target,
  Award,
  Heart,
  Users,
  ArrowRight,
} from "lucide-react";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, MenuItem, Service, Strength } from "@/lib/site-config-schema";
import { usePreviewName } from "@/lib/use-preview-name";
import siteConfig from "./site.config.json";

/* ═══════════════════════════════════════
   データ読み込み
   ═══════════════════════════════════════ */
const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const SERVICES = (config.services || []) as Service[];
const STRENGTHS = config.strengths || [];
const MENU_ITEMS = (config.menu || []) as MenuItem[];

const ICON_MAP: Record<string, typeof Target> = {
  Target,
  Users,
  Heart,
  Lightbulb,
  Award,
  Star,
  MessageCircle,
  Sparkles,
};

/* ═══════════════════════════════════════
   （SVGイラスト削除済み — 実写画像に置換）
   ═══════════════════════════════════════ */

/* ═══════════════════════════════════════
   Header
   ═══════════════════════════════════════ */
function Header() {
  const displayName = usePreviewName(COMPANY.name);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navItems = [
    { label: "サービス", href: "#services" },
    { label: "お客様の声", href: "/portfolio-templates/prism/voices" },
    { label: "選ばれる理由", href: "#strengths" },
    { label: "代表紹介", href: "#about" },
    { label: "料金", href: "#pricing" },
    { label: "無料相談", href: "#contact" },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#FAF8F5]/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}>
        <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <p className={`font-bold text-sm tracking-wide transition-colors ${scrolled ? "text-[#2D2640]" : "text-white"}`} style={{ fontFamily: "'Noto Serif JP', serif" }}>
              {displayName}
            </p>
          </a>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className={`text-sm transition-colors ${scrolled ? "text-[#7A7090] hover:text-[#4A3F6B]" : "text-white/80 hover:text-white"}`}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E8A449] text-white text-sm font-medium hover:bg-[#D4942E] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              初回無料相談
            </a>

            <button onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="メニュー">
              {open ? (
                <X className={`w-5 h-5 ${scrolled ? "text-[#2D2640]" : "text-white"}`} />
              ) : (
                <Menu className={`w-5 h-5 ${scrolled ? "text-[#2D2640]" : "text-white"}`} />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              className="lg:hidden bg-[#FAF8F5] border-t border-[#E5E0ED] px-5 py-5 space-y-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 px-4 text-[#2D2640] text-base rounded-lg hover:bg-[#4A3F6B]/5 transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#contact"
                className="block mt-3 text-center py-3.5 rounded-lg bg-[#E8A449] text-white font-medium"
              >
                <Sparkles className="w-4 h-4 inline mr-2" />初回無料相談
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* SP固定フッター */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#4A3F6B] safe-area-bottom">
        <a href={`tel:${COMPANY.phone}`} className="flex items-center justify-center gap-2 py-3.5 text-white font-bold text-base">
          <Phone className="w-5 h-5" /> 無料相談を予約する
        </a>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════
   Hero
   ═══════════════════════════════════════ */
function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y }}>
        <Image
          src="/images/templates/prism/hero.jpg"
          alt="チームワーク・コーチング"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D2640]/70 via-[#2D2640]/30 to-[#2D2640]/40" />
      </motion.div>

      <motion.div
        className="relative z-10 h-full flex flex-col justify-end max-w-[1200px] mx-auto px-5 pb-20 sm:pb-24"
        style={{ opacity }}
      >
        {/* 初回無料相談バッジ */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8A449]/20 backdrop-blur-sm border border-[#E8A449]/30 w-fit mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Sparkles className="w-3 h-3 text-[#E8A449]" />
          <span className="text-[#E8A449] text-xs tracking-wider font-medium">初回無料相談 受付中</span>
        </motion.div>

        <motion.h1
          className="text-white font-bold leading-[1.4] mb-4"
          style={{ fontSize: "clamp(1.6rem, 4.5vw, 2.8rem)", fontFamily: "'Noto Serif JP', serif" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          {COMPANY.tagline}
        </motion.h1>

        <motion.p
          className="text-white/70 text-sm sm:text-base max-w-[560px] leading-relaxed mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {COMPANY.description}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <a href="#contact" className="px-8 py-3.5 rounded-lg bg-[#E8A449] text-white font-medium text-sm hover:bg-[#D4942E] transition-colors text-center shadow-lg shadow-[#E8A449]/20">
            無料相談を予約する
          </a>
          <a href="#services" className="px-8 py-3.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm hover:bg-white/20 transition-colors text-center">
            サービス内容を見る
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Services — サービス内容
   ═══════════════════════════════════════ */
function ServicesSection() {
  return (
    <section id="services" className="relative py-20 sm:py-28 bg-[#FAF8F5] overflow-hidden">
      {/* セクション背景画像 */}
      <div className="absolute inset-0">
        <Image
          src="/images/templates/prism/coaching.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#FAF8F5]/92" />
      </div>
      <div className="relative max-w-[1000px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#E8A449] text-xs tracking-[0.3em] mb-2 font-medium">SERVICES</p>
          <h2 className="text-[#2D2640] font-bold text-2xl sm:text-3xl mb-3" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            サービス内容
          </h2>
          <p className="text-[#7A7090] text-sm max-w-[500px] mx-auto">
            あなたの課題に合わせた4つのプログラムをご用意しています。
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {SERVICES.map((service, i) => {
            const Icon = ICON_MAP[service.icon || "Target"] || Target;
            const card = (
              <motion.div
                key={i}
                className="bg-white rounded-2xl border border-[#E5E0ED] p-7 sm:p-8 hover:shadow-lg hover:shadow-[#4A3F6B]/5 transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#4A3F6B]/8 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#4A3F6B]" strokeWidth={1.5} />
                  </div>
                  {service.slug && (
                    <ArrowRight className="w-4 h-4 text-[#E8A449] opacity-0 group-hover:opacity-100 transition-opacity mt-2" />
                  )}
                </div>
                <h3 className="font-bold text-[#2D2640] text-lg mb-3" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                  {service.title}
                </h3>
                <p className="text-[#7A7090] text-sm leading-[1.9]">{service.description}</p>
              </motion.div>
            );
            return service.slug ? (
              <Link key={i} href={`/portfolio-templates/prism/services/${service.slug}`}>
                {card}
              </Link>
            ) : (
              card
            );
          })}
        </div>

        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link
            href="/portfolio-templates/prism/services"
            className="inline-flex items-center gap-2 text-[#4A3F6B] text-sm font-medium hover:text-[#E8A449] transition-colors"
          >
            サービス一覧を見る
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Strengths — 選ばれる理由
   ═══════════════════════════════════════ */
function StrengthsSection() {
  const highlights: { num: string; unit: string; label: string }[] = [
    { num: "200", unit: "名超", label: "支援実績" },
    { num: "85", unit: "%", label: "転職成功率" },
    { num: "120", unit: "万円", label: "平均年収アップ" },
  ];

  return (
    <section id="strengths" className="relative py-20 sm:py-28 bg-white overflow-hidden">
      {/* セクション背景画像 */}
      <div className="absolute inset-0">
        <Image
          src="/images/templates/prism/session.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-white/93" />
      </div>
      <div className="relative max-w-[1000px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#E8A449] text-xs tracking-[0.3em] mb-2 font-medium">WHY CHOOSE US</p>
          <h2 className="text-[#2D2640] font-bold text-2xl sm:text-3xl" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            選ばれる理由
          </h2>
        </motion.div>

        {/* 数字ハイライト */}
        <motion.div
          className="grid grid-cols-3 gap-4 mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {highlights.map((item, i) => (
            <div key={i} className="text-center py-6 sm:py-8 bg-[#FAF8F5] rounded-2xl border border-[#E5E0ED]">
              <p className="text-[#4A3F6B] font-bold leading-none mb-1" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontFamily: "'Noto Serif JP', serif" }}>
                {item.num}<span className="text-lg sm:text-xl">{item.unit}</span>
              </p>
              <p className="text-[#7A7090] text-xs sm:text-sm">{item.label}</p>
            </div>
          ))}
        </motion.div>

        {/* 強み詳細 */}
        <div className="space-y-6">
          {STRENGTHS.map((s: Strength, i: number) => {
            const Icon = ICON_MAP[s.icon || "Award"] || Award;
            return (
              <motion.div
                key={i}
                className="flex items-start gap-5 p-6 bg-[#FAF8F5] rounded-2xl border border-[#E5E0ED]"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-[#E8A449]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-6 h-6 text-[#E8A449]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-[#2D2640] text-base mb-2" style={{ fontFamily: "'Noto Serif JP', serif" }}>{s.title}</h3>
                  <p className="text-[#7A7090] text-sm leading-[1.9]">{s.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   About — 代表紹介
   ═══════════════════════════════════════ */
function AboutSection() {
  return (
    <section id="about" className="py-20 sm:py-28 bg-[#FAF8F5]">
      <div className="max-w-[900px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#E8A449] text-xs tracking-[0.3em] mb-2 font-medium">ABOUT</p>
          <h2 className="text-[#2D2640] font-bold text-2xl sm:text-3xl" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            代表紹介
          </h2>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl border border-[#E5E0ED] p-8 sm:p-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="sm:flex sm:gap-8">
            {/* 代表写真 */}
            <div className="flex-shrink-0 mb-6 sm:mb-0">
              <div className="w-[160px] h-[200px] rounded-xl mx-auto sm:mx-0 overflow-hidden relative">
                <Image
                  src="/images/templates/prism/owner.jpg"
                  alt={COMPANY.ceo || "代表"}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </div>
              <div className="text-center mt-3">
                <p className="text-[#2D2640] font-bold text-sm" style={{ fontFamily: "'Noto Serif JP', serif" }}>{COMPANY.ceo}</p>
                <p className="text-[#7A7090] text-xs mt-0.5">{COMPANY.ceoTitle}</p>
              </div>

              {/* 資格バッジ */}
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {["ICF認定(ACC)", "外資コンサル10年", "支援実績200名超"].map((badge) => (
                  <span key={badge} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4A3F6B]/8 text-[#4A3F6B] text-[10px] font-medium">
                    <Check className="w-2.5 h-2.5" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-[#2D2640] text-sm sm:text-base leading-[2.2]" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              {COMPANY.bio.split("\n\n").map((para, i) => (
                <p key={i} className={i > 0 ? "mt-5" : ""}>{para}</p>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Pricing — 料金
   ═══════════════════════════════════════ */
function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-white">
      <div className="max-w-[1000px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#E8A449] text-xs tracking-[0.3em] mb-2 font-medium">PRICING</p>
          <h2 className="text-[#2D2640] font-bold text-2xl sm:text-3xl mb-3" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            料金
          </h2>
          <p className="text-[#7A7090] text-sm">初回のご相談は無料です。お気軽にお問い合わせください。</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MENU_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              className={`rounded-2xl border overflow-hidden flex flex-col ${
                item.isRecommended
                  ? "border-[#E8A449] shadow-lg shadow-[#E8A449]/10 relative"
                  : "border-[#E5E0ED]"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              {item.isRecommended && (
                <div className="bg-[#E8A449] text-white text-xs font-medium text-center py-1.5 tracking-wider">
                  おすすめ
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col bg-[#FAF8F5]">
                <h3 className="font-bold text-[#2D2640] text-base mb-3" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                  {item.name}
                </h3>
                <p className="text-[#4A3F6B] font-bold text-2xl mb-4" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                  {item.price}
                  {item.price !== "お見積り" && <span className="text-xs text-[#7A7090] font-normal ml-1">（税込）</span>}
                </p>
                <p className="text-[#7A7090] text-sm leading-[1.8] flex-1">{item.description}</p>
                <a
                  href="#contact"
                  className={`mt-5 block text-center py-3 rounded-lg text-sm font-medium transition-colors ${
                    item.isRecommended
                      ? "bg-[#E8A449] text-white hover:bg-[#D4942E]"
                      : "bg-[#4A3F6B]/8 text-[#4A3F6B] hover:bg-[#4A3F6B]/15"
                  }`}
                >
                  無料相談する
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-center text-[#7A7090] text-xs mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          ※ 表示価格はすべて税込です。法人研修は対象人数・期間に応じてお見積りいたします。
        </motion.p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Contact — 無料相談フォーム
   ═══════════════════════════════════════ */
function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="contact" className="py-20 sm:py-28 bg-[#FAF8F5]">
      <div className="max-w-[800px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#E8A449] text-xs tracking-[0.3em] mb-2 font-medium">CONTACT</p>
          <h2 className="text-[#2D2640] font-bold text-2xl sm:text-3xl mb-3" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            無料相談のご予約
          </h2>
          <p className="text-[#7A7090] text-sm">
            初回30分の無料相談で、あなたの課題と目標を整理します。<br className="hidden sm:block" />
            無理な勧誘は一切ありません。
          </p>
        </motion.div>

        {/* 電話CTA */}
        <motion.div
          className="text-center mb-12 p-8 rounded-2xl bg-white border border-[#E5E0ED]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#E8A449] text-xs tracking-wider mb-3 font-medium">お電話でのご予約</p>
          <a
            href={`tel:${COMPANY.phone}`}
            className="inline-block text-[#2D2640] text-3xl sm:text-4xl font-bold tracking-wider hover:text-[#4A3F6B] transition-colors"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            {COMPANY.phone}
          </a>
          <p className="text-[#7A7090] text-xs mt-2">
            <Clock className="w-3 h-3 inline mr-1" />
            {COMPANY.hours}
          </p>
        </motion.div>

        {/* フォーム */}
        <motion.div
          className="bg-white rounded-2xl border border-[#E5E0ED] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="p-5 sm:p-6 bg-[#4A3F6B] border-b border-[#E5E0ED]">
            <h3 className="text-white font-bold text-base" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              <Mail className="w-4 h-4 inline mr-2" />
              フォームからのご予約
            </h3>
          </div>

          {submitted ? (
            <div className="p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-[#E8A449]/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-[#E8A449]" />
              </div>
              <p className="text-[#2D2640] text-lg font-bold mb-2">お申し込みありがとうございます</p>
              <p className="text-[#7A7090] text-sm">24時間以内にご連絡いたします。</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="p-6 sm:p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-[#7A7090] mb-2 font-medium">
                    お名前 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#FAF8F5] border border-[#E5E0ED] text-[#2D2640] text-sm placeholder:text-[#B5B0C5] focus:outline-none focus:border-[#4A3F6B] focus:ring-2 focus:ring-[#4A3F6B]/10 transition-all"
                    placeholder="松田 太郎"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#7A7090] mb-2 font-medium">
                    メールアドレス <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#FAF8F5] border border-[#E5E0ED] text-[#2D2640] text-sm placeholder:text-[#B5B0C5] focus:outline-none focus:border-[#4A3F6B] focus:ring-2 focus:ring-[#4A3F6B]/10 transition-all"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#7A7090] mb-2 font-medium">
                  電話番号
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-lg bg-[#FAF8F5] border border-[#E5E0ED] text-[#2D2640] text-sm placeholder:text-[#B5B0C5] focus:outline-none focus:border-[#4A3F6B] focus:ring-2 focus:ring-[#4A3F6B]/10 transition-all"
                  placeholder="090-1234-5678"
                />
              </div>

              <div>
                <label className="block text-xs text-[#7A7090] mb-2 font-medium">
                  ご相談内容 <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {["キャリア", "リーダーシップ", "ライフデザイン", "その他"].map((type) => (
                    <label key={type} className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E5E0ED] text-sm text-[#2D2640] cursor-pointer hover:border-[#4A3F6B]/30 hover:bg-[#4A3F6B]/5 transition-all has-[:checked]:bg-[#4A3F6B]/10 has-[:checked]:border-[#4A3F6B]/30 has-[:checked]:text-[#4A3F6B]">
                      <input type="radio" name="type" value={type} className="sr-only" />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#7A7090] mb-2 font-medium">
                  現在の状況やご希望をお聞かせください
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-[#FAF8F5] border border-[#E5E0ED] text-[#2D2640] text-sm placeholder:text-[#B5B0C5] focus:outline-none focus:border-[#4A3F6B] focus:ring-2 focus:ring-[#4A3F6B]/10 transition-all resize-none"
                  placeholder="例：転職を考えていますが、自分の強みが分からず迷っています。"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-lg bg-[#E8A449] text-white font-bold text-sm tracking-wider hover:bg-[#D4942E] transition-colors"
              >
                <Send className="w-4 h-4" />
                無料相談を予約する
              </button>

              <p className="text-center text-[#7A7090] text-xs">
                ※ 無理な勧誘は一切ありません。お気軽にご相談ください。
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Footer
   ═══════════════════════════════════════ */
function Footer() {
  const displayName = usePreviewName(COMPANY.name);
  return (
    <footer className="py-10 bg-[#2D2640] pb-24 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-white/10">
          <p className="text-white font-bold text-sm" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            {displayName}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5">
            {[
              { label: "サービス", href: "#services" },
              { label: "お客様の声", href: "/portfolio-templates/prism/voices" },
              { label: "選ばれる理由", href: "#strengths" },
              { label: "代表紹介", href: "#about" },
              { label: "料金", href: "#pricing" },
              { label: "無料相談", href: "#contact" },
            ].map((item) => (
              <a key={item.href} href={item.href} className="text-white/50 text-xs hover:text-white transition-colors">
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-white/30 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{COMPANY.address}</span>
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{COMPANY.phone}</span>
          </div>
          <p>&copy; {new Date().getFullYear()} {displayName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════
   Page
   ═══════════════════════════════════════ */
export default function PrismPage() {
  return (
    <>
      <DemoBanner />
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <StrengthsSection />
        <AboutSection />
        <PricingSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
