import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Set a new password | TripMate",
  description: "Choose a new password for your TripMate account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout heroImage="/images/splash.jpg">
      <div className="w-full">
        <header className="mb-7 text-center sm:mb-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-night sm:text-[34px]">
            Set a new password
          </h1>
          <p className="font-body text-sm leading-relaxed text-ink-soft sm:text-base">
            Pick something you haven&apos;t used before. You&apos;ll stay signed in on this device.
          </p>
        </header>

        <ResetPasswordForm />
      </div>
    </AuthLayout>
  );
}
