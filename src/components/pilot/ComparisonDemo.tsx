"use client";
import { useState } from "react";
const samples = [
  {
    title: "朝のひと息を、手軽に。",
    sub: "忙しい朝のためのドリップコーヒー",
    tone: "morning",
    point: "使う場面を伝える",
    note: "「朝に飲む自分」が想像できるか、という観点で比べます。",
  },
  {
    title: "好きな香りで、始めよう。",
    sub: "気分で選ぶ、毎日の一杯",
    tone: "aroma",
    point: "気持ちに届く言葉",
    note: "言葉の印象と、実際の商品情報にずれがないか確かめます。",
  },
  {
    title: "お湯を注いで、できあがり。",
    sub: "一杯分のドリップバッグ",
    tone: "simple",
    point: "分かりやすさを伝える",
    note: "初めて見た人にも、使い方がすぐ伝わるか確かめます。",
  },
];
export default function ComparisonDemo() {
  const [selected, setSelected] = useState(0);
  return (
    <div className="m-demo">
      <div className="m-demo-head">
        <span>同じ商品から、3つの伝え方。</span>
        <small>仕組みを示す架空のサンプル</small>
      </div>
      <div className="m-three">
        {samples.map((s, i) => (
          <button
            type="button"
            key={s.tone}
            className={`m-sample ${s.tone} ${selected === i ? "chosen" : ""}`}
            aria-pressed={selected === i}
            onClick={() => setSelected(i)}
          >
            <span className="m-sample-number">案{i + 1}</span>
            <div className="m-sample-copy">
              <strong>{s.title}</strong>
              <span>{s.sub}</span>
            </div>
            <div className="m-coffee" aria-hidden="true">
              <div className="m-pack">
                <span>
                  ひと息
                  <br />
                  珈琲
                </span>
                <small>drip coffee</small>
              </div>
              <div className="m-cup" />
            </div>
            <span className="m-sample-caption">{s.point}</span>
          </button>
        ))}
      </div>
      <div className="m-demo-result" aria-live="polite">
        <span>案{selected + 1}に注目</span>
        <p>{samples[selected].note}</p>
      </div>
      <p className="m-small">
        画像を押すと比較の視点が切り替わります。実際の納品物・利用者の評価ではありません。
      </p>
    </div>
  );
}
