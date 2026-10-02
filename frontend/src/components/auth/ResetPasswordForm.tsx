"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { MIN_PASSWORD_LENGTH } from "@/components/auth/PasswordStrength";
import { SUPABASE_MISSING_CONFIG_MESSAGE } from "@/lib/supabase/config";

/**
 * Reached from the link in the password reset email. Supabase has already
 * exchanged the token for a session by the time this renders, so the only job
 * left is setting the new password.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!cancelled) {
          setHasRecoverySession(Boolean(session));
        }
      } catch {
        if (!cancelled) {
          setHasRecoverySession(false);
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    }

    void checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setFormError(null);
    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setFormError(error.message);
        return;
      }

      setIsDone(true);
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : SUPABASE_MISSING_CONFIG_MESSAGE,
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (isChecking) {
    return (
      <p className="text-center text-sm text-ink-soft" role="status" aria-live="polite">
        Checking your reset link...
      </p>
    );
  }

  if (isDone) {
    return (
      <div className="text-center">
        <AuthAlert
          variant="success"
          title="Password updated."
          message="You can now sign in with your new password."
        />
        <Link
          href="/login"
          className="-my-1 mt-4 inline-flex min-h-10 items-center font-semibold text-brand-600 hover:underline"
        >
          Back to login
        </Link>
      </div>
    );
  }

  if (!hasRecoverySession) {
    return (
      <div className="text-center">
        <AuthAlert
          title="This reset link is no longer valid"
          message="Reset links expire after a short time and can only be used once. Request a new one to continue."
        />
        <Link
          href="/forgot-password"
          className="-my-1 mt-4 inline-flex min-h-10 items-center font-semibold text-brand-600 hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 sm:gap-5">
      {formError ? (
        <AuthAlert title={formError} message="Please check the details and try again." />
      ) : null}

      <PasswordInput
        label="New password"
        name="password"
        autoComplete="new-password"
        placeholder="Choose a strong password"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          setFormError(null);
        }}
        disabled={isLoading}
        leadingIcon={<KeyRound className="size-[18px]" strokeWidth={1.8} />}
      />

      <PasswordInput
        label="Confirm new password"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="Re-enter your new password"
        value={confirmPassword}
        onChange={(event) => {
          setConfirmPassword(event.target.value);
          setFormError(null);
        }}
        disabled={isLoading}
        leadingIcon={<KeyRound className="size-[18px]" strokeWidth={1.8} />}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="mt-1 inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
