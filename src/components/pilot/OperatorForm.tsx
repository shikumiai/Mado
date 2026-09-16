import ActionForm from "./ActionForm";
import { operatorUpdate } from "@/app/pilot/actions";
import { statuses, type PilotOrder } from "@/lib/pilot";
export default function OperatorForm({
  order,
  paths,
}: {
  order: PilotOrder;
  paths: string[];
}) {
  const options = (
    <>
      <option value="">画像を選んでください</option>
      {paths.map((p, i) => (
        <option value={p} key={p}>
          画像 {i + 1}：{p.split("/").at(-1)}
        </option>
      ))}
    </>
  );
  return (
    <section className="m-panel">
      <h2>運営による更新</h2>
      <p>
        このフォームの連絡事項・見積・比較結果は依頼者に表示されます。回答は実際の人の言葉を匿名で記録し、AIの分析を混ぜないでください。
      </p>
      <ActionForm action={operatorUpdate} label="依頼者への表示を更新する">
        <input type="hidden" name="id" value={order.id} />
        <input type="hidden" name="version" value={order.version} />
        <label>
          進捗
          <select name="status" defaultValue={order.status}>
            {Object.entries(statuses).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="m-two">
          <label>
            見積金額（税込・円）
            <input
              name="quote_yen"
              type="number"
              min={1}
              max={1000000}
              defaultValue={order.quote_yen ?? ""}
              readOnly={!!order.quote_accepted_at}
            />
          </label>
          <label className="m-check">
            <input
              name="payment_confirmed"
              type="checkbox"
              defaultChecked={order.payment_confirmed}
            />
            外部での入金を確認済み
          </label>
        </div>
        <label>
          見積の範囲・納期・支払い方法
          <textarea
            name="quote_scope"
            rows={4}
            maxLength={4000}
            defaultValue={order.quote_scope}
            readOnly={!!order.quote_accepted_at}
            placeholder="画像3案、比較人数、納品サイズ、修正1回の範囲、税込金額、納期、支払い方法・期限、キャンセル条件を明示。"
          />
        </label>
        <label>
          依頼者への連絡事項
          <textarea
            name="operator_note"
            rows={3}
            maxLength={2000}
            defaultValue={order.operator_note}
          />
        </label>
        <h3>制作案</h3>
        {[1, 2, 3].map((n) => {
          const v = order.variants[n - 1];
          return (
            <div className="m-subpanel" key={n}>
              <h4>案{n}</h4>
              <label>
                見出し
                <input
                  name={`variant_title_${n}`}
                  maxLength={100}
                  defaultValue={v?.title}
                />
              </label>
              <label>
                制作方法の提供者（活動名）
                <input
                  name={`variant_creator_${n}`}
                  maxLength={100}
                  defaultValue={v?.creator}
                />
              </label>
              <label>
                意図・事実確認した点
                <textarea
                  name={`variant_description_${n}`}
                  rows={2}
                  maxLength={1000}
                  defaultValue={v?.description}
                />
              </label>
              <label>
                画像
                <select name={`variant_path_${n}`} defaultValue={v?.path ?? ""}>
                  {options}
                </select>
              </label>
            </div>
          );
        })}
        <h3>人の比較コメント</h3>
        <p>
          まだ集まっていない欄は空欄で保存します。選んだ人数だけで売上効果を判断しないでください。
        </p>
        {[1, 2, 3, 4, 5].map((n) => {
          const f = order.feedback[n - 1];
          return (
            <div className="m-subpanel" key={n}>
              <h4>回答{n}</h4>
              <div className="m-two">
                <label>
                  回答者の匿名名
                  <input
                    name={`respondent_${n}`}
                    maxLength={80}
                    defaultValue={f?.respondent}
                    placeholder="例：回答者A"
                  />
                </label>
                <label>
                  選んだ案
                  <select name={`choice_${n}`} defaultValue={f?.choice ?? 1}>
                    {[1, 2, 3].map((c) => (
                      <option value={c} key={c}>
                        案{c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                選んだ理由・気になった点
                <textarea
                  name={`reason_${n}`}
                  maxLength={1000}
                  rows={2}
                  defaultValue={f?.reason}
                />
              </label>
            </div>
          );
        })}
        <label>
          最終納品画像
          <select name="delivery_path" defaultValue={order.delivery_path}>
            {options}
          </select>
        </label>
      </ActionForm>
    </section>
  );
}
