"use server";

/**
 * 顧客サイトの問い合わせ・予約の受け口。
 *
 * 顧客サイトを見た人（ログインしていない人）が送るので、Cookie のセッションは無い。
 * そのため service_role で書く。誰でも呼べる入口だから、ここで
 *   ・入力が形として正しいか
 *   ・その site が本当に公開中か
 *   ・短時間に何度も送られていないか
 * を必ず確かめてから1行入れる。
 *
 * 届いたら、そのサイトの持ち主（会社の連絡先メール）に通知する。
 * 通知が失敗しても保存は成功させる（メールより記録を優先）。
 *
 * 持ち主が見る側（マイページの一覧・対応済みの印）もここにまとめる。
 */

import { revalidatePath } from "next/cache";
import { getWriteClient } from "./supabase/server";
import { createServerSupabase } from "./supabase/ssr";
import { sendMail } from "./mail";
import { SITE_BASE_URL } from "./resolve-site";

/* ═══════════════════════════════════════
   型
   ═══════════════════════════════════════ */

export type InquiryKind = "contact" | "booking";

export interface InquiryInput {
  /** 送り先のサイト。公開サイトのページから渡される */
  siteId: string;
  kind: InquiryKind;
  name: string;
  email: string;
  phone?: string;
  message: string;
  /** 予約の希望日時。"2026-09-20T10:00" でも「9月20日の午前」でもよい */
  preferred_at?: string;
  /** 相談の種類・予約の種類（フォームの選択肢） */
  purpose?: string;
  /** どのセクションから送られたか（あとで見返すため） */
  source?: string;
}

export type InquiryResult =
  | { ok: true; message: string }
  | {
      ok: false;
      reason: "invalid" | "unavailable" | "too-many" | "failed";
      message: string;
      /** どの入力が悪かったか（画面でその欄に印を付ける） */
      field?: "name" | "email" | "phone" | "message";
    };

/* ═══════════════════════════════════════
   入力の検証
   ═══════════════════════════════════════ */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LIMITS = { name: 100, email: 200, phone: 40, message: 4000, preferred: 120, purpose: 80, source: 60 };

function clean(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.replace(/\r\n/g, "\n").trim().slice(0, max);
}

/** 読み取れる日時なら ISO にする。読み取れなければ null（文言はそのまま payload に残す） */
function toTimestamp(raw: string): string | null {
  if (!raw) return null;
  const t = Date.parse(raw);
  if (Number.isNaN(t)) return null;
  return new Date(t).toISOString();
}

/* ═══════════════════════════════════════
   短時間の連投を止める
   ═══════════════════════════════════════ */

/**
 * 同じ実行環境の中だけで効く簡易な歯止め。
 * サーバーが複数あると素通りするので、下の DB 側の数え上げと2段で使う。
 */
const recent = new Map<string, number>();
const BURST_MS = 20_000;

function burstBlocked(key: string): boolean {
  const now = Date.now();
  for (const [k, at] of recent) if (now - at > BURST_MS) recent.delete(k);
  const last = recent.get(key);
  if (last && now - last < BURST_MS) return true;
  recent.set(key, now);
  return false;
}

/* ═══════════════════════════════════════
   通知（サイトの持ち主へメール）
   ═══════════════════════════════════════ */

const KIND_LABEL: Record<InquiryKind, string> = { contact: "お問い合わせ", booking: "予約の希望" };

interface NotifyBody {
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredText: string;
  purpose: string;
}

/**
 * 持ち主（会社の連絡先メール）に1通送る。返信先は送ってきた人にしておくので、
 * 持ち主はメールの「返信」を押すだけで本人に返せる。
 */
async function notify(siteId: string, kind: InquiryKind, body: NotifyBody): Promise<void> {
  const supabase = getWriteClient();
  if (!supabase) return;

  const site = await supabase.from("sites").select("slug, org_id").eq("id", siteId).maybeSingle();
  if (site.error || !site.data) return;
  const org = await supabase
    .from("orgs")
    .select("name, email")
    .eq("id", site.data.org_id as string)
    .maybeSingle();
  if (org.error || !org.data?.email) return;

  const label = KIND_LABEL[kind];
  const lines = [
    `${org.data.name} のサイトに${label}が届きました。`,
    "",
    `お名前: ${body.name}`,
    `メール: ${body.email}`,
    body.phone ? `電話: ${body.phone}` : null,
    body.purpose ? `種類: ${body.purpose}` : null,
    body.preferredText ? `希望日時: ${body.preferredText}` : null,
    "",
    "ご用件:",
    body.message,
    "",
    "――――――――――",
    `このメールに返信すると、${body.name} さんに直接届きます。`,
    `届いた一覧: ${SITE_BASE_URL}/app/inquiries`,
    `サイト: ${SITE_BASE_URL}/${site.data.slug}`,
  ].filter((l): l is string => l !== null);

  await sendMail({
    to: org.data.email as string,
    subject: `【Mado】${label}が届きました — ${org.data.name}`,
    text: lines.join("\n"),
    replyTo: body.email,
  });
}

/* ═══════════════════════════════════════
   受け取り
   ═══════════════════════════════════════ */

export async function submitInquiry(input: InquiryInput): Promise<InquiryResult> {
  const siteId = clean(input?.siteId, 64);
  const kind: InquiryKind = input?.kind === "booking" ? "booking" : "contact";
  const name = clean(input?.name, LIMITS.name);
  const email = clean(input?.email, LIMITS.email).toLowerCase();
  const phone = clean(input?.phone, LIMITS.phone);
  const message = clean(input?.message, LIMITS.message);
  const preferredRaw = clean(input?.preferred_at, LIMITS.preferred);
  const purpose = clean(input?.purpose, LIMITS.purpose);
  const source = clean(input?.source, LIMITS.source);

  if (!UUID_RE.test(siteId)) {
    return { ok: false, reason: "invalid", message: "送信先が分かりませんでした。ページを読み込み直してください。" };
  }
  if (name.length < 1) {
    return { ok: false, reason: "invalid", field: "name", message: "お名前を入力してください。" };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, reason: "invalid", field: "email", message: "メールアドレスの形をご確認ください。" };
  }
  if (phone && !/^[\d+()\-\s]{6,}$/.test(phone)) {
    return { ok: false, reason: "invalid", field: "phone", message: "電話番号は数字とハイフンで入力してください。" };
  }
  if (message.length < 5) {
    return { ok: false, reason: "invalid", field: "message", message: "ご用件を5文字以上で入力してください。" };
  }

  if (burstBlocked(`${siteId}:${email}`)) {
    return { ok: false, reason: "too-many", message: "送信直後です。少し時間をおいてからもう一度お試しください。" };
  }

  const supabase = getWriteClient();
  if (!supabase) {
    return { ok: false, reason: "unavailable", message: "ただいま送信を受け付けられません。お手数ですがお電話ください。" };
  }

  // 公開中のサイト宛てか（存在しない id へ書けないようにする）
  const site = await supabase.from("sites").select("id").eq("id", siteId).eq("status", "live").maybeSingle();
  if (site.error || !site.data) {
    return { ok: false, reason: "unavailable", message: "ただいま送信を受け付けられません。お手数ですがお電話ください。" };
  }

  // 1分の間に同じサイトへ届いた数を見る（いたずら送信の歯止め）
  const since = new Date(Date.now() - 60_000).toISOString();
  const count = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("site_id", siteId)
    .gte("created_at", since);
  if (!count.error && (count.count ?? 0) >= 8) {
    return { ok: false, reason: "too-many", message: "送信が混み合っています。少し時間をおいてお試しください。" };
  }

  const { error } = await supabase.from("inquiries").insert({
    site_id: siteId,
    kind,
    name,
    email,
    phone,
    message,
    preferred_at: toTimestamp(preferredRaw),
    payload: {
      purpose: purpose || null,
      source: source || null,
      preferred_text: preferredRaw || null,
    },
  });

  if (error) {
    console.error("[inquiries] 保存に失敗", { siteId, kind, error });
    return { ok: false, reason: "failed", message: "送信できませんでした。時間をおいてもう一度お試しください。" };
  }

  await notify(siteId, kind, { name, email, phone, message, preferredText: preferredRaw, purpose });

  return {
    ok: true,
    message:
      kind === "booking"
        ? "ご予約の希望をお預かりしました。折り返しご連絡します。"
        : "お問い合わせをお預かりしました。1営業日以内にご返信します。",
  };
}

/* ═══════════════════════════════════════
   持ち主が見る側（マイページ）
   ═══════════════════════════════════════ */

export type InquiryStatus = "new" | "read" | "done" | "spam";

export interface InquiryRow {
  id: string;
  kind: InquiryKind;
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredAt: string | null;
  preferredText: string | null;
  purpose: string | null;
  status: InquiryStatus;
  createdAt: string;
  siteSlug: string;
}

/** 自分の会社のサイトに届いたものを新しい順に。読めるかどうかは RLS が決める */
export async function listMyInquiries(): Promise<
  { ok: true; rows: InquiryRow[]; unread: number } | { ok: false; reason: "unauthenticated" }
> {
  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, reason: "unauthenticated" };

  const { data, error } = await supabase
    .from("inquiries")
    .select("id, kind, name, email, phone, message, preferred_at, payload, status, created_at, sites(slug)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error("[inquiries] 一覧の取得に失敗", error);
    return { ok: true, rows: [], unread: 0 };
  }

  const rows: InquiryRow[] = (data ?? []).map((r) => {
    const payload = (r.payload ?? {}) as Record<string, unknown>;
    const site = Array.isArray(r.sites) ? r.sites[0] : r.sites;
    return {
      id: r.id as string,
      kind: (r.kind as InquiryKind) === "booking" ? "booking" : "contact",
      name: r.name as string,
      email: r.email as string,
      phone: (r.phone as string) || "",
      message: r.message as string,
      preferredAt: (r.preferred_at as string | null) ?? null,
      preferredText: typeof payload.preferred_text === "string" ? payload.preferred_text : null,
      purpose: typeof payload.purpose === "string" ? payload.purpose : null,
      status: (r.status as InquiryStatus) || "new",
      createdAt: r.created_at as string,
      siteSlug: ((site as { slug?: string } | null)?.slug as string) || "",
    };
  });

  return { ok: true, rows, unread: rows.filter((r) => r.status === "new").length };
}

/** マイページの上に出す「未対応の数」だけ */
export async function countNewInquiries(): Promise<number> {
  const supabase = await createServerSupabase();
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");
  return error ? 0 : count ?? 0;
}

/**
 * 対応済み・未対応の印を付ける。
 * 書き込みの権限は RLS に無いので、まず Cookie のセッションで「自分のもの」と確かめてから
 * service_role で書く（site-editor と同じ流儀）。
 */
export async function setInquiryStatus(
  id: string,
  status: InquiryStatus,
): Promise<{ ok: true } | { ok: false; reason: "unauthenticated" | "forbidden" | "failed" }> {
  if (!UUID_RE.test(id)) return { ok: false, reason: "failed" };

  const session = await createServerSupabase();
  if (!session) return { ok: false, reason: "unauthenticated" };
  const own = await session.from("inquiries").select("id").eq("id", id).maybeSingle();
  if (own.error || !own.data) return { ok: false, reason: "forbidden" };

  const supabase = getWriteClient();
  if (!supabase) return { ok: false, reason: "failed" };
  const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
  if (error) {
    console.error("[inquiries] 状態の更新に失敗", { id, status, error });
    return { ok: false, reason: "failed" };
  }

  revalidatePath("/app/inquiries");
  revalidatePath("/app");
  return { ok: true };
}
