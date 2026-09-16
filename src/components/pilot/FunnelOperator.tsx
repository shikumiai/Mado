import ActionForm from "./ActionForm";
import { updateFunnel } from "@/app/pilot/funnels/actions";
import { funnelStatuses, funnelSteps, type FunnelOrder } from "@/lib/funnel";
export default function FunnelOperator({ order: o }: { order: FunnelOrder }) {
  const final = ["reported", "closed", "cancelled"].includes(o.status);
  return (
    <details className="m-panel">
      <summary>運営：見積・確認結果を記録する</summary>
      <p>
        内容確認 → 見積 → 導線確認 → 結果公開 →
        対応完了。見積同意と入金確認後に操作します。0円の合意も「決済不要を確認」としてチェックしてください。
      </p>
      <ActionForm
        key={o.version}
        action={updateFunnel}
        label="運営の記録を保存する"
      >
        <input type="hidden" name="id" value={o.id} />
        <input type="hidden" name="version" value={o.version} />
        <label>
          状態
          <select name="status" defaultValue={o.status}>
            {Object.entries(funnelStatuses).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label>
          税込見積金額（円）
          <input
            name="quote_yen"
            type="number"
            min={0}
            max={1000000}
            defaultValue={o.quote_yen ?? ""}
            readOnly={!!o.quote_accepted_at}
          />
        </label>
        <label>
          見積の範囲・納期・支払い方法・キャンセル条件
          <textarea
            name="quote_scope"
            rows={5}
            maxLength={4000}
            defaultValue={o.quote_scope}
            readOnly={!!o.quote_accepted_at}
            placeholder="人の人数・募集条件、AIで確認する観点、操作範囲、報告内容、納期、税込額、支払い方法とキャンセル条件を明記。必要な人を確保してから提示。"
          />
        </label>
        <label className="m-check">
          <input
            name="payment_confirmed"
            type="checkbox"
            defaultChecked={o.payment_confirmed}
          />
          合意に基づく入金（または決済不要）を確認した
        </label>
        <label>
          結果の要約
          <textarea
            name="report_summary"
            rows={4}
            maxLength={4000}
            defaultValue={o.report_summary}
            readOnly={final}
          />
        </label>
        <label>
          実際に確認した範囲・条件・未確認のこと
          <textarea
            name="checked_scope"
            rows={4}
            maxLength={4000}
            defaultValue={o.checked_scope}
            readOnly={final}
            placeholder="確認日時、端末、人の人数と募集条件、AIのモデル・方法、どこまで操作したか。送信直前なら完了は未確認と記録。"
          />
        </label>
        <p>
          人の実操作とAIの推測を混ぜずに記録します。個人情報は記載せず、確認者は識別用の仮名にしてください。10件まで。結果の入力後は状態を「確認結果が届きました」にして保存してください。下書き保存はできません。公開後の結果は固定されます。
        </p>
        {Array.from({ length: 10 }, (_, i) => {
          const f = o.findings[i];
          return (
            <details className="m-panel" key={i} open={!!f}>
              <summary>
                記録 {i + 1}
                {f ? `：${funnelSteps[f.step]}` : "（未入力）"}
              </summary>
              <label>
                確認の種類
                <select
                  name={`source_${i}`}
                  defaultValue={f?.source ?? "human"}
                  aria-readonly={final}
                >
                  {final ? (
                    <option value={f?.source ?? "human"}>
                      {f?.source === "ai" ? "AIの指摘" : "人の実操作"}
                    </option>
                  ) : (
                    <>
                      <option value="human">人の実操作</option>
                      <option value="ai">AIの指摘</option>
                    </>
                  )}
                </select>
              </label>
              <label>
                確認者の仮名／AIのモデルと方法
                <input
                  name={`reviewer_${i}`}
                  maxLength={100}
                  defaultValue={f?.reviewer}
                  readOnly={final}
                />
              </label>
              <label>
                導線の段階
                <select name={`step_${i}`} defaultValue={f?.step ?? "entry"}>
                  {Object.entries(funnelSteps)
                    .filter(([k]) => !final || k === (f?.step ?? "entry"))
                    .map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                観察したこと・確認できた事実
                <textarea
                  name={`observation_${i}`}
                  maxLength={2000}
                  rows={3}
                  defaultValue={f?.observation}
                  readOnly={final}
                />
              </label>
              <label>
                考えられる理由（仮説・任意）
                <textarea
                  name={`hypothesis_${i}`}
                  maxLength={2000}
                  rows={2}
                  defaultValue={f?.hypothesis}
                  readOnly={final}
                />
              </label>
              <label>
                次に試す改善案
                <textarea
                  name={`suggestion_${i}`}
                  maxLength={2000}
                  rows={2}
                  defaultValue={f?.suggestion}
                  readOnly={final}
                />
              </label>
            </details>
          );
        })}
      </ActionForm>
    </details>
  );
}
