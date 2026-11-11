import { User, AtSign } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { SignUpFormData } from "@/schemas/auth.schema";

export function SignUpUserFields({
  register,
  errors,
}: {
  register: UseFormRegister<SignUpFormData>;
  errors: FieldErrors<SignUpFormData>;
}) {
  return (
    <>
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
    </>
  );
}

