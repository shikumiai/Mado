"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  X,
  Menu as MenuIcon,
  ArrowLeft,
  ArrowRight,
  MapPinIcon,
  CameraIcon,
  CalendarDays,
  MessageSquareQuote,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import DemoBanner from "@/components/portfolio-templates/DemoBanner";
import type { SiteConfig, Project } from "@/lib/site-config-schema";
import { usePreviewName } from "@/lib/use-preview-name";
import siteConfig from "../../site.config.json";

const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;
const PROJECTS = (config.projects || []) as Project[];

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
   Work Detail Page
   ═══════════════════════════════════════ */
export default function WorkDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  /* slug からプロジェクトを探す */
  const currentIndex = PROJECTS.findIndex(
    (p) => (p.slug || `work-${p.id}`) === slug,
  );

  const project = currentIndex >= 0 ? PROJECTS[currentIndex] : null;
  const prevProject = currentIndex > 0 ? PROJECTS[currentIndex - 1] : null;
  const nextProject = currentIndex < PROJECTS.length - 1 ? PROJECTS[currentIndex + 1] : null;

  if (!project) {
    return (
      <>
        <DemoBanner />
        <Header />
        <main className="pt-16">
          <div className="max-w-[800px] mx-auto px-5 py-32 text-center">
            <p className="text-[#B8956A] text-xs tracking-[0.3em] mb-4">NOT FOUND</p>
            <h1
              className="text-[#1A1A1A] text-2xl mb-6"
              style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
            >
              作品が見つかりませんでした
            </h1>
            <Link
              href="/portfolio-templates/luminos/works"
              className="inline-flex items-center gap-2 text-[#888888] text-sm hover:text-[#1A1A1A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              作品一覧に戻る
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <DemoBanner />
      <Header />
      <main className="pt-16">
        {/* Back link */}
        <div className="max-w-[1100px] mx-auto px-5 pt-8">
          <Link
            href="/portfolio-templates/luminos/works"
            className="inline-flex items-center gap-2 text-[#888888] text-xs tracking-wider hover:text-[#1A1A1A] transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            作品一覧に戻る
          </Link>
        </div>

        {/* Main Image */}
        <motion.section
          className="mt-6 sm:mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-lg overflow-hidden bg-[#222]">
              <Image
                src={project.image || `/images/templates/luminos/work-${project.id}.jpg`}
                alt={project.title}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            </div>
          </div>
        </motion.section>

        {/* Title & Meta */}
        <section className="py-12 sm:py-16 bg-[#FAFAFA]">
          <div className="max-w-[800px] mx-auto px-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="text-[#B8956A] text-xs tracking-[0.2em] mb-3">
                {project.category} — {project.year}
              </p>
              <h1
                className="text-[#1A1A1A] text-2xl sm:text-3xl lg:text-4xl mb-6"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300, lineHeight: 1.4 }}
              >
                {project.title}
              </h1>
              <p
                className="text-[#1A1A1A] text-sm sm:text-base leading-[2] mb-0"
                style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
              >
                {project.description}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Concept */}
        {project.concept && (
          <section className="py-12 sm:py-16 bg-white">
            <div className="max-w-[800px] mx-auto px-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-[#B8956A] text-xs tracking-[0.3em] mb-4">CONCEPT</p>
                <p
                  className="text-[#1A1A1A] text-sm sm:text-base leading-[2.2]"
                  style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
                >
                  {project.concept}
                </p>
              </motion.div>
            </div>
          </section>
        )}

        {/* Shooting Data */}
        {(project.location || project.equipment) && (
          <section className="py-12 sm:py-16 bg-[#FAFAFA]">
            <div className="max-w-[800px] mx-auto px-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-[#B8956A] text-xs tracking-[0.3em] mb-6">DATA</p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 py-4 border-b border-[#E5E5E5]">
                    <CalendarDays className="w-4 h-4 text-[#B8956A] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="text-[#888888] text-xs mb-1">撮影年</p>
                      <p className="text-[#1A1A1A] text-sm" style={{ fontWeight: 300 }}>
                        {project.year}
                      </p>
                    </div>
                  </div>
                  {project.location && (
                    <div className="flex items-start gap-4 py-4 border-b border-[#E5E5E5]">
                      <MapPinIcon className="w-4 h-4 text-[#B8956A] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                      <div>
                        <p className="text-[#888888] text-xs mb-1">撮影場所</p>
                        <p className="text-[#1A1A1A] text-sm" style={{ fontWeight: 300 }}>
                          {project.location}
                        </p>
                      </div>
                    </div>
                  )}
                  {project.equipment && (
                    <div className="flex items-start gap-4 py-4 border-b border-[#E5E5E5]">
                      <CameraIcon className="w-4 h-4 text-[#B8956A] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                      <div>
                        <p className="text-[#888888] text-xs mb-1">使用機材</p>
                        <p className="text-[#1A1A1A] text-sm" style={{ fontWeight: 300 }}>
                          {project.equipment}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Client Comment */}
        {project.clientComment && (
          <section className="py-12 sm:py-16 bg-white">
            <div className="max-w-[800px] mx-auto px-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-[#B8956A] text-xs tracking-[0.3em] mb-6">CLIENT COMMENT</p>
                <div className="relative pl-6 border-l-2 border-[#B8956A]/30">
                  <MessageSquareQuote className="absolute -left-3 -top-1 w-5 h-5 text-[#B8956A]/40 bg-white" />
                  <p
                    className="text-[#1A1A1A] text-sm sm:text-base leading-[2.2] italic"
                    style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300 }}
                  >
                    {project.clientComment}
                  </p>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Prev / Next Navigation */}
        <section className="py-12 sm:py-16 bg-[#FAFAFA] border-t border-[#E5E5E5]">
          <div className="max-w-[800px] mx-auto px-5">
            <div className="flex items-center justify-between">
              {prevProject ? (
                <Link
                  href={`/portfolio-templates/luminos/works/${prevProject.slug || `work-${prevProject.id}`}`}
                  className="group flex items-center gap-3 text-[#888888] hover:text-[#1A1A1A] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  <div>
                    <p className="text-[10px] tracking-[0.15em] mb-0.5">PREV</p>
                    <p className="text-sm" style={{ fontWeight: 300 }}>
                      {prevProject.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {nextProject ? (
                <Link
                  href={`/portfolio-templates/luminos/works/${nextProject.slug || `work-${nextProject.id}`}`}
                  className="group flex items-center gap-3 text-right text-[#888888] hover:text-[#1A1A1A] transition-colors"
                >
                  <div>
                    <p className="text-[10px] tracking-[0.15em] mb-0.5">NEXT</p>
                    <p className="text-sm" style={{ fontWeight: 300 }}>
                      {nextProject.title}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 sm:py-20 bg-white">
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

      <Footer />
    </>
  );
}
