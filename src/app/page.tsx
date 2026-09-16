import Link from "next/link";
import ComparisonDemo from "@/components/pilot/ComparisonDemo";
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
            <p className="m-pilot-label">小さく試す、Mado初期版</p>
            <h1>
              AIでつくる。
              <br />
              人の声で、選ぶ。
            </h1>
            <p className="m-lead">
              「できた。でも、これで伝わる？」
              <br />
              商品写真から生まれる3つの案。
              <br />
              人が選んだ理由まで届く、制作の窓口です。
            </p>
            <div className="m-hero-actions">
              <Link href="/pilot" className="m-button">
                商品の制作を相談する
              </Link>
              <a href="#comparison" className="m-text-button">
                比較のイメージを見る
              </a>
            </div>
            <p className="m-small">
              相談は無料。制作は内容と見積をご確認いただいてから。
            </p>
          </div>
          <div className="m-window" aria-hidden="true">
            <span>つくる</span>
            <span>比べる</span>
            <span>選ぶ</span>
            <div className="m-window-line" />
          </div>
        </section>
        <section id="comparison" className="m-section">
          <ComparisonDemo />
        </section>
        <section className="m-statement m-section">
          <h2>
            AIと人間では、
            <br />
            分かることが違う。
          </h2>
          <div>
            <p>
              AIは、いくつもの表現をつくれる。
              <br />
              人は、「どう見えたか」を自分の言葉で話せる。
            </p>
            <p>
              Madoでは、つくり手ごとの制作方法で案を出し、人の感想を集めます。最後に選ぶのは、商品を届けたいあなたです。
            </p>
          </div>
        </section>
        <section id="how" className="m-section">
          <div className="m-section-heading">
            <h2>
              写真を送って、
              <br />
              使う1案が決まるまで。
            </h2>
            <p>初期版は、運営が一件ずつ進めます。</p>
          </div>
          <ol className="m-steps">
            <li>
              <span>1</span>
              <h3>商品のことを教える</h3>
              <p>
                写真・商品の事実・届けたい相手を登録。制作内容と税込の見積をご案内します。
              </p>
            </li>
            <li>
              <span>2</span>
              <h3>3案と、人の感想が届く</h3>
              <p>
                異なる制作方法から画像と見出しを3案。比較協力者が選んだ理由も確認できます。
              </p>
            </li>
            <li>
              <span>3</span>
              <h3>1案を選び、仕上げる</h3>
              <p>
                使いたい案と修正希望を伝えます。合意した範囲で1回調整し、画像をお渡しします。
              </p>
            </li>
          </ol>
        </section>
        <section className="m-invitation m-section">
          <div>
            <h2>まずは、ひとつの商品で。</h2>
            <p>
              ネットショップの商品紹介や、SNSでのお知らせに。
              <br />
              最初の5件を目安に、無理のない規模で試します。
            </p>
            <p className="m-small">
              料金・納期・比較人数はご依頼ごとに提示します。受付状況や素材の内容により、お受けできない場合があります。
            </p>
          </div>
          <Link href="/pilot" className="m-button">
            制作を相談する
          </Link>
        </section>
        <section className="m-section m-faq">
          <h2>依頼する前に</h2>
          <details>
            <summary>まだ料金が決まっていないのですか？</summary>
            <p>
              初期版は一件ごとの見積です。税込金額・制作範囲・納期を提示し、同意をいただいてから進めます。相談を送るだけで課金されることはありません。
            </p>
          </details>
          <details>
            <summary>人の感想は、AIが書くのですか？</summary>
            <p>
              人の比較コメントは、実際の回答を運営が匿名で記録します。AIの分析を人の回答として扱いません。人数や回答者の条件は見積時に確認します。
            </p>
          </details>
          <details>
            <summary>売れる画像になりますか？</summary>
            <p>
              伝わり方を考える材料は得られますが、売上の向上は保証しません。少人数の感想と実際の購買行動には違いがあります。
            </p>
          </details>
          <details>
            <summary>制作方法を提供する側で参加できますか？</summary>
            <p>
              プロンプトや制作手順を持つ方を募集しています。利用範囲と報酬は個別に合意します。
            </p>
            <Link href="/pilot/join">つくり手として応募する</Link>
          </details>
        </section>
      </main>
      <footer className="m-footer">
        <Link className="m-logo" href="/">
          mado
        </Link>
        <Link href="/pilot/join">つくり手として参加</Link>
        <Link href="/pilot/privacy">素材と個人情報の取り扱い</Link>
        <span>© 2026 Lyo Vision</span>
      </footer>
    </div>
  );
}
