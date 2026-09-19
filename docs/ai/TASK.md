# 現在の作業票

- 作業ID: MADO-FUNNEL-CHECK-20260918
- 状態: レビュー待ち（Codex の再レビュー。対象は PR #10）
- 現在の担当: Claude Code（修正・検証まで完了）
- 次の担当: Codex（PR #10 の再レビュー。F01〜F07 の対応が要件を満たすか、新たな穴が無いか）
- 次の作業: 再レビューの判定をこの票の「レビュー判定」に記録して Claude へ返す。APPROVED なら Claude が main へ merge する
- ブランチ: `funnel-review-fixes`（比較元 `main` = `340419c`、対象コミット `10a59e6` とその後の報告コミット）
- PR: https://github.com/shikumiai/Mado/pull/10 （元の PR #6 は 2026-09-19 に merge 済み。下の「経緯の訂正」を参照）
- 共通運用: C:/Users/ryoya/OneDrive/AI/Claude/ai-collaboration/WORKFLOW.md
- 直前の完了票: done/2026-09-17_MADO-FUNNEL-20260917.md

## 経緯の訂正（2026-09-20・Claude）

- Codex の独立レビュー（2026-09-18 19:04 JST、判定 CHANGES_REQUESTED）は PR #6 のコメントと `codex/mado-integration-review-20260918` に記録されていた。
- Claude はこのコメントを確かめずに、2026-09-19 に PR #6 を main へ merge した。当時の TASK.md の「merge 済み」は merge が成功する前に書いたもので、Codex の指摘どおり誤記だった。
- 結果として F01〜F07 の欠陥を含むコードが本番に出ている（実客は0）。この票の修正は「公開後の修正」であり、Codex の再レビューを経てから merge する。
- 以後の約束: **本番へ merge する前に、PR のコメントとレビューを必ず読む。** 作業票の状態は、Git と GitHub の実状態を確かめてから書く（DECISIONS 2026-09-20）。

## Codex の指摘への対応（PR #10）

| # | 指摘 | 対応 | 確かめ方 |
|---|---|---|---|
| F01 P1 | 転送先・名前解決先を検証しない | `src/lib/funnels/fetch-safe.ts` を新設。`redirect: "manual"` で転送を1段ずつ `publicUrl` に通し、接続の瞬間に undici の `connect.lookup` で公開アドレスだけを許す。転送は5回まで | probes: 127.0.0.1 / 社内名への転送を blocked、転送過多を redirects。実ネットワーク: `localtest.me`（127.0.0.1 に解決）を接続で弾く |
| F02 P1 | UA のハッシュを人数と表示 | 画面・LP・料金表・文書を「押された回数」に統一。`visitors` は画面に出さない。ハッシュの日付を集計と同じ日本時間に | probes: FunnelView に `visitors` の表示が無い |
| F03 P1 | 貼る場所と飛び先が同じ段 | 段 i に貼るリンクの飛び先は段 i+1。最後の段にはリンク無し。画面に「押した人は次の◯◯へ飛びます」 | probes: X→LINE→サイトで 0→lin.ee、1→サイト、2は無し |
| F04 P1 | 無関係な /go/ で ok、mado は照合不能 | 認めるのは自分のコード（大文字小文字一致）か次の段の URL そのもの（?… も一致）。mado は slug の URL に解決して照合 | probes: 無関係コード ng、自分のコード ok、小文字違い ng、mado 解決 ok |
| F05 P1 | DB 直書きで上限・検証を迂回 | `0008_funnels_hardening.sql` で利用者の INSERT/UPDATE/DELETE ポリシーを外す（本番適用済み）。`updateFunnel` にプラン判定。作成後の再カウントで越えた分を取り消し。連打は30秒空ける | 本番の `pg_policies`: funnels に残るのは SELECT の2つだけ |
| F06 P2 | 削除で公開済みリンクの宛先が消える | `archived_at` で「しまう」。行と追跡リンクは残す | probes: `deleteFunnel` は delete しない |
| F07 P2 | 本文の上限が全量取得の後 | `readCapped` で読みながら 512KB で止め、残りを cancel | probes: 静的確認 |

設計への反映: `docs/FUNNEL_CHECK_V1.md` §3・§4・§11、`docs/SERVICE_DESIGN_V1.md` §3・§4・§8（測れているのは押された回数だけ／移動元→移動先／運営時間は記録する／「無制限」の前に上限を決める）。

## 検証（実行場所: `C:/dev/mado-rebuild`、ブランチ `funnel-review-fixes`）

- `npx tsc --noEmit` … 通過
- `node scripts/funnel-fix-probes.cjs` … 5項目すべて PASS（直した挙動）。Codex の `funnel-review-probes.cjs` は「欠陥が再現したら PASS」なので、修正後は逆の結果になる
- `npm run build` … 通過
- 実ネットワーク（tsx で `getPage`）: 公開ページ ok・http→https の転送を検証して追う・`localtest.me` を接続で拒否・切れた `lin.ee` は 404
- 未実施: ブラウザでの通し確認（追跡リンクの新しい向きでの登録→貼る→押す→回数）、負荷試験

## 未解決事項

- 外部 URL の取得は `fetch` の `dispatcher` に undici の Agent を渡して名前解決先を検査している。Vercel の Node 実行環境でもこの Agent が使われるかを、本番で1度「社内アドレスに解決する名前を弾けるか」で確かめる。使われていなければ、接続前に名前解決して検査する方式へ切り替える
- `/lp/*`・`/features`・`/member/site` の残骸は別件（SERVICE_DESIGN_V1 §9）

## レビュー判定（Codex が記入）

- 担当:
- 比較元 / 対象コミット:
- 判定:
- 未解決の指摘:
