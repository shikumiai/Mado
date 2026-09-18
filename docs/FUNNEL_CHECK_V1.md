# 導線チェック — サイトまでの道が見える

> 2026-09-18 決定（Lyo）。Mado は「サイトを作る」に「そこまでの道が見える」を足して1つの商品にする。
> 有料（おまかせ以上）の機能。おためしはサイト内チェックのみ。
> この文書が設計の正。実装はここに合わせる。

## 1. 目的

お客さんが自分の導線（X → LINE → サイト → Discord など）を宣言すると、
**どこが切れているか**と**各段に何人来ているか**が1画面で分かる。

守ること:

- 配線の確認は AI と機械が行う。人の手配は商品に含めない
- 規約に触れる自動操作（X の投稿巡回、LINE の自動友だち追加）は作らない
- 「なぜ落ちるか」は数字で示す。AI の推測は「仮説」と明示して分ける

## 2. 言葉

| 言葉 | 意味 |
|---|---|
| 導線 | 入口から目的地までの段の並び。1サイトに複数持てる |
| 段（hop） | 導線の1つの場所。種類は下の表 |
| 追跡リンク | Mado が段ごとに発行する短い URL。お客さんが X のプロフィールや LINE のメニューに貼る。通った人数を数える |
| チェック | 導線を上から順に確かめて、段ごとの結果を残す1回の実行 |

## 3. 段の種類と、確かめること

| 種類 | 宣言するもの | 自動で確かめること | 確かめないこと（画面にそう書く） |
|---|---|---|---|
| `x` | プロフィール URL | 追跡リンクの通過数だけ | X のページ取得と投稿の巡回（規約） |
| `line` | 友だち追加 URL（lin.ee / line.me/R/ti/p / liff） | URL が生きているか、飛び先が LINE の友だち追加ページか | リッチメニュー・配信の中身（権限が要る） |
| `web` | 任意の URL | 状態コード、最終 URL、タイトル、**次の段へのリンクが本文にあるか**、スマホ幅の見た目（第2段階） | ログインの先、フォーム送信 |
| `mado` | 自分の Mado サイト | 設定を読んで、ボタンの飛び先・電話・住所・フォーム・見本のままの箇所（§7 サイト内チェック） | — |
| `member` | ログインが要るページ | 入口 URL が生きているか | 中身（テスト用アカウントをもらう運用は第2段階） |
| `discord` | 招待 URL | 招待が有効か・期限切れか・サーバー名・人数（公開 API、認証なし） | サーバーの中（ボット導入は第2段階） |

段の結果は3値: `ok` / `ng` / `skipped`（確かめない項目）。`ng` には理由の一文と根拠（状態コード・最終 URL・取得日時）を残す。

## 4. 追跡リンク

- 形: `https://mado.shikumiai.com/go/<code>`。`code` は英数字8文字（読み違えやすい文字を除く）
- 1つの段に1つ。段の「飛び先 URL」へ 302 で送る
- 記録するもの: 導線 ID、段の番号、時刻、User-Agent のハッシュ、Referer のホスト名だけ。IP は保存しない
- 数え方: 生のクリック数と、同じ端末らしいものを1日1回に丸めた人数の2つ。画面に出すのは丸めた人数
- 明らかなボット（UA に bot/crawler/preview を含む）は数えない
- 追跡リンクは導線を消しても壊さない（貼った先で 404 にしない）。飛び先だけ残す

## 5. データ

`supabase/migrations/0007_funnels.sql`

```sql
create table public.funnels (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  site_id uuid references public.sites(id) on delete set null,
  name text not null,                 -- 「X から LINE 経由」など
  hops jsonb not null default '[]',   -- Hop[]（§8 の型）
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tracked_links (
  code text primary key,              -- 8文字
  funnel_id uuid not null references public.funnels(id) on delete cascade,
  hop_index int not null,
  target_url text not null,
  created_at timestamptz not null default now()
);

create table public.tracked_clicks (
  id bigint generated always as identity primary key,
  code text not null references public.tracked_links(code) on delete cascade,
  clicked_at timestamptz not null default now(),
  visitor_hash text not null,         -- sha256(UA + 日付 + 塩)
  ref_host text
);

create table public.funnel_runs (
  id uuid primary key default gen_random_uuid(),
  funnel_id uuid not null references public.funnels(id) on delete cascade,
  status text not null check (status in ('running','done','failed')),
  results jsonb not null default '[]', -- HopResult[]（§8 の型）
  started_at timestamptz not null default now(),
  finished_at timestamptz
);
```

RLS:

- `funnels` / `funnel_runs` / `tracked_links`: 自分の org のものだけ読める・書ける（`org_members` で判定。既存の `owns_site` と同じ書き方）
- `tracked_clicks`: 読み取りは自分の org の導線に紐づくものだけ。書き込みは `/go` の処理が service_role で行う
- 集計は `funnel_clicks_daily(funnel_id)` の関数で返す（段ごと・日ごとの人数）

## 6. 画面

| 画面 | 役割 |
|---|---|
| `/app/funnels` | 導線の一覧。無ければ「最初の導線を作る」。おためしは鍵つきで見える（「おまかせで使えます」） |
| `/app/funnels/new` | 段を上から順に足す。種類を選び、URL を入れるだけ。自分の Mado サイトは選ぶだけ |
| `/app/funnels/[id]` | 主役。上から下へ段が並び、各段に「状態（ok/ng/skipped）」「追跡リンク（コピー）」「今週の人数」。上に「いま確かめる」ボタン。下に過去のチェック |

見せ方の原則:

- 段は縦一列。左に状態の丸、右に人数。落ちている段は人数の減り幅で目立つ
- `ng` の段は理由と根拠を1行で。「直す」は Mado サイトの段だけ編集画面へ飛ぶ
- `skipped` は灰色で「ここは確かめていません。理由: …」を書く。できるふりをしない
- 追跡リンクは「X のプロフィールに貼る」「LINE のメニューに貼る」の説明つきでコピー

## 7. サイト内チェック（全プラン）

自分の Mado サイトについて、設定を読んで確かめる。巡回は不要。

- ボタンの飛び先が存在する（ページ内アンカー・詳細ページ・外部 URL）
- 電話番号・住所が入っている
- お問い合わせの部品がある
- 見本のままの写真・文章が残っていない（`onboarding.ts` の判定をそのまま使う）
- 写真が壊れていない（パスが空でない）

結果は `/app` の「次にやること」の下に「公開前チェック」として出す。おためしはここまで。

## 8. 型の契約（実装はこれに合わせる）

`src/lib/funnels/types.ts`

```ts
export type HopKind = "x" | "line" | "web" | "mado" | "member" | "discord";

export interface Hop {
  kind: HopKind;
  label: string;          // 画面に出す名前
  url: string;            // 宣言した URL（mado は siteId）
}

export type HopStatus = "ok" | "ng" | "skipped";

export interface HopCheck {
  name: string;           // 「URL が生きている」「次の段へのリンクがある」
  status: HopStatus;
  reason?: string;        // ng / skipped の理由。一文
  evidence?: {            // 根拠。あるものだけ
    statusCode?: number;
    finalUrl?: string;
    title?: string;
    fetchedAt: string;    // ISO
  };
}

export interface HopResult {
  hopIndex: number;
  status: HopStatus;      // checks の最悪値
  checks: HopCheck[];
}
```

`src/lib/funnels/check.ts` … `runFunnelCheck(hops: Hop[]): Promise<HopResult[]>`
`src/lib/funnels/actions.ts` … Server Action。`createFunnel` / `updateFunnel` / `startRun` / `loadFunnel` / `clicksByHop`
`src/app/go/[code]/route.ts` … 302 と記録
`src/lib/funnels/site-check.ts` … §7

## 9. プラン

| | おためし | おまかせ | おまかせプロ |
|---|---|---|---|
| サイト内チェック | ○ | ○ | ○ |
| 導線の本数 | 0（画面は見える） | 3 | 無制限 |
| 「いま確かめる」 | — | ○ | ○ |
| 追跡リンク | — | ○ | ○ |
| 毎日の自動チェックと通知 | — | — | ○（第2段階） |

判定は既存の `planAllows` に `funnels` の項目を足す。価格は変えない。

## 10. 実装の順番

1. DB（§5）と `/go` の記録（§4）
2. チェックの中身（§3・§8）。まず `web` / `line` / `discord` / `mado`。`x` と `member` は入口だけ
3. 画面（§6）とプラン判定（§9）
4. サイト内チェック（§7）を `/app` に
5. LP の売り文句を「サイトを作る。そこまでの道も、見える。」に変える。料金表に導線チェックの行を足す
6. 第2段階: スマホ幅の見た目、毎日の自動チェック、通知

## 11. 合格条件

- 申込→公開→導線を1本登録→追跡リンクを発行→「いま確かめる」で段ごとの状態が出る。ここまで本番で通る
- `line` の切れた URL、`discord` の期限切れ招待、`web` の 404 を、それぞれ `ng` と理由つきで出せる
- 追跡リンクを踏むと飛び先に着き、翌日の画面に人数が出る
- おためしで `/app/funnels` を開くと鍵つきで見え、作れない
- `skipped` の段に「確かめていない理由」が必ず書いてある

## 12. 作らないもの

- 人のテスターの手配・報酬・見積（Codex 版の手動運用）。`/pilot` は残すが入口から外す
- X の投稿取得、LINE の自動友だち追加、会員サイトへの無断ログイン
- 「この導線は良い／悪い」の総合点。出すのは段ごとの状態と人数、それに「仮説」と明示した一言まで
