"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Users,
  Target,
  Clock,
  Phone,
  Mail,
  MapPin,
  X,
  Menu as MenuIcon,
  Send,
  Check,
  Star,
  Award,
  Lightbulb,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, MenuItem, Service, Strength } from "@/lib/site-config-schema";
import { usePreviewName } from "@/lib/use-preview-name";
import siteConfig from "./site.config.json";

/* ═══════════════════════════════════════
   データ読み込み
   ═══════════════════════════════════════ */
const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const SERVICES = (config.services || []) as (Service & { slug?: string })[];
const STRENGTHS = (config.strengths || []) as Strength[];
const MENU_ITEMS = (config.menu || []) as MenuItem[];

const ICON_MAP: Record<string, typeof GraduationCap> = {
  GraduationCap,
  BookOpen,
  Users,
  Target,
  Award,
  Lightbulb,
  Star,
};

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
    { label: "コース紹介", href: "#courses" },
    { label: "合格実績", href: "/portfolio-templates/beacon/results" },
    { label: "選ばれる理由", href: "#strengths" },
    { label: "料金", href: "#pricing" },
    { label: "塾長紹介", href: "#about" },
    { label: "教室情報", href: "#info" },
    { label: "お問い合わせ", href: "#contact" },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#F8F6F2]/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}>
        <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <GraduationCap className={`w-5 h-5 transition-colors ${scrolled ? "text-[#2C5F7C]" : "text-[#E8963A]"}`} />
            <p className={`font-bold text-sm tracking-wide transition-colors ${scrolled ? "text-[#1E2D3D]" : "text-white"}`}>
              {displayName}
            </p>
          </a>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) =>
              item.href.startsWith("/") ? (
                <Link key={item.href} href={item.href} className={`text-sm transition-colors ${scrolled ? "text-[#5C7080] hover:text-[#2C5F7C]" : "text-white/80 hover:text-white"}`}>
                  {item.label}
                </Link>
              ) : (
                <a key={item.href} href={item.href} className={`text-sm transition-colors ${scrolled ? "text-[#5C7080] hover:text-[#2C5F7C]" : "text-white/80 hover:text-white"}`}>
                  {item.label}
                </a>
              )
            )}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${COMPANY.phone}`}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E8963A] text-white text-sm font-medium hover:bg-[#D4862E] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="tracking-wider">{COMPANY.phone}</span>
            </a>

            <button onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="メニュー">
              {open ? (
                <X className={`w-5 h-5 ${scrolled ? "text-[#1E2D3D]" : "text-white"}`} />
              ) : (
                <MenuIcon className={`w-5 h-5 ${scrolled ? "text-[#1E2D3D]" : "text-white"}`} />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              className="lg:hidden bg-[#F8F6F2] border-t border-[#DDE3E8] px-5 py-5 space-y-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {navItems.map((item) =>
                item.href.startsWith("/") ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 px-4 text-[#1E2D3D] text-base rounded-lg hover:bg-[#2C5F7C]/5 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 px-4 text-[#1E2D3D] text-base rounded-lg hover:bg-[#2C5F7C]/5 transition-colors"
                  >
                    {item.label}
                  </a>
                )
              )}
              <a
                href={`tel:${COMPANY.phone}`}
                className="block mt-3 text-center py-3.5 rounded-lg bg-[#E8963A] text-white font-medium"
              >
                <Phone className="w-4 h-4 inline mr-2" />{COMPANY.phone}
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* SP fixed bottom CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#E8963A] safe-area-bottom">
        <a href={`tel:${COMPANY.phone}`} className="flex items-center justify-center gap-2 py-3.5 text-white font-bold text-base">
          <Phone className="w-5 h-5" /> 無料体験を申し込む
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
          src="/images/templates/beacon/hero.jpg"
          alt="教室風景"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
      </motion.div>

      <motion.div
        className="relative z-10 h-full flex flex-col justify-end max-w-[1200px] mx-auto px-5 pb-20 sm:pb-24"
        style={{ opacity }}
      >
        {/* 無料体験バッジ */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8963A]/90 w-fit mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Star className="w-3 h-3 text-white" fill="white" />
          <span className="text-white text-xs tracking-wider font-medium">無料体験授業 受付中</span>
        </motion.div>

        <motion.h1
          className="text-white font-bold leading-[1.3] mb-4"
          style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)" }}
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
          <a href="#contact" className="px-8 py-3.5 rounded-lg bg-[#E8963A] text-white font-medium text-sm hover:bg-[#D4862E] transition-colors text-center shadow-lg shadow-[#E8963A]/20">
            無料体験に申し込む
          </a>
          <a href="#courses" className="px-8 py-3.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm hover:bg-white/20 transition-colors text-center">
            コースを見る
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Courses — コース紹介
   ═══════════════════════════════════════ */
function CoursesSection() {
  return (
    <section id="courses" className="py-20 sm:py-28 bg-[#F8F6F2]">
      <div className="max-w-[1000px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#E8963A] text-xs tracking-[0.3em] mb-2 font-medium">COURSES</p>
          <h2 className="text-[#1E2D3D] font-bold text-2xl sm:text-3xl mb-3">
            コース紹介
          </h2>
          <p className="text-[#5C7080] text-sm max-w-[500px] mx-auto">お子さまの学年と目標に合わせて、最適なコースをお選びいただけます。</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {SERVICES.map((service, i) => {
            const Icon = ICON_MAP[service.icon || "BookOpen"] || BookOpen;
            const inner = (
              <>
                <div className="w-12 h-12 rounded-xl bg-[#2C5F7C]/8 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-[#2C5F7C]" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-[#1E2D3D] text-lg mb-3">{service.title}</h3>
                <p className="text-[#5C7080] text-sm leading-[1.9]">{service.description}</p>
              </>
            );
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                {service.slug ? (
                  <Link
                    href={`/portfolio-templates/beacon/courses/${service.slug}`}
                    className="block bg-white rounded-2xl border border-[#DDE3E8] p-7 hover:shadow-md hover:border-[#2C5F7C]/20 transition-all"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="bg-white rounded-2xl border border-[#DDE3E8] p-7 hover:shadow-md transition-shadow">
                    {inner}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/portfolio-templates/beacon/courses"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#DDE3E8] text-[#2C5F7C] text-sm font-medium hover:bg-[#2C5F7C]/5 hover:border-[#2C5F7C]/30 transition-all"
          >
            全コース一覧を見る
          </Link>
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
    <section id="strengths" className="py-20 sm:py-28 bg-white">
      <div className="max-w-[900px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#E8963A] text-xs tracking-[0.3em] mb-2 font-medium">STRENGTHS</p>
          <h2 className="text-[#1E2D3D] font-bold text-2xl sm:text-3xl mb-3">
            選ばれる理由
          </h2>
          <p className="text-[#5C7080] text-sm">20年間、地域の保護者と生徒に選ばれ続けてきた理由があります。</p>
        </motion.div>

        <div className="space-y-6">
          {STRENGTHS.map((s, i) => {
            const Icon = ICON_MAP[s.icon || "Star"] || Star;
            return (
              <motion.div
                key={i}
                className="flex items-start gap-5 bg-[#F8F6F2] rounded-2xl border border-[#DDE3E8] p-7"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-14 h-14 rounded-xl bg-[#E8963A]/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-7 h-7 text-[#E8963A]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-[#1E2D3D] text-base sm:text-lg mb-2">{s.title}</h3>
                  <p className="text-[#5C7080] text-sm leading-[1.9]">{s.description}</p>
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
   Pricing — 料金表
   ═══════════════════════════════════════ */
function PricingSection() {
  const categories = Array.from(new Set(MENU_ITEMS.map((m) => m.category)));

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#F8F6F2]">
      <div className="max-w-[800px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#E8963A] text-xs tracking-[0.3em] mb-2 font-medium">PRICING</p>
          <h2 className="text-[#1E2D3D] font-bold text-2xl sm:text-3xl mb-3">
            料金
          </h2>
          <p className="text-[#5C7080] text-sm">明確な料金体系で、ご家庭のご負担を事前にお伝えします。</p>
        </motion.div>

        {categories.map((cat, ci) => (
          <motion.div
            key={cat}
            className="mb-8 last:mb-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: ci * 0.1 }}
          >
            <h3 className="text-[#2C5F7C] font-bold text-sm tracking-wider mb-4 pl-1">{cat}</h3>
            <div className="bg-white rounded-2xl border border-[#DDE3E8] overflow-hidden">
              <div className="divide-y divide-[#DDE3E8]">
                {MENU_ITEMS.filter((m) => m.category === cat).map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4 px-6 py-5">
                    <div className="flex-1">
                      <p className="text-[#1E2D3D] font-medium text-base">{item.name}</p>
                      {item.description && (
                        <p className="text-[#5C7080] text-sm mt-1">{item.description}</p>
                      )}
                    </div>
                    <p className="text-[#E8963A] font-bold text-base whitespace-nowrap">{item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}

        <motion.p
          className="text-center text-[#5C7080] text-xs mt-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          ※ 表示価格はすべて税込です。詳細はお気軽にお問い合わせください。
        </motion.p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   About — 塾長紹介
   ═══════════════════════════════════════ */
function AboutSection() {
  return (
    <section id="about" className="py-20 sm:py-28 bg-white">
      <div className="max-w-[900px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#E8963A] text-xs tracking-[0.3em] mb-2 font-medium">ABOUT</p>
          <h2 className="text-[#1E2D3D] font-bold text-2xl sm:text-3xl">
            塾長紹介
          </h2>
        </motion.div>

        <motion.div
          className="bg-[#F8F6F2] rounded-2xl border border-[#DDE3E8] p-8 sm:p-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="sm:flex sm:gap-8">
            {/* 塾長写真 */}
            <div className="flex-shrink-0 mb-6 sm:mb-0">
              <div className="relative w-[140px] h-[180px] rounded-xl mx-auto sm:mx-0 overflow-hidden">
                <Image
                  src="/images/templates/beacon/teacher.jpg"
                  alt={`${COMPANY.ceoTitle} ${COMPANY.ceo}`}
                  fill
                  className="object-cover"
                  sizes="140px"
                />
              </div>
              <p className="text-center text-[#5C7080] text-xs mt-2">{COMPANY.ceoTitle}　{COMPANY.ceo}</p>
            </div>

            <div className="text-[#1E2D3D] text-sm sm:text-base leading-[2.2]">
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
   Info — 教室情報 + 地図
   ═══════════════════════════════════════ */
function InfoSection() {
  const displayName = usePreviewName(COMPANY.name);
  return (
    <section id="info" className="py-20 sm:py-28 bg-[#F8F6F2]">
      <div className="max-w-[1000px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#E8963A] text-xs tracking-[0.3em] mb-2 font-medium">ACCESS</p>
          <h2 className="text-[#1E2D3D] font-bold text-2xl sm:text-3xl">
            教室情報
          </h2>
        </motion.div>

        {/* 教室写真 */}
        <div className="grid sm:grid-cols-2 gap-5 mb-10">
          <motion.div
            className="relative aspect-[4/3] rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Image
              src="/images/templates/beacon/classroom.jpg"
              alt="授業風景"
              fill
              className="object-cover"
              sizes="(min-width: 640px) 50vw, 100vw"
            />
          </motion.div>
          <motion.div
            className="relative aspect-[4/3] rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Image
              src="/images/templates/beacon/study.jpg"
              alt="学習風景"
              fill
              className="object-cover"
              sizes="(min-width: 640px) 50vw, 100vw"
            />
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 地図 */}
          <motion.div
            className="aspect-[4/3] rounded-xl overflow-hidden bg-[#DDE3E8]"
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
                title="教室の地図"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-[#5C7080] mx-auto mb-2" />
                  <p className="text-[#5C7080] text-sm">Google マップ</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* 教室情報テーブル */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white rounded-2xl border border-[#DDE3E8] overflow-hidden">
              <div className="divide-y divide-[#DDE3E8]">
                {[
                  { icon: null, label: "教室名", value: displayName },
                  { icon: MapPin, label: "住所", value: COMPANY.address },
                  { icon: Phone, label: "電話", value: COMPANY.phone },
                  { icon: Clock, label: "受付時間", value: COMPANY.hours },
                  { icon: Mail, label: "メール", value: COMPANY.email },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row">
                    <div className="sm:w-28 px-5 py-3 bg-[#F0EDE9] text-[#5C7080] text-xs font-medium flex items-center gap-2">
                      {item.icon && <item.icon className="w-3.5 h-3.5" />}
                      {item.label}
                    </div>
                    <div className="flex-1 px-5 py-3 text-[#1E2D3D] text-sm whitespace-pre-line">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`tel:${COMPANY.phone}`}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#E8963A] text-white text-sm font-medium hover:bg-[#D4862E] transition-colors"
              >
                <Phone className="w-4 h-4" /> 電話で問い合わせ
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(COMPANY.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[#DDE3E8] text-[#5C7080] text-sm hover:border-[#2C5F7C]/30 transition-colors"
              >
                <MapPin className="w-4 h-4" /> 地図アプリで開く
              </a>
            </div>
          </motion.div>
        </div>
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
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#E8963A] text-xs tracking-[0.3em] mb-2 font-medium">CONTACT</p>
          <h2 className="text-[#1E2D3D] font-bold text-2xl sm:text-3xl mb-3">
            お問い合わせ
          </h2>
          <p className="text-[#5C7080] text-sm">無料体験授業のお申し込み、ご質問など、お気軽にお問い合わせください。</p>
        </motion.div>

        {/* 電話CTA */}
        <motion.div
          className="text-center mb-12 p-8 rounded-2xl bg-[#F8F6F2] border border-[#DDE3E8]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#E8963A] text-xs tracking-wider mb-3 font-medium">お電話でのお問い合わせ</p>
          <a
            href={`tel:${COMPANY.phone}`}
            className="inline-block text-[#1E2D3D] text-3xl sm:text-4xl font-bold tracking-wider hover:text-[#2C5F7C] transition-colors"
          >
            {COMPANY.phone}
          </a>
          <p className="text-[#5C7080] text-xs mt-2">{COMPANY.hours}</p>
        </motion.div>

        {/* フォーム */}
        <motion.div
          className="bg-[#F8F6F2] rounded-2xl border border-[#DDE3E8] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="p-5 sm:p-6 bg-[#F0EDE9] border-b border-[#DDE3E8]">
            <h3 className="text-[#1E2D3D] font-bold text-base">
              メール・無料体験のお申し込み
            </h3>
          </div>

          {submitted ? (
            <div className="p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-[#2C5F7C]/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-[#2C5F7C]" />
              </div>
              <p className="text-[#1E2D3D] text-lg font-bold mb-2">お問い合わせありがとうございます</p>
              <p className="text-[#5C7080] text-sm">翌営業日までにご連絡いたします。</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="p-6 sm:p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-[#5C7080] mb-2 font-medium">
                    保護者氏名 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#DDE3E8] text-[#1E2D3D] text-sm placeholder:text-[#B0BCC5] focus:outline-none focus:border-[#2C5F7C] focus:ring-2 focus:ring-[#2C5F7C]/10 transition-all"
                    placeholder="山田 花子"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#5C7080] mb-2 font-medium">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#DDE3E8] text-[#1E2D3D] text-sm placeholder:text-[#B0BCC5] focus:outline-none focus:border-[#2C5F7C] focus:ring-2 focus:ring-[#2C5F7C]/10 transition-all"
                    placeholder="090-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#5C7080] mb-2 font-medium">
                  メールアドレス <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white border border-[#DDE3E8] text-[#1E2D3D] text-sm placeholder:text-[#B0BCC5] focus:outline-none focus:border-[#2C5F7C] focus:ring-2 focus:ring-[#2C5F7C]/10 transition-all"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-xs text-[#5C7080] mb-2 font-medium">
                  お問い合わせ種別
                </label>
                <div className="flex flex-wrap gap-2">
                  {["無料体験授業", "入塾相談", "料金について", "その他"].map((type) => (
                    <label key={type} className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#DDE3E8] text-sm text-[#1E2D3D] cursor-pointer hover:border-[#2C5F7C]/30 hover:bg-[#2C5F7C]/5 transition-all has-[:checked]:bg-[#2C5F7C]/10 has-[:checked]:border-[#2C5F7C]/30 has-[:checked]:text-[#2C5F7C]">
                      <input type="radio" name="type" value={type} className="sr-only" />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-[#5C7080] mb-2 font-medium">
                    お子さまの学年
                  </label>
                  <select className="w-full px-4 py-3 rounded-lg bg-white border border-[#DDE3E8] text-[#1E2D3D] text-sm focus:outline-none focus:border-[#2C5F7C] focus:ring-2 focus:ring-[#2C5F7C]/10 transition-all">
                    <option value="">選択してください</option>
                    <option>小学4年生</option>
                    <option>小学5年生</option>
                    <option>小学6年生</option>
                    <option>中学1年生</option>
                    <option>中学2年生</option>
                    <option>中学3年生</option>
                    <option>高校1年生</option>
                    <option>高校2年生</option>
                    <option>高校3年生</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#5C7080] mb-2 font-medium">
                    希望コース
                  </label>
                  <select className="w-full px-4 py-3 rounded-lg bg-white border border-[#DDE3E8] text-[#1E2D3D] text-sm focus:outline-none focus:border-[#2C5F7C] focus:ring-2 focus:ring-[#2C5F7C]/10 transition-all">
                    <option value="">選択してください</option>
                    <option>小学生コース</option>
                    <option>中学生コース</option>
                    <option>高校生コース</option>
                    <option>個別指導</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#5C7080] mb-2 font-medium">
                  ご質問・ご要望
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-white border border-[#DDE3E8] text-[#1E2D3D] text-sm placeholder:text-[#B0BCC5] focus:outline-none focus:border-[#2C5F7C] focus:ring-2 focus:ring-[#2C5F7C]/10 transition-all resize-none"
                  placeholder="例：数学が苦手で、定期テストの点数を上げたいです。"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-lg bg-[#E8963A] text-white font-bold text-sm tracking-wider hover:bg-[#D4862E] transition-colors"
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
    <footer className="py-10 bg-[#1E2D3D] pb-24 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-white/10">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#E8963A]" />
            <p className="text-white font-bold text-sm">
              {displayName}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            {[
              { label: "コース紹介", href: "#courses" },
              { label: "合格実績", href: "/portfolio-templates/beacon/results" },
              { label: "選ばれる理由", href: "#strengths" },
              { label: "料金", href: "#pricing" },
              { label: "塾長紹介", href: "#about" },
              { label: "教室情報", href: "#info" },
              { label: "お問い合わせ", href: "#contact" },
            ].map((item) => (
              item.href.startsWith("/") ? (
                <Link key={item.href} href={item.href} className="text-white/50 text-xs hover:text-white transition-colors">
                  {item.label}
                </Link>
              ) : (
                <a key={item.href} href={item.href} className="text-white/50 text-xs hover:text-white transition-colors">
                  {item.label}
                </a>
              )
            ))}
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
export default function BeaconPage() {
  return (
    <>
      <DemoBanner />
      <Header />
      <main>
        <HeroSection />
        <CoursesSection />
        <StrengthsSection />
        <PricingSection />
        <AboutSection />
        <InfoSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
