# MADO-PHOTOS-20260920

- 目的: 公開後、写真枠を押して選ぶだけで本人の写真へ差し替えられる画面を作る（ONBOARDING_V1 §3-4）。
- 担当: Codex。状態: 実装・Preview確認・独立レビュー完了。本番DB適用と実Storage統合確認は未実施。
- 場所: `.verification/photo-workspace`、ブランチ `codex/mado-photo-library`。比較元: `340419c`。
- 依頼: Lyo「そのまま進めて」。写真画面の実装・検証を継続。
- 別作業: `TASK.md` の導線チェック再レビュー（PR #10）は変更しない。
- PR: https://github.com/shikumiai/Mado/pull/11 （Draft）。初回実装: `2dc36d1`。
- 範囲: 写真の一覧、端末でのサイズ調整、既存のアップロード・版管理付き保存、会員画面からの入口。
- 公開DB・認証設定・課金・他作業ブランチは変更しない。
- デザイン: 既存のクリーム `#fbf8f3`、濃紺 `#1e2a44`、暖色 `#e8873a`、段 `#f1ebe0` と既存トークン。見出しは明朝、本文はゴシック。メイン写真を大きく、他の枠を2列。写真を押す行為が主役。スマホで44px以上の操作面。
- 保存: 一枚ずつアップロード後に既存 `saveSiteConfig` で確定。競合時に上書きしない。失敗した選択は保持。
- 検証予定: 写真枠と保存先（10業種・3プラン・独自部品・非表示）、型、lint、build、画面操作。

## 実装

- `/app/sites/[siteId]/photos`。見本・未設定で絞り込み、枠を押して一枚ずつ自動保存。失敗時の再試行ではアップロード済みURLを再利用。版競合時は選択を保持して上書きを止め、明示的な操作で最新へ読み直す。
- 画像は端末で長辺1920px・1MB以下のJPEGに圧縮、EXIFを引き継がない。切り抜き数値の入力不要（枠のobject-fitで合わせ、既存エディタで個別調整可能）。HEICは変換案内。
- 表示部品のデータ解決を使い、configに保存されていない補完写真も拾う。同じ保存先を使う部品は一枚に集約。独立部品の写真は独立した宛先に保存。
- オンボーディングの写真数も表示中の写真枠を使う。quietヒーローなど写真を使わないレイアウトは写真交換を要求しない。

## 保存経路で見つかった既存の問題

`public_read_live_sites` は第三者の公開サイトにもSELECTを許す。従来の `requireSiteAccess` はこのSELECT成功だけで許可し、`uploadSiteImage` はその後service_roleでStorageへ書いていた。

`requireSiteAccess` に対象org・本人userのowner/editor所属確認、またはplatform_admins確認を追加した。認証エラー・照会失敗・viewer・非所属は拒否。これは写真画面の保存経路に必要な修正で、独立レビュー対象。

独立レビューで、既存DBのUPDATE/履歴INSERTはviewerも通し、管理者のみの所属では保存を拒否する不整合が見つかった。`20260919174341_site_editor_write_roles.sql` を追加して編集用判定を分離。新関数はSECURITY INVOKER、SELECT用のowns_siteはそのまま、書込みポリシーだけowner/editor/管理者へ揃える。本番未適用。

## 検証記録

- `node scripts/photo-slots-check.cjs`: 10業種×3プラン、203枠の保存先と表示値、元configの不変、独立/共有部品、写真のないレイアウト、非表示を通過。
- `node scripts/site-access-check.cjs`: 実際のServer Actionをモック接続で実行。有効なPNGのFileを渡し、拒否理由が画像不足でなく認可であることを厳密比較。非所属者の公開サイト、viewer、未ログイン、認証/所属照会失敗はStorageのservice_roleと保存RPCへの到達ゼロ。owner/editor/管理者はStorage・設定保存とも許可。
- `node scripts/site-editor-rls-check.mjs`: PGlite 0.4.0上で既存migration原文と新SQLを実行。旧viewer保存成功・旧管理者保存失敗を再現してから、修正後のRPC/直接UPDATE/履歴INSERT、権限失効、版競合、公開SELECT維持、再適用を確認。依存は検証専用 `.verification/pg-test`（アプリのpackage.jsonには追加しない）。Supabase管理スキーマは最小fixture、実サービスのStorage/Authとの統合は未確認。
- 変更ファイルのeslintと `npx tsc --noEmit`: 通過。
- `npm run build`: ローカル・Vercel Previewとも成功。ローカルには複数lockfileによるroot推定警告。
- リポジトリ全体lint: 既存37エラー・39警告。追加スクリプトのCommonJS lintは専用スクリプトの理由付き除外で修正、変更対象は0。
- 確認用Preview: `https://mado-1vhugjtg5-shikumiais-projects.vercel.app/photo-verification`。CLI認証で200。端末内だけで成功/送信失敗/保存失敗/競合を切り替える一時fixture。DB・Storage書込なし。fixtureは本番差分へ含めない。
- 30分限定のデプロイ共有リンクでブラウザ確認。写真選択→端末圧縮→保存、送信失敗→再試行、保存失敗→再試行時の画像再送なし、競合→保存停止→最新読込を通過（fixture内で、実DB/Storage書込なし）。通常幅・390px、明/暗テーマを確認。横はみ出しなし。
- 操作中の写真が下にあるとエラーが画面外へ隠れる問題を目視で発見。理由・再試行・競合時の読込ボタンを進捗と同じ追従枠へ移設。修正後の型・変更ファイルlint・buildは通過。
- 再PreviewはGit作者とVercelチームの不一致で一度BLOCKED。GitHub CLIはshikumiai、旧ローカル作者はAndoLyoに紐づいていた。修正commit `fcbe2e1` は認証済みshikumiaiの本人情報を明示（過去の作者・全体設定は無変更）。その後のPreviewビルドは成功。
- 最終Preview: `https://mado-hvg5od7mc-shikumiais-projects.vercel.app/photo-verification`（`dpl_5mzk4bNyPzqNXrnFCpgnb4hUEe5b`）。MCPの一時リンクで閲覧。390pxで下の写真を操作して保存失敗を再現し、再試行ボタンが画面内にあることを目視・座標で確認、再試行から保存完了まで通過。このfixture付きデプロイは本番へ昇格しない。
- Vercel MCPはLyoの再接続後、対象チームとデプロイの取得に成功。一時共有リンクは検証後に失効し、端末内の秘密ファイルも削除済み。
- 本番未反映。実Storage→config保存→再読込、新RLSの実Supabase適用・確認は残る。

## 独立レビュー

- 担当: 別エージェントのCodex（Pascal）。初回 `340419c` → `2dc36d1` の認可レビューでDB側との不整合2件・空FormDataによるテスト漏れ1件を検出。
- 再レビュー: `2dc36d1` → `fcbe2e1` の認可SQL・テスト3ファイルをコードおよびSHA-256一致で確認。**APPROVED、前回3指摘は解消、未解決指摘なし。**
- 新migration適用後を想定した技術判定。実SupabaseのAuth/Storage統合は未検証で、本番適用の完了を意味しない。

## 次の作業

1. 新RLSを対象Supabaseへ適用し、認証済みのテスト用サイトで実Storage→config保存→再読込を確認する。ユーザーの実サイトを検証用に書き換えない。
2. 条件がそろってから本番へ反映。PR #10とは別の作業票・差分として扱う。
