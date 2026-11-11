import Link from "next/link";
import Image from "next/image";
import { Compass, Globe2, Heart, Plane, ShieldCheck, Sparkles } from "lucide-react";

export function SignUpBanner() {
  return (
    <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#18372b] p-12 text-white lg:flex xl:p-16">
      <Image
        src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1600&q=80"
        alt="Coastal cliffs and serene ocean"
        fill
        sizes="50vw"
        priority
        className="object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#18372b] via-[#18372b]/65 to-[#18372b]/35" />

      {/* Top brand header */}
      <div className="relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight text-white"
        >
          <span className="grid size-10 place-items-center rounded-full bg-[#e8a83e] text-white shadow-md shadow-[#e8a83e]/30">
            <Compass className="size-6" />
          </span>
          destino
        </Link>
      </div>

      {/* Center perks showcase */}
      <div className="relative z-10 max-w-lg space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#f2c879] backdrop-blur-md">
          <Sparkles className="size-3.5" /> Start your free adventure
        </div>
        <h2 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
          Explore the world with an AI travel companion.
        </h2>
        <p className="text-base leading-relaxed text-white/80">
          Create an account to unlock hyper-personalized itineraries, compare
          travel spots, and save your bucket list destinations.
        </p>

        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#e8a83e]/25 text-[#f2c879]">
              <Plane className="size-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                Smart Day-by-Day Itineraries
              </h4>
              <p className="text-xs text-white/70">
                AI-powered day plans crafted to your budget, pace, and interests.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#e8a83e]/25 text-[#f2c879]">
              <Heart className="size-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                Saved Bucket Lists
              </h4>
              <p className="text-xs text-white/70">
                Bookmark must-see sights and organize trips across continents.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#e8a83e]/25 text-[#f2c879]">
              <Globe2 className="size-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                Destination Comparisons
              </h4>
              <p className="text-xs text-white/70">
                Weigh weather, budgets, and crowds side-by-side before booking.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom trust badge */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-white/70">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-[#e8a83e]" />
          <span>100% Free prototype — No card required</span>
        </div>
        <span>Instant setup in 30 seconds</span>
      </div>
    </div>
  );
}

