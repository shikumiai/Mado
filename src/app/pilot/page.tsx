import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/ssr";
import { statuses } from "@/lib/pilot";
import { funnelStatuses } from "@/lib/funnel";
import FunnelIntake from "@/components/pilot/FunnelIntake";
export default async function PilotPage() {
  const db = await createServerSupabase();
  if (!db) return <p role="alert">受付の準備中です。</p>;
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/auth/login?next=/pilot");
  const [funnels, legacy, { data: admin }] = await Promise.all([
    db
      .from("mado_funnel_orders")
      .select("id,title,status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    db
      .from("mado_pilot_orders")
      .select("id,title,status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    db.rpc("is_platform_admin"),
  ]);
  return (
    <>
      <div className="m-heading">
        <div>
          <p>紹介ページから、問い合わせまで。</p>
          <h1>あなたの導線チェック</h1>
        </div>
        {admin && (
          <Link className="m-button m-secondary" href="/pilot/manage">
            運営管理
          </Link>
        )}
      </div>
      {funnels.error ? (
        <p role="alert">依頼を読み込めませんでした。再度お試しください。</p>
      ) : (
        <div className="m-order-list">
          {funnels.data?.map((o) => (
            <Link key={o.id} href={`/pilot/funnels/${o.id}`}>
              <strong>{o.title}</strong>
              <span>{funnelStatuses[o.status]}</span>
            </Link>
          ))}
          {!funnels.data?.length && (
            <p>
              まずは、ひとつの顧客の導線から。下のフォームで確認したいことを教えてください。
            </p>
          )}
        </div>
      )}
      <section className="m-panel">
        <h2>新しい導線を相談する</h2>
        <p>
          お客さまが紹介ページを見て、理解して、問い合わせへ進む。その途中で迷う箇所を確かめます。初期版は運営が一件ずつ進めます。
        </p>
        <FunnelIntake />
      </section>
      {legacy.error && (
        <p role="alert">以前の画像制作依頼を読み込めませんでした。</p>
      )}
      {!!legacy.data?.length && (
        <section className="m-panel">
          <h2>以前の画像制作依頼</h2>
          <p>登録済みの依頼はこちらから確認できます。</p>
          <div className="m-order-list">
            {legacy.data.map((o) => (
              <Link key={o.id} href={`/pilot/${o.id}`}>
                <strong>{o.title}</strong>
                <span>{statuses[o.status]}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      <form action="/auth/signout" method="post">
        <button className="m-text-button">ログアウト</button>
      </form>
    </>
  );
}
