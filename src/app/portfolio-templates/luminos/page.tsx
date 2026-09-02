"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  X,
  Menu as MenuIcon,
  User,
  Briefcase,
  Calendar,
  Heart,
  Camera,
  Send,
  Check,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, Service, MenuItem } from "@/lib/site-config-schema";
import { usePreviewName } from "@/lib/use-preview-name";
import siteConfig from "./site.config.json";

/* ═══════════════════════════════════════
   データ読み込み
   ═══════════════════════════════════════ */
const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const PROJECTS = config.projects || [];
const SERVICES = (config.services || []) as Service[];
const MENU_ITEMS = (config.menu || []) as MenuItem[];

const ICON_MAP: Record<string, typeof Camera> = { User, Briefcase, Calendar, Heart, Camera };

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
    { label: "Works", href: "/portfolio-templates/luminos/works" },
    { label: "Flow", href: "/portfolio-templates/luminos/flow" },
    { label: "Service", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center">
            <p
              className={`text-sm tracking-[0.15em] transition-colors ${
                scrolled ? "text-[#1A1A1A]" : "text-white"
              }`}
              style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
            >
              {displayName}
            </p>
          </a>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) =>
              item.href.startsWith("#") ? (
                <a
                  key={item.href}
                  href={item.href}
                  className={`text-xs tracking-[0.15em] transition-colors ${
                    scrolled ? "text-[#888888] hover:text-[#1A1A1A]" : "text-white/60 hover:text-white"
                  }`}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs tracking-[0.15em] transition-colors ${
                    scrolled ? "text-[#888888] hover:text-[#1A1A1A]" : "text-white/60 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <button onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="メニュー">
            {open ? (
              <X className={`w-5 h-5 ${scrolled ? "text-[#1A1A1A]" : "text-white"}`} />
            ) : (
              <MenuIcon className={`w-5 h-5 ${scrolled ? "text-[#1A1A1A]" : "text-white"}`} />
            )}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              className="lg:hidden bg-white border-t border-[#E5E5E5] px-5 py-5 space-y-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {navItems.map((item) =>
                item.href.startsWith("#") ? (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 px-4 text-[#1A1A1A] text-sm tracking-wider rounded-lg hover:bg-[#FAFAFA] transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 px-4 text-[#1A1A1A] text-sm tracking-wider rounded-lg hover:bg-[#FAFAFA] transition-colors"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* SP fixed bottom phone bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A] safe-area-bottom">
        <a href={`tel:${COMPANY.phone}`} className="flex items-center justify-center gap-2 py-3.5 text-white text-sm tracking-wider">
          <Phone className="w-4 h-4" /> お問い合わせ
        </a>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════
   Hero — ミニマル: 名前 + キャッチコピー
   ═══════════════════════════════════════ */
function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const displayName = usePreviewName(COMPANY.name);

  return (
    <section ref={ref} className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y }}>
        <Image
          src="/images/templates/luminos/hero.jpg"
          alt="フォトグラファーイメージ"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      <motion.div
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-5"
        style={{ opacity }}
      >
        <motion.p
          className="text-[#B8956A] text-xs tracking-[0.4em] mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          PHOTOGRAPHER
        </motion.p>

        <motion.h1
          className="text-white leading-[1.2] mb-6"
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2.8rem)",
            fontFamily: "'Noto Sans JP', sans-serif",
            fontWeight: 300,
            letterSpacing: "0.1em",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {displayName}
        </motion.h1>

        <motion.div
          className="w-12 h-px bg-[#B8956A] mb-6"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        />

        <motion.p
          className="text-white/60 text-sm sm:text-base max-w-[480px] leading-[2]"
          style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {COMPANY.tagline}
        </motion.p>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Works — マソンリー風グリッド
   ═══════════════════════════════════════ */
function WorksSection() {
  return (
    <section id="works" className="py-20 sm:py-28 bg-[#FAFAFA]">
      <div className="max-w-[1100px] mx-auto px-5">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#B8956A] text-xs tracking-[0.3em] mb-2">WORKS</p>
          <h2
            className="text-[#1A1A1A] text-2xl sm:text-3xl"
            style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
          >
            作品ギャラリー
          </h2>
        </motion.div>

        {/* Masonry-style grid */}
        <div className="columns-2 lg:columns-3 gap-4 space-y-4">
          {PROJECTS.map((project, i) => {
            const aspectMap: Record<string, string> = {
              portrait: "aspect-[3/4]",
              landscape: "aspect-[4/3]",
              square: "aspect-square",
            };
            const aspect = aspectMap[project.size || "landscape"] || "aspect-[4/3]";
            const slug = project.slug || `work-${project.id}`;

            return (
              <motion.div
                key={project.id}
                className="break-inside-avoid"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link
                  href={`/portfolio-templates/luminos/works/${slug}`}
                  className="group block"
                >
                  <div className={`relative ${aspect} rounded-lg overflow-hidden bg-[#222]`}>
                    <Image
                      src={`/images/templates/luminos/work-${project.id}.jpg`}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                    <div className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-[#B8956A] text-[10px] tracking-[0.2em] mb-1">
                        {project.category} — {project.year}
                      </p>
                      <h3 className="text-white text-sm" style={{ fontWeight: 300 }}>
                        {project.title}
                      </h3>
                    </div>
                  </div>
                  {/* Mobile: always show title */}
                  <div className="lg:hidden mt-2 mb-4">
                    <p className="text-[#888888] text-[10px] tracking-[0.15em]">
                      {project.category} — {project.year}
                    </p>
                    <h3 className="text-[#1A1A1A] text-sm mt-0.5" style={{ fontWeight: 300 }}>
                      {project.title}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link
            href="/portfolio-templates/luminos/works"
            className="inline-flex items-center gap-2 text-[#888888] text-xs tracking-[0.15em] hover:text-[#1A1A1A] transition-colors"
          >
            すべての作品を見る
            <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Services — 撮影メニュー
   ═══════════════════════════════════════ */
function ServicesSection() {
  return (
    <section id="services" className="py-20 sm:py-28 bg-white">
      <div className="max-w-[800px] mx-auto px-5">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#B8956A] text-xs tracking-[0.3em] mb-2">SERVICE</p>
          <h2
            className="text-[#1A1A1A] text-2xl sm:text-3xl"
            style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
          >
            撮影メニュー
          </h2>
        </motion.div>

        <div className="space-y-0">
          {SERVICES.map((service, i) => {
            const Icon = ICON_MAP[service.icon || "Camera"] || Camera;
            return (
              <motion.div
                key={i}
                className="flex items-start gap-5 py-7 border-b border-[#E5E5E5] last:border-b-0"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="w-10 h-10 rounded-full border border-[#E5E5E5] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-[#B8956A]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3
                    className="text-[#1A1A1A] text-base mb-2"
                    style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
                  >
                    {service.title}
                  </h3>
                  <p className="text-[#888888] text-sm leading-[1.9]">{service.description}</p>
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
   About — フォトグラファー紹介
   ═══════════════════════════════════════ */
function AboutSection() {
  return (
    <section id="about" className="py-20 sm:py-28 bg-[#FAFAFA]">
      <div className="max-w-[800px] mx-auto px-5">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#B8956A] text-xs tracking-[0.3em] mb-2">ABOUT</p>
          <h2
            className="text-[#1A1A1A] text-2xl sm:text-3xl"
            style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
          >
            フォトグラファー紹介
          </h2>
        </motion.div>

        <motion.div
          className="sm:flex sm:gap-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* フォトグラファー写真 */}
          <div className="flex-shrink-0 mb-8 sm:mb-0">
            <div className="relative w-[180px] h-[240px] rounded-lg mx-auto sm:mx-0 overflow-hidden">
              <Image
                src="/images/templates/luminos/photographer.jpg"
                alt={`${COMPANY.ceoTitle} ${COMPANY.ceo}`}
                fill
                className="object-cover"
                sizes="180px"
              />
            </div>
            <p className="text-center mt-3 text-[#1A1A1A] text-sm" style={{ fontWeight: 300 }}>
              {COMPANY.ceo}
            </p>
            <p className="text-center text-[#888888] text-xs mt-0.5">{COMPANY.ceoTitle}</p>
          </div>

          <div
            className="text-[#1A1A1A] text-sm leading-[2.2]"
            style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
          >
            {COMPANY.bio.split("\n\n").map((para, i) => (
              <p key={i} className={i > 0 ? "mt-5" : ""}>
                {para}
              </p>
            ))}
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
      <div className="max-w-[800px] mx-auto px-5">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#B8956A] text-xs tracking-[0.3em] mb-2">PRICE</p>
          <h2
            className="text-[#1A1A1A] text-2xl sm:text-3xl mb-3"
            style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
          >
            料金
          </h2>
          <p className="text-[#888888] text-sm">
            撮影内容に応じてお見積もりいたします。まずはお気軽にご相談ください。
          </p>
        </motion.div>

        <div className="space-y-0">
          {MENU_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              className="flex items-start justify-between gap-4 py-6 border-b border-[#E5E5E5] last:border-b-0"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="flex-1">
                <h3
                  className="text-[#1A1A1A] text-base mb-1"
                  style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
                >
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-[#888888] text-sm leading-relaxed">{item.description}</p>
                )}
              </div>
              <p
                className="text-[#B8956A] text-base whitespace-nowrap"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
              >
                {item.price}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-[#888888] text-xs mt-8 pt-6 border-t border-[#E5E5E5] text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          ※ 表示価格はすべて税込です。撮影場所への交通費は別途ご相談ください。
        </motion.p>
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
    <section id="contact" className="py-20 sm:py-28 bg-[#FAFAFA]">
      <div className="max-w-[700px] mx-auto px-5">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#B8956A] text-xs tracking-[0.3em] mb-2">CONTACT</p>
          <h2
            className="text-[#1A1A1A] text-2xl sm:text-3xl mb-3"
            style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
          >
            お問い合わせ
          </h2>
          <p className="text-[#888888] text-sm">
            撮影のご依頼・ご相談はお電話またはフォームからお気軽にどうぞ。
          </p>
        </motion.div>

        {/* Phone CTA */}
        <motion.div
          className="text-center mb-10 p-8 rounded-lg border border-[#E5E5E5] bg-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#B8956A] text-xs tracking-[0.2em] mb-3">TEL</p>
          <a
            href={`tel:${COMPANY.phone}`}
            className="inline-block text-[#1A1A1A] text-2xl sm:text-3xl tracking-[0.15em] hover:text-[#B8956A] transition-colors"
            style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
          >
            {COMPANY.phone}
          </a>
          <p className="text-[#888888] text-xs mt-2">{COMPANY.hours}</p>
        </motion.div>

        {/* Form */}
        <motion.div
          className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {submitted ? (
            <div className="p-10 text-center">
              <div className="w-14 h-14 rounded-full border border-[#E5E5E5] flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-[#B8956A]" />
              </div>
              <p className="text-[#1A1A1A] text-lg mb-2" style={{ fontWeight: 300 }}>
                お問い合わせありがとうございます
              </p>
              <p className="text-[#888888] text-sm">2営業日以内にご返信いたします。</p>
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
                  <label className="block text-xs text-[#888888] mb-2">
                    お名前 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] text-[#1A1A1A] text-sm placeholder:text-[#CCCCCC] focus:outline-none focus:border-[#B8956A] focus:ring-1 focus:ring-[#B8956A]/20 transition-all"
                    placeholder="田中 花子"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#888888] mb-2">
                    メールアドレス <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] text-[#1A1A1A] text-sm placeholder:text-[#CCCCCC] focus:outline-none focus:border-[#B8956A] focus:ring-1 focus:ring-[#B8956A]/20 transition-all"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#888888] mb-2">撮影の種類</label>
                <div className="flex flex-wrap gap-2">
                  {["ポートレート", "ブランディング", "イベント", "家族写真", "商品撮影", "その他"].map(
                    (type) => (
                      <label
                        key={type}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E5E5E5] text-sm text-[#1A1A1A] cursor-pointer hover:border-[#B8956A]/40 transition-all has-[:checked]:bg-[#B8956A]/10 has-[:checked]:border-[#B8956A]/40 has-[:checked]:text-[#B8956A]"
                      >
                        <input type="radio" name="shootType" value={type} className="sr-only" />
                        {type}
                      </label>
                    ),
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#888888] mb-2">ご希望の日程・内容など</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] text-[#1A1A1A] text-sm placeholder:text-[#CCCCCC] focus:outline-none focus:border-[#B8956A] focus:ring-1 focus:ring-[#B8956A]/20 transition-all resize-none"
                  placeholder="例：5月中旬にプロフィール写真の撮影を希望しています。屋外のロケーション撮影は可能でしょうか。"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-lg bg-[#1A1A1A] text-white text-sm tracking-wider hover:bg-[#333] transition-colors"
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
    <footer className="py-10 bg-[#1A1A1A] pb-24 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-white/10">
          <p
            className="text-white text-sm tracking-[0.15em]"
            style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
          >
            {displayName}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { label: "Works", href: "/portfolio-templates/luminos/works" },
              { label: "Flow", href: "/portfolio-templates/luminos/flow" },
              { label: "Service", href: "#services" },
              { label: "About", href: "#about" },
              { label: "Contact", href: "#contact" },
            ].map((item) =>
              item.href.startsWith("#") ? (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-white/40 text-xs tracking-wider hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-white/40 text-xs tracking-wider hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-white/25 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {COMPANY.address}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {COMPANY.email}
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
export default function LuminosPage() {
  return (
    <>
      <DemoBanner />
      <Header />
      <main>
        <HeroSection />
        <WorksSection />
        <ServicesSection />
        <AboutSection />
        <PricingSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
