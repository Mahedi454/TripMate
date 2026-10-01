import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Start planning better trips together with TripMate.",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      headerAction={
        <a
          href="mailto:support@tripmate.app"
          className="-my-2 inline-flex min-h-10 items-center rounded px-1 text-xs font-medium text-ink-soft transition-colors hover:text-night sm:text-sm"
        >
          Need help?
        </a>
      }
    >
      <header className="mb-6 sm:mb-7">
        <h1 className="text-2xl font-extrabold tracking-tight text-night sm:text-3xl">
          Create your account
        </h1>
        <p className="mt-1.5 font-body text-sm text-ink-soft">Start planning better trips together.</p>
      </header>

      <RegisterForm />
    </AuthLayout>
  );
}
