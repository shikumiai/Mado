import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";

import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { LinkButton } from "@/components/marketing/LinkButton";
import IndustryExplorer from "@/components/portfolio-templates/IndustryExplorer";
import { TEMPLATE_IDS } from "@/lib/templates/catalog";
import { ArrowRight } from "lucide-react";

/**
 * 業種別テンプレート一覧。
 *
 * 「自分の業種を見つけて、何が手に入るか一目で分かり、そのまま始められる」ページ。
 * 選ぶ操作と実物のプレビューは IndustryExplorer が受け持つ。
 * ここは枕（ヘッダー）と足（フッター）、締めのひと押し、
 * それに「業種の絵がどれだけ用意できているか」を数えて渡す役。
 */

export const metadata: Metadata = {
  title: "業種別テンプレート｜Mado",
  description:
    "工務店・飲食・美容・クリニック・士業など10業種ぶんのホームページの型。色を選べばその場で塗り替わり、そのまま制作費0円で始められます。",
};

/**
 * public/images/industries に置かれた業種の絵を、ビルド時に数える。
 * 置いてある絵だけを使い、無い業種は線画で描く（空白や壊れ画像を出さない）。
 * 絵を足したいときは、ここに <業種ID>.jpg を置くだけでよい。
 */
function industryPhotos(): Record<string, string> {
  const dir = join(process.cwd(), "public", "images", "industries");
  const found: Record<string, string> = {};
  let files: string[] = [];
  try {
    files = readdirSync(dir);
  } catch {
    return found; // まだ絵を置いていない状態。線画で成立する
  }
  for (const file of files) {
    const m = /^(.+)\.(jpg|jpeg|png|webp|avif)$/i.exec(file);
    if (!m) continue;
    const id = m[1];
    if (TEMPLATE_IDS.includes(id)) found[id] = `/images/industries/${file}`;
  }
  return found;
}

function FinalCta() {
  return (
    <section className="bg-bg">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-line bg-surface px-6 py-14 text-center shadow-sh2 sm:px-12">
          <div
            aria-hidden
            className="window-light pointer-events-none absolute inset-x-0 -top-10 h-56"
          />
          <div className="relative">
            <h2 className="font-serif text-3xl font-bold leading-snug text-ink sm:text-4xl">
              近いものが見つかったら、
              <br className="sm:hidden" />
              そのまま始められます。
            </h2>
            <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ink2">
              写真を送るだけ。制作費0円・月額0円から、最短翌日で公開できます。
              あとから業種も色も変えられます。
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <LinkButton
                href="/start"
                variant="cta"
                size="lg"
                rightIcon={<ArrowRight className="size-4" aria-hidden />}
              >
                サイトを作る
              </LinkButton>
              <LinkButton href="/pricing" variant="secondary" size="lg">
                料金を見る
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PortfolioTemplatesPage() {
  const photos = industryPhotos();

  return (
    <div data-mado-marketing className="min-h-screen bg-bg text-ink">
      <SiteHeader />
      <main>
        <IndustryExplorer photos={photos} />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
