import type { Metadata } from "next";
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

      <LoginForm />
    </AuthLayout>
  );
}