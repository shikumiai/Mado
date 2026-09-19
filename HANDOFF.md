# Mado — セッション引き継ぎメモ

> 最終更新: 2026-09-19（サービス設計 v1 を固め、導線チェック・問い合わせ通知・LP の新しい顔を本番へ）

## ★ 次のセッションで最初にやること

1. このファイルを読む
2. `git fetch origin && git log --oneline -5 origin/main` と `gh pr list --repo shikumiai/Mado --state all` で、**本番（main）が誰の手で動いたか**を先に確かめる（下の「落とし穴」参照）
3. **全体の正 `docs/SERVICE_DESIGN_V1.md`** を読む。個別の設計書はその下: `TEMPLATE_SYSTEM_V3.md`／`ONBOARDING_V1.md`／`FUNNEL_CHECK_V1.md`。判断の記録は `docs/ai/DECISIONS.md`、作業票は `docs/ai/TASK.md`
4. `.claude/memory/MEMORY.md` と、プロジェクトのメモリを読む

---

## いま何をしているか（1行）

**「サイトを作る。そこまでの道も、見える。」を本番に出した。次は「客を受けられる状態」の残り（Lyo の手が要る設定）と仕上げ。**
作業は全部 Fable 5.1 が直接やる（Lyo 指示 2026-09-18）。サブエージェントは立てない。

---

## 本番の場所

| もの | 値 |
|---|---|
| サービス名 | **Mado**（正規表記。カタカナ「マド」は使わない） |
| 本番URL | **https://mado.shikumiai.com** |
| 顧客サイト | `https://mado.shikumiai.com/{顧客のスラッグ}` |
| 追跡リンク | `https://mado.shikumiai.com/go/{8文字}` |
| 本番コード | `main`（2026-09-18 に rebuild-v2、2026-09-19 に funnel-check を統合） |
| GitHub | **shikumiai/Mado** |
| Vercel | `shikumiais-projects/mado`（Hobby）。main への push が本番デプロイ。**環境変数を変えたら再デプロイが要る** |
| Supabase | `tayfsmypscyndfekbzsx`（東京・組織 shikumiai）。migration 0001〜0007 適用済み。旧 `dralpswprcifzmgojgxu`（組織 site）は未削除 |
| Stripe | `acct_1UBIUDCMwxuV78LX`（JP / JPY / **サンドボックス**。実客はまだ払えない） |
| Google OAuth | Google Cloud プロジェクト `site-507418`（表示名 Mado）。戻り先に新旧 Supabase の両方を登録済み |
| メール送信元 | `support@shikumiai.com`（エックスサーバー `sv17051.xserver.jp`、465）。Vercel の `SMTP_*` / `MAIL_FROM` は設定済み・送信テスト済み（2026-09-19） |

**アカウントは全部 shikumiai 側。** Vercel / Supabase / GitHub は **CLI で触る**（`vercel` / `supabase` / `gh`。導入・認証済み）。
Supabase の SQL は `supabase db query --linked -f <file>`（Management API 経由・DB パスワード不要。`supabase link --project-ref tayfsmypscyndfekbzsx --password ""` 済み）。

---

## どこまで終わっているか

| 領域 | 状態 |
|---|---|
| 器（Supabase 16テーブル・RLS・RPC・バケット） | ✅ 0001〜0007 適用済み |
| 描画（DB から顧客サイト、10業種テンプレ、写真130枚） | ✅ 本番 |
| 認証（メール／パスキー／Google） | ✅ 本番（Google はプレビューで通し確認） |
| 申込（名前先行・8ステップ・下書き再開・無料公開／Stripe） | ✅ 本番（Stripe はサンドボックス） |
| 編集（部品の追加・複製・削除・見せ方・色・写真差し替え・履歴） | ✅ 本番 |
| 公開後の「次にやること」・公開前チェック | ✅ 本番 |
| 導線チェック（宣言→追跡リンク→いま確かめる→段ごとの状態と人数） | ✅ 本番（2026-09-19）。おまかせ以上 |
| 問い合わせの通知（持ち主へメール）とマイページ一覧 `/app/inquiries` | ✅ コードは本番。**SMTP のパスワード待ちで、まだ送れない**（送れないときは記録だけ残す） |
| LP の顔（SNS で集客する個人事業主・小さな店） | ✅ 本番 |
| 写真をまとめて入れる画面 | ❌ 未着手（`ONBOARDING_V1.md` §3-4） |
| 毎日の自動チェックと通知（プロの理由） | ❌ 未着手 |
| 管理画面の「段ごとの数」 | ❌ 未着手（`SERVICE_DESIGN_V1.md` §4・§8） |
| Codex 版の導線チェック（`/pilot`・画像生成の案件） | Codex の担当。コードとテーブルは残置、入口外 |

---

## 次にやること（この順番）

### ① Lyo の手が要る設定（客を受ける前に）

| # | 何を | どこで |
|---|---|---|
| 1 | ~~`SMTP_PASS` を Vercel に~~ → **済み（2026-09-19）**。問い合わせ通知は本番で送れる状態 | — |
| 2 | 同じ SMTP を **Supabase の確認メール**にも設定 | Supabase → Authentication → Emails → SMTP。Host `sv17051.xserver.jp` / Port `465` / Username `support@shikumiai.com` / Password（メール箱の）/ Sender email `support@shikumiai.com` / Sender name `Mado` |
| 3 | `ANTHROPIC_API_KEY` を Vercel に入れる（AI編集が Claude で動く。無いと OpenAI かデモ） | 同上。モデルは `ANTHROPIC_MODEL`（既定 `claude-sonnet-5`） |
| 4 | Stripe を本番に（本番鍵・Webhook・価格の作り直し）。これが実客受付の開始日 | `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` を本番鍵に。`node scripts/stripe-setup.mjs` は冪等（Lyo の端末で本番鍵を付けて実行） |

### ② 仕上げ（Claude の作業）

1. 管理画面 `/admin` に段ごとの数（登録・公開・仕上がり・導線・有料）
2. 写真をまとめて入れる画面
3. 毎日の自動チェックと、切れたときの通知（プロ）
4. 掃除: `/member/site`（旧会員トップ）、`/features`（旧・山田工務店の見本ページ）、`/lp/*`（判断待ち）

### ③ Codex の独立レビュー（作業票 `docs/ai/TASK.md`）

PR #6 の RLS・DB・`/go`・外部 URL 取得の安全装置。指摘は別 PR で直す。

---

## Lyo にしかできないこと（残り）

- 上の①（SMTP パスワード・Anthropic の鍵・Stripe 本番鍵）
- 旧 Supabase プロジェクト `dralpswprcifzmgojgxu` と組織 `site` の削除（取り消せない）
- 旧リポジトリ `AndoLyo/shikumiya` の後始末
- Vercel のプラン（Lyo の判断）

---

## 落とし穴（一度踏んだもの）

- **本番リポに2つのエージェントが merge 権を持っていた。** 2026-09-16、Codex が main に4本のPRを merge し本番を差し替えた。以後: 決定は `docs/ai/DECISIONS.md`、本番への merge とデプロイは Claude Code に一本化。Codex に本番を触らせるときは作業票に明記。
- **Vercel の環境変数は、変えただけでは動いている本番に入らない。** 次のデプロイで読み込まれるので、変えたら `vercel redeploy <URL>` か push で作り直す。
- **`vercel ls` は表を標準エラーに出す。** スクリプトで拾うなら `2>&1`。
- **ファイルは CRLF。** `sed` / 正規表現で `\n` を当てると空振りする。置換は Edit ツールか `\r?\n` で。
- **ブラウザ操作: `browser_batch` の中で ref 指定のクリックは失敗する。** 座標クリックか、単独の `computer` 呼び出しで。`form_input` は batch の中でも動く。accounts.google.com への操作は batch では拒否されるので単独で。
- **ブラウザの自動入力が Supabase の認証プロバイダ設定を汚す。** Google の Client ID は `1030602025638-` で始まるのが正。
- **プレビューは URL ごとに別ドメイン**なので、ログイン状態は持ち越せない。プレビューは Vercel の保護があり `curl` では SSO に飛ぶ。叩くなら `vercel curl <URL> --scope shikumiais-projects -- -A "<ブラウザUA>"`。
- **押さえた名前を空き確認が「使用済み」と誤判定**していた。問い合わせ中に状態が変わる処理は `alive` フラグで古い返事を捨てる。
- 空のリポジトリで Vercel プロジェクトを作らない。`npm i -g` は PowerShell から。DNS は「サーバーパネル」側。開発サーバーを常駐させない。

---

## よく使うコマンド

```bash
npx tsc --noEmit                              # 型チェック
npm run build                                 # 本番ビルド
vercel ls mado --scope shikumiais-projects 2>&1   # デプロイ一覧
vercel redeploy <URL> --scope shikumiais-projects # 環境変数を変えたあとの作り直し
vercel env ls --project mado --scope shikumiais-projects
gh pr list --repo shikumiai/Mado --state all  # PR と、誰が main を動かしたか
supabase db query --linked "select count(*) from public.orgs"
supabase db query --linked -f supabase/migrations/000X.sql   # マイグレーション適用（冪等）

STRIPE_SECRET_KEY=... node scripts/stripe-setup.mjs          # 商品と価格（冪等）
STRIPE_SECRET_KEY=... node scripts/stripe-verify.mjs         # 疎通確認
STRIPE_SECRET_KEY=... node scripts/stripe-webhook-setup.mjs  # Webhook 登録
```

## 手順書

`docs/mado-setup-guide.html` — 公開までの7段（GitHub → Vercel → DNS → Google → Supabase）。
