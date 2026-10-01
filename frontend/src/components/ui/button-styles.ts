/**
 * Button styling recipe, kept out of the client boundary so that server
 * components can style <Link> elements with it too.
 */

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700 hover:shadow-brand-700/25 active:bg-brand-700",
  secondary:
    "bg-white text-ink ring-1 ring-line hover:bg-canvas hover:ring-slate-300 active:bg-slate-100",
  ghost: "bg-transparent text-ink-soft hover:bg-slate-100 hover:text-ink",
};

export const BUTTON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-10 px-3.5 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-[52px] w-full px-5 text-[15px]",
};

export interface ButtonClassesOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
}: ButtonClassesOptions = {}): string {
  return [
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium",
    "transition-all duration-200",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
    "disabled:cursor-not-allowed disabled:opacity-70",
    size === "lg" ? "" : fullWidth ? "w-full" : "",
    BUTTON_SIZE_CLASSES[size],
    BUTTON_VARIANT_CLASSES[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}