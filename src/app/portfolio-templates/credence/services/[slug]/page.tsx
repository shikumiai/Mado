"use client";

import { use } from "react";
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
  ChevronLeft,
  Star,
  Shield,
  Check,
  HelpCircle,
  X,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, Service } from "@/lib/site-config-schema";
import { usePreviewName } from "@/lib/use-preview-name";
import siteConfig from "../../site.config.json";

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
    <nav className="flex items-center gap-2 text-xs text-white/50">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <ChevronRight className="w-3 h-3" />}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-white/80 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-white/90">{item.label}</span>
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
export default function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const serviceIndex = SERVICES.findIndex((s) => s.slug === slug);
  const service = SERVICES[serviceIndex];

  if (!service) {
    return (
      <>
        <DemoBanner />
        <SubHeader />
        <main className="pt-16 min-h-screen bg-[#F7F6F3] flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#6B6B6B] text-lg mb-4">
              業務が見つかりませんでした
            </p>
            <Link
              href="/portfolio-templates/credence/services"
              className="text-[#2B4C3F] text-sm font-medium hover:underline"
            >
              取扱業務一覧に戻る
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const Icon = ICON_MAP[service.icon || "FileText"] || FileText;
  const prevService = serviceIndex > 0 ? SERVICES[serviceIndex - 1] : null;
  const nextService =
    serviceIndex < SERVICES.length - 1 ? SERVICES[serviceIndex + 1] : null;

  const targetAudience = Array.isArray(service.targetAudience)
    ? service.targetAudience
    : service.targetAudience
      ? [service.targetAudience]
      : [];

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
                  {
                    label: "取扱業務",
                    href: "/portfolio-templates/credence/services",
                  },
                  { label: service.title },
                ]}
              />
              <div className="mt-4 flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <h1
                    className="text-white font-bold text-2xl sm:text-3xl"
                    style={{ fontFamily: "'Noto Serif JP', serif" }}
                  >
                    {service.title}
                  </h1>
                  {service.price && (
                    <p className="text-[#8B7355] text-sm font-medium mt-2">
                      {service.price}
                    </p>
                  )}
                </div>
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

        {/* Content */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-[800px] mx-auto px-5">
            {/* Description */}
            <motion.div
              className="mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-[#1A1A1A] text-base sm:text-lg leading-[2.2]">
                {service.description}
              </p>
            </motion.div>

            {/* Target Audience */}
            {targetAudience.length > 0 && (
              <motion.div
                className="mb-14"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2
                  className="text-[#1A1A1A] font-bold text-xl sm:text-2xl mb-6"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  こんな方におすすめ
                </h2>
                <div className="bg-[#F7F6F3] rounded-2xl border border-[#E0DDD8] p-6 sm:p-8">
                  <ul className="space-y-4">
                    {targetAudience.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-[#1A1A1A] text-sm sm:text-base"
                      >
                        <Check className="w-5 h-5 text-[#2B4C3F] flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Steps */}
            {service.steps && service.steps.length > 0 && (
              <motion.div
                className="mb-14"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2
                  className="text-[#1A1A1A] font-bold text-xl sm:text-2xl mb-6"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  サービスの流れ
                </h2>
                <div className="space-y-0">
                  {service.steps.map((step, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-5 relative"
                    >
                      {/* Timeline line */}
                      {i < service.steps!.length - 1 && (
                        <div className="absolute left-[19px] top-10 bottom-0 w-px bg-[#E0DDD8]" />
                      )}
                      {/* Step number */}
                      <div className="w-10 h-10 rounded-full bg-[#2B4C3F] text-white flex items-center justify-center text-sm font-bold flex-shrink-0 relative z-10">
                        {i + 1}
                      </div>
                      {/* Step content */}
                      <div className="flex-1 pb-8">
                        <p
                          className="text-[#1A1A1A] font-bold text-base sm:text-lg pt-2"
                          style={{
                            fontFamily: "'Noto Serif JP', serif",
                          }}
                        >
                          {step}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Pricing */}
            {service.price && (
              <motion.div
                className="mb-14"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2
                  className="text-[#1A1A1A] font-bold text-xl sm:text-2xl mb-6"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  料金目安
                </h2>
                <div className="bg-[#F7F6F3] rounded-2xl border border-[#E0DDD8] p-6 sm:p-8">
                  <p
                    className="text-[#2B4C3F] font-bold text-2xl sm:text-3xl"
                    style={{ fontFamily: "'Noto Serif JP', serif" }}
                  >
                    {service.price}
                  </p>
                  <p className="text-[#6B6B6B] text-xs mt-3">
                    ※
                    表示価格はすべて税抜です。事業規模やご依頼内容に応じてお見積もりいたします。
                  </p>
                </div>
              </motion.div>
            )}

            {/* FAQ */}
            {service.faq && service.faq.length > 0 && (
              <motion.div
                className="mb-14"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2
                  className="text-[#1A1A1A] font-bold text-xl sm:text-2xl mb-6"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  よくある質問
                </h2>
                <div className="space-y-4">
                  {service.faq.map((item, i) => (
                    <div
                      key={i}
                      className="bg-[#F7F6F3] rounded-xl border border-[#E0DDD8] p-5 sm:p-6"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="w-6 h-6 rounded-full bg-[#2B4C3F] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          Q
                        </span>
                        <p className="text-[#1A1A1A] font-bold text-sm sm:text-base leading-relaxed">
                          {item.q}
                        </p>
                      </div>
                      <div className="flex items-start gap-3 pl-0 sm:pl-0">
                        <span className="w-6 h-6 rounded-full bg-[#8B7355] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          A
                        </span>
                        <p className="text-[#6B6B6B] text-sm leading-[1.9]">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* CTA */}
            <motion.div
              className="mb-14 p-8 sm:p-10 rounded-2xl bg-[#2B4C3F] text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Star className="w-5 h-5 text-[#8B7355] mx-auto mb-3" />
              <p
                className="text-white font-bold text-lg sm:text-xl mb-2"
                style={{ fontFamily: "'Noto Serif JP', serif" }}
              >
                無料相談を予約する
              </p>
              <p className="text-white/60 text-sm mb-6">
                初回60分のご相談は無料です。まずはお気軽にお電話ください。
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`tel:${COMPANY.phone}`}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[#8B7355] text-white font-medium text-sm hover:bg-[#7A6345] transition-colors shadow-lg shadow-[#8B7355]/20"
                >
                  <Phone className="w-4 h-4" />
                  {COMPANY.phone}
                </a>
                <Link
                  href="/portfolio-templates/credence#contact"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition-colors"
                >
                  メールで問い合わせ
                </Link>
              </div>
            </motion.div>

            {/* Prev/Next Navigation */}
            <div className="flex flex-col sm:flex-row gap-4">
              {prevService && prevService.slug ? (
                <Link
                  href={`/portfolio-templates/credence/services/${prevService.slug}`}
                  className="flex-1 flex items-center gap-3 p-5 rounded-xl border border-[#E0DDD8] hover:border-[#2B4C3F]/30 transition-colors group"
                >
                  <ChevronLeft className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#2B4C3F] transition-colors flex-shrink-0" />
                  <div>
                    <p className="text-[#6B6B6B] text-xs mb-1">前の業務</p>
                    <p
                      className="text-[#1A1A1A] text-sm font-bold"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {prevService.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
              {nextService && nextService.slug ? (
                <Link
                  href={`/portfolio-templates/credence/services/${nextService.slug}`}
                  className="flex-1 flex items-center justify-end gap-3 p-5 rounded-xl border border-[#E0DDD8] hover:border-[#2B4C3F]/30 transition-colors group text-right"
                >
                  <div>
                    <p className="text-[#6B6B6B] text-xs mb-1">次の業務</p>
                    <p
                      className="text-[#1A1A1A] text-sm font-bold"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {nextService.title}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#2B4C3F] transition-colors flex-shrink-0" />
                </Link>
              ) : (
                <div className="flex-1" />
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
