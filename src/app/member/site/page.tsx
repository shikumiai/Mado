/**
 * 会員トップ（新）— 自分のサイト一覧。
 *
 * 旧 /member は next-auth と Googleスプレッドシートに乗っているので、
 * 新しい経路はこちらに作る。Phase 7 で旧側を外したら /member に昇格させる。
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyAccount } from "@/lib/auth";
import { customerSiteUrl, customerSiteLabel } from "@/lib/resolve-site";
import { PLAN_LABELS, normalizePlanId } from "@/lib/stripe";

export const metadata = { title: "マイサイト｜Mado" };

const C = {
  bg: "#FAF7F2",
  card: "#FFFFFF",
  ink: "#3D3226",
  dim: "#8B7D6B",
  line: "#E8DFD3",
  accent: "#7BA23F",
};

const STATUS_LABEL: Record<string, string> = {
  live: "公開中",
  draft: "準備中",
  suspended: "停止中",
};

export default async function MySitesPage() {
  const account = await getMyAccount();

  // 未ログイン → ログイン画面へ
  if (!account) redirect("/auth/login?next=/member/site");

  // 会社がまだ無い（申込前）→ 申込へ
  if (!account.org) redirect("/start");

  const { org, sites, isPlatformAdmin } = account;
  const plan = normalizePlanId(org.plan);

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: C.bg,
        color: C.ink,
        fontFamily: "'Noto Sans JP', system-ui, sans-serif",
        padding: "40px 20px 80px",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <header style={{ marginBottom: 30 }}>
          <p style={{ fontSize: 12, letterSpacing: ".1em", color: C.dim, margin: "0 0 6px" }}>MADO</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>{org.name}</h1>
          <p style={{ fontSize: 13, color: C.dim, margin: 0 }}>
            {PLAN_LABELS[plan]}プラン
            {isPlatformAdmin && (
              <>
                {" ・ "}
                <Link href="/admin" style={{ color: C.accent }}>
                  管理画面
                </Link>
              </>
            )}
          </p>
        </header>

        {sites.length === 0 ? (
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.line}`,
              borderRadius: 12,
              padding: "36px 24px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 15, margin: "0 0 6px" }}>まだサイトがありません。</p>
            <p style={{ fontSize: 13, color: C.dim, margin: "0 0 20px" }}>
              申し込みが済むと、ここに表示されます。
            </p>
            <Link
              href="/start"
              style={{
                display: "inline-block",
                padding: "11px 22px",
                background: C.accent,
                color: "#fff",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              サイトを作る
            </Link>
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 14 }}>
            {sites.map((site) => (
              <li
                key={site.id}
                style={{
                  background: C.card,
                  border: `1px solid ${C.line}`,
                  borderRadius: 12,
                  padding: "20px 22px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 14,
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{site.slug}</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 4,
                        color: site.status === "live" ? C.accent : C.dim,
                        background: site.status === "live" ? "#EFF4E6" : "#F2EFEA",
                      }}
                    >
                      {STATUS_LABEL[site.status] ?? site.status}
                    </span>
                  </div>
                  <p style={{ fontSize: 12.5, color: C.dim, margin: 0, wordBreak: "break-all" }}>
                    {customerSiteLabel(site.slug)}
                  </p>
                </div>

                <div style={{ display: "flex", gap: 9, flexShrink: 0 }}>
                  {site.status === "live" && (
                    <a
                      href={customerSiteUrl(site.slug)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: "9px 16px",
                        border: `1px solid ${C.line}`,
                        borderRadius: 8,
                        fontSize: 13.5,
                        color: C.ink,
                      }}
                    >
                      サイトを見る
                    </a>
                  )}
                  <Link
                    href={`/member/site/${site.id}/editor`}
                    style={{
                      padding: "9px 18px",
                      background: C.accent,
                      color: "#fff",
                      borderRadius: 8,
                      fontSize: 13.5,
                      fontWeight: 600,
                    }}
                  >
                    編集する
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form action="/auth/signout" method="post" style={{ marginTop: 34 }}>
          <button
            type="submit"
            style={{
              background: "none",
              border: "none",
              color: C.dim,
              fontSize: 13,
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: 3,
              padding: 0,
              font: "inherit",
            }}
          >
            ログアウト
          </button>
        </form>
      </div>
    </main>
  );
}
