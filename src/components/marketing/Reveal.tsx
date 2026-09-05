"use client";

/**
 * スクロールで下からそっと現れる薄い動き。レイアウトの一部としての控えめな演出。
 * 「動きを減らす」設定のときは動かさず、最初から見えた状態で置く（過剰演出をしない）。
 * DOM の形は常に同じにして、描画の食い違いを避ける。
 */

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
