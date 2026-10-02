"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, Mail, ShieldCheck, UserRound } from "lucide-react";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { PasswordInput } from "@/components/auth/PasswordInput";
import {
  MIN_PASSWORD_LENGTH,
  PasswordMatchHint,
  PasswordStrengthMeter,
} from "@/components/auth/PasswordStrength";
import { SocialButton } from "@/components/auth/SocialButton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { authErrorMessage, callbackUrl } from "@/lib/supabase/errors";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LABEL_CLASS = "text-xs font-semibold text-ink";
/** Widens the dots of a masked password, matching the supplied design. */
const MASKED_DOTS = "tracking-[0.18em]";

const GENERIC_ERROR = "We could not create your account";

/** Creates the account through Supabase Auth. */
export function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  /** Set when the project requires email confirmation before a session exists. */
  const [awaitingConfirmation, setAwaitingConfirmation] = useState<string | null>(null);

  function updateField(field: keyof typeof values, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
    setFormError(null);
    setIsSuccess(false);
    setAwaitingConfirmation(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors: FieldErrors = {};

    if (values.name.trim().length < 2) {
      errors.name = "Please enter your full name.";
    }
    if (!EMAIL_PATTERN.test(values.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (values.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (values.confirmPassword !== values.password) {
      errors.confirmPassword = "Passwords do not match.";
    }
    if (!hasAcceptedTerms) {
      errors.terms = "Please accept the Terms of Service and Privacy Policy.";
    }

    setFieldErrors(errors);
    setFormError(null);

    if (Object.keys(errors).length > 0) {
      setFormError("Something went wrong");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
        options: {
          // signUp only accepts email and password, so the name rides along as
          // metadata. A database trigger copies it into public.profiles.
          data: { full_name: values.name.trim() },
          emailRedirectTo: callbackUrl("/auth/callback?next=/"),
        },
      });

      if (error) {
        setFormError(authErrorMessage(error, GENERIC_ERROR));
        return;
      }

      if (data.session) {
        // Email confirmation is off, so they are signed in already.
        router.replace("/");
        router.refresh();
        return;
      }

      setAwaitingConfirmation(values.email.trim());
    } catch (error) {
      setFormError(error instanceof Error ? error.message : GENERIC_ERROR);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {formError ? (
        <AuthAlert title={formError} message="Please check the highlighted fields and try again." />
      ) : null}

      {isSuccess ? (
        <AuthAlert
          variant="success"
          title="Account created successfully."
          message="You are now signed in. Start planning your first trip together."
        />
      ) : null}

      {awaitingConfirmation ? (
        <AuthAlert
          variant="success"
          title="Check your inbox to confirm your email."
          message={`We sent a confirmation link to ${awaitingConfirmation}. Open it to finish setting up your account.`}
        />
      ) : null}

      <Input
        label="Full name"
        labelClassName={LABEL_CLASS}
        name="name"
        autoComplete="name"
        placeholder="Enter your full name"
        leadingIcon={<UserRound className="size-5" strokeWidth={1.8} />}
        value={values.name}
        error={fieldErrors.name}
        onChange={(event) => updateField("name", event.target.value)}
        disabled={isLoading}
      />

      <Input
        label="Email address"
        labelClassName={LABEL_CLASS}
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@example.com"
        leadingIcon={<Mail className="size-5" strokeWidth={1.8} />}
        value={values.email}
        error={fieldErrors.email}
        onChange={(event) => updateField("email", event.target.value)}
        disabled={isLoading}
      />

      <div>
        <PasswordInput
          label="Password"
          labelClassName={LABEL_CLASS}
          name="password"
          autoComplete="new-password"
          placeholder="Create a strong password"
          className={MASKED_DOTS}
          value={values.password}
          error={fieldErrors.password}
          onChange={(event) => updateField("password", event.target.value)}
          disabled={isLoading}
        />

        <PasswordStrengthMeter password={values.password} />
      </div>

      <div>
        <PasswordInput
          label="Confirm password"
          labelClassName={LABEL_CLASS}
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          className={MASKED_DOTS}
          value={values.confirmPassword}
          error={fieldErrors.confirmPassword}
          onChange={(event) => updateField("confirmPassword", event.target.value)}
          disabled={isLoading}
          leadingIcon={<ShieldCheck className="size-5" strokeWidth={1.8} />}
        />

        <PasswordMatchHint password={values.password} confirmPassword={values.confirmPassword} />
      </div>

      <div className="pt-0.5">
        <label
          htmlFor="terms"
          className={`flex cursor-pointer items-start gap-2.5 rounded py-1 select-none ${
            fieldErrors.terms ? "text-danger" : ""
          }`}
        >
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={hasAcceptedTerms}
            onChange={(event) => {
              setHasAcceptedTerms(event.target.checked);
              setFieldErrors((previous) => ({ ...previous, terms: undefined }));
              setFormError(null);
              setIsSuccess(false);
            }}
            disabled={isLoading}
            aria-invalid={fieldErrors.terms ? true : undefined}
            aria-describedby={fieldErrors.terms ? "terms-error" : undefined}
            className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-slate-300 text-brand-600 focus:ring-2 focus:ring-brand-500 focus:ring-offset-0"
          />
          <span className="text-xs leading-normal text-ink-soft">
            I agree to the{" "}
            <span className="font-medium text-brand-600 underline decoration-line underline-offset-2">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="font-medium text-brand-600 underline decoration-line underline-offset-2">
              Privacy Policy
            </span>
          </span>
        </label>

        {fieldErrors.terms ? (
          <p id="terms-error" role="alert" className="mt-1.5 text-[13px] font-medium text-danger">
            {fieldErrors.terms}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        className="mt-1 text-sm font-semibold shadow-md shadow-brand-500/20"
        isLoading={isLoading}
        loadingText="Creating account..."
        trailingIcon={isLoading ? undefined : <ArrowRight className="size-4" strokeWidth={2} />}
      >
        Create account
      </Button>

      <AuthDivider />

      <SocialButton />

      <p className="text-center text-xs text-ink-soft">
        Already have an account?{" "}
        <Link
          href="/login"
          className="-my-1 ml-1 inline-flex min-h-10 items-center rounded font-semibold text-brand-600 transition hover:text-brand-700 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
