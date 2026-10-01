import Image from "next/image";
import { MapPin } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

/** Initials avatars, so the social proof strip needs no external image requests. */
const TRAVELLERS = [
  { initials: "AR", tone: "bg-sky-400/90" },
  { initials: "TN", tone: "bg-emerald-400/90" },
  { initials: "MK", tone: "bg-amber-400/90" },
];

/**
 * Left hand brand panel: travel photography, tagline, social proof.
 * Hidden below `lg`, where the compact banner in AuthLayout takes over.
 */
export function AuthBrandPanel() {
  return (
    <aside
      aria-hidden="true"
      className="relative hidden w-[54%] select-none flex-col justify-between overflow-hidden bg-slate-900 lg:flex xl:w-[55%]"
    >
      <Image
        src="/images/auth-travel.jpg"
        alt=""
        fill
        priority
        sizes="55vw"
        className="object-cover"
      />

      {/* Legibility scrim: light at the top, heavy where the copy sits. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.25) 0%, rgba(15,23,42,0.10) 40%, rgba(15,23,42,0.72) 75%, rgba(15,23,42,0.94) 100%)",
        }}
      />

      <div className="relative z-10 flex items-center justify-between gap-3 p-8 xl:p-14 short:p-8">
        <Logo asLink={false} tone="light" />

        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/90 shadow-sm sm:px-3.5 sm:text-xs">
          <span className="size-2 rounded-full bg-emerald-400" />
          Shared itineraries live
        </span>
      </div>

      <div className="relative z-10 max-w-xl p-8 pt-0 pb-10 xl:p-14 xl:pb-16 short:p-8">
        <div className="mb-6 hidden items-center gap-2.5 text-white/70 very-short:hidden sm:flex">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-brand-300" />
            <span className="h-[2px] w-12 bg-gradient-to-r from-brand-300 to-white/40" />
            <span className="size-1.5 rounded-full bg-white/60" />
            <span className="w-8 border-b border-dashed border-white/40" />
            <MapPin className="size-4 text-white" strokeWidth={2.2} />
          </span>
          <span className="text-xs font-semibold tracking-widest text-white/80 uppercase">
            Collaborative travel platform
          </span>
        </div>

        <h2 className="mb-3 text-3xl font-extrabold leading-tight tracking-tight text-white xl:text-4xl short:text-[28px]">
          Plan together.
          <br />
          Decide together.
          <br />
          <span className="text-brand-200">Travel together.</span>
        </h2>

        <p className="max-w-md font-body text-base leading-relaxed text-slate-200 short:hidden">
          Everything your group needs to turn a travel idea into a shared plan.
        </p>

        <div className="mt-8 flex items-center gap-4 border-t border-white/15 pt-6 short:mt-5 short:pt-4">
          <div className="flex -space-x-2">
            {TRAVELLERS.map((traveller) => (
              <span
                key={traveller.initials}
                className={`flex size-8 items-center justify-center rounded-full text-[11px] font-semibold text-white ring-2 ring-white/30 ${traveller.tone}`}
              >
                {traveller.initials}
              </span>
            ))}
          </div>
          <p className="text-xs leading-snug font-medium text-white/85">
            Join the groups already planning their next adventure.
          </p>
        </div>
      </div>
    </aside>
  );
}