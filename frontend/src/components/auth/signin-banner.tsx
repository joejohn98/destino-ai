import Link from "next/link";
import Image from "next/image";
import { Compass, Sparkles } from "lucide-react";

export function SignInBanner() {
  return (
    <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#18372b] p-12 text-white lg:flex xl:p-16">
      <Image
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
        alt="Tropical paradise destination"
        fill
        sizes="50vw"
        priority
        className="object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#18372b] via-[#18372b]/60 to-[#18372b]/30" />

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

      {/* Center quote / showcase */}
      <div className="relative z-10 max-w-lg space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#f2c879] backdrop-blur-md">
          <Sparkles className="size-3.5" /> Welcome back to your journeys
        </div>
        <h2 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
          Where will curiosity take you next?
        </h2>
        <p className="text-base leading-relaxed text-white/80">
          Log in to pick up where you left off, view your saved itineraries,
          and get personalized AI recommendations tailored to your travel style.
        </p>
      </div>
    </div>
  );
}

