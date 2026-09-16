import Link from "next/link";
import ActionForm from "./ActionForm";
import { createFunnel } from "@/app/pilot/funnels/actions";
import type { FunnelOrder } from "@/lib/funnel";
export default function FunnelIntake({ previous }: { previous?: FunnelOrder }) {
  return (
    <ActionForm
      action={createFunnel}
      label={previous ? "修正後の導線を相談する" : "導線の確認を相談する"}
    >
      {previous && (
        <input type="hidden" name="previous_order_id" value={previous.id} />
      )}
      <label>
        サービス・依頼の名前
        <input
          name="title"
          required
          maxLength={100}
          defaultValue={previous?.title}
          placeholder="例：訪問お掃除サービス"
        />
      </label>
      <label>
        入口のURL
        <input
          name="entry_url"
          type="url"
          required
          maxLength={2000}
          defaultValue={previous?.entry_url}
          placeholder="https://example.com/service"
        />
      </label>
      <label>
        誰に使ってほしいですか？
        <textarea
          name="audience"
          required
          maxLength={1000}
          rows={2}
          defaultValue={previous?.audience}
          placeholder="例：初めて家事代行を頼む、共働きの家庭"
        />
      </label>
      <label>
        最後に何をしてほしいですか？
        <textarea
          name="goal"
          required
          maxLength={1000}
          rows={2}
          defaultValue={previous?.goal}
          placeholder="例：料金を理解し、見積の問い合わせを完了する"
        />
      </label>
      <label>
        {previous
          ? "変更した箇所・今回確認したいこと"
          : "入口までの経緯・特に確認したいこと"}
        <textarea
          name="context"
          maxLength={4000}
          rows={4}
          required={!!previous}
          placeholder={
            previous
              ? "料金表を追加した。問い合わせへの迷いが減るか確認したい。"
              : "例：Instagramの投稿から訪問。追加料金が伝わっているか気になる。"
          }
        />
      </label>
      <label>
        操作してよい範囲
        <select name="test_mode" defaultValue="before_submit">
          <option value="before_submit">
            問い合わせの送信直前まで（通常はこちら）
          </option>
          <option value="test_completion">
            許可されたテスト環境で送信完了まで
          </option>
        </select>
      </label>
      <label className="m-check">
        <input type="checkbox" name="test_authorized" />
        完了までの確認を依頼する場合：テスト環境を用意し、テスト送信を許可しています。操作条件を上に記載しました。
      </label>
      <label className="m-check">
        <input type="checkbox" name="consent" required />
        自分に確認を依頼する権限があるサイトです。必要な範囲での協力者への共有とAI処理に同意します。
      </label>
      <p className="m-small">
        公開されたHTTPSのURLを入力してください。パスワード、個人情報、秘密のURLは記載しないでください。
        <Link href="/pilot/privacy">情報の取り扱い</Link>
      </p>
      <p className="m-small">
        送信だけでは料金は発生しません。確認する人数・AIの観点・範囲・納期・税込金額は個別の見積で合意します。再確認も別途見積です。
      </p>
    </ActionForm>
  );
}
