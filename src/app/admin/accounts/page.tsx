/**
 * 旧 /admin/accounts は /admin の「顧客」タブに統合した。
 * 古いブックマークやリンクを切らさないよう、そこへ送る。
 */

import { redirect } from "next/navigation";

export default function AdminAccountsRedirect() {
  redirect("/admin?tab=customers");
}
