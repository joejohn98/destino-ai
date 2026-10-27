"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import Link from "next/link";
import {
  Compass,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  MapPin,
  Star,
  CheckCircle2,
} from "lucide-react";
import { signInSchema, type SignInFormData } from "@/schemas/auth.schema";
import { api, type AuthUser } from "@/lib/api";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submittedUser, setSubmittedUser] = useState<AuthUser | null>(null);

  const {
    handleSubmit,
    register,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (values: SignInFormData) => {
    try {
      const { data } = await api.login(values);
      setSubmittedUser(data);
      toast.success("Welcome back!", {
        description: `Signed in as ${data.email}.`,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while signing in. Please try again later.";
      setError("root", { message });
      toast.error("Sign in failed", { description: message });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#faf9f6] text-[#18251f]">
      {/* Left visual banner (hidden on small screens) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#18372b] p-12 text-white lg:flex xl:p-16">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
          alt="Tropical paradise destination"
          className="absolute inset-0 size-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#18372b] via-[#18372b]/60 to-[#18372b]/30" />

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
            and get personalized AI recommendations tailored to your travel
            style.
          </p>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
            <div className="flex items-center gap-1 text-[#e8a83e]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-4 fill-[#e8a83e]" />
              ))}
            </div>
            <p className="mt-2 text-sm italic text-white/90">
              “Destino completely changed how we plan vacations. The AI
              itinerary feature saved us hours of research for our trip to
              Kyoto.”
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="size-8 rounded-full bg-[#e8a83e]/30 text-center font-bold leading-8 text-[#f2c879]">
                S
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  Sarah & Liam M.
                </p>
                <p className="text-[11px] text-white/60">
                  Verified Travelers • Italy & Japan
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stats / trust */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-white/70">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-[#e8a83e]" />
            <span>Over 180+ countries covered</span>
          </div>
          <span>Trusted by 50,000+ wanderers</span>
        </div>
      </div>

      {/* Right side form container */}
      <div className="flex w-full flex-col justify-between p-6 sm:p-10 lg:w-1/2 lg:p-14 xl:p-20">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile brand header */}
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-[#18251f]"
            >
              <span className="grid size-9 place-items-center rounded-full bg-[#e8a83e] text-white shadow-sm">
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
              Sign in
            </h1>
            <p className="text-sm text-[#657069]">
              Enter your credentials to access your trips and saved
              destinations.
            </p>
          </div>

          {submittedUser ? (
            <div className="mt-8 rounded-2xl border border-[#dfe2dc] bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-[#18372b]/10 text-[#18372b]">
                <CheckCircle2 className="size-6 text-[#18372b]" />
              </div>
              <h3 className="text-xl font-bold text-[#18372b]">
                Welcome back!
              </h3>
              <p className="mt-2 text-sm text-[#657069]">
                You have successfully signed in as{" "}
                <strong className="text-[#18372b]">
                  {submittedUser.email}
                </strong>
                .
              </p>
              <Link
                href="/destinations"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#18372b] py-3 text-sm font-semibold text-white transition hover:bg-[#285441]"
              >
                Explore Destinations <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"

                  className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-[#dfe2dc] bg-white py-2.5 text-xs font-semibold text-[#18251f] shadow-sm transition hover:border-[#e8a83e] hover:bg-[#faf9f6]"
                >
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.55 0 2.94.55 4.04 1.45l3.03-3.03C17.24 1.7 14.77 1 12 1 7.42 1 3.53 3.6 1.71 7.37l3.7 2.87C6.3 7.47 8.9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.7 2.87c2.16-1.99 3.72-4.93 3.72-8.69z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.41 14.76c-.23-.68-.36-1.41-.36-2.16s.13-1.48.36-2.16L1.71 7.57C.62 9.74 0 12.18 0 14.76s.62 5.02 1.71 7.19l3.7-2.87z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23.5c3.24 0 5.95-1.08 7.93-2.91l-3.7-2.87c-1.08.72-2.45 1.16-4.23 1.16-3.1 0-5.7-2.47-6.59-5.24L1.71 16.5C3.53 20.27 7.42 23.5 12 23.5z"
                    />
                  </svg>
                  Google
                </button>

                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-[#dfe2dc] bg-white py-2.5 text-xs font-semibold text-[#18251f] shadow-sm transition hover:border-[#e8a83e] hover:bg-[#faf9f6]"
                >
                  <svg
                    className="size-4 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.08c-3.1.67-3.76-1.31-3.76-1.31-.51-1.3-1.24-1.65-1.24-1.65-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 1.71 2.62 1.22 3.26.93.1-.72.39-1.22.71-1.5-2.48-.28-5.09-1.24-5.09-5.53 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.11-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.3-2.61 5.25-5.1 5.52.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
                  </svg>
                  GitHub
                </button>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-[#dfe2dc]" />
                <span className="absolute bg-[#faf9f6] px-3 text-xs font-medium text-[#657069]">
                  or sign in with email
                </span>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
                {errors.root && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {errors.root.message}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#18372b]"
                  >
                    Email Address
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#657069]" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="alex@destino.com"
                      className="w-full rounded-xl border border-[#dfe2dc] bg-white py-3 pl-10 pr-4 text-sm text-[#18251f] placeholder:text-[#657069]/60 focus:border-[#e8a83e] focus:outline-none focus:ring-2 focus:ring-[#e8a83e]/20"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#18372b]"
                    >
                      Password
                    </label>
                    <a
                      href="#forgot-password"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(
                          "Password reset instructions will be sent to your email.",
                        );
                      }}
                      className="text-xs font-medium text-[#c47e18] transition hover:text-[#9a671f]"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative mt-1.5">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#657069]" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-[#dfe2dc] bg-white py-3 pl-10 pr-11 text-sm text-[#18251f] placeholder:text-[#657069]/60 focus:border-[#e8a83e] focus:outline-none focus:ring-2 focus:ring-[#e8a83e]/20"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#657069] transition hover:text-[#18251f]"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[#657069]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="size-4 rounded border-[#dfe2dc] text-[#18372b] accent-[#18372b] focus:ring-[#e8a83e]"
                    />
                    Remember this device for 30 days
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#18372b] py-3.5 text-sm font-semibold text-white shadow-md shadow-[#18372b]/15 transition hover:bg-[#285441] disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Signing in...
                    </span>
                  ) : (
                    <>
                      Sign in <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Footer note */}
          <div className="mt-8 text-center text-sm text-[#657069]">
            Don&apos;t have an account?{" "}
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
