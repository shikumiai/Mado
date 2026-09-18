"use client";

/**
 * シート。横または下からすっと出るパネル。割り込みモーダルの代わり。
 *
 * 画面を覆い隠して操作を止めるのではなく、その場に寄せて出す。
 * Esc か背景のクリックで閉じる。開くとパネルに焦点が移り、閉じると元へ戻す。
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  /** 出てくる向き */
  side?: "right" | "bottom";
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  /**
   * 画面を覆うかどうか。
   * false にすると背景を暗くせず、後ろ（プレビューなど）をそのまま見て触れる。
   * 組み立てのように「結果を見ながら操作する」パネルはこちらを使う。
   */
  modal?: boolean;
  /** 横幅。中に実物のプレビューを並べるときは wide */
  width?: "default" | "wide";
  /** 見出しの左に置くもの（「戻る」ボタンなど） */
  headerLeading?: React.ReactNode;
}

export function Sheet({
  open,
  onClose,
  side = "right",
  title,
  description,
  children,
  className = "",
  modal = true,
  width = "default",
  headerLeading,
}: SheetProps) {
  const [render, setRender] = useState(open);
  const [shown, setShown] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  // 開閉に合わせて DOM への出し入れとアニメーションを段階的に行う
  useEffect(() => {
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (open) {
      lastFocused.current = document.activeElement as HTMLElement | null;
      setRender(true);
      raf = requestAnimationFrame(() => setShown(true));
    } else {
      setShown(false);
      timer = setTimeout(() => setRender(false), 320);
    }
    return () => {
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [open]);

  // 表示されたらパネルへ焦点を移す
  useEffect(() => {
    if (shown) panelRef.current?.focus();
  }, [shown]);

  // 閉じたあと、元居た場所へ焦点を戻す
  useEffect(() => {
    if (!render && lastFocused.current) {
      lastFocused.current.focus?.();
      lastFocused.current = null;
    }
  }, [render]);

  // Esc で閉じる
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    },
    [onClose]
  );

  if (!render) return null;

  const isRight = side === "right";
  const hiddenTransform = isRight ? "translateX(100%)" : "translateY(100%)";
  const wide = width === "wide";
  const panelPos = isRight
    ? `top-0 right-0 h-full w-full ${wide ? "max-w-xl" : "max-w-md"} rounded-l-2xl`
    : "inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl";

  return (
    <div
      className={["fixed inset-0 z-[70]", modal ? "" : "pointer-events-none"].filter(Boolean).join(" ")}
      onKeyDown={onKeyDown}
    >
      {/* 背景。クリックで閉じる（覆わないシートには出さない） */}
      {modal && (
        <button
          type="button"
          aria-label="閉じる"
          tabIndex={-1}
          onClick={onClose}
          className="absolute inset-0 cursor-default bg-[rgba(16,21,31,0.45)] transition-opacity duration-200 ease-brand"
          style={{ opacity: shown ? 1 : 0 }}
        />
      )}

      <div
        ref={panelRef}
        role="dialog"
        aria-modal={modal}
        aria-label={title}
        tabIndex={-1}
        className={[
          "absolute flex flex-col bg-surface text-ink border border-line shadow-sh3 outline-none",
          modal ? "" : "pointer-events-auto",
          panelPos,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          transform: shown ? "none" : hiddenTransform,
          transition: "transform 320ms var(--ease)",
        }}
      >
        {(title || description || headerLeading) && (
          <div className="flex items-start justify-between gap-3 border-b border-line p-4">
            {headerLeading}
            <div className="min-w-0 flex-1">
              {title && <h2 className="text-base font-semibold">{title}</h2>}
              {description && (
                <p className="mt-0.5 text-sm text-ink2">{description}</p>
              )}
            </div>
            <button
              type="button"
              aria-label="閉じる"
              onClick={onClose}
              className="-m-1 shrink-0 rounded-md p-1 text-ink3 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
