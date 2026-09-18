import { redirect } from "next/navigation";
import ActionForm from "@/components/pilot/ActionForm";
import { createServerSupabase } from "@/lib/supabase/ssr";
import { applyCreator } from "../actions";
export default async function JoinPage() {
  const db = await createServerSupabase();
  if (!db) return <p>応募受付の準備中です。</p>;
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/auth/login?next=/pilot/join");
  const { data: application, error } = await db
    .from("mado_pilot_applications")
    .select("display_name,created_at")
    .eq("user_id", user.id)
    .maybeSingle();
  return (
    <section className="m-panel">
      <h1>サイトを確かめる視点を、次の仕事に。</h1>
      <p>
        サイトの導線を人が確認する方法や、AIで説明の抜けを見つけるプロンプト・手順を募集します。まずは運営と個別に進める小さな取り組みです。
      </p>
      <p>
        応募内容とログイン用メールアドレスは運営が確認し、審査とご連絡に使います。採用後に、利用範囲・1依頼あたりの報酬・担当する確認範囲を合意してから作業をお願いします。応募だけで無償利用したり、自動収入を保証したりするものではありません。
      </p>
      {error ? (
        <p role="alert">応募状況を確認できませんでした。再度お試しください。</p>
      ) : application ? (
        <p className="m-notice">
          {application.display_name}さんの応募を受け付けています。
        </p>
      ) : (
        <ActionForm action={applyCreator} label="確認の方法・協力を申し込む">
          <label>
            活動名
            <input name="display_name" required maxLength={80} />
          </label>
          <label>
            得意な確認・実績・参加できる条件
            <textarea name="specialty" required maxLength={1000} rows={3} />
          </label>
          <label>
            確認の手順・使用するAI・プロンプト（人の操作確認のみでも可）
            <textarea
              name="method"
              required
              maxLength={8000}
              rows={8}
              placeholder="再現するために必要な入力、手順、制約、所要時間を記載してください。APIキーは記載しないでください。"
            />
          </label>
          <label className="m-check">
            <input type="checkbox" name="consent" required />
            自分に提供権限がある内容を提出し、運営による審査に同意します。
          </label>
        </ActionForm>
      )}
    </section>
  );
}
