import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Start planning unforgettable trips together with TripMate.",
};

export default function RegisterPage() {
  return (
    <AuthLayout>
      <AuthHeader
        title="Create your TripMate account"
        subtitle="Start planning unforgettable trips together."
      >
        <p className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-soft">
          <ShieldCheck
            aria-hidden="true"
            className="mt-px size-4 shrink-0 text-success"
            strokeWidth={1.9}
          />
          TripMate never stores your password, so your account stays private to the sign in provider.
        </p>
      </AuthHeader>

      <RegisterForm />
    </AuthLayout>
  );
}