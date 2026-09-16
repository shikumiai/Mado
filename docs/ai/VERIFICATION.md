# 公開前検証（2026-09-17）

- 比較元: ecf48fadd82d18725e10668068d0d4d2e01f3514
- 実装対象: 6adb558
- 独立レビュー: pilot_security_review / APPROVED。未解決P1/P2なし。
- 指摘と修正: 画像枚数上限がStorage直接APIで回避可能だったため、非公開関数とStorageポリシーで5枚/40枚制限・注文単位の排他制御を追加。
- npm run build: ローカル成功。Vercel本番設定ビルド成功。
- npx tsc --noEmit: 成功。
- 変更対象eslint: エラー0。
- 全体npm run lint: 既存コードに65 errors / 221 warnings。新規pilot、変更したpage/layout/proxy/callback等の個別lintは成功。全体を成功とは扱わない。
- SQL統合検証 scripts/pilot-rls-test.sql: 成功。本人/他人/匿名の分離、応募プロンプト非公開、見積改変拒否、同意前制作拒否、同意後価格固定、進捗・修正・納品、古いversion拒否、画像5枚・40枚の上限を検証。全テストデータはROLLBACK。
- Supabase追加マイグレーション適用済み。既存の顧客テーブルを削除していない。
- 指定された本人Googleアカウントだけを照合し、運営管理者設定済み。メール一覧の読み取りは自動承認レビューで拒否されたため実施せず、本人指定の1件照合へ限定。
- Supabase security advisors: 新規pilotテーブル・関数の警告なし。旧関数のsearch_path、公開security definer、旧stripe_eventsのポリシー未定義、パスワード漏えい検知無効の警告は既存事項として残る。
- Storage同時実APIアップロードの負荷試験と、本人Google OAuthの最終操作は未確認。
- 初回Vercelビルドは .vercelignore のsupabase指定がsrc/lib/supabaseまで除外したため失敗。/supabase/へ限定して修正し、再ビルド成功。
- 確認用deployment: dpl_2A7HLXpnae1jWa7NudxfKB8YCCoK（本番環境設定、custom domain未切替時）。CLI認証付きGETはHTTP 200。ブラウザでのpreviewはVercelログイン保護あり。

## 既存インフラとの比較
GitHubはソース管理、Vercelは画面とサーバー処理、Supabaseはログイン・依頼・非公開画像保存を継続利用。
Google Cloudへ移すと初期運用に必要な機能は増えず、公開設定・認証・運用の管理箇所が増える。今回は追加しない。
旧ホームページ作成版は比較資料として扱い、既存データを保持。新しい購入者の入口は制作相談へ切替。

## 本番で行うこと
公開後、ブラウザでトップの比較切替、スマホ表示、ログイン入口、旧申込リダイレクト、旧決済停止を確認する。
