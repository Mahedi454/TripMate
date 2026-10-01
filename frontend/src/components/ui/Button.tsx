"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import {
  buttonClasses,
  type ButtonSize,
  type ButtonVariant,
} from "@/components/ui/button-styles";

export type { ButtonSize, ButtonVariant };
export { buttonClasses };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, disables the button and swaps the label for loadingText. */
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    isLoading = false,
    loadingText,
    fullWidth = false,
    leadingIcon,
    trailingIcon,
    className = "",
    children,
    disabled,
    type = "button",
    ...rest
  },
  ref,
) {
  const isDisabled = disabled === true || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...rest}
    >
      {isLoading ? (
        <>
          <Loader2 aria-hidden="true" className="size-[18px] animate-spin" strokeWidth={2} />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        <>
          {leadingIcon}
          <span>{children}</span>
          {trailingIcon}
        </>
      )}
    </button>
  );
});