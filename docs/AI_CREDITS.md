# 有料プランのAI利用枠

2026-09-20 / MADO-ONBOARDING-AI-20260920

## 利用者向け

| プラン | 月間クレジット | 文章修正のみなら | 会社情報のみなら |
|---|---:|---:|---:|
| おためし | 0 | 手動編集 | 手動編集 |
| おまかせ | 30 | 30回 | 6回 |
| おまかせプロ | 100 | 100回 | 20回 |

文章修正1、会社情報反映5。生成案を返した時に消費（気に入らず破棄した場合も消費）。保存・保存再試行では消費しない。生成失敗は返却。会社内の全サイト・全編集者で共有、日本時間毎月1日更新、繰越・自動追加課金なし。プラン変更で使用済み量を初期化しない。

会社情報は貼り付け（入力ひな形あり）→根拠の引用付き変更案→項目ごと選択→既存の版チェック付き保存。対象は会社名・紹介文・代表挨拶・事業内容・連絡先・営業時間等と既存トップ見出し/紹介文の上書き欄。写真・色・部品・商品一覧を勝手に変更しない。実績数・資格・価格等を推測しない。根拠の引用と数字をプログラムでも検査するが、事実の正確性は利用者が確認してから反映する。

## 原価の上限設計

固定モデル gpt-4.1-mini-2025-04-14。2026-09-20確認時、入力$0.40/出力$1.60（100万token）。
公式: https://developers.openai.com/api/docs/models/gpt-4.1-mini

- 文章: プロンプトUTF-8 16,000byte以下、出力1,200token以下
- 会社情報: 同32,000byte以下、出力3,200token以下
- メッセージ包装に500tokenを余分に見積り、入力byte数をtoken数の安全側近似として扱う。
- 1USD=200円の予算レート（相場の断定ではない）では文章約1.71円、会社情報約3.62円以下。1クレジットあたり2円の原価予算でカバー。
- SDK自動再試行0、プロバイダ切替なし、1リクエスト1APIコール、40秒timeout。
- 失敗時も外部API費用が発生しうるので、利用者残高と別に「試行クレジット」を減らす。月間試行上限=通常枠の2倍。想定AI費用上限は1社月120円/400円。実費を記録して精度・料金改定時に見直す。

これはAPI費用の設計上の上限。ホスティング、DB、メール、Stripe手数料、税、サポート工数込みの黒字を保証する値ではない。為替・API値上げ・利用実績を管理画面で追えるようにすることを次タスクにする。Stripe APIでactive・customer・価格lookup_keyも照合。テスト決済（livemode=false）はplatform_adminの検証だけ許可し、一般利用者の実API費用を発生させない。新しいモデルへの無検証切替は禁止（コード変更・原価再計算・テスト）。

## 認可・整合性

- 既存requireSiteAccessをPR#11と同じowner/editor/admin判定へ統一。同じファイル・同じmigrationを再利用し、PR#11の写真UIは取り込まない。
- 実行時はサーバー認証＋DB内でも同じ所有権を再確認。有効な有料plan、active、stripe_subscription_id必須。古いfree signup RPCのplan推定だけでAIを使わせない。
- reserve/finish/balance RPCはservice_role専用・SECURITY INVOKER。顧客は費用・plan・期間・枠を書き換えられない。
- org行をFOR UPDATEして全サイトを直列化。一社一処理、予算予約後だけAPIへ。
- requestId＋内容hash＋site＋userで二重生成防止。レスポンス不明時は同じIDで取得。新しい入力・新しい生成には新ID。
- 5分過ぎた実行中記録は残高の再読込または次の予約時に失敗扱い。最後の残高を使い切っていても、画面を開き直すと利用枠を返す。原価用の試行枠は返さない。
- 変更案はai_requests.resultへ保存、RLSで編集者だけ閲覧可能。入力全文・API鍵をログに出さない。
- DB未適用/未接続、OPENAI_API_KEY未設定は503で停止。固定の偽デモ文章は返さない。

## 展開と検証

追加migration: 20260919174341_site_editor_write_roles.sql（PR#11と同一）→20260919182602_ai_credits.sql。2026-09-20にtayfsmypscyndfekbzsxへMCPで適用済み。MCPが付けたDB履歴はそれぞれ20260919190735 / 20260919190822（同名・同内容）。ローカルファイルの時刻とは異なるため、次のCLI db pushの前に履歴照合が必要。
現行ANTHROPIC_API_KEYがあっても自動的に高価なモデルへ切り替えない。OPENAI_API_KEYの存在を確認してから有効化。

node scripts/ai-check.cjs / node scripts/ai-billing-check.cjs / node scripts/ai-credits-check.mjs / node scripts/site-access-check.cjs / node scripts/site-editor-rls-check.mjs。
SQL検証は@electric-sql/pglite@0.4.0を.verification/pg-testに入れ実migrationを実行。加えてnative PostgreSQL 18.4で全SQLケースと多接続競合を検証済み。別backendのロック待ちをpg_stat_activityで確認し、残り5クレジットに会社生成を2件並行要求して、1件だけreserved・もう1件limit、使用量30を確認した。

再実行: `npm install --prefix .verification/native-pg --no-audit --no-fund embedded-postgres@18.4.0-beta.17` → `node scripts/ai-native-check.mjs`。localhost:55467だけで一時DBを起動しfinallyで停止。プロジェクト外や本番DBへ接続しない。データフォルダは検証用ディレクトリ内に保持する。

本番DBへの検証用org/site/仮subscription作成は自動承認で拒否された。代わりに上記の独立した一時DBで検証し、本番の検証データは0件であることを確認済み。実Stripe/OpenAI生成と実ユーザーの一連の操作は未試験。

## 続けてやる価値のあるタスク

1. 管理画面で会社別AI原価・失敗率・利用量を表示（最優先）
2. 会社情報の保存と部分更新（再入力不要に）
3. 公開前チェックに見本文・見本写真・未入力連絡先を追加
