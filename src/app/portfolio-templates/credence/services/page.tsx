"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calculator,
  FileText,
  Building2,
  Scale,
  Briefcase,
  Users,
  Phone,
  ChevronRight,
  Star,
  Shield,
  X,
  Menu,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, Service } from "@/lib/site-config-schema";
import { usePreviewName } from "@/lib/use-preview-name";
import siteConfig from "../site.config.json";

const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const SERVICES = (config.services || []) as Service[];

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

/* ═══════════════════════════════════════
   Header（サブページ用）
   ═══════════════════════════════════════ */
function SubHeader() {
  const displayName = usePreviewName(COMPANY.name);
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: "トップ", href: "/portfolio-templates/credence" },
    { label: "取扱業務", href: "/portfolio-templates/credence/services" },
    { label: "解決事例", href: "/portfolio-templates/credence/cases" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F7F6F3]/95 backdrop-blur-md shadow-sm">
        <div className="max-w-[1200px] mx-auto px-5 h-16 flex items-center justify-between">
          <Link
            href="/portfolio-templates/credence"
            className="flex items-center gap-2"
          >
            <p
              className="font-bold text-sm tracking-wide text-[#1A1A1A]"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              {displayName}
            </p>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-[#6B6B6B] hover:text-[#2B4C3F] transition-colors"
              >
                {item.label}
              </Link>
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

            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2"
              aria-label="menu"
            >
              {open ? (
                <X className="w-5 h-5 text-[#1A1A1A]" />
              ) : (
                <Menu className="w-5 h-5 text-[#1A1A1A]" />
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
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 px-4 text-[#1A1A1A] text-base rounded-lg hover:bg-[#2B4C3F]/5 transition-colors"
                >
                  {item.label}
                </Link>
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
   パンくずナビ
   ═══════════════════════════════════════ */
function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="flex items-center gap-2 text-xs text-[#6B6B6B]">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <ChevronRight className="w-3 h-3" />}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-[#2B4C3F] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[#1A1A1A]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
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
            className="text-white font-bold text-sm"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            {displayName}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5">
            {[
              { label: "トップ", href: "/portfolio-templates/credence" },
              {
                label: "取扱業務",
                href: "/portfolio-templates/credence/services",
              },
              {
                label: "解決事例",
                href: "/portfolio-templates/credence/cases",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/50 text-xs hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-white/30 text-xs">
          <p>{COMPANY.address}</p>
          <p>
            &copy; {new Date().getFullYear()} {displayName}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════
   Page
   ═══════════════════════════════════════ */
export default function ServicesListPage() {
  return (
    <>
      <DemoBanner />
      <SubHeader />
      <main className="pt-16">
        {/* Page Header */}
        <section className="bg-[#2B4C3F] py-16 sm:py-20">
          <div className="max-w-[900px] mx-auto px-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Breadcrumb
                items={[
                  {
                    label: "トップ",
                    href: "/portfolio-templates/credence",
                  },
                  { label: "取扱業務" },
                ]}
              />
              <div className="mt-4">
                <p className="text-[#8B7355] text-xs tracking-[0.3em] mb-2 font-medium">
                  SERVICES
                </p>
                <h1
                  className="text-white font-bold text-2xl sm:text-3xl"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  取扱業務
                </h1>
                <p className="text-white/60 text-sm mt-3 max-w-[500px] leading-relaxed">
                  法人税務から相続税、創業支援まで。税理士歴22年の実績をもとに、幅広い税務サービスを提供しています。
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 初回相談無料バナー */}
        <section className="bg-[#8B7355] py-3">
          <div className="max-w-[900px] mx-auto px-5 flex items-center justify-center gap-2">
            <Star className="w-3.5 h-3.5 text-white/80" />
            <p className="text-white text-sm font-medium tracking-wider">
              初回ご相談（60分）無料
            </p>
          </div>
        </section>

        {/* Services List */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-[900px] mx-auto px-5">
            <div className="grid gap-6">
              {SERVICES.map((service, i) => {
                const Icon =
                  ICON_MAP[service.icon || "FileText"] || FileText;
                const hasDetail = !!service.slug;

                const cardContent = (
                      <div className="flex items-start gap-5">
                        <div className="w-12 h-12 rounded-xl bg-[#2B4C3F]/8 flex items-center justify-center flex-shrink-0">
                          <Icon
                            className="w-6 h-6 text-[#2B4C3F]"
                            strokeWidth={1.5}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <h2
                              className="font-bold text-[#1A1A1A] text-lg sm:text-xl"
                              style={{
                                fontFamily: "'Noto Serif JP', serif",
                              }}
                            >
                              {service.title}
                            </h2>
                            {hasDetail && (
                              <ChevronRight className="w-5 h-5 text-[#6B6B6B] flex-shrink-0 mt-1 group-hover:text-[#2B4C3F] transition-colors" />
                            )}
                          </div>
                          <p className="text-[#6B6B6B] text-sm leading-[1.9] mt-2">
                            {service.description}
                          </p>
                          {service.price && (
                            <p
                              className="text-[#2B4C3F] font-bold text-sm mt-3"
                              style={{
                                fontFamily: "'Noto Serif JP', serif",
                              }}
                            >
                              {service.price}
                            </p>
                          )}
                        </div>
                      </div>
                );

                const cardClass = `block bg-[#F7F6F3] rounded-2xl border border-[#E0DDD8] p-6 sm:p-8 transition-all ${
                  hasDetail
                    ? "hover:border-[#2B4C3F]/30 hover:shadow-md cursor-pointer group"
                    : ""
                }`;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                  >
                    {hasDetail ? (
                      <Link href={`/portfolio-templates/credence/services/${service.slug}`} className={cardClass}>
                        {cardContent}
                      </Link>
                    ) : (
                      <div className={cardClass}>
                        {cardContent}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* CTA */}
            <motion.div
              className="mt-14 p-8 sm:p-10 rounded-2xl bg-[#F7F6F3] border border-[#E0DDD8] text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p
                className="text-[#1A1A1A] font-bold text-lg sm:text-xl mb-2"
                style={{ fontFamily: "'Noto Serif JP', serif" }}
              >
                どの業務に該当するかわからない場合も、お気軽にご相談ください
              </p>
              <p className="text-[#6B6B6B] text-sm mb-6">
                初回60分のご相談は無料です。現在の状況をお伺いし、最適なサポートをご提案します。
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`tel:${COMPANY.phone}`}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[#2B4C3F] text-white font-medium text-sm hover:bg-[#1F3A30] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {COMPANY.phone}
                </a>
                <Link
                  href="/portfolio-templates/credence#contact"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-[#E0DDD8] text-[#6B6B6B] text-sm hover:border-[#2B4C3F]/30 transition-colors"
                >
                  メールで問い合わせ
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
