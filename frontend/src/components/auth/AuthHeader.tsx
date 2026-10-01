import type { ReactNode } from "react";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  /** Optional badge above the title, e.g. the mail icon on the reset page. */
  icon?: ReactNode;
  /** Optional row under the subtitle, e.g. the login trust note. */
  children?: ReactNode;
}

/** Reusable heading block for every auth screen. */
export function AuthHeader({ title, subtitle, icon, children }: AuthHeaderProps) {
  return (
    <header className="mb-8">
      {icon ? <div className="mb-6 animate-scale-in">{icon}</div> : null}

      <h1 className="mb-2 text-3xl font-bold leading-tight tracking-tight text-night sm:text-[34px]">
        {title}
      </h1>
      <p className="font-body text-sm leading-relaxed text-ink-soft sm:text-base">{subtitle}</p>

      {children ? <div className="mt-5">{children}</div> : null}
    </header>
  );
}