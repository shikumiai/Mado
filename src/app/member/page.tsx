import { ComingSoon } from "@/components/ComingSoon";

export const metadata = { title: "会員ページ（準備中）｜Mado" };

// 旧ログイン画面（next-auth）は撤去。ログインは /auth/login、会員トップは
// /member/site（Supabase 版）へ。この画面は作り直し完了まで準備中表示にする。
export default function MemberPage() {
  return (
    <ComingSoon
      title="会員ページは準備中です"
      message="ログインは新しい入口に移りました。ログインは /auth/login から、サイトの確認は準備が整い次第ご案内します。"
    />
  );
}
