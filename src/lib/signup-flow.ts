/** v2 puts industry before colour. Old drafts store only a numeric step. */
export const SIGNUP_FLOW_VERSION = 2;
export const SIGNUP_STEPS = ["アドレス", "ログイン", "業種", "色", "見せ方", "プラン", "会社情報", "確認"];

export function restoreSignupStep(step: unknown, version: unknown, family: unknown): number {
  let result = typeof step === "number" && Number.isInteger(step) ? Math.min(7, Math.max(0, step)) : 0;
  if (version !== SIGNUP_FLOW_VERSION) {
    if (result === 2) result = 3;
    else if (result === 3) result = 2;
  }
  // A legacy colour-first draft may not have chosen an industry yet.
  if (result >= 3 && !family) result = 2;
  return result;
}
