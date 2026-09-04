# Mado — セッション引き継ぎメモ

> 最終更新: 2026-09-04（Supabase マルチテナント移行 / サービス名を Mado に確定 / Phase 3 実装）

## ★ 次のセッションで最初にやること

1. このファイルを読む
2. `docs/07_ARCHITECTURE_V2_SUPABASE.md` を読む（**現行の設計書**。`02_ARCHITECTURE.md` は旧設計の記録）
3. `.claude/memory/MEMORY.md` と、プロジェクトのメモリを読む

---

## いま何をしているか（1行）

**顧客サイトを「デプロイするもの」から「データベースを読んで描くもの」に作り替えている。**
顧客ごとに GitHub リポと Vercel プロジェクトを作る旧方式をやめ、1つのアプリに集約した。

---

## 本番の場所

| もの | 値 |
|---|---|
| サービス名 | **Mado**（正規表記。カタカナ「マド」は使わない） |
| 本番URL | **https://mado.shikumiai.com** |
| 顧客サイト | `https://mado.shikumiai.com/{顧客のスラッグ}` |
| GitHub | **shikumiai/Mado**（履歴は 2026-09-03 に切り直した） |
| Vercel | `shikumiais-projects/mado`（Hobby） |
| Supabase | `dralpswprcifzmgojgxu`（東京・プロジェクト名 `site` のまま） |
| Stripe | `acct_1UBIUDCMwxuV78LX`（JP / JPY / サンドボックス） |
| 旧リポジトリ | `AndoLyo/shikumiya`（116コミット。まだ消していない） |

**アカウントは全部 shikumiai 側。** MCP コネクタは Tasuke 側に固定されているので、
Vercel / Supabase / GitHub は **CLI で触る**（`vercel` / `supabase` / `gh`。導入・認証済み）。

---

## どこまで終わっているか

| Phase | 状態 |
|---|---|
| 0. 器（Supabase・10テーブル・RLS） | ✅ 実機検証済み |
| 1. 描画（`/[siteSlug]` でDBから顧客サイト） | ✅ **本番で確認済み** |
| 2. 認証（Supabase Auth） | ⌛ 実装済み。**通しの動作確認だけ未** |
| 3. 編集（保存先をDBに） | ⌛ 実装済み。**動作確認は Phase 2 の後** |
| 4. 申込（`/start` をDBに） | ❌ 未着手 |
| 5. 管理（`/admin` を実データに） | ❌ 未着手 |
| 6. テンプレ統合（9→3・trust-navy Renderer） | ❌ 未着手 |
| 7. 掃除（旧コード・GAS・next-auth 削除） | ❌ 未着手 |

**実証できていること**: 顧客サイトがDBから描ける／保存でビルドを挟まず反映される／
同時編集の衝突を 0.058 秒で検出する／Stripe の webhook 署名検証。

---

## 次にやること（この順番）

### ① ログインを通す ← ここから

`https://mado.shikumiai.com/auth/login` で Google ログインを試す。
設定はすべて済んでいる（クライアントID・リダイレクトURI・テストユーザー `ryoya112@gmail.com`）。

通ったら:
1. Supabase → Authentication → Users に出る **UID** を控える
2. `platform_admins` に入れて、Lyo を管理者にする
   ```sql
   insert into public.platform_admins (user_id, note)
   values ('<UID>', 'Lyo') on conflict do nothing;
   ```
3. `orgs` / `org_members` / `sites` にテスト用の1件を作って、
   `/member/site` → 編集 → 保存 → 顧客サイトに反映、を通しで確認する

※ 現状 `sites` にある `test-koumuten`（`bad86234-19e8-45d0-8d13-9d3f36e510b9`）は
`org_members` と紐づいていないので、ログインしても編集画面には出ない。紐付けが要る。

### ② Phase 4 — 申込フローをDBに

`/start` が今も「GitHubリポを作って Vercel にデプロイする」旧コードのまま。
本番で動くと**要らないリポジトリを量産する**。
安全装置として `GITHUB_TOKEN` / `VERCEL_TOKEN` を **Vercel の環境変数に入れていない**（意図的）。

やること: 申込 → `orgs` / `sites` / `site_configs` を INSERT するだけの形に書き換える。
Stripe webhook も「`orgs` の1行を更新するだけ」に。あわせて `stripe_events` テーブルを足して
`event.id` で重複を弾く（webhook の冪等性が未実装）。

### ③ Phase 6 — テンプレート統合

`trust-navy` の Renderer が無い。新設計では **Renderer が無いテンプレは売れない**。
9種を3系統に集約する（プラン差は `sections[]` の中身で表す）。

---

## Lyo にしかできないこと（残り）

- **ログインを1回通す**（ブラウザでのアカウント選択）
- Supabase プロジェクト名を `site` → `Mado` に（表示名だけ。影響なし）
- 旧リポジトリ `AndoLyo/shikumiya` の後始末（新しい側が安定してから）
- メール送信の移管先を決める（GAS を捨てると申込通知・完成通知が消える）

---

## 落とし穴（一度踏んだもの）

- **空のリポジトリで Vercel プロジェクトを作らない。** フレームワークが `Other` で固定され、
  ビルドは成功するのに全パス 404 になる。`vercel.json` に `"framework": "nextjs"` を書いて固定済み。
- **`npm i -g` は Git Bash から失敗する。** PowerShell ツールを使う。
- **DNS は「サーバーパネル」側の DNSレコード設定で編集する。** 会員ページ側の同名機能は効かない。
- **開発サーバーを常駐させない。** 実装 → `tsc` / `npm run build` → 本番で確認、の順で進める
  （2026-09-04 の Lyo の指示）。プロセスを落とすと子プロセスだけ死んで、
  HTTP 200 を返すのに中身が作れない状態になる。
- **Vercel のプロジェクト画面に出る短い URL は当てにならない。**
  実際に配られている URL は `gh api repos/shikumiai/Mado/deployments/<ID>/statuses` の
  `environment_url`、または `vercel ls mado`。

---

## よく使うコマンド

```bash
npx tsc --noEmit                              # 型チェック
npm run build                                 # 本番ビルド
vercel ls mado                                # デプロイ一覧
vercel inspect <URL> --logs                   # ビルドログ
vercel curl <URL>/path -s -o /dev/null -w '%{http_code}'   # 保護された本番を叩く
supabase --version                            # 2.116.0

STRIPE_SECRET_KEY=... node scripts/stripe-setup.mjs          # 商品と価格（冪等）
STRIPE_SECRET_KEY=... node scripts/stripe-verify.mjs         # 疎通確認
STRIPE_SECRET_KEY=... node scripts/stripe-webhook-setup.mjs  # Webhook 登録
```

## 手順書

`docs/mado-setup-guide.html` — 公開までの7段（GitHub → Vercel → DNS → Google → Supabase）。
チェックが保存されるので、途中から再開できる。
