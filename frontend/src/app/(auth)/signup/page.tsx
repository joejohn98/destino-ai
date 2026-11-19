"use client";

import { useState } from "react";
import Link from "next/link";
import { CurrentYear } from "@/components/current-year";
import { Compass } from "lucide-react";
import type { AuthUser } from "@/lib/api";
import { SignUpBanner } from "@/components/auth/signup-banner";
import { SignUpForm } from "@/components/auth/signup-form";
import { SignUpSuccess } from "@/components/auth/signup-success";

export default function SignUpPage() {
  const [submittedUser, setSubmittedUser] = useState<AuthUser | null>(null);

  return (
    <div className="flex min-h-screen bg-[#faf9f6] text-[#18251f]">
      <SignUpBanner />

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

          <div className="hidden lg:mb-10 lg:flex lg:items-center lg:justify-end">
            <Link
              href="/"
              className="text-sm font-medium text-[#657069] transition hover:text-[#18372b]"
            >
              ← Back to Destino
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#18372b] sm:text-4xl">
              Get Started
            </h1>
            <p className="text-sm text-[#657069]">
              Create your free Destino account and start planning your next
              journey.
            </p>
          </div>

          {submittedUser ? (
            <SignUpSuccess user={submittedUser} />
          ) : (
            <SignUpForm onSuccess={setSubmittedUser} />
          )}

          {/* Footer note */}
          <div className="mt-8 text-center text-sm text-[#657069]">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-semibold text-[#c47e18] transition hover:text-[#9a671f] hover:underline"
            >
              Sign in here
            </Link>
          </div>
        </div>

        {/* Bottom subtle copyright */}
        <div className="mt-8 text-center text-xs text-[#657069]/70">
          © <CurrentYear /> Destino Travel Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
}
