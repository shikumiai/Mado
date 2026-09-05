/**
 * 旧 /admin/requests は /admin の「編集依頼」タブに統合した。
 * 古いブックマークやリンクを切らさないよう、そこへ送る。
 */

import { redirect } from "next/navigation";

export default function AdminRequestsRedirect() {
  redirect("/admin?tab=requests");
}
