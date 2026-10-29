import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const footerLinks = [
  { label: "Destinations", href: "/destinations" },
  { label: "Continents", href: "/continents" },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto bg-primary text-primary-foreground">
      <div className="mx-auto max-w-page px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/"
              className="rounded-sm text-xl font-semibold tracking-tight text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              Destino AI
            </Link>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/90">
              Explore verified destinations, discover authentic sights, and shape your next journey.
            </p>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3">
            {footerLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-sm text-sm font-medium text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <Separator className="my-8 bg-ink/20" />
        <div className="flex flex-col items-start justify-between gap-4 text-xs font-medium text-ink sm:flex-row sm:items-center">
          <p>© 2026 Destino AI. Database-grounded travel platform.</p>
          <p>Curated destinations across 5 continents.</p>
        </div>
      </div>
    </footer>
  );
}
