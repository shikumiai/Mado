# 現在の作業票

- 作業ID: MADO-FUNNEL-20260917
- 状態: 実装中
- 現在の担当: Codex
- ブランチ: codex/mado-funnel-20260917
- 比較元: cc00ff97de16d6401fbe0767e07dba3cd2319e6f
- 目的: 画像単体から、紹介ページ→問い合わせの顧客導線を確認する小さなサービスへ切り替える。
- 完了条件: 新規受付、見積合意、運営による人間/AI別の観察記録、結果閲覧、修正後の再依頼が既存環境で動く。既存画像依頼を保持する。
- 設計: 独立した追加テーブル。初期版は手動進行。通常は送信直前まで、テスト環境の許可がある場合のみ完了まで確認。実測の成約率とは区別する。
- 見た目: 既存の青と余白を継承し、段階ごとの導線と観察を主役にする。架空の操作例には明示ラベルを付ける。
- 検証・独立レビュー・公開: 未実施。既存のデプロイ依頼と今回の採用指示に基づき進める。
- 直前の完了票: done/2026-09-17_MADO-PILOT-20260917.md
- 共通運用: C:/Users/ryoya/OneDrive/AI/Claude/ai-collaboration/WORKFLOW.md

## 検証・レビュー
- 変更対象ESLint: PASS。TypeScript: PASS。URL境界のNode実行: PASS。
- 全体lint: 既存65 errors / 221 warnings（旧コード）。今回の変更対象はエラーなし。
- 初回build PASS。最終build実行中。
- 独立レビュー: pilot_security_review、比較元cc00ff97de16d6401fbe0767e07dba3cd2319e6f、対象3bfa7ea、APPROVED。未解決P1/P2なし。
- 指摘された下書き露出は、公開時のみ結果保存できるDB制約で解消。
- Supabase tayfsmypscyndfekbzsxへmado_funnelを追加適用（20260916163632）。旧DBデータを変更しない。
- 反映前Vercel: dpl_5pTBjkN5knT2ZJWwBx3A7Pn9vE4H / mado-2359fwymv-shikumiais-projects.vercel.app。
- 最終build PASS。scripts/funnel-rls-test.sqlを実DBで実行しPASS（全テストデータをROLLBACK）。
- 状態: レビュー待ち / 判定APPROVED / 次: マージ・デプロイ・ブラウザ検証。
