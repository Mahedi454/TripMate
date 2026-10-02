import type { ReactNode } from "react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Logo } from "@/components/ui/Logo";

/** Layout for signed-in pages: logo, sign out, and a centred content column. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-canvas">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-5 sm:px-8 sm:py-6">
        <Logo />
        <SignOutButton />
      </header>
      <div className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-8">{children}</div>
    </main>
  );
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return "Never";
  }
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}
