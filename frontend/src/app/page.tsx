"use client";

import Link from "next/link";
import {
  Compass,
} from "lucide-react";



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
    </main>
  );
}
