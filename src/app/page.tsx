import Link from "next/link";
import FunnelDemo from "@/components/pilot/FunnelDemo";
import "./pilot.css";
export default function Home() {
  return (
    <div className="mado">
      <header className="m-header">
        <Link className="m-logo" href="/">
          mado<span>つくる。その先を、一緒に。</span>
        </Link>
        <nav>
          <a href="#how">使い方</a>
          <Link href="/pilot">ログイン</Link>
        </nav>
      </header>
      <main>
        <section className="m-hero">
          <div className="m-hero-copy">
            <p className="m-pilot-label">Mado初期版 · 顧客の導線チェック</p>
            <h1>
              できたサイト。
              <br />
              お客さまは、
              <br />
              先へ進める？
            </h1>
            <p className="m-lead">
              見つける。理解する。問い合わせる。
              <br />
              その途中の「分からない」を、
              <br />
              人の実操作とAIの視点で確かめます。
            </p>
            <div className="m-hero-actions">
              <Link className="m-button" href="/pilot">
                サイトの導線を相談する
              </Link>
              <a className="m-text-button" href="#demo">
                確認結果の例を見る
              </a>
            </div>
            <p className="m-small">
              相談は無料。確認範囲と金額への合意後に進めます。
            </p>
          </div>
          <div className="m-journey-hero">
            <p className="m-pilot-label">ひとつの導線を、順番に。</p>
            <ol>
              <li>
                <span>01</span>
                <div>
                  <strong>紹介ページに入る</strong>
                  <p>自分に関係があると分かる？</p>
                </div>
              </li>
              <li className="m-journey-focus">
                <span>02</span>
                <div>
                  <strong>内容・料金を理解する</strong>
                  <p>「結局いくら？」で止まっていない？</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>問い合わせへ進む</strong>
                  <p>次に何をすればいいか分かる？</p>
                </div>
              </li>
              <li>
                <span>04</span>
                <div>
                  <strong>送信・完了を確かめる</strong>
                  <p>許可されたテスト環境で確認。</p>
                </div>
              </li>
            </ol>
          </div>
        </section>
        <section className="m-section" id="demo">
          <FunnelDemo />
        </section>
        <section className="m-statement m-section">
          <h2>
            AIと人間では、
            <br />
            分かることが違う。
          </h2>
          <div>
            <p>
              AIには、説明の抜けやページ間の食い違いを。人には、実際に操作したときの迷いや疑問を。
            </p>
            <p>
              誰が、どこで、何を確かめたかを分けてお届けします。AIの推測を、人のお客さまの声として扱いません。
            </p>
          </div>
        </section>
        <section id="how" className="m-section">
          <div className="m-section-heading">
            <h2>まずは、ひとつの導線から。</h2>
            <p>紹介ページ → 問い合わせに絞った小さな初期版です。</p>
          </div>
          <ol className="m-steps">
            <li>
              <span>01</span>
              <h3>URLと目的を伝える</h3>
              <p>
                誰に、最後に何をしてほしいか。気になる箇所と一緒に教えてください。
              </p>
            </li>
            <li>
              <span>02</span>
              <h3>範囲と見積を確認する</h3>
              <p>
                人の人数、AIの観点、操作範囲と納期を運営が調整。内容と金額に合意してから進みます。
              </p>
            </li>
            <li>
              <span>03</span>
              <h3>直して、もう一度確かめる</h3>
              <p>
                観察・理由の仮説・改善案が届きます。修正後は前の結果を残して再確認を相談できます。
              </p>
            </li>
          </ol>
        </section>
        <section className="m-section">
          <h2>始める前に</h2>
          <details className="m-panel">
            <summary>いくらかかりますか？</summary>
            <p>
              確認する人数・条件・範囲に合わせて個別に見積します。相談の送信だけでは料金は発生しません。再確認も別途見積です。
            </p>
          </details>
          <details className="m-panel">
            <summary>実際に問い合わせが送られますか？</summary>
            <p>
              通常は送信直前までです。送信後まで確認する場合は、依頼者が許可したテスト環境で実施します。
            </p>
          </details>
          <details className="m-panel">
            <summary>売上や成約率も分かりますか？</summary>
            <p>
              初期版で届けるのは、確認時の観察と改善の仮説です。実際の訪問者の離脱率や成約率を計測する機能はありません。改善の効果は、修正後に別途確かめる必要があります。
            </p>
          </details>
          <details className="m-panel">
            <summary>すべて自動で確認されますか？</summary>
            <p>
              初期版は運営が依頼を確認し、協力者とAIの方法を組み合わせて進めます。対象者を確保できない場合も含め、実施できる内容を見積時にお伝えします。
            </p>
          </details>
        </section>
        <section className="m-invitation">
          <div>
            <h2>「できた」の先を、一緒に。</h2>
            <p>まずは、いちばん気になる導線をひとつ。</p>
          </div>
          <Link href="/pilot" className="m-button">
            導線を相談する
          </Link>
        </section>
      </main>
      <footer className="m-footer">
        <Link className="m-logo" href="/">
          mado
        </Link>
        <Link href="/pilot/join">確認の方法・協力者として参加</Link>
        <Link href="/pilot/privacy">情報の取り扱い</Link>
      </footer>
    </div>
  );
}
