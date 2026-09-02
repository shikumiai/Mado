# 07. システム設計書 v2 — Supabase マルチテナント

> 作成: 2026-09-03
> ステータス: 方向性確定（Lyo 合意済み）／実装未着手
> **この文書は `02_ARCHITECTURE.md`（fork & deploy 方式）を置き換える。**
> 02 は「なぜその設計だったか」の記録として残す。

---

## 0. 一行で言うと

**顧客サイトを「デプロイするもの」から「データベースを読んで描くもの」に変える。**

これ1つで、即反映・テンプレ一括修正・顧客一覧・コスト頭打ちが全部同時に解決する。

---

## 1. も・げ・じょ

### も（目的）

**1人で回せる状態のまま、顧客数を増やせるようにする。**

Supabase はそのための道具として選んだ。Madoは Lyo 1人で運営する B2B SaaS なので、
顧客1人増えるごとに Lyo の手作業・インフラ・監視対象が増える設計は、それ自体が事業の上限になる。

### げ（現状）— 2026-09-03 時点、コードから確認した事実

**構造: 顧客1人 = GitHubリポ1個 + Vercelプロジェクト1個 + Next.jsアプリ1個**

申込時の処理（`src/app/api/start/route.ts`）:

1. GitHub の template repo `/generate` で新リポ作成 → **5秒 sleep**（伝播待ち）
2. 親リポから `portfolio-templates/{templateId}/page.tsx` を取得 → **正規表現で DemoBanner の行を削除** → 顧客リポへ push
3. `site-config-schema.ts` / `use-preview-name.ts` を**ファイルコピー**して push
4. `site.config.json` を push（**2回**。generateSiteConfig 版 → テンプレ版で上書き）
5. Vercel API v10 でプロジェクト新規作成 → v13 で deployment 作成
6. GAS（Googleスプレッドシート）へ注文行を追記

**データの実際の保管先**

| データ | 保管先 |
|---|---|
| サイトの中身（会社名・実績・色・セクション） | 各顧客リポの `src/app/site.config.json` |
| 注文・顧客・プラン・リポ名 | Googleスプレッドシート「注文データ」 |
| メール＋パスワードハッシュ | Googleスプレッドシート「ユーザー認証」 |
| 編集リクエスト | Googleスプレッドシート「編集リクエスト」 |
| 申込途中の一時データ | GitHub Gist（非公開） |
| 顧客の画像 | GitHub Gist（Base64）→ 顧客リポの `public/images` |
| サブスクリプション | Stripe（テストモード） |

**構造上の問題（すべてコードで確認済み。憶測なし）**

| # | 問題 | 根拠 |
|---|---|---|
| 1 | **1文字直すたびに Next.js のフルビルドが走る** | `/api/site-update` → GitHub push → Vercel 再ビルド。「即反映」が原理的に不可能 |
| 2 | **テンプレ修正が既存顧客に届かない** | `page.tsx` を**コピー**しているため。N件に push して回るしかない ← スケールの死 |
| 3 | **一覧・集計が構造的に不可能** | クエリを投げる先が存在しないので、管理画面はハードコードにするしかなかった。MRR も出ない |
| 4 | **Vercel が Hobby プラン** | Hobby は商用利用が規約違反。加えてデプロイ回数の日次上限に当たる |
| 5 | **リポ作成権限のある GitHub トークンが顧客の編集操作の延長で動く** | `site-update` → `github.ts` → 同一トークン |
| 6 | **2箇所同時編集で片方が消える** | config が単一 JSON ファイル。トランザクションがない |
| 7 | **生成失敗が握り潰される** | `start/route.ts` の catch が「注文自体は成功扱い」。顧客から見ると「申し込んだのにサイトがない」 |
| 8 | **画像が Gist とリポに二重管理** | Git は履歴を全部持つので、消してもリポは軽くならない |
| 9 | **認証がスプレッドシート** | orderId + email を毎回 URL クエリで GAS に投げて本人確認。セッションがない |

**判断記録**: この形は **「データベースという道具を知らないまま、静的サイトを配る発想で SaaS を組んだ」
という前提に対しては一貫している**。毎回作り直すというやり方に、実装は忠実に従っている。
詰まっているのは前提のほうで、顧客が増えた瞬間に上の9つが同時に噴き出す。

**既存の稼働顧客: 0件（Lyo のテストのみ・Stripe はテストモード）**
→ 段階移行は不要。作り替えてよい。

### じょ（条件）— 新設計が満たすべきこと

1. 顧客が編集したら **ビルドを挟まずに反映**される
2. 顧客が100人になっても **インフラは1セットのまま**（Vercelプロジェクト1・リポ1・DB1）
3. テンプレートを直したら **全顧客に即反映**される
4. Lyo が **顧客・プラン・MRR・依頼を1画面で見られる**
5. 認証は自作しない
6. 画像は Git に入れない
7. コストが顧客数に比例して跳ねない
8. Vercel の利用規約に沿う（商用 = Pro）
9. **独自ドメインの自動化は v1 ではやらない**（持っている人は手動対応）

---

## 2. 新アーキテクチャ全体像

```
【旧】顧客数だけインフラが増える
  顧客A → GitHubリポA → Vercelプロジェクト A → サイトA
  顧客B → GitHubリポB → Vercelプロジェクト B → サイトB
  顧客C → GitHubリポC → Vercelプロジェクト C → サイトC

【新】インフラは1セット固定
                          ┌──────── Supabase (Tokyo) ────────┐
  顧客A ─┐                │  orgs / sites / site_configs      │
  顧客B ─┼→ Next.js 1個 ─→│  Auth（ログイン）                  │
  顧客C ─┘   Vercel 1個    │  Storage（画像）                   │
              (hnd1)      └───────────────────────────────────┘
                                        │
                          URL のスラッグで「どの顧客か」を判定
```

**構成要素**

| 層 | 使うもの | 役割 |
|---|---|---|
| 表示 | Next.js 16 App Router / Vercel 1プロジェクト | LP・申込・会員・管理・**顧客サイト** を全部ここで描く |
| データ | Supabase Postgres（**東京 ap-northeast-1**） | 顧客・サイト・設定・依頼 |
| 認証 | Supabase Auth（Google） | ログインと、DB側の権限（RLS） |
| 画像 | Supabase Storage | 顧客のアップロード画像 |
| 決済 | Stripe | サブスクリプション |
| メール | **未決**（後述） | 申込通知・完成通知 |

**消えるもの**: 顧客ごとの GitHubリポ / 顧客ごとの Vercelプロジェクト / GitHub Gist / GAS のデータストア

---

## 3. URL 設計

### 決定（2026-09-03）

- 本体ドメイン: **`shikumiai.com`**
- Mado本体: **`mado.shikumiai.com`**（2026-09-03 決定）
- 顧客サイト: **`mado.shikumiai.com/{顧客が決めたスラッグ}`**
  - 例: `mado.shikumiai.com/tanaka-koumuten`
- 独自ドメインを持っている顧客: **手動で別口対応**（v1 では自動化しない）

### この形の利点

**`proxy.ts`（旧 middleware）もワイルドカードDNSも不要。** Next.js の
「静的ルートが動的ルートより優先される」性質だけで成立する。

```
src/app/
  page.tsx                 → mado.shikumiai.com/          （LP）
  start/…                  → /start                            （申込）
  member/…                 → /member                           （会員）
  admin/…                  → /admin                            （管理）
  api/…                    → /api/*
  [siteSlug]/page.tsx      → /tanaka-koumuten                  （顧客サイト）★
```

`/start` は静的ルートが勝ち、`/tanaka-koumuten` だけが `[siteSlug]` に落ちる。

### 将来の拡張に備える設計（今やる、安い保険）

サイトの特定処理を **1つの関数に閉じ込める**。

```ts
// src/lib/resolve-site.ts
// 「このリクエストはどの顧客サイトか」を返す唯一の入口。
// v1: パス（/tanaka）だけを見る
// v2: サブドメイン（tanaka.mado.shikumiai.com）や独自ドメインを足す場合も
//     この関数と proxy.ts を追加するだけで済み、ページ側は書き換え不要
export function resolveSiteSlug(host: string, pathSegment: string): string | null
```

こうしておけば、あとでサブドメイン方式や独自ドメインに広げるとき、
**ページとレンダラーには一切手を入れずに済む。**

### Mado本体（LP・申込・会員・管理）の置き場所

v1 では **同じ `mado.shikumiai.com` に全部載せる**。`/` が LP、`/start` が申込、
`/tanaka-koumuten` が顧客サイトになる。

将来 LP だけ別のホスト名に出したくなったら、**同じ Vercel プロジェクトに
2つ目のドメインを追加するだけ**で済む。コードには手を入れない。

### DNS（2026-09-03 実測）

| ホスト | 現状 |
|---|---|
| `shikumiai.com` | **エックスサーバーの初期ページ**（取得済み・中身は未設置） |
| `mado.shikumiai.com` | 未設定（証明書エラー） |
| `shikumiya.vercel.app` | Madoの LP が稼働中 |

つまり `shikumiai.com` の DNS はエックスサーバー側にある。
ここから Mado を出すのに必要なのは **CNAME レコード1行だけ**。

```
mado.shikumiai.com  CNAME  cname.vercel-dns.com
```

- `shikumiai.com` 本体（エックスサーバー）には手を触れない
- サブドメインの CNAME は **Vercel のアカウントをまたいで貼れる**。
  Madoの Vercel プロジェクトを今のアカウントに置いたままでも成立する
- 手順: Vercel のプロジェクト設定でドメインを追加 → 表示された CNAME を
  エックスサーバーの DNS に登録 → 証明書は Vercel が自動で取る

### 予約語（顧客が取れないスラッグ）

`start` `member` `admin` `api` `login` `signup` `legal` `privacy` `features`
`lp` `templates` `portfolio-templates` `preview` `order` `portfolio` `test`
`s` `images` `assets` `_next` `favicon.ico` `robots.txt` `sitemap.xml`

→ DB のテーブル + トリガーで強制する（後述）。アプリ側チェックだけだと必ず漏れる。

---

## 4. データ設計

### 考え方

- **`config` は jsonb で持つ。** 今の `SiteConfig` 型がそのまま入るので、
  Renderer もエディタも書き換えずに済む。移行コスト最小。
  あとから検索したい項目が出たら、その時に列へ切り出せばいい。
- **請求単位を最初に決める。** SaaS決済憲章の「箱＝法人格＝請求単位を初期で一致させる」に従う。
  現状は `order_id` が全部の主語になっていて、これは将来必ず詰まる。
  新設計では **`orgs`（契約している会社1社）が請求単位**。

### DDL（`supabase/migrations/0001_init.sql`）

すべて冪等（何度実行しても安全）に書く。

```sql
-- ════════════════════════════════════════
-- 0001_init.sql — Mado v2 初期スキーマ
-- ════════════════════════════════════════

-- ─── 契約している会社（= 請求単位）───
create table if not exists public.orgs (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null,                    -- 会社名
  email                  text not null,                    -- 連絡先
  phone                  text not null default '',
  industry               text not null default 'other',
  plan                   text not null default 'otameshi', -- otameshi/omakase/omakase-pro
  status                 text not null default 'active',   -- active/past_due/canceled
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- ─── 会社とログインユーザーの紐付け ───
create table if not exists public.org_members (
  org_id     uuid not null references public.orgs(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null default 'owner',                -- owner/editor
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- ─── サイト（1社1サイトから始めるが、将来複数持てる形にしておく）───
create table if not exists public.sites (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.orgs(id) on delete cascade,
  slug          text not null unique,          -- URL の /{slug}
  custom_domain text unique,                   -- v1 では手動運用。列だけ用意
  template_id   text not null,                 -- warm-craft / trust-navy / clean-arch
  status        text not null default 'draft', -- draft/live/suspended
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists sites_org_id_idx on public.sites(org_id);
create index if not exists sites_slug_live_idx on public.sites(slug) where status = 'live';

-- ─── サイトの中身（今の site.config.json）───
create table if not exists public.site_configs (
  site_id    uuid primary key references public.sites(id) on delete cascade,
  config     jsonb not null default '{}'::jsonb,
  version    integer not null default 1,       -- 同時編集の衝突検出に使う
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

-- ─── 履歴（元に戻せる）───
create table if not exists public.site_config_versions (
  id         bigserial primary key,
  site_id    uuid not null references public.sites(id) on delete cascade,
  config     jsonb not null,
  version    integer not null,
  note       text not null default '',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists scv_site_created_idx
  on public.site_config_versions(site_id, created_at desc);

-- ─── 画像 ───
create table if not exists public.assets (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid not null references public.sites(id) on delete cascade,
  storage_path text not null,                  -- site-assets バケット内のパス
  kind         text not null default 'photo',
  bytes        integer,
  width        integer,
  height       integer,
  created_at   timestamptz not null default now()
);
create index if not exists assets_site_idx on public.assets(site_id);

-- ─── 編集依頼（Lyo が手で対応するもの）───
create table if not exists public.edit_requests (
  id         uuid primary key default gen_random_uuid(),
  site_id    uuid not null references public.sites(id) on delete cascade,
  kind       text not null,                    -- text/image/layout/feature
  body       text not null,
  status     text not null default 'pending',  -- pending/working/done/rejected
  ai_result  jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists edit_requests_status_idx
  on public.edit_requests(status, created_at desc);

-- ─── AI編集の回数制限（プラン別）───
create table if not exists public.ai_edit_usage (
  site_id uuid not null references public.sites(id) on delete cascade,
  period  text not null,                       -- 'YYYY-MM'
  used    integer not null default 0,
  primary key (site_id, period)
);

-- ─── 予約スラッグ ───
create table if not exists public.reserved_slugs (slug text primary key);
insert into public.reserved_slugs (slug) values
  ('start'),('member'),('admin'),('api'),('login'),('signup'),('legal'),('privacy'),
  ('features'),('lp'),('templates'),('portfolio-templates'),('preview'),('order'),
  ('portfolio'),('test'),('s'),('images'),('assets'),('_next'),
  ('favicon.ico'),('robots.txt'),('sitemap.xml')
on conflict do nothing;

-- ─── Lyo（プラットフォーム管理者）───
create table if not exists public.platform_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
```

### スラッグの検証（DB側で強制）

```sql
create or replace function public.check_site_slug()
returns trigger language plpgsql as $$
begin
  if exists (select 1 from public.reserved_slugs where slug = new.slug) then
    raise exception 'この URL は使用できません: %', new.slug;
  end if;
  if new.slug !~ '^[a-z0-9]([a-z0-9-]{1,48}[a-z0-9])?$' then
    raise exception 'URL は英小文字・数字・ハイフンのみ、3〜50文字にしてください: %', new.slug;
  end if;
  return new;
end $$;

drop trigger if exists sites_check_slug on public.sites;
create trigger sites_check_slug
  before insert or update of slug on public.sites
  for each row execute function public.check_site_slug();
```

### 同時編集の衝突検出

config は「今の version を送って、一致したときだけ書ける」形にする。
結果は戻り値で返す（`{"ok":true,"version":2}` / `{"ok":false,"reason":"conflict"}`）。
エディタ側は `ok` を見て、衝突なら上書きを止めて読み直しを促す。

**戻り値にした理由（2026-09-03 に実機で踏んだ）**: 最初は衝突時に
errcode `40001` で例外を投げていた。40001 は Postgres の serialization_failure
（＝やり直せ）で、接続プールが自動リトライを繰り返す。結果レスポンスが返らず
タイムアウトした。PostgREST の対応表でも `40*` は HTTP 500 に丸められる。
戻り値で返す形にすれば、この手の解釈違いが起きない。

実物: `supabase/migrations/0002_config_save_result.sql`

```sql
create or replace function public.update_site_config(
  p_site_id uuid, p_config jsonb, p_expected_version integer, p_note text default ''
) returns jsonb
language plpgsql
security invoker              -- RLS を効かせる（definer にすると穴になる）
set search_path = public
as $$
declare
  v_current integer;
  v_new     integer;
begin
  select version into v_current from public.site_configs where site_id = p_site_id;

  if v_current is null then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  if v_current <> p_expected_version then
    return jsonb_build_object('ok', false, 'reason', 'conflict', 'current_version', v_current);
  end if;

  update public.site_configs
     set config = p_config, version = version + 1,
         updated_at = now(), updated_by = auth.uid()
   where site_id = p_site_id and version = p_expected_version
  returning version into v_new;

  insert into public.site_config_versions (site_id, config, version, note, created_by)
  values (p_site_id, p_config, v_new, p_note, auth.uid());

  return jsonb_build_object('ok', true, 'version', v_new);
end $$;
```

---

## 5. RLS（誰が何を触れるか。DB側で保証する）

**方針**: 「アプリのバグで他人のサイトが編集される」が構造的に起きない形にする。
権限チェックを DB 側に持たせる価値は、書き漏らしが事故に直結しなくなる点にある。
あとから API を1本足したときに `where org_id = ...` を書き忘れても、DB が拒否して止める。

### 再帰を避けるためのヘルパー（必須）

RLS のポリシーが別テーブルを参照すると無限再帰しやすい。
`security definer` の関数に閉じ込めるのが定石。

```sql
create or replace function public.user_org_ids()
returns setof uuid
language sql stable security definer set search_path = public as $$
  select org_id from public.org_members where user_id = auth.uid()
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.platform_admins where user_id = auth.uid())
$$;
```

### ポリシー

```sql
alter table public.orgs                  enable row level security;
alter table public.org_members           enable row level security;
alter table public.sites                 enable row level security;
alter table public.site_configs          enable row level security;
alter table public.site_config_versions  enable row level security;
alter table public.assets                enable row level security;
alter table public.edit_requests         enable row level security;
alter table public.ai_edit_usage         enable row level security;

-- ── 顧客サイトは誰でも見られる（公開中のものだけ）──
create policy "public_read_live_sites" on public.sites
  for select using (status = 'live');

create policy "public_read_live_site_configs" on public.site_configs
  for select using (
    exists (select 1 from public.sites s
             where s.id = site_configs.site_id and s.status = 'live')
  );

-- ── 自分の会社のものは読める ──
create policy "member_read_own_org" on public.orgs
  for select to authenticated using (id in (select public.user_org_ids()));

create policy "member_read_own_sites" on public.sites
  for select to authenticated using (org_id in (select public.user_org_ids()));

create policy "member_read_own_configs" on public.site_configs
  for select to authenticated using (
    exists (select 1 from public.sites s
             where s.id = site_configs.site_id
               and s.org_id in (select public.user_org_ids()))
  );

-- ── 自分の会社のサイトだけ書ける ──
create policy "member_write_own_configs" on public.site_configs
  for update to authenticated using (
    exists (select 1 from public.sites s
             where s.id = site_configs.site_id
               and s.org_id in (select public.user_org_ids()))
  );

-- ── Lyo は全部見える ──
create policy "admin_read_all_orgs"  on public.orgs  for select to authenticated using (public.is_platform_admin());
create policy "admin_read_all_sites" on public.sites for select to authenticated using (public.is_platform_admin());
-- edit_requests / assets / ai_edit_usage も同じ形で足す
```

**プランの変更・Stripe 連携・サイト作成は service_role のみ**（サーバーの API 内だけ）。
顧客が自分でプランを書き換えられない形にする。

---

## 6. 画像（Storage）

```sql
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

create policy "public_read_site_assets" on storage.objects
  for select using (bucket_id = 'site-assets');
```

- パス: `{site_id}/{YYYYMM}/{uuid}.webp`
- **アップロードはサーバー経由（service_role）**。理由: 受け取った画像を `sharp` で
  webp 変換＋リサイズしてから置きたいから。そのまま置くと重い画像が野放しになる
- **Base64 を DB に入れない**（技術メモ `spabase.html` の実測記録どおり）
- Gist は廃止

---

## 7. 認証

**Supabase Auth に一本化**（Google プロバイダ）。

- スプレッドシートのパスワード列 → 廃止
- `orderId + email` を毎回投げる本人確認 → 廃止
- `next-auth` → 削除

初回ログイン時のつなぎ込み:

```
Google ログイン成功
  → auth.users に行ができる
  → org_members に自分の行があるか確認
      あり  → その org のダッシュボードへ
      なし  → /start（申込フロー）へ
```

**Lyo 自身の管理者権限**は `platform_admins` に自分の user_id を1行入れるだけ。

---

## 8. 描画と「即反映」の仕組み

### v1: キャッシュを入れない（推奨）

顧客サイトのページは Server Component で毎回 Supabase を1回 SELECT して描く。

- Supabase 東京（ap-northeast-1）+ Vercel 東京（hnd1）で、索引付き1件 SELECT は **数ms〜20ms**
- 顧客0件からの立ち上げにこれ以上の作り込みは要らない
- **「保存したら即反映」が理屈抜きで確実に成立する**

`vercel.json`（リポ直下）:

```json
{ "regions": ["hnd1"] }
```

技術メモ `spabase.html` の実測: この1行でサーバー応答が 0.22〜0.32秒 → 0.065秒。
DB を読むページはさらに差が出る。**東京固定は最初にやる。**

### v2: 負荷が出てきたらキャッシュを足す

Next.js 16 の Cache Components を使う。

```ts
// 読む側
'use cache'
cacheTag(`site:${slug}`)

// 保存側（Server Action の中）
updateTag(`site:${slug}`)   // 即座に無効化 = read-your-own-writes
```

**注意点（実装時に必ず守る）**

- `use cache` / `cacheTag` は `next.config.ts` の `cacheComponents: true` が前提。
  これはアプリ全体の既定挙動を変えるので、顧客サイトができてから入れる
- `updateTag` は **Server Action の中でしか呼べない**。Route Handler では使えない。
  → **保存処理は Server Action で書く**
- Route Handler で無効化したい場合は `revalidateTag(tag, "max")`。
  ただしこれは stale-while-revalidate なので「保存直後に古い内容が見える」ことがある
- 単一引数の `revalidateTag(tag)` は非推奨

---

## 9. 申込フロー（新）

```
/start
  → 業種・テンプレ選択・会社情報入力
  → Google ログイン（Supabase Auth）
  → サイトURL（スラッグ）入力 → 重複チェック（sites.slug の unique）
  ↓
  【おためし（無料）】
    orgs / org_members / sites / site_configs に INSERT   ← これだけ。1秒
    → 完成
  【おまかせ / おまかせプロ】
    Stripe Checkout へ
      ↓ 決済完了
    Stripe webhook → orgs を作って plan と subscription を紐付け
                   → sites / site_configs を INSERT
    → 完成
```

**旧設計との差**: リポ作成も 5秒 sleep も Vercel プロジェクト作成もない。
**DB に行を入れるだけ**なので、失敗しようがないし、失敗したら普通にエラーを返せる。
「注文は成功扱いにしてサイトだけ無い」が構造的に起きなくなる。

申込途中の一時保存に使っていた **Gist は不要**（Stripe の metadata に載せるか、
`orgs` を `status='pending'` で先に作って決済完了で `active` にする。後者を推奨）。

---

## 10. 編集フロー（新）

```
/member/{siteId}/editor
  ├ 見る    … Renderer で現在の config を描画
  ├ 編集    … クリック → 編集パネル → config を更新
  │           保存 = Server Action → update_site_config(site_id, config, version)
  │           → 成功: 即反映 ／ 409: 「他で変更されています」
  └ AI      … 質問 → Claude API → Before/After → 承認 → 上と同じ保存経路
```

- **画像**: Storage へアップロード → 返ってきた URL を config に書く（1トランザクション）
- **履歴**: 保存のたびに `site_config_versions` に積む → 「1つ前に戻す」が作れる
- **AI編集回数**: `ai_edit_usage` を見てプラン上限で弾く

---

## 11. Stripe

webhook がやることは **`orgs` の1行を更新するだけ**になる。

| イベント | 処理 |
|---|---|
| `checkout.session.completed` | `orgs.status = 'active'`、`stripe_customer_id` / `stripe_subscription_id` を保存、`sites.status = 'live'` |
| `customer.subscription.updated` | `orgs.plan` を更新（プラン変更） |
| `customer.subscription.deleted` | `orgs.status = 'canceled'`、`sites.status = 'suspended'` |
| `invoice.payment_failed` | `orgs.status = 'past_due'` |

### アカウントと価格（2026-09-03 更新）

新しい Stripe アカウントに移行した。旧アカウントの Price ID は死んでいる。

| 項目 | 値 |
|---|---|
| アカウント | `acct_1UBIUDCMwxuV78LX`（JP / JPY / サンドボックス） |
| おまかせ | `omakase_monthly_jpy` → ¥1,480/月 |
| おまかせプロ | `omakase_pro_monthly_jpy` → ¥4,980/月 |
| おためし | Stripe を通さない（¥0） |
| API バージョン | `2026-04-22.dahlia`（`STRIPE_API_VERSION` で一元管理） |

**Price ID はコードにも環境変数にも固定しない。** `lookup_key` で毎回引く
（`src/lib/stripe-server.ts` の `resolvePriceId()`）。Dashboard 側で価格を作り直しても
コードを触らずに追従し、古い ID が残って事故ることもない。環境変数の値は控えとして残してある。

セットアップと確認は何度でも流せる形にしてある。

```
STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs    # 商品と価格を作る（冪等）
STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-verify.mjs   # 疎通確認
```

### 守るルール（stripe-best-practices スキル準拠）

外部スキル `~/.agents/skills/stripe-best-practices/` と、Tasuke 側ラッパー
`Tasuke/docs/design/_references/stripe-best-practices.md` に従う。

| ルール | Madoの状態 |
|---|---|
| `payment_method_types` を渡さない | ✅ 2026-09-03 に2か所から削除。Stripe が `card, link` を自動提示することを実機確認 |
| Subscription は Checkout + Billing API | ✅ Hosted Checkout |
| API key は環境変数経由 | ✅ |
| Webhook の署名検証 | ✅ 2026-09-03 に修正（下記） |
| Webhook の冪等性（`event.id` で重複排除） | ❌ **未実装**。Phase 4 で `stripe_events` テーブルを足す |
| Price ID を lookup_key で引く | ✅ 2026-09-03 対応 |
| Customer Portal でセルフサービス | ❌ 未実装。決済憲章の原則9（解約もアップグレードと同じ手軽さ）に必要 |
| RAK（`rk_`）の採用 | 🟡 未検討。本番化の前に判断する |

**2026-09-03 に塞いだ穴**: webhook に「署名ヘッダが無ければ本文をそのまま信じる」
分岐があった。`stripe-signature` を付けずに POST するだけで検証を素通りでき、
偽の決済完了イベントを投げ込める状態だった。署名と署名鍵の両方を必須にして塞いだ。

**MRR** は `select plan, count(*) from orgs where status='active' group by plan` で出る。
今まで出せなかったのは、これを書ける場所が無かっただけ。

---

## 12. テンプレートの統合（9 → 3）

### 現状（実測）

| テンプレ | page.tsx | セクション |
|---|---:|---|
| warm-craft | 810行 | hero, works, strengths, about, contact |
| warm-craft-mid | 618行 | + testimonials, news |
| warm-craft-pro | 929行 | + booking |
| trust-navy | 736行 | hero, services, works, stats, about, contact |
| trust-navy-mid | 854行 | + testimonials, news |
| trust-navy-pro | 1029行 | + recruit |
| clean-arch | 614行 | hero, works, about, contact |
| clean-arch-mid | 713行 | + awards, testimonials, news |
| clean-arch-pro | 1105行 | （mid と同じ構成） |

**プラン差は「見せるセクションの数」だけ。** ところが `page.tsx` は別々に手書きされていて、
warm-craft と warm-craft-pro で共通行は 810行中 **454行しかない**。同じ hero が3通り書かれている。

### 目指す形

```
templateId は 3つだけ:  warm-craft / trust-navy / clean-arch
プランの差 = sections[] の中身 + 機能フラグ
描画は Renderer 1本   （デモページも / エディタも / 本番サイトも 同じコードで描く）
```

**副産物がひとつ大きい**: PROJECT_STATE に残っている
「Renderer と実テンプレートの見た目が乖離する」「Renderer の手動同期がつらい」という
未解決課題が、**構造ごと消える**。デモページも、エディタのプレビューも、顧客の本番サイトも
同じ Renderer が描くようになるので、見た目がズレる余地が無くなる。直す作業も1か所で済む。

**ただし作業は必要**:
- `trust-navy` の Renderer は未作成 → **必須**（今までは「あとで」でよかったが、
  新設計では Renderer が無い＝そのテンプレは売れない）
- 既存2つの Renderer を `page.tsx` の品質まで引き上げる（今は簡易版）

---

## 13. 残すもの / 捨てるもの

### そのまま使える（9割）

| 資産 | 新設計での役割 |
|---|---|
| テンプレ3系統の見た目 | Renderer に集約して本番描画に昇格 |
| `src/lib/site-config-schema.ts` | **そのまま** jsonb の中身の型定義 |
| `WarmCraftRenderer` / `CleanArchRenderer` | **本番の描画エンジン**に昇格 |
| エディタUI（セクション管理・DnD・フォントピッカー・画像クロップ） | 保存先が GitHub → Supabase に変わるだけ |
| `industry-registry.ts` | そのまま |
| `stripe.ts`（プラン定義・normalizePlanId） | そのまま |
| LP / `/start` のウィザードUI | 送信先が変わるだけ |
| `error-handler.ts` | そのまま |

### 捨てるもの

| 対象 | 理由 |
|---|---|
| `src/lib/github.ts` のリポ作成・push 系 | 顧客リポ自体が無くなる |
| `src/app/api/upload-images/`（Gist） | Storage へ |
| `src/app/api/site-content/` | GitHub から読む必要がない |
| `gas/webhook.gs` のデータストア部分 | Supabase へ（メール送信は要移管） |
| `template-site/`（顧客用テンプレリポ） | 不要 |
| `next-auth` | Supabase Auth へ |
| `src/lib/site-data.ts` / `template-forms.ts` / `SiteDataContext.tsx` | 旧アーティスト時代の残骸 |
| `src/app/templates/*` / `src/components/templates/*` | リダイレクト済みの旧10種 |
| `VERCEL_TOKEN` / `GITHUB_TOKEN` / `GAS_WEBHOOK_URL` | 環境変数ごと不要に |

---

## 14. 実装フェーズ

既存顧客が0件なので、**並走・段階移行は不要**。旧コードは動かしたまま横に置き、
新経路が通ったらまとめて削除する。

| Phase | やること | 完了の判定 |
|---|---|---|
| **0. 器** ✅ | Supabase（東京・プロジェクト名 `site`）作成 / `vercel.json` に hnd1 / `0001` + `0002` 適用 / 疎通確認 | **2026-09-03 完了**。全10テーブル・RLS・スラッグ検証まで実機確認 |
| **1. 描画** ✅ | `[siteSlug]/page.tsx` を作り、DB の config を Renderer で描く / テスト行を1件投入 | **2026-09-03 完了**。`/test-koumuten` が表示。DB直読みで 0.06 秒 |
| **2. 認証** | Supabase Auth（Google）/ `org_members` の紐付け / `platform_admins` に Lyo | ログインして自分の org が引ける |
| **3. 編集** | エディタの保存先を Supabase に / Server Action + `update_site_config` / 画像を Storage へ | 文字を直して**1秒で**サイトに出る |
| **4. 申込** | `/start` → orgs/sites を INSERT / Stripe webhook を書き換え | 申込→サイト公開が通しで動く |
| **5. 管理** | `/admin` を実データに / 顧客一覧・MRR・依頼キュー | Lyo が1画面で全部見える |
| **6. テンプレ統合** | 9→3 に集約 / trust-navy Renderer 作成 / デモページも Renderer 経由に | 3系統すべてがエディタで編集できる |
| **7. 掃除** | 旧コード・旧環境変数・GAS・Gist を削除 | `github.ts` が消えてもビルドが通る |

**Phase 3 が終わった時点で、Lyo が最初に欲しかった「即反映」が手に入る。**

---

## 15. 環境変数（新）

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co    ← ダッシュボードのURLではない
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...                        ← NEXT_PUBLIC_ を付けない

# Stripe（既存のまま）
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_OMAKASE=price_1TME8iAHGiGiMXDLnD472lto
STRIPE_PRICE_OMAKASE_PRO=price_1TME9WAHGiGiMXDLgUexR5PV

# AI編集
ANTHROPIC_API_KEY=

NEXT_PUBLIC_BASE_URL=https://mado.shikumiai.com
```

**削除**: `GITHUB_TOKEN` / `GITHUB_OWNER` / `GITHUB_TEMPLATE_REPO` / `VERCEL_TOKEN` /
`GAS_WEBHOOK_URL` / `OPENAI_API_KEY` / `AUTH_*`（next-auth）/ 旧 `STRIPE_PRICE_*`

---

## 16. 未決事項（着手前に決める）

| # | 論点 | 選択肢 | 備考 |
|---|---|---|---|
| 1 | **Vercel のプラン** | Hobby のまま / Pro（約 $20/月） | 商用は Pro が規約上必要。おまかせ2件で回収 |
| 2 | **メール送信** | Vercel Marketplace から選ぶ / GAS を送信専用で残す | GAS を捨てると申込通知・完成通知が消える。**Phase 4 までに決める** |
| 7 | **Stripe の Connect / Invoicing** | 使わない（推奨） / 使う | Connect は代金を他人に分配する仕組み。Madoは自社課金なので Payments + Billing で足りる。請求書もサブスクなら Billing が自動発行 |
| 8 | **Webhook の署名鍵** | 新アカウントで endpoint を作って `whsec_` を取得 | 現状 `STRIPE_WEBHOOK_SECRET` は空。入るまで webhook は 500 を返して受け付けない |
| 3 | ~~`shikumiai.com` の取得~~ | **取得済み**。DNS はエックスサーバー。CNAME 1行を足すだけ | 解決 |
| 4 | **旧 `shikumiya.vercel.app`** | リダイレクト / 残す | 公開実績が無いので好きにしてよい |
| 5 | **Supabase の課金プラン** | Free / Pro（$25/月） | Free は非アクティブで一時停止される。顧客が付いたら Pro |
| 6 | **Supabase / Vercel のアカウント** | しくみあい用アカウントで作る | Claude から見えるのは Tasuke のアカウントのみ。作成は Lyo の手で行う |

---

## 17. 判断記録

- **2026-09-03**: 「顧客ごとにリポとVercelプロジェクトを作る」方式を廃止。
  理由は上の「げ」の9項目。とくに **②テンプレ修正が既存顧客に届かない** が事業の上限になるため。
- **2026-09-03**: URL は「サービス名サブドメイン + 顧客スラッグのパス」。
  独自ドメインの自動化は v1 では**やらない**と決定（Lyo）。工数と障害点が大きく減る。
  ただし `resolveSiteSlug()` に特定処理を閉じ込め、あとで広げられる形にする。
- **2026-09-03**: 認証は Supabase Auth に一本化。理由は RLS でDB側が権限を保証できるため。
  1人開発で「アプリのバグで他人のデータが見える」を構造的に防ぐことを優先。
- **2026-09-03**: config は正規化せず jsonb。理由は既存の Renderer / エディタ / 型定義を
  そのまま使えるため。必要になった時点で列に切り出す。
- **2026-09-03**: v1 ではページキャッシュを入れない。東京同士なら DB 直読みで十分速く、
  「即反映」が確実に成立するため。負荷が出たら Cache Components を足す。
