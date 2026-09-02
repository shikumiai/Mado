# Mado — セッション引き継ぎメモ

> 最終更新: 2026-04-16（セクション構造+Push信頼性改善セッション）

## ★ 次のセッションで最初にやること

1. このファイルを読む
2. PROJECT_STATE.md を読む
3. memory/ のMEMORY.mdを読む

**次のタスク:**
- trust-navy Renderer 作成（セクション単位描画方式で）
- エディタのレイアウト品質向上（Renderer と実テンプレートの見た目を近づける）
- AI編集のBefore/After表示が空になる問題の修正
- 背景画像ピッカーのエディタUI追加
- 顧客サイトテンプレートリポ（shikumiya-template）もセクション駆動に更新
- プラン変更UI→API接続

**直近完了（本セッション）:**
- セクション構造を実装済み（Section型定義 + DEFAULT_SECTIONS + getSections()）
- Renderer2つ（WarmCraft/CleanArch）をセクション単位の関数に分割・動的描画化
- エディタにセクション管理パネル追加（@dnd-kitドラッグ並び替え + 表示/非表示トグル）
- セクション変更は即プレビュー反映（シームレス・楽観的更新）
- 画像アップロードE2E接続済み（エディタ→site-update API→GitHub push + config更新）
- 全site.config.json（10テンプレ）にsections配列追加済み
- **site-update APIをバッチコミット方式に全面書き直し**:
  - config変更を1コミットにまとめる（旧: 変更ごとに個別push）
  - 画像先行push → config更新の順序保証
  - pushFileToRepo / pushBinaryFileToRepo がコミットSHA返却で検証
  - SHA指定pushで競合検出
  - エディタに3段階フィードバック（全成功/一部失敗/全失敗）
- github.tsにgetFileSha()追加、push関数にcommitSha返却追加

## 本番稼働中

- **URL:** https://shikumiya.vercel.app
- **GitHub:** AndoLyo/shikumiya（旧lyo-vision-site からリネーム済み）
- **Vercelプロジェクト名:** shikumiya
- **Stripe:** テストモード、2プラン設定済み（otameshi は無料のためStripe不要）

## 動作確認済みフロー

- /start → ドメイン入力 → Google認証 → ウィザード → サイト生成（おためし） ✅
- /start → Stripe決済（おまかせ/おまかせプロ） → webhook → GAS記録 + メール送信 → サイト生成 ✅
- 決済後に /start/success ページ表示 ✅
- Stripeテスト決済（カード 4242...）✅
- /member → ログイン → 注文がない場合 /start へ自動遷移 ✅
- /member/[orderId]/editor → テンプレート直接描画 → テキスト編集 → 保存 ✅
- /api/ai-edit → OpenAI/Claude切替 → Before/After表示 ✅
- GAS register_user → ユーザー登録 ✅
- /api/member/find → 注文検索 ✅

## 事業概要

**Mado** — 全業種対応のHP制作SaaS（建築特化ではない）
- 制作費0円、月額おためし¥0 / おまかせ¥1,480 / おまかせプロ¥4,980
- 内部ID: otameshi / omakase / omakase-pro
- normalizePlanId()で旧ID（lite/middle/premium）→新IDへの後方互換変換あり
- 「写真を送るだけ。あとは全部おまかせ」

## プラン体系

| プラン | 内部ID | 月額 | AI編集 | 主な機能 |
|--------|--------|------|--------|---------|
| おためし | otameshi | ¥0 | 不可（手動のみ） | ヒーロー、情報表示、ギャラリー、SNSリンク、サブドメイン、ロゴ表示 |
| おまかせ | omakase | ¥1,480 | 月3回 | +独自ドメイン、ロゴ非表示、Maps、ブログ、お客様の声、採用 |
| おまかせプロ | omakase-pro | ¥4,980 | 無制限 | +SEO設計、問い合わせフォーム、予約、AIチャット、360°ビュー |

Stripe Price ID:
- STRIPE_PRICE_OMAKASE=price_1TME8iAHGiGiMXDLnD472lto
- STRIPE_PRICE_OMAKASE_PRO=price_1TME9WAHGiGiMXDLgUexR5PV

## テンプレート

- 建築パック完成済み: warm-craft / trust-navy / clean-arch × otameshi/omakase/omakase-pro = 9テンプレ
- 全テンプレsite.config.json分離済み
- industry-registry.ts: 15カテゴリ35業種登録。テンプレあり=表示、なし=非表示
- 背景画像: /public/images/backgrounds/ に10テクスチャ

## 完成済みのシステム

### API
| エンドポイント | 用途 | 状態 |
|-------------|------|:---:|
| /api/start | 新規申込→無料プランはサイト直接生成、有料はStripe | ✅動作確認済 |
| /api/webhook | 決済→サイト生成 | ✅動作確認済 |
| /api/auth/register | Google認証→GAS register_user | ✅実装済 |
| /api/member/find | 注文検索 | ✅実装済 |
| /api/site-content | 顧客リポのconfig取得 | ✅実装済 |
| /api/site-update | バッチコミット方式。テキスト/画像/セクション/スタイル一括反映 | ✅実装済・接続済 |
| /api/ai-edit | AI編集（OpenAI=テスト/Claude=本番） | ✅実装済 |
| /api/plan-change | プラン変更 | ✅実装済（未接続） |
| /api/edit-request | レイアウト/機能依頼 | ✅実装済（Claude API未実装） |
| /api/admin | 管理データ取得 | ✅実装済（GAS依存） |
| /api/logs | ログ取得 | ✅実装済 |
| /api/member/auth | 会員認証 | ✅動作確認済 |
| /api/member/edit | 編集依頼登録 | ✅動作確認済 |
| /api/member/[orderId] | 会員プロフィール | ✅動作確認済 |
| /api/upload-images | 画像アップロード（GitHub Gist経由） | ✅実装済 |

### フロントエンド
- トップページ: 全業種対応、全CTA→/start
- /start: ドメイン入力→Google認証→ウィザード→サイト生成（無料プラン直接生成対応）
- /start/success: 決済完了ページ
- /lp/construction: 建築向けLP
- /portfolio-templates/*: 9テンプレデモ（DemoBanner付き）
- /member: ログイン画面（LoginModal、登録モード付き）
- /member/[orderId]/: 顧客管理（サイドバー+プラン別ロック+編集依頼+クロップUI）
- /member/[orderId]/editor: サイトエディタ（テンプレート直接描画、3モード）
- /admin/: Lyo管理（ダッシュボード+依頼キュー+顧客一覧）

### エディタ（2026-04-16 実装 → セクション構造追加）
- パス: /member/[orderId]/editor
- 描画方式: テンプレートを直接描画（iframe不使用）
- Template Renderers: WarmCraftRenderer.tsx, CleanArchRenderer.tsx（セクション単位描画。trust-navy未作成）
- **セクション管理**: 「構成」ボタン → 左サイドパネル → ドラッグ並び替え + 表示/非表示トグル
- セクション変更は即座にプレビュー反映（シームレス・楽観的更新）
- 3モード構成: 見る / 編集 / AI
- 編集モード: 要素クリック→編集パネル。テキスト直接編集、画像アップロード+プレビュー
- **画像アップロード**: E2E接続済み。エディタ→/api/site-update→GitHub push + config更新
- フォントピッカー: 5書体（Gothic, Mincho, Maru, Mono, Elegant）
- 編集中はリンク無効化
- AIモード: 質問6問（選択式+自由記述）→ OpenAI/Claude → Before/After比較 → 承認

### 共通ライブラリ
- site-config-schema.ts: 22型定義 + **Section型 + SectionType + DEFAULT_SECTIONS + getSections()**
- industry-registry.ts: 35業種レジストリ
- stripe.ts: Price IDマッピング、プラン名、normalizePlanId()
- github.ts: GitHub API共通ユーティリティ + **getFileSha() + push検証（commitSha返却）**
- template-config-generator.ts: フォームデータ→SiteConfig変換
- error-handler.ts: 一元ログ+エラーパーサー+リトライ
- member-context.ts: 会員認証Context
- use-preview-name.ts: プレビュー名表示フック（顧客リポにもコピー）

### エディタ用コンポーネント
- WarmCraftRenderer.tsx: warm-craft描画（**セクション単位関数 + SECTION_COMPONENTSマップ**）
- CleanArchRenderer.tsx: clean-arch描画（同上）
- **SectionPanel.tsx**: セクション管理パネル（@dnd-kitドラッグ並び替え + 表示/非表示トグル）

### サイト生成フロー（/api/start）
1. URL重複チェック
2. GitHub: テンプレートリポからリポ作成
3. GitHub: page.tsx + site.config.json + ライブラリファイルをpush
4. DemoBanner除去（正規表現: `^.*DemoBanner.*$`）
5. Vercel: プロジェクト作成 + デプロイ
6. GAS: 注文データ記録（1回のみ、重複防止）
7. メール送信

## 既知の問題・次のステップ

### 品質改善が必要
- エディタのRenderer ≠ 実テンプレートの見た目（レイアウト品質の乖離）
- Template-Renderer同期問題（手動で二重管理）
- AI編集のBefore/Afterが空になるケースあり

### 未実装
- trust-navy Renderer（セクション駆動方式で新規作成）
- 背景画像ピッカー（エディタUI）
- 顧客サイトテンプレートリポもsections駆動に更新
- プラン変更UI→API接続
- Admin MRR計算（Stripe API）
- サブスク更新/解約のwebhook処理

## 環境変数（Vercel）
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_OMAKASE=price_1TME8iAHGiGiMXDLnD472lto
STRIPE_PRICE_OMAKASE_PRO=price_1TME9WAHGiGiMXDLgUexR5PV
STRIPE_WEBHOOK_SECRET=whsec_...
GITHUB_TOKEN=ghp_...
GITHUB_OWNER=AndoLyo
GITHUB_TEMPLATE_REPO=shikumiya-template
VERCEL_TOKEN=vcp_...
GAS_WEBHOOK_URL=https://script.google.com/...
NEXT_PUBLIC_BASE_URL=https://shikumiya.vercel.app
```

## デザイン・UXルール
- 明るい白ベース + ピンク(#e84393)・紫(#6c5ce7)・オレンジ(#f39c12)
- 入力より選択。選ぶだけで依頼が完成するUI
- 手抜き禁止。ボタン押した先まで作り切る
- タスクごとに自己評価（1-100点）+ 振り返り必須

## 重要な参考資料
- PROJECT_STATE.md — 現状のスナップショット
- docs/claude-api-system-prompt.md — Claude APIシステムプロンプト
- docs/site-data-management.md — サイトデータ管理設計
- memory/ — フィードバック・プロジェクト記録
