"use client";

/**
 * 導線を作る画面の中身（docs/FUNNEL_CHECK_V1.md §6）。
 *
 * やることは2つだけ。名前を付けて、段を上から順に足す。
 * 段は「種類を選ぶ」「URL を入れる」で終わり。自分の Mado サイトは選ぶだけ。
 * 保存したら詳細画面へ移る。結果はトーストで伝え、モーダルでは割り込まない。
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field, useToast } from "@/components/ui";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import type { Hop, HopKind } from "@/lib/funnels/types";
import { HOP_KINDS, HOP_KIND_ORDER, defaultHopLabel } from "@/lib/funnels/kinds";
import { createFunnel } from "@/lib/funnels/actions";

export interface SiteChoice {
  id: string;
  slug: string;
}

const selectClass =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none " +
  "transition-[border-color,box-shadow] duration-200 ease-brand " +
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-bg";

function newHop(kind: HopKind, sites: SiteChoice[]): Hop {
  return {
    kind,
    label: defaultHopLabel(kind),
    url: kind === "mado" ? (sites[0]?.id ?? "") : "",
  };
}

export function NewFunnelForm({ sites }: { sites: SiteChoice[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [hops, setHops] = useState<Hop[]>([newHop("x", sites), newHop("mado", sites)]);
  const [error, setError] = useState<string | null>(null);

  function patch(index: number, next: Partial<Hop>) {
    setHops((prev) => prev.map((h, i) => (i === index ? { ...h, ...next } : h)));
  }

  function changeKind(index: number, kind: HopKind) {
    setHops((prev) =>
      prev.map((h, i) => {
        if (i !== index) return h;
        const keepLabel = h.label !== "" && h.label !== defaultHopLabel(h.kind);
        return {
          kind,
          label: keepLabel ? h.label : defaultHopLabel(kind),
          url: kind === "mado" ? (sites[0]?.id ?? "") : h.kind === "mado" ? "" : h.url,
        };
      }),
    );
  }

  function move(index: number, dir: -1 | 1) {
    setHops((prev) => {
      const to = index + dir;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
  }

  function remove(index: number) {
    setHops((prev) => prev.filter((_, i) => i !== index));
  }

  function save() {
    const trimmedName = name.trim();
    if (trimmedName === "") {
      setError("導線の名前を入れてください。");
      return;
    }
    if (hops.length === 0) {
      setError("段を1つ以上足してください。");
      return;
    }
    const blank = hops.findIndex((h) => h.url.trim() === "");
    if (blank >= 0) {
      setError(
        hops[blank].kind === "mado"
          ? `${blank + 1}段目のサイトを選んでください。`
          : `${blank + 1}段目の URL を入れてください。`,
      );
      return;
    }
    setError(null);

    const madoHop = hops.find((h) => h.kind === "mado");
    const payload = {
      name: trimmedName,
      siteId: madoHop?.url ?? null,
      hops: hops.map((h) => ({
        kind: h.kind,
        label: h.label.trim() === "" ? defaultHopLabel(h.kind) : h.label.trim(),
        url: h.url.trim(),
      })),
    };

    startTransition(async () => {
      const res = await createFunnel(payload);
      if (!res.ok) {
        toast({
          title: "導線を保存できませんでした",
          description: res.message ?? "もう一度お試しください。",
          tone: "warn",
        });
        return;
      }
      toast({ title: "導線を保存しました", tone: "success" });
      router.push(`/app/funnels/${res.id}`);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <Field
          label="導線の名前"
          required
          placeholder="X から LINE 経由"
          helper="あとで見分けるための名前です。"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink2">段（上から順に通る場所）</h2>

        <ul className="flex flex-col gap-3">
          {hops.map((hop, i) => {
            const info = HOP_KINDS[hop.kind];
            return (
              <li key={i}>
                <Card className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="tnum text-xs font-medium text-ink3">{i + 1}段目</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="1つ上に動かす"
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                      >
                        <ChevronUp className="size-4" aria-hidden />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="1つ下に動かす"
                        disabled={i === hops.length - 1}
                        onClick={() => move(i, 1)}
                      >
                        <ChevronDown className="size-4" aria-hidden />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="この段を削除"
                        onClick={() => remove(i)}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor={`hop-kind-${i}`}
                      className="text-sm font-medium text-ink"
                    >
                      種類
                    </label>
                    <select
                      id={`hop-kind-${i}`}
                      className={selectClass}
                      value={hop.kind}
                      onChange={(e) => changeKind(i, e.target.value as HopKind)}
                    >
                      {HOP_KIND_ORDER.map((k) => (
                        <option key={k} value={k}>
                          {HOP_KINDS[k].label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-ink3">{info.input}</p>
                  </div>

                  {hop.kind === "mado" ? (
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor={`hop-site-${i}`} className="text-sm font-medium text-ink">
                        サイト
                      </label>
                      {sites.length === 0 ? (
                        <p className="text-sm text-ink2">
                          まだサイトがありません。先にサイトを作ってから選べます。
                        </p>
                      ) : (
                        <select
                          id={`hop-site-${i}`}
                          className={selectClass}
                          value={hop.url}
                          onChange={(e) => patch(i, { url: e.target.value })}
                        >
                          {sites.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.slug}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ) : (
                    <Field
                      label="URL"
                      required
                      inputMode="url"
                      placeholder={info.placeholder}
                      value={hop.url}
                      onChange={(e) => patch(i, { url: e.target.value })}
                    />
                  )}

                  <Field
                    label="画面に出す名前"
                    placeholder={defaultHopLabel(hop.kind)}
                    value={hop.label}
                    onChange={(e) => patch(i, { label: e.target.value })}
                  />

                  {info.skips !== "" && (
                    <p className="rounded-md border border-line bg-surface2/60 px-3 py-2 text-xs text-ink3">
                      {info.skips}
                    </p>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>

        <div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="size-4" aria-hidden />}
            onClick={() => setHops((prev) => [...prev, newHop("web", sites)])}
          >
            段を追加
          </Button>
        </div>
      </section>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button loading={pending} onClick={save}>
          保存する
        </Button>
        <Button variant="ghost" disabled={pending} onClick={() => router.push("/app/funnels")}>
          やめる
        </Button>
      </div>
    </div>
  );
}
