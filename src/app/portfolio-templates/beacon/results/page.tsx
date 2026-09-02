"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  ArrowLeft,
  Phone,
  Trophy,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import type { SiteConfig } from "@/lib/site-config-schema";
import siteConfig from "../site.config.json";

/* ═══════════════════════════════════════
   データ読み込み
   ═══════════════════════════════════════ */
const config = siteConfig as unknown as SiteConfig;
const COMPANY = config.company;

interface ResultEntry {
  school: string;
  count: number;
}

interface YearResult {
  year: string;
  entries: ResultEntry[];
}

interface Voice {
  name: string;
  text: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RESULTS = ((config as any).results || []) as YearResult[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VOICES = ((config as any).voices || []) as Voice[];

/* ═══════════════════════════════════════
   Header
   ═══════════════════════════════════════ */
function Header() {
  return (
    <header className="bg-white border-b border-[#DDE3E8]">
      <div className="max-w-[1200px] mx-auto px-5 h-14 flex items-center justify-between">
        <Link
          href="/portfolio-templates/beacon"
          className="flex items-center gap-2 text-[#5C7080] text-sm hover:text-[#2C5F7C] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> トップに戻る
        </Link>
        <div className="text-right">
          <p className="text-[#1E2D3D] font-bold text-sm">{COMPANY.name}</p>
          <p className="text-[#5C7080] text-[9px] tracking-wider">合格実績</p>
        </div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════
   Breadcrumb
   ═══════════════════════════════════════ */
function Breadcrumb() {
  return (
    <nav className="max-w-[1000px] mx-auto px-5 py-4" aria-label="パンくず">
      <ol className="flex items-center gap-2 text-xs text-[#5C7080]">
        <li>
          <Link href="/portfolio-templates/beacon" className="hover:text-[#2C5F7C] transition-colors">
            トップ
          </Link>
        </li>
        <li>/</li>
        <li className="text-[#1E2D3D] font-medium">合格実績</li>
      </ol>
    </nav>
  );
}

/* ═══════════════════════════════════════
   Year Results Table
   ═══════════════════════════════════════ */
function YearResultsTable({
  result,
  index,
  defaultOpen,
}: {
  result: YearResult;
  index: number;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const total = result.entries.reduce((sum, e) => sum + e.count, 0);

  return (
    <motion.div
      className="bg-white rounded-2xl border border-[#DDE3E8] overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* 年度ヘッダー */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 bg-[#F0EDE9] hover:bg-[#EAE6E0] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-[#E8963A]" />
          <h3 className="text-[#1E2D3D] font-bold text-lg">{result.year}</h3>
          <span className="px-3 py-0.5 rounded-full bg-[#2C5F7C]/10 text-[#2C5F7C] text-xs font-medium">
            合計 {total}名
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-[#5C7080] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* テーブル本体 */}
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.2 }}
        >
          {/* ヘッダー行 */}
          <div className="grid grid-cols-[1fr_auto] border-b border-[#DDE3E8] bg-[#F8F6F2]">
            <div className="px-6 py-3 text-[#5C7080] text-xs font-medium">学校名</div>
            <div className="px-6 py-3 text-[#5C7080] text-xs font-medium text-right w-24">
              合格者数
            </div>
          </div>
          {/* データ行 */}
          <div className="divide-y divide-[#DDE3E8]">
            {result.entries.map((entry, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto]">
                <div className="px-6 py-4 text-[#1E2D3D] text-sm">{entry.school}</div>
                <div className="px-6 py-4 text-[#E8963A] text-sm font-bold text-right w-24">
                  {entry.count}名
                </div>
              </div>
            ))}
          </div>
          {/* 合計行 */}
          <div className="grid grid-cols-[1fr_auto] bg-[#F8F6F2] border-t border-[#DDE3E8]">
            <div className="px-6 py-4 text-[#1E2D3D] text-sm font-bold">合計</div>
            <div className="px-6 py-4 text-[#E8963A] text-base font-bold text-right w-24">
              {total}名
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   Voice Card
   ═══════════════════════════════════════ */
function VoiceCard({ voice, index }: { voice: Voice; index: number }) {
  return (
    <motion.div
      className="bg-white rounded-2xl border border-[#DDE3E8] p-6 sm:p-7"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#E8963A]/10 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-5 h-5 text-[#E8963A]" />
        </div>
        <p className="text-[#1E2D3D] font-bold text-sm">{voice.name}</p>
      </div>
      <p className="text-[#5C7080] text-sm leading-[2]">{voice.text}</p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   Page
   ═══════════════════════════════════════ */
export default function ResultsPage() {
  return (
    <>
      <Header />

      <main className="bg-[#F8F6F2] min-h-screen">
        {/* Hero */}
        <section className="bg-[#2C5F7C] py-14 sm:py-18 px-5">
          <div className="max-w-[1000px] mx-auto text-center">
            <motion.p
              className="text-[#E8963A] text-xs tracking-[0.3em] mb-3 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              RESULTS
            </motion.p>
            <motion.h1
              className="text-white font-bold text-2xl sm:text-3xl mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              合格実績
            </motion.h1>
            <motion.p
              className="text-white/60 text-sm max-w-[500px] mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              生徒一人ひとりの努力の成果です。
            </motion.p>
          </div>
        </section>

        <Breadcrumb />

        <div className="max-w-[900px] mx-auto px-5 pb-16">
          {/* 年度別実績 */}
          <section className="mb-16">
            <h2 className="text-[#1E2D3D] font-bold text-xl mb-6 flex items-center gap-3">
              <span className="w-1 h-6 bg-[#E8963A] rounded-full" />
              年度別 合格実績
            </h2>
            <div className="space-y-5">
              {RESULTS.map((result, i) => (
                <YearResultsTable
                  key={result.year}
                  result={result}
                  index={i}
                  defaultOpen={i === 0}
                />
              ))}
            </div>
            <p className="text-[#5C7080] text-xs mt-4">
              ※ 合格者数は当塾在籍生のみの実数です。講習のみの受講生は含みません。
            </p>
          </section>

          {/* 卒業生の声 */}
          {VOICES.length > 0 && (
            <section className="mb-16">
              <h2 className="text-[#1E2D3D] font-bold text-xl mb-6 flex items-center gap-3">
                <span className="w-1 h-6 bg-[#E8963A] rounded-full" />
                卒業生の声
              </h2>
              <div className="space-y-5">
                {VOICES.map((voice, i) => (
                  <VoiceCard key={i} voice={voice} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <motion.section
            className="bg-[#2C5F7C] rounded-2xl p-8 sm:p-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-white font-bold text-xl sm:text-2xl mb-3">
              無料体験授業を申し込む
            </h2>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              まずは教室の雰囲気を体験してみてください。
              <br />
              お子さまに合った指導方法をご提案いたします。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`tel:${COMPANY.phone}`}
                className="flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[#E8963A] text-white font-medium text-sm hover:bg-[#D4862E] transition-colors shadow-lg shadow-black/20"
              >
                <Phone className="w-4 h-4" /> {COMPANY.phone}
              </a>
              <Link
                href="/portfolio-templates/beacon#contact"
                className="px-8 py-3.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition-colors"
              >
                メールで問い合わせ
              </Link>
            </div>
            <p className="text-white/40 text-xs mt-4">{COMPANY.hours}</p>
          </motion.section>
        </div>

        {/* Footer */}
        <footer className="py-8 bg-[#1E2D3D]">
          <div className="max-w-[1200px] mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/30 text-xs">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-[#E8963A]" />
              <span className="text-white/50 font-medium">{COMPANY.name}</span>
            </div>
            <p>&copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </>
  );
}
