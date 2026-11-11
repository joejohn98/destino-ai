"use client";

import { useState } from "react";
import Link from "next/link";
import { Compass, Sparkles, CheckCircle2 } from "lucide-react";
import type { AuthUser } from "@/lib/api";
import { SignInBanner } from "@/components/auth/signin-banner";
import { SignInForm } from "@/components/auth/signin-form";

export default function SignInPage() {
  const [submittedUser, setSubmittedUser] = useState<AuthUser | null>(null);

  return (
    <div className="flex min-h-screen bg-[#faf9f6] text-[#18251f]">
      <SignInBanner />

      {/* Right side form container */}
      <div className="flex w-full flex-col justify-between p-6 sm:p-10 lg:w-1/2 lg:p-14 xl:p-20">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile brand header */}
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-[#18251f]"
            >
              <span className="grid size-9 place-items-center rounded-full bg-[#e8a83e] text-white shadow-xs">
                <Compass className="size-5" />
              </span>
              destino
            </Link>
            <Link
              href="/"
              className="text-xs font-semibold text-[#657069] transition hover:text-[#18372b]"
            >
              Back to Home
            </Link>
          </div>

          <div className="hidden lg:mb-12 lg:flex lg:items-center lg:justify-end">
            <Link
              href="/"
              className="text-sm font-medium text-[#657069] transition hover:text-[#18372b]"
            >
              ← Back to Destino
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#18372b] sm:text-4xl">
              Welcome back
            </h1>
            <p className="text-sm text-[#657069]">
              Enter your credentials to access your trips, saved spots, and
              reviews.
            </p>
          </div>

          {submittedUser ? (
            <div className="mt-8 rounded-2xl border border-[#dfe2dc] bg-white p-8 text-center shadow-xs">
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-[#18372b]/10 text-[#18372b]">
                <CheckCircle2 className="size-6 text-[#18372b]" />
              </div>
              <h3 className="text-xl font-bold text-[#18372b]">Signed In!</h3>
              <p className="mt-2 text-sm text-[#657069]">
                Redirecting to your destination dashboard...
              </p>
              <Link
                href="/destinations"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#18372b] py-3 text-sm font-semibold text-white transition hover:bg-[#285441]"
              >
                Continue Exploring <Sparkles className="size-4 text-[#e8a83e]" />
              </Link>
            </div>
          ) : (
            <SignInForm onSuccess={setSubmittedUser} />
          )}

          {/* Footer note */}
          <div className="mt-8 text-center text-sm text-[#657069]">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[#c47e18] transition hover:text-[#9a671f] hover:underline"
            >
              Sign up for free
            </Link>
          </div>
        </div>

        {/* Bottom subtle copyright */}
        <div className="mt-8 text-center text-xs text-[#657069]/70">
          © {new Date().getFullYear()} Destino Travel Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
}
