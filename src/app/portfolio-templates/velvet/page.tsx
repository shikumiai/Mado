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
  Scissors,
  Sparkles,
  Heart,
  Star,
  Send,
  Check,
  ExternalLink,
  User,
} from "lucide-react";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, MenuItem, GalleryItem, StaffMember } from "@/lib/site-config-schema";
import { usePreviewName } from "@/lib/use-preview-name";
import siteConfig from "./site.config.json";

/* ═══════════════════════════════════════
   データ読み込み
   ═══════════════════════════════════════ */
const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const MENU_ITEMS = (config.menu || []) as MenuItem[];
const GALLERY = (config.galleryItems || []) as GalleryItem[];
const STAFF = (config.staff || []) as StaffMember[];
const STRENGTHS = config.strengths || [];

const ICON_MAP: Record<string, typeof Scissors> = { Scissors, Sparkles, Heart, User, Star };

const MENU_CATEGORIES = ["すべて", ...Array.from(new Set(MENU_ITEMS.map((m) => m.category)))];

/* ═══════════════════════════════════════
   ギャラリー画像マッピング
   ═══════════════════════════════════════ */
const GALLERY_IMAGES = [
  "/images/templates/velvet/style-1.jpg",
  "/images/templates/velvet/style-2.jpg",
  "/images/templates/velvet/style-3.jpg",
  "/images/templates/velvet/style-4.jpg",
  "/images/templates/velvet/salon.jpg",
  "/images/templates/velvet/salon-2.jpg",
  "/images/templates/velvet/style-1.jpg",
  "/images/templates/velvet/style-2.jpg",
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
    { label: "スタイル", href: "#gallery" },
    { label: "メニュー", href: "#menu" },
    { label: "スタイリスト", href: "#staff" },
    { label: "サロンについて", href: "#about" },
    { label: "アクセス", href: "#info" },
    { label: "ご予約", href: "#contact" },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#FAF6F5]/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}>
        <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <Scissors className={`w-4 h-4 transition-colors ${scrolled ? "text-[#9B6B6B]" : "text-[#C4956A]"}`} strokeWidth={1.5} />
            <p className={`font-bold text-sm tracking-wider transition-colors ${scrolled ? "text-[#3A2828]" : "text-white"}`}>
              {displayName}
            </p>
          </a>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className={`text-sm transition-colors ${scrolled ? "text-[#8A7070] hover:text-[#9B6B6B]" : "text-white/80 hover:text-white"}`}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${COMPANY.phone}`}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#9B6B6B] text-white text-sm font-medium hover:bg-[#846060] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="tracking-wider">{COMPANY.phone}</span>
            </a>

            <button onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="メニュー">
              {open ? (
                <X className={`w-5 h-5 ${scrolled ? "text-[#3A2828]" : "text-white"}`} />
              ) : (
                <Menu className={`w-5 h-5 ${scrolled ? "text-[#3A2828]" : "text-white"}`} />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              className="lg:hidden bg-[#FAF6F5] border-t border-[#E8DEDD] px-5 py-5 space-y-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 px-4 text-[#3A2828] text-base rounded-lg hover:bg-[#9B6B6B]/5 transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={`tel:${COMPANY.phone}`}
                className="block mt-3 text-center py-3.5 rounded-lg bg-[#9B6B6B] text-white font-medium"
              >
                <Phone className="w-4 h-4 inline mr-2" />{COMPANY.phone}
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* SP固定フッター — 「今すぐ予約」電話ボタン */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#9B6B6B] safe-area-bottom">
        <a href={`tel:${COMPANY.phone}`} className="flex items-center justify-center gap-2 py-3.5 text-white font-bold text-base">
          <Phone className="w-5 h-5" /> 今すぐ予約
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
          src="/images/templates/velvet/hero.jpg"
          alt="美容サロン内観"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
      </motion.div>

      <motion.div
        className="relative z-10 h-full flex flex-col justify-end max-w-[1200px] mx-auto px-5 pb-20 sm:pb-24"
        style={{ opacity }}
      >
        {/* バッジ */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 w-fit mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Scissors className="w-3 h-3 text-[#C4956A]" />
          <span className="text-white/80 text-xs tracking-wider">自由が丘 / 半個室3席 / オーガニックカラー専門</span>
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
          <a href="#contact" className="px-8 py-3.5 rounded-lg bg-[#9B6B6B] text-white font-medium text-sm hover:bg-[#846060] transition-colors text-center shadow-lg shadow-[#9B6B6B]/20">
            ご予約はこちら
          </a>
          <a href="#menu" className="px-8 py-3.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm hover:bg-white/20 transition-colors text-center">
            メニュー・料金を見る
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Gallery — スタイルギャラリー
   ═══════════════════════════════════════ */
function GallerySection() {
  const [filter, setFilter] = useState("すべて");
  const categories = ["すべて", ...Array.from(new Set(GALLERY.map((g) => g.category).filter(Boolean)))];
  const filtered = filter === "すべて" ? GALLERY : GALLERY.filter((g) => g.category === filter);

  return (
    <section id="gallery" className="py-20 sm:py-28 bg-[#FAF6F5]">
      <div className="max-w-[1100px] mx-auto px-5">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#9B6B6B] text-xs tracking-[0.3em] mb-2 font-medium">STYLE</p>
          <h2 className="text-[#3A2828] font-bold text-2xl sm:text-3xl mb-3">
            スタイルギャラリー
          </h2>
          <p className="text-[#8A7070] text-sm">お客様の実際のスタイルをご紹介します</p>
        </motion.div>

        {/* フィルター */}
        <div className="flex justify-center gap-2 mb-10">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c as string)}
              className={`px-5 py-2 rounded-full text-sm transition-all ${
                filter === c
                  ? "bg-[#9B6B6B] text-white"
                  : "bg-white text-[#8A7070] border border-[#E8DEDD] hover:border-[#9B6B6B]/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* マソンリー風グリッド — 1列目と3列目を少し高くして不均一に */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              className={`relative rounded-xl overflow-hidden bg-[#E8DEDD] group ${
                i % 3 === 1 ? "aspect-[3/4]" : "aspect-[4/5]"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              {item.slug ? (
                <Link href={`/portfolio-templates/velvet/styles/${item.slug}`} className="absolute inset-0 z-10" />
              ) : null}
              <Image
                src={GALLERY_IMAGES[i % GALLERY_IMAGES.length]}
                alt={item.caption || `スタイル ${i + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 sm:p-4">
                  <p className="text-white text-xs sm:text-sm">{item.caption}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* 一覧ページへのリンク */}
        <div className="text-center mt-10">
          <Link
            href="/portfolio-templates/velvet/styles"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#E8DEDD] text-[#9B6B6B] text-sm font-medium hover:bg-[#9B6B6B] hover:text-white transition-all"
          >
            すべてのスタイルを見る
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Menu — メニュー・料金
   ═══════════════════════════════════════ */
function MenuSection() {
  const [activeCategory, setActiveCategory] = useState("すべて");
  const filtered = activeCategory === "すべて" ? MENU_ITEMS : MENU_ITEMS.filter((m) => m.category === activeCategory);

  return (
    <section id="menu" className="py-20 sm:py-28 bg-white">
      <div className="max-w-[900px] mx-auto px-5">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#9B6B6B] text-xs tracking-[0.3em] mb-2 font-medium">MENU</p>
          <h2 className="text-[#3A2828] font-bold text-2xl sm:text-3xl mb-3">
            メニュー・料金
          </h2>
          <p className="text-[#8A7070] text-sm">すべて税込価格です。シャンプー・ブロー込み。</p>
        </motion.div>

        {/* カテゴリタブ */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {MENU_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-[#9B6B6B] text-white"
                  : "bg-white text-[#8A7070] border border-[#E8DEDD] hover:border-[#9B6B6B]/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* メニューリスト（名前...価格の横並び） */}
        <div className="space-y-1">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              className="flex items-start justify-between gap-4 py-5 border-b border-[#E8DEDD] last:border-b-0"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {item.isRecommended && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#9B6B6B]/10 text-[#9B6B6B] text-[10px] font-medium">
                      <Star className="w-2.5 h-2.5" fill="currentColor" />
                      人気
                    </span>
                  )}
                  <h3 className="text-[#3A2828] font-medium text-base">
                    {item.name}
                  </h3>
                </div>
                {item.description && (
                  <p className="text-[#8A7070] text-sm leading-relaxed mt-1">{item.description}</p>
                )}
              </div>
              <p className="text-[#9B6B6B] font-bold text-base whitespace-nowrap">
                {item.price}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-center text-[#8A7070] text-xs mt-8 pt-6 border-t border-[#E8DEDD]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          ※ 髪の長さ・状態により追加料金をいただく場合がございます。カウンセリング時にご説明いたします。
        </motion.p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   Staff — スタイリスト紹介
   ═══════════════════════════════════════ */
function StaffSection() {
  return (
    <section id="staff" className="py-20 sm:py-28 bg-[#FAF6F5]">
      <div className="max-w-[900px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#9B6B6B] text-xs tracking-[0.3em] mb-2 font-medium">STYLIST</p>
          <h2 className="text-[#3A2828] font-bold text-2xl sm:text-3xl">
            スタイリスト紹介
          </h2>
        </motion.div>

        {/* スタッフ: オーナーを大きく、他は横並び */}
        <div className="space-y-10">
          {STAFF.map((member, i) => (
            <motion.div
              key={member.id}
              className={`relative ${
                i === 0
                  ? "bg-white rounded-2xl border border-[#E8DEDD] p-8 sm:p-10"
                  : "bg-white rounded-2xl border border-[#E8DEDD] p-6 sm:p-8"
              } hover:border-[#9B6B6B]/30 hover:shadow-lg hover:shadow-[#9B6B6B]/5 transition-all`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {member.slug && (
                <Link href={`/portfolio-templates/velvet/staff/${member.slug}`} className="absolute inset-0 z-10 rounded-2xl" />
              )}
              <div className={`${i === 0 ? "sm:flex sm:gap-8" : "sm:flex sm:gap-6"}`}>
                {/* スタッフ写真 */}
                <div className="flex-shrink-0 mb-5 sm:mb-0">
                  <div className={`${
                    i === 0 ? "w-[140px] h-[180px]" : "w-[100px] h-[130px]"
                  } relative rounded-xl bg-gradient-to-b from-[#E8DEDD] to-[#DDD5D3] mx-auto sm:mx-0 overflow-hidden`}>
                    {i === 0 ? (
                      <Image
                        src="/images/templates/velvet/owner.jpg"
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="140px"
                      />
                    ) : (
                      <svg viewBox="0 0 140 180" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <rect width="140" height="180" fill="#E8DEDD" />
                        <circle cx="70" cy="60" r="25" fill="#C4B0AE" />
                        <ellipse cx="70" cy="140" rx="40" ry="38" fill="#C4B0AE" />
                      </svg>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-[#3A2828] font-bold text-lg">{member.name}</h3>
                    <span className="text-[#9B6B6B] text-xs px-3 py-1 rounded-full bg-[#9B6B6B]/8 font-medium">
                      {member.role}
                    </span>
                  </div>
                  {member.bio && (
                    <p className="text-[#8A7070] text-sm leading-[2]">{member.bio}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 一覧ページへのリンク */}
        <div className="text-center mt-10">
          <Link
            href="/portfolio-templates/velvet/staff"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#E8DEDD] text-[#9B6B6B] text-sm font-medium hover:bg-[#9B6B6B] hover:text-white transition-all"
          >
            スタイリスト詳細を見る
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   About — サロンについて + こだわり
   ═══════════════════════════════════════ */
function AboutSection() {
  return (
    <section id="about" className="py-20 sm:py-28 bg-white">
      <div className="max-w-[900px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#9B6B6B] text-xs tracking-[0.3em] mb-2 font-medium">ABOUT</p>
          <h2 className="text-[#3A2828] font-bold text-2xl sm:text-3xl">
            サロンについて
          </h2>
        </motion.div>

        {/* オーナー挨拶 */}
        <motion.div
          className="bg-[#FAF6F5] rounded-2xl border border-[#E8DEDD] p-8 sm:p-10 mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#9B6B6B] text-xs tracking-wider mb-4 font-medium">OWNER&apos;S MESSAGE</p>
          <div className="text-[#3A2828] text-sm sm:text-base leading-[2.2]">
            {COMPANY.bio.split("\n\n").map((para, i) => (
              <p key={i} className={i > 0 ? "mt-5" : ""}>{para}</p>
            ))}
          </div>
          <p className="text-right text-[#8A7070] text-sm mt-6">{COMPANY.ceoTitle}　{COMPANY.ceo}</p>
        </motion.div>

        {/* こだわり — 縦積みリスト */}
        <div className="space-y-8">
          {STRENGTHS.map((s, i) => {
            const Icon = ICON_MAP[s.icon || "Scissors"] || Scissors;
            return (
              <motion.div
                key={i}
                className="flex items-start gap-5"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-[#9B6B6B]/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-6 h-6 text-[#9B6B6B]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-[#3A2828] text-base mb-2">{s.title}</h3>
                  <p className="text-[#8A7070] text-sm leading-[1.9]">{s.description}</p>
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
   Info — サロン情報 + 地図
   ═══════════════════════════════════════ */
function InfoSection() {
  const displayName = usePreviewName(COMPANY.name);
  return (
    <section id="info" className="py-20 sm:py-28 bg-[#FAF6F5]">
      <div className="max-w-[1000px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#9B6B6B] text-xs tracking-[0.3em] mb-2 font-medium">ACCESS</p>
          <h2 className="text-[#3A2828] font-bold text-2xl sm:text-3xl">
            サロン情報
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 地図 */}
          <motion.div
            className="aspect-[4/3] rounded-xl overflow-hidden bg-[#E8DEDD]"
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
                title="サロンの地図"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-[#8A7070] mx-auto mb-2" />
                  <p className="text-[#8A7070] text-sm">Googleマップ</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* サロン情報テーブル */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white rounded-2xl border border-[#E8DEDD] overflow-hidden">
              <div className="divide-y divide-[#E8DEDD]">
                {[
                  { icon: null, label: "サロン名", value: displayName },
                  { icon: MapPin, label: "住所", value: COMPANY.address },
                  { icon: Phone, label: "電話", value: COMPANY.phone },
                  { icon: Clock, label: "営業時間", value: COMPANY.hours },
                  { icon: Mail, label: "メール", value: COMPANY.email },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row">
                    <div className="sm:w-28 px-5 py-3 bg-[#F5EFEE] text-[#8A7070] text-xs font-medium flex items-center gap-2">
                      {item.icon && <item.icon className="w-3.5 h-3.5" />}
                      {item.label}
                    </div>
                    <div className="flex-1 px-5 py-3 text-[#3A2828] text-sm whitespace-pre-line">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`tel:${COMPANY.phone}`}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#9B6B6B] text-white text-sm font-medium hover:bg-[#846060] transition-colors"
              >
                <Phone className="w-4 h-4" /> 電話で予約
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(COMPANY.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[#E8DEDD] text-[#8A7070] text-sm hover:border-[#9B6B6B]/30 transition-colors"
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
   Contact — ご予約
   ═══════════════════════════════════════ */
function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="contact" className="py-20 sm:py-28 bg-white">
      <div className="max-w-[800px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#9B6B6B] text-xs tracking-[0.3em] mb-2 font-medium">RESERVATION</p>
          <h2 className="text-[#3A2828] font-bold text-2xl sm:text-3xl mb-3">
            ご予約
          </h2>
          <p className="text-[#8A7070] text-sm">お電話でのご予約が確実です。初めての方もお気軽にどうぞ。</p>
        </motion.div>

        {/* 電話CTA */}
        <motion.div
          className="text-center mb-12 p-8 rounded-2xl bg-[#FAF6F5] border border-[#E8DEDD]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#9B6B6B] text-xs tracking-wider mb-3 font-medium">お電話でのご予約</p>
          <a
            href={`tel:${COMPANY.phone}`}
            className="inline-block text-[#3A2828] text-3xl sm:text-4xl font-bold tracking-wider hover:text-[#9B6B6B] transition-colors"
          >
            {COMPANY.phone}
          </a>
          <p className="text-[#8A7070] text-xs mt-2">10:00〜19:00（火曜定休）</p>
          <p className="text-[#8A7070] text-xs mt-1">※ 施術中は出られないことがございます。折り返しお電話いたします</p>
        </motion.div>

        {/* お問い合わせフォーム */}
        <motion.div
          className="bg-[#FAF6F5] rounded-2xl border border-[#E8DEDD] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="p-5 sm:p-6 bg-[#F0E8E7] border-b border-[#E8DEDD]">
            <h3 className="text-[#3A2828] font-bold text-base">
              メールでのお問い合わせ
            </h3>
          </div>

          {submitted ? (
            <div className="p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-[#9B6B6B]/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-[#9B6B6B]" />
              </div>
              <p className="text-[#3A2828] text-lg font-bold mb-2">お問い合わせありがとうございます</p>
              <p className="text-[#8A7070] text-sm">翌営業日までにご返信いたします。</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="p-6 sm:p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-[#8A7070] mb-2 font-medium">
                    お名前 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E8DEDD] text-[#3A2828] text-sm placeholder:text-[#C4B5B3] focus:outline-none focus:border-[#9B6B6B] focus:ring-2 focus:ring-[#9B6B6B]/10 transition-all"
                    placeholder="山田 花子"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8A7070] mb-2 font-medium">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E8DEDD] text-[#3A2828] text-sm placeholder:text-[#C4B5B3] focus:outline-none focus:border-[#9B6B6B] focus:ring-2 focus:ring-[#9B6B6B]/10 transition-all"
                    placeholder="090-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#8A7070] mb-2 font-medium">
                  メールアドレス <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white border border-[#E8DEDD] text-[#3A2828] text-sm placeholder:text-[#C4B5B3] focus:outline-none focus:border-[#9B6B6B] focus:ring-2 focus:ring-[#9B6B6B]/10 transition-all"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8A7070] mb-2 font-medium">
                  ご希望のメニュー
                </label>
                <div className="flex flex-wrap gap-2">
                  {["カット", "カラー", "パーマ", "トリートメント", "ヘッドスパ", "相談したい"].map((type) => (
                    <label key={type} className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E8DEDD] text-sm text-[#3A2828] cursor-pointer hover:border-[#9B6B6B]/30 hover:bg-[#9B6B6B]/5 transition-all has-[:checked]:bg-[#9B6B6B]/10 has-[:checked]:border-[#9B6B6B]/30 has-[:checked]:text-[#9B6B6B]">
                      <input type="checkbox" name="menu" value={type} className="sr-only" />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#8A7070] mb-2 font-medium">
                  ご希望の日時・ご質問など
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-white border border-[#E8DEDD] text-[#3A2828] text-sm placeholder:text-[#C4B5B3] focus:outline-none focus:border-[#9B6B6B] focus:ring-2 focus:ring-[#9B6B6B]/10 transition-all resize-none"
                  placeholder="例：5月10日（土）の午前中を希望します。カットとカラーをお願いしたいです。"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-lg bg-[#9B6B6B] text-white font-bold text-sm tracking-wider hover:bg-[#846060] transition-colors"
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
    <footer className="py-10 bg-[#3A2828] pb-24 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-[#C4956A]" strokeWidth={1.5} />
            <p className="text-white font-bold text-sm">
              {displayName}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            {[
              { label: "スタイル", href: "#gallery" },
              { label: "メニュー", href: "#menu" },
              { label: "スタイリスト", href: "#staff" },
              { label: "サロンについて", href: "#about" },
              { label: "アクセス", href: "#info" },
              { label: "ご予約", href: "#contact" },
            ].map(({ label, href }) => (
              <a key={href} href={href} className="text-white/50 text-xs hover:text-white transition-colors">
                {label}
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
export default function VelvetPage() {
  return (
    <>
      <DemoBanner />
      <Header />
      <main>
        <HeroSection />
        <GallerySection />
        <MenuSection />
        <StaffSection />
        <AboutSection />
        <InfoSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
