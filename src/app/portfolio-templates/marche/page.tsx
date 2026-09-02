"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  X,
  Menu as MenuIcon,
  ShoppingBag,
  Heart,
  Gift,
  Star,
  Send,
  Check,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, GalleryItem } from "@/lib/site-config-schema";
import { usePreviewName } from "@/lib/use-preview-name";
import siteConfig from "./site.config.json";

/* ═══════════════════════════════════════
   データ読み込み
   ═══════════════════════════════════════ */
const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const GALLERY = (config.galleryItems || []) as GalleryItem[];
const STRENGTHS = config.strengths || [];

const ICON_MAP: Record<string, typeof ShoppingBag> = { ShoppingBag, Heart, Gift };

/* ギャラリーカテゴリの抽出 */
const GALLERY_CATEGORIES = ["すべて", ...Array.from(new Set(GALLERY.map((g) => g.category).filter(Boolean)))];

/* ═══════════════════════════════════════
   画像パス
   ═══════════════════════════════════════ */
const IMG = "/images/templates/marche";
const GALLERY_IMAGES = [`${IMG}/product-1.jpg`, `${IMG}/product-2.jpg`, `${IMG}/product-3.jpg`, `${IMG}/shop.jpg`];
const GALLERY_FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #F5EDE5 0%, #E8DFD3 100%)",
  "linear-gradient(135deg, #EDE8E0 0%, #D4CFC5 100%)",
  "linear-gradient(135deg, #F0EBE3 0%, #DDD5CB 100%)",
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
    { label: "商品", href: "#gallery" },
    { label: "ブランドについて", href: "#about" },
    { label: "店舗情報", href: "#info" },
    { label: "お問い合わせ", href: "#contact" },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#FDF8F4]/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}>
        <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <p className={`font-bold text-sm tracking-wide transition-colors ${scrolled ? "text-[#2A1F14]" : "text-white"}`} style={{ fontFamily: "'Noto Serif JP', serif" }}>
              {displayName}
            </p>
          </a>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className={`text-sm transition-colors ${scrolled ? "text-[#7A6B5E] hover:text-[#C45B28]" : "text-white/80 hover:text-white"}`}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${COMPANY.phone}`}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C45B28] text-white text-sm font-medium hover:bg-[#A34A20] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="tracking-wider">{COMPANY.phone}</span>
            </a>

            <button onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="メニュー">
              {open ? (
                <X className={`w-5 h-5 ${scrolled ? "text-[#2A1F14]" : "text-white"}`} />
              ) : (
                <MenuIcon className={`w-5 h-5 ${scrolled ? "text-[#2A1F14]" : "text-white"}`} />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              className="lg:hidden bg-[#FDF8F4] border-t border-[#E8DFD3] px-5 py-5 space-y-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 px-4 text-[#2A1F14] text-base rounded-lg hover:bg-[#C45B28]/5 transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={`tel:${COMPANY.phone}`}
                className="block mt-3 text-center py-3.5 rounded-lg bg-[#C45B28] text-white font-medium"
              >
                <Phone className="w-4 h-4 inline mr-2" />{COMPANY.phone}
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* SP fixed bottom phone bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#C45B28] safe-area-bottom">
        <a href={`tel:${COMPANY.phone}`} className="flex items-center justify-center gap-2 py-3.5 text-white font-bold text-base">
          <Phone className="w-5 h-5" /> お電話でのお問い合わせ
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
      </motion.div>

      <motion.div
        className="relative z-10 h-full flex flex-col justify-end max-w-[1200px] mx-auto px-5 pb-20 sm:pb-24"
        style={{ opacity }}
      >
        {/* 営業時間バッジ */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 w-fit mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Clock className="w-3 h-3 text-[#E8C9A0]" />
          <span className="text-white/80 text-xs tracking-wider">{COMPANY.hours}</span>
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
          <a href="#gallery" className="px-8 py-3.5 rounded-lg bg-[#C45B28] text-white font-medium text-sm hover:bg-[#A34A20] transition-colors text-center shadow-lg shadow-[#C45B28]/20">
            商品を見る
          </a>
          <a href="#about" className="px-8 py-3.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm hover:bg-white/20 transition-colors text-center">
            ブランドについて
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Gallery — 商品ギャラリー + カテゴリフィルター
   ═══════════════════════════════════════ */
function GallerySection() {
  const [filter, setFilter] = useState("すべて");
  const filtered = filter === "すべて" ? GALLERY : GALLERY.filter((g) => g.category === filter);

  return (
    <section id="gallery" className="py-20 sm:py-28 bg-[#FDF8F4]">
      <div className="max-w-[1100px] mx-auto px-5">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#C45B28] text-xs tracking-[0.3em] mb-2 font-medium">ITEMS</p>
          <h2 className="text-[#2A1F14] font-bold text-2xl sm:text-3xl mb-3" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            商品ギャラリー
          </h2>
          <p className="text-[#7A6B5E] text-sm">作り手の想いが詰まった一点ものたち</p>
        </motion.div>

        {/* カテゴリフィルター */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {GALLERY_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c as string)}
              className={`px-5 py-2 rounded-full text-sm transition-all ${
                filter === c
                  ? "bg-[#C45B28] text-white"
                  : "bg-white text-[#7A6B5E] border border-[#E8DFD3] hover:border-[#C45B28]/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* グリッド */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#E8DFD3] group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              {i < GALLERY_IMAGES.length ? (
                <Image src={GALLERY_IMAGES[i]} alt={item.caption || ""} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full" style={{ background: GALLERY_FALLBACK_GRADIENTS[i % GALLERY_FALLBACK_GRADIENTS.length] }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 sm:p-4">
                  <p className="text-white text-xs sm:text-sm">{item.caption}</p>
                  {item.category && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-white/20 text-white/90 text-[10px]">{item.category}</span>
                  )}
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
   About — オーナー挨拶 + こだわり
   ═══════════════════════════════════════ */
function AboutSection() {
  return (
    <section id="about" className="py-20 sm:py-28 bg-white">
      <div className="max-w-[900px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#C45B28] text-xs tracking-[0.3em] mb-2 font-medium">ABOUT</p>
          <h2 className="text-[#2A1F14] font-bold text-2xl sm:text-3xl" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            ブランドについて
          </h2>
        </motion.div>

        {/* オーナー挨拶 */}
        <motion.div
          className="bg-[#FDF8F4] rounded-2xl border border-[#E8DFD3] p-8 sm:p-10 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="sm:flex sm:gap-8">
            {/* オーナー写真 */}
            <div className="flex-shrink-0 mb-6 sm:mb-0">
              <div className="relative w-[140px] h-[180px] rounded-xl overflow-hidden mx-auto sm:mx-0">
                <Image src={`${IMG}/owner.jpg`} alt={`${COMPANY.ceoTitle} ${COMPANY.ceo}`} fill className="object-cover" />
              </div>
              <p className="text-center text-[#7A6B5E] text-xs mt-2">{COMPANY.ceoTitle}　{COMPANY.ceo}</p>
            </div>

            <div className="text-[#2A1F14] text-sm sm:text-base leading-[2.2]" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              {COMPANY.bio.split("\n\n").map((para, i) => (
                <p key={i} className={i > 0 ? "mt-5" : ""}>{para}</p>
              ))}
            </div>
          </div>
        </motion.div>

        {/* こだわり */}
        <div className="space-y-6">
          {STRENGTHS.map((s, i) => {
            const Icon = ICON_MAP[s.icon || "ShoppingBag"] || ShoppingBag;
            return (
              <motion.div
                key={i}
                className="flex items-start gap-5"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-[#C45B28]/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-6 h-6 text-[#C45B28]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-[#2A1F14] text-base mb-2" style={{ fontFamily: "'Noto Serif JP', serif" }}>{s.title}</h3>
                  <p className="text-[#7A6B5E] text-sm leading-[1.9]">{s.description}</p>
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
   Info — 店舗情報 + 地図
   ═══════════════════════════════════════ */
function InfoSection() {
  const displayName = usePreviewName(COMPANY.name);
  return (
    <section id="info" className="py-20 sm:py-28 bg-[#FDF8F4]">
      <div className="max-w-[1000px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#C45B28] text-xs tracking-[0.3em] mb-2 font-medium">ACCESS</p>
          <h2 className="text-[#2A1F14] font-bold text-2xl sm:text-3xl" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            店舗情報
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 地図 */}
          <motion.div
            className="aspect-[4/3] rounded-xl overflow-hidden bg-[#E8DFD3]"
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
                title="店舗の地図"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-[#7A6B5E] mx-auto mb-2" />
                  <p className="text-[#7A6B5E] text-sm">Google マップ</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* 店舗情報 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white rounded-2xl border border-[#E8DFD3] overflow-hidden">
              <div className="divide-y divide-[#E8DFD3]">
                {[
                  { icon: null, label: "店名", value: displayName },
                  { icon: MapPin, label: "住所", value: COMPANY.address },
                  { icon: Phone, label: "電話", value: COMPANY.phone },
                  { icon: Clock, label: "営業時間", value: COMPANY.hours },
                  { icon: Mail, label: "メール", value: COMPANY.email },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row">
                    <div className="sm:w-28 px-5 py-3 bg-[#F5F0EA] text-[#7A6B5E] text-xs font-medium flex items-center gap-2">
                      {item.icon && <item.icon className="w-3.5 h-3.5" />}
                      {item.label}
                    </div>
                    <div className="flex-1 px-5 py-3 text-[#2A1F14] text-sm whitespace-pre-line">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`tel:${COMPANY.phone}`}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#C45B28] text-white text-sm font-medium hover:bg-[#A34A20] transition-colors"
              >
                <Phone className="w-4 h-4" /> 電話する
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(COMPANY.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[#E8DFD3] text-[#7A6B5E] text-sm hover:border-[#C45B28]/30 transition-colors"
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
   Contact — お問い合わせ
   ═══════════════════════════════════════ */
function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="contact" className="py-20 sm:py-28 bg-white">
      <div className="max-w-[800px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#C45B28] text-xs tracking-[0.3em] mb-2 font-medium">CONTACT</p>
          <h2 className="text-[#2A1F14] font-bold text-2xl sm:text-3xl mb-3" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            お問い合わせ
          </h2>
          <p className="text-[#7A6B5E] text-sm">商品のお取り置き・ご質問など、お気軽にご連絡ください。</p>
        </motion.div>

        {/* 電話CTA */}
        <motion.div
          className="text-center mb-12 p-8 rounded-2xl bg-[#FDF8F4] border border-[#E8DFD3]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#C45B28] text-xs tracking-wider mb-3 font-medium">お電話でのお問い合わせ</p>
          <a
            href={`tel:${COMPANY.phone}`}
            className="inline-block text-[#2A1F14] text-3xl sm:text-4xl font-bold tracking-wider hover:text-[#C45B28] transition-colors"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            {COMPANY.phone}
          </a>
          <p className="text-[#7A6B5E] text-xs mt-2">{COMPANY.hours}</p>
        </motion.div>

        {/* お問い合わせフォーム */}
        <motion.div
          className="bg-[#FDF8F4] rounded-2xl border border-[#E8DFD3] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="p-5 sm:p-6 bg-[#F5F0EA] border-b border-[#E8DFD3]">
            <h3 className="text-[#2A1F14] font-bold text-base" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              メールでのお問い合わせ
            </h3>
          </div>

          {submitted ? (
            <div className="p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-[#C45B28]/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-[#C45B28]" />
              </div>
              <p className="text-[#2A1F14] text-lg font-bold mb-2">お問い合わせありがとうございます</p>
              <p className="text-[#7A6B5E] text-sm">翌営業日までにご返信いたします。</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="p-6 sm:p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-[#7A6B5E] mb-2 font-medium">
                    お名前 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E8DFD3] text-[#2A1F14] text-sm placeholder:text-[#C4B5A0] focus:outline-none focus:border-[#C45B28] focus:ring-2 focus:ring-[#C45B28]/10 transition-all"
                    placeholder="山田 花子"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#7A6B5E] mb-2 font-medium">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E8DFD3] text-[#2A1F14] text-sm placeholder:text-[#C4B5A0] focus:outline-none focus:border-[#C45B28] focus:ring-2 focus:ring-[#C45B28]/10 transition-all"
                    placeholder="090-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#7A6B5E] mb-2 font-medium">
                  メールアドレス <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white border border-[#E8DFD3] text-[#2A1F14] text-sm placeholder:text-[#C4B5A0] focus:outline-none focus:border-[#C45B28] focus:ring-2 focus:ring-[#C45B28]/10 transition-all"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-xs text-[#7A6B5E] mb-2 font-medium">
                  お問い合わせ種別
                </label>
                <div className="flex flex-wrap gap-2">
                  {["商品のお取り置き", "在庫の確認", "ギフトの相談", "その他"].map((type) => (
                    <label key={type} className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E8DFD3] text-sm text-[#2A1F14] cursor-pointer hover:border-[#C45B28]/30 hover:bg-[#C45B28]/5 transition-all has-[:checked]:bg-[#C45B28]/10 has-[:checked]:border-[#C45B28]/30 has-[:checked]:text-[#C45B28]">
                      <input type="radio" name="type" value={type} className="sr-only" />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#7A6B5E] mb-2 font-medium">
                  お問い合わせ内容
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-white border border-[#E8DFD3] text-[#2A1F14] text-sm placeholder:text-[#C4B5A0] focus:outline-none focus:border-[#C45B28] focus:ring-2 focus:ring-[#C45B28]/10 transition-all resize-none"
                  placeholder="例：リネンのワンピースのサイズ感を教えてください。"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-lg bg-[#C45B28] text-white font-bold text-sm tracking-wider hover:bg-[#A34A20] transition-colors"
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
    <footer className="py-10 bg-[#2A1F14] pb-24 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-white/10">
          <p className="text-white font-bold text-sm" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            {displayName}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5">
            {[
              { label: "商品", href: "#gallery" },
              { label: "ブランドについて", href: "#about" },
              { label: "店舗情報", href: "#info" },
              { label: "お問い合わせ", href: "#contact" },
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
export default function MarchePage() {
  return (
    <>
      <DemoBanner />
      <Header />
      <main>
        <HeroSection />
        <GallerySection />
        <AboutSection />
        <InfoSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
