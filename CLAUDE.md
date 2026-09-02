@AGENTS.md

## 自動実行ルール

### 「note書いて」→ note記事フルフロー
1. まず memory/feedback_note_full_flow.md を読む
2. Phase 0〜7 + note下書き投稿を全て実行する（途中で止めない）
3. Phase 3で /thumbnail-design、Phase 6で /x-draft を必ずスキル経由で使う
4. Phase 4で generate_images.py を実行し、画像を実際に生成する（プロンプトで止めない）
5. 全成果物が揃ったら run_note_post.py でnote下書き投稿まで完了する
6. 記事構造は knowhow_lp_article_pattern.md のLP型に従う
7. 有料ラインは「興味あればこちらもどうぞ。」+ embed の後。有料パートはデータだけ

## 方針転換（2026-04-09〜04-16 確定）

### B2B SaaSサブスクリプションモデル
- **テンプレート販売は終了。B2B SaaSサブスクに完全移行**
- ターゲット: **全業種の中小零細企業**（建築業がv1パック。今後、無形商材・飲食・士業等に展開）
- 制作費: **0円**（初期費用ゼロ）
- 月額: おためし¥0 / おまかせ¥1,480 / おまかせプロ¥4,980
- 独自ドメイン: 全プラン対応
- 差別化: 「写真を送るだけ。あとは全部おまかせ」
- 全CTA → `/start` に統一。「無料相談」は不要

### プラン体系（2026-04-15 確定）
- **内部ID**: otameshi / omakase / omakase-pro（旧lite/middle/premiumは完全廃止）
- **normalizePlanId()** でlite→otameshi等の後方互換変換あり
- **Stripe Price ID**: STRIPE_PRICE_OMAKASE=price_1TME8iAHGiGiMXDLnD472lto / STRIPE_PRICE_OMAKASE_PRO=price_1TME9WAHGiGiMXDLgUexR5PV
- **AI編集回数**: おためし=0（手動のみ） / おまかせ=月3回 / おまかせプロ=無制限

### インフラ（2026-04-15〜16 更新）
- **本体リポ**: AndoLyo/shikumiya（旧lyo-vision-site からリネーム済み）
- **本番URL**: https://shikumiya.vercel.app
- **顧客サイト**: shikumiya-[slug].vercel.app
- **認証**: Google認証（/api/auth/register → GAS register_user）
- **エディタ**: /member/[orderId]/editor（テンプレート直接描画方式、iframe不使用）

### テンプレートのパス（重要）
- **正しいパス**: `src/app/portfolio-templates/` + `src/components/portfolio-templates/`
- **本番URL**: `https://shikumiya.vercel.app/portfolio-templates/{テンプレ名}`
- **建築パック（9種）**: warm-craft, trust-navy, clean-arch × otameshi/omakase/omakase-pro (URL: base/base-mid/base-pro)
- **旧テンプレート**（studio-white, pastel-pop等）は308リダイレクト済み。将来削除
- **業種レジストリ**: `src/lib/industry-registry.ts`（35業種登録）
- **Template Renderers**: WarmCraftRenderer.tsx, CleanArchRenderer.tsx（エディタ用。trust-navyは未作成）

### エディタ（2026-04-16 実装 → セクション構造+Push信頼性改善）
- /member/[orderId]/editor — 顧客サイト編集画面
- 3モード: 見る / 編集 / AI
- 編集モード: クリック→編集パネル。テキスト直接入力、画像アップロード+プレビュー
- **セクション管理**: 「構成」ボタン → 左サイドパネル → @dnd-kitドラッグ並び替え + 表示/非表示トグル
- セクション変更は即座にプレビュー反映（シームレス・楽観的更新）
- AIモード: 質問6問（選択+自由記述）→ Before/After → 承認
- フォントピッカー（Gothic/Mincho/Maru/Mono/Elegant）
- /api/site-update: **バッチコミット方式**（全config変更を1回のpushにまとめる）
- /api/ai-edit: AI編集（OpenAI=テスト / Claude=本番）

### テンプレート定義（実装済み）
- ハイブリッド方式: サイト全体テンプレート + セクション単位の入れ替え
- site.config.jsonにsections配列（type, visible, label）
- ユーザーはセクションの表示/非表示・順番を変更可能
- セクション内部レイアウトはテンプレート固定
- **Rendererはセクション単位の関数に分割済み**（SECTION_COMPONENTSマップで動的描画）
- getSections()でフォールバック付きセクション取得（sections未定義のconfigにも対応）

### Push信頼性（2026-04-16 改善）
- config変更（テキスト・セクション・スタイル・画像パス）は**全て1回のpushにまとめる**
- 画像ファイルは先にpush → その後configにURLを書く（存在しないURLがconfigに入らない）
- pushFileToRepo / pushBinaryFileToRepo が**コミットSHAを返して検証**
- SHA指定pushで競合検出（別リクエストと衝突したら409）
- エディタ側で**3段階フィードバック**（全成功 / 一部失敗 / 全失敗を区別表示）

## 実行ファイル
- エントリーポイント: ./ (プロジェクトルート直下)
- 仮想環境: なし (Node.js)
- コマンド一覧:
  - npm run dev → 開発サーバー起動.bat
  - npm run build → ビルド.bat
