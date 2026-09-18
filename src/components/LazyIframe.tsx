"use client";

import { useRef, useState, useEffect } from "react";

interface LazyIframeProps {
  src: string;
  title: string;
  fallbackBg: string;
  fallbackColors: string[];
  className?: string;
  iframeWidth?: number;
  iframeHeight?: number;
  scale?: number;
}

export default function LazyIframe({
  src,
  title,
  fallbackBg,
  fallbackColors,
  className = "h-36 sm:h-44",
  iframeWidth = 1280,
  iframeHeight = 800,
  scale = 0.2,
}: LazyIframeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{ background: fallbackBg }}
    >
      {/* 読み込み中の下敷き（サイトの輪郭に見せる。空白の箱にしない） */}
      {!loaded && (
        <div className="absolute inset-0 flex flex-col opacity-70">
          {/* ヘッダー帯 */}
          <div
            className="flex items-center justify-between px-[6%] py-[3.5%]"
            style={{ background: `${fallbackColors[0]}14` }}
          >
            <span className="h-1.5 w-[18%] rounded-full" style={{ background: `${fallbackColors[0]}66` }} />
            <span className="flex gap-[3%]">
              <span className="h-1 w-6 rounded-full" style={{ background: `${fallbackColors[0]}33` }} />
              <span className="h-1 w-6 rounded-full" style={{ background: `${fallbackColors[0]}33` }} />
            </span>
          </div>
          {/* ヒーロー（見出し＋絵の2枚） */}
          <div className="flex flex-1 gap-[4%] px-[6%] py-[5%]">
            <div className="flex flex-[1.05] flex-col justify-center gap-[6%]">
              <span className="h-2.5 w-[70%] rounded" style={{ background: `${fallbackColors[0]}55` }} />
              <span className="h-2.5 w-[52%] rounded" style={{ background: `${fallbackColors[0]}55` }} />
              <span className="mt-[4%] h-1.5 w-[80%] rounded-full" style={{ background: `${(fallbackColors[1] || fallbackColors[0])}44` }} />
              <span className="h-1.5 w-[64%] rounded-full" style={{ background: `${(fallbackColors[1] || fallbackColors[0])}44` }} />
              <span className="mt-[5%] h-5 w-[42%] rounded-md" style={{ background: `${fallbackColors[0]}77` }} />
            </div>
            <div
              className="flex-[0.95] rounded-lg"
              style={{ background: `${(fallbackColors[1] || fallbackColors[0])}22` }}
            />
          </div>
        </div>
      )}

      {/* iframe (only loads when scrolled into view) */}
      {visible && (
        <iframe
          src={src}
          className={`absolute top-0 left-0 border-none pointer-events-none transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          style={{
            width: `${iframeWidth}px`,
            height: `${iframeHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          tabIndex={-1}
          title={title}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
