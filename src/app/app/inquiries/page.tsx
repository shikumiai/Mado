/**
 * 届いた問い合わせ /app/inquiries
 *
 * 自分のサイトに届いた問い合わせ・予約の希望を、新しい順に並べる。
 * 返信はメールで行う（「返信する」はメールソフトを開く）。ここでは読んだ・対応した、の印だけ付ける。
 *
 * 未ログイン → /auth/login、会社がまだ無い → /start。権限は DB(RLS) が守る。
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyAccount } from "@/lib/auth";
import { listMyInquiries, setInquiryStatus, type InquiryRow } from "@/lib/inquiries";
import { Card, Badge } from "@/components/ui";
import { Mail, Check, RotateCcw, Inbox } from "lucide-react";

export const metadata = { title: "届いた問い合わせ｜Mado" };

const secondaryButton =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-brand/40 px-4 text-sm text-ink outline-none transition hover:border-brand/70 hover:bg-surface2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

const STATUS: Record<InquiryRow["status"], { label: string; tone: "accent" | "neutral" | "success" | "danger" }> = {
  new: { label: "未対応", tone: "accent" },
  read: { label: "読んだ", tone: "neutral" },
  done: { label: "対応した", tone: "success" },
  spam: { label: "迷惑", tone: "danger" },
};

const KIND: Record<InquiryRow["kind"], string> = { contact: "お問い合わせ", booking: "予約の希望" };

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** メールソフトで返信する。件名に元の用件の頭を入れておく */
function replyHref(row: InquiryRow): string {
  const subject = `Re: ${KIND[row.kind]}について`;
  return `mailto:${encodeURIComponent(row.email)}?subject=${encodeURIComponent(subject)}`;
}

async function markDone(id: string) {
  "use server";
  await setInquiryStatus(id, "done");
}

async function markNew(id: string) {
  "use server";
  await setInquiryStatus(id, "new");
}

export default async function InquiriesPage() {
  const account = await getMyAccount();
  if (!account) redirect("/auth/login?next=/app/inquiries");
  if (!account.org) redirect("/start");

  const res = await listMyInquiries();
  if (!res.ok) redirect("/auth/login?next=/app/inquiries");
  const { rows, unread } = res;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-medium tracking-wide text-ink3">マイページ</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">届いた問い合わせ</h1>
          {unread > 0 && <Badge tone="accent">未対応 {unread}件</Badge>}
        </div>
        <p className="mt-2 text-sm text-ink2">
          サイトのフォームから届いたものです。届くたびに登録メールにも同じ内容を送っています。返信はメールで行ってください。
        </p>
      </div>

      {rows.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="grid size-10 place-items-center rounded-full bg-surface2 text-ink3">
            <Inbox className="size-5" aria-hidden />
          </span>
          <p className="text-sm text-ink">まだ問い合わせはありません。</p>
          <p className="text-sm text-ink2">サイトのフォームから送られると、ここと登録メールに届きます。</p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((row) => {
            const st = STATUS[row.status];
            return (
              <li key={row.id}>
                <Card className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="truncate text-base font-bold">{row.name}</span>
                      <Badge tone="neutral">{KIND[row.kind]}</Badge>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </div>
                    <span className="tnum text-xs text-ink3">{formatTime(row.createdAt)}</span>
                  </div>

                  <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
                    <dt className="text-ink3">メール</dt>
                    <dd className="break-all text-ink">{row.email}</dd>
                    {row.phone && (
                      <>
                        <dt className="text-ink3">電話</dt>
                        <dd className="tnum text-ink">{row.phone}</dd>
                      </>
                    )}
                    {row.purpose && (
                      <>
                        <dt className="text-ink3">種類</dt>
                        <dd className="text-ink">{row.purpose}</dd>
                      </>
                    )}
                    {(row.preferredText || row.preferredAt) && (
                      <>
                        <dt className="text-ink3">希望日時</dt>
                        <dd className="text-ink">{row.preferredText ?? formatTime(row.preferredAt as string)}</dd>
                      </>
                    )}
                    {row.siteSlug && (
                      <>
                        <dt className="text-ink3">サイト</dt>
                        <dd className="text-ink">
                          <Link href={`/${row.siteSlug}`} className="underline-offset-2 hover:underline">
                            /{row.siteSlug}
                          </Link>
                        </dd>
                      </>
                    )}
                  </dl>

                  <p className="whitespace-pre-wrap rounded-md bg-surface2/60 px-3 py-2 text-sm text-ink">
                    {row.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <a href={replyHref(row)} className={secondaryButton}>
                      <Mail className="size-4" aria-hidden /> 返信する
                    </a>
                    {row.status === "done" ? (
                      <form action={markNew.bind(null, row.id)}>
                        <button type="submit" className={secondaryButton}>
                          <RotateCcw className="size-4" aria-hidden /> 未対応に戻す
                        </button>
                      </form>
                    ) : (
                      <form action={markDone.bind(null, row.id)}>
                        <button type="submit" className={secondaryButton}>
                          <Check className="size-4" aria-hidden /> 対応した
                        </button>
                      </form>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
