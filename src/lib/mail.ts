/**
 * メール送信（送信元は info@shikumiai.com）。
 *
 * 使うのは SMTP（エックスサーバーのメール箱）。設定は環境変数で受け取る:
 *   SMTP_HOST … 例 sv17051.xserver.jp
 *   SMTP_PORT … 465（SSL）か 587
 *   SMTP_USER … info@shikumiai.com
 *   SMTP_PASS … メール箱のパスワード
 *   MAIL_FROM … 例 "Mado <info@shikumiai.com>"（無ければ SMTP_USER から作る）
 *
 * 未設定なら送らずに記録だけ残す。メールが落ちても本体の処理（保存）は成功させる。
 */

import nodemailer from "nodemailer";

export interface MailInput {
  to: string;
  subject: string;
  text: string;
  /** 返信先。問い合わせの通知では、送ってきた人のアドレスを入れる */
  replyTo?: string;
}

/** 送信できたら true。設定が無い・失敗したときは false（例外は投げない） */
export async function sendMail(input: MailInput): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM || (user ? `Mado <${user}>` : "");

  if (!host || !user || !pass || !from) {
    console.warn("[mail] SMTP が未設定のため送信をとばしました", { to: input.to, subject: input.subject });
    return false;
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  try {
    await transport.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      replyTo: input.replyTo,
    });
    return true;
  } catch (error) {
    console.error("[mail] 送信に失敗", { to: input.to, subject: input.subject, error });
    return false;
  }
}
