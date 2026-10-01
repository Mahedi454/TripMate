import Link from "next/link";
import { Compass, MapPin, Navigation, ShieldCheck, Vote } from "lucide-react";
import { buttonClasses } from "@/components/ui/button-styles";
import { Logo } from "@/components/ui/Logo";

const FEATURES = [
  {
    icon: MapPin,
    title: "Decide together",
    description: "Shortlist destinations and let the group vote instead of arguing in chat.",
  },
  {
    icon: Navigation,
    title: "Build one itinerary",
    description: "A shared plan everyone can edit, with days, times and places in one place.",
  },
  {
    icon: Vote,
    title: "Split costs fairly",
    description: "Track shared expenses and see who owes whom at the end of the trip.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-canvas">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-5 sm:gap-4 sm:px-8 sm:py-6">
        <Logo />
        <nav className="flex shrink-0 items-center gap-0.5 sm:gap-2" aria-label="Main">
          <Link
            href="/login"
            className="hidden rounded-xl px-2 text-[13px] font-medium text-ink-soft transition hover:bg-white hover:text-ink min-[360px]:inline-flex min-h-10 items-center sm:px-3.5 sm:text-sm"
          >
            Sign in
          </Link>
          <Link href="/register" className={buttonClasses({ size: "sm", className: "px-3 sm:px-3.5" })}>
            Get started
          </Link>
        </nav>
      </header>

      <section className="mx-auto w-full max-w-5xl px-4 pb-14 pt-10 text-center sm:px-8 sm:pb-16 sm:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-medium text-ink-soft">
          <Compass className="size-3.5 text-brand-600" strokeWidth={1.9} aria-hidden="true" />
          Plan together. Decide together. Travel together.
        </span>

        <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
          One place for every trip decision.
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
          TripMate gives a group one shared place to choose destinations, organise an itinerary and
          keep track of who paid for what.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register" className={buttonClasses({ size: "lg", fullWidth: true })}>
            Create your account
          </Link>
          <Link
            href="/login"
            className={buttonClasses({
              variant: "secondary",
              size: "lg",
              fullWidth: true,
            })}
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-5 pb-20 sm:px-8">
        <ul className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <li
                key={feature.title}
                className="rounded-2xl border border-line bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-base font-semibold text-ink">{feature.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{feature.description}</p>
              </li>
            );
          })}
        </ul>

        <p className="mt-12 flex items-center justify-center gap-2 text-sm text-ink-soft">
          <ShieldCheck className="size-4 text-success" strokeWidth={1.9} aria-hidden="true" />
          Sign in securely, or{" "}
          <Link href="/forgot-password" className="font-medium text-brand-600 hover:text-brand-700">
            reset your password
          </Link>
        </p>
      </section>
    </main>
  );
}