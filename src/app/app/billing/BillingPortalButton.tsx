"use client";

/**
 * 「お支払い・プラン変更」ボタン。
 *
 * 押すとサーバー側で Stripe のカスタマーポータルのURLを作り、そこへ移る
 * （アップグレードも解約も、この1つの入口から自分でできる＝SaaS決済憲章）。
 * 失敗したら画面を飛ばさず、下のトーストに理由をそっと出す（割り込まない）。
 */

import { useTransition } from "react";
import { Button, useToast } from "@/components/ui";
import { CreditCard } from "lucide-react";
import { openBillingPortal } from "@/lib/billing";

export function BillingPortalButton() {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const res = await openBillingPortal();
      if (res.ok) {
        window.location.href = res.url;
      } else {
        toast({
          title: "お支払い画面を開けませんでした",
          description: res.reason,
          tone: "warn",
        });
      }
    });
  }

  return (
    <Button
      variant="primary"
      loading={pending}
      onClick={handleClick}
      leftIcon={<CreditCard className="size-4" aria-hidden />}
    >
      お支払い・プラン変更
    </Button>
  );
}
