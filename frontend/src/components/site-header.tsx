import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface SiteHeaderProps {
  backHref?: string;
  backLabel?: string;
  activePath?: string;
}

const navigation = [
  { label: "Destinations", href: "/destinations" },
  { label: "Continents", href: "/continents" },
  { label: "Plan a trip", href: "/ai/plan-itinerary" },
  { label: "Compare", href: "/ai/compare" },
] as const;

export function SiteHeader({ backHref, backLabel }: SiteHeaderProps) {
  return (
    <header className="bg-cream">
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-10">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            aria-label="Destino AI home"
            className="rounded-sm text-xl font-semibold tracking-tight text-ink transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Destino AI
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-6 sm:flex"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-sm text-sm font-medium text-ink transition-colors hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {backHref ? (
            <Link
              href={backHref}
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "gap-2 rounded-full",
              })}
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              {backLabel || "Back"}
            </Link>
          ) : (
            <nav
              aria-label="Mobile navigation"
              className="flex items-center gap-4 sm:hidden"
            >
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-sm text-sm font-medium text-ink transition-colors hover:text-muted-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          <nav
            aria-label="Account navigation"
            className="hidden items-center gap-2 sm:flex"
          >
            <Link
              href="/signin"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "rounded-full",
              })}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className={buttonVariants({
                size: "sm",
                className: "rounded-full",
              })}
            >
              Sign up
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
