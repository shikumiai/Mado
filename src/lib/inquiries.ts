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
 * 通知（メール等）は今は行わない。将来ここの notify() に足せば、
 * フォーム側を触らずに通知だけを増やせる。
 */

import { getWriteClient } from "./supabase/server";

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
   通知（今は何もしない）
   ═══════════════════════════════════════ */

/** 将来ここにメール送信などを足す。今は届いたことだけ記録しておく */
async function notify(siteId: string, kind: InquiryKind): Promise<void> {
  console.info("[inquiries] 受信", { siteId, kind });
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

  await notify(siteId, kind);

  return {
    ok: true,
    message:
      kind === "booking"
        ? "ご予約の希望をお預かりしました。折り返しご連絡します。"
        : "お問い合わせをお預かりしました。1営業日以内にご返信します。",
  };
}
