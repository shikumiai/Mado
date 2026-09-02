"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Calculator,
  FileText,
  Building2,
  Scale,
  Briefcase,
  Users,
  Phone,
  Mail,
  MapPin,
  Clock,
  X,
  Menu,
  Send,
  Check,
  ExternalLink,
  Star,
  Shield,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, MenuItem, Service, Case } from "@/lib/site-config-schema";
import { usePreviewName } from "@/lib/use-preview-name";
import siteConfig from "./site.config.json";

/* ═══════════════════════════════════════
   データ読み込み
   ═══════════════════════════════════════ */
const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const SERVICES = (config.services || []) as Service[];
const MENU_ITEMS = (config.menu || []) as MenuItem[];
const STRENGTHS = config.strengths || [];
const CASES = (config.cases || []) as Case[];

const ICON_MAP: Record<string, typeof Calculator> = {
  Calculator,
  FileText,
  Building2,
  Scale,
  Briefcase,
  Users,
  Shield,
  Star,
};

/* 料金カテゴリの抽出 */
const PRICING_CATEGORIES = Array.from(new Set(MENU_ITEMS.map((m) => m.category)));

/* カラー定数 */
const C = {
  primary: "#2B4C3F",
  accent: "#8B7355",
  bg: "#F7F6F3",
  text: "#1A1A1A",
  muted: "#6B6B6B",
  border: "#E0DDD8",
  white: "#FFFFFF",
} as const;


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
    { label: "取扱業務", href: "#services" },
    { label: "代表紹介", href: "#about" },
    { label: "料金", href: "#pricing" },
    { label: "事務所情報", href: "#info" },
    { label: "お問い合わせ", href: "#contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-[#F7F6F3]/95 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <p
              className={`font-bold text-sm tracking-wide transition-colors ${
                scrolled ? "text-[#1A1A1A]" : "text-white"
              }`}
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              {displayName}
            </p>
          </a>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  scrolled ? "text-[#6B6B6B] hover:text-[#2B4C3F]" : "text-white/80 hover:text-white"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${COMPANY.phone}`}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2B4C3F] text-white text-sm font-medium hover:bg-[#1F3A30] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="tracking-wider">{COMPANY.phone}</span>
            </a>

            <button onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="メニュー">
              {open ? (
                <X className={`w-5 h-5 ${scrolled ? "text-[#1A1A1A]" : "text-white"}`} />
              ) : (
                <Menu className={`w-5 h-5 ${scrolled ? "text-[#1A1A1A]" : "text-white"}`} />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              className="lg:hidden bg-[#F7F6F3] border-t border-[#E0DDD8] px-5 py-5 space-y-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 px-4 text-[#1A1A1A] text-base rounded-lg hover:bg-[#2B4C3F]/5 transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={`tel:${COMPANY.phone}`}
                className="block mt-3 text-center py-3.5 rounded-lg bg-[#2B4C3F] text-white font-medium"
              >
                <Phone className="w-4 h-4 inline mr-2" />
                {COMPANY.phone}
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* SP fixed bottom phone bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#2B4C3F] safe-area-bottom">
        <a
          href={`tel:${COMPANY.phone}`}
          className="flex items-center justify-center gap-2 py-3.5 text-white font-bold text-base"
        >
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
          src="/images/templates/credence/hero.jpg"
          alt="オフィスビル"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15" />
      </motion.div>

      <motion.div
        className="relative z-10 h-full flex flex-col justify-end max-w-[1200px] mx-auto px-5 pb-20 sm:pb-24"
        style={{ opacity }}
      >
        {/* 初回相談無料バッジ */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 w-fit mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Star className="w-3 h-3 text-[#8B7355]" />
          <span className="text-white/90 text-xs tracking-wider font-medium">初回ご相談無料</span>
        </motion.div>

        <motion.h1
          className="text-white font-bold leading-[1.3] mb-4"
          style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", fontFamily: "'Noto Serif JP', serif" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          {COMPANY.tagline}
        </motion.h1>

        <motion.p
          className="text-white/70 text-sm sm:text-base max-w-[520px] leading-relaxed mb-8"
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
            className="px-8 py-3.5 rounded-lg bg-[#8B7355] text-white font-medium text-sm hover:bg-[#7A6345] transition-colors text-center shadow-lg shadow-[#8B7355]/20"
          >
            無料相談に申し込む
          </a>
          <a
            href="#services"
            className="px-8 py-3.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm hover:bg-white/20 transition-colors text-center"
          >
            取扱業務を見る
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Services — 取扱業務（縦リスト）
   ═══════════════════════════════════════ */
function ServicesSection() {
  return (
    <section id="services" className="py-20 sm:py-28 bg-white">
      <div className="max-w-[900px] mx-auto px-5">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#8B7355] text-xs tracking-[0.3em] mb-2 font-medium">SERVICES</p>
          <h2
            className="text-[#1A1A1A] font-bold text-2xl sm:text-3xl"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            取扱業務
          </h2>
        </motion.div>

        <div className="space-y-0">
          {SERVICES.map((service, i) => {
            const Icon = ICON_MAP[service.icon || "FileText"] || FileText;
            const hasDetail = !!service.slug;
            const content = (
              <>
                <div className="w-11 h-11 rounded-xl bg-[#2B4C3F]/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-[#2B4C3F]" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="font-bold text-[#1A1A1A] text-base sm:text-lg mb-2"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {service.title}
                    </h3>
                    {hasDetail && (
                      <ChevronRight className="w-4 h-4 text-[#6B6B6B] flex-shrink-0 mt-1 group-hover:text-[#2B4C3F] transition-colors" />
                    )}
                  </div>
                  <p className="text-[#6B6B6B] text-sm leading-[1.9]">{service.description}</p>
                </div>
              </>
            );

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                {hasDetail ? (
                  <Link
                    href={`/portfolio-templates/credence/services/${service.slug}`}
                    className="flex items-start gap-5 sm:gap-6 py-7 border-b border-[#E0DDD8] first:pt-0 last:border-b-0 group hover:bg-[#F7F6F3]/50 -mx-3 px-3 rounded-lg transition-colors"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="flex items-start gap-5 sm:gap-6 py-7 border-b border-[#E0DDD8] first:pt-0 last:border-b-0">
                    {content}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link
            href="/portfolio-templates/credence/services"
            className="inline-flex items-center gap-2 text-[#2B4C3F] text-sm font-medium hover:underline"
          >
            業務の詳細を見る <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   About — 代表紹介 + 強み
   ═══════════════════════════════════════ */
function AboutSection() {
  return (
    <section id="about" className="py-20 sm:py-28 bg-[#F7F6F3]">
      <div className="max-w-[900px] mx-auto px-5">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#8B7355] text-xs tracking-[0.3em] mb-2 font-medium">ABOUT</p>
          <h2
            className="text-[#1A1A1A] font-bold text-2xl sm:text-3xl"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            代表紹介
          </h2>
        </motion.div>

        {/* 代表プロフィール */}
        <motion.div
          className="bg-white rounded-2xl border border-[#E0DDD8] p-8 sm:p-10 mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="sm:flex sm:gap-8">
            {/* 代表写真 */}
            <div className="flex-shrink-0 mb-6 sm:mb-0">
              <div className="relative w-[140px] h-[180px] rounded-xl mx-auto sm:mx-0 overflow-hidden">
                <Image
                  src="/images/templates/credence/owner.jpg"
                  alt="代表 税理士"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-center mt-3">
                <p className="text-[#1A1A1A] text-sm font-bold" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                  {COMPANY.ceo}
                </p>
                <p className="text-[#6B6B6B] text-xs mt-0.5">{COMPANY.ceoTitle}</p>
              </div>
            </div>

            {/* 経歴テキスト */}
            <div className="text-[#1A1A1A] text-sm sm:text-base leading-[2.2]" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              {COMPANY.bio.split("\n\n").map((para, i) => (
                <p key={i} className={i > 0 ? "mt-5" : ""}>
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* 資格・所属 */}
          {COMPANY.license && (
            <div className="mt-8 pt-6 border-t border-[#E0DDD8]">
              <p className="text-[#6B6B6B] text-xs font-medium mb-2">資格・所属</p>
              <div className="space-y-1.5">
                <p className="text-[#1A1A1A] text-sm flex items-start gap-2">
                  <Shield className="w-4 h-4 text-[#2B4C3F] flex-shrink-0 mt-0.5" />
                  {COMPANY.license}
                </p>
                <p className="text-[#1A1A1A] text-sm flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#2B4C3F] flex-shrink-0 mt-0.5" />
                  freee認定アドバイザー / マネーフォワード認定アドバイザー
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* 強み */}
        <div className="space-y-6">
          {STRENGTHS.map((s, i) => {
            const Icon = ICON_MAP[s.icon || "Shield"] || Shield;
            return (
              <motion.div
                key={i}
                className="flex items-start gap-5"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-[#2B4C3F]/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-6 h-6 text-[#2B4C3F]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3
                    className="font-bold text-[#1A1A1A] text-base mb-2"
                    style={{ fontFamily: "'Noto Serif JP', serif" }}
                  >
                    {s.title}
                  </h3>
                  <p className="text-[#6B6B6B] text-sm leading-[1.9]">{s.description}</p>
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
   Pricing — 料金表（表形式）
   ═══════════════════════════════════════ */
function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-white">
      <div className="max-w-[900px] mx-auto px-5">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#8B7355] text-xs tracking-[0.3em] mb-2 font-medium">PRICING</p>
          <h2
            className="text-[#1A1A1A] font-bold text-2xl sm:text-3xl mb-3"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            料金
          </h2>
          <p className="text-[#6B6B6B] text-sm">
            事業規模やご依頼内容により変動します。まずはお気軽にご相談ください。
          </p>
        </motion.div>

        {PRICING_CATEGORIES.map((category, ci) => (
          <motion.div
            key={category}
            className={ci > 0 ? "mt-10" : ""}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: ci * 0.1 }}
          >
            <h3
              className="text-[#2B4C3F] font-bold text-sm mb-4 flex items-center gap-2"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#2B4C3F]" />
              {category}
            </h3>

            <div className="bg-[#F7F6F3] rounded-xl border border-[#E0DDD8] overflow-hidden">
              {/* テーブルヘッダ（PC） */}
              <div className="hidden sm:grid grid-cols-[1fr_1.5fr_auto] bg-[#2B4C3F] text-white text-xs font-medium">
                <div className="px-5 py-3">業務名</div>
                <div className="px-5 py-3">内容</div>
                <div className="px-5 py-3 text-right min-w-[140px]">料金</div>
              </div>

              {MENU_ITEMS.filter((m) => m.category === category).map((item, i, arr) => (
                <div
                  key={item.id}
                  className={`sm:grid sm:grid-cols-[1fr_1.5fr_auto] ${
                    i < arr.length - 1 ? "border-b border-[#E0DDD8]" : ""
                  }`}
                >
                  {/* SP: スタック表示 */}
                  <div className="px-5 py-4 sm:py-3.5">
                    <p
                      className="text-[#1A1A1A] font-bold text-sm sm:font-medium"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {item.name}
                    </p>
                    {/* SP only: 説明と料金 */}
                    <p className="sm:hidden text-[#6B6B6B] text-xs mt-1 leading-relaxed">{item.description}</p>
                    <p
                      className="sm:hidden text-[#2B4C3F] font-bold text-sm mt-2"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {item.price}
                    </p>
                  </div>
                  {/* PC only: 説明 */}
                  <div className="hidden sm:flex items-center px-5 py-3.5">
                    <p className="text-[#6B6B6B] text-sm leading-relaxed">{item.description}</p>
                  </div>
                  {/* PC only: 料金 */}
                  <div className="hidden sm:flex items-center justify-end px-5 py-3.5 min-w-[140px]">
                    <p
                      className="text-[#2B4C3F] font-bold text-sm whitespace-nowrap"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {item.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <motion.p
          className="text-[#6B6B6B] text-xs mt-8 pt-6 border-t border-[#E0DDD8]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          ※ 表示価格はすべて税抜です。事業規模・取引量に応じてお見積もりいたします。
          <br />
          ※ 初回のご相談（60分）は無料です。
        </motion.p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Info — 事務所情報 + 地図
   ═══════════════════════════════════════ */
function InfoSection() {
  const displayName = usePreviewName(COMPANY.name);

  return (
    <section id="info" className="py-20 sm:py-28 bg-[#F7F6F3]">
      <div className="max-w-[1000px] mx-auto px-5">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#8B7355] text-xs tracking-[0.3em] mb-2 font-medium">OFFICE</p>
          <h2
            className="text-[#1A1A1A] font-bold text-2xl sm:text-3xl"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            事務所情報
          </h2>
        </motion.div>

        {/* 事務所写真 */}
        <motion.div
          className="relative w-full h-[240px] sm:h-[320px] rounded-xl overflow-hidden mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Image
            src="/images/templates/credence/office.jpg"
            alt="事務所内観"
            fill
            className="object-cover"
          />
        </motion.div>

        <div className="lg:flex lg:gap-8">
          {/* 地図 */}
          <motion.div
            className="lg:w-[55%] aspect-[4/3] lg:aspect-auto lg:min-h-[360px] rounded-xl overflow-hidden bg-[#E0DDD8] mb-8 lg:mb-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {COMPANY.mapEmbedUrl ? (
              <iframe
                src={COMPANY.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="事務所の地図"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-[#6B6B6B] mx-auto mb-2" />
                  <p className="text-[#6B6B6B] text-sm">Googleマップ</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* 事務所情報 */}
          <motion.div
            className="lg:flex-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white rounded-2xl border border-[#E0DDD8] overflow-hidden">
              <div className="divide-y divide-[#E0DDD8]">
                {[
                  { icon: null, label: "事務所名", value: displayName },
                  { icon: MapPin, label: "住所", value: COMPANY.address },
                  { icon: Phone, label: "電話", value: COMPANY.phone },
                  { icon: Mail, label: "メール", value: COMPANY.email },
                  { icon: Clock, label: "営業時間", value: COMPANY.hours },
                  { icon: Shield, label: "登録", value: COMPANY.license || "" },
                ]
                  .filter((item) => item.value)
                  .map((item, i) => (
                    <div key={i} className="flex flex-col sm:flex-row">
                      <div className="sm:w-28 px-5 py-3 bg-[#F0EEED] text-[#6B6B6B] text-xs font-medium flex items-center gap-2">
                        {item.icon && <item.icon className="w-3.5 h-3.5" />}
                        {item.label}
                      </div>
                      <div className="flex-1 px-5 py-3 text-[#1A1A1A] text-sm whitespace-pre-line">{item.value}</div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`tel:${COMPANY.phone}`}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#2B4C3F] text-white text-sm font-medium hover:bg-[#1F3A30] transition-colors"
              >
                <Phone className="w-4 h-4" /> 電話で相談
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(COMPANY.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[#E0DDD8] text-[#6B6B6B] text-sm hover:border-[#2B4C3F]/30 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> 地図アプリで開く
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Contact — 電話CTA + フォーム
   ═══════════════════════════════════════ */
function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="contact" className="py-20 sm:py-28 bg-white">
      <div className="max-w-[800px] mx-auto px-5">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#8B7355] text-xs tracking-[0.3em] mb-2 font-medium">CONTACT</p>
          <h2
            className="text-[#1A1A1A] font-bold text-2xl sm:text-3xl mb-3"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            お問い合わせ
          </h2>
          <p className="text-[#6B6B6B] text-sm">初回60分のご相談は無料です。まずはお気軽にお電話ください。</p>
        </motion.div>

        {/* 電話CTA */}
        <motion.div
          className="mb-12 p-8 rounded-2xl bg-[#F7F6F3] border border-[#E0DDD8]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#8B7355] text-xs tracking-wider mb-3 font-medium">お電話でのご相談</p>
          <a
            href={`tel:${COMPANY.phone}`}
            className="inline-block text-[#1A1A1A] text-3xl sm:text-4xl font-bold tracking-wider hover:text-[#2B4C3F] transition-colors"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            {COMPANY.phone}
          </a>
          <p className="text-[#6B6B6B] text-xs mt-2">{COMPANY.hours}</p>
          <p className="text-[#2B4C3F] text-xs mt-1 font-medium">
            <Star className="w-3 h-3 inline mr-1" />
            初回ご相談 無料（60分）
          </p>
        </motion.div>

        {/* フォーム */}
        <motion.div
          className="bg-[#F7F6F3] rounded-2xl border border-[#E0DDD8] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="p-5 sm:p-6 bg-[#2B4C3F]">
            <h3
              className="text-white font-bold text-base"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              メールでのお問い合わせ
            </h3>
          </div>

          {submitted ? (
            <div className="p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-[#2B4C3F]/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-[#2B4C3F]" />
              </div>
              <p className="text-[#1A1A1A] text-lg font-bold mb-2">お問い合わせありがとうございます</p>
              <p className="text-[#6B6B6B] text-sm">翌営業日までにご返信いたします。</p>
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
                  <label className="block text-xs text-[#6B6B6B] mb-2 font-medium">
                    お名前 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E0DDD8] text-[#1A1A1A] text-sm placeholder:text-[#C4BFB5] focus:outline-none focus:border-[#2B4C3F] focus:ring-2 focus:ring-[#2B4C3F]/10 transition-all"
                    placeholder="山田 太郎"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6B6B6B] mb-2 font-medium">会社名</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E0DDD8] text-[#1A1A1A] text-sm placeholder:text-[#C4BFB5] focus:outline-none focus:border-[#2B4C3F] focus:ring-2 focus:ring-[#2B4C3F]/10 transition-all"
                    placeholder="株式会社○○"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-[#6B6B6B] mb-2 font-medium">
                    メールアドレス <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E0DDD8] text-[#1A1A1A] text-sm placeholder:text-[#C4BFB5] focus:outline-none focus:border-[#2B4C3F] focus:ring-2 focus:ring-[#2B4C3F]/10 transition-all"
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6B6B6B] mb-2 font-medium">電話番号</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E0DDD8] text-[#1A1A1A] text-sm placeholder:text-[#C4BFB5] focus:outline-none focus:border-[#2B4C3F] focus:ring-2 focus:ring-[#2B4C3F]/10 transition-all"
                    placeholder="03-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#6B6B6B] mb-2 font-medium">ご相談内容</label>
                <div className="flex flex-wrap gap-2">
                  {["法人税務", "確定申告", "相続・贈与", "創業支援", "経営相談", "その他"].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E0DDD8] text-sm text-[#1A1A1A] cursor-pointer hover:border-[#2B4C3F]/30 hover:bg-[#2B4C3F]/5 transition-all has-[:checked]:bg-[#2B4C3F]/10 has-[:checked]:border-[#2B4C3F]/30 has-[:checked]:text-[#2B4C3F]"
                    >
                      <input type="radio" name="type" value={type} className="sr-only" />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#6B6B6B] mb-2 font-medium">ご相談の詳細</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-white border border-[#E0DDD8] text-[#1A1A1A] text-sm placeholder:text-[#C4BFB5] focus:outline-none focus:border-[#2B4C3F] focus:ring-2 focus:ring-[#2B4C3F]/10 transition-all resize-none"
                  placeholder="例：来月法人を設立予定です。設立手続きと、その後の税務顧問をお願いしたいと考えています。"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-lg bg-[#2B4C3F] text-white font-bold text-sm tracking-wider hover:bg-[#1F3A30] transition-colors"
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
   Cases Teaser — 解決事例（トップページ用）
   ═══════════════════════════════════════ */
function CasesTeaser() {
  if (CASES.length === 0) return null;
  const displayCases = CASES.slice(0, 3);

  return (
    <section className="py-20 sm:py-28 bg-[#F7F6F3]">
      <div className="max-w-[900px] mx-auto px-5">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#8B7355] text-xs tracking-[0.3em] mb-2 font-medium">CASES</p>
          <h2
            className="text-[#1A1A1A] font-bold text-2xl sm:text-3xl"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            解決事例
          </h2>
        </motion.div>

        <div className="space-y-4">
          {displayCases.map((caseItem, i) => (
            <motion.div
              key={caseItem.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                href={`/portfolio-templates/credence/cases/${caseItem.slug}`}
                className="block bg-white rounded-xl border border-[#E0DDD8] p-5 sm:p-6 hover:border-[#2B4C3F]/30 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#2B4C3F]/10 text-[#2B4C3F] text-xs font-medium mb-2">
                      {caseItem.category}
                    </span>
                    <h3
                      className="font-bold text-[#1A1A1A] text-base sm:text-lg"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {caseItem.title}
                    </h3>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#6B6B6B] flex-shrink-0 mt-1 group-hover:text-[#2B4C3F] transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link
            href="/portfolio-templates/credence/cases"
            className="inline-flex items-center gap-2 text-[#2B4C3F] text-sm font-medium hover:underline"
          >
            すべての解決事例を見る <ArrowRight className="w-4 h-4" />
          </Link>
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
    <footer className="py-10 bg-[#1A1A1A] pb-24 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-white/10">
          <p className="text-white font-bold text-sm" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            {displayName}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5">
            {[
              { label: "取扱業務", href: "#services" },
              { label: "代表紹介", href: "#about" },
              { label: "料金", href: "#pricing" },
              { label: "事務所情報", href: "#info" },
              { label: "お問い合わせ", href: "#contact" },
              { label: "業務一覧", href: "/portfolio-templates/credence/services" },
              { label: "解決事例", href: "/portfolio-templates/credence/cases" },
            ].map((item) => {
              const isExternal = item.href.startsWith("/");
              return isExternal ? (
                <Link key={item.href} href={item.href} className="text-white/50 text-xs hover:text-white transition-colors">
                  {item.label}
                </Link>
              ) : (
                <a key={item.href} href={item.href} className="text-white/50 text-xs hover:text-white transition-colors">
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-white/30 text-xs">
          <p>{COMPANY.address}</p>
          <p>&copy; {new Date().getFullYear()} {displayName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════
   Page
   ═══════════════════════════════════════ */
export default function CredencePage() {
  return (
    <>
      <DemoBanner />
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <PricingSection />
        <CasesTeaser />
        <InfoSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
