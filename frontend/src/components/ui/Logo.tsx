import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  /** Renders as a link to the landing page. Set to false inside an existing link. */
  asLink?: boolean;
  className?: string;
  /** Replaces the default mark size. Must include a Tailwind size utility. */
  markClassName?: string;
  /** "light" uses the glass mark and white text, for photos and dark panels. */
  tone?: "light" | "dark";
}

/** TripPilot wordmark: the pin logo plus the product name. */
export function Logo({ asLink = true, className = "", markClassName, tone = "dark" }: LogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src={tone === "light" ? "/images/brand/logo-mark-glass.png" : "/images/brand/logo-mark.png"}
        alt=""
        // Shown at 40-48px; 96 covers 2x screens.
        width={96}
        height={96}
        priority
        className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${
          tone === "light" ? "drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]" : ""
        } ${markClassName ?? "size-10"}`}
      />
      <span
        className={`text-lg font-bold tracking-tight sm:text-xl ${tone === "light" ? "text-white" : "text-night"}`}
      >
        TripPilot
      </span>
    </span>
  );

  if (!asLink) {
    return content;
  }

  return (
    <Link
      href="/"
      aria-label="TripPilot home"
      className={`group inline-flex shrink-0 items-center rounded-xl py-1 ${className}`}
    >
      {content}
    </Link>
  );
}