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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, Project } from "@/lib/site-config-schema";
import { usePreviewName } from "@/lib/use-preview-name";
import siteConfig from "../site.config.json";

const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const PROJECTS = (config.projects || []) as Project[];

/* カテゴリ一覧を抽出 */
const CATEGORIES = Array.from(new Set(PROJECTS.map((p) => p.category)));

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
   Works List Page
   ═══════════════════════════════════════ */
export default function WorksPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? PROJECTS.filter((p) => p.category === activeCategory)
    : PROJECTS;

  return (
    <>
      <DemoBanner />
      <Header />
      <main className="pt-16">
        {/* Page Header */}
        <section className="py-16 sm:py-24 bg-[#FAFAFA]">
          <div className="max-w-[1100px] mx-auto px-5">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[#B8956A] text-xs tracking-[0.3em] mb-2">WORKS</p>
              <h1
                className="text-[#1A1A1A] text-2xl sm:text-3xl mb-4"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
              >
                作品一覧
              </h1>
              <p className="text-[#888888] text-sm max-w-[480px] mx-auto leading-relaxed">
                これまでに撮影した作品の一部をご紹介します。
              </p>
            </motion.div>

            {/* Category Filter */}
            <motion.div
              className="flex flex-wrap justify-center gap-2 mt-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-5 py-2 rounded-full text-xs tracking-wider transition-all ${
                  activeCategory === null
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-white text-[#888888] border border-[#E5E5E5] hover:border-[#B8956A]/40 hover:text-[#1A1A1A]"
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs tracking-wider transition-all ${
                    activeCategory === cat
                      ? "bg-[#1A1A1A] text-white"
                      : "bg-white text-[#888888] border border-[#E5E5E5] hover:border-[#B8956A]/40 hover:text-[#1A1A1A]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Masonry Grid */}
        <section className="py-16 sm:py-20 bg-[#FAFAFA]">
          <div className="max-w-[1100px] mx-auto px-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory || "all"}
                className="columns-2 lg:columns-3 gap-4 space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {filtered.map((project, i) => {
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
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.06 }}
                    >
                      <Link
                        href={`/portfolio-templates/luminos/works/${slug}`}
                        className="group block"
                      >
                        <div className={`relative ${aspect} rounded-lg overflow-hidden bg-[#222]`}>
                          <Image
                            src={project.image || `/images/templates/luminos/work-${project.id}.jpg`}
                            alt={project.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(min-width: 1024px) 33vw, 50vw"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                          <div className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex items-center gap-2 text-white/70">
                              <span className="text-xs tracking-wider">View</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 mb-6">
                          <p className="text-[#888888] text-[10px] tracking-[0.15em]">
                            {project.category} — {project.year}
                          </p>
                          <h3
                            className="text-[#1A1A1A] text-sm mt-1"
                            style={{ fontWeight: 300 }}
                          >
                            {project.title}
                          </h3>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-[600px] mx-auto px-5 text-center">
            <p className="text-[#B8956A] text-xs tracking-[0.3em] mb-3">CONTACT</p>
            <h2
              className="text-[#1A1A1A] text-xl sm:text-2xl mb-4"
              style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
            >
              撮影のご依頼はこちら
            </h2>
            <p className="text-[#888888] text-sm mb-8 leading-relaxed">
              撮影内容やご予算に応じてプランをご提案します。まずはお気軽にご相談ください。
            </p>
            <Link
              href="/portfolio-templates/luminos#contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[#1A1A1A] text-white text-sm tracking-wider hover:bg-[#333] transition-colors"
            >
              お問い合わせ
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </>
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
