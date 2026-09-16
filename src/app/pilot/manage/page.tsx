import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/ssr";
import { statuses } from "@/lib/pilot";
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
  const [orders, applications] = await Promise.all([
    db
      .from("mado_pilot_orders")
      .select("id,title,status,created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    db
      .from("mado_pilot_applications")
      .select("user_id,display_name,specialty,method,created_at")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);
  return (
    <>
      <h1>運営管理</h1>
      <p>
        最初の受注5件・制作方法の提供者3名を目安に、品質と対応時間を確かめます。実際の入出金と回答者への報酬は別途記録してください。
      </p>
      <h2>制作依頼</h2>
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
      <h2>制作方法の応募</h2>
      {applications.error && <p role="alert">応募を取得できませんでした。</p>}
      {applications.data?.map((a) => (
        <details className="m-panel" key={a.user_id}>
          <summary>{a.display_name}</summary>
          <h3>得意分野</h3>
          <p className="m-pre">{a.specialty}</p>
          <h3>非公開の制作方法</h3>
          <p className="m-pre">{a.method}</p>
          <small>応募者ID：{a.user_id}</small>
        </details>
      ))}
      {!applications.data?.length && <p>応募はまだありません。</p>}
    </>
  );
}
