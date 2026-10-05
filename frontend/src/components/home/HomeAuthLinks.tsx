"use client";

import Link from "next/link";
import { buttonClasses } from "@/components/ui/button-styles";
import { useAuthUser } from "@/lib/firebase/useAuthUser";

/** Header links on the home page: "Dashboard" when signed in, else sign in / sign up. */
export function HeaderLinks() {
  const { user } = useAuthUser();

  return (
    <nav className="flex shrink-0 items-center gap-0.5 sm:gap-2" aria-label="Main">
      {user ? (
        <Link href="/dashboard" className={buttonClasses({ size: "sm", className: "px-3 sm:px-3.5" })}>
          Dashboard
        </Link>
      ) : (
        <>
          <Link
            href="/login"
            className="hidden min-h-10 items-center rounded-xl px-2 text-[13px] font-medium text-white/85 transition hover:bg-white/10 hover:text-white min-[360px]:inline-flex sm:px-3.5 sm:text-sm"
          >
            Sign in
          </Link>
          <Link href="/register" className={buttonClasses({ size: "sm", className: "px-3 sm:px-3.5" })}>
            Get started
          </Link>
        </>
      )}
    </nav>
  );
}

/** Main call-to-action buttons under the home page headline. */
export function HeroActions() {
  const { user } = useAuthUser();

  return (
    <div className="animate-fade-in-up mt-9 flex w-full max-w-md flex-col items-center justify-center gap-3 sm:flex-row">
      {user ? (
        <Link href="/dashboard" className={buttonClasses({ size: "lg", fullWidth: true })}>
          Go to dashboard
        </Link>
      ) : (
        <>
          <Link href="/register" className={buttonClasses({ size: "lg", fullWidth: true })}>
            Create your account
          </Link>
          <Link
            href="/login"
            className="inline-flex h-[52px] w-full items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 text-[15px] font-medium text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Sign in
          </Link>
        </>
      )}
    </div>
  );
}
