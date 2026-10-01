import Image from "next/image";
import { MapPin, UserRound } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

/** Ring avatars, so the social proof row needs no external image requests. */
const TRAVELLERS = [
  { tone: "bg-slate-800 text-brand-300", ring: "ring-slate-950" },
  { tone: "bg-brand-900 text-brand-200", ring: "ring-slate-950" },
  { tone: "bg-indigo-900 text-indigo-200", ring: "ring-slate-950" },
];

/**
 * `sizes` has to describe the size the image is *rendered* at, which for
 * `object-cover` is driven by the box height whenever the source is wider than
 * the box. A landscape photo inside this portrait column is therefore laid out
 * far wider than the column itself, and asking for `55vw` alone leaves the
 * browser upscaling the delivered pixels (measured 1.9x to 3.8x soft).
 *
 * The `100vw` fallback covers the sub-`lg` case, where the panel is hidden but
 * the markup is still in the DOM and the browser still fetches one small copy.
 */
const COVER_SIZES: Record<string, string> = {
  "/images/Login.png": "(min-width: 1024px) 210vh, 100vw",
  "/images/Register.png": "(min-width: 1024px) 210vh, 100vw",
};

/**
 * Left hand brand panel: travel photography, tagline, social proof.
 * Hidden below `lg`, where the compact banner in AuthLayout takes over.
 *
 * @param imageSrc Page specific hero photo. Portrait photos suit the column best.
 */
export function AuthBrandPanel({ imageSrc = "/images/splash.jpg" }: { imageSrc?: string }) {
  return (
    <aside
      aria-hidden="true"
      className="relative hidden w-[54%] select-none flex-col justify-between overflow-hidden bg-slate-950 lg:flex xl:w-[55%]"
    >
      <Image
        src={imageSrc}
        alt=""
        fill
        priority
        sizes={COVER_SIZES[imageSrc] ?? "(min-width: 1024px) 55vw, 100vw"}
        className="pointer-events-none object-cover object-center"
      />

      {/* Atmospheric overlay: dark at the bottom where the copy sits. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(2,6,23,0.25) 0%, rgba(2,6,23,0.45) 45%, rgba(2,6,23,0.96) 100%)",
        }}
      />

      <div className="relative z-10 flex w-full items-center justify-between gap-3 p-8 xl:p-16 short:p-8">
        <Logo asLink={false} tone="light" markClassName="size-10" />

        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/45 px-3 py-1.5 text-[11px] font-medium text-slate-200 shadow-sm backdrop-blur-xl sm:px-3.5 sm:text-xs">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          Shared itineraries live
        </span>
      </div>

      <div className="relative z-10 flex max-w-xl flex-col gap-6 p-8 pt-0 pb-10 xl:p-16 xl:pb-14 short:gap-4 short:p-8">
        <div className="hidden items-center gap-2 text-xs font-semibold tracking-wider text-slate-300 uppercase very-short:hidden sm:flex">
          <span className="size-2.5 rounded-full bg-brand-500 ring-4 ring-brand-500/20" />
          <span className="h-[2px] w-12 rounded-full bg-brand-400/80" />
          <span className="size-1.5 rounded-full bg-slate-400" />
          <span className="w-6 border-t border-dashed border-slate-400" />
          <MapPin className="ml-1 size-4 text-slate-200" strokeWidth={2} />
          <span className="ml-1 text-[11px] font-bold tracking-widest text-slate-200">
            Collaborative travel platform
          </span>
        </div>

        <h2 className="text-4xl leading-[1.12] font-extrabold tracking-tight text-white xl:text-5xl short:text-[28px]">
          Plan together.
          <br />
          Decide together.
          <br />
          <span className="text-brand-400">Travel together.</span>
        </h2>

        <p className="max-w-lg font-body text-base leading-relaxed font-normal text-slate-300 xl:text-lg short:hidden">
          Everything your group needs to turn a travel idea into a shared plan.
        </p>

        <div aria-hidden="true" className="mt-1 h-px w-full bg-white/10" />

        <div className="flex items-center gap-4 pt-1">
          <div className="flex -space-x-2.5 overflow-hidden py-1">
            {TRAVELLERS.map((traveller) => (
              <span
                key={traveller.tone}
                className={`inline-flex size-8 items-center justify-center rounded-full ring-2 ${traveller.ring} ${traveller.tone}`}
              >
                <UserRound aria-hidden="true" className="size-4" strokeWidth={2} />
              </span>
            ))}
          </div>
          <span className="font-body text-xs font-normal text-slate-300">
            Over <span className="font-sans font-bold text-white">45,000+ groups</span> planning
            adventures worldwide
          </span>
        </div>
      </div>
    </aside>
  );
}