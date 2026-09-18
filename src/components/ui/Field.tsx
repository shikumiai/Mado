"use client";

/**
 * 入力欄。ラベル + 入力 + 補足 + その場のエラーをひとまとめにする。
 *
 * エラーは入力の真下に理由付きで出す（別画面へ飛ばさない）。
 * ラベルと入力・補足・エラーは id で結び、読み上げにも通じるようにする。
 */

import { forwardRef, useId } from "react";

type BaseProps = {
  label: string;
  helper?: string;
  /** エラー文。あると入力が赤くなり、下に理由が出る */
  error?: string;
  required?: boolean;
  /** 複数行にする */
  multiline?: boolean;
  className?: string;
};

export type FieldProps = BaseProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "className">;

const controlBase =
  "w-full rounded-md bg-surface border px-3.5 text-sm text-ink placeholder:text-ink3 " +
  "transition-[border-color,box-shadow] duration-200 ease-brand outline-none " +
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-bg " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export const Field = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FieldProps
>(function Field(
  {
    label,
    helper,
    error,
    required,
    multiline = false,
    className = "",
    id,
    ...control
  },
  ref
) {
  const reactId = useId();
  const fieldId = id ?? reactId;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;
  const describedBy =
    [error ? errorId : null, helper ? helperId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const borderTone = error ? "border-danger" : "border-line focus-visible:border-brand/60";

  return (
    <div className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}>
      <label htmlFor={fieldId} className="text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </label>

      {multiline ? (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          required={required}
          className={[controlBase, borderTone, "py-2.5 min-h-24 resize-y"].join(" ")}
          {...(control as unknown as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          required={required}
          className={[controlBase, borderTone, "h-10"].join(" ")}
          {...(control as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {error ? (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : (
        helper && (
          <p id={helperId} className="text-xs text-ink3">
            {helper}
          </p>
        )
      )}
    </div>
  );
});
