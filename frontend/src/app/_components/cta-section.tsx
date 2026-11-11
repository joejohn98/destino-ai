import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-10">
      <div className="mx-auto flex max-w-page flex-col items-start gap-6 rounded-marketing bg-ink px-6 py-12 text-white sm:px-10 sm:py-16 lg:flex-row lg:items-center lg:justify-between lg:px-16">
        <div>
          <p className="mb-3 text-eyebrow font-medium uppercase text-white/70">
            Your next trip is out there
          </p>
          <h2 className="max-w-2xl text-headline font-semibold text-white">
            Start with a place. See where it takes you.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-white/80">
            Browse our collection of verified historical, coastal, mountain, and city destinations.
          </p>
        </div>
        <Link
          href="/destinations"
          className={buttonVariants({ size: "pill" })}
        >
          Find a destination
          <ArrowRight data-icon="inline-end" />
        </Link>
      </div>
    </section>
  );
}

