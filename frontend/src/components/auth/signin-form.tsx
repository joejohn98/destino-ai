"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { signInSchema, type SignInFormData } from "@/schemas/auth.schema";
import { api, type AuthUser } from "@/lib/api";
import { safeRedirectPath, useAuth } from "@/components/auth-provider";
import { OAuthButtons } from "./oauth-buttons";

export function SignInForm({
  onSuccess,
}: {
  onSuccess: (user: AuthUser) => void;
}) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    handleSubmit,
    register,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (values: SignInFormData) => {
    try {
      const { data } = await api.login(values);
      onSuccess(data);
      signIn(data);
      router.replace(
        safeRedirectPath(new URLSearchParams(window.location.search).get("next")),
      );
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
    <div className="mt-8 space-y-6">
      <OAuthButtons dividerLabel="or sign in with email" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wider text-[#18372b]"
          >
            Password
          </label>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#657069]" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#dfe2dc] bg-white py-3 pl-10 pr-11 text-sm text-[#18251f] placeholder:text-[#657069]/60 focus:border-[#e8a83e] focus:outline-none focus:ring-2 focus:ring-[#e8a83e]/20"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#657069] transition hover:text-[#18372b]"
              aria-label={showPassword ? "Hide password" : "Show password"}
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
          <label className="flex cursor-pointer items-center gap-2 text-xs text-[#657069]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-4 rounded border-[#dfe2dc] text-[#18372b] accent-[#18372b] focus:ring-[#e8a83e]"
            />
            Remember me for 30 days
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
              Sign In to Destino <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

