# Mado — セッション引き継ぎメモ

> 最終更新: 2026-09-18（rebuild-v2 を本番へ切替 / 導線チェックを有料機能として実装中）

## ★ 次のセッションで最初にやること

1. このファイルを読む
2. `git fetch origin && git log --oneline -5 origin/main` と `gh pr list --repo shikumiai/Mado --state all` で、**本番（main）が誰の手で動いたか**を先に確かめる（下の「落とし穴」参照）
3. 設計の正を読む: `docs/TEMPLATE_SYSTEM_V3.md`（テンプレ）／`docs/ONBOARDING_V1.md`（公開後）／`docs/FUNNEL_CHECK_V1.md`（導線チェック）／`docs/ai/DECISIONS.md`（判断の記録）
4. `.claude/memory/MEMORY.md` と、プロジェクトのメモリを読む

---

## いま何をしているか（1行）

**「サイトを作る。そこまでの道も、見える。」を1つの商品にしている。**
ホームページ作成（rebuild-v2）は本番で稼働。導線チェック（X→LINE→サイト→Discord の配線と人数）を、おまかせ以上の機能として足している。

---

## 本番の場所

| もの | 値 |
|---|---|
| サービス名 | **Mado**（正規表記。カタカナ「マド」は使わない） |
| 本番URL | **https://mado.shikumiai.com** |
| 顧客サイト | `https://mado.shikumiai.com/{顧客のスラッグ}` |
| 本番コード | `main`（2026-09-18 に `rebuild-v2` を PR #1 で統合。以後の作業は main から枝を切る） |
| GitHub | **shikumiai/Mado** |
| Vercel | `shikumiais-projects/mado`（Hobby）。main への push が本番デプロイ |
| Supabase | `tayfsmypscyndfekbzsx`（東京・組織 shikumiai）。旧 `dralpswprcifzmgojgxu`（組織 site）は未削除 |
| Stripe | `acct_1UBIUDCMwxuV78LX`（JP / JPY / サンドボックス） |
| Google OAuth | Google Cloud プロジェクト `site-507418`（表示名 Mado）。戻り先に新旧 Supabase の両方を登録済み |

**アカウントは全部 shikumiai 側。** MCP コネクタは Tasuke 側に固定されているので、
Vercel / Supabase / GitHub は **CLI で触る**（`vercel` / `supabase` / `gh`。導入・認証済み）。

---

## どこまで終わっているか

| 領域 | 状態 |
|---|---|
| 器（Supabase 12テーブル・RLS・RPC・バケット） | ✅ 新プロジェクトに適用済み（0001〜0006） |
| 描画（DB から顧客サイト、10業種テンプレ、写真130枚） | ✅ 本番 |
| 認証（メール／パスキー／Google） | ✅ Google はプレビューで通し確認済み（2026-09-16） |
| 申込（名前先行・8ステップ・下書き再開・無料公開／Stripe） | ✅ プレビューで公開まで通し確認済み |
| 編集（部品の追加・複製・削除・見せ方・色・写真差し替え） | ✅ 本番 |
| 公開後の「次にやること」（見本のままの箇所を突き止めて1つずつ） | ✅ 実装済み（`src/lib/onboarding.ts`） |
| 写真をまとめて入れる画面 | ❌ 未着手（`docs/ONBOARDING_V1.md` §3-4） |
| 導線チェック | ⌛ 実装中（下記） |
| Codex 版の導線チェック（`/pilot`） | 残置。入口から外した。テーブル `mado_pilot_orders` / `mado_pilot_applications` / `mado_funnel_orders` は残る |

---

## 次にやること（この順番）

### ① 導線チェックの統合 ← ここから

2026-09-18 に Opus 5 のサブエージェント3体へ分担して実装中（Fable が設計・検収）。
それぞれ自分の worktree のブランチにコミットしている（push はしない約束）。

| 担当 | 中身 | 主なファイル |
|---|---|---|
| 裏側 | migration 0007・`/go/[code]`・チェック本体・Server Action・プラン判定 | `supabase/migrations/0007_funnels.sql` `src/lib/funnels/*` `src/app/go/[code]/route.ts` |
| 画面 | `/app/funnels`・`/new`・`/[id]`・マイページの入口・公開前チェック | `src/app/app/funnels/*` |
| 見せ方 | LP のヒーロー・料金表・OG 画像・metadata | `src/app/page.tsx` ほか |

統合の手順: main から `funnel-check` を切る → 3本を順に merge（`types.ts` は同じ内容なので衝突しない想定。画面側の `actions.ts` スタブがあれば裏側のもので置き換える）→ `tsc` / `build` → PR → 検収 → merge。

### ② migration 0007 を本番 DB に適用

`supabase/migrations/0007_funnels.sql` を Supabase の SQL Editor で実行（これまでと同じやり方）。
**適用は Lyo の確認を取ってから**（本番 DB 変更は 🔴）。

### ③ 本番で通し確認

申込 → 公開 → 導線を1本登録 → 追跡リンク発行 → 「いま確かめる」→ 段ごとの状態。
`docs/FUNNEL_CHECK_V1.md` §11 の合格条件をそのまま使う。

### ④ テストデータの削除（Lyo の可否を取る）

新 DB に残っているテスト: `mado-test-0916`（公開中）、`mado-test-0915`（申込途中）、
Codex の動作確認2行（`mado_pilot_orders` 1・`mado_funnel_orders` 1）。

---

## Lyo にしかできないこと（残り）

- **SMTP の送信元**を決める（確認メールは今も Supabase 既定の送信元で、送信数に上限がある）
- 旧 Supabase プロジェクト `dralpswprcifzmgojgxu` と組織 `site` の削除（取り消せない）
- テストデータ削除の可否（上の④）
- 旧リポジトリ `AndoLyo/shikumiya` の後始末

---

## 落とし穴（一度踏んだもの）

- **本番リポに2つのエージェントが merge 権を持っていた。** 2026-09-16、Lyo が Codex に「そこにデプロイして」と言った一言で、Codex が main に4本のPRを merge し本番を差し替えた（旧申込は転送・旧決済は 410）。rebuild-v2 の PR #1 は衝突して開いたまま。以後の約束: **決定は `docs/ai/DECISIONS.md` に書く。本番への merge とデプロイは Claude Code に一本化。** Codex に本番を触らせるときは作業票に明記する。
- **本体 checkout（`Shikumiai-HP`）の main は、2026-09-18 時点で古い（`ecf48fa`）。** 未コミットの料金カード作業（9/8〜13）は `wip/plancards-old-main` に退避してある。作業は `C:/dev/mado-rebuild` か main から切った新しい枝で。
- **ファイルは CRLF。** `sed` / 正規表現で `\n` を当てると空振りする。置換は Edit ツールか `\r?\n` で。
- **ブラウザの自動入力が Supabase の認証プロバイダ設定を汚す。** Google の Client ID / Secret に別サービス（tasuke）の値が入って `redirect_uri_mismatch` → `Unable to exchange external code` になった。保存前に Client ID の先頭（`1030602025638-`）を見る。
- **プレビューは URL ごとに別ドメイン**なので、ログイン状態は持ち越せない。通し確認は毎回ログインから。
- **押さえた名前を空き確認が「使用済み」と誤判定**していた（競合）。直したが、同種の「問い合わせ中に状態が変わる」処理は必ず `alive` フラグで古い返事を捨てる。
- 空のリポジトリで Vercel プロジェクトを作らない（フレームワークが `Other` で固定される）。`vercel.json` に `"framework": "nextjs"` を書いて固定済み。
- `npm i -g` は Git Bash から失敗する。PowerShell ツールを使う。
- DNS は「サーバーパネル」側の DNSレコード設定で編集する。
- 開発サーバーを常駐させない。実装 → `tsc` / `npm run build` → プレビュー/本番で確認。

---

## よく使うコマンド

```bash
npx tsc --noEmit                              # 型チェック
npm run build                                 # 本番ビルド
vercel ls mado --scope shikumiais-projects    # デプロイ一覧
vercel redeploy <URL> --scope shikumiais-projects   # 環境変数を変えたあとの作り直し
gh pr list --repo shikumiai/Mado --state all  # PR と、誰が main を動かしたか
supabase --version                            # 2.116.0

STRIPE_SECRET_KEY=... node scripts/stripe-setup.mjs          # 商品と価格（冪等）
STRIPE_SECRET_KEY=... node scripts/stripe-verify.mjs         # 疎通確認
STRIPE_SECRET_KEY=... node scripts/stripe-webhook-setup.mjs  # Webhook 登録
```

## 手順書

`docs/mado-setup-guide.html` — 公開までの7段（GitHub → Vercel → DNS → Google → Supabase）。
