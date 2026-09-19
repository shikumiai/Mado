/**
 * 導線の詳細 /app/funnels/[id]（docs/FUNNEL_CHECK_V1.md §6）。
 *
 * データを取って渡すだけ。見せ方は FunnelView（client）が持つ。
 * 押された回数は直近7日ぶん（人数としては出さない）。
 */

import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getMyAccount } from "@/lib/auth";
import { loadFunnel, clicksByHop } from "@/lib/funnels/actions";
import { FunnelView } from "./FunnelView";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "導線｜Mado" };

const CLICK_DAYS = 7;

const backLink =
  "inline-flex items-center gap-1.5 rounded-md text-sm text-ink2 outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-ring";

export default async function FunnelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const account = await getMyAccount();
  if (!account) redirect(`/auth/login?next=/app/funnels/${id}`);
  if (!account.org) redirect("/start");

  const res = await loadFunnel(id);
  if (!res.ok) {
    if (res.reason === "unauthenticated") redirect(`/auth/login?next=/app/funnels/${id}`);
    notFound();
  }

  const counts = await clicksByHop(id, CLICK_DAYS);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/app/funnels" className={backLink}>
        <ArrowLeft className="size-4" aria-hidden /> 導線の一覧へ
      </Link>

      <FunnelView
        funnel={res.funnel}
        clicks={counts.ok ? counts.hops : []}
        clickDays={counts.ok ? counts.days : CLICK_DAYS}
      />
    </div>
  );
}
