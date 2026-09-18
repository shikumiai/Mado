"use client";

/**
 * 問い合わせ・予約フォームの中身。contact と booking の変種が共通で使う。
 *
 * 公開中の顧客サイトの中では、本当にサーバーへ送って inquiries に保存する。
 * 部品カタログ・デモ・エディタのプレビューでは送信先が無いので、
 * 送らずに「デモのため送信されません」と出す（お客に嘘の完了画面を見せない）。
 *
 * 見た目の色はすべて var(--tpl-*)。入力欄の土台 CSS は shared.tsx の BASE_CSS にある。
 */

import { useActionState } from "react";
import { Check, Send } from "lucide-react";
import { submitInquiry, type InquiryKind } from "@/lib/inquiries";
import { useSiteLink } from "./shared";

type FormState = { ok: boolean; message: string } | null;

export interface InquiryFormProps {
  kind: InquiryKind;
  /** 相談・予約の種類の選択肢。空なら欄そのものを出さない */
  purposes?: string[];
  /** 希望日時の欄を出すか（予約向け） */
  withPreferred?: boolean;
  /** 送信ボタンの文字 */
  submitLabel?: string;
  /** ご用件の欄の見出しと、書き方の例 */
  messageLabel?: string;
  messagePlaceholder?: string;
  /** 送信ボタンの下に出す注意書き */
  note?: string;
  /** どのセクションから送られたか（あとで見返すため） */
  source?: string;
  /** 送信ボタンを横いっぱいに伸ばす */
  wide?: boolean;
}

export function InquiryForm({
  kind,
  purposes = [],
  withPreferred = false,
  submitLabel,
  messageLabel = "ご用件",
  messagePlaceholder,
  note,
  source,
  wide = false,
}: InquiryFormProps) {
  const site = useSiteLink();
  const live = Boolean(site?.siteId);

  const [state, action, pending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      if (!site?.siteId) {
        return { ok: false, message: "デモのため送信されません。公開後のサイトでは、この内容がそのまま届きます。" };
      }
      const res = await submitInquiry({
        siteId: site.siteId,
        kind,
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        message: String(formData.get("message") ?? ""),
        preferred_at: String(formData.get("preferred_at") ?? ""),
        purpose: String(formData.get("purpose") ?? ""),
        source,
      });
      return { ok: res.ok, message: res.message };
    },
    null,
  );

  const label = submitLabel ?? (kind === "booking" ? "この内容で予約を申し込む" : "この内容で送る");

  return (
    <form action={action} noValidate>
      <div className="ms-form-row">
        <label className="ms-field">
          <span>
            お名前<em className="ms-req">必須</em>
          </span>
          <input className="ms-input" type="text" name="name" required autoComplete="name" placeholder="山田 太郎" />
        </label>
        <label className="ms-field">
          <span>
            メールアドレス<em className="ms-req">必須</em>
          </span>
          <input className="ms-input" type="email" name="email" required autoComplete="email" placeholder="you@example.com" />
        </label>
      </div>

      <div className="ms-form-row">
        <label className="ms-field">
          <span>電話番号</span>
          <input className="ms-input" type="tel" name="phone" autoComplete="tel" placeholder="090-1234-5678" />
        </label>
        {withPreferred ? (
          <label className="ms-field">
            <span>ご希望の日時</span>
            <input className="ms-input" type="datetime-local" name="preferred_at" />
          </label>
        ) : purposes.length > 0 ? (
          <label className="ms-field">
            <span>ご相談の種類</span>
            <select className="ms-select" name="purpose" defaultValue={purposes[0]}>
              {purposes.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>
        ) : (
          <span />
        )}
      </div>

      {withPreferred && purposes.length > 0 && (
        <label className="ms-field">
          <span>ご予約の種類</span>
          <select className="ms-select" name="purpose" defaultValue={purposes[0]}>
            {purposes.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>
      )}

      <label className="ms-field">
        <span>
          {messageLabel}<em className="ms-req">必須</em>
        </span>
        <textarea
          className="ms-textarea"
          name="message"
          required
          placeholder={
            messagePlaceholder ??
            (kind === "booking"
              ? "ご希望の日にちが複数あればお書きください。人数やご事情もあわせて伺えると助かります。"
              : "お困りのこと、聞いてみたいことを、そのままお書きください。")
          }
        />
      </label>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginTop: 6 }}>
        <button
          type="submit"
          className="ms-btn ms-btn-fill"
          disabled={pending}
          style={wide ? { width: "100%", justifyContent: "center" } : undefined}
        >
          {pending ? "送信中…" : label}
          {!pending && <Send size={15} strokeWidth={2} />}
        </button>
        {!live && <span className="ms-demo">これは見本です。送信されません</span>}
      </div>

      {note && <p className="ms-note" style={{ marginTop: 12 }}>{note}</p>}

      {state && (
        <p className={`ms-form-msg${state.ok ? " ms-form-msg-ok" : ""}`} role="status">
          {state.ok && <Check size={14} strokeWidth={3} style={{ marginRight: 6, verticalAlign: -2 }} />}
          {state.message}
        </p>
      )}
    </form>
  );
}
