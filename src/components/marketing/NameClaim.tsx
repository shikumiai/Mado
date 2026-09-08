"use client";

/**
 * トップページの主役。「サイトの名前（URL）を、その場で取る」入力。
 *
 * 世界観は窓。ブラウザのモックにはしない。窓の下枠のような1本の帯に、
 * 変わらない住所（mado.shikumiai.com/）と、大きく開いた入力と、暖色の実面ボタンを並べる。
 * スマホでは縦に積む。
 *
 * 打つそばから可否が出る:
 *   形（英小文字・数字・ハイフン）は checkSlug でその場、
 *   空きは checkSlugAvailability を少し待ってから（400ms）確かめる。
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2, AlertCircle } from "lucide-react";
import { checkSlugAvailability } from "@/lib/signup";
import { checkSlug, customerSiteLabel, SITE_URL_PREFIX } from "@/lib/resolve-site";

/** トップの入力欄。ヘッダーやページ下のボタンはここへ運ぶ */
export const CLAIM_ANCHOR_ID = "claim";
export const CLAIM_INPUT_ID = "site-name-input";

type Status = "idle" | "format" | "checking" | "ok" | "taken";

export function NameClaim() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const slug = value.trim();

  useEffect(() => {
    if (!slug) {
      setStatus("idle");
      setMessage(null);
      return;
    }

    // 形はその場で見る（サーバーを待たせない）
    const shape = checkSlug(slug);
    if (!shape.ok) {
      setStatus("format");
      setMessage(shape.message);
      return;
    }

    setStatus("checking");
    setMessage(null);

    const timer = setTimeout(async () => {
      const res = await checkSlugAvailability(slug);
      if (res.ok) {
        setStatus("ok");
        setMessage(null);
      } else {
        setStatus("taken");
        setMessage(res.message);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [slug]);

  // 形が通っていれば進める。空きの確認は申込画面でもう一度行う
  const canGo = status === "ok" || status === "checking";

  function go(e: React.FormEvent) {
    e.preventDefault();
    if (!canGo) return;
    try {
      sessionStorage.setItem("pendingSlug", slug);
    } catch {
      /* 使えなくても URL で渡す */
    }
    router.push(`/start?slug=${encodeURIComponent(slug)}`);
  }

  return (
    <form id={CLAIM_ANCHOR_ID} onSubmit={go} className="scroll-mt-24" noValidate>
      <label htmlFor={CLAIM_INPUT_ID} className="block text-sm font-medium text-ink">
        サイトの名前を決めて、そのまま作りはじめる
      </label>

      {/* 窓の下枠のような1本の帯 */}
      <div className="mt-2.5 flex flex-col gap-2 rounded-xl border border-line bg-surface p-2 shadow-sh2 sm:flex-row sm:items-stretch">
        <div className="flex min-w-0 flex-1 items-center rounded-lg border border-line bg-bg pl-3">
          <span className="tnum shrink-0 whitespace-nowrap text-sm text-ink3">
            {SITE_URL_PREFIX}
          </span>
          <input
            id={CLAIM_INPUT_ID}
            value={value}
            onChange={(e) => setValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder="好きな名前を入力（例: yamada-koumuten）"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-describedby="claim-status"
            className="tnum h-13 min-w-0 flex-1 bg-transparent px-2 text-base text-ink outline-none placeholder:text-sm placeholder:text-ink3"
          />
        </div>

        <button
          type="submit"
          disabled={!canGo}
          className={[
            "inline-flex h-13 shrink-0 items-center justify-center gap-2 rounded-lg px-6 text-base font-medium",
            "transition-[background-color,box-shadow,transform] duration-200 ease-brand",
            "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            "active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45",
            "bg-accent text-on-accent shadow-glow hover:bg-accent-strong",
          ].join(" ")}
        >
          この名前で無料で作る
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>

      <p id="claim-status" role="status" className="mt-2 min-h-5 text-sm">
        {status === "idle" && (
          <span className="text-ink3">英小文字・数字・ハイフンが使えます。あとから変えられます。</span>
        )}
        {status === "format" && (
          <span className="inline-flex items-center gap-1.5 text-ink2">
            <AlertCircle className="size-3.5 shrink-0" aria-hidden />
            {message ?? "英小文字・数字・ハイフンで入力してください。"}
          </span>
        )}
        {status === "checking" && (
          <span className="inline-flex items-center gap-1.5 text-ink2">
            <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden />
            <span className="tnum">{customerSiteLabel(slug)}</span> を確認しています…
          </span>
        )}
        {status === "ok" && (
          <span className="inline-flex items-center gap-1.5 text-success">
            <Check className="size-3.5 shrink-0" aria-hidden />
            使えます。
            <span className="tnum font-medium">{customerSiteLabel(slug)}</span>
          </span>
        )}
        {status === "taken" && (
          <span className="inline-flex items-center gap-1.5 text-danger">
            <AlertCircle className="size-3.5 shrink-0" aria-hidden />
            {message ?? "もう使われています。別の名前を入れてください。"}
          </span>
        )}
      </p>
    </form>
  );
}

export default NameClaim;
