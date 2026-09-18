import Link from "next/link";
import "../pilot.css";
export const metadata = { robots: { index: false, follow: false } };
export default function PilotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mado">
      <header className="m-header">
        <Link href="/" className="m-logo">
          mado<span>つくる。その先を、一緒に。</span>
        </Link>
        <nav>
          <Link href="/pilot">依頼一覧</Link>
          <Link href="/pilot/join">確認に協力する</Link>
        </nav>
      </header>
      <main className="m-workspace">{children}</main>
      <footer className="m-footer">
        <Link href="/">Mado</Link>
        <Link href="/pilot/privacy">情報の取り扱い</Link>
      </footer>
    </div>
  );
}
