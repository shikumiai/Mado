/**
 * 編集画面の新しい住所（/app/sites/[siteId]/editor）。
 *
 * 編集画面の本体は次のフェーズでここへ移して作り直す。今はまだ既存エディタ
 * （/member/site/[siteId]/editor）が動いているので、この薄い入口が受けて
 * そのまま既存エディタへ送る。ダッシュボードのリンクは先に新しい住所へ向けてある。
 * 移設のときは、このファイルを本物のエディタに差し替えるだけでよい。
 */

import { redirect } from "next/navigation";

export default async function EditorEntry({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  redirect(`/member/site/${siteId}/editor`);
}
