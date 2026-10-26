import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

type ContinentsHeaderProps = {
  backHref: string;
  backLabel: string;
};

export function ContinentsHeader({
  backHref,
  backLabel,
}: ContinentsHeaderProps) {
  return (
    <header className="bg-cream">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-page items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-10"
      >
        <Link
          href="/"
          className="rounded-sm text-xl font-semibold tracking-tight text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Destino
        </Link>
        <Link
          href={backHref}
          className={buttonVariants({
            variant: "link",
            size: "sm",
            className: "gap-2",
          })}
        >
          <ArrowLeft aria-hidden="true" />
          {backLabel}
        </Link>
      </nav>
    </header>
  );
}
