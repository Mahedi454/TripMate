"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/Input";

export type PasswordInputProps = Omit<InputProps, "type" | "leadingIcon">;

/** Password field with a show/hide toggle. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ label = "Password", autoComplete = "current-password", ...rest }, ref) {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <Input
        ref={ref}
        type={isVisible ? "text" : "password"}
        label={label}
        autoComplete={autoComplete}
        leadingIcon={<Lock className="size-[19px]" strokeWidth={2} />}
        endAdornment={
          <button
            type="button"
            onClick={() => setIsVisible((visible) => !visible)}
            aria-label={isVisible ? "Hide password" : "Show password"}
            aria-pressed={isVisible}
            className="flex size-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            {isVisible ? (
              <EyeOff className="size-[19px]" strokeWidth={2} />
            ) : (
              <Eye className="size-[19px]" strokeWidth={2} />
            )}
          </button>
        }
        {...rest}
      />
    );
  },
);