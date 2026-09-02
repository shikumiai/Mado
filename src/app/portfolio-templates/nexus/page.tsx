"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Code,
  Globe,
  Monitor,
  Rocket,
  Shield,
  Server,
  Phone,
  Mail,
  MapPin,
  Clock,
  X,
  Menu,
  Send,
  Check,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, Project, Service, Strength } from "@/lib/site-config-schema";
import { usePreviewName } from "@/lib/use-preview-name";
import siteConfig from "./site.config.json";

/* ═══════════════════════════════════════
   データ読み込み
   ═══════════════════════════════════════ */
const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const SERVICES = (config.services || []) as Service[];
const PROJECTS = (config.projects || []) as Project[];
const STRENGTHS = (config.strengths || []) as Strength[];

const ICON_MAP: Record<string, typeof Code> = {
  Code,
  Globe,
  Monitor,
  Rocket,
  Shield,
  Server,
  Star,
  Users,
};

/* ═══════════════════════════════════════
   画像パス
   ═══════════════════════════════════════ */
const IMG = "/images/templates/nexus";
const WORK_IMAGES = [`${IMG}/work-1.jpg`, `${IMG}/work-2.jpg`, `${IMG}/work-3.jpg`];
const WORK_FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #EEF0F6 0%, #D1D5E8 100%)",
  "linear-gradient(135deg, #F0EEF6 0%, #D5D1E8 100%)",
  "linear-gradient(135deg, #EEF4F6 0%, #D1E0E8 100%)",
];

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
    { label: "制作実績", href: "#works" },
    { label: "選ばれる理由", href: "#strengths" },
    { label: "会社概要", href: "#about" },
    { label: "お問い合わせ", href: "#contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${scrolled ? "bg-[#0F3460]" : "bg-white/10 backdrop-blur-sm"}`}>
              <Code className={`w-4 h-4 ${scrolled ? "text-white" : "text-[#E94560]"}`} strokeWidth={2.5} />
            </div>
            <span
              className={`font-bold text-sm tracking-wide transition-colors ${scrolled ? "text-[#1A1A2E]" : "text-white"}`}
            >
              {displayName}
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  scrolled ? "text-[#6B7280] hover:text-[#0F3460]" : "text-white/70 hover:text-white"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${COMPANY.phone}`}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E94560] text-white text-sm font-medium hover:bg-[#D13550] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="tracking-wider">{COMPANY.phone}</span>
            </a>

            <button onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="メニュー">
              {open ? (
                <X className={`w-5 h-5 ${scrolled ? "text-[#1A1A2E]" : "text-white"}`} />
              ) : (
                <Menu className={`w-5 h-5 ${scrolled ? "text-[#1A1A2E]" : "text-white"}`} />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              className="lg:hidden bg-white border-t border-[#E2E5EB] px-5 py-5 space-y-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 px-4 text-[#1A1A2E] text-base rounded-lg hover:bg-[#0F3460]/5 transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={`tel:${COMPANY.phone}`}
                className="block mt-3 text-center py-3.5 rounded-lg bg-[#E94560] text-white font-medium"
              >
                <Phone className="w-4 h-4 inline mr-2" />
                {COMPANY.phone}
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* SP fixed bottom phone bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#E94560] safe-area-bottom">
        <a
          href={`tel:${COMPANY.phone}`}
          className="flex items-center justify-center gap-2 py-3.5 text-white font-bold text-base"
        >
          <Phone className="w-5 h-5" /> お問い合わせ
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
        <div className="relative w-full h-full">
          <Image src={`${IMG}/hero.jpg`} alt="" fill className="object-cover" priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/80 via-[#0A1628]/50 to-transparent" />
      </motion.div>

      <motion.div
        className="relative z-10 h-full flex items-center max-w-[1200px] mx-auto px-5"
        style={{ opacity }}
      >
        <div className="max-w-[600px]">
          {/* バッジ */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Server className="w-3 h-3 text-[#E94560]" />
            <span className="text-white/80 text-xs tracking-wider">Web制作 / システム開発</span>
          </motion.div>

          <motion.h1
            className="text-white font-bold leading-[1.35] mb-5"
            style={{ fontSize: "clamp(1.8rem, 4.5vw, 2.8rem)" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            {COMPANY.tagline}
          </motion.h1>

          <motion.p
            className="text-white/60 text-sm sm:text-base leading-relaxed mb-8 max-w-[480px]"
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
            <a
              href="#contact"
              className="px-8 py-3.5 rounded-lg bg-[#E94560] text-white font-medium text-sm hover:bg-[#D13550] transition-colors text-center shadow-lg shadow-[#E94560]/20"
            >
              無料で相談する
            </a>
            <a
              href="#works"
              className="px-8 py-3.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm hover:bg-white/20 transition-colors text-center"
            >
              制作実績を見る
            </a>
          </motion.div>
        </div>

        {/* 右側写真（デスクトップのみ） */}
        <motion.div
          className="hidden lg:block ml-auto relative w-[400px] h-[280px] rounded-2xl overflow-hidden shadow-2xl shadow-black/30"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <Image src={`${IMG}/office.jpg`} alt="オフィス" fill className="object-cover" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Services — 非対称2+2レイアウト
   ═══════════════════════════════════════ */
function ServicesSection() {
  return (
    <section id="services" className="py-20 sm:py-28 bg-[#F8F9FC]">
      <div className="max-w-[1100px] mx-auto px-5">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#E94560] text-xs tracking-[0.3em] mb-2 font-bold">SERVICE</p>
          <h2 className="text-[#1A1A2E] font-bold text-2xl sm:text-3xl mb-3">サービス</h2>
          <p className="text-[#6B7280] text-sm max-w-[480px] mx-auto">
            企画から開発、リリース後の改善まで。自社エンジニアがワンストップで対応します。
          </p>
        </motion.div>

        {/* 非対称レイアウト: 上段2列（大小）＋ 下段2列（小大） */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {SERVICES.map((service, i) => {
            const Icon = ICON_MAP[service.icon || "Code"] || Code;
            // 0: col-7, 1: col-5, 2: col-5, 3: col-7
            const colClass = i % 2 === 0 ? "md:col-span-7" : "md:col-span-5";
            return (
              <motion.div
                key={i}
                className={`${colClass} bg-white rounded-2xl border border-[#E2E5EB] p-7 sm:p-8 hover:shadow-lg hover:shadow-[#0F3460]/5 hover:border-[#0F3460]/20 transition-all duration-300 group`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-[#0F3460]/8 flex items-center justify-center mb-5 group-hover:bg-[#E94560]/10 transition-colors">
                  <Icon className="w-6 h-6 text-[#0F3460] group-hover:text-[#E94560] transition-colors" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-[#1A1A2E] text-lg mb-3">{service.title}</h3>
                <p className="text-[#6B7280] text-sm leading-[1.9]">{service.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Works — 制作実績
   ═══════════════════════════════════════ */
function WorksSection() {
  const categories = ["すべて", ...Array.from(new Set(PROJECTS.map((p) => p.category)))];
  const [filter, setFilter] = useState("すべて");
  const filtered = filter === "すべて" ? PROJECTS : PROJECTS.filter((p) => p.category === filter);

  return (
    <section id="works" className="py-20 sm:py-28 bg-white">
      <div className="max-w-[1100px] mx-auto px-5">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#E94560] text-xs tracking-[0.3em] mb-2 font-bold">WORKS</p>
          <h2 className="text-[#1A1A2E] font-bold text-2xl sm:text-3xl mb-3">制作実績</h2>
          <p className="text-[#6B7280] text-sm">これまでに手がけたプロジェクトの一部をご紹介します。</p>
        </motion.div>

        {/* フィルター */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm transition-all ${
                filter === cat
                  ? "bg-[#0F3460] text-white"
                  : "bg-[#F8F9FC] text-[#6B7280] border border-[#E2E5EB] hover:border-[#0F3460]/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* カード */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              className="bg-[#F8F9FC] rounded-2xl border border-[#E2E5EB] overflow-hidden hover:shadow-lg hover:shadow-[#0F3460]/5 transition-all duration-300 group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              {/* サムネ */}
              <div className="relative aspect-[16/10] overflow-hidden">
                {i < WORK_IMAGES.length ? (
                  <Image src={WORK_IMAGES[i]} alt={project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full" style={{ background: WORK_FALLBACK_GRADIENTS[i % WORK_FALLBACK_GRADIENTS.length] }} />
                )}
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="px-2.5 py-0.5 rounded bg-[#0F3460]/8 text-[#0F3460] text-[11px] font-medium">
                    {project.category}
                  </span>
                  <span className="text-[#6B7280] text-[11px]">{project.year}</span>
                </div>
                <h3 className="font-bold text-[#1A1A2E] text-base mb-2 leading-snug">{project.title}</h3>
                <p className="text-[#6B7280] text-sm leading-[1.8]">{project.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Strengths — 選ばれる理由
   ═══════════════════════════════════════ */
function StrengthsSection() {
  return (
    <section id="strengths" className="py-20 sm:py-28 bg-[#0F3460]">
      <div className="max-w-[1000px] mx-auto px-5">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#E94560] text-xs tracking-[0.3em] mb-2 font-bold">WHY US</p>
          <h2 className="text-white font-bold text-2xl sm:text-3xl">選ばれる理由</h2>
        </motion.div>

        <div className="space-y-6">
          {STRENGTHS.map((s, i) => {
            const Icon = ICON_MAP[s.icon || "Star"] || Star;
            return (
              <motion.div
                key={i}
                className="flex items-start gap-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-7 sm:p-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-14 h-14 rounded-xl bg-[#E94560]/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-7 h-7 text-[#E94560]" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[#E94560] text-xs font-bold tracking-widest">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-bold text-white text-lg">{s.title}</h3>
                  </div>
                  <p className="text-white/60 text-sm leading-[1.9]">{s.description}</p>
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
   About — 代表挨拶 + 会社概要
   ═══════════════════════════════════════ */
function AboutSection() {
  const displayName = usePreviewName(COMPANY.name);

  return (
    <section id="about" className="py-20 sm:py-28 bg-[#F8F9FC]">
      <div className="max-w-[1000px] mx-auto px-5">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#E94560] text-xs tracking-[0.3em] mb-2 font-bold">ABOUT</p>
          <h2 className="text-[#1A1A2E] font-bold text-2xl sm:text-3xl">会社概要</h2>
        </motion.div>

        {/* 代表挨拶 */}
        <motion.div
          className="bg-white rounded-2xl border border-[#E2E5EB] p-8 sm:p-10 mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="sm:flex sm:gap-8">
            <div className="flex-shrink-0 mb-6 sm:mb-0">
              <div className="relative w-[140px] h-[180px] rounded-xl overflow-hidden mx-auto sm:mx-0">
                <Image src={`${IMG}/owner.jpg`} alt={`${COMPANY.ceoTitle} ${COMPANY.ceo}`} fill className="object-cover" />
              </div>
              <p className="text-center text-[#6B7280] text-xs mt-2">
                {COMPANY.ceoTitle}　{COMPANY.ceo}
              </p>
            </div>

            <div className="text-[#1A1A2E] text-sm sm:text-base leading-[2.2]">
              {COMPANY.bio.split("\n\n").map((para, i) => (
                <p key={i} className={i > 0 ? "mt-5" : ""}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 会社情報テーブル */}
        <motion.div
          className="bg-white rounded-2xl border border-[#E2E5EB] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="divide-y divide-[#E2E5EB]">
            {[
              { label: "会社名", value: displayName },
              { label: "代表者", value: COMPANY.ceo },
              { label: "設立", value: `${COMPANY.since}年` },
              { label: "所在地", value: COMPANY.address },
              ...(COMPANY.employees ? [{ label: "従業員数", value: COMPANY.employees }] : []),
              ...(COMPANY.capital ? [{ label: "資本金", value: COMPANY.capital }] : []),
              { label: "電話番号", value: COMPANY.phone },
              { label: "メール", value: COMPANY.email },
              { label: "営業時間", value: COMPANY.hours },
            ].map((row, i) => (
              <div key={i} className="flex flex-col sm:flex-row">
                <div className="sm:w-36 px-6 py-3.5 bg-[#F8F9FC] text-[#6B7280] text-xs font-bold tracking-wider">
                  {row.label}
                </div>
                <div className="flex-1 px-6 py-3.5 text-[#1A1A2E] text-sm">{row.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Contact — お問い合わせ
   ═══════════════════════════════════════ */
function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="contact" className="py-20 sm:py-28 bg-white">
      <div className="max-w-[800px] mx-auto px-5">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#E94560] text-xs tracking-[0.3em] mb-2 font-bold">CONTACT</p>
          <h2 className="text-[#1A1A2E] font-bold text-2xl sm:text-3xl mb-3">お問い合わせ</h2>
          <p className="text-[#6B7280] text-sm">
            サイト制作・システム開発のご相談はお気軽にどうぞ。初回ヒアリングは無料です。
          </p>
        </motion.div>

        {/* 電話CTA */}
        <motion.div
          className="text-center mb-10 p-8 rounded-2xl bg-[#F8F9FC] border border-[#E2E5EB]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#0F3460] text-xs tracking-wider mb-3 font-bold">お電話でのお問い合わせ</p>
          <a
            href={`tel:${COMPANY.phone}`}
            className="inline-block text-[#1A1A2E] text-3xl sm:text-4xl font-bold tracking-wider hover:text-[#E94560] transition-colors"
          >
            {COMPANY.phone}
          </a>
          <p className="text-[#6B7280] text-xs mt-2">{COMPANY.hours}</p>
        </motion.div>

        {/* フォーム */}
        <motion.div
          className="bg-[#F8F9FC] rounded-2xl border border-[#E2E5EB] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="p-5 sm:p-6 bg-[#0F3460] border-b border-[#E2E5EB]">
            <h3 className="text-white font-bold text-base">メールでのお問い合わせ</h3>
          </div>

          {submitted ? (
            <div className="p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-[#0F3460]/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-[#0F3460]" />
              </div>
              <p className="text-[#1A1A2E] text-lg font-bold mb-2">お問い合わせありがとうございます</p>
              <p className="text-[#6B7280] text-sm">2営業日以内にご返信いたします。</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="p-6 sm:p-8 space-y-5"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-[#6B7280] mb-2 font-medium">
                    会社名 <span className="text-[#E94560]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E2E5EB] text-[#1A1A2E] text-sm placeholder:text-[#C4CAD4] focus:outline-none focus:border-[#0F3460] focus:ring-2 focus:ring-[#0F3460]/10 transition-all"
                    placeholder="株式会社サンプル"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6B7280] mb-2 font-medium">
                    お名前 <span className="text-[#E94560]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E2E5EB] text-[#1A1A2E] text-sm placeholder:text-[#C4CAD4] focus:outline-none focus:border-[#0F3460] focus:ring-2 focus:ring-[#0F3460]/10 transition-all"
                    placeholder="山田 太郎"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-[#6B7280] mb-2 font-medium">
                    メールアドレス <span className="text-[#E94560]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E2E5EB] text-[#1A1A2E] text-sm placeholder:text-[#C4CAD4] focus:outline-none focus:border-[#0F3460] focus:ring-2 focus:ring-[#0F3460]/10 transition-all"
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6B7280] mb-2 font-medium">電話番号</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E2E5EB] text-[#1A1A2E] text-sm placeholder:text-[#C4CAD4] focus:outline-none focus:border-[#0F3460] focus:ring-2 focus:ring-[#0F3460]/10 transition-all"
                    placeholder="03-0000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#6B7280] mb-2 font-medium">ご相談内容</label>
                <div className="flex flex-wrap gap-2">
                  {["Webサイト制作", "Webアプリ開発", "ECサイト構築", "保守・運用", "その他"].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E2E5EB] text-sm text-[#1A1A2E] cursor-pointer hover:border-[#0F3460]/30 hover:bg-[#0F3460]/5 transition-all has-[:checked]:bg-[#0F3460]/10 has-[:checked]:border-[#0F3460]/30 has-[:checked]:text-[#0F3460]"
                    >
                      <input type="radio" name="type" value={type} className="sr-only" />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#6B7280] mb-2 font-medium">
                  ご相談内容の詳細
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-white border border-[#E2E5EB] text-[#1A1A2E] text-sm placeholder:text-[#C4CAD4] focus:outline-none focus:border-[#0F3460] focus:ring-2 focus:ring-[#0F3460]/10 transition-all resize-none"
                  placeholder="現在のサイトの課題や、ご希望のスケジュール・ご予算感など、分かる範囲でご記入ください。"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-lg bg-[#E94560] text-white font-bold text-sm tracking-wider hover:bg-[#D13550] transition-colors"
              >
                <Send className="w-4 h-4" />
                送信する
              </button>
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
    <footer className="py-10 bg-[#1A1A2E] pb-24 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Code className="w-4 h-4 text-[#E94560]" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold text-sm">{displayName}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            {[
              { label: "サービス", href: "#services" },
              { label: "制作実績", href: "#works" },
              { label: "選ばれる理由", href: "#strengths" },
              { label: "会社概要", href: "#about" },
              { label: "お問い合わせ", href: "#contact" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-white/40 text-xs hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-white/25 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              {COMPANY.address}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3" />
              {COMPANY.phone}
            </span>
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
export default function NexusPage() {
  return (
    <>
      <DemoBanner />
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <WorksSection />
        <StrengthsSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
