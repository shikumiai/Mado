"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Heart,
  Stethoscope,
  Shield,
  Clock,
  Phone,
  Mail,
  MapPin,
  X,
  Menu,
  Send,
  Check,
  Calendar,
  User,
  Building2,
  Activity,
} from "lucide-react";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, Service, StaffMember } from "@/lib/site-config-schema";
import { usePreviewName } from "@/lib/use-preview-name";
import siteConfig from "./site.config.json";

/* ═══════════════════════════════════════
   データ読み込み
   ═══════════════════════════════════════ */
const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const SERVICES = (config.services || []) as Service[];
const STAFF = (config.staff || []) as StaffMember[];
const STRENGTHS = config.strengths || [];

const ICON_MAP: Record<string, typeof Heart> = {
  Heart,
  Stethoscope,
  Shield,
  Clock,
  Calendar,
  Activity,
  MapPin,
  User,
  Building2,
};

/* ═══════════════════════════════════════
   診療時間テーブルデータ
   ═══════════════════════════════════════ */
const SCHEDULE = [
  { day: "月", am: true, pm: true },
  { day: "火", am: true, pm: true },
  { day: "水", am: true, pm: true },
  { day: "木", am: true, pm: true },
  { day: "金", am: true, pm: true },
  { day: "土", am: true, pm: false },
  { day: "日", am: false, pm: false },
  { day: "祝", am: false, pm: false },
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
    { label: "診療科目", href: "#services" },
    { label: "医師紹介", href: "#staff" },
    { label: "診療時間", href: "#info" },
    { label: "当院について", href: "#about" },
    { label: "ご予約", href: "#contact" },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}>
        <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2E7D8C] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <p className={`font-bold text-sm tracking-wide transition-colors ${scrolled ? "text-[#1A2E33]" : "text-[#1A2E33]"}`}>
              {displayName}
            </p>
          </a>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-sm text-[#5A7A82] hover:text-[#2E7D8C] transition-colors">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${COMPANY.phone}`}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2E7D8C] text-white text-sm font-medium hover:bg-[#24656F] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="tracking-wider">{COMPANY.phone}</span>
            </a>

            <button onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="メニュー">
              {open ? (
                <X className="w-5 h-5 text-[#1A2E33]" />
              ) : (
                <Menu className="w-5 h-5 text-[#1A2E33]" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              className="lg:hidden bg-white border-t border-[#D8E8EC] px-5 py-5 space-y-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 px-4 text-[#1A2E33] text-base rounded-lg hover:bg-[#2E7D8C]/5 transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={`tel:${COMPANY.phone}`}
                className="block mt-3 text-center py-3.5 rounded-lg bg-[#2E7D8C] text-white font-medium"
              >
                <Phone className="w-4 h-4 inline mr-2" />{COMPANY.phone}
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* SP固定フッター — 今すぐ電話 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#2E7D8C] safe-area-bottom">
        <a href={`tel:${COMPANY.phone}`} className="flex items-center justify-center gap-2 py-3.5 text-white font-bold text-base">
          <Phone className="w-5 h-5" /> 今すぐ電話
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
          src="/images/templates/clarity/hero.jpg"
          alt="クリニック外観"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/20" />
      </motion.div>

      <motion.div
        className="relative z-10 h-full flex flex-col justify-center max-w-[1200px] mx-auto px-5"
        style={{ opacity }}
      >
        {/* web予約受付中バッジ */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2E7D8C]/10 border border-[#2E7D8C]/20 w-fit mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Calendar className="w-3 h-3 text-[#2E7D8C]" />
          <span className="text-[#2E7D8C] text-xs tracking-wider font-medium">web予約受付中</span>
        </motion.div>

        <motion.h1
          className="text-[#1A2E33] font-bold leading-[1.3] mb-4"
          style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          {COMPANY.tagline}
        </motion.h1>

        <motion.p
          className="text-[#5A7A82] text-sm sm:text-base max-w-[520px] leading-relaxed mb-8"
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
          <a href="#contact" className="px-8 py-3.5 rounded-lg bg-[#2E7D8C] text-white font-medium text-sm hover:bg-[#24656F] transition-colors text-center shadow-lg shadow-[#2E7D8C]/20">
            ご予約はこちら
          </a>
          <a href="#services" className="px-8 py-3.5 rounded-lg bg-white border border-[#D8E8EC] text-[#1A2E33] text-sm hover:bg-[#F5F9FA] transition-colors text-center">
            診療科目を見る
          </a>
        </motion.div>

        {/* 特長バッジ */}
        <motion.div
          className="flex flex-wrap gap-3 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {STRENGTHS.map((s, i) => {
            const Icon = ICON_MAP[s.icon || "Check"] || Check;
            return (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-[#D8E8EC] text-sm text-[#1A2E33]">
                <Icon className="w-3.5 h-3.5 text-[#2E7D8C]" />
                {s.title}
              </div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════
   診療科目
   ═══════════════════════════════════════ */
function ServicesSection() {
  return (
    <section id="services" className="py-20 sm:py-28 bg-white">
      <div className="max-w-[1000px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#2E7D8C] text-xs tracking-[0.3em] mb-2 font-medium">SERVICES</p>
          <h2 className="text-[#1A2E33] font-bold text-2xl sm:text-3xl mb-3">
            診療科目
          </h2>
          <p className="text-[#5A7A82] text-sm">幅広い症状に対応しています。お気軽にご相談ください。</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((service, i) => {
            const Icon = ICON_MAP[service.icon || "Stethoscope"] || Stethoscope;
            const slug = (service as unknown as Record<string, unknown>).slug as string | undefined;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link
                  href={slug ? `/portfolio-templates/clarity/departments/${slug}` : "/portfolio-templates/clarity/departments"}
                  className="block bg-[#F5F9FA] rounded-2xl border border-[#D8E8EC] p-6 hover:shadow-md hover:shadow-[#2E7D8C]/5 hover:border-[#5BA4B5]/40 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#2E7D8C]/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#2E7D8C]" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-[#1A2E33] text-base mb-2 group-hover:text-[#2E7D8C] transition-colors">{service.title}</h3>
                  <p className="text-[#5A7A82] text-sm leading-[1.9]">{service.description}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   医師紹介
   ═══════════════════════════════════════ */
function StaffSection() {
  return (
    <section id="staff" className="py-20 sm:py-28 bg-[#F5F9FA]">
      <div className="max-w-[900px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#2E7D8C] text-xs tracking-[0.3em] mb-2 font-medium">STAFF</p>
          <h2 className="text-[#1A2E33] font-bold text-2xl sm:text-3xl">
            スタッフ紹介
          </h2>
        </motion.div>

        <div className="space-y-6">
          {STAFF.map((member, i) => {
            const slug = (member as unknown as Record<string, unknown>).slug as string | undefined;
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={slug ? `/portfolio-templates/clarity/doctors/${slug}` : "/portfolio-templates/clarity/doctors"}
                  className={`block bg-white rounded-2xl border border-[#D8E8EC] overflow-hidden hover:shadow-md hover:shadow-[#2E7D8C]/5 hover:border-[#5BA4B5]/40 transition-all group ${i === 0 ? "p-8 sm:p-10" : "p-6 sm:p-8"}`}
                >
                  <div className={`${i === 0 ? "sm:flex sm:gap-8" : "sm:flex sm:gap-6"}`}>
                    {/* スタッフ写真 */}
                    <div className="flex-shrink-0 mb-6 sm:mb-0">
                      <div className={`relative ${i === 0 ? "w-[160px] h-[200px]" : "w-[100px] h-[120px]"} rounded-xl mx-auto sm:mx-0 overflow-hidden`}>
                        {i === 0 ? (
                          <Image
                            src="/images/templates/clarity/doctor.jpg"
                            alt={member.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-b from-[#D8E8EC] to-[#C5D9DD] flex items-center justify-center">
                            <User className="w-8 h-8 text-[#B0CDD3]" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 rounded-full bg-[#2E7D8C]/10 text-[#2E7D8C] text-xs font-medium">
                          {member.role}
                        </span>
                      </div>
                      <h3 className={`font-bold text-[#1A2E33] mb-3 group-hover:text-[#2E7D8C] transition-colors ${i === 0 ? "text-xl" : "text-base"}`}>
                        {member.name}
                      </h3>
                      {member.bio && (
                        <p className="text-[#5A7A82] text-sm leading-[2]">
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   診療時間・アクセス
   ═══════════════════════════════════════ */
function InfoSection() {
  const displayName = usePreviewName(COMPANY.name);

  return (
    <section id="info" className="py-20 sm:py-28 bg-white">
      <div className="max-w-[1000px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#2E7D8C] text-xs tracking-[0.3em] mb-2 font-medium">INFORMATION</p>
          <h2 className="text-[#1A2E33] font-bold text-2xl sm:text-3xl">
            診療時間・アクセス
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 診療時間テーブル */}
          <motion.div
            className="bg-[#F5F9FA] rounded-2xl border border-[#D8E8EC] overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="p-5 bg-[#2E7D8C] text-white">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Clock className="w-4 h-4" /> 診療時間
              </h3>
            </div>

            <div className="p-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#5A7A82]">
                    <th className="py-2 text-left font-medium">曜日</th>
                    <th className="py-2 text-center font-medium">午前<br /><span className="text-xs font-normal">9:00-12:30</span></th>
                    <th className="py-2 text-center font-medium">午後<br /><span className="text-xs font-normal">15:00-18:30</span></th>
                  </tr>
                </thead>
                <tbody>
                  {SCHEDULE.map((row) => (
                    <tr key={row.day} className="border-t border-[#D8E8EC]">
                      <td className="py-3 text-[#1A2E33] font-medium">{row.day}</td>
                      <td className="py-3 text-center">
                        {row.am ? (
                          <span className="text-[#2E7D8C] font-bold">○</span>
                        ) : (
                          <span className="text-[#5A7A82]">×</span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {row.pm ? (
                          <span className="text-[#2E7D8C] font-bold">○</span>
                        ) : (
                          <span className="text-[#5A7A82]">×</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="text-[#5A7A82] text-xs mt-4 pt-4 border-t border-[#D8E8EC]">
                ※ 受付は診療終了の30分前までです。<br />
                ※ 臨時休診はお知らせにてご案内します。
              </p>
            </div>
          </motion.div>

          {/* アクセス情報 */}
          <div className="space-y-5">
            {/* 地図 */}
            <motion.div
              className="aspect-[4/3] rounded-xl overflow-hidden bg-[#D8E8EC]"
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
                  title="クリニックの地図"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-[#5A7A82] mx-auto mb-2" />
                    <p className="text-[#5A7A82] text-sm">Googleマップ</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* 基本情報 */}
            <motion.div
              className="bg-[#F5F9FA] rounded-2xl border border-[#D8E8EC] overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="divide-y divide-[#D8E8EC]">
                {[
                  { icon: Building2, label: "医院名", value: displayName },
                  { icon: MapPin, label: "住所", value: COMPANY.address },
                  { icon: Phone, label: "電話", value: COMPANY.phone },
                  { icon: Mail, label: "メール", value: COMPANY.email },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row">
                    <div className="sm:w-24 px-5 py-3 bg-[#EDF5F7] text-[#5A7A82] text-xs font-medium flex items-center gap-2">
                      <item.icon className="w-3.5 h-3.5" />
                      {item.label}
                    </div>
                    <div className="flex-1 px-5 py-3 text-[#1A2E33] text-sm">{item.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   当院について
   ═══════════════════════════════════════ */
function AboutSection() {
  return (
    <section id="about" className="py-20 sm:py-28 bg-[#F5F9FA]">
      <div className="max-w-[900px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#2E7D8C] text-xs tracking-[0.3em] mb-2 font-medium">ABOUT</p>
          <h2 className="text-[#1A2E33] font-bold text-2xl sm:text-3xl">
            当院について
          </h2>
        </motion.div>

        {/* 院内写真 */}
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <motion.div
            className="relative h-[200px] sm:h-[240px] rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Image
              src="/images/templates/clarity/clinic.jpg"
              alt="クリニック内観"
              fill
              className="object-cover"
            />
          </motion.div>
          <motion.div
            className="relative h-[200px] sm:h-[240px] rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Image
              src="/images/templates/clarity/reception.jpg"
              alt="受付"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>

        {/* 院長メッセージ */}
        <motion.div
          className="bg-white rounded-2xl border border-[#D8E8EC] p-8 sm:p-10 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="sm:flex sm:gap-8">
            <div className="flex-shrink-0 mb-6 sm:mb-0">
              <div className="relative w-[140px] h-[180px] rounded-xl mx-auto sm:mx-0 overflow-hidden">
                <Image
                  src="/images/templates/clarity/doctor.jpg"
                  alt="院長"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-center text-[#5A7A82] text-xs mt-2">{COMPANY.ceoTitle}</p>
              <p className="text-center text-[#1A2E33] text-sm font-medium">{COMPANY.ceo}</p>
            </div>

            <div className="text-[#1A2E33] text-sm sm:text-base leading-[2.2]">
              {COMPANY.bio.split("\n\n").map((para, i) => (
                <p key={i} className={i > 0 ? "mt-5" : ""}>{para}</p>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 当院の特長 */}
        <div className="space-y-6">
          {STRENGTHS.map((s, i) => {
            const Icon = ICON_MAP[s.icon || "Check"] || Check;
            return (
              <motion.div
                key={i}
                className="flex items-start gap-5"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-[#2E7D8C]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-6 h-6 text-[#2E7D8C]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A2E33] text-base mb-2">{s.title}</h3>
                  <p className="text-[#5A7A82] text-sm leading-[1.9]">{s.description}</p>
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
   ご予約
   ═══════════════════════════════════════ */
function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="contact" className="py-20 sm:py-28 bg-white">
      <div className="max-w-[800px] mx-auto px-5">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#2E7D8C] text-xs tracking-[0.3em] mb-2 font-medium">RESERVATION</p>
          <h2 className="text-[#1A2E33] font-bold text-2xl sm:text-3xl mb-3">
            ご予約・お問い合わせ
          </h2>
          <p className="text-[#5A7A82] text-sm">お電話またはフォームからご予約いただけます。</p>
        </motion.div>

        {/* 電話CTA */}
        <motion.div
          className="text-center mb-12 p-8 rounded-2xl bg-[#F5F9FA] border border-[#D8E8EC]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[#2E7D8C] text-xs tracking-wider mb-3 font-medium">お電話でのご予約</p>
          <a
            href={`tel:${COMPANY.phone}`}
            className="inline-block text-[#1A2E33] text-3xl sm:text-4xl font-bold tracking-wider hover:text-[#2E7D8C] transition-colors"
          >
            {COMPANY.phone}
          </a>
          <p className="text-[#5A7A82] text-xs mt-2">{COMPANY.hours.split("\n")[0]}</p>
        </motion.div>

        {/* お問い合わせフォーム */}
        <motion.div
          className="bg-[#F5F9FA] rounded-2xl border border-[#D8E8EC] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="p-5 sm:p-6 bg-[#EDF5F7] border-b border-[#D8E8EC]">
            <h3 className="text-[#1A2E33] font-bold text-base">
              お問い合わせフォーム
            </h3>
          </div>

          {submitted ? (
            <div className="p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-[#2E7D8C]/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-[#2E7D8C]" />
              </div>
              <p className="text-[#1A2E33] text-lg font-bold mb-2">お問い合わせありがとうございます</p>
              <p className="text-[#5A7A82] text-sm">翌診療日までにご連絡いたします。</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="p-6 sm:p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-[#5A7A82] mb-2 font-medium">
                    お名前 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#D8E8EC] text-[#1A2E33] text-sm placeholder:text-[#A0BFC7] focus:outline-none focus:border-[#2E7D8C] focus:ring-2 focus:ring-[#2E7D8C]/10 transition-all"
                    placeholder="山田 太郎"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#5A7A82] mb-2 font-medium">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#D8E8EC] text-[#1A2E33] text-sm placeholder:text-[#A0BFC7] focus:outline-none focus:border-[#2E7D8C] focus:ring-2 focus:ring-[#2E7D8C]/10 transition-all"
                    placeholder="090-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#5A7A82] mb-2 font-medium">
                  メールアドレス <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white border border-[#D8E8EC] text-[#1A2E33] text-sm placeholder:text-[#A0BFC7] focus:outline-none focus:border-[#2E7D8C] focus:ring-2 focus:ring-[#2E7D8C]/10 transition-all"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-xs text-[#5A7A82] mb-2 font-medium">
                  お問い合わせ種別
                </label>
                <div className="flex flex-wrap gap-2">
                  {["診療予約", "健康診断", "予防接種", "その他"].map((type) => (
                    <label key={type} className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#D8E8EC] text-sm text-[#1A2E33] cursor-pointer hover:border-[#2E7D8C]/30 hover:bg-[#2E7D8C]/5 transition-all has-[:checked]:bg-[#2E7D8C]/10 has-[:checked]:border-[#2E7D8C]/30 has-[:checked]:text-[#2E7D8C]">
                      <input type="radio" name="type" value={type} className="sr-only" />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#5A7A82] mb-2 font-medium">
                  ご希望の日時・症状・ご質問など
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-white border border-[#D8E8EC] text-[#1A2E33] text-sm placeholder:text-[#A0BFC7] focus:outline-none focus:border-[#2E7D8C] focus:ring-2 focus:ring-[#2E7D8C]/10 transition-all resize-none"
                  placeholder="例：4月20日（土）午前中に健康診断を受けたいです。"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-lg bg-[#2E7D8C] text-white font-bold text-sm tracking-wider hover:bg-[#24656F] transition-colors"
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
    <footer className="py-10 bg-[#1A2E33] pb-24 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#2E7D8C] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <p className="text-white font-bold text-sm">{displayName}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            {[
              { label: "診療科目", href: "#services" },
              { label: "医師紹介", href: "#staff" },
              { label: "診療時間", href: "#info" },
              { label: "当院について", href: "#about" },
              { label: "ご予約", href: "#contact" },
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
export default function ClarityPage() {
  return (
    <>
      <DemoBanner />
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <StaffSection />
        <InfoSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
