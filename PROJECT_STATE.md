# プロジェクト棚卸し — Mado SaaS

> 最終更新: 2026-04-16（セクション構造+Push信頼性改善）

---

## 1. 全体構造

### ディレクトリツリー

```
shikumiya-saas/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # トップページ
│   │   ├── layout.tsx                # ルートレイアウト
│   │   ├── globals.css               # グローバルCSS
│   │   ├── start/                    # 新規申込フロー
│   │   │   ├── page.tsx              # ドメイン入力→Google認証→ウィザード→サイト生成
│   │   │   └── success/page.tsx      # 決済完了
│   │   ├── member/                   # 顧客管理エリア
│   │   │   ├── page.tsx              # ログイン画面（LoginModal、登録モード付き）
│   │   │   └── [orderId]/
│   │   │       ├── page.tsx          # ダッシュボード（注文なし→/start遷移）
│   │   │       ├── layout.tsx        # サイドバーレイアウト
│   │   │       ├── editor/page.tsx   # サイトエディタ（テンプレート直接描画）
│   │   │       ├── edit-request/     # 編集依頼フォーム
│   │   │       ├── edit/             # サイトエディタ（旧）
│   │   │       ├── features/         # 機能管理
│   │   │       ├── history/          # 依頼履歴
│   │   │       └── settings/         # アカウント設定
│   │   ├── admin/                    # Lyo管理エリア
│   │   │   ├── page.tsx              # ダッシュボード
│   │   │   ├── layout.tsx
│   │   │   ├── accounts/page.tsx     # 顧客一覧
│   │   │   └── requests/page.tsx     # 依頼キュー
│   │   ├── api/                      # APIルート
│   │   │   ├── start/                # 新規申込（無料=直接生成 / 有料=Stripe）
│   │   │   ├── webhook/              # Stripe webhook → サイト生成
│   │   │   ├── auth/register/        # Google認証 → GAS register_user
│   │   │   ├── member/find/          # 注文検索
│   │   │   ├── site-content/         # 顧客サイトconfig取得
│   │   │   ├── site-update/          # テキスト/画像即反映（手動編集）
│   │   │   ├── ai-edit/              # AI編集（OpenAI/Claude切替）
│   │   │   ├── plan-change/          # プラン変更
│   │   │   ├── edit-request/         # レイアウト/機能依頼
│   │   │   ├── admin/                # 管理データ取得
│   │   │   ├── logs/                 # ログ取得
│   │   │   ├── member/auth/          # 会員認証
│   │   │   ├── member/edit/          # 編集依頼登録
│   │   │   ├── member/[orderId]/     # 会員プロフィール
│   │   │   ├── upload-images/        # 画像アップロード
│   │   │   └── checkout/             # 旧API（廃止予定）
│   │   ├── lp/
│   │   │   └── construction/         # 建築向けLP
│   │   ├── portfolio-templates/      # SaaS用テンプレ（9種）
│   │   │   ├── warm-craft/           # otameshi
│   │   │   ├── warm-craft-mid/       # omakase
│   │   │   ├── warm-craft-pro/       # omakase-pro
│   │   │   ├── trust-navy/           # otameshi
│   │   │   ├── trust-navy-mid/       # omakase
│   │   │   ├── trust-navy-pro/       # omakase-pro (+recruit)
│   │   │   ├── clean-arch/           # otameshi
│   │   │   ├── clean-arch-mid/       # omakase
│   │   │   └── clean-arch-pro/       # omakase-pro
│   │   ├── templates/                # 旧アーティストテンプレ（10種・リダイレクト済）
│   │   ├── order/                    # 旧申込フロー（リダイレクト済）
│   │   ├── portfolio/                # 旧ポートフォリオ（リダイレクト済）
│   │   ├── preview/[templateId]/     # テンプレプレビュー
│   │   ├── features/                 # 機能紹介
│   │   ├── legal/                    # 利用規約
│   │   ├── privacy/                  # プライバシーポリシー
│   │   └── test/                     # テスト（リダイレクト済）
│   ├── components/
│   │   ├── *.tsx                     # トップページ用コンポーネント（18個）
│   │   ├── LoginModal.tsx            # ログインモーダル（登録モード対応）
│   │   ├── editor/                   # エディタ用コンポーネント
│   │   │   ├── SectionPanel.tsx       # セクション管理（DnD並び替え+表示トグル）
│   │   ├── template-renderers/        # テンプレート描画（セクション単位）
│   │   │   ├── WarmCraftRenderer.tsx  # warm-craft描画（セクション関数分割）
│   │   │   └── CleanArchRenderer.tsx  # clean-arch描画（セクション関数分割）
│   │   ├── portfolio-templates/      # テンプレ用コンポーネント
│   │   │   ├── DemoBanner.tsx        # デモ表示バナー（SaaS テンプレ共用）
│   │   │   ├── warm-craft/
│   │   │   ├── trust-navy/
│   │   │   ├── clean-arch/
│   │   │   └── (旧10種)/
│   │   └── templates/                # 旧テンプレ用コンポーネント（10テンプレ分）
│   └── lib/                          # 共通ライブラリ
│       ├── site-config-schema.ts     # 全テンプレ共通型定義 + Section型 + DEFAULT_SECTIONS + getSections()
│       ├── stripe.ts                 # プラン・価格ユーティリティ + normalizePlanId()
│       ├── github.ts                 # GitHub API操作 + getFileSha() + push検証（commitSha返却）
│       ├── template-config-generator.ts  # フォーム→SiteConfig変換
│       ├── error-handler.ts          # 統合ログ・エラー処理
│       ├── member-context.ts         # 会員認証Context
│       ├── industry-registry.ts      # 業種レジストリ（35業種）
│       ├── use-preview-name.ts       # プレビュー名フック（顧客リポにもコピー）
│       ├── site-data.ts              # 旧: アーティストポートフォリオ型
│       ├── template-forms.ts         # 旧: アーティストテンプレフォーム定義
│       └── SiteDataContext.tsx        # 旧: アーティストデータContext
├── gas/
│   └── webhook.gs                    # GAS: 注文記録・メール送信・認証・register_user
├── scripts/
│   ├── apply-order.mjs               # テキスト置換スクリプト
│   ├── order-watcher.mjs             # 注文ポーリング+Claude CLI連携
│   ├── optimize-images.mjs           # 画像最適化
│   └── generate_icon.py              # アイコン生成
├── template-site/
│   ├── shikumiya-template/           # 顧客サイト用テンプレートリポ
│   └── (旧テンプレ6種)/              # ai-art-portfolio等（旧）
├── public/
│   └── images/backgrounds/           # 背景テクスチャ（10種）
├── docs/                             # 設計ドキュメント（8ファイル）
├── plans/                            # 設計書
├── work-logs/                        # 作業ログ
├── test/                             # テスト
├── CLAUDE.md                         # プロジェクトルール
├── HANDOFF.md                        # セッション引き継ぎ
├── SKILL.md                          # スキル/フロー定義
└── AGENTS.md                         # Next.js注意事項
```

### 使用技術・主要ライブラリ

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js 16.2.0 (App Router, Turbopack) |
| 言語 | TypeScript 5 |
| ランタイム | React 19.2.4 |
| CSS | Tailwind CSS 4 + PostCSS |
| アニメーション | Framer Motion 12 |
| アイコン | lucide-react |
| 決済 | Stripe (サブスクリプション) |
| ホスティング | Vercel |
| リポ管理 | GitHub API |
| データストア | Google Apps Script (Spreadsheet) |
| 画像処理 | react-easy-crop, browser-image-compression, sharp |
| ドラッグ&ドロップ | @dnd-kit |
| AI編集 | OpenAI (gpt-4o-mini=テスト) / Claude API (本番) |

### ページ/ルート一覧と完成度

| パス | 役割 | 完成度 | 備考 |
|------|------|:------:|------|
| `/` | トップページ | 90% | CTA全て/start統一 |
| `/start` | 新規申込フロー | 90% | ドメイン入力→Google認証→ウィザード→無料プラン直接生成対応 |
| `/start/success` | 決済完了 | 70% | 静的。注文IDの動的表示がない |
| `/lp/construction` | 建築LP | 90% | SEO用 |
| `/member` | ログイン | 85% | LoginModal（登録モード対応）。注文なし→/start自動遷移 |
| `/member/[orderId]` | 顧客ダッシュボード | 40% | API接続済みだが一部ハードコード残り |
| `/member/[orderId]/editor` | サイトエディタ | 75% | セクション管理+DnD並び替え+テキスト編集+画像E2E+AI編集+Push信頼性改善 |
| `/member/[orderId]/edit-request` | 編集依頼 | 25% | UIあり。API未接続。データハードコード |
| `/member/[orderId]/features` | 機能管理 | 40% | プラン別ロック表示あり。データ静的 |
| `/member/[orderId]/settings` | アカウント設定 | 20% | UIあり。API未接続 |
| `/member/[orderId]/history` | 依頼履歴 | 20% | UIあり。データ静的 |
| `/admin` | Lyo管理ダッシュボード | 50% | GAS経由で一部実データ |
| `/admin/accounts` | 顧客一覧 | 45% | GAS経由で一部実データ |
| `/admin/requests` | 依頼キュー | 15% | 完全デモデータ |
| `/portfolio-templates/*` | テンプレデモ（9種） | 95% | site.config.json駆動 |
| `/templates/*` | 旧テンプレ（10種） | — | /startにリダイレクト済み |

---

## 2. 機能マッピング

### コア機能（事業の根幹）

| 機能名 | 完成度 | 状態 | 依存する他機能 |
|--------|:------:|------|--------------|
| プラン体系（otameshi/omakase/omakase-pro） | 95% | 動作する | なし |
| normalizePlanId()（旧→新ID変換） | 100% | 動作する | なし |
| Stripe決済（2プラン、おためしはStripe不要） | 90% | 動作する | なし |
| /start 申込フロー（ドメイン→認証→ウィザード） | 90% | 動作する | Stripe決済, Google認証 |
| サイト自動生成（/api/start） | 85% | 動作する | GitHub, Vercel, GAS |
| テンプレートリポ（shikumiya-template） | 70% | 動作する | なし |
| 顧客サイト config 駆動表示 | 95% | 動作する | テンプレートリポ |
| GAS 注文記録 + メール送信 + register_user | 85% | 動作する | Webhook |
| 業種レジストリ（35業種定義） | 90% | 動作する | なし |
| site-config-schema（型定義+Section+getSections） | 95% | 動作する | なし |
| Google認証 + ユーザー登録 | 80% | 動作する | GAS |

### 顧客向け機能

| 機能名 | 完成度 | 状態 | 依存する他機能 |
|--------|:------:|------|--------------|
| 会員ログイン（LoginModal、登録モード） | 85% | 動作する | GAS認証 |
| 注文なし→/start自動遷移 | 100% | 動作する | /api/member/find |
| サイトエディタ（セクション管理+DnD） | 75% | 動作する | Renderer, site-config, @dnd-kit |
| テキスト手動編集（全プラン無制限） | 85% | 動作する | /api/site-update（バッチコミット） |
| 画像アップロード+プレビュー | 75% | E2E接続済み | /api/site-update（画像先行push+config更新） |
| フォントピッカー（5書体） | 80% | 動作する | エディタ |
| AI編集（質問6問→Before/After） | 50% | 動作する（表示バグあり） | /api/ai-edit |
| 顧客ダッシュボード | 40% | 一部接続済 | GAS API |
| レイアウト/機能変更依頼 | 10% | UI仮組み | edit-request API, Claude API |
| プラン変更 | 20% | UI仮組み | plan-change API, Stripe |

### 管理者（Lyo）向け機能

| 機能名 | 完成度 | 状態 | 依存する他機能 |
|--------|:------:|------|--------------|
| 管理ダッシュボード（KPI） | 50% | UI仮組み | GAS全顧客取得 |
| 顧客一覧 | 45% | UI仮組み | GAS全顧客取得 |
| 依頼キュー | 15% | UI仮組み | GAS依頼取得, Claude API |
| MRR計算 | 0% | 未着手 | Stripe API or GAS |
| サブスク解約処理 | 5% | 未着手 | Webhook拡張 |

### API一覧

| エンドポイント | 完成度 | 状態 | 備考 |
|---------------|:------:|------|------|
| POST /api/start | 90% | 動作する | 無料=直接生成、有料=Stripe Checkout |
| POST /api/webhook | 80% | 動作する | config pushパス修正済み |
| POST /api/auth/register | 80% | 動作する | GAS register_user |
| GET /api/member/find | 80% | 動作する | 注文検索 |
| GET /api/site-content | 80% | 動作する | GitHub config取得 |
| POST /api/site-update | 90% | 動作する・接続済 | バッチコミット方式。テキスト/画像/セクション/スタイル一括 |
| POST /api/ai-edit | 70% | 動作する | OpenAI/Claude切替、Before/After |
| POST /api/plan-change | 70% | 動作する | フロントから未呼出 |
| POST /api/edit-request | 20% | UI仮組み | ログ記録のみ |
| GET /api/admin | 40% | UI仮組み | pending のみ取得 |
| GET /api/logs | 90% | 動作する | インメモリバッファ |
| POST /api/member/auth | 80% | 動作する | GAS verify |
| POST /api/member/edit | 70% | 動作する | 編集回数制御あり |
| GET /api/member/[orderId] | 70% | 動作する | GAS verify 経由 |
| POST /api/upload-images | 80% | 動作する | GitHub Gist 経由 |

---

## 3. データ構造

### 型定義（src/lib/site-config-schema.ts）

```
SiteConfig（顧客サイトの全データ）
├── templateId: string        # "warm-craft" | "warm-craft-mid" | ...
├── plan: "otameshi" | "omakase" | "omakase-pro"
├── orderId: string
├── siteUrl: string
├── company: CompanyInfo      # 会社名, 電話, メール, 住所, CEO, 経歴...
├── projects: Project[]       # 施工実績（全プラン）
├── strengths: Strength[]     # 強み（全プラン）
├── services?: Service[]      # サービス（trust-navy用）
├── stats?: Stat[]            # 数字実績（trust-navy用）
├── testimonials?: Testimonial[]  # お客様の声（omakase以上）
├── news?: NewsItem[]         # ニュース（omakase以上）
├── awards?: Award[]          # 受賞歴（clean-arch用）
├── bookingEvents?: BookingEvent[]  # 予約（omakase-pro）
├── chatFAQs?: ChatFAQ[]     # AIチャット（omakase-pro）
├── jobs?: JobPosting[]       # 採用（trust-navy omakase-pro用）
├── sections?: Section[]      # セクション順序+表示/非表示（実装済み・DnD対応）
└── style: StyleConfig        # 色, フォント, サイズ, ウェイト
```

### データの流れ

```
【申込フロー（無料プラン）】
/start → ドメイン入力 → Google認証 → ウィザード
  → /api/start
  → URL重複チェック
  → GitHub: テンプレートリポからリポ作成
  → GitHub: page.tsx + site.config.json + ライブラリファイルをpush
  → DemoBanner除去（正規表現: ^.*DemoBanner.*$）
  → Vercel: プロジェクト作成 + デプロイ
  → GAS: register_user（1回のみ）

【申込フロー（有料プラン）】
/start → ドメイン入力 → Google認証 → ウィザード → Stripe Checkout
  ↓ 決済完了
Stripe webhook → /api/webhook
  → 上記と同様のサイト生成フロー
  → GAS: 注文データ記録 + メール送信

【データストア】
Google Spreadsheet（GAS経由）
  ├── 注文データシート: order_id, company_name, email, plan, template, site_url, status...
  ├── 編集リクエストシート: order_id, type, content, score, status...
  └── ユーザーシート: register_user で登録

GitHub（顧客サイト用リポ）
  ├── src/app/page.tsx         # テンプレートのページ
  ├── src/app/site.config.json # 顧客データ
  ├── src/lib/site-config-schema.ts  # 型定義
  ├── src/lib/use-preview-name.ts    # プレビュー名フック
  └── public/images/           # 顧客の画像

Stripe
  └── サブスクリプション: customer_id, subscription_id, plan, status

【編集フロー（実装済み）】
顧客 /member/[orderId]/editor
  手動編集（テキスト/画像）→ /api/site-update → GitHub push → Vercel 自動リデプロイ
  AI編集 → /api/ai-edit → OpenAI or Claude → Before/After → 承認 → /api/site-update
```

---

## 4. 未接続・未実装の箇所

### 画面 → API の未接続

| 画面 | 呼ぶべきAPI | 現状 |
|------|-----------|------|
| `/member/[orderId]/edit-request` テキスト変更 | /api/site-update | UIあり。送信ボタンがAPIを呼ばない |
| `/member/[orderId]/edit-request` 画像変更 | /api/upload-images → /api/site-update | クロップUIあり。APIを呼ばない |
| `/member/[orderId]/edit-request` レイアウト変更 | /api/edit-request | UIあり。APIはログ記録のみ |
| `/member/[orderId]/settings` プラン変更 | /api/plan-change | UIあり。ボタンがAPIを呼ばない |
| `/member/[orderId]/settings` 会社情報保存 | /api/site-update | フォームあり。保存が動かない |
| `/admin/requests` 依頼一覧 | /api/admin?action=requests | ハードコードINITIAL_REQUESTS |

### API → 外部サービスの未接続

| API | 外部サービス | 現状 |
|-----|-----------|------|
| /api/edit-request | Claude API (Anthropic) | ログ記録のみ。Claude APIコール未実装 |
| /api/admin?action=accounts | GAS (get_all_customers) | GASに全顧客取得アクションなし |
| /api/admin?action=requests | GAS (get_edit_requests) | GASに依頼取得アクションなし |
| /api/admin (MRR) | Stripe API | MRR計算未実装 |
| /api/webhook (subscription.updated) | GAS | イベントログのみ |
| /api/webhook (subscription.deleted) | GAS | イベントログのみ |

### エディタの課題

| 問題 | 影響 | 状態 |
|------|------|------|
| Renderer と実テンプレートの見た目が乖離 | エディタ上で見た目が実際のサイトと異なる | 未解決 |
| Template-Renderer同期が手動 | テンプレ変更時にRendererも手動更新が必要 | 未解決 |
| trust-navy Renderer 未作成 | trust-navyテンプレの顧客はエディタ使用不可 | 未着手 |
| AI編集のBefore/Afterが空になるケースあり | 一部条件でプレビュー不可 | 未解決 |
| 背景画像ピッカーがエディタUIにない | 10テクスチャあるが選択UIなし | 未着手 |
| ~~画像アップロードE2E未テスト~~ | ~~アップロード→表示の全経路未検証~~ | **解決済み** |
| ~~セクション構造未実装~~ | ~~表示/非表示・並び替え不可~~ | **解決済み** |
| 顧客サイトテンプレートリポがsections未対応 | 実サイトはsections駆動で描画されない | 未着手 |

### 旧コードの残存

| ファイル/ディレクトリ | 状態 | 対応 |
|---------------------|------|------|
| `/api/checkout` | 旧API | 削除推奨 |
| `src/lib/site-data.ts` | 旧アーティスト型定義 | 削除推奨 |
| `src/lib/template-forms.ts` | 旧アーティストフォーム | 削除推奨 |
| `src/lib/SiteDataContext.tsx` | 旧アーティストContext | 削除推奨 |
| `src/app/templates/*` (10種) | リダイレクト済み | 将来削除 |
| `src/components/templates/*` | 旧テンプレコンポーネント | 将来削除 |
