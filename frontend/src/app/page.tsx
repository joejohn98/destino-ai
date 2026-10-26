"use client";

import Link from "next/link";
import { ArrowRight, Compass, Sparkles } from "lucide-react";

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
    </main>
  );
}
