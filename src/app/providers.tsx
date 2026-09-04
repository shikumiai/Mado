"use client";

/**
 * アプリ全体を包む土台。
 * テーマ（明暗）とトースト（画面下の通知）だけを提供する最小構成。
 * 認証は Supabase に一本化したので next-auth の SessionProvider は撤去した。
 */

import { ThemeProvider } from "@/components/ui/theme";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
