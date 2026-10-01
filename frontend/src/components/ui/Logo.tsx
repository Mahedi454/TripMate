import Link from "next/link";
import { Compass } from "lucide-react";

interface LogoProps {
  /** Renders as a link to the landing page. Set to false inside an existing link. */
  asLink?: boolean;
  className?: string;
  iconClassName?: string;
  tone?: "light" | "dark";
}

/** TripMate wordmark: a compass mark plus the product name. */
export function Logo({ asLink = true, className = "", iconClassName = "", tone = "dark" }: LogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-xl shadow-md transition-transform duration-300 group-hover:rotate-12 ${
          tone === "light"
            ? "border border-white/25 bg-white/15 text-white backdrop-blur-md shadow-black/10"
            : "bg-brand-600 text-white shadow-brand-500/20"
        } ${iconClassName}`}
      >
        <Compass aria-hidden="true" className="size-5" strokeWidth={2.2} />
      </span>
      <span
        className={`text-lg font-bold tracking-tight sm:text-xl ${tone === "light" ? "text-white" : "text-night"}`}
      >
        TripMate
      </span>
    </span>
  );

  if (!asLink) {
    return content;
  }

  return (
    <Link
      href="/"
      aria-label="TripMate home"
      className={`group inline-flex shrink-0 items-center rounded-xl py-1 ${className}`}
    >
      {content}
    </Link>
  );
}