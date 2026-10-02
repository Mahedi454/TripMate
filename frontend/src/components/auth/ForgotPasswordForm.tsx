"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { buttonClasses } from "@/components/ui/button-styles";
import { Input } from "@/components/ui/Input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { authErrorMessage, callbackUrl } from "@/lib/supabase/errors";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface ForgotPasswordSuccessProps {
  email: string;
  onTryAnotherEmail: () => void;
}

/** Confirmation screen shown after the reset email is requested. */
function ForgotPasswordSuccess({ email, onTryAnotherEmail }: ForgotPasswordSuccessProps) {
  return (
    <div className="animate-slide-up text-center" role="status" aria-live="polite">
      <div className="relative mx-auto mb-6 inline-flex sm:mb-7">
        <span
          aria-hidden="true"
          className="flex size-20 items-center justify-center rounded-full bg-brand-50 ring-1 ring-brand-100 sm:size-[88px]"
        >
          <Mail className="size-9 text-brand-600 strokeWidth={1.4} sm:size-10" />
        </span>
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 -right-0.5 flex size-8 items-center justify-center rounded-full bg-white ring-1 ring-line"
        >
          <CheckCircle className="size-8 text-success" strokeWidth={1.6} />
        </span>
      </div>

      <h1 className="text-3xl font-bold leading-tight tracking-tight text-night sm:text-[34px]">
        Check your inbox
      </h1>
      <p className="mx-auto mb-2 mt-2 max-w-[340px] font-body text-sm leading-relaxed text-ink-soft sm:text-base">
        If an account exists for that email, we&apos;ve sent you a password reset link.
      </p>

      <p className="inline-flex max-w-full items-center rounded-xl border border-line bg-canvas px-4 py-3 text-sm font-medium text-ink">
        <span className="truncate">{email}</span>
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:mt-7">
        <Link
          href="/login"
          className={buttonClasses({ variant: "primary", size: "lg" })}
        >
          <ArrowLeft className="size-4" strokeWidth={2} aria-hidden="true" />
          Back to login
        </Link>

        <button
          type="button"
          onClick={onTryAnotherEmail}
          className="-my-1 inline-flex min-h-10 items-center rounded-lg text-[13px] font-medium text-ink-soft transition hover:text-brand-600"
        >
          Didn&apos;t receive it? Try another email.
        </button>
      </div>
    </div>
  );
}

/** Sends the password reset email through Supabase Auth. */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = email.trim();

    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(undefined);
    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: callbackUrl("/reset-password"),
      });

      if (resetError) {
        setError(authErrorMessage(resetError, "We could not send that email. Please try again."));
        return;
      }

      // Always report the same thing, whether or not the address is registered.
      setSubmittedEmail(trimmed);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "We could not reach the authentication service.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (submittedEmail) {
    return (
      <ForgotPasswordSuccess
        email={submittedEmail}
        onTryAnotherEmail={() => {
          setSubmittedEmail(null);
          setEmail("");
        }}
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-center">
        <span
          aria-hidden="true"
          className="flex size-14 items-center justify-center rounded-full bg-brand-50 ring-1 ring-brand-100 sm:size-16"
        >
          <Mail className="size-7 text-brand-600" strokeWidth={1.5} />
        </span>
      </div>

      <header className="mb-7 text-center sm:mb-8">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-night sm:text-[34px]">
          Forgot your password?
        </h1>
        <p className="font-body text-sm leading-relaxed text-ink-soft sm:text-base">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 sm:gap-5">
        <Input
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          leadingIcon={<Mail className="size-[18px]" strokeWidth={1.75} />}
          value={email}
          error={error}
          onChange={(event) => {
            setEmail(event.target.value);
            setError(undefined);
          }}
          disabled={isLoading}
        />

        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          loadingText="Sending..."
          leadingIcon={isLoading ? undefined : <Send className="size-4" strokeWidth={1.9} />}
        >
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center sm:mt-7">
        <Link
          href="/login"
          className="-my-1 inline-flex min-h-10 items-center gap-1.5 rounded-lg text-[13px] font-medium text-ink-soft transition hover:text-brand-600"
        >
          <ArrowLeft className="size-4" strokeWidth={2} />
          Back to login
        </Link>
      </p>
    </div>
  );
}