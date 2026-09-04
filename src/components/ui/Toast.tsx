"use client";

/**
 * トースト。画面の下にそっと出て、しばらくすると自分で消える。
 * 割り込まない（操作をふさがない）。結果とその理由を短く添えるのが役目。
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { X, Check, CircleAlert, TriangleAlert, Info } from "lucide-react";

type Tone = "neutral" | "success" | "warn" | "danger" | "info";

export interface ToastOptions {
  title: string;
  /** なぜそうなったかの一言。理由を添える */
  description?: string;
  tone?: Tone;
  /** 消えるまでの時間(ms)。0 で自動で消えない */
  duration?: number;
}

interface ToastItem extends Required<Omit<ToastOptions, "description">> {
  id: number;
  description?: string;
}

interface ToastContextValue {
  toast: (opts: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyle: Record<Tone, { color: string; icon: React.ReactNode }> = {
  neutral: { color: "var(--ink2)", icon: <Info className="size-4" aria-hidden /> },
  success: { color: "var(--success)", icon: <Check className="size-4" aria-hidden /> },
  warn: { color: "var(--warn)", icon: <TriangleAlert className="size-4" aria-hidden /> },
  danger: { color: "var(--danger)", icon: <CircleAlert className="size-4" aria-hidden /> },
  info: { color: "var(--info)", icon: <Info className="size-4" aria-hidden /> },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (opts: ToastOptions) => {
      const id = ++seq.current;
      const item: ToastItem = {
        id,
        title: opts.title,
        description: opts.description,
        tone: opts.tone ?? "neutral",
        duration: opts.duration ?? 4500,
      };
      setItems((prev) => [...prev, item]);
      if (item.duration > 0) {
        const timer = setTimeout(() => remove(id), item.duration);
        timers.current.set(id, timer);
      }
    },
    [remove]
  );

  // アンマウント時にタイマーを片付ける
  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4"
      >
        {items.map((t) => {
          const s = toneStyle[t.tone];
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-line bg-surface p-3.5 text-ink shadow-sh2"
              style={{ animation: "mado-fade-in 200ms var(--ease) both" }}
            >
              <span className="mt-0.5 shrink-0" style={{ color: s.color }}>
                {s.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-ink2 leading-snug">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                aria-label="閉じる"
                onClick={() => remove(t.id)}
                className="-m-1 rounded-md p-1 text-ink3 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast は ToastProvider の中で使ってください");
  }
  return ctx;
}
