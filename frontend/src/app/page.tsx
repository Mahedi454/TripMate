import Image from "next/image";
import Link from "next/link";
import { Compass, MapPin, Navigation, ShieldCheck, Vote } from "lucide-react";
import { buttonClasses } from "@/components/ui/button-styles";
import { Logo } from "@/components/ui/Logo";
import { HeaderLinks, HeroActions } from "@/components/home/HomeAuthLinks";

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
    <main className="min-h-dvh bg-slate-950">
      <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-slate-950">
        <Image
          src="/images/splash.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          // Keeps the hiker on the ridge (lower right of the photo) in frame on wide screens.
          className="-z-20 object-cover object-[center_72%]"
        />
        {/* Darkens the hazy sky behind the headline and the ground behind the cards. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(2,6,23,0.70) 0%, rgba(2,6,23,0.45) 40%, rgba(2,6,23,0.88) 100%)",
          }}
        />

        <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-5 sm:gap-4 sm:px-8 sm:py-6">
          <Logo tone="light" />
          <HeaderLinks />
        </header>

        <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 pb-14 pt-8 text-center sm:px-8">
          <span className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[13px] font-medium text-white backdrop-blur-md">
            <Compass className="size-3.5 text-brand-300" strokeWidth={1.9} aria-hidden="true" />
            Plan together. Decide together. Travel together.
          </span>

          <h1 className="animate-fade-in-up mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] sm:text-6xl">
            One place for every trip decision.
          </h1>

          <p className="animate-fade-in-up mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            TripPilot gives a group one shared place to choose destinations, organise an itinerary and
            keep track of who paid for what.
          </p>

          <HeroActions />
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 pb-10 sm:px-8 sm:pb-12">
          <ul className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;

              return (
                <li
                  key={feature.title}
                  className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:bg-white/15"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 text-brand-200">
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <h2 className="mt-4 text-base font-semibold text-white">{feature.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">{feature.description}</p>
                </li>
              );
            })}
          </ul>

          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-white/75">
            <ShieldCheck className="size-4 text-emerald-400" strokeWidth={1.9} aria-hidden="true" />
            Sign in securely, or{" "}
            <Link href="/forgot-password" className="font-medium text-white underline-offset-2 hover:underline">
              reset your password
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}