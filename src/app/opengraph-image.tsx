import { ImageResponse } from "next/og";

export const alt = "Mado｜サイトを作る。そこまでの道も、見える。";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Mado の色（src/app/globals.css のライト側トークンと同じ値） */
const CREAM = "#fbf8f3"; // 地
const SAND = "#f1ebe0"; // 一段落とした砂色
const NAVY = "#25314f"; // ブランド濃紺
const INK2 = "#54607a"; // 副文字
const INK3 = "#8a93a6"; // 補足
const ORANGE = "#e8873a"; // 差し色
const TERRA = "#c06a3f"; // テラコッタ

/** Mado のロゴマーク（窓 = 枠 + 桟。左上のガラスに暖色の光） */
function WindowMark() {
  return (
    <div style={{ position: "relative", display: "flex", width: "66px", height: "72px" }}>
      <div
        style={{
          position: "absolute",
          left: "0px",
          top: "0px",
          width: "66px",
          height: "72px",
          borderRadius: "10px",
          border: `4px solid ${NAVY}`,
          background: SAND,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "9px",
          top: "9px",
          width: "20px",
          height: "23px",
          background: ORANGE,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "31px",
          top: "2px",
          width: "4px",
          height: "68px",
          background: NAVY,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "2px",
          top: "34px",
          width: "62px",
          height: "4px",
          background: NAVY,
          display: "flex",
        }}
      />
    </div>
  );
}

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: CREAM,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* 上端の光の線 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: `linear-gradient(90deg, transparent, ${ORANGE}, ${TERRA}, transparent)`,
          }}
        />

        {/* 角の罫 */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "40px",
            width: "60px",
            height: "60px",
            borderTop: `2px solid ${NAVY}`,
            borderLeft: `2px solid ${NAVY}`,
            opacity: 0.35,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "40px",
            width: "60px",
            height: "60px",
            borderBottom: `2px solid ${NAVY}`,
            borderRight: `2px solid ${NAVY}`,
            opacity: 0.35,
          }}
        />

        {/* ロゴ */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <WindowMark />
          <div
            style={{
              display: "flex",
              fontSize: "58px",
              fontWeight: 700,
              color: NAVY,
              letterSpacing: "0.08em",
            }}
          >
            Mado
          </div>
        </div>

        {/* 主張 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "38px",
          }}
        >
          <div style={{ display: "flex", fontSize: "60px", fontWeight: 700, color: NAVY }}>
            サイトを作る。
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "60px",
              fontWeight: 700,
              color: NAVY,
              marginTop: "10px",
            }}
          >
            そこまでの道も、
            <span style={{ color: ORANGE }}>見える</span>。
          </div>
        </div>

        {/* 飾りの線 */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "30px" }}>
          <div style={{ width: "72px", height: "1px", background: ORANGE, opacity: 0.5 }} />
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: ORANGE }} />
          <div style={{ width: "72px", height: "1px", background: ORANGE, opacity: 0.5 }} />
        </div>

        {/* 副文 */}
        <div
          style={{
            display: "flex",
            fontSize: "22px",
            color: INK2,
            marginTop: "28px",
            textAlign: "center" as const,
          }}
        >
          写真を送るだけでホームページができます
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "22px",
            color: INK2,
            marginTop: "8px",
            textAlign: "center" as const,
          }}
        >
          X・LINE・Discord からサイトまでの道のりも確かめられます
        </div>

        {/* 補足 */}
        <div style={{ display: "flex", fontSize: "16px", color: INK3, marginTop: "22px" }}>
          制作費0円・月額0円から — by Lyo Vision
        </div>
      </div>
    ),
    { ...size }
  );
}
