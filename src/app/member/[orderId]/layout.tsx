/**
 * 旧・会員エリアの枠（作り直し中）。
 *
 * かつては next-auth のセッションとナビを持っていたが、認証を Supabase に
 * 一本化する作り直しの過程で、いったん素通しの枠にしている。中身は各ページの
 * 「準備中」表示。新しい会員エリアは /member/site 系（Supabase 版）に作る。
 */

export default function MemberOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
