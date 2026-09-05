"use client";

/**
 * パスキーの管理（ログイン中の人が使う）。
 *
 * この端末を「鍵」として登録したり、登録済みのパスキーを見て消したりできる。
 * サーバー側でパスキー機能がまだ有効でない環境では、その旨をやさしく出して、
 * 画面は壊さない（メール・Google での利用はそのまま続けられる）。
 */

import { useCallback, useEffect, useState } from "react";
import { KeyRound, Plus, Trash2, ShieldCheck } from "lucide-react";
import type { PasskeyListItem } from "@supabase/supabase-js";
import { Button, useToast } from "@/components/ui";
import {
  passkeysSupported,
  registerPasskey,
  listPasskeys,
  deletePasskey,
} from "@/lib/supabase/sign-in";

function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}

export function PasskeyManager() {
  const { toast } = useToast();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [items, setItems] = useState<PasskeyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const r = await listPasskeys();
    if (r.ok) {
      setItems(r.items);
      setNotice(null);
    } else {
      setItems([]);
      setNotice(r.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const ok = passkeysSupported();
    setSupported(ok);
    if (ok) {
      void refresh();
    } else {
      setLoading(false);
    }
  }, [refresh]);

  async function handleRegister() {
    setRegistering(true);
    const r = await registerPasskey();
    setRegistering(false);
    if (r.ok) {
      toast({ title: "パスキーを登録しました", description: "次回からこの端末で入れます。", tone: "success" });
      void refresh();
    } else {
      toast({ title: "登録できませんでした", description: r.message, tone: "danger" });
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const r = await deletePasskey(id);
    setDeletingId(null);
    if (r.ok) {
      toast({ title: "削除しました", tone: "success" });
      setItems((prev) => prev.filter((p) => p.id !== id));
    } else {
      toast({ title: "削除できませんでした", description: r.message, tone: "danger" });
    }
  }

  // 端末が非対応
  if (supported === false) {
    return (
      <div className="rounded-lg border border-line bg-surface2/60 p-4 text-sm leading-relaxed text-ink2">
        この端末はパスキーに対応していないようです。対応した端末（最近のスマホやパソコン）でお試しください。
        メールや Google では引き続きログインできます。
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm leading-relaxed text-ink2">
          パスキーを登録すると、次回からこの端末の指紋・顔・暗証番号だけで、パスワードなしで入れます。
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={handleRegister}
          loading={registering}
          leftIcon={<Plus className="size-4" aria-hidden />}
        >
          パスキーを登録
        </Button>
      </div>

      {/* サーバー側でまだ使えない等の案内 */}
      {notice && (
        <div className="rounded-lg border border-line bg-surface2/60 p-4 text-sm leading-relaxed text-ink2">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-2">
          <span className="skeleton h-14 w-full" />
          <span className="skeleton h-14 w-full" />
        </div>
      ) : items.length === 0 && !notice ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-line py-8 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-accent-soft text-accent">
            <KeyRound className="size-5" aria-hidden />
          </span>
          <p className="text-sm text-ink">まだパスキーがありません。</p>
          <p className="text-xs text-ink3">上の「パスキーを登録」から、この端末を鍵として覚えさせましょう。</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((pk) => (
            <li
              key={pk.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                  <ShieldCheck className="size-[18px]" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {pk.friendly_name || "パスキー"}
                  </p>
                  <p className="text-xs text-ink3">
                    {formatDate(pk.created_at)} に登録
                    {pk.last_used_at ? `・最終利用 ${formatDate(pk.last_used_at)}` : ""}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(pk.id)}
                loading={deletingId === pk.id}
                aria-label="このパスキーを削除"
                leftIcon={<Trash2 className="size-4" aria-hidden />}
              >
                削除
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
