import type { ReactNode } from "react";
import { MapPin, ShieldCheck } from "lucide-react";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { Logo } from "@/components/ui/Logo";

interface AuthLayoutProps {
  children: ReactNode;
  /** Optional helper rendered at the top right of the form column. */
  headerAction?: ReactNode;
  /** Optional trust note under the form. Defaults to the shared security line. */
  footer?: ReactNode;
}

/**
 * Split screen authentication shell.
 * - Large screens: travel photography on the left, form column on the right (55/45).
 * - Below `lg`: a compact photo banner replaces the panel, so the form owns the width.
 * - Short viewports (landscape phones) drop the banner and tighten the spacing.
 */
export function AuthLayout({ children, headerAction, footer }: AuthLayoutProps) {
  return (
    <main className="flex min-h-dvh w-full flex-col bg-white lg:flex-row">
      <AuthBrandPanel />

      <div className="flex w-full flex-col lg:w-[46%] xl:w-[45%]">
        <AuthMobileBanner />

        <section className="flex min-h-0 flex-1 flex-col px-5 py-6 sm:px-10 sm:py-10 lg:px-12 lg:py-10 xl:px-16 short:p-8">
          <header className="flex w-full items-center justify-between gap-3">
            <Logo />
            {headerAction}
          </header>

          <div className="mx-auto my-auto w-full max-w-[420px] animate-fade-in-up py-8 sm:py-10 short:py-6">
            {children}
          </div>

          <footer className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t border-slate-100 pt-5 text-center text-xs text-ink-soft short:mt-4 short:pt-4">
            {footer ?? (
              <>
                <ShieldCheck className="size-4 shrink-0 text-success" strokeWidth={2} aria-hidden="true" />
                <span>Secure and simple travel planning.</span>
              </>
            )}
          </footer>
        </section>
      </div>
    </main>
  );
}

/**
 * Photo banner for phones and tablets, where the split panel is hidden.
 * Uses a pre-cropped asset as a CSS background so nothing is downloaded twice.
 */
function AuthMobileBanner() {
  return (
    <div
      aria-hidden="true"
      className="relative h-28 shrink-0 overflow-hidden bg-slate-900 sm:h-36 md:h-44 lg:hidden very-short:hidden"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(15,23,42,0.45) 0%, rgba(15,23,42,0.25) 45%, rgba(15,23,42,0.78) 100%), url('/images/splash-sm.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center 45%",
      }}
    >
      <div className="flex h-full flex-col justify-between p-5 sm:p-6">
        <span className="inline-flex w-fit items-center gap-2 self-end rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Shared itineraries live
        </span>

        <p className="flex items-center gap-2 text-sm font-bold leading-snug text-white sm:text-base">
          <MapPin className="size-4 shrink-0" strokeWidth={2.2} />
          Plan together. Travel together.
        </p>
      </div>
    </div>
  );
}