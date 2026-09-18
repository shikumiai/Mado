"use client";
import { useActionState, type ReactNode } from "react";
import type { ActionState } from "@/lib/pilot";
export default function ActionForm({
  action,
  children,
  label,
}: {
  action: (state: ActionState, form: FormData) => Promise<ActionState>;
  children: ReactNode;
  label: string;
}) {
  const [state, submit, pending] = useActionState(action, {});
  return (
    <form action={submit} className="m-form">
      <fieldset disabled={pending}>
        {children}
        <button className="m-button" type="submit">
          {pending ? "保存しています…" : label}
        </button>
      </fieldset>
      {state.error && (
        <p className="m-error" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="m-notice" role="status">
          {state.success}
        </p>
      )}
    </form>
  );
}
