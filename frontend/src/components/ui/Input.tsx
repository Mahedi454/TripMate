"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  /** Field level error. Sets aria-invalid and renders below the field. */
  error?: string;
  hint?: string;
  /** Icon rendered inside the field, before the text. */
  leadingIcon?: ReactNode;
  /** Slot inside the field, on the right (used by PasswordInput). */
  endAdornment?: ReactNode;
  /** Rendered on the right of the label row, e.g. a "Forgot password?" link. */
  labelAction?: ReactNode;
  /** Overrides the label typography, for pages that use a smaller label scale. */
  labelClassName?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    hint,
    leadingIcon,
    endAdornment,
    labelAction,
    labelClassName = "text-sm font-medium text-ink",
    className = "",
    containerClassName = "",
    id,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ");

  return (
    <div className={`flex flex-col gap-2 ${containerClassName}`}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className={labelClassName}>
          {label}
        </label>
        {labelAction}
      </div>

      <div className="group relative">
        {leadingIcon ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors duration-150 group-focus-within:text-brand-600 sm:pl-3.5"
          >
            {leadingIcon}
          </span>
        ) : null}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={[
            "h-[52px] w-full rounded-xl border bg-canvas text-sm font-normal text-ink",
            "placeholder:text-slate-400",
            "transition-all duration-150",
            "focus:bg-white focus:outline-none focus:ring-4",
            leadingIcon ? "pl-10 sm:pl-11" : "pl-4",
            endAdornment ? "pr-11 sm:pr-12" : "pr-4",
            error
              ? "border-danger hover:border-danger focus:border-danger focus:ring-danger/10"
              : "border-line hover:border-slate-300 focus:border-brand-600 focus:ring-brand-600/10",
            "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        />

        {endAdornment ? (
          <div className="absolute inset-y-0 right-0.5 flex items-center sm:right-1.5">{endAdornment}</div>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="text-[13px] font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[13px] text-ink-soft">
          {hint}
        </p>
      ) : null}
    </div>
  );
});