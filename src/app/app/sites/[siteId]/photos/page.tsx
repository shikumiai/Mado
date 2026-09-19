import Link from "next/link";
import { redirect } from "next/navigation";
import { loadSiteForEdit } from "@/lib/site-editor";
import { PhotoLibrary } from "@/components/editor/PhotoLibrary";

export const metadata = { title: "写真を入れ替える｜Mado" };

export default async function PhotosPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const loaded = await loadSiteForEdit(siteId);
  if (!loaded.ok) {
    if (loaded.reason === "unauthenticated") redirect(`/auth/login?next=${encodeURIComponent(`/app/sites/${siteId}/photos`)}`);
    return <section className="space-y-4"><h1 className="font-serif text-2xl">写真を開けませんでした</h1><p className="text-ink2">サイトが見つからないか、このアカウントでは編集できません。</p><Link className="underline" href="/app">マイページへ戻る</Link></section>;
  }
  return <PhotoLibrary initial={loaded} />;
}
