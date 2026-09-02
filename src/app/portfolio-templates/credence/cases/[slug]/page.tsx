"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Phone,
  ChevronRight,
  ChevronLeft,
  Star,
  ArrowRight,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  X,
  Menu,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, Case } from "@/lib/site-config-schema";
import { usePreviewName } from "@/lib/use-preview-name";
import siteConfig from "../../site.config.json";

const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const CASES = (config.cases || []) as Case[];

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
    <nav className="flex items-center flex-wrap gap-2 text-xs text-white/50">
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
export default function CaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const caseIndex = CASES.findIndex((c) => c.slug === slug);
  const caseItem = CASES[caseIndex];

  if (!caseItem) {
    return (
      <>
        <DemoBanner />
        <SubHeader />
        <main className="pt-16 min-h-screen bg-[#F7F6F3] flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#6B6B6B] text-lg mb-4">
              事例が見つかりませんでした
            </p>
            <Link
              href="/portfolio-templates/credence/cases"
              className="text-[#2B4C3F] text-sm font-medium hover:underline"
            >
              解決事例一覧に戻る
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const prevCase = caseIndex > 0 ? CASES[caseIndex - 1] : null;
  const nextCase =
    caseIndex < CASES.length - 1 ? CASES[caseIndex + 1] : null;

  const steps = [
    {
      icon: AlertCircle,
      label: "課題",
      color: "#B85C5C",
      bgColor: "#B85C5C",
      content: caseItem.challenge,
    },
    {
      icon: Lightbulb,
      label: "対応策",
      color: "#8B7355",
      bgColor: "#8B7355",
      content: caseItem.solution,
    },
    {
      icon: TrendingUp,
      label: "結果",
      color: "#2B4C3F",
      bgColor: "#2B4C3F",
      content: caseItem.result,
    },
  ];

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
                    label: "解決事例",
                    href: "/portfolio-templates/credence/cases",
                  },
                  { label: caseItem.title },
                ]}
              />
              <div className="mt-4">
                <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-3">
                  {caseItem.category}
                </span>
                <h1
                  className="text-white font-bold text-xl sm:text-2xl lg:text-3xl leading-tight"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  {caseItem.title}
                </h1>
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
            {/* Client Info */}
            <motion.div
              className="mb-10 flex items-center gap-3 p-4 rounded-xl bg-[#F7F6F3] border border-[#E0DDD8]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Building2 className="w-5 h-5 text-[#6B6B6B] flex-shrink-0" />
              <div>
                <p className="text-[#6B6B6B] text-xs mb-0.5">
                  クライアント
                </p>
                <p className="text-[#1A1A1A] text-sm font-medium">
                  {caseItem.client}
                </p>
              </div>
            </motion.div>

            {/* 3 Steps: Challenge → Solution → Result */}
            <div className="space-y-6 mb-14">
              {steps.map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <motion.div
                    key={i}
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                  >
                    {/* Connector arrow */}
                    {i > 0 && (
                      <div className="flex justify-center -mt-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-[#E0DDD8] flex items-center justify-center">
                          <ArrowRight
                            className="w-4 h-4 text-[#6B6B6B] rotate-90"
                          />
                        </div>
                      </div>
                    )}
                    <div className="bg-[#F7F6F3] rounded-2xl border border-[#E0DDD8] overflow-hidden">
                      {/* Step header */}
                      <div
                        className="px-6 py-4 flex items-center gap-3"
                        style={{ backgroundColor: `${step.bgColor}10` }}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${step.bgColor}15` }}
                        >
                          <StepIcon
                            className="w-5 h-5"
                            style={{ color: step.color }}
                            strokeWidth={1.5}
                          />
                        </div>
                        <h2
                          className="font-bold text-base"
                          style={{
                            color: step.color,
                            fontFamily: "'Noto Serif JP', serif",
                          }}
                        >
                          {step.label}
                        </h2>
                      </div>
                      {/* Step content */}
                      <div className="px-6 py-5">
                        <p className="text-[#1A1A1A] text-sm sm:text-base leading-[2.0]">
                          {step.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

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
                同じお悩みをお持ちの方へ
              </p>
              <p className="text-white/60 text-sm mb-6">
                お客様の状況に合わせた最適な解決策をご提案します。初回60分のご相談は無料です。
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
              {prevCase ? (
                <Link
                  href={`/portfolio-templates/credence/cases/${prevCase.slug}`}
                  className="flex-1 flex items-center gap-3 p-5 rounded-xl border border-[#E0DDD8] hover:border-[#2B4C3F]/30 transition-colors group"
                >
                  <ChevronLeft className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#2B4C3F] transition-colors flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[#6B6B6B] text-xs mb-1">前の事例</p>
                    <p
                      className="text-[#1A1A1A] text-sm font-bold truncate"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {prevCase.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
              {nextCase ? (
                <Link
                  href={`/portfolio-templates/credence/cases/${nextCase.slug}`}
                  className="flex-1 flex items-center justify-end gap-3 p-5 rounded-xl border border-[#E0DDD8] hover:border-[#2B4C3F]/30 transition-colors group text-right"
                >
                  <div className="min-w-0">
                    <p className="text-[#6B6B6B] text-xs mb-1">次の事例</p>
                    <p
                      className="text-[#1A1A1A] text-sm font-bold truncate"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {nextCase.title}
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
