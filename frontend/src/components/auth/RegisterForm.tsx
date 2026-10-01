"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Mail, User } from "lucide-react";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrength";
import { SocialButton } from "@/components/auth/SocialButton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;

/** UI only. Nothing is submitted, stored or hashed. */
export function RegisterForm() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  function updateField(field: keyof typeof values, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
    setFormError(null);
    setIsSuccess(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors: FieldErrors = {};

    if (values.name.trim().length < 2) {
      errors.name = "Please enter your full name.";
    }
    if (!EMAIL_PATTERN.test(values.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (values.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = "Password must be at least 6 characters.";
    }
    if (values.confirmPassword !== values.password) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    setFormError(null);

    if (Object.keys(errors).length > 0) {
      setFormError("Something went wrong");
      return;
    }

    // Mock request, so the loading state is visible while designing.
    setIsLoading(true);
    timerRef.current = setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1600);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 sm:gap-5">
      {formError ? (
        <AuthAlert title={formError} message="Please check the highlighted fields and try again." />
      ) : null}

      {isSuccess ? (
        <AuthAlert
          variant="success"
          title="Account created successfully."
          message="This is a static UI state, so no account was actually created."
        />
      ) : null}

      <Input
        label="Full name"
        name="name"
        autoComplete="name"
        placeholder="Your full name"
        leadingIcon={<User className="size-[18px]" strokeWidth={1.75} />}
        value={values.name}
        error={fieldErrors.name}
        onChange={(event) => updateField("name", event.target.value)}
        disabled={isLoading}
      />

      <Input
        label="Email address"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@example.com"
        leadingIcon={<Mail className="size-[18px]" strokeWidth={1.75} />}
        value={values.email}
        error={fieldErrors.email}
        onChange={(event) => updateField("email", event.target.value)}
        disabled={isLoading}
      />

      <div className="flex flex-col gap-4">
        <PasswordInput
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="Create a password"
          value={values.password}
          error={fieldErrors.password}
          onChange={(event) => updateField("password", event.target.value)}
          disabled={isLoading}
        />

        <PasswordStrengthMeter password={values.password} />
      </div>

      <PasswordInput
        label="Confirm password"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="Confirm your password"
        value={values.confirmPassword}
        error={fieldErrors.confirmPassword}
        onChange={(event) => updateField("confirmPassword", event.target.value)}
        disabled={isLoading}
      />

      <Button
        type="submit"
        size="lg"
        isLoading={isLoading}
        loadingText="Creating account..."
        trailingIcon={isLoading ? undefined : <ArrowRight className="size-4" strokeWidth={2} />}
      >
        Create account
      </Button>

      <AuthDivider />

      <SocialButton />

      <p className="pt-1 text-center text-sm text-ink-soft sm:text-[15px]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="-my-1 inline-flex min-h-10 items-center rounded font-medium text-brand-600 transition hover:text-brand-700"
        >
          Sign in
        </Link>
      </p>

      <p className="text-center text-xs leading-relaxed text-slate-400">
        By creating an account, you agree to our{" "}
        <span className="text-ink-soft underline decoration-line underline-offset-2">
          Terms of Service
        </span>{" "}
        and{" "}
        <span className="text-ink-soft underline decoration-line underline-offset-2">
          Privacy Policy
        </span>
        .
      </p>
    </form>
  );
}