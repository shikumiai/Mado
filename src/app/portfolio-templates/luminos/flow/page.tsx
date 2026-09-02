"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  X,
  Menu as MenuIcon,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, FlowStep, FAQItem } from "@/lib/site-config-schema";
import { usePreviewName } from "@/lib/use-preview-name";
import siteConfig from "../site.config.json";

const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const FLOW_STEPS = (config.flow || []) as FlowStep[];
const FAQ_ITEMS = (config.faq || []) as FAQItem[];

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
    { label: "Service", href: "/portfolio-templates/luminos#services" },
    { label: "About", href: "/portfolio-templates/luminos#about" },
    { label: "Contact", href: "/portfolio-templates/luminos#contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white/95 backdrop-blur-md"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/portfolio-templates/luminos" className="flex items-center">
            <p
              className="text-sm tracking-[0.15em] text-[#1A1A1A]"
              style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
            >
              {displayName}
            </p>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs tracking-[0.15em] text-[#888888] hover:text-[#1A1A1A] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="メニュー">
            {open ? (
              <X className="w-5 h-5 text-[#1A1A1A]" />
            ) : (
              <MenuIcon className="w-5 h-5 text-[#1A1A1A]" />
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
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 px-4 text-[#1A1A1A] text-sm tracking-wider rounded-lg hover:bg-[#FAFAFA] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* SP fixed bottom phone bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A] safe-area-bottom">
        <a
          href={`tel:${COMPANY.phone}`}
          className="flex items-center justify-center gap-2 py-3.5 text-white text-sm tracking-wider"
        >
          <Phone className="w-4 h-4" /> お問い合わせ
        </a>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════
   FAQ Accordion Item
   ═══════════════════════════════════════ */
function FAQAccordion({ item, index }: { item: FAQItem; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="border-b border-[#E5E5E5] last:border-b-0"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start justify-between gap-4 py-6 text-left"
      >
        <div className="flex items-start gap-4">
          <span className="text-[#B8956A] text-xs tracking-wider mt-0.5 flex-shrink-0">Q.</span>
          <span
            className="text-[#1A1A1A] text-sm sm:text-base"
            style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
          >
            {item.question}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#888888] flex-shrink-0 mt-1 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-4 pb-6 pl-0">
              <span className="text-[#B8956A]/50 text-xs tracking-wider mt-0.5 flex-shrink-0">A.</span>
              <p
                className="text-[#888888] text-sm leading-[2]"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
              >
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
          <Link href="/portfolio-templates/luminos">
            <p
              className="text-white text-sm tracking-[0.15em]"
              style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
            >
              {displayName}
            </p>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { label: "Works", href: "/portfolio-templates/luminos/works" },
              { label: "Flow", href: "/portfolio-templates/luminos/flow" },
              { label: "Service", href: "/portfolio-templates/luminos#services" },
              { label: "About", href: "/portfolio-templates/luminos#about" },
              { label: "Contact", href: "/portfolio-templates/luminos#contact" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/40 text-xs tracking-wider hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
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
   Flow Page
   ═══════════════════════════════════════ */
export default function FlowPage() {
  return (
    <>
      <DemoBanner />
      <Header />
      <main className="pt-16">
        {/* Page Header */}
        <section className="py-16 sm:py-24 bg-[#FAFAFA]">
          <div className="max-w-[800px] mx-auto px-5">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[#B8956A] text-xs tracking-[0.3em] mb-2">FLOW</p>
              <h1
                className="text-[#1A1A1A] text-2xl sm:text-3xl mb-4"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
              >
                撮影の流れ
              </h1>
              <p className="text-[#888888] text-sm max-w-[480px] mx-auto leading-relaxed">
                お問い合わせから納品まで、撮影の進め方をご紹介します。
              </p>
            </motion.div>
          </div>
        </section>

        {/* Flow Steps */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-[700px] mx-auto px-5">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-0 bottom-0 w-px bg-[#E5E5E5] hidden sm:block" />

              <div className="space-y-0">
                {FLOW_STEPS.map((step, i) => (
                  <motion.div
                    key={step.step}
                    className="relative sm:pl-16 pb-12 last:pb-0"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    {/* Step number circle */}
                    <div className="hidden sm:flex absolute left-0 top-0 w-10 h-10 rounded-full border border-[#B8956A]/30 bg-white items-center justify-center z-10">
                      <span className="text-[#B8956A] text-xs tracking-wider">
                        {String(step.step).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Mobile step number */}
                    <div className="sm:hidden flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full border border-[#B8956A]/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#B8956A] text-[10px] tracking-wider">
                          {String(step.step).padStart(2, "0")}
                        </span>
                      </div>
                      <h3
                        className="text-[#1A1A1A] text-base"
                        style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
                      >
                        {step.title}
                      </h3>
                    </div>

                    {/* Desktop title */}
                    <h3
                      className="hidden sm:block text-[#1A1A1A] text-base mb-3"
                      style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
                    >
                      {step.title}
                    </h3>

                    <p
                      className="text-[#888888] text-sm leading-[2]"
                      style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
                    >
                      {step.description}
                    </p>

                    <p className="text-[#B8956A] text-xs tracking-wider mt-3">
                      {step.duration}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        {FAQ_ITEMS.length > 0 && (
          <section className="py-16 sm:py-20 bg-[#FAFAFA]">
            <div className="max-w-[700px] mx-auto px-5">
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-[#B8956A] text-xs tracking-[0.3em] mb-2">FAQ</p>
                <h2
                  className="text-[#1A1A1A] text-2xl sm:text-3xl"
                  style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
                >
                  よくある質問
                </h2>
              </motion.div>

              <div className="bg-white rounded-lg border border-[#E5E5E5] px-6 sm:px-8">
                {FAQ_ITEMS.map((item, i) => (
                  <FAQAccordion key={i} item={item} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-[600px] mx-auto px-5 text-center">
            <p className="text-[#B8956A] text-xs tracking-[0.3em] mb-3">CONTACT</p>
            <h2
              className="text-[#1A1A1A] text-xl sm:text-2xl mb-4"
              style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
            >
              お問い合わせ
            </h2>
            <p className="text-[#888888] text-sm mb-8 leading-relaxed">
              撮影のご依頼・ご相談はお電話またはフォームからお気軽にどうぞ。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`tel:${COMPANY.phone}`}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-[#E5E5E5] text-[#1A1A1A] text-sm tracking-wider hover:border-[#B8956A]/40 transition-colors"
              >
                <Phone className="w-4 h-4" />
                {COMPANY.phone}
              </a>
              <Link
                href="/portfolio-templates/luminos#contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[#1A1A1A] text-white text-sm tracking-wider hover:bg-[#333] transition-colors"
              >
                フォームから問い合わせ
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
