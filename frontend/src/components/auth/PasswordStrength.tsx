"use client";

import { Check } from "lucide-react";

export type PasswordStrengthLevel = "weak" | "fair" | "good" | "strong";

export interface PasswordStrength {
  score: PasswordStrengthLevel;
  /** 1 to 4 filled segments. */
  filled: number;
}

const LEVEL_CONFIG: Record<
  PasswordStrengthLevel,
  { label: string; bar: string; text: string }
> = {
  weak: { label: "Weak", bar: "bg-danger", text: "text-danger" },
  fair: { label: "Fair", bar: "bg-amber-500", text: "text-amber-600" },
  good: { label: "Good", bar: "bg-brand-600", text: "text-brand-700" },
  strong: { label: "Strong", bar: "bg-success", text: "text-success" },
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

/** Four segment strength bar plus the minimum length check. */
export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { score, filled } = scorePassword(password);
  const config = LEVEL_CONFIG[score];
  const hasMinimumLength = password.length >= 6;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-soft">Password strength</span>
        <span
          aria-live="polite"
          className={`text-xs font-semibold transition-colors duration-300 ${
            password ? config.text : "text-slate-400"
          }`}
        >
          {password ? config.label : "—"}
        </span>
      </div>

      <div className="flex gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              password && segment <= filled ? config.bar : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <p className="flex items-center gap-1.5 text-[13px]">
        <span
          aria-hidden="true"
          className={`flex size-4 items-center justify-center rounded-full transition-colors duration-300 ${
            hasMinimumLength ? "bg-success/10 text-success" : "bg-slate-100 text-slate-400"
          }`}
        >
          <Check className="size-2.5" strokeWidth={3} />
        </span>
        <span className={hasMinimumLength ? "text-ink-soft" : "text-slate-400"}>
          At least 6 characters
        </span>
        <span className="sr-only">
          {hasMinimumLength ? "Requirement met" : "Requirement not met"}
        </span>
      </p>
    </div>
  );
}