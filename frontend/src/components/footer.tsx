import Link from "next/link";
import { ArrowUpRight, Compass, Globe, Sparkles } from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
  isExternal?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
  {
    title: "Discover",
    links: [
      { label: "All Destinations", href: "/destinations" },
      { label: "Explore Continents", href: "/continents" },
      { label: "Popular Sights", href: "/destinations" },
      { label: "Search & Filters", href: "/destinations" },
    ],
  },
  {
    title: "AI Trip Tools",
    links: [
      { label: "Plan an Itinerary", href: "/ai/plan-itinerary" },
      { label: "Compare Destinations", href: "/ai/compare" },
      { label: "Budget Estimates", href: "/ai/plan-itinerary" },
      { label: "Grounded Travel Tips", href: "/destinations" },
    ],
  },
  {
    title: "Continents",
    links: [
      { label: "Europe", href: "/continents/europe" },
      { label: "Asia", href: "/continents/asia" },
      { label: "North America", href: "/continents/north-america" },
      { label: "Africa", href: "/continents/africa" },
      { label: "Oceania", href: "/continents/oceania" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Destino", href: "#about" },
      { label: "Contact Us", href: "#contact" },
      { label: "Help Center", href: "#help" },
      { label: "Careers", href: "#careers" },
      { label: "Press & Media", href: "#press" },
    ],
  },
  {
    title: "Traveler & Legal",
    links: [
      { label: "Saved Favorites", href: "/favorites" },
      { label: "Traveler Profile", href: "/profile" },
      { label: "Terms & Conditions", href: "#terms" },
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Cookie Settings", href: "#cookies" },
    ],
  },
];

const helpLinks: FooterLink[] = [
  { label: "Contact Us", href: "#contact" },
  { label: "Help Center", href: "#help" },
  { label: "System Status", href: "#status" },
  { label: "Feedback", href: "#feedback" },
];

const legalLinks: FooterLink[] = [
  { label: "Terms and Conditions", href: "#terms" },
  { label: "Privacy Policy", href: "#privacy" },
  { label: "Cookie Policy", href: "#cookies" },
  { label: "Contact Us", href: "#contact" },
  { label: "AI Safety & Grounding", href: "#ai-safety" },
  { label: "Accessibility", href: "#accessibility" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      aria-label="Site Footer"
      className="mt-auto bg-primary text-primary-foreground"
    >
      <div className="mx-auto max-w-page px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
        {/* Top bar: Assistance prompt, contact / help links, social & locale */}
        <div className="flex flex-col gap-6 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="text-base font-semibold tracking-tight text-ink sm:text-lg">
              How can we help?
            </span>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {helpLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-medium text-ink underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Social channels */}
            <div className="flex items-center gap-2" aria-label="Social links">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Destino AI on GitHub"
                className="inline-flex size-9 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors hover:border-ink hover:bg-ink/10 focus-visible:rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <svg
                  className="size-4 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Destino AI on X (Twitter)"
                className="inline-flex size-9 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors hover:border-ink hover:bg-ink/10 focus-visible:rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <svg
                  className="size-3.5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>

            {/* Locale pill */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-ink/25 bg-primary px-3 py-1.5 text-xs font-semibold text-ink">
              <Globe className="size-3.5 text-ink" aria-hidden="true" />
              <span>English</span>
              <span className="text-ink/60" aria-hidden="true">
                •
              </span>
              <span>USD ($)</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-ink/15" />

        {/* Main section: Brand story + Navigation columns */}
        <div className="grid gap-12 pt-10 sm:pt-12 lg:grid-cols-[minmax(0,1.2fr)_repeat(5,minmax(0,1fr))] lg:gap-8 xl:gap-10">
          {/* Brand info */}
          <div className="max-w-md lg:pr-2">
            <Link
              href="/"
              className="inline-block rounded-sm text-2xl font-semibold tracking-tight text-ink transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              Destino AI
            </Link>

            <p className="mt-3 text-sm leading-relaxed text-ink/85">
              Intelligent, database-grounded trip planning and destination discovery.
              Explore verified sights, transparent day-by-day itineraries, and realistic
              budget estimates without AI hallucinations.
            </p>

            {/* AI Grounding indicator pill */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-ink/20 bg-ink/5 px-3.5 py-1.5 text-xs font-medium text-ink">
              <Sparkles
                className="size-3.5 text-ink"
                aria-hidden="true"
                strokeWidth={1.75}
              />
              <span>Grounded in MongoDB travel data</span>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-ink/80">
              <Compass className="size-3.5 text-ink" aria-hidden="true" />
              <span>Covering 5 continents and verified sights</span>
            </div>
          </div>

          {/* Navigation columns */}
          {footerColumns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink">
                {col.title}
              </h2>
              <ul className="mt-4 flex flex-col items-start gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-ink underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    >
                      {link.label}
                      {link.isExternal && (
                        <ArrowUpRight
                          className="size-3 opacity-70"
                          aria-hidden="true"
                        />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-ink/15 sm:mt-14" />

        {/* Ethical Grounding Note */}
        <div className="pt-6 sm:pt-8">
          <p className="max-w-4xl text-xs leading-relaxed text-ink/75">
            <strong>Database Grounding:</strong> Destino AI generates day-by-day itineraries
            and destination comparisons strictly using verified destination records, curated
            attractions, and genuine traveler reviews. All budget figures, costs, and travel
            durations are realistic estimates meant for planning guidance.
          </p>
        </div>

        {/* Bottom bar: Copyright & legal links */}
        <div className="mt-6 flex flex-col items-start justify-between gap-4 text-xs font-medium text-ink sm:flex-row sm:items-center">
          <p>© {currentYear} Destino AI. Built for authentic, unhurried journeys.</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legalLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
