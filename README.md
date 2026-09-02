# Mado

中小零細企業向けのホームページ制作 SaaS。写真を送るだけで公開まで届く。

- 本体: `https://mado.shikumiai.com`
- 顧客サイト: `https://mado.shikumiai.com/{顧客のスラッグ}`
- プラン: おためし ¥0 ／ おまかせ ¥1,480 ／ おまかせプロ ¥4,980（月額・制作費0円）

## 作りの要点

**顧客サイトはデータベースの行として持つ。**
1つの Next.js アプリが、URL のスラッグから顧客を判定し、Supabase から設定を読んで描く。
顧客が増えてもインフラは1セットのまま、編集はビルドを挟まずに反映される。

| 層 | 使うもの |
|---|---|
| 表示 | Next.js 16 App Router / Vercel（東京 hnd1） |
| データ | Supabase Postgres（東京 ap-northeast-1） |
| 認証 | Supabase Auth（Google） |
| 画像 | Supabase Storage |
| 決済 | Stripe（Checkout + Billing） |

## 動かす

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 本番ビルド
```

環境変数は `.env.local` に置く。必要な項目は `docs/07_ARCHITECTURE_V2_SUPABASE.md` の
「環境変数」節にまとめてある。

## データベース

`supabase/migrations/` の SQL を連番順に Supabase の SQL Editor で流す。
すべて冪等に書いてあるので、何度実行しても安全。

```
0001_init.sql                 テーブル・RLS・スラッグ検証・Storage
0002_config_save_result.sql   サイト設定の保存（同時編集の衝突検出）
0003_reserve_auth_slugs.sql   予約スラッグの追加
```

## Stripe

商品と価格の用意、疎通確認、Webhook 登録はスクリプトで行う。何度流しても増えない。

```bash
STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs
STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-verify.mjs
STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-webhook-setup.mjs
```

Price ID はコードにも環境変数にも固定しない。`lookup_key` で引くので、
Dashboard 側で価格を作り直しても追従する。

## ドキュメント

| ファイル | 中身 |
|---|---|
| `docs/07_ARCHITECTURE_V2_SUPABASE.md` | **現行の設計書**（構成・DDL・RLS・実装フェーズ） |
| `docs/mado-setup-guide.html` | 公開までの手順（GitHub → Vercel → DNS → Google → Supabase） |
| `docs/02_ARCHITECTURE.md` | 旧設計（顧客ごとにリポとプロジェクトを作る方式）の記録 |
| `docs/00_INDEX.md` | ドキュメント一覧 |
