"use client";

import Link from "next/link";
import { ArrowRight, Compass, GitCompare, MapPin, Sparkles } from "lucide-react";

const destinations = [
  {
    name: "Santorini",
    country: "Greece",
    category: "Coastal escape",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=85",
    color: "from-sky-500/80",
  },
  {
    name: "Kyoto",
    country: "Japan",
    category: "Cultural journey",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=85",
    color: "from-violet-500/80",
  },
  {
    name: "Marrakech",
    country: "Morocco",
    category: "City adventure",
    image:
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=85",
    color: "from-amber-500/80",
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#18251f]">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight"
        >
          <span className="grid size-9 place-items-center rounded-full bg-[#e8a83e] text-white">
            <Compass className="size-5" />
          </span>
          destino
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-[#657069] md:flex">
          <Link
            href="/destinations"
            className="transition hover:text-[#e29b2c]"
          >
            Destinations
          </Link>
          <Link href="/continents" className="transition hover:text-[#e29b2c]">
            Continents
          </Link>
          <Link href="/ai/planner" className="transition hover:text-[#e29b2c]">
            AI Planner
          </Link>
          <Link href="/ai/compare" className="transition hover:text-[#e29b2c]">
            Compare
          </Link>
        </div>
        <Link
          href="/auth/login"
          className="rounded-full border border-[#dfe2dc] bg-white px-5 py-2.5 text-sm font-semibold transition hover:border-[#e8a83e]"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-10 lg:grid-cols-[1.03fr_.97fr] lg:items-center lg:px-10 lg:pb-28 lg:pt-16">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-[#f6ead3] px-4 py-2 text-sm font-semibold text-[#9a671f]">
            <Sparkles className="size-4" /> Your next story starts here
          </div>
          <h1 className="max-w-xl text-5xl font-semibold leading-[1.03] tracking-tighter sm:text-7xl">
            Go somewhere <span className="text-[#dc9a2d]">wonderful.</span>
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-[#657069]">
            Discover places that feel like you. Find thoughtful recommendations,
            plan with AI, and turn daydreams into your next adventure.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/destinations"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#18372b] px-6 py-3.5 font-semibold text-white transition hover:bg-[#285441]"
            >
              Explore destinations <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/ai/planner"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#dfe2dc] bg-white px-6 py-3.5 font-semibold transition hover:border-[#e8a83e]"
            >
              Plan with AI <Sparkles className="size-4 text-[#dc9a2d]" />
            </Link>
          </div>
          <div className="mt-12 flex items-center gap-8 text-sm text-[#657069]">
            <div>
              <strong className="block text-2xl text-[#18372b]">12k+</strong>
              destinations
            </div>
            <div>
              <strong className="block text-2xl text-[#18372b]">4.9/5</strong>
              traveler rating
            </div>
            <div>
              <strong className="block text-2xl text-[#18372b]">180+</strong>
              countries
            </div>
          </div>
        </div>
        <div className="relative min-h-115 overflow-hidden rounded-4xl bg-[#d9e4dd] shadow-2xl shadow-[#18372b]/10 sm:min-h-140">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hero-travel-H8f7qVCh3AdHW0LB4sjUgpGAe7Mqp7.jpg"
            alt="Golden sunset over a tropical coastline and mountain range"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#18372b]/70 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
            <div>
              <p className="text-sm text-white/75">Featured escape</p>
              <p className="mt-1 text-2xl font-semibold">
                The Dolomites, Italy
              </p>
            </div>
            <span className="rounded-full bg-white/20 px-3 py-1.5 text-sm backdrop-blur">
              01 / 06
            </span>
          </div>
        </div>
      </section>

       {/* AI Features Section */}
      <section className="border-y border-[#e5e6e1] bg-[#f5f0e6] px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#c47e18]">
              Travel, made personal
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Plan smarter with AI
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[#657069]">
              Get thoughtful recommendations grounded in real destinations and
              traveler reviews.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
            <Link
              href="/ai/planner"
              className="group rounded-2xl bg-[#18372b] p-7 text-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#18372b]/15"
            >
              <Sparkles className="size-10 text-[#e8a83e]" />
              <h3 className="mt-6 text-2xl font-semibold">AI Trip Planner</h3>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Tell us where you want to go and get a day-by-day itinerary with
                real ideas, reviews, and budget guidance.
              </p>
              <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#f2c879]">
                Start planning{" "}
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href="/ai/compare"
              className="group rounded-2xl bg-[#18372b] p-7 text-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#18372b]/15"
            >
              <GitCompare className="size-10 text-[#e8a83e]" />
              <h3 className="mt-6 text-2xl font-semibold">
                Compare destinations
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Weigh two places side by side with honest insights on
                atmosphere, cost, activities, and who each destination suits.
              </p>
              <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#f2c879]">
                Compare now{" "}
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>
      {/* Destinations Section */}
      <section className="bg-[#18372b] px-6 py-20 text-white lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#e8a83e]">
                Curated for curious people
              </p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Places worth the detour
              </h2>
            </div>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#f2c879]"
            >
              View all destinations <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {destinations.map((destination) => (
              <Link
                href={`/destinations/${destination.name}`}
                key={destination.name}
                className="group relative min-h-[360px] overflow-hidden rounded-2xl"
              >
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div
                  className={`absolute inset-0 bg-linear-to-t ${destination.color} via-black/10 to-transparent`}
                />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-sm text-white/75">
                    {destination.category}
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold">
                    {destination.name}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-white/80">
                    <MapPin className="size-3.5" /> {destination.country}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
