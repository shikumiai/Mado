/**
 * 導線を作る /app/funnels/new（docs/FUNNEL_CHECK_V1.md §6）。
 *
 * ここは入口の見張りだけ。プランで作れない人・上限に達した人は一覧へ返す。
 * 入力の中身は NewFunnelForm（client）が持つ。
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyAccount } from "@/lib/auth";
import { listFunnels } from "@/lib/funnels/actions";
import { NewFunnelForm } from "./NewFunnelForm";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "導線を作る｜Mado" };

const backLink =
  "inline-flex items-center gap-1.5 rounded-md text-sm text-ink2 outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-ring";

export default async function NewFunnelPage() {
  const account = await getMyAccount();
  if (!account) redirect("/auth/login?next=/app/funnels/new");
  if (!account.org) redirect("/start");

  const res = await listFunnels();
  if (!res.ok) {
    if (res.reason === "unauthenticated") redirect("/auth/login?next=/app/funnels/new");
    redirect("/start");
  }

  // プランで使えない、または本数の上限に達している → 一覧で理由を見せる
  const overLimit = Number.isFinite(res.limit) && res.funnels.length >= res.limit;
  if (res.limit <= 0 || overLimit) redirect("/app/funnels");

  const sites = account.sites.map((s) => ({ id: s.id, slug: s.slug }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/app/funnels" className={backLink}>
          <ArrowLeft className="size-4" aria-hidden /> 導線の一覧へ
        </Link>
        <h1 className="mt-3 font-serif text-2xl font-bold sm:text-3xl">導線を作る</h1>
        <p className="mt-2 text-sm text-ink2">
          お客さんが通る順に段を並べます。あとからでも足せます。
        </p>
      </div>

      <NewFunnelForm sites={sites} />
    </div>
  );
}
