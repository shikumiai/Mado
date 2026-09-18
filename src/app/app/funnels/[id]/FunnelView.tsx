"use client";

/**
 * 導線の詳細（docs/FUNNEL_CHECK_V1.md §6）。この画面が主役。
 *
 * 段を縦一列に並べ、1段ずつ「状態の丸」「名前と URL」「追跡リンク」「今週の人数」を出す。
 * 総合点は出さない（§12）。出すのは段ごとの状態と人数だけ。
 * 確かめていない段には、確かめていない理由を必ず書く（できるふりをしない）。
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Badge, useToast } from "@/components/ui";
import { Copy, Check, Play, Pencil, ExternalLink } from "lucide-react";
import type { FunnelDetail, FunnelRun, HopClicks, HopResult, HopStatus } from "@/lib/funnels/types";
import { HOP_KINDS } from "@/lib/funnels/kinds";
import { STATUS_LABELS, STATUS_TONES, STATUS_DOT, worstStatus, formatRunTime } from "@/lib/funnels/status";
import { startRun } from "@/lib/funnels/actions";

/* ═══════════════════════════════════════
   追跡リンクのコピー
   ═══════════════════════════════════════ */

function CopyLink({ url }: { url: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast({
        title: "コピーできませんでした",
        description: "リンクを長押しして選んでください。",
        tone: "warn",
      });
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={copy}
      leftIcon={
        copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />
      }
    >
      {copied ? "コピーしました" : "コピー"}
    </Button>
  );
}

/* ═══════════════════════════════════════
   段1つ
   ═══════════════════════════════════════ */

/** 確かめていない段に出す一文。理由が無ければ種類ごとの説明で埋める */
function skippedReason(result: HopResult | null, fallback: string): string {
  const fromCheck = result?.checks.find((c) => c.status === "skipped" && c.reason)?.reason;
  if (fromCheck) return fromCheck;
  if (fallback !== "") return fallback;
  return "自動で見に行けない場所のため、通った人数だけを数えています。";
}

/** 根拠を1行にする。あるものだけ並べる */
function evidenceLine(check: { evidence?: { statusCode?: number; finalUrl?: string; title?: string; fetchedAt: string } }): string {
  const e = check.evidence;
  if (!e) return "";
  const parts: string[] = [];
  if (e.statusCode !== undefined) parts.push(`応答 ${e.statusCode}`);
  if (e.finalUrl) parts.push(`飛び先 ${e.finalUrl}`);
  if (e.title) parts.push(`ページ名 ${e.title}`);
  parts.push(`${formatRunTime(e.fetchedAt)} 時点`);
  return parts.join(" ・ ");
}

/* ═══════════════════════════════════════
   本体
   ═══════════════════════════════════════ */

export function FunnelView({
  funnel,
  clicks,
  clickDays,
}: {
  funnel: FunnelDetail;
  clicks: HopClicks[];
  clickDays: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [run, setRun] = useState<FunnelRun | null>(funnel.runs[0] ?? null);

  const running = pending || run?.status === "running";

  function check() {
    startTransition(async () => {
      const res = await startRun(funnel.id);
      if (!res.ok) {
        toast({
          title: "確かめられませんでした",
          description: res.message ?? "もう一度お試しください。",
          tone: "warn",
        });
        return;
      }
      setRun(res.run);
      router.refresh();
    });
  }

  const resultOf = (index: number): HopResult | null =>
    run?.results.find((r) => r.hopIndex === index) ?? null;
  const clicksOf = (index: number): HopClicks | null =>
    clicks.find((c) => c.hopIndex === index) ?? null;
  const linkOf = (index: number) => funnel.links.find((l) => l.hopIndex === index) ?? null;

  return (
    <div className="flex flex-col gap-8">
      {/* 上: 名前と「いま確かめる」 */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">{funnel.name}</h1>
          <p className="mt-1.5 text-sm text-ink2">
            {run
              ? run.status === "running"
                ? "いま確かめています。"
                : `最後に確かめたのは ${formatRunTime(run.finishedAt ?? run.startedAt)}`
              : "まだ確かめていません。"}
          </p>
        </div>
        <Button
          loading={pending}
          disabled={running}
          onClick={check}
          leftIcon={<Play className="size-4" aria-hidden />}
        >
          いま確かめる
        </Button>
      </div>

      {run?.status === "failed" && (
        <p className="rounded-md border border-danger/40 bg-surface2 px-3 py-2 text-sm text-ink2">
          前回のチェックは途中で止まりました。もう一度「いま確かめる」を押してください。
        </p>
      )}

      {/* 段: 縦一列 */}
      <ol className="relative flex flex-col gap-3">
        {funnel.hops.map((hop, i) => {
          const info = HOP_KINDS[hop.kind];
          const result = resultOf(i);
          const status: HopStatus | null = result?.status ?? null;
          const link = linkOf(i);
          const count = clicksOf(i);
          const ngChecks = result?.checks.filter((c) => c.status === "ng") ?? [];
          const isLast = i === funnel.hops.length - 1;

          return (
            <li key={i} className="relative pl-7">
              {/* 段と段をつなぐ縦線 */}
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute left-[6px] top-6 -bottom-3 w-px bg-line"
                />
              )}
              {/* 状態の丸 */}
              <span
                aria-hidden
                className="absolute left-0 top-2.5 size-3.5 rounded-full"
                style={{
                  background: status ? STATUS_DOT[status] : "transparent",
                  boxShadow: status ? "none" : "inset 0 0 0 2px var(--line)",
                }}
              />

              <Card className="flex flex-col gap-3">
                {/* 名前・種類・状態 */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="truncate text-base font-bold">{hop.label}</span>
                    <Badge tone="neutral">{info.label}</Badge>
                  </div>
                  {status && <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>}
                </div>

                {/* 宣言した先 */}
                {hop.kind === "mado" ? (
                  <p className="text-xs text-ink3">自分の Mado サイトを見ています。</p>
                ) : (
                  <p className="tnum break-all text-xs text-ink3">{hop.url}</p>
                )}

                {/* 切れている理由と根拠 */}
                {status === "ng" && (
                  <div className="flex flex-col gap-2 rounded-md border border-danger/35 bg-surface2/60 p-3">
                    {ngChecks.length === 0 ? (
                      <p className="text-sm text-ink">ここで道が切れています。</p>
                    ) : (
                      ngChecks.map((c, n) => (
                        <div key={n}>
                          <p className="text-sm text-ink">
                            {c.reason ?? `${c.name}を満たしていません。`}
                          </p>
                          {evidenceLine(c) !== "" && (
                            <p className="tnum mt-0.5 break-all text-xs text-ink3">
                              {evidenceLine(c)}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                    {hop.kind === "mado" && funnel.siteId && (
                      <div>
                        <Link
                          href={`/app/sites/${funnel.siteId}/editor`}
                          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-brand/40 px-3 text-[13px] text-ink outline-none transition hover:border-brand/70 hover:bg-surface2 focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Pencil className="size-4" aria-hidden /> 直す
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* 確かめていない段・項目には、確かめていない理由を必ず書く */}
                {(status === "skipped" ||
                  result?.checks.some((c) => c.status === "skipped") ||
                  (status === null && info.skips !== "")) && (
                  <p className="rounded-md border border-line bg-surface2/60 px-3 py-2 text-xs text-ink3">
                    ここは確かめていません。理由: {skippedReason(result, info.skips)}
                  </p>
                )}

                {/* 追跡リンクと人数 */}
                <div className="flex flex-col gap-2 border-t border-line pt-3">
                  {link ? (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="tnum min-w-0 break-all text-xs text-ink2">{link.url}</p>
                        <CopyLink url={link.url} />
                      </div>
                      <p className="text-xs text-ink3">{info.paste}</p>
                    </>
                  ) : (
                    <p className="text-xs text-ink3">
                      追跡リンクはまだありません。「いま確かめる」を押すと発行されます。
                    </p>
                  )}

                  <p className="text-sm text-ink2">
                    この{clickDays}日間{" "}
                    <span className="tnum font-bold text-ink">{count?.visitors ?? 0}</span> 人
                    {count && count.clicks !== count.visitors && (
                      <span className="tnum ml-2 text-xs text-ink3">
                        （押された回数 {count.clicks}）
                      </span>
                    )}
                  </p>
                </div>
              </Card>
            </li>
          );
        })}
      </ol>

      {/* 下: 過去のチェック */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink2">過去のチェック</h2>
        {funnel.runs.length === 0 ? (
          <Card>
            <p className="text-sm text-ink2">まだ1回も確かめていません。</p>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {funnel.runs.map((r) => {
              const worst = worstStatus(r.results.map((x) => x.status));
              return (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface px-4 py-3"
                >
                  <span className="tnum text-sm text-ink2">
                    {formatRunTime(r.finishedAt ?? r.startedAt)}
                  </span>
                  {r.status === "running" ? (
                    <Badge tone="neutral">確かめています</Badge>
                  ) : r.status === "failed" ? (
                    <Badge tone="danger">途中で止まりました</Badge>
                  ) : worst ? (
                    <Badge tone={STATUS_TONES[worst]}>{STATUS_LABELS[worst]}</Badge>
                  ) : (
                    <Badge tone="neutral">結果なし</Badge>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* サイトを開く近道 */}
      {funnel.siteId && (
        <div>
          <Link
            href={`/app/sites/${funnel.siteId}/editor`}
            className="inline-flex items-center gap-1.5 rounded-md text-sm text-ink2 outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ExternalLink className="size-4" aria-hidden /> このサイトを編集する
          </Link>
        </div>
      )}
    </div>
  );
}
