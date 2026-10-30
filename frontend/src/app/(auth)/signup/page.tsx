"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  Mail,
  Lock,
  User,
  AtSign,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Plane,
  Heart,
  Globe2,
} from "lucide-react";
import { signupSchema, type SignUpFormData } from "@/schemas/auth.schema";
import { api, type AuthUser } from "@/lib/api";
import { safeRedirectPath, useAuth } from "@/components/auth-provider";

export default function SignUpPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [submittedUser, setSubmittedUser] = useState<AuthUser | null>(null);

  const {
    handleSubmit,
    register,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signupSchema),
  });

  const password = useWatch({ control, name: "password" }) ?? "";

  // Compute password strength score (0 to 4)
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-500",
    "bg-emerald-500",
    "bg-[#18372b]",
  ];

  const onSubmit = async (values: SignUpFormData) => {
    if (!agreedTerms) {
      toast.error(
        "Please accept the Terms of Service & Privacy Policy to continue.",
      );
      return;
    }

    try {
      const { data } = await api.register(values);
      setSubmittedUser(data);
      signIn(data);
      router.replace(
        safeRedirectPath(new URLSearchParams(window.location.search).get("next")),
      );
      toast.success("Account created successfully", {
        description: `Welcome ${data.firstName}!`,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while signing up. Please try again later.";
      setError("root", { message });
      toast.error("Sign up failed", { description: message });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#faf9f6] text-[#18251f]">
      {/* Left visual banner (hidden on small screens) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#18372b] p-12 text-white lg:flex xl:p-16">
        <img
          src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1600&q=80"
          alt="Coastal cliffs and serene ocean"
          className="absolute inset-0 size-full object-cover opacity-30"
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
                  AI-powered day plans crafted to your budget, pace, and
                  interests.
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
                  Weigh weather, budgets, and crowds side-by-side before
                  booking.
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
            <div className="mt-8 rounded-2xl border border-[#dfe2dc] bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-[#18372b]/10 text-[#18372b]">
                <CheckCircle2 className="size-6 text-[#18372b]" />
              </div>
              <h3 className="text-xl font-bold text-[#18372b]">
                Account Created!
              </h3>
              <p className="mt-2 text-sm text-[#657069]">
                Welcome aboard,{" "}
                <strong className="text-[#18372b]">
                  {submittedUser.firstName}
                </strong>
                ! Your adventure begins now.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/ai/planner"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#18372b] py-3 text-sm font-semibold text-white transition hover:bg-[#285441]"
                >
                  Plan Your First Trip{" "}
                  <Sparkles className="size-4 text-[#e8a83e]" />
                </Link>
                <Link
                  href="/destinations"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#dfe2dc] bg-white py-3 text-sm font-semibold text-[#18372b] transition hover:border-[#e8a83e]"
                >
                  Browse Destinations <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              {/* Social Signup */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => window.location.assign(api.oauthUrl("google"))}
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
                  onClick={() => window.location.assign(api.oauthUrl("github"))}
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
                  or register with email
                </span>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-3.5"
                noValidate
              >
                {errors.root && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {errors.root.message}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#18372b]"
                  >
                    First Name
                  </label>
                  <div className="relative mt-1.5">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#657069]" />
                    <input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      placeholder="Alex"
                      className="w-full rounded-xl border border-[#dfe2dc] bg-white py-3 pl-10 pr-4 text-sm text-[#18251f] placeholder:text-[#657069]/60 focus:border-[#e8a83e] focus:outline-none focus:ring-2 focus:ring-[#e8a83e]/20"
                      {...register("firstName")}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#18372b]"
                  >
                    Last Name
                  </label>
                  <div className="relative mt-1.5">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#657069]" />
                    <input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      placeholder="Morgan"
                      className="w-full rounded-xl border border-[#dfe2dc] bg-white py-3 pl-10 pr-4 text-sm text-[#18251f] placeholder:text-[#657069]/60 focus:border-[#e8a83e] focus:outline-none focus:ring-2 focus:ring-[#e8a83e]/20"
                      {...register("lastName")}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="username"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#18372b]"
                  >
                    Username
                  </label>
                  <div className="relative mt-1.5">
                    <AtSign className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#657069]" />
                    <input
                      id="username"
                      type="text"
                      autoComplete="username"
                      placeholder="alexmorgan"
                      className="w-full rounded-xl border border-[#dfe2dc] bg-white py-3 pl-10 pr-4 text-sm text-[#18251f] placeholder:text-[#657069]/60 focus:border-[#e8a83e] focus:outline-none focus:ring-2 focus:ring-[#e8a83e]/20"
                      {...register("username")}
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.username.message}
                    </p>
                  )}
                </div>

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
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#18372b]"
                  >
                    Create Password
                  </label>
                  <div className="relative mt-1.5">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#657069]" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
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

                  {/* Password strength visual */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1.5">
                        {[0, 1, 2, 3].map((step) => (
                          <div
                            key={step}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              strength > step
                                ? strengthColors[strength]
                                : "bg-[#dfe2dc]"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#657069]">
                        <span>Strength: {strengthLabels[strength]}</span>
                        <span>Min 8 chars, 1 number, 1 special</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-1">
                  <label className="flex cursor-pointer items-start gap-2.5 text-xs text-[#657069]">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 size-4 rounded border-[#dfe2dc] text-[#18372b] accent-[#18372b] focus:ring-[#e8a83e]"
                    />
                    <span>
                      I agree to Destino&apos;s{" "}
                      <span className="font-medium text-[#18372b] underline">
                        Terms of Service
                      </span>{" "}
                      and{" "}
                      <span className="font-medium text-[#18372b] underline">
                        Privacy Policy
                      </span>
                      .
                    </span>
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
                      Creating account...
                    </span>
                  ) : (
                    <>
                      Create Free Account <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
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
          © {new Date().getFullYear()} Destino Travel Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
}
