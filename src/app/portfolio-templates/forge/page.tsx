"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Target,
  Flame,
  Trophy,
  Clock,
  Phone,
  Mail,
  MapPin,
  X,
  Menu,
  Send,
  Check,
  Star,
  User,
  Heart,
  Zap,
  ExternalLink,
} from "lucide-react";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, MenuItem, GalleryItem, StaffMember, Service } from "@/lib/site-config-schema";
import { usePreviewName } from "@/lib/use-preview-name";
import siteConfig from "./site.config.json";

/* ═══════════════════════════════════════
   データ読み込み
   ═══════════════════════════════════════ */
const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const SERVICES = (config.services || []) as Service[];
const MENU_ITEMS = (config.menu || []) as MenuItem[];
const GALLERY = (config.galleryItems || []) as GalleryItem[];
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
   施設ギャラリー画像マッピング
   ═══════════════════════════════════════ */
const GALLERY_IMAGES = [
  "/images/templates/forge/gym-1.jpg",
  "/images/templates/forge/gym-2.jpg",
  "/images/templates/forge/gym-3.jpg",
  "/images/templates/forge/equipment.jpg",
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
    { label: "プログラム", href: "#programs" },
    { label: "料金", href: "#pricing" },
    { label: "トレーナー", href: "#staff" },
    { label: "施設", href: "#gallery" },
    { label: "ジム情報", href: "#info" },
    { label: "体験予約", href: "#contact" },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#F5F5F5]/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}>
        <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${scrolled ? "bg-[#FF6B35]" : "bg-[#FF6B35]"}`}>
              <Dumbbell className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <p className={`font-bold text-sm tracking-wide transition-colors ${scrolled ? "text-[#1A1A1A]" : "text-white"}`}>
              {displayName}
            </p>
          </a>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className={`text-sm font-medium transition-colors ${scrolled ? "text-[#6B6B6B] hover:text-[#FF6B35]" : "text-white/80 hover:text-white"}`}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FF6B35] text-white text-sm font-bold hover:bg-[#E85A25] transition-colors"
            >
              無料体験を予約
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
              className="lg:hidden bg-[#F5F5F5] border-t border-[#E0E0E0] px-5 py-5 space-y-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 px-4 text-[#1A1A1A] text-base font-medium rounded-lg hover:bg-[#FF6B35]/5 transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="block mt-3 text-center py-3.5 rounded-lg bg-[#FF6B35] text-white font-bold"
              >
                無料体験を予約
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* SP fixed bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-area-bottom flex">
        <a href="#contact" className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#FF6B35] text-white font-bold text-base">
          <Zap className="w-5 h-5" /> 無料体験を予約
        </a>
        <a href={`tel:${COMPANY.phone}`} className="flex items-center justify-center gap-2 px-5 py-3.5 bg-[#1A1A1A] text-white font-bold text-base">
          <Phone className="w-5 h-5" />
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
          src="/images/templates/forge/hero.jpg"
          alt="ジム施設"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />
      </motion.div>

      <motion.div
        className="relative z-10 h-full flex flex-col justify-end max-w-[1200px] mx-auto px-5 pb-20 sm:pb-24"
        style={{ opacity }}
      >
        {/* バッジ */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF6B35]/20 border border-[#FF6B35]/30 w-fit mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Zap className="w-3 h-3 text-[#FF6B35]" />
          <span className="text-[#FF6B35] text-xs tracking-wider font-bold">無料カウンセリング受付中</span>
        </motion.div>

        <motion.h1
          className="text-white font-bold leading-[1.2] mb-4"
          style={{ fontSize: "clamp(2rem, 5.5vw, 3.5rem)" }}
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
          <a href="#contact" className="px-8 py-4 rounded-lg bg-[#FF6B35] text-white font-bold text-sm hover:bg-[#E85A25] transition-colors text-center shadow-lg shadow-[#FF6B35]/20">
            無料体験を予約する
          </a>
          <a href="#programs" className="px-8 py-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-colors text-center">
            プログラムを見る
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Programs (services)
   ═══════════════════════════════════════ */
function ProgramsSection() {
  return (
    <section id="programs" className="py-20 sm:py-28 bg-white">
      <div className="max-w-[1100px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#FF6B35] text-xs tracking-[0.3em] mb-2 font-bold">PROGRAMS</p>
          <h2 className="text-[#1A1A1A] font-bold text-2xl sm:text-3xl mb-3">
            あなたの目標に合わせたプログラム
          </h2>
          <p className="text-[#6B6B6B] text-sm max-w-[500px] mx-auto">
            目的・体力レベルに合わせて最適なトレーニングプランを組みます。
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {SERVICES.map((service, i) => {
            const Icon = ICON_MAP[service.icon || "Dumbbell"] || Dumbbell;
            const slug = service.slug;
            const inner = (
              <>
                <div className="w-14 h-14 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center mb-5 group-hover:bg-[#FF6B35]/15 transition-colors">
                  <Icon className="w-7 h-7 text-[#FF6B35]" strokeWidth={1.8} />
                </div>
                <h3 className="font-bold text-[#1A1A1A] text-lg mb-3">{service.title}</h3>
                <p className="text-[#6B6B6B] text-sm leading-[1.9]">{service.description}</p>
              </>
            );
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {slug ? (
                  <Link
                    href={`/portfolio-templates/forge/programs/${slug}`}
                    className="block relative p-7 rounded-2xl border border-[#E0E0E0] bg-white hover:border-[#FF6B35]/30 hover:shadow-lg transition-all group"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="relative p-7 rounded-2xl border border-[#E0E0E0] bg-white hover:border-[#FF6B35]/30 hover:shadow-lg transition-all group">
                    {inner}
                  </div>
                )}
              </motion.div>
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
            href="/portfolio-templates/forge/programs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#E0E0E0] text-[#6B6B6B] text-sm font-medium hover:border-[#FF6B35]/30 hover:text-[#FF6B35] transition-all"
          >
            すべてのプログラムを見る
            <ExternalLink className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Pricing (menu)
   ═══════════════════════════════════════ */
function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#F5F5F5]">
      <div className="max-w-[1000px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#FF6B35] text-xs tracking-[0.3em] mb-2 font-bold">PRICING</p>
          <h2 className="text-[#1A1A1A] font-bold text-2xl sm:text-3xl mb-3">
            料金プラン
          </h2>
          <p className="text-[#6B6B6B] text-sm">入会金無料。すべて税込表示です。</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MENU_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              className={`relative p-6 rounded-2xl bg-white border-2 transition-all ${
                item.isRecommended
                  ? "border-[#FF6B35] shadow-lg shadow-[#FF6B35]/10"
                  : "border-[#E0E0E0]"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              {item.isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-[#FF6B35] text-white text-xs font-bold shadow-md">
                    <Star className="w-3 h-3" fill="currentColor" />
                    おすすめ
                  </span>
                </div>
              )}

              <h3 className="font-bold text-[#1A1A1A] text-base mb-4 mt-1">{item.name}</h3>
              <p className="text-[#FF6B35] font-bold text-3xl mb-1">{item.price}</p>
              <p className="text-[#6B6B6B] text-xs mb-5">/月（税込）</p>
              <p className="text-[#6B6B6B] text-sm leading-[1.8]">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-center text-[#6B6B6B] text-xs mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          ※ 体験トレーニング後、当日入会で入会金無料。
        </motion.p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Staff — トレーナー紹介
   ═══════════════════════════════════════ */
function StaffSection() {
  return (
    <section id="staff" className="py-20 sm:py-28 bg-white">
      <div className="max-w-[1000px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#FF6B35] text-xs tracking-[0.3em] mb-2 font-bold">TRAINERS</p>
          <h2 className="text-[#1A1A1A] font-bold text-2xl sm:text-3xl mb-3">
            トレーナー紹介
          </h2>
          <p className="text-[#6B6B6B] text-sm">全員が有資格者。あなたの目標達成を全力でサポートします。</p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6">
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
                  className="block rounded-2xl border border-[#E0E0E0] overflow-hidden bg-white hover:shadow-lg hover:border-[#FF6B35]/30 transition-all group"
                >
                  {/* 写真エリア */}
                  <div className="aspect-[5/6] overflow-hidden relative">
                    {member.image ? (
                      <Image src={member.image} alt={member.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 33vw" />
                    ) : (
                      <Image
                        src="/images/templates/forge/trainer.jpg"
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    )}
                  </div>

                  <div className="p-5">
                    <p className="text-[#FF6B35] text-xs font-bold tracking-wider mb-1">{member.role}</p>
                    <h3 className="font-bold text-[#1A1A1A] text-lg mb-3 group-hover:text-[#FF6B35] transition-colors">{member.name}</h3>
                    {member.bio && (
                      <p className="text-[#6B6B6B] text-sm leading-[1.8] line-clamp-3">{member.bio}</p>
                    )}
                  </div>
                </Link>
              </motion.div>
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
            href="/portfolio-templates/forge/trainers"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#E0E0E0] text-[#6B6B6B] text-sm font-medium hover:border-[#FF6B35]/30 hover:text-[#FF6B35] transition-all"
          >
            すべてのトレーナーを見る
            <ExternalLink className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Gallery — 施設ギャラリー
   ═══════════════════════════════════════ */
function GallerySection() {
  return (
    <section id="gallery" className="py-20 sm:py-28 bg-[#F5F5F5]">
      <div className="max-w-[1100px] mx-auto px-5">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#FF6B35] text-xs tracking-[0.3em] mb-2 font-bold">FACILITY</p>
          <h2 className="text-[#1A1A1A] font-bold text-2xl sm:text-3xl mb-3">
            施設ギャラリー
          </h2>
          <p className="text-[#6B6B6B] text-sm">充実の設備で、快適にトレーニングいただけます。</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {GALLERY.map((item, i) => (
            <motion.div
              key={item.id}
              className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#E0E0E0] group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              {GALLERY_IMAGES[i] ? (
                <Image
                  src={GALLERY_IMAGES[i]}
                  alt={item.caption || `施設写真${i + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#E8E8E8] to-[#D0D0D0]" />
              )}
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 sm:p-4">
                  <p className="text-white text-xs sm:text-sm font-medium">{item.caption}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Info — ジム情報
   ═══════════════════════════════════════ */
function InfoSection() {
  const displayName = usePreviewName(COMPANY.name);
  return (
    <section id="info" className="py-20 sm:py-28 bg-white">
      <div className="max-w-[1000px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#FF6B35] text-xs tracking-[0.3em] mb-2 font-bold">ACCESS</p>
          <h2 className="text-[#1A1A1A] font-bold text-2xl sm:text-3xl">
            ジム情報
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 地図 */}
          <motion.div
            className="aspect-[4/3] rounded-xl overflow-hidden bg-[#E0E0E0]"
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
                title="ジムの地図"
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

          {/* ジム情報テーブル */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-[#F5F5F5] rounded-2xl border border-[#E0E0E0] overflow-hidden">
              <div className="divide-y divide-[#E0E0E0]">
                {[
                  { icon: null, label: "ジム名", value: displayName },
                  { icon: MapPin, label: "住所", value: COMPANY.address },
                  { icon: Phone, label: "電話", value: COMPANY.phone },
                  { icon: Clock, label: "営業時間", value: COMPANY.hours },
                  { icon: Mail, label: "メール", value: COMPANY.email },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row">
                    <div className="sm:w-28 px-5 py-3 bg-[#EBEBEB] text-[#6B6B6B] text-xs font-bold flex items-center gap-2">
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
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#1A1A1A] text-white text-sm font-bold hover:bg-[#333333] transition-colors"
              >
                <Phone className="w-4 h-4" /> 電話する
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(COMPANY.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[#E0E0E0] text-[#6B6B6B] text-sm font-medium hover:border-[#FF6B35]/30 transition-colors"
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
   Contact — 体験予約フォーム
   ═══════════════════════════════════════ */
function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="contact" className="py-20 sm:py-28 bg-[#1A1A1A]">
      <div className="max-w-[800px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#FF6B35] text-xs tracking-[0.3em] mb-2 font-bold">TRIAL</p>
          <h2 className="text-white font-bold text-2xl sm:text-3xl mb-3">
            無料体験を予約する
          </h2>
          <p className="text-white/50 text-sm">まずは体験トレーニングで、ジムの雰囲気をお確かめください。</p>
        </motion.div>

        {/* 電話CTA */}
        <motion.div
          className="text-center mb-10 p-8 rounded-2xl bg-white/5 border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#FF6B35] text-xs tracking-wider mb-3 font-bold">お電話でのご予約</p>
          <a
            href={`tel:${COMPANY.phone}`}
            className="inline-block text-white text-3xl sm:text-4xl font-bold tracking-wider hover:text-[#FF6B35] transition-colors"
          >
            {COMPANY.phone}
          </a>
          <p className="text-white/40 text-xs mt-2">{COMPANY.hours}</p>
        </motion.div>

        {/* フォーム */}
        <motion.div
          className="bg-white rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="p-5 sm:p-6 bg-[#F5F5F5] border-b border-[#E0E0E0]">
            <h3 className="text-[#1A1A1A] font-bold text-base">
              Webからのご予約
            </h3>
          </div>

          {submitted ? (
            <div className="p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-[#FF6B35]/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-[#FF6B35]" />
              </div>
              <p className="text-[#1A1A1A] text-lg font-bold mb-2">ご予約ありがとうございます</p>
              <p className="text-[#6B6B6B] text-sm">24時間以内にご連絡いたします。</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="p-6 sm:p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-[#6B6B6B] mb-2 font-bold">
                    お名前 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#F5F5F5] border border-[#E0E0E0] text-[#1A1A1A] text-sm placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/10 transition-all"
                    placeholder="山田 太郎"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6B6B6B] mb-2 font-bold">
                    電話番号 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#F5F5F5] border border-[#E0E0E0] text-[#1A1A1A] text-sm placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/10 transition-all"
                    placeholder="090-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#6B6B6B] mb-2 font-bold">
                  メールアドレス <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[#F5F5F5] border border-[#E0E0E0] text-[#1A1A1A] text-sm placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/10 transition-all"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-xs text-[#6B6B6B] mb-2 font-bold">
                  興味のあるプログラム
                </label>
                <div className="flex flex-wrap gap-2">
                  {["ダイエット", "筋力アップ", "姿勢改善", "アスリート向け", "まだ決めていない"].map((type) => (
                    <label key={type} className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E0E0E0] text-sm text-[#1A1A1A] cursor-pointer hover:border-[#FF6B35]/30 hover:bg-[#FF6B35]/5 transition-all has-[:checked]:bg-[#FF6B35]/10 has-[:checked]:border-[#FF6B35]/30 has-[:checked]:text-[#FF6B35]">
                      <input type="radio" name="program" value={type} className="sr-only" />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#6B6B6B] mb-2 font-bold">
                  ご希望の日時・ご質問など
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-[#F5F5F5] border border-[#E0E0E0] text-[#1A1A1A] text-sm placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/10 transition-all resize-none"
                  placeholder="例：平日の夕方18時以降で体験したいです。"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-lg bg-[#FF6B35] text-white font-bold text-sm tracking-wider hover:bg-[#E85A25] transition-colors"
              >
                <Send className="w-4 h-4" />
                体験を予約する
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
    <footer className="py-10 bg-[#111111] pb-24 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B35] flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <p className="text-white font-bold text-sm">
              {displayName}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            {[
              { label: "プログラム", href: "#programs" },
              { label: "料金", href: "#pricing" },
              { label: "トレーナー", href: "#staff" },
              { label: "施設", href: "#gallery" },
              { label: "ジム情報", href: "#info" },
              { label: "体験予約", href: "#contact" },
            ].map((item) => (
              <a key={item.href} href={item.href} className="text-white/50 text-xs hover:text-white transition-colors">
                {item.label}
              </a>
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
export default function ForgePage() {
  return (
    <>
      <DemoBanner />
      <Header />
      <main>
        <HeroSection />
        <ProgramsSection />
        <PricingSection />
        <StaffSection />
        <GallerySection />
        <InfoSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
