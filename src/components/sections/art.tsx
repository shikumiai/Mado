"use client";

/**
 * 写真が来るまでの「絵」。グレーの四角は出さない。
 *
 * 実写が入るまでの間も、ページが完成して見えるように設計した線画を置く。
 * 色は TplPalette から実際の値をもらって塗る（SVG の fill は CSS 変数を受けない環境があるため）。
 * 後で実写に差し替えても枠のサイズが変わらないので、レイアウトは崩れない。
 */

import { useId } from "react";
import { useTplPalette } from "@/components/template-renderers/TplPalette";

/** SVG の中で使う id を一意にする（同じ絵を並べても定義がぶつからない） */
function useUid(prefix: string): string {
  return prefix + useId().replace(/[^a-zA-Z0-9]/g, "");
}

const FIT = { width: "100%", height: "100%", display: "block" } as const;

/* ═══════════════════════════════════════
   窓（Mado の顔）— ヒーロー用
   ═══════════════════════════════════════ */

/**
 * 窓枠の向こうに、朝の光と町並み。窓台には小さな鉢。
 * 「小さな会社の仕事に、世界へ開く窓を用意する」の1枚。
 */
export function WindowArt({ seed = 0 }: { seed?: number }) {
  const p = useTplPalette();
  const u = useUid("win");
  const roof = p.tones[seed % p.tones.length];
  return (
    <svg viewBox="0 0 520 460" preserveAspectRatio="xMidYMid slice" style={FIT} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={`${u}wall`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor={p.surface} />
          <stop offset="62%" stopColor={p.bg} />
          <stop offset="100%" stopColor={p.bgDeep} />
        </linearGradient>
        <linearGradient id={`${u}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.glow1} />
          <stop offset="52%" stopColor={p.glow2} />
          <stop offset="100%" stopColor={p.sub2Soft} />
        </linearGradient>
        <radialGradient id={`${u}sun`} cx="42%" cy="26%" r="42%">
          <stop offset="0%" stopColor={p.glow1} stopOpacity="0.95" />
          <stop offset="100%" stopColor={p.glow1} stopOpacity="0" />
        </radialGradient>
        <pattern id={`${u}grid`} width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M26 0H0V26" fill="none" stroke={p.ink} strokeOpacity="0.045" strokeWidth="1" />
        </pattern>
        <clipPath id={`${u}open`}>
          <rect x="84" y="60" width="352" height="300" rx="3" />
        </clipPath>
      </defs>

      <rect width="520" height="460" fill={`url(#${u}wall)`} />
      <rect width="520" height="460" fill={`url(#${u}grid)`} />

      {/* 窓の向こう */}
      <g clipPath={`url(#${u}open)`}>
        <rect x="84" y="60" width="352" height="300" fill={`url(#${u}sky)`} />
        <rect x="84" y="60" width="352" height="300" fill={`url(#${u}sun)`} />
        <circle cx="232" cy="140" r="30" fill={p.surface} fillOpacity="0.6" />
        {/* 遠くの山 */}
        <path d="M84 250 Q150 208 210 244 T330 232 T436 250 V360 H84 Z" fill={p.inkSoft} opacity="0.18" />
        {/* 町並み */}
        <g stroke={p.ink} strokeOpacity="0.34" strokeWidth="2" strokeLinejoin="round">
          <rect x="112" y="268" width="60" height="92" fill={p.surface} fillOpacity="0.8" />
          <polygon points="104,268 142,238 180,268" fill={roof} fillOpacity="0.85" />
          <rect x="196" y="286" width="52" height="74" fill={p.surface} fillOpacity="0.75" />
          <polygon points="190,286 222,262 254,286" fill={p.sub1} fillOpacity="0.7" />
          <rect x="272" y="252" width="70" height="108" fill={p.surface} fillOpacity="0.8" />
          <polygon points="264,252 307,222 350,252" fill={roof} fillOpacity="0.7" />
          <rect x="362" y="292" width="58" height="68" fill={p.surface} fillOpacity="0.72" />
        </g>
        {/* 灯りの入った小窓 */}
        <g fill={p.glow1}>
          <rect x="126" y="288" width="14" height="16" />
          <rect x="148" y="288" width="14" height="16" />
          <rect x="290" y="274" width="16" height="18" />
          <rect x="316" y="274" width="16" height="18" />
          <rect x="290" y="306" width="16" height="18" />
        </g>
        <line x1="84" y1="360" x2="436" y2="360" stroke={p.ink} strokeOpacity="0.28" strokeWidth="2" />
      </g>

      {/* 窓枠と桟 */}
      <rect x="84" y="60" width="352" height="300" rx="3" fill="none" stroke={p.primary} strokeWidth="13" />
      <rect x="91" y="67" width="338" height="286" rx="2" fill="none" stroke={p.ink} strokeOpacity="0.1" strokeWidth="1.5" />
      <line x1="260" y1="60" x2="260" y2="360" stroke={p.primary} strokeWidth="9" />
      <line x1="84" y1="212" x2="436" y2="212" stroke={p.primary} strokeWidth="9" />

      {/* 窓台 */}
      <rect x="62" y="358" width="396" height="15" rx="2" fill={p.primary} />
      <rect x="62" y="373" width="396" height="7" fill={p.primaryStrong} />

      {/* 差し込む光 */}
      <g opacity="0.5">
        <polygon points="112,380 436,380 500,460 168,460" fill={p.glow1} opacity="0.4" />
        <polygon points="268,380 436,380 476,460 316,460" fill={p.glow1} opacity="0.3" />
      </g>

      {/* 窓台の鉢 */}
      <g>
        <path d="M372 358 q6 -30 24 -34" fill="none" stroke={p.sub1} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M372 358 q-4 -24 -20 -30" fill="none" stroke={p.sub1} strokeWidth="2.6" strokeLinecap="round" />
        <ellipse cx="400" cy="322" rx="13" ry="7" fill={p.sub1} fillOpacity="0.55" />
        <ellipse cx="348" cy="326" rx="12" ry="6.5" fill={p.sub1} fillOpacity="0.4" />
        <path d="M362 336 h28 l-4 22 h-20 Z" fill={p.sub1} stroke={p.ink} strokeOpacity="0.28" strokeWidth="1.6" />
      </g>

      <rect x="8" y="8" width="504" height="444" rx="4" fill="none" stroke={p.ink} strokeOpacity="0.1" strokeWidth="1.5" />
    </svg>
  );
}

/* ═══════════════════════════════════════
   建物・現場（works 用）
   ═══════════════════════════════════════ */

type SceneKind = "house" | "reform" | "shop" | "office" | "civic" | "factory";

function kindOf(category?: string): SceneKind {
  const c = category || "";
  if (/リフォーム|改装|改修|増築/.test(c)) return "reform";
  if (/店|ショップ|カフェ|飲食|サロン/.test(c)) return "shop";
  if (/オフィス|ビル|事務所|マンション|集合/.test(c)) return "office";
  if (/工場|倉庫|産業|プラント/.test(c)) return "factory";
  if (/公共|学校|病院|医療|福祉|施設|園/.test(c)) return "civic";
  return "house";
}

/** 施工事例・作品の絵。分類の言葉から、住宅／改修／店舗／ビル／施設／工場を描き分ける */
export function SceneArt({ seed = 0, category }: { seed?: number; category?: string }) {
  const p = useTplPalette();
  const u = useUid("scn");
  const kind = kindOf(category);
  const roof = p.tones[seed % p.tones.length];
  const lit = seed % 3 !== 0;
  const glass = lit ? `url(#${u}win)` : p.mutedFill;
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={FIT} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={`${u}bg`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor={p.surface} />
          <stop offset="58%" stopColor={p.bgDeep} />
          <stop offset="100%" stopColor={p.line} />
        </linearGradient>
        <radialGradient id={`${u}sun`} cx="76%" cy="16%" r="58%">
          <stop offset="0%" stopColor={p.primary} stopOpacity="0.22" />
          <stop offset="100%" stopColor={p.primary} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${u}win`} cx="50%" cy="36%" r="72%">
          <stop offset="0%" stopColor={p.glow1} />
          <stop offset="100%" stopColor={p.glow2} />
        </radialGradient>
        <pattern id={`${u}grid`} width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M25 0H0V25" fill="none" stroke={p.ink} strokeOpacity="0.05" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width="400" height="300" fill={`url(#${u}bg)`} />
      <rect width="400" height="300" fill={`url(#${u}grid)`} />
      <rect width="400" height="300" fill={`url(#${u}sun)`} />
      <path d="M0 234 Q120 206 250 226 T400 220 V300 H0 Z" fill={p.inkSoft} opacity="0.14" />
      <line x1="0" y1="264" x2="400" y2="264" stroke={p.ink} strokeOpacity="0.28" strokeWidth="1.5" />

      {(kind === "house" || kind === "reform") && (
        <g>
          <rect x="266" y="112" width="16" height="40" fill={roof} stroke={p.ink} strokeOpacity="0.6" strokeWidth="2" />
          <polygon points="138,152 225,98 312,152" fill={roof} fillOpacity="0.92" stroke={p.ink} strokeOpacity="0.62" strokeWidth="2.6" strokeLinejoin="round" />
          <rect x="152" y="152" width="146" height="112" fill={p.surface} fillOpacity="0.94" stroke={p.ink} strokeOpacity="0.62" strokeWidth="2.6" />
          <g stroke={p.ink} strokeOpacity="0.6" strokeWidth="2">
            <rect x="168" y="168" width="42" height="34" rx="2" fill={glass} />
            <line x1="189" y1="168" x2="189" y2="202" strokeWidth="1.3" />
            <rect x="240" y="168" width="42" height="34" rx="2" fill={glass} />
            <line x1="261" y1="168" x2="261" y2="202" strokeWidth="1.3" />
          </g>
          <rect x="164" y="220" width="34" height="44" rx="2" fill={glass} stroke={p.ink} strokeOpacity="0.6" strokeWidth="2" />
          <rect x="207" y="214" width="36" height="50" rx="2" fill={p.primary} stroke={p.ink} strokeOpacity="0.6" strokeWidth="2" />
          <circle cx="236" cy="240" r="2.6" fill={p.surface} />
          <rect x="252" y="220" width="34" height="44" rx="2" fill={glass} stroke={p.ink} strokeOpacity="0.6" strokeWidth="2" />
        </g>
      )}

      {kind === "reform" && (
        <g stroke={p.sub1} strokeOpacity="0.85" strokeWidth="2" strokeLinecap="round">
          <line x1="132" y1="140" x2="132" y2="264" />
          <line x1="318" y1="140" x2="318" y2="264" />
          <line x1="132" y1="140" x2="318" y2="140" />
          <line x1="132" y1="186" x2="318" y2="186" />
          <line x1="132" y1="228" x2="318" y2="228" />
          <line x1="292" y1="186" x2="318" y2="228" />
        </g>
      )}

      {kind === "house" && (
        <g>
          <line x1="74" y1="264" x2="74" y2="206" stroke={p.ink} strokeOpacity="0.5" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="74" cy="190" r="26" fill={p.sub1} fillOpacity="0.24" />
          <circle cx="74" cy="190" r="26" fill="none" stroke={p.ink} strokeOpacity="0.45" strokeWidth="2.2" />
        </g>
      )}

      {kind === "shop" && (
        <g stroke={p.ink} strokeOpacity="0.6" strokeWidth="2.4">
          <rect x="96" y="126" width="212" height="138" fill={p.surface} fillOpacity="0.94" />
          <rect x="118" y="102" width="168" height="24" rx="3" fill={roof} />
          <path d="M96 156 h212 l-14 26 h-184 Z" fill={p.sub1} fillOpacity="0.55" />
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={i} x1={110 + i * 34} y1="156" x2={102 + i * 34} y2="182" strokeWidth="1.4" strokeOpacity="0.35" />
          ))}
          <rect x="116" y="196" width="94" height="68" fill={glass} />
          <line x1="163" y1="196" x2="163" y2="264" strokeWidth="1.4" />
          <rect x="232" y="196" width="56" height="68" fill={p.primary} fillOpacity="0.9" />
          <circle cx="278" cy="232" r="2.8" fill={p.surface} stroke="none" />
        </g>
      )}

      {kind === "office" && (
        <g stroke={p.ink} strokeOpacity="0.55" strokeWidth="2.2">
          <rect x="128" y="66" width="144" height="198" fill={p.surface} fillOpacity="0.92" />
          <rect x="278" y="140" width="72" height="124" fill={p.surface} fillOpacity="0.8" />
          {Array.from({ length: 5 }).map((_, r) =>
            Array.from({ length: 4 }).map((_, c) => (
              <rect key={`${r}-${c}`} x={142 + c * 33} y={84 + r * 32} width="22" height="20"
                fill={p.glow1} fillOpacity={(r + c) % 3 === 0 ? 0.9 : 0.3} strokeWidth="1.1" />
            ))
          )}
          {Array.from({ length: 3 }).map((_, r) =>
            Array.from({ length: 2 }).map((_, c) => (
              <rect key={`b${r}-${c}`} x={292 + c * 30} y={158 + r * 32} width="20" height="18"
                fill={p.glow2} fillOpacity={(r + c) % 2 === 0 ? 0.7 : 0.25} strokeWidth="1.1" />
            ))
          )}
          <rect x="176" y="230" width="48" height="34" fill={p.primary} fillOpacity="0.9" />
          <line x1="120" y1="230" x2="280" y2="230" strokeWidth="1.4" strokeOpacity="0.4" />
        </g>
      )}

      {kind === "civic" && (
        <g stroke={p.ink} strokeOpacity="0.58" strokeWidth="2.3">
          <rect x="84" y="146" width="232" height="102" fill={p.surface} fillOpacity="0.94" />
          <rect x="72" y="130" width="256" height="18" rx="2" fill={roof} />
          {Array.from({ length: 5 }).map((_, i) => (
            <rect key={i} x={104 + i * 48} y="164" width="16" height="84" fill={p.bgDeep} />
          ))}
          <rect x="176" y="196" width="48" height="52" fill={glass} />
          <rect x="72" y="248" width="256" height="8" fill={p.mutedFill} />
          <rect x="88" y="256" width="224" height="8" fill={p.bgDeep} />
        </g>
      )}

      {kind === "factory" && (
        <g stroke={p.ink} strokeOpacity="0.58" strokeWidth="2.3">
          <rect x="92" y="168" width="228" height="96" fill={p.surface} fillOpacity="0.92" />
          {Array.from({ length: 4 }).map((_, i) => (
            <polygon key={i} points={`${92 + i * 57},168 ${92 + i * 57},142 ${149 + i * 57},168`} fill={roof} fillOpacity="0.85" />
          ))}
          <rect x="330" y="94" width="20" height="170" fill={p.mutedFill} />
          {Array.from({ length: 4 }).map((_, i) => (
            <rect key={`w${i}`} x={110 + i * 54} y="196" width="34" height="26" fill={glass} strokeWidth="1.6" />
          ))}
          <rect x="112" y="234" width="60" height="30" fill={p.primary} fillOpacity="0.85" />
        </g>
      )}

      {/* 寸法線（図面の品位） */}
      <g stroke={p.ink} strokeOpacity="0.26" strokeWidth="1">
        <line x1="60" y1="284" x2="340" y2="284" />
        <line x1="60" y1="278" x2="60" y2="290" />
        <line x1="340" y1="278" x2="340" y2="290" />
      </g>
      <rect x="6" y="6" width="388" height="288" rx="3" fill="none" stroke={p.ink} strokeOpacity="0.12" strokeWidth="1.5" />
    </svg>
  );
}

/* ═══════════════════════════════════════
   人物（staff 用）
   ═══════════════════════════════════════ */

/** 顔写真が来るまでの枠。デュオトーンの地に、人のかたちを線で置く */
export function PortraitArt({ seed = 0 }: { seed?: number }) {
  const p = useTplPalette();
  const u = useUid("por");
  const hair = seed % 3;
  const [s1, s2] = p.stonePairs[seed % p.stonePairs.length];
  return (
    <svg viewBox="0 0 300 380" preserveAspectRatio="xMidYMid slice" style={FIT} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={`${u}bg`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={s1} />
          <stop offset="100%" stopColor={s2} />
        </linearGradient>
        <linearGradient id={`${u}body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.primary} stopOpacity="0.82" />
          <stop offset="100%" stopColor={p.primary} stopOpacity="0.62" />
        </linearGradient>
        <pattern id={`${u}grid`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke={p.ink} strokeOpacity="0.05" strokeWidth="1" />
        </pattern>
        <clipPath id={`${u}clip`}>
          <rect width="300" height="380" />
        </clipPath>
      </defs>

      <rect width="300" height="380" fill={`url(#${u}bg)`} />
      <rect width="300" height="380" fill={`url(#${u}grid)`} />
      <circle cx="150" cy="150" r="104" fill={p.surface} fillOpacity="0.5" />

      <g clipPath={`url(#${u}clip)`}>
        {/* 肩 */}
        <path d="M40 380 q0 -104 110 -104 t110 104 Z" fill={`url(#${u}body)`} />
        <path d="M118 288 q32 26 64 0" fill="none" stroke={p.surface} strokeOpacity="0.75" strokeWidth="3" />
        {/* 首 */}
        <rect x="132" y="228" width="36" height="46" rx="16" fill={p.primaryLift} />
        {/* 頭 */}
        <circle cx="150" cy="186" r="54" fill={p.primaryLift} />
        {/* 髪（3種で描き分け） */}
        {hair === 0 && <path d="M96 182 q4 -60 54 -60 t54 60 q-14 -28 -54 -28 t-54 28 Z" fill={p.ink} fillOpacity="0.72" />}
        {hair === 1 && (
          <path d="M92 208 q0 -86 58 -86 t58 86 q-10 -12 -18 -44 q-30 16 -80 4 q-6 24 -18 40 Z" fill={p.ink} fillOpacity="0.72" />
        )}
        {hair === 2 && (
          <g fill={p.ink} fillOpacity="0.72">
            <path d="M96 184 q6 -62 54 -62 t54 62 q-16 -30 -54 -30 t-54 30 Z" />
            <circle cx="206" cy="176" r="16" />
          </g>
        )}
      </g>

      <rect x="10" y="10" width="280" height="360" rx="3" fill="none" stroke={p.ink} strokeOpacity="0.12" strokeWidth="1.5" />
    </svg>
  );
}

/* ═══════════════════════════════════════
   料理・商品（menu 用）
   ═══════════════════════════════════════ */

type DishKind = "drink" | "dessert" | "noodle" | "salad" | "main";

function dishKindOf(category?: string, name?: string): DishKind {
  const c = `${category || ""}${name || ""}`;
  if (/ドリンク|飲|コーヒー|茶|酒|ワイン|ビール/.test(c)) return "drink";
  if (/デザート|スイーツ|ケーキ|甘|パフェ/.test(c)) return "dessert";
  if (/麺|パスタ|ラーメン|そば|うどん|スープ|汁/.test(c)) return "noodle";
  if (/前菜|サラダ|野菜|副菜|小鉢/.test(c)) return "salad";
  return "main";
}

/** 料理・商品の絵。品名と分類の言葉から、皿・丼・グラス・小皿を描き分ける */
export function DishArt({ seed = 0, category, name }: { seed?: number; category?: string; name?: string }) {
  const p = useTplPalette();
  const u = useUid("dsh");
  const kind = dishKindOf(category, name);
  const t1 = p.tones[seed % p.tones.length];
  const t2 = p.tones[(seed + 2) % p.tones.length];
  return (
    <svg viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice" style={FIT} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={`${u}bg`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor={p.surface} />
          <stop offset="100%" stopColor={p.bgDeep} />
        </linearGradient>
        <radialGradient id={`${u}light`} cx="30%" cy="18%" r="60%">
          <stop offset="0%" stopColor={p.glow1} stopOpacity="0.5" />
          <stop offset="100%" stopColor={p.glow1} stopOpacity="0" />
        </radialGradient>
        <pattern id={`${u}grid`} width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M18 0H0V18" fill="none" stroke={p.ink} strokeOpacity="0.045" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width="320" height="240" fill={`url(#${u}bg)`} />
      <rect width="320" height="240" fill={`url(#${u}grid)`} />
      <rect width="320" height="240" fill={`url(#${u}light)`} />

      {kind === "main" && (
        <g>
          <circle cx="160" cy="124" r="86" fill={p.surface} stroke={p.ink} strokeOpacity="0.28" strokeWidth="2" />
          <circle cx="160" cy="124" r="66" fill="none" stroke={p.ink} strokeOpacity="0.16" strokeWidth="1.4" />
          <ellipse cx="152" cy="118" rx="38" ry="26" fill={t1} fillOpacity="0.85" stroke={p.ink} strokeOpacity="0.35" strokeWidth="1.8" />
          <ellipse cx="188" cy="146" rx="20" ry="14" fill={t2} fillOpacity="0.75" stroke={p.ink} strokeOpacity="0.3" strokeWidth="1.6" />
          <path d="M124 152 q18 -12 34 -2" fill="none" stroke={p.sub1} strokeWidth="3" strokeLinecap="round" />
          <line x1="42" y1="88" x2="42" y2="160" stroke={p.ink} strokeOpacity="0.28" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="278" y1="88" x2="278" y2="160" stroke={p.ink} strokeOpacity="0.28" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      )}

      {kind === "noodle" && (
        <g>
          <path d="M74 106 h172 a86 86 0 0 1 -172 0 Z" fill={p.surface} stroke={p.ink} strokeOpacity="0.32" strokeWidth="2.4" />
          <ellipse cx="160" cy="106" rx="86" ry="18" fill={t1} fillOpacity="0.5" stroke={p.ink} strokeOpacity="0.3" strokeWidth="2" />
          <g stroke={p.sub1} strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.9">
            <path d="M116 104 q18 -16 40 -6" />
            <path d="M148 100 q20 -14 44 -2" />
          </g>
          <circle cx="196" cy="104" r="13" fill={t2} fillOpacity="0.8" stroke={p.ink} strokeOpacity="0.3" strokeWidth="1.6" />
          <line x1="228" y1="52" x2="268" y2="128" stroke={p.ink} strokeOpacity="0.3" strokeWidth="2.6" strokeLinecap="round" />
          <line x1="240" y1="50" x2="280" y2="126" stroke={p.ink} strokeOpacity="0.3" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      )}

      {kind === "salad" && (
        <g>
          <ellipse cx="160" cy="132" rx="78" ry="58" fill={p.surface} stroke={p.ink} strokeOpacity="0.28" strokeWidth="2" />
          <ellipse cx="160" cy="132" rx="58" ry="42" fill="none" stroke={p.ink} strokeOpacity="0.14" strokeWidth="1.4" />
          <g stroke={p.ink} strokeOpacity="0.34" strokeWidth="1.8">
            <path d="M132 126 q-16 -22 6 -30 q20 8 8 30 Z" fill={t1} fillOpacity="0.75" />
            <path d="M170 120 q-14 -24 10 -30 q20 10 6 30 Z" fill={t2} fillOpacity="0.7" />
            <circle cx="150" cy="150" r="12" fill={p.sub1} fillOpacity="0.6" />
            <circle cx="186" cy="148" r="9" fill={t1} fillOpacity="0.6" />
          </g>
        </g>
      )}

      {kind === "dessert" && (
        <g stroke={p.ink} strokeOpacity="0.3" strokeWidth="2.2">
          <path d="M112 90 h96 l-14 96 h-68 Z" fill={p.surface} />
          <path d="M118 128 h84 l-8 58 h-68 Z" fill={t1} fillOpacity="0.65" />
          <path d="M112 90 q48 -34 96 0" fill={t2} fillOpacity="0.8" />
          <circle cx="160" cy="66" r="10" fill={p.sub1} fillOpacity="0.85" />
          <rect x="122" y="186" width="76" height="10" rx="3" fill={p.mutedFill} />
        </g>
      )}

      {kind === "drink" && (
        <g stroke={p.ink} strokeOpacity="0.32" strokeWidth="2.4">
          <path d="M118 62 h84 l-12 116 a30 30 0 0 1 -60 0 Z" fill={p.surface} />
          <path d="M126 104 h68 l-8 74 a24 24 0 0 1 -52 0 Z" fill={t1} fillOpacity="0.6" />
          <line x1="160" y1="178" x2="160" y2="200" />
          <ellipse cx="160" cy="204" rx="34" ry="8" fill={p.mutedFill} />
          <line x1="212" y1="52" x2="182" y2="112" strokeWidth="3" strokeLinecap="round" stroke={p.sub1} strokeOpacity="0.9" />
        </g>
      )}

      <rect x="6" y="6" width="308" height="228" rx="3" fill="none" stroke={p.ink} strokeOpacity="0.12" strokeWidth="1.5" />
    </svg>
  );
}

/* ═══════════════════════════════════════
   地図（access 用）
   ═══════════════════════════════════════ */

/**
 * 地図の埋め込みが無いときの地図。
 * 区画・道路・線路・川・目印を、図面の線で描く。真ん中に店の位置。
 * 「地図が入る予定の空き地」ではなく、それだけで読める1枚にしてある。
 */
export function MapArt({ seed = 0, label }: { seed?: number; label?: string }) {
  const p = useTplPalette();
  const u = useUid("map");
  const t1 = p.tones[seed % p.tones.length];
  return (
    <svg viewBox="0 0 480 360" preserveAspectRatio="xMidYMid slice" style={FIT} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={`${u}bg`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor={p.surface} />
          <stop offset="100%" stopColor={p.bgDeep} />
        </linearGradient>
        <pattern id={`${u}grid`} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke={p.ink} strokeOpacity="0.05" strokeWidth="1" />
        </pattern>
        <radialGradient id={`${u}here`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={p.primary} stopOpacity="0.3" />
          <stop offset="100%" stopColor={p.primary} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="480" height="360" fill={`url(#${u}bg)`} />
      <rect width="480" height="360" fill={`url(#${u}grid)`} />

      {/* 川 */}
      <path d="M-10 300 q80 -40 150 -10 t150 -22 t200 -18" fill="none" stroke={p.sub2Soft} strokeWidth="22" strokeLinecap="round" opacity="0.75" />
      <path d="M-10 300 q80 -40 150 -10 t150 -22 t200 -18" fill="none" stroke={p.ink} strokeOpacity="0.1" strokeWidth="22" strokeLinecap="round" />

      {/* 区画（大通り・細道） */}
      <g stroke={p.mutedFill} strokeLinecap="square">
        <line x1="0" y1="150" x2="480" y2="150" strokeWidth="26" />
        <line x1="196" y1="0" x2="196" y2="360" strokeWidth="20" />
        <line x1="0" y1="66" x2="480" y2="66" strokeWidth="11" />
        <line x1="352" y1="0" x2="352" y2="300" strokeWidth="11" />
        <line x1="86" y1="66" x2="86" y2="290" strokeWidth="9" />
      </g>
      <g stroke={p.ink} strokeOpacity="0.14" strokeWidth="1.2">
        <line x1="0" y1="137" x2="480" y2="137" />
        <line x1="0" y1="163" x2="480" y2="163" />
        <line x1="186" y1="0" x2="186" y2="360" />
        <line x1="206" y1="0" x2="206" y2="360" />
      </g>
      <g stroke={p.surface} strokeWidth="2" strokeDasharray="10 12" opacity="0.9">
        <line x1="0" y1="150" x2="480" y2="150" />
        <line x1="196" y1="0" x2="196" y2="360" />
      </g>

      {/* 線路 */}
      <g>
        <line x1="0" y1="34" x2="480" y2="34" stroke={p.ink} strokeOpacity="0.4" strokeWidth="7" />
        <line x1="0" y1="34" x2="480" y2="34" stroke={p.surface} strokeWidth="3" strokeDasharray="7 7" />
        <rect x="228" y="18" width="60" height="32" rx="3" fill={p.surface} stroke={p.ink} strokeOpacity="0.45" strokeWidth="2" />
        <circle cx="258" cy="34" r="5" fill={p.sub1} />
      </g>

      {/* 街区 */}
      <g stroke={p.ink} strokeOpacity="0.18" strokeWidth="1.4">
        <rect x="24" y="82" width="50" height="42" fill={p.bgDeep} />
        <rect x="98" y="82" width="76" height="42" fill={p.bgDeep} />
        <rect x="220" y="82" width="118" height="42" fill={p.bgDeep} />
        <rect x="366" y="82" width="92" height="42" fill={p.bgDeep} />
        <rect x="24" y="176" width="50" height="72" fill={p.bgDeep} />
        <rect x="220" y="176" width="118" height="46" fill={p.bgDeep} />
        <rect x="366" y="176" width="92" height="72" fill={p.bgDeep} />
      </g>

      {/* 目印（公園・駐車場） */}
      <g>
        <rect x="98" y="176" width="76" height="72" rx="3" fill={t1} fillOpacity="0.3" stroke={p.ink} strokeOpacity="0.18" strokeWidth="1.4" />
        <circle cx="120" cy="204" r="11" fill={p.sub1} fillOpacity="0.5" />
        <circle cx="150" cy="224" r="8" fill={p.sub1} fillOpacity="0.4" />
        <rect x="366" y="264" width="52" height="34" rx="3" fill={p.surface} stroke={p.ink} strokeOpacity="0.3" strokeWidth="1.6" />
        <text x="392" y="287" textAnchor="middle" fontSize="19" fontWeight="700" fill={p.ink} fillOpacity="0.42" fontFamily="serif">P</text>
      </g>

      {/* ここ */}
      <circle cx="248" cy="196" r="52" fill={`url(#${u}here)`} />
      <rect x="220" y="176" width="56" height="46" fill={p.primary} fillOpacity="0.16" />
      <path d="M248 148 c-13 0 -23 10 -23 23 c0 17 23 41 23 41 s23 -24 23 -41 c0 -13 -10 -23 -23 -23 Z"
        fill={p.primary} stroke={p.surface} strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx="248" cy="170" r="7.5" fill={p.surface} />
      {label && (
        <g>
          <rect x="284" y="158" width={Math.min(168, label.length * 13 + 20)} height="26" rx="3"
            fill={p.surface} stroke={p.ink} strokeOpacity="0.2" strokeWidth="1.4" />
          <text x="294" y="176" fontSize="13" fontWeight="700" fill={p.ink} fontFamily="sans-serif">
            {label.length > 12 ? label.slice(0, 12) : label}
          </text>
        </g>
      )}

      {/* 方位と縮尺 */}
      <g transform="translate(438 300)">
        <circle r="17" fill={p.surface} stroke={p.ink} strokeOpacity="0.25" strokeWidth="1.4" />
        <path d="M0 -12 L5 4 L0 0 L-5 4 Z" fill={p.primary} />
        <text y="-19" textAnchor="middle" fontSize="9" fontWeight="700" fill={p.ink} fillOpacity="0.6" fontFamily="sans-serif">N</text>
      </g>
      <g stroke={p.ink} strokeOpacity="0.35" strokeWidth="1.6">
        <line x1="26" y1="332" x2="106" y2="332" />
        <line x1="26" y1="327" x2="26" y2="337" />
        <line x1="106" y1="327" x2="106" y2="337" />
      </g>
      <text x="66" y="348" textAnchor="middle" fontSize="10" fill={p.ink} fillOpacity="0.45" fontFamily="sans-serif">200m</text>

      <rect x="6" y="6" width="468" height="348" rx="3" fill="none" stroke={p.ink} strokeOpacity="0.12" strokeWidth="1.5" />
    </svg>
  );
}

/* ═══════════════════════════════════════
   お知らせ（news 用）
   ═══════════════════════════════════════ */

type NoticeKind = "event" | "closed" | "media" | "paper";

function noticeKindOf(category?: string): NoticeKind {
  const c = category || "";
  if (/見学|イベント|体験|フェア|セール|入荷|催/.test(c)) return "event";
  if (/休|年末|年始|臨時|営業時間/.test(c)) return "closed";
  if (/メディア|掲載|取材|受賞|新聞|雑誌/.test(c)) return "media";
  return "paper";
}

/** お知らせの絵。分類の言葉から、催し・休みの案内・掲載・お知らせを描き分ける */
export function NoticeArt({ seed = 0, category }: { seed?: number; category?: string }) {
  const p = useTplPalette();
  const u = useUid("ntc");
  const kind = noticeKindOf(category);
  const t1 = p.tones[seed % p.tones.length];
  return (
    <svg viewBox="0 0 360 240" preserveAspectRatio="xMidYMid slice" style={FIT} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={`${u}bg`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor={p.surface} />
          <stop offset="100%" stopColor={p.bgDeep} />
        </linearGradient>
        <radialGradient id={`${u}light`} cx="24%" cy="14%" r="66%">
          <stop offset="0%" stopColor={p.glow1} stopOpacity="0.55" />
          <stop offset="100%" stopColor={p.glow1} stopOpacity="0" />
        </radialGradient>
        <pattern id={`${u}grid`} width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M18 0H0V18" fill="none" stroke={p.ink} strokeOpacity="0.045" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width="360" height="240" fill={`url(#${u}bg)`} />
      <rect width="360" height="240" fill={`url(#${u}grid)`} />
      <rect width="360" height="240" fill={`url(#${u}light)`} />

      {kind === "paper" && (
        <g stroke={p.ink} strokeOpacity="0.3" strokeWidth="2">
          <rect x="94" y="40" width="150" height="168" rx="3" fill={p.surface} transform="rotate(-3 169 124)" />
          <rect x="112" y="32" width="150" height="168" rx="3" fill={p.surface} />
          <g stroke={p.ink} strokeOpacity="0.18" strokeWidth="1.6">
            <line x1="130" y1="72" x2="244" y2="72" />
            <line x1="130" y1="96" x2="244" y2="96" />
            <line x1="130" y1="120" x2="212" y2="120" />
            <line x1="130" y1="152" x2="244" y2="152" />
            <line x1="130" y1="176" x2="196" y2="176" />
          </g>
          <rect x="130" y="50" width="58" height="10" rx="2" fill={p.primary} stroke="none" />
          <circle cx="228" cy="176" r="17" fill={t1} fillOpacity="0.55" stroke={p.primary} strokeWidth="2" />
        </g>
      )}

      {kind === "event" && (
        <g stroke={p.ink} strokeOpacity="0.32" strokeWidth="2.2">
          <line x1="86" y1="42" x2="86" y2="206" strokeWidth="4" strokeLinecap="round" />
          <path d="M86 50 h150 l-26 30 l26 30 h-150 Z" fill={p.primary} stroke="none" />
          <path d="M86 50 h150 l-26 30 l26 30 h-150 Z" fill="none" />
          <path d="M108 128 h132 a10 10 0 0 1 10 10 v58 a10 10 0 0 1 -10 10 h-132 Z" fill={p.surface} />
          <g stroke={p.ink} strokeOpacity="0.18" strokeWidth="1.6">
            <line x1="124" y1="150" x2="232" y2="150" />
            <line x1="124" y1="170" x2="208" y2="170" />
          </g>
          <circle cx="284" cy="76" r="20" fill={t1} fillOpacity="0.5" stroke="none" />
          <circle cx="306" cy="118" r="12" fill={p.sub1} fillOpacity="0.45" stroke="none" />
        </g>
      )}

      {kind === "closed" && (
        <g stroke={p.ink} strokeOpacity="0.32" strokeWidth="2.2">
          <rect x="94" y="46" width="172" height="156" rx="5" fill={p.surface} />
          <rect x="94" y="46" width="172" height="34" rx="5" fill={p.primary} stroke="none" />
          <line x1="94" y1="80" x2="266" y2="80" />
          <line x1="126" y1="34" x2="126" y2="58" strokeWidth="5" strokeLinecap="round" />
          <line x1="234" y1="34" x2="234" y2="58" strokeWidth="5" strokeLinecap="round" />
          {Array.from({ length: 12 }).map((_, i) => {
            const c = i % 4, r = Math.floor(i / 4);
            const off = i === 5 || i === 6;
            return (
              <rect key={i} x={116 + c * 36} y={98 + r * 32} width="24" height="22" rx="2"
                fill={off ? p.primarySoft : p.bgDeep} stroke={off ? p.primary : p.line}
                strokeWidth={off ? 2 : 1.2} />
            );
          })}
        </g>
      )}

      {kind === "media" && (
        <g stroke={p.ink} strokeOpacity="0.3" strokeWidth="2">
          <rect x="72" y="52" width="196" height="144" rx="3" fill={p.surface} />
          <rect x="88" y="68" width="164" height="16" rx="2" fill={p.ink} fillOpacity="0.75" stroke="none" />
          <rect x="88" y="96" width="76" height="58" rx="2" fill={t1} fillOpacity="0.5" />
          <g stroke={p.ink} strokeOpacity="0.18" strokeWidth="1.5">
            <line x1="176" y1="102" x2="252" y2="102" />
            <line x1="176" y1="120" x2="252" y2="120" />
            <line x1="176" y1="138" x2="230" y2="138" />
            <line x1="88" y1="170" x2="252" y2="170" />
          </g>
          <g transform="translate(276 168)">
            <circle r="26" fill={p.primary} />
            <path d="M0 -13 l4.3 8.7 l9.6 1.4 l-7 6.8 l1.7 9.6 l-8.6 -4.5 l-8.6 4.5 l1.7 -9.6 l-7 -6.8 l9.6 -1.4 Z"
              fill={p.onPrimary} stroke="none" />
          </g>
        </g>
      )}

      <rect x="6" y="6" width="348" height="228" rx="3" fill="none" stroke={p.ink} strokeOpacity="0.12" strokeWidth="1.5" />
    </svg>
  );
}

/* ═══════════════════════════════════════
   引用の地紋（voices 用）
   ═══════════════════════════════════════ */

/** 声の背景に敷く、光の帯。文字を邪魔しない薄さで置く */
export function QuoteField({ seed = 0 }: { seed?: number }) {
  const p = useTplPalette();
  const u = useUid("qtf");
  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="none" style={FIT} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <radialGradient id={`${u}g`} cx={`${24 + seed * 12}%`} cy="8%" r="70%">
          <stop offset="0%" stopColor={p.glow1} stopOpacity="0.5" />
          <stop offset="100%" stopColor={p.glow1} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="260" fill={p.surface} />
      <rect width="400" height="260" fill={`url(#${u}g)`} />
    </svg>
  );
}
