# Mado 開発ルール

共通運用: C:/Users/ryoya/OneDrive/AI/Claude/ai-collaboration/WORKFLOW.md
ユーザーの現在の依頼が古い固定分担・サービス仕様に優先する。

- Next.js 16.2 / React 19 / TypeScript / Supabase Auth・Postgres・Storage。
- GitHub: shikumiai/Mado。Vercel: shikumiais-projects/mado。URL: https://mado.shikumiai.com
- 本番環境変数から確認したSupabase: tayfsmypscyndfekbzsx。古いHANDOFFのdralpswprcifzmgojgxuは採用しない。
- Tasukeやsite等の別プロジェクトには書き込まない。
- 元チェックアウトの未コミット変更を含めない。別ブランチ・別コピーで作業する。
- DBは追加マイグレーション。既存テーブル・サイトデータを消さない。
- 検証: npm run lint / npx tsc --noEmit / npm run build / ブラウザで主要導線。
- 認証・権限・DBは独立レビューを行う。ユーザーは今回の既存環境へのデプロイを依頼済み。
- 秘密鍵をGit・ログへ記録しない。開発サーバーを常駐させない。
