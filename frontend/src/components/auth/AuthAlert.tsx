import { AlertCircle, CheckCircle, Info } from "lucide-react";
import type { ReactNode } from "react";

export type AuthAlertVariant = "error" | "success" | "info";

export interface AuthAlertProps {
  variant?: AuthAlertVariant;
  title?: string;
  message: string;
  className?: string;
  children?: ReactNode;
}

const VARIANT_CLASSES: Record<AuthAlertVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-green-200 bg-green-50 text-green-800",
  info: "border-brand-200 bg-brand-50 text-brand-700",
};

const VARIANT_ICON_CLASSES: Record<AuthAlertVariant, string> = {
  error: "text-danger",
  success: "text-success",
  info: "text-brand-600",
};

const VARIANT_ICON = {
  error: AlertCircle,
  success: CheckCircle,
  info: Info,
} satisfies Record<AuthAlertVariant, typeof AlertCircle>;

/**
 * Form level message block.
 * Errors and info are announced assertively, success politely.
 */
export function AuthAlert({
  variant = "error",
  title,
  message,
  className = "",
  children,
}: AuthAlertProps) {
  const Icon = VARIANT_ICON[variant];

  return (
    <div
      role={variant === "success" ? "status" : "alert"}
      aria-live={variant === "success" ? "polite" : "assertive"}
      className={[
        "animate-fade-in flex items-start gap-3 rounded-xl border px-4 py-3.5",
        VARIANT_CLASSES[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon
        aria-hidden="true"
        className={`mt-px size-[18px] shrink-0 ${VARIANT_ICON_CLASSES[variant]}`}
        strokeWidth={1.9}
      />

      <div className="min-w-0 flex-1 text-[13px] leading-relaxed">
        {title ? <p className="font-semibold">{title}</p> : null}
        <p className={title ? "mt-0.5 opacity-90" : undefined}>{message}</p>
        {children ? <div className="mt-2.5">{children}</div> : null}
      </div>
    </div>
  );
}