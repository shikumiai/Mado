"use client";

/**
 * スタイルガイド。設計トークンと共通UI部品を1枚で見渡すページ。
 * 色・文字・角丸・影・ボタンの全状態・入力欄・カード・バッジ・トースト・
 * シート・タブ・スケルトン・テーマ切替を、その場で触って確かめられる。
 */

import { useState } from "react";
import {
  Button,
  Card,
  Badge,
  Field,
  Skeleton,
  Tabs,
  Sheet,
  ThemeToggle,
  Mascot,
  useToast,
} from "@/components/ui";
import { Eye, Pencil, Bot, Sparkles, Check } from "lucide-react";

/* ---- 見出し付きの区切り ---- */
function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line py-10">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      {desc && <p className="mt-1 text-sm text-ink2">{desc}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/* ---- 色の見本 ---- */
function Swatch({ name, varName }: { name: string; varName: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-16 w-full rounded-lg border border-line"
        style={{ background: `var(${varName})` }}
      />
      <div className="text-xs">
        <div className="font-medium text-ink">{name}</div>
        <div className="tnum text-ink3">{varName}</div>
      </div>
    </div>
  );
}

const SURFACE_TOKENS = [
  { name: "bg", varName: "--bg" },
  { name: "surface", varName: "--surface" },
  { name: "surface2", varName: "--surface2" },
  { name: "accent-soft", varName: "--accent-soft" },
];
const INK_TOKENS = [
  { name: "ink", varName: "--ink" },
  { name: "ink2", varName: "--ink2" },
  { name: "ink3", varName: "--ink3" },
  { name: "brand", varName: "--brand" },
  { name: "accent", varName: "--accent" },
];
const STATUS_TOKENS = [
  { name: "success", varName: "--success" },
  { name: "warn", varName: "--warn" },
  { name: "danger", varName: "--danger" },
  { name: "info", varName: "--info" },
];

const RADII = [
  { name: "sm 8", cls: "rounded-sm" },
  { name: "md 12", cls: "rounded-md" },
  { name: "lg 16", cls: "rounded-lg" },
  { name: "xl 20", cls: "rounded-xl" },
  { name: "2xl 28", cls: "rounded-2xl" },
  { name: "pill", cls: "rounded-pill" },
];

const SHADOWS = [
  { name: "sh1", cls: "shadow-sh1" },
  { name: "sh2", cls: "shadow-sh2" },
  { name: "sh3", cls: "shadow-sh3" },
];

const EDITOR_TABS = [
  { value: "view", label: "見る", icon: <Eye className="size-4" aria-hidden /> },
  { value: "edit", label: "編集", icon: <Pencil className="size-4" aria-hidden /> },
  { value: "ai", label: "AI", icon: <Bot className="size-4" aria-hidden /> },
];

export default function StyleGuidePage() {
  const { toast } = useToast();
  const [tab, setTab] = useState("view");
  const [sheetRight, setSheetRight] = useState(false);
  const [sheetBottom, setSheetBottom] = useState(false);
  const [fieldValue, setFieldValue] = useState("");

  return (
    <div className="mx-auto max-w-4xl px-6 pb-20">
      {/* ヘッダー */}
      <header className="flex flex-wrap items-center justify-between gap-4 py-8">
        <div className="flex items-center gap-3">
          <Mascot size={40} />
          <div>
            <h1 className="text-xl font-bold text-ink">Mado スタイルガイド</h1>
            <p className="text-sm text-ink2">
              設計トークンと共通UI部品の一覧（rebuild-v2）
            </p>
          </div>
        </div>
        <ThemeToggle showLabel />
      </header>

      {/* 色 */}
      <Section title="色" desc="ネイビー × クリーム × オレンジ。ライト/ダーク両対応。">
        <div className="flex flex-col gap-6">
          <div>
            <div className="mb-2 text-xs font-medium text-ink2">地・面</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SURFACE_TOKENS.map((t) => (
                <Swatch key={t.varName} {...t} />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium text-ink2">文字・ブランド・差し色</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {INK_TOKENS.map((t) => (
                <Swatch key={t.varName} {...t} />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium text-ink2">状態</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STATUS_TOKENS.map((t) => (
                <Swatch key={t.varName} {...t} />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium text-ink2">
              アクセントグラデ（CTAと印だけ・面には塗らない）
            </div>
            <div className="grad-accent h-12 w-full rounded-lg" />
          </div>
        </div>
      </Section>

      {/* 文字 */}
      <Section title="文字" desc="本文 = Noto Sans JP（行間1.7）。数字・コード = JetBrains Mono（等幅）。">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-ink">見出し1 まどをあける</h1>
          <h2 className="text-2xl font-bold text-ink">見出し2 まどをあける</h2>
          <h3 className="text-xl font-semibold text-ink">見出し3 まどをあける</h3>
          <p className="max-w-2xl text-sm leading-relaxed text-ink2">
            本文サンプル。写真を送るだけで、あとは全部おまかせ。むずかしい言葉は
            使わず、押したら何が起きるかがひと目で分かる画面をめざします。
          </p>
          <p className="tnum text-base text-ink">
            金額の桁は等幅で揃える: ¥1,480 / ¥4,980 / 0123456789
          </p>
        </div>
      </Section>

      {/* 角丸 */}
      <Section title="角丸">
        <div className="flex flex-wrap gap-4">
          {RADII.map((r) => (
            <div key={r.name} className="flex flex-col items-center gap-1.5">
              <div
                className={`size-16 border border-line bg-surface2 ${r.cls}`}
              />
              <span className="tnum text-xs text-ink3">{r.name}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* 影 */}
      <Section title="影">
        <div className="flex flex-wrap gap-6">
          {SHADOWS.map((s) => (
            <div key={s.name} className="flex flex-col items-center gap-2">
              <div className={`size-20 rounded-lg bg-surface ${s.cls}`} />
              <span className="text-xs text-ink3">{s.name}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ボタン */}
      <Section title="ボタン" desc="primary=オレンジ塗り / cta=グラデ / secondary=枠線 / ghost。">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">オレンジ塗り</Button>
            <Button variant="cta" leftIcon={<Sparkles className="size-4" aria-hidden />}>
              申し込む
            </Button>
            <Button variant="secondary">枠線</Button>
            <Button variant="ghost">控えめ</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">小</Button>
            <Button size="md">中</Button>
            <Button size="lg">大</Button>
            <Button pill variant="primary">
              ピル形
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button loading>読み込み中</Button>
            <Button disabled>押せない</Button>
            <Button variant="secondary" rightIcon={<Check className="size-4" aria-hidden />}>
              アイコン付き
            </Button>
          </div>
        </div>
      </Section>

      {/* 入力欄 */}
      <Section title="入力欄" desc="ラベル + 入力 + 補足 + その場のエラー。">
        <div className="grid max-w-xl gap-5">
          <Field
            label="会社名"
            placeholder="例）まど工務店"
            helper="あとから変えられます。"
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
          />
          <Field
            label="メールアドレス"
            type="email"
            placeholder="you@example.com"
            error="メールアドレスの形が正しくないようです。"
            required
          />
          <Field
            label="ひとこと"
            multiline
            placeholder="やりたいことを自由に書いてください。"
            helper="長くなっても大丈夫です。"
          />
        </div>
      </Section>

      {/* カード */}
      <Section title="カード" desc="面（surface）+ 淡い枠 + 影。glass は差し色カードに薄く。">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h3 className="font-semibold text-ink">通常カード</h3>
            <p className="mt-1.5 text-sm text-ink2">
              中身をひとまとまりに見せる面。角丸xl・影sh2。
            </p>
          </Card>
          <div className="grad-accent rounded-xl p-4">
            <Card variant="glass">
              <h3 className="font-semibold text-ink">ガラスカード</h3>
              <p className="mt-1.5 text-sm text-ink2">
                後ろが透けて見える。差し色の上に重ねて質感を出す。
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* バッジ */}
      <Section title="バッジ" desc="状態を小さなピルで示す。">
        <div className="flex flex-wrap gap-2">
          <Badge>準備中</Badge>
          <Badge tone="success">公開中</Badge>
          <Badge tone="warn">確認待ち</Badge>
          <Badge tone="danger">停止中</Badge>
          <Badge tone="info">下書き</Badge>
          <Badge tone="accent">おすすめ</Badge>
        </div>
      </Section>

      {/* トースト */}
      <Section title="トースト" desc="画面の下にそっと出て、しばらくで消える。理由を添える。">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                title: "保存しました",
                description: "変更はすぐにサイトへ反映されます。",
                tone: "success",
              })
            }
          >
            成功を出す
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                title: "画像が大きすぎます",
                description: "10MB までにしてください。",
                tone: "warn",
              })
            }
          >
            注意を出す
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                title: "保存できませんでした",
                description: "通信が不安定なようです。少し待って試してください。",
                tone: "danger",
              })
            }
          >
            エラーを出す
          </Button>
        </div>
      </Section>

      {/* シート */}
      <Section title="シート" desc="横または下から出るパネル。割り込みモーダルの代わり。">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setSheetRight(true)}>
            右から開く
          </Button>
          <Button variant="secondary" onClick={() => setSheetBottom(true)}>
            下から開く
          </Button>
        </div>

        <Sheet
          open={sheetRight}
          onClose={() => setSheetRight(false)}
          side="right"
          title="設定パネル"
          description="Esc か背景のクリックで閉じます。"
        >
          <div className="flex flex-col gap-4">
            <Field label="サイト名" placeholder="まど工務店" />
            <Field label="キャッチコピー" placeholder="地域で50年、まごころ施工。" />
            <Button variant="primary" block>
              保存
            </Button>
          </div>
        </Sheet>

        <Sheet
          open={sheetBottom}
          onClose={() => setSheetBottom(false)}
          side="bottom"
          title="下から出るシート"
        >
          <p className="text-sm text-ink2">
            スマホでは下から出す方が指が届きやすい。中身は自由に置けます。
          </p>
        </Sheet>
      </Section>

      {/* タブ */}
      <Section title="タブ" desc="エディタの「見る / 編集 / AI」。左右キーでも動く。">
        <Tabs
          tabs={EDITOR_TABS}
          value={tab}
          onValueChange={setTab}
          aria-label="エディタのモード"
        />
        <Card className="mt-4">
          {tab === "view" && (
            <p className="text-sm text-ink2">見るモード: サイトをそのまま確認します。</p>
          )}
          {tab === "edit" && (
            <p className="text-sm text-ink2">編集モード: クリックして文字や写真を直します。</p>
          )}
          {tab === "ai" && (
            <p className="text-sm text-ink2">AIモード: いくつか答えると下書きを作ります。</p>
          )}
        </Card>
      </Section>

      {/* スケルトン */}
      <Section title="スケルトン" desc="読み込み中の場所取り。きらっと流れる（動き無効設定なら静止）。">
        <div className="flex max-w-md flex-col gap-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="flex items-center gap-3 pt-1">
            <Skeleton className="size-12" style={{ borderRadius: 999 }} />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        </div>
      </Section>

      {/* マスコット */}
      <Section title="マスコット「むすび」" desc="副操縦士の常在プレゼンス。実画像は後で差す（今は淡いリング）。">
        <div className="flex items-end gap-6">
          <Mascot size={40} />
          <Mascot size={64} />
          <Mascot size={96} />
        </div>
      </Section>
    </div>
  );
}
