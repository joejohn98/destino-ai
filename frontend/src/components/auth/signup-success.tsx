import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import type { AuthUser } from "@/lib/api";

export function SignUpSuccess({ user }: { user: AuthUser }) {
  return (
    <div className="mt-8 rounded-2xl border border-[#dfe2dc] bg-white p-8 text-center shadow-xs">
      <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-[#18372b]/10 text-[#18372b]">
        <CheckCircle2 className="size-6 text-[#18372b]" />
      </div>
      <h3 className="text-xl font-bold text-[#18372b]">
        Account Created!
      </h3>
      <p className="mt-2 text-sm text-[#657069]">
        Welcome aboard,{" "}
        <strong className="text-[#18372b]">{user.firstName}</strong>! Your
        adventure begins now.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/ai/plan-itinerary"
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
  );
}

