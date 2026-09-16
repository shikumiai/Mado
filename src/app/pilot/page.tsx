import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/ssr";
import { statuses } from "@/lib/pilot";
import ActionForm from "@/components/pilot/ActionForm";
import { createOrder } from "./actions";

export default async function PilotPage() {
  const db = await createServerSupabase();
  if (!db)
    return <p role="alert">受付の準備中です。時間をおいてお試しください。</p>;
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/auth/login?next=/pilot");
  const { data: orders, error } = await db
    .from("mado_pilot_orders")
    .select("id,title,status,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const { data: admin } = await db.rpc("is_platform_admin");
  return (
    <>
      <div className="m-heading">
        <div>
          <p>まずは、ひとつの商品から。</p>
          <h1>あなたの制作依頼</h1>
        </div>
        {admin && (
          <Link className="m-button m-secondary" href="/pilot/manage">
            運営管理
          </Link>
        )}
      </div>
      {error ? (
        <p role="alert" className="m-error">
          依頼を読み込めませんでした。時間をおいて再度お試しください。
        </p>
      ) : (
        <div className="m-order-list">
          {orders?.map((o) => (
            <Link key={o.id} href={`/pilot/${o.id}`}>
              <strong>{o.title}</strong>
              <span>{statuses[o.status]}</span>
            </Link>
          ))}
          {!orders?.length && (
            <p>
              まだ依頼はありません。下のフォームから商品について教えてください。
            </p>
          )}
        </div>
      )}
      <section className="m-panel">
        <h2>新しい制作を相談する</h2>
        <p>
          商品画像と見出しを3案つくり、人の感想を集めて、採用案を一緒に決めます。まずは内容を確認し、税込金額・納期・納品範囲をご案内します。この送信で料金は発生しません。
        </p>
        <ActionForm
          action={createOrder}
          label="依頼を保存して、商品写真を追加する"
        >
          <label>
            商品名
            <input
              name="title"
              required
              maxLength={100}
              placeholder="例：自家焙煎のドリップコーヒー"
            />
          </label>
          <label>
            誰に届けたいですか？
            <input
              name="audience"
              required
              maxLength={500}
              placeholder="例：忙しい朝でもコーヒーを楽しみたい人"
            />
          </label>
          <label>
            商品の事実・特徴
            <textarea
              name="facts"
              required
              maxLength={4000}
              rows={4}
              placeholder="素材、サイズ、価格など。未確認の効果や実績は書かないでください。"
            />
          </label>
          <label>
            画像を使う場所・伝えたいこと
            <textarea
              name="goal"
              required
              maxLength={1000}
              rows={3}
              placeholder="例：ネットショップの商品紹介。手軽さを伝えたい。"
            />
          </label>
          <label className="m-check">
            <input type="checkbox" name="consent" required />
            使用権限のある素材を提出し、制作のためのAI処理と比較協力者への限定共有に同意します。
          </label>
          <p className="m-small">
            <Link href="/pilot/privacy">素材と個人情報の取り扱い</Link>
            をご確認ください。個人情報や機密情報を含む素材は送らないでください。
          </p>
        </ActionForm>
      </section>
      <form action="/auth/signout" method="post">
        <button className="m-text-button">ログアウト</button>
      </form>
    </>
  );
}
