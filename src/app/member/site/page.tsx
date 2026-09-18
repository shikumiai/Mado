/**
 * 旧・会員トップ（/member/site）。
 *
 * 会員ホームは /app に移した。古いリンクやブックマーク、ログイン直後の
 * 一時的な着地のために、この画面は /app へ送るだけにする（重複は残さない）。
 * ※ 編集画面 /member/site/[siteId]/editor は別ルートなので、この置き換えの影響は受けない。
 */

import { redirect } from "next/navigation";

export default function MemberSiteRedirect() {
  redirect("/app");
}
