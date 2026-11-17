import type { Metadata } from "next";
import { api, type ContinentStat, type Destination } from "@/lib/api";
import {
  ContinentsSection,
  CtaSection,
  FeaturedDestinationsSection,
  HomeHeroSection,
  HowItWorksSection,
} from "./_components";

// Always render with fresh backend data in production as well as in dev.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Destino AI — Discover & Plan Trips",
  description:
    "Explore verified destinations, discover authentic sights, and shape your next journey.",
};

export default async function Page() {
  let destinations: Destination[] = [];
  let continents: ContinentStat[] = [];
  let destinationsError: string | undefined;
  let continentsError: string | undefined;

  try {
    const destRes = await api.getDestinations({ limit: 6 });
    destinations = destRes.data || [];
  } catch (error) {
    console.error("Failed to load featured destinations:", error);
    destinationsError =
      "Unable to fetch featured destinations right now. Please check back later.";
  }

  try {
    const contRes = await api.getContinentStats();
    continents = contRes.data || [];
  } catch (error) {
    console.error("Failed to load continents:", error);
    continentsError =
      "Unable to fetch continents right now. Please check back later.";
  }

  const heroDestination = destinations[0];

  return (
    <div className="flex-1 bg-background text-foreground">
      <main className="flex-1">
        <HomeHeroSection heroDestination={heroDestination} />
        <FeaturedDestinationsSection
          destinations={destinations}
          error={destinationsError}
        />
        <HowItWorksSection />
        <ContinentsSection
          continents={continents}
          error={continentsError}
        />
        <CtaSection />
      </main>
    </div>
  );
}
