/**
 * 段の種類ごとの、画面に出す言葉（docs/FUNNEL_CHECK_V1.md §3・§6）。
 *
 * 画面だけが使う辞書なので、サーバー側の処理は持たせない。
 * 「確かめないこと」は隠さずそのまま出す。できるふりをしない。
 */

import type { HopKind } from "./types";

export interface HopKindInfo {
  /** 選ぶときに出す名前 */
  label: string;
  /** 何を宣言するのか（入力欄の下に出す一言） */
  input: string;
  /** 追跡リンクをどこに貼るか（コピーの横に出す一言） */
  paste: string;
  /** 確かめないこと。空なら出さない */
  skips: string;
  /** URL 欄のヒント */
  placeholder: string;
}

export const HOP_KINDS: Record<HopKind, HopKindInfo> = {
  x: {
    label: "X",
    input: "X のプロフィールの URL を入れます。",
    paste: "X のプロフィールに貼る",
    skips: "X のページの中身と投稿は見ません（X の規約で自動で見に行けないため）。",
    placeholder: "https://x.com/あなたのID",
  },
  line: {
    label: "LINE",
    input: "友だち追加の URL を入れます（lin.ee / line.me）。",
    paste: "LINE のあいさつやメニューに貼る",
    skips: "リッチメニューや配信の中身は見ません（アカウントの権限が要るため）。",
    placeholder: "https://lin.ee/xxxxxxx",
  },
  web: {
    label: "Web ページ",
    input: "ブログや他社サービスなど、任意のページの URL を入れます。",
    paste: "そのページの入口に貼る",
    skips: "ログインの先とフォームの送信は試しません。",
    placeholder: "https://example.com/page",
  },
  mado: {
    label: "自分の Mado サイト",
    input: "自分のサイトを選びます。設定を読んで中身を確かめます。",
    paste: "サイトへの案内に貼る",
    skips: "",
    placeholder: "",
  },
  member: {
    label: "会員ページ",
    input: "ログインが要るページの入口 URL を入れます。",
    paste: "会員ページへの案内に貼る",
    skips: "ログインの先は見ません。入口が生きているかだけ確かめます。",
    placeholder: "https://example.com/members",
  },
  discord: {
    label: "Discord",
    input: "招待の URL を入れます。期限切れかどうかを確かめます。",
    paste: "Discord への招待に貼る",
    skips: "サーバーの中は見ません。",
    placeholder: "https://discord.gg/xxxxxxx",
  },
};

/** 選ぶ順番。上から使われやすい順 */
export const HOP_KIND_ORDER: HopKind[] = ["x", "line", "web", "mado", "member", "discord"];

/** 段の種類の既定の名前（「表示名」の初期値に使う） */
export function defaultHopLabel(kind: HopKind): string {
  return HOP_KINDS[kind].label;
}
