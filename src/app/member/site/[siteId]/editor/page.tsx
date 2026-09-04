/**
 * 旧・編集画面の住所（/member/site/[siteId]/editor）。
 *
 * 編集画面は新しい住所 /app/sites/[siteId]/editor に移設・作り直した。
 * 古いリンクやブックマークから来た人を、新しい住所へそのまま送る。
 * 編集の中身（保存・AI・並び替え・画像・履歴）はすべて新エディタ側にある。
 */

import { redirect } from "next/navigation";

export default async function LegacyEditorRedirect({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  redirect(`/app/sites/${siteId}/editor`);
}
