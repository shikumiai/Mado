"use client";

/**
 * 管理コンソールの中身（顧客 / サイト / 編集依頼 のタブ）。
 *
 * 集計（月次売上など）はサーバー側で出して page.tsx が上に置く。ここは一覧と、
 * 編集依頼の状態更新（唯一の書き込み操作）を受け持つ。状態更新はその場で先に反映し
 * （楽観的更新）、失敗したときだけ元に戻して、画面下のトーストに理由をそっと出す。
 */

import { useMemo, useState, useTransition } from "react";
import { Card, Badge, Button, Tabs, useToast, type TabItem } from "@/components/ui";
import type { BadgeProps } from "@/components/ui";
import {
  Users, Globe, FileEdit, ExternalLink, Search, ChevronDown,
  Check, Play, RotateCcw, Ban, Inbox,
} from "lucide-react";
import { PLAN_LABELS, type Plan } from "@/lib/stripe";
import { customerSiteUrl, customerSiteLabel } from "@/lib/resolve-site";
import { updateEditRequestStatus, type EditRequestStatus } from "@/lib/admin";

/* ═══════════════════════════════════════
   受け取るデータ（すべてサーバー側で整形済み）
   ═══════════════════════════════════════ */

export interface OrgVM {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  status: string;   // pending / active / past_due / canceled
  created: string;  // "2026/09/05"
}

export interface SiteVM {
  id: string;
  slug: string;
  status: string;   // draft / live / suspended
  orgName: string;
  created: string;
  isLive: boolean;
}

export interface RequestVM {
  id: string;
  kind: string;     // text / image / layout / feature
  body: string;
  status: EditRequestStatus;
  orgName: string;
  siteSlug: string;
  created: string;
}

type Tone = NonNullable<BadgeProps["tone"]>;

/* ── 状態 → 表示ラベルと色（平易な日本語で） ── */

const ORG_STATUS: Record<string, { label: string; tone: Tone }> = {
  active: { label: "契約中", tone: "success" },
  pending: { label: "準備中", tone: "neutral" },
  past_due: { label: "支払い遅延", tone: "warn" },
  canceled: { label: "解約済み", tone: "danger" },
};

const SITE_STATUS: Record<string, { label: string; tone: Tone }> = {
  live: { label: "公開中", tone: "success" },
  draft: { label: "準備中", tone: "neutral" },
  suspended: { label: "停止中", tone: "danger" },
};

const REQ_STATUS: Record<EditRequestStatus, { label: string; tone: Tone }> = {
  pending: { label: "未対応", tone: "warn" },
  working: { label: "対応中", tone: "info" },
  done: { label: "完了", tone: "success" },
  rejected: { label: "見送り", tone: "neutral" },
};

const KIND_LABEL: Record<string, string> = {
  text: "文章",
  image: "画像",
  layout: "レイアウト",
  feature: "機能追加",
};

/* 依頼カードに出す操作ボタン（今の状態から進める先） */
type ReqAction = {
  label: string;
  next: EditRequestStatus;
  variant: "primary" | "secondary" | "ghost";
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

function actionsFor(status: EditRequestStatus): ReqAction[] {
  switch (status) {
    case "pending":
      return [
        { label: "対応を始める", next: "working", variant: "primary", icon: Play },
        { label: "見送る", next: "rejected", variant: "ghost", icon: Ban },
      ];
    case "working":
      return [
        { label: "完了にする", next: "done", variant: "primary", icon: Check },
        { label: "未対応に戻す", next: "pending", variant: "ghost", icon: RotateCcw },
        { label: "見送る", next: "rejected", variant: "ghost", icon: Ban },
      ];
    case "done":
      return [{ label: "対応中に戻す", next: "working", variant: "secondary", icon: RotateCcw }];
    case "rejected":
      return [{ label: "未対応に戻す", next: "pending", variant: "secondary", icon: RotateCcw }];
  }
}

/* ═══════════════════════════════════════
   本体
   ═══════════════════════════════════════ */

const TABS: TabItem[] = [
  { value: "customers", label: "顧客", icon: <Users className="size-4" aria-hidden /> },
  { value: "sites", label: "サイト", icon: <Globe className="size-4" aria-hidden /> },
  { value: "requests", label: "編集依頼", icon: <FileEdit className="size-4" aria-hidden /> },
];

export function AdminConsole({
  orgs,
  sites,
  requests,
  initialTab = "customers",
}: {
  orgs: OrgVM[];
  sites: SiteVM[];
  requests: RequestVM[];
  initialTab?: string;
}) {
  const [tab, setTab] = useState(
    TABS.some((t) => t.value === initialTab) ? initialTab : "customers"
  );

  return (
    <div className="flex flex-col gap-5">
      <Tabs tabs={TABS} value={tab} onValueChange={setTab} aria-label="管理する対象を選ぶ" />

      {tab === "customers" && <CustomersTab orgs={orgs} />}
      {tab === "sites" && <SitesTab sites={sites} />}
      {tab === "requests" && <RequestsTab requests={requests} />}
    </div>
  );
}

/* ── 顧客 ── */

function CustomersTab({ orgs }: { orgs: OrgVM[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return orgs;
    return orgs.filter(
      (o) => o.name.toLowerCase().includes(key) || o.email.toLowerCase().includes(key)
    );
  }, [orgs, q]);

  return (
    <div className="flex flex-col gap-4">
      <SearchBox value={q} onChange={setQ} placeholder="会社名・メールでさがす" />

      {orgs.length === 0 ? (
        <EmptyState icon={Users} text="まだ顧客がいません。" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} text="見つかりませんでした。" />
      ) : (
        <Card padded={false} className="overflow-hidden">
          <ul className="divide-y divide-line">
            {filtered.map((o) => {
              const st = ORG_STATUS[o.status] ?? { label: o.status, tone: "neutral" as Tone };
              return (
                <li
                  key={o.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3.5 sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-semibold text-ink">{o.name}</span>
                      <Badge tone="accent">{PLAN_LABELS[o.plan]}</Badge>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink3">{o.email}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge tone={st.tone}>{st.label}</Badge>
                    <span className="tnum hidden text-xs text-ink3 sm:inline">{o.created}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

/* ── サイト ── */

function SitesTab({ sites }: { sites: SiteVM[] }) {
  if (sites.length === 0) {
    return <EmptyState icon={Globe} text="まだサイトがありません。" />;
  }
  return (
    <Card padded={false} className="overflow-hidden">
      <ul className="divide-y divide-line">
        {sites.map((s) => {
          const st = SITE_STATUS[s.status] ?? { label: s.status, tone: "neutral" as Tone };
          return (
            <li
              key={s.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3.5 sm:px-5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-semibold text-ink">{s.slug}</span>
                  <Badge tone={st.tone}>{st.label}</Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-ink3">
                  {s.orgName}
                  {s.isLive && (
                    <span className="tnum"> ・ {customerSiteLabel(s.slug)}</span>
                  )}
                </p>
              </div>
              {s.isLive && (
                <a
                  href={customerSiteUrl(s.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-brand/40 px-3 text-sm text-ink outline-none transition hover:border-brand/70 hover:bg-surface2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                >
                  <ExternalLink className="size-4" aria-hidden /> 見る
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ── 編集依頼キュー（唯一の書き込み操作） ── */

const REQ_FILTERS: { value: "all" | EditRequestStatus; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "pending", label: "未対応" },
  { value: "working", label: "対応中" },
  { value: "done", label: "完了" },
  { value: "rejected", label: "見送り" },
];

function RequestsTab({ requests }: { requests: RequestVM[] }) {
  const { toast } = useToast();
  const [reqs, setReqs] = useState<RequestVM[]>(requests);
  const [filter, setFilter] = useState<"all" | EditRequestStatus>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyNext, setBusyNext] = useState<EditRequestStatus | null>(null);
  const [, startTransition] = useTransition();

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: reqs.length };
    for (const r of reqs) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [reqs]);

  const shown = filter === "all" ? reqs : reqs.filter((r) => r.status === filter);

  function changeStatus(id: string, next: EditRequestStatus) {
    const before = reqs;
    setReqs((rs) => rs.map((r) => (r.id === id ? { ...r, status: next } : r)));
    setBusyId(id);
    setBusyNext(next);
    startTransition(async () => {
      const res = await updateEditRequestStatus(id, next);
      setBusyId(null);
      setBusyNext(null);
      if (!res.ok) {
        setReqs(before); // 元に戻す
        toast({ title: "状態を変えられませんでした", description: res.reason, tone: "warn" });
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 状態でしぼる */}
      <div className="flex flex-wrap gap-2">
        {REQ_FILTERS.map((f) => {
          const active = filter === f.value;
          const n = counts[f.value] ?? 0;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={[
                "inline-flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-sm outline-none transition",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-bg",
                active
                  ? "bg-accent text-on-accent shadow-sh1"
                  : "border border-line text-ink2 hover:bg-surface2 hover:text-ink",
              ].join(" ")}
              aria-pressed={active}
            >
              {f.label}
              <span className="tnum text-xs opacity-70">{n}</span>
            </button>
          );
        })}
      </div>

      {reqs.length === 0 ? (
        <EmptyState icon={Inbox} text="編集依頼はまだありません。" />
      ) : shown.length === 0 ? (
        <EmptyState icon={Inbox} text="この状態の依頼はありません。" />
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((r) => {
            const st = REQ_STATUS[r.status];
            const open = expanded === r.id;
            const busy = busyId === r.id;
            return (
              <li key={r.id}>
                <Card padded={false} className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : r.id)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left outline-none transition hover:bg-surface2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:px-5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-ink">{r.orgName}</span>
                        <span className="rounded-sm bg-surface2 px-1.5 py-0.5 text-xs text-ink2">
                          {KIND_LABEL[r.kind] ?? r.kind}
                        </span>
                        <span className="tnum text-xs text-ink3">{r.created}</span>
                      </div>
                      <p className="mt-1 truncate text-sm text-ink2">{r.body}</p>
                    </div>
                    <Badge tone={st.tone}>{st.label}</Badge>
                    <ChevronDown
                      className={`size-4 shrink-0 text-ink3 transition-transform ${open ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>

                  {open && (
                    <div className="border-t border-line px-4 py-4 sm:px-5">
                      <p className="text-xs text-ink3">依頼の内容</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                        {r.body}
                      </p>
                      <p className="mt-2 text-xs text-ink3">
                        サイト: <span className="tnum">{r.siteSlug}</span>
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {actionsFor(r.status).map((a) => (
                          <Button
                            key={a.next + a.label}
                            size="sm"
                            variant={a.variant}
                            loading={busy && busyNext === a.next}
                            disabled={busy}
                            onClick={() => changeStatus(r.id, a.next)}
                            leftIcon={<a.icon className="size-4" aria-hidden />}
                          >
                            {a.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   小さな部品
   ═══════════════════════════════════════ */

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink3" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-md border border-line bg-surface pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-ink3 focus-visible:border-brand/50 focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

function EmptyState({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  text: string;
}) {
  return (
    <Card className="flex flex-col items-center gap-2 py-12 text-center">
      <Icon className="size-6 text-ink3" aria-hidden />
      <p className="text-sm text-ink2">{text}</p>
    </Card>
  );
}
