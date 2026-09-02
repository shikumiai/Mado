# 機能の直結マトリクス（Adjacency）

> 各機能が「隣の機能」とどう関係するかを定義する。スコアリング後の連携チェックで参照される。

## 設計原則

1. **関係は片方向で書く** — 「依頼側 → 被依頼側」のみ。両方向に書くと循環してメンテ不能になる。
2. **重複・劣化・矛盾・断絶の 4 種類だけ判定する** — 関係を細かく分けすぎない。
3. **ペナルティは明確な数字で書く** — 「曖昧な減点」は禁止。

## 4 種類の連携問題

| 種類 | 定義 | ペナルティ |
|---|---|---|
| **重複** | 同じ行動を促す要素が複数並んでいる | -10 |
| **劣化** | 新機能の追加で既存機能の見た目 / 機能が落ちた | -10 |
| **矛盾** | 表示情報が機能間で食い違う（時間・価格・住所等） | -15 |
| **断絶** | 動線が途中で切れる（次のステップへ繋がらない） | -5 |

## セクション系（16 個）

### 01. hero-section
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 11. cta-section | 重複 | hero の CTA と cta-section の CTA が同じ動作（例: 両方「資料請求」）→ 役割分担を明示する（hero=資料請求 / cta=見学予約 等） |
| 17. header-nav | 重複 | header の常駐 CTA と hero の CTA が同じ → header は予約系、hero は資料系で分担 |
| 02. news-section | 劣化 | hero 追加で news の更新日が小さくなった / 視認性が落ちた |
| 36. animation | 矛盾 | hero でガッツリパララックスなのに news で動きゼロ → サイト全体のリズムが崩れる |

### 02. news-section
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 14. blog-section | 重複 | news と blog の見た目・更新頻度が区別できない → news=実績/告知、blog=技術解説 で分担 |
| 18. footer | 断絶 | news に「もっと見る」がないと一覧へ繋がらない |

### 03. works-gallery（施工実績）
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 16. before-after | 重複 | 同じ事例が works と before-after の両方に出ている → 統合か役割分担 |
| 08. testimonials | 断絶 | 事例の隣に「お客様の声」が出ない → 動線が切れる |
| 11. cta-section | 断絶 | 事例を見たあとに見学予約・資料請求 CTA がない |

### 04. service-section
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 05. product-lineup | 重複 | サービスと商品の区別が曖昧（サービス=工程 / 商品=ラインナップ） |
| 06. technology-section | 重複 | サービス内の「こだわり」と technology が重複 → technology は技術スペック、service は工程に分担 |
| 19. contact-form | 断絶 | 各サービス紹介の末尾に問い合わせ CTA がない |

### 05. product-lineup
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 04. service-section | 重複 | 商品ラインナップが service と区別つかない |
| 29. pdf-download | 断絶 | 各商品にカタログ PDF への動線がない |

### 06. technology-section
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 04. service-section | 重複 | technology が service の言い換えになっている |
| 03. works-gallery | 断絶 | technology の数字（耐震等級等）が works の実例と紐付かない |

### 07. pickup-section
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 02. news-section | 重複 | pickup と news の違いが不明（pickup=特集/キャンペーン、news=日次更新）|
| 11. cta-section | 断絶 | pickup を見て「応募したい」と思った時に CTA が無い |

### 08. testimonials（お客様の声）
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 32. review-rating | 重複 | testimonials と review-rating が両方表示で情報過多 → 役割分担（testimonials=長文体験談 / review-rating=星評価サマリ） |
| 03. works-gallery | 断絶 | お客様の声の事例写真が works と紐付かない |
| 11. cta-section | 断絶 | 声を読んだあとの相談 CTA がない |

### 09. location-search（拠点検索）
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 21. google-maps | 重複 | location-search と単体の google-maps が両方表示 → location-search に統合 |
| 26. booking-system | 断絶 | 拠点を選んだ後に「ここで予約」が出ない |

### 10. company-info
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 18. footer | 矛盾 | 住所・電話番号が会社情報とフッターで違う |
| 21. google-maps | 断絶 | 住所だけ書いてあって地図が無い |

### 11. cta-section
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 01. hero-section | 重複 | hero の CTA と同じアクション（前述） |
| 17. header-nav | 重複 | header の常駐 CTA と同じ |
| 19. contact-form | 断絶 | CTA から問い合わせフォームへの遷移が断絶 |

### 12. video-section
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 01. hero-section | 重複 | hero に動画背景があるのに別途 video-section も動画 → 動画疲れ |
| 36. animation | 矛盾 | 動画 auto-play 音付き + 全体は静か → 体験が破綻 |

### 13. recruit-page
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 10. company-info | 矛盾 | 採用ページの会社規模と company-info が違う |
| 11. cta-section | 断絶 | 採用ページから応募フォームへの動線が切れている |

### 14. blog-section
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 02. news-section | 重複 | blog と news が見た目で区別不能（前述） |
| 37. seo-check | 断絶 | blog 記事にメタ情報が無く SEO が機能しない |

### 15. faq-section
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 25. ai-chatbot | 重複 | FAQ と AI チャットの内容が同じ → FAQ=固定回答、ai=動的回答 で分担 |
| 19. contact-form | 断絶 | FAQ で解決しなかった時の「問い合わせへ」動線が無い |

### 16. before-after
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 03. works-gallery | 重複 | 事例が重複（前述） |
| 11. cta-section | 断絶 | 変化を見たあとに「自分も相談したい」CTA がない |

## 共通パーツ系（8 個）

### 17. header-nav
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 11. cta-section | 重複 | 常駐 CTA とセクション CTA が同じ（前述） |
| 18. footer | 矛盾 | header のメニューと footer のサイトマップが食い違う |
| 24. site-search | 断絶 | header の検索アイコンが site-search に繋がらない |

### 18. footer
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 10. company-info | 矛盾 | 住所・電話が違う（前述） |
| 22. sns-integration | 矛盾 | footer SNS リンクの URL と sns-integration の URL が違う |

### 19. contact-form
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 33. notification | 断絶 | 送信完了通知が出ない → 送れたか不明 |
| 23. cookie-consent | 矛盾 | プライバシーポリシーリンク先と cookie-consent の文言が一致してない |

### 20. breadcrumbs
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 17. header-nav | 重複 | header のメニュー階層と breadcrumbs の階層が矛盾 |

### 21. google-maps
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 10. company-info | 矛盾 | マップの場所と会社情報の住所が違う |
| 09. location-search | 重複 | 単体マップと拠点検索内マップが重複（前述） |

### 22. sns-integration
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 18. footer | 矛盾 | footer 内 SNS と整合しない（前述） |

### 23. cookie-consent
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 19. contact-form | 矛盾 | プライバシーポリシー文言の不一致（前述） |
| 01. hero-section | 劣化 | バナーが hero の CTA を隠す |

### 24. site-search
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 17. header-nav | 断絶 | header の検索アイコンが動かない（前述） |

## 機能系（12 個）

### 25. ai-chatbot
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 15. faq-section | 重複 | FAQ と回答が被る（前述） |
| 19. contact-form | 断絶 | ai が答えられない時に form へ繋がない |
| 33. notification | 断絶 | チャット内容のメール通知設定が無い |

### 26. booking-system
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 09. location-search | 断絶 | 拠点選択から予約に繋がらない（前述） |
| 33. notification | 断絶 | 予約完了通知が無い |

### 27. multilingual
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 全機能 | 劣化 | 一部機能だけ翻訳されていて他は日本語のまま → 切替の意味が無い |

### 28. panorama-viewer
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 30. image-gallery | 重複 | 同じ場所のパノラマと通常写真が両方表示 |
| 40. performance-check | 劣化 | パノラマで Lighthouse Performance が 30 以上低下 |

### 29. pdf-download
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 05. product-lineup | 断絶 | 商品ごとの PDF リンクが無い（前述） |

### 30. image-gallery
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 28. panorama-viewer | 重複（前述） | |
| 03. works-gallery | 重複 | 用途が被る → image-gallery=雰囲気、works=施工事例 で分担 |

### 31. file-upload
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 19. contact-form | 重複 | contact-form 内のファイル添付と独立 file-upload が並んでいる |

### 32. review-rating
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 08. testimonials | 重複（前述） | |

### 33. notification
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 19. contact-form | 断絶（前述） | |
| 26. booking-system | 断絶（前述） | |

### 34. analytics-dashboard
（管理者向け、訪問者連携なし）

### 35. dark-mode
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 01. hero-section | 劣化 | ダーク時に hero 画像が暗すぎて読めない |
| 36. animation | 劣化 | ダーク時にアニメーションの視認性が落ちる |

### 36. animation
| 直結する隣 | 種類 | 判定基準 |
|---|---|---|
| 12. video-section | 矛盾（前述） | |
| 39. accessibility-check | 劣化 | prefers-reduced-motion 未対応で a11y スコアが落ちる |

## 横断系（37〜40）

横断系は連携チェックの対象外（全機能に適用される検査機能のため）。代わりに、横断系違反は **落第条件** として扱う。

## 連携チェックの実行手順（feature-manager 側）

```
1. 該当機能 ID で本ファイル内の表を引く
2. 「直結する隣」のうち、現在実装済みの機能だけを抽出
3. 各組み合わせについて「重複 / 劣化 / 矛盾 / 断絶」を判定
4. ペナルティ合計を出す（最大 -30 でクリップ）
5. レポートの「直結する機能」折りたたみに、判定根拠を記述
```

## 全 40 機能の関係グラフ（概念）

```
hero ─┬─ cta-section ─── contact-form ─── notification
      ├─ header-nav  ─── footer
      ├─ news ─── blog
      ├─ works ─┬─ before-after
      │         └─ testimonials ─── review-rating
      ├─ service ─┬─ product-lineup ─── pdf-download
      │           └─ technology
      └─ pickup

faq ─── ai-chatbot
location-search ─── google-maps ─── booking-system
multilingual → 全機能に影響
dark-mode → 全機能に影響
```

片方向グラフ。矢印の向きは「依頼側 → 被依頼側」。
