import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/ssr";
import { statuses } from "@/lib/pilot";
import { funnelStatuses } from "@/lib/funnel";
export default async function ManagePage() {
  const db = await createServerSupabase();
  if (!db) return <p>管理画面の準備中です。</p>;
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/auth/login?next=/pilot/manage");
  const { data: admin } = await db.rpc("is_platform_admin");
  if (!admin)
    return <p role="alert">運営管理者のアカウントでログインしてください。</p>;
  const [funnels, orders, applications] = await Promise.all([
    db
      .from("mado_funnel_orders")
      .select("id,title,status,created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    db
      .from("mado_pilot_orders")
      .select("id,title,status,created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    db
      .from("mado_pilot_applications")
      .select("user_id,display_name,contact_email,specialty,method,created_at")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);
  return (
    <>
      <h1>運営管理</h1>
      <p>
        顧客の導線を一件ずつ確認します。確認する人数・AIの観点と費用を見積に記載し、合意と入金を確認して進めてください。実際の入出金と協力者への報酬は別途記録します。
      </p>
      <h2>導線チェックの依頼</h2>
      {funnels.error && <p role="alert">導線の依頼を取得できませんでした。</p>}
      <div className="m-order-list">
        {funnels.data?.map((o) => (
          <Link key={o.id} href={`/pilot/funnels/${o.id}`}>
            <strong>{o.title}</strong>
            <span>{funnelStatuses[o.status]}</span>
          </Link>
        ))}
        {!funnels.data?.length && <p>依頼はまだありません。</p>}
      </div>
      <h2>以前の画像制作依頼</h2>
      {orders.error && <p role="alert">依頼を取得できませんでした。</p>}
      <div className="m-order-list">
        {orders.data?.map((o) => (
          <Link key={o.id} href={`/pilot/${o.id}`}>
            <strong>{o.title}</strong>
            <span>{statuses[o.status]}</span>
          </Link>
        ))}
        {!orders.data?.length && <p>依頼はまだありません。</p>}
      </div>
      <h2>協力者・方法の応募（以前の応募を含む）</h2>
      {applications.error && <p role="alert">応募を取得できませんでした。</p>}
      {applications.data?.map((a) => (
        <details className="m-panel" key={a.user_id}>
          <summary>{a.display_name}</summary>
          <p>連絡先：{a.contact_email}</p>
          <h3>得意分野</h3>
          <p className="m-pre">{a.specialty}</p>
          <h3>非公開の手順・方法</h3>
          <p className="m-pre">{a.method}</p>
          <small>応募者ID：{a.user_id}</small>
        </details>
      ))}
      {!applications.data?.length && <p>応募はまだありません。</p>}
    </>
  );
}
