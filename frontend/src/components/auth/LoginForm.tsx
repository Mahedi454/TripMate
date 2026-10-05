"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SocialButton } from "@/components/auth/SocialButton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { sendEmailVerification, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { authErrorMessage, continueUrl } from "@/lib/firebase/errors";
import { completeSignIn, safeNextPath } from "@/lib/firebase/session";
import { useRedirectIfSignedIn } from "@/lib/firebase/useAuthUser";

interface FieldErrors {
  email?: string;
  password?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const GENERIC_ERROR = "Incorrect email or password";

/** Signs in with Firebase Auth (email and password, or Google). */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  /** Shown when the account exists but the email has not been verified yet. */
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // `next` is set when a protected page sent the visitor here, so the deep link survives.
  const destination = safeNextPath(searchParams.get("next"));

  useRedirectIfSignedIn(destination, setFormError);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors: FieldErrors = {};
    if (!email.trim()) {
      errors.email = "Please enter your email address.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!password) {
      errors.password = "Please enter your password.";
    }

    setFieldErrors(errors);
    setFormError(null);
    setNotice(null);

    if (Object.keys(errors).length > 0) {
      setFormError("Something went wrong");
      return;
    }

    setIsLoading(true);

    try {
      const auth = getFirebaseAuth();
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);

      if (!user.emailVerified) {
        // Send a fresh link (the old one may have expired), then sign back out:
        // unverified accounts must not get in.
        await sendEmailVerification(user, { url: continueUrl("/login") }).catch(() => undefined);
        await signOut(auth);
        setNotice(
          `Please verify your email first. We've sent a new verification link to ${user.email ?? email.trim()}.`,
        );
        return;
      }

      await completeSignIn(user);
      router.replace(destination);
    } catch (error) {
      setFormError(authErrorMessage(error, GENERIC_ERROR));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 sm:gap-5">
      {formError ? (
        <AuthAlert title={formError} message="Please check your information and try again." />
      ) : null}

      {notice ? <AuthAlert variant="info" title="Check your inbox" message={notice} /> : null}

      <Input
        label="Email address"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@example.com"
        leadingIcon={<Mail className="size-[19px]" strokeWidth={2} />}
        value={email}
        error={fieldErrors.email}
        onChange={(event) => {
          setEmail(event.target.value);
          setFieldErrors((previous) => ({ ...previous, email: undefined }));
          setFormError(null);
        }}
        disabled={isLoading}
      />

      <PasswordInput
        label="Password"
        name="password"
        placeholder="Enter your password"
        value={password}
        error={fieldErrors.password}
        onChange={(event) => {
          setPassword(event.target.value);
          setFieldErrors((previous) => ({ ...previous, password: undefined }));
          setFormError(null);
        }}
        disabled={isLoading}
        labelAction={
          <Link
            href="/forgot-password"
            className="-my-2.5 inline-flex min-h-10 items-center rounded px-1 text-[13px] font-semibold text-brand-600 transition-colors hover:text-brand-700 hover:underline sm:text-xs"
          >
            Forgot password?
          </Link>
        }
      />

      <Button
        type="submit"
        size="lg"
        className="mt-1 shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/25 sm:mt-2"
        isLoading={isLoading}
        loadingText="Signing in..."
      >
        Sign In
      </Button>

      <AuthDivider />

      <SocialButton
        redirectTo={destination}
        onAuthError={(message) => {
          setNotice(null);
          setFormError(message);
        }}
      />

      <p className="mt-1 text-center text-sm text-ink-soft sm:mt-2">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="-my-1 ml-1 inline-flex min-h-10 items-center rounded font-semibold text-brand-600 transition-colors hover:text-brand-700 hover:underline"
        >
          Create account
        </Link>
      </p>
    </form>
  );
}