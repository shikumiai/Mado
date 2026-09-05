/**
 * /app/security — ログインの安全性（パスキーの管理）。
 *
 * ログイン必須。未ログインなら入口へ戻す。権限は DB(RLS) が守るが、
 * この画面はログイン中の人にだけ意味があるので、入口で弾いておく。
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, KeyRound } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { PasskeyManager } from "@/components/auth/PasskeyManager";
import { Card } from "@/components/ui";

export const metadata = { title: "ログインの安全性｜Mado" };

export default async function SecurityPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/app/security");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/app"
          className="mb-4 inline-flex items-center gap-1.5 rounded-md text-sm text-ink2 outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-4" aria-hidden /> マイページ
        </Link>
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-accent-soft text-accent">
            <KeyRound className="size-[18px]" aria-hidden />
          </span>
          <h1 className="font-serif text-2xl font-medium">ログインの安全性</h1>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink2">
          パスキーは、この端末そのものを鍵にするログイン方法です。パスワードを覚えたり
          入力したりせずに、指紋・顔・暗証番号だけで入れます。
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink2">パスキー</h2>
        <Card>
          <PasskeyManager />
        </Card>
      </section>
    </div>
  );
}
