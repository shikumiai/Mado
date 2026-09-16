"use client";
import { useState } from "react";
const examples = [
  {
    step: "紹介ページ",
    observation: "どんな掃除を頼めるかは、すぐに分かった。",
    hypothesis: "訪問者の目的と、最初の説明が合っている。",
    suggestion: "分かりやすいサービス説明を維持する。",
    source: "人の実操作",
  },
  {
    step: "内容・料金",
    observation:
      "料金を探してページを往復した。追加料金があるか分からなかった。",
    hypothesis: "問い合わせ前に総額の目安を知りたい可能性がある。",
    suggestion: "料金の目安と追加料金の条件を、問い合わせボタンの前に置く。",
    source: "人の実操作",
  },
  {
    step: "問い合わせ",
    observation:
      "紹介ページでは「無料見積」、フォームの見出しでは「申し込み」と表現されている。",
    hypothesis: "フォーム送信で契約が成立すると受け取られる可能性がある。",
    suggestion: "「無料見積の相談」に表現をそろえ、送信後の流れを説明する。",
    source: "AIの指摘",
  },
  {
    step: "送信・完了",
    observation: "この例では、送信ボタンの直前で操作を終了した。",
    hypothesis: "送信後に何が起きるかは、まだ分からない。",
    suggestion:
      "必要なら、許可されたテスト環境で受付通知と完了画面を確かめる。",
    source: "未確認の範囲",
  },
];
export default function FunnelDemo() {
  const [index, setIndex] = useState(1);
  const item = examples[index];
  return (
    <div className="m-funnel-demo">
      <p className="m-pilot-label">操作できる架空の例 · お掃除サービス</p>
      <h2>どこで、次に進めなくなった？</h2>
      <p>
        段階を選ぶと、届くフィードバックのイメージを見られます。実際の調査結果ではありません。
      </p>
      <div className="m-funnel-tabs" role="group" aria-label="顧客の導線の段階">
        {examples.map((e, i) => (
          <button
            key={e.step}
            type="button"
            aria-pressed={index === i}
            onClick={() => setIndex(i)}
          >
            <span>0{i + 1}</span>
            {e.step}
          </button>
        ))}
      </div>
      <div className="m-finding" aria-live="polite">
        <p className="m-pilot-label">{item.source}</p>
        <h3>{item.observation}</h3>
        <div className="m-two">
          <div>
            <h4>考えられる理由（仮説）</h4>
            <p>{item.hypothesis}</p>
          </div>
          <div>
            <h4>次に試すこと</h4>
            <p>{item.suggestion}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
