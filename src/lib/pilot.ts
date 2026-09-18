export const statuses: Record<string, string> = {
  requested: "内容確認中",
  quoted: "見積をご確認ください",
  production: "制作中",
  review: "3案を比較できます",
  revision: "修正中",
  delivered: "納品済み",
  cancelled: "受付終了",
};
export type Variant = {
  title: string;
  description: string;
  path: string;
  creator: string;
};
export type Feedback = { respondent: string; choice: number; reason: string };
export type PilotOrder = {
  id: string;
  user_id: string;
  title: string;
  audience: string;
  facts: string;
  goal: string;
  status: string;
  quote_yen: number | null;
  quote_scope: string;
  quote_accepted_at: string | null;
  payment_confirmed: boolean;
  variants: Variant[];
  feedback: Feedback[];
  selected_variant: number | null;
  revision_note: string;
  delivery_path: string;
  operator_note: string;
  version: number;
  created_at: string;
};
export type ActionState = { error?: string; success?: string };
export function yen(amount: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(amount);
}
export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
export function validAssetPath(
  path: string,
  order: Pick<PilotOrder, "id" | "user_id">,
) {
  return (
    path.startsWith(`${order.user_id}/${order.id}/`) &&
    !path.includes("..") &&
    /^[a-zA-Z0-9/_\-.]+$/.test(path)
  );
}
