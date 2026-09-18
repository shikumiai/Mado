# 現在の作業票

- 作業ID: MADO-FUNNEL-CHECK-20260918
- 状態: レビュー待ち（本番へ merge 済み。Codex の独立レビューは公開後の監査として行い、指摘は別 PR で直す）
- 現在の担当: Claude Code（実装・統合・本番 DB 適用まで）
- 次の担当: Codex（独立レビュー）
- 次の作業: PR #6（main へ merge 済み）の最終レビュー。認証・権限（RLS）・DB・`/go` の転送・外部 URL 取得の安全装置に集中する。問題がなければコードを変えない。判定・比較元・対象コミットをこの票に記録する
- ブランチ: `funnel-check`（比較元 `main` = `301c841`、対象コミット `aa743ef`）
- PR: https://github.com/shikumiai/Mado/pull/6
- 共通運用: C:/Users/ryoya/OneDrive/AI/Claude/ai-collaboration/WORKFLOW.md
- 直前の完了票: done/2026-09-17_MADO-FUNNEL-20260917.md

## 先に知っておくこと（2026-09-18 の判断・DECISIONS.md 参照）

- 本番 `mado.shikumiai.com` の入口は **ホームページ作成（rebuild-v2）** に戻した（PR #1 を 2026-09-18 に merge）。
- Codex が 9/16 に出した導線チェック（`/pilot`）は、**コードと DB を残したまま入口から外した**。`/start → /pilot` の転送と `/api/checkout` の 410 は外してある。`mado_pilot_orders` / `mado_pilot_applications` / `mado_funnel_orders` は消していない。
- 導線チェックは **この作業票の形で作り直し**、おまかせ以上の有料機能にする。人のテスター手配は作らない。
- **本番への merge とデプロイは Claude Code が行う。** この票の依頼範囲にマージ・デプロイは含まれない。レビュー判定だけを記録する。
- 作業場所: 本体 checkout `C:/Users/ryoya/OneDrive/AI/Claude/Shikumiai-HP` の main は本番と同期済み。`git fetch origin && git checkout funnel-check` で対象を読む。`Documents/Codex/.../work/mado-pilot` は 9/17 時点の古い写しなので使わない。

## 目的

お客さんが導線（X → LINE → Web → 自分の Mado サイト → 会員ページ → Discord）を宣言すると、
段ごとに「つながっているか」が機械で確かめられ、段ごとの追跡リンクで通過人数が分かる。
設計の正: `docs/FUNNEL_CHECK_V1.md`。

## 完了条件（設計書 §11）

- 申込 → 公開 → 導線を1本登録 → 追跡リンク発行 → 「いま確かめる」で段ごとの状態が出る。本番で通る
- `line` の切れた URL・`discord` の期限切れ招待・`web` の 404 を、それぞれ `ng` と理由つきで出せる
- 追跡リンクを踏むと飛び先に着き、翌日の画面に人数が出る
- おためしで `/app/funnels` を開くと鍵つきで見え、作れない
- `skipped` の段に「確かめていない理由」が必ず書いてある

## 変更内容（対象コミット `aa743ef`、比較元 `301c841`）

| 領域 | ファイル |
|---|---|
| DB | `supabase/migrations/0007_funnels.sql`（funnels / tracked_links / tracked_clicks / funnel_runs、RLS、`owns_funnel` / `owns_tracked_link`、`funnel_clicks_daily`、予約スラッグ `go`） |
| 追跡リンク | `src/app/go/[code]/route.ts`（302・service_role で記録・IP を保存しない・ボット除外） |
| チェック本体 | `src/lib/funnels/check.ts`（8秒打ち切り、公開 URL だけ取得、IP 直打ち・社内アドレス・ポート・認証情報つき URL を弾く） |
| Server Action | `src/lib/funnels/actions.ts`（7つ。Cookie セッションで org を確かめてから service_role で書く） |
| 型の契約 | `src/lib/funnels/types.ts`（設計書 §8） |
| サイト内チェック | `src/lib/funnels/site-check.ts`（`onboarding.ts` の判定を再利用） |
| プラン | `src/lib/templates/catalog.ts` の `funnelLimit` / `planAllowsFunnelCheck`（0 / 3 / 無制限）、`src/lib/resolve-site.ts` に予約スラッグ `go` |
| 画面 | `src/app/app/funnels/page.tsx`・`new/`・`[id]/`、`src/app/app/page.tsx`（導線の入口・公開前チェック）、`src/lib/funnels/kinds.ts`・`status.ts` |
| 見せ方 | `src/app/page.tsx`（見出し「サイトを作る。そこまでの道も、見える。」・導線チェックの1枚）、`src/components/marketing/PricingCards.tsx`、`src/app/pricing/page.tsx`、`src/app/layout.tsx`（metadata）、`src/app/opengraph-image.tsx` |

## 検証（実行場所: `C:/dev/mado-rebuild`、ブランチ `funnel-check`）

- `npx tsc --noEmit` … 通過（3担当の枝を統合後）
- `npm run build` … 通過。`/app/funnels` `/app/funnels/new` `/app/funnels/[id]` `/go/[code]` が動的ルートとして生成
- `node scripts/funnel-check-smoke.mjs` … 切れた `lin.ee`・期限切れ `discord.gg`・404 の Web がそれぞれ `ng` と一文の理由＋根拠。`x` は `skipped` と理由
- OG 画像はビルド出力（`.next/server/app/opengraph-image.body`）を目視。日本語は化けず、Mado の色と新見出し
- 本番 DB へ `0007` を適用済み（2026-09-18、`supabase db query --linked -f`。テーブル4・関数3・ポリシー11・予約スラッグ `go` を確認）
- 通し確認（プレビュー `mado-zt0bvypmd`、2026-09-18）… 完了条件 §11 をすべて満たした。おためしは鍵つき／おまかせで5段を登録し追跡リンク発行／`/go` は 302 と記録（ボット UA は数えない）／「いま確かめる」で LINE 404・Discord 期限切れ・Web の次段リンク無し・自分のサイトの連絡先空を、理由と根拠つきで `ng` 表示／過去のチェック1件／`skipped` に理由。詳細は PR #6 のコメント
- 未実施: 390px 実機の目視、翌日の人数集計の目視

## 未解決事項

- 外部 URL の取得は転送先まで追う。転送先が社内アドレスの場合は弾けない（v1 は公開ページ前提。レビューで対策の要否を判断してほしい）
- `/lp/*` は旧デザインのまま（画像に売り文句が焼き込まれている）。「残す／作り直す／入口から外す」は別判断
- `src/app/layout.tsx` の JSON-LD が古いプラン説明のまま。別件

## レビュー判定（Codex が記入）

- 担当:
- 比較元 / 対象コミット:
- 判定:
- 未解決の指摘:
