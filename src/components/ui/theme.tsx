"use client";

/**
 * テーマの状態を持つ場所。
 *
 * 3つの状態を扱う:
 *   - system … 端末の設定に従う（data-theme を付けない）
 *   - light  … 明るい色に固定
 *   - dark   … 暗い色に固定
 *
 * 実際の色は CSS 変数（globals.css）が持っている。ここは
 * <html> の data-theme を切り替えて、選択を localStorage に覚えるだけ。
 * 初回のちらつきは layout.tsx の先読みスクリプトが防ぐ。
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ThemeChoice = "system" | "light" | "dark";

const STORAGE_KEY = "theme";

interface ThemeContextValue {
  /** 今の選択（system / light / dark） */
  theme: ThemeChoice;
  /** 選択を変える。<html> と localStorage に即反映する */
  setTheme: (next: ThemeChoice) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(choice: ThemeChoice) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (choice === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", choice);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>("system");

  // マウント時に保存済みの選択を読み込む（先読みスクリプトと状態を合わせる）
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark" || saved === "system") {
        setThemeState(saved);
      }
    } catch {
      // localStorage が使えない環境ではシステム設定のまま
    }
  }, []);

  const setTheme = useCallback((next: ThemeChoice) => {
    setThemeState(next);
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 保存できなくても表示は切り替わる
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme は ThemeProvider の中で使ってください");
  }
  return ctx;
}
