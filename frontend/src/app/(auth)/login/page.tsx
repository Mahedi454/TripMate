import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to TripMate to continue planning your next adventure.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      heroImage="/images/Login.png"
      headerAction={
        <a
          href="mailto:support@tripmate.app"
          className="-my-2 inline-flex min-h-10 items-center rounded px-1 text-[13px] font-medium text-ink-soft transition-colors hover:text-night sm:text-xs"
        >
          Need help?
        </a>
      }
    >
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to continue planning your next adventure."
      />

      {/*
        LoginForm reads ?next and ?error with useSearchParams, which opts this
        page out of static rendering unless it sits behind a Suspense boundary.
      */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}