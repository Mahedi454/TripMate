"use client";

import { Check } from "lucide-react";

export type PasswordStrengthLevel = "weak" | "fair" | "good" | "strong";

export interface PasswordStrength {
  score: PasswordStrengthLevel;
  /** 1 to 4 filled segments. */
  filled: number;
}

const LEVEL_CONFIG: Record<PasswordStrengthLevel, { label: string; bar: string; text: string }> = {
  weak: { label: "Weak", bar: "bg-danger", text: "text-danger" },
  fair: { label: "Fair", bar: "bg-amber-500", text: "text-amber-600" },
  good: { label: "Good", bar: "bg-brand-500", text: "text-brand-700" },
  strong: { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-600" },
};

/** Purely visual heuristic. No validation library involved. */
export function scorePassword(password: string): PasswordStrength {
  if (password.length === 0) {
    return { score: "weak", filled: 0 };
  }

  let points = 0;
  if (password.length >= 6) points += 1;
  if (password.length >= 10) points += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points += 1;
  if (/\d/.test(password)) points += 1;
  if (/[^A-Za-z0-9]/.test(password)) points += 1;

  const filled = Math.min(Math.max(Math.ceil(points / 1.25), 1), 4);

  const level: PasswordStrengthLevel =
    filled >= 4 ? "strong" : filled === 3 ? "good" : filled === 2 ? "fair" : "weak";

  return { score: level, filled };
}

interface PasswordStrengthMeterProps {
  password: string;
}

export const MIN_PASSWORD_LENGTH = 6;

/** Four segment strength bar plus a minimum length check. */
export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { score, filled } = scorePassword(password);
  const config = LEVEL_CONFIG[score];
  const isTooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;

  return (
    <div className="mt-2.5">
      <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium">
        <span className="text-ink-soft">Password strength</span>
        <span
          aria-live="polite"
          className={`flex items-center gap-1 font-semibold transition-colors duration-300 ${
            password ? config.text : "text-slate-400"
          }`}
        >
          {password ? <span className="size-1.5 rounded-full bg-current" /> : null}
          {password ? config.label : "—"}
        </span>
      </div>

      <div className="grid h-1.5 grid-cols-4 gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={`h-full rounded-full transition-colors duration-300 ${
              password && segment <= filled ? config.bar : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      {isTooShort ? (
        <p className="mt-1.5 text-[11px] font-medium text-amber-600">
          Use at least {MIN_PASSWORD_LENGTH} characters.
        </p>
      ) : null}

      <span className="sr-only">
        {password
          ? `Password strength: ${config.label}.`
          : `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`}
      </span>
    </div>
  );
}

interface PasswordMatchHintProps {
  password: string;
  confirmPassword: string;
}

/** Live confirmation under the confirm password field. */
export function PasswordMatchHint({ password, confirmPassword }: PasswordMatchHintProps) {
  const hasConfirm = confirmPassword.length > 0;
  const matches = hasConfirm && password === confirmPassword;

  return (
    <p
      aria-live="polite"
      className={`mt-1 flex min-h-[18px] items-center gap-1 text-[11px] font-medium ${
        matches ? "text-emerald-600" : "text-transparent"
      }`}
    >
      {matches ? (
        <>
          <Check aria-hidden="true" className="size-3.5" strokeWidth={2.4} />
          Passwords match
        </>
      ) : (
        <span aria-hidden="true">.</span>
      )}
    </p>
  );
}
