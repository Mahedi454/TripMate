"use client";

import { useRouter } from "next/navigation";
import { forwardRef, useState, type ButtonHTMLAttributes, type MouseEvent } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Button } from "@/components/ui/Button";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { authErrorMessage, CANCELLED_POPUP_CODES, firebaseErrorCode } from "@/lib/firebase/errors";
import { completeSignIn } from "@/lib/firebase/session";

export interface SocialButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label?: string;
  /** Where to go once signed in. */
  redirectTo?: string;
  /** Receives a message to show when the Google sign-in fails. */
  onAuthError?: (message: string) => void;
  /** Supplying this replaces the built in Google handler. */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

/** Google "G" mark, drawn inline so the project needs no brand asset. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px] shrink-0">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.53 5.53 0 0 1-2.4 3.63v3.02h3.88c2.27-2.09 3.58-5.17 3.58-8.84Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.88-3.02c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.95H1.29v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.62l3.98 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

/** Outlined "Continue with Google" button. */
export const SocialButton = forwardRef<HTMLButtonElement, SocialButtonProps>(
  function SocialButton(
    { label = "Continue with Google", redirectTo = "/dashboard", onAuthError, onClick, ...rest },
    ref,
  ) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function handleClick(event: MouseEvent<HTMLButtonElement>) {
      if (onClick) {
        onClick(event);
        return;
      }

      event.preventDefault();
      setIsLoading(true);

      try {
        const provider = new GoogleAuthProvider();
        // Always show the account chooser, so people can switch Google accounts.
        provider.setCustomParameters({ prompt: "select_account" });
        const { user } = await signInWithPopup(getFirebaseAuth(), provider);
        await completeSignIn(user);
        router.replace(redirectTo);
      } catch (error) {
        setIsLoading(false);
        const code = firebaseErrorCode(error);
        if (code && CANCELLED_POPUP_CODES.has(code)) {
          return;
        }
        onAuthError?.(authErrorMessage(error, "Google sign-in failed. Please try again."));
      }
    }

    return (
      <Button
        ref={ref}
        type="button"
        variant="secondary"
        size="lg"
        className="gap-3 text-sm shadow-sm active:scale-[0.985]"
        leadingIcon={<GoogleMark />}
        isLoading={isLoading}
        loadingText="Signing in with Google..."
        onClick={handleClick}
        {...rest}
      >
        {label}
      </Button>
    );
  },
);