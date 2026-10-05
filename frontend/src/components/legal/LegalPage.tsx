import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

/** Contact address shown on the legal pages. Must be an inbox someone reads. */
export const SUPPORT_EMAIL = "support@trippilot.app";

interface LegalPageProps {
  title: string;
  updated: string;
  children: ReactNode;
}

/** Shared layout for the Terms of Service and Privacy Policy pages. */
export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <main className="min-h-dvh bg-canvas">
      <header className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-8 sm:py-6">
        <Logo />
      </header>

      <article className="mx-auto w-full max-w-3xl px-4 pb-20 sm:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-night sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-ink-soft">Last updated: {updated}</p>

        <div className="mt-8 space-y-6 rounded-2xl border border-line bg-white p-6 text-[15px] leading-relaxed text-ink shadow-sm sm:p-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-night [&_li]:ml-5 [&_li]:list-disc [&_ul]:mt-2 [&_ul]:space-y-1">
          {children}
        </div>
      </article>
    </main>
  );
}
