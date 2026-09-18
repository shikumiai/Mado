import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/ssr";
import { isUuid, yen } from "@/lib/pilot";
import {
  funnelStatuses,
  funnelSteps,
  publicHttpsUrl,
  type FunnelOrder,
} from "@/lib/funnel";
import ActionForm from "@/components/pilot/ActionForm";
import FunnelIntake from "@/components/pilot/FunnelIntake";
import FunnelOperator from "@/components/pilot/FunnelOperator";
import { acceptFunnelQuote } from "../actions";
export default async function FunnelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const db = await createServerSupabase();
  if (!db) return <p>受付の準備中です。</p>;
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect(`/auth/login?next=/pilot/funnels/${id}`);
  const { data, error } = await db
    .from("mado_funnel_orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error)
    return <p role="alert">依頼を読み込めませんでした。再度お試しください。</p>;
  if (!data) notFound();
  const o = data as FunnelOrder;
  const { data: admin } = await db.rpc("is_platform_admin");
  const published = ["reported", "closed"].includes(o.status);
  const { data: next, error: nextError } = await db
    .from("mado_funnel_orders")
    .select("id,title,status")
    .eq("previous_order_id", id)
    .order("created_at");
  const url = publicHttpsUrl(o.entry_url);
  return (
    <>
      <Link href="/pilot">← 依頼一覧</Link>
      <p className="m-pilot-label">{funnelStatuses[o.status]}</p>
      <h1>{o.title}</h1>
      {o.previous_order_id && (
        <p>
          <Link href={`/pilot/funnels/${o.previous_order_id}`}>
            修正前の依頼・結果を見る →
          </Link>
        </p>
      )}
      <section className="m-panel">
        <h2>確認する顧客の導線</h2>
        <ol className="m-funnel-path">
          {Object.entries(funnelSteps).map(([k, v]) => (
            <li key={k}>{v}</li>
          ))}
        </ol>
        <p>
          入口：
          {url ? (
            <a href={url} target="_blank" rel="noreferrer">
              {url} ↗
            </a>
          ) : (
            "URLを運営にご確認ください"
          )}
        </p>
        <h3>想定するお客さま</h3>
        <p className="m-pre">{o.audience}</p>
        <h3>目指す行動</h3>
        <p className="m-pre">{o.goal}</p>
        {o.context && (
          <>
            <h3>背景・確認したいこと</h3>
            <p className="m-pre">{o.context}</p>
          </>
        )}
        <p className="m-notice">
          {o.test_mode === "before_submit"
            ? "操作範囲：問い合わせの送信直前まで。送信完了は確認対象に含みません。"
            : "操作範囲：依頼者が許可したテスト環境で、送信完了まで。"}
        </p>
      </section>
      <section className="m-panel">
        <h2>見積と進め方</h2>
        {o.quote_yen === null ? (
          <p>
            運営が確認範囲と協力者を調整し、見積をお送りします。まだ料金は発生していません。
          </p>
        ) : (
          <>
            <p className="m-price">{yen(o.quote_yen)}（税込）</p>
            <p className="m-pre">{o.quote_scope}</p>
            {o.quote_accepted_at ? (
              <p className="m-notice">
                見積に同意済み。
                {o.payment_confirmed
                  ? "入金または決済不要を確認しました。"
                  : "見積に記載された支払い方法をご確認ください。"}
              </p>
            ) : o.status === "quoted" && o.user_id === user.id ? (
              <ActionForm
                key={o.version}
                action={acceptFunnelQuote}
                label="この見積に同意する"
              >
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="version" value={o.version} />
                <label className="m-check">
                  <input type="checkbox" name="agree" required />
                  金額・範囲・納期・支払い方法・キャンセル条件を確認し、依頼します。
                </label>
                <p className="m-small">この操作で自動決済は行われません。</p>
              </ActionForm>
            ) : null}
          </>
        )}
      </section>
      <section className="m-panel">
        <h2>導線の確認結果</h2>
        {published ? (
          <>
            <p className="m-pre">{o.report_summary}</p>
            <h3>確認した範囲と限界</h3>
            <p className="m-pre">{o.checked_scope}</p>
            <p className="m-small">
              ここに示すのは確認時の観察と改善の仮説です。実際の訪問者の離脱率・成約率ではありません。AIの指摘は人の体験を表すものではありません。
            </p>
            {o.findings.map((f, i) => (
              <article className="m-finding" key={i}>
                <p className="m-pilot-label">
                  {f.source === "human" ? "人の実操作" : "AIの指摘"} ·{" "}
                  {f.reviewer}
                </p>
                <h3>{funnelSteps[f.step]}</h3>
                <h4>観察・確認したこと</h4>
                <p className="m-pre">{f.observation}</p>
                {f.hypothesis && (
                  <>
                    <h4>考えられる理由（仮説）</h4>
                    <p className="m-pre">{f.hypothesis}</p>
                  </>
                )}
                <h4>次に試す改善案</h4>
                <p className="m-pre">{f.suggestion}</p>
              </article>
            ))}
          </>
        ) : (
          <p>
            確認が終わると、人の実操作とAIの指摘を分けてここにお届けします。
          </p>
        )}
      </section>
      {nextError && <p role="alert">再確認の一覧を読み込めませんでした。</p>}
      {!!next?.length && (
        <section className="m-panel">
          <h2>この結果を受けた再確認</h2>
          <div className="m-order-list">
            {next.map((n) => (
              <Link key={n.id} href={`/pilot/funnels/${n.id}`}>
                <strong>{n.title}</strong>
                <span>{funnelStatuses[n.status]}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      {published && o.user_id === user.id && (
        <details className="m-panel">
          <summary>修正した導線を、もう一度確認する</summary>
          <p>
            今回の結果を残して、新しい依頼を作ります。変更した点を記載してください。料金は改めて見積で確認します。
          </p>
          <FunnelIntake previous={o} />
        </details>
      )}
      {admin && <FunnelOperator order={o} />}
    </>
  );
}
