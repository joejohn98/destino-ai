import { redirect, notFound } from "next/navigation";
import { api } from "@/lib/api";

type DestinationDetailPageProps = {
  params: Promise<{ slug: string; destinationSlug: string }>;
};

export default async function LegacyDestinationRedirectPage({
  params,
}: DestinationDetailPageProps) {
  const { slug: countrySlug, destinationSlug } = await params;

  let destination = null;
  try {
    const res = await api.getCanonicalDestination(countrySlug, destinationSlug);
    destination = res?.data;
  } catch {
    // not found
  }

  if (!destination) {
    notFound();
  }

  const continentSlug =
    destination.continentSlug ||
    (destination.continent
      ? destination.continent.toLowerCase().replace(/\s+/g, "-")
      : "unknown");

  redirect(
    `/continents/${encodeURIComponent(continentSlug)}/countries/${encodeURIComponent(countrySlug)}/${encodeURIComponent(destinationSlug)}`,
  );
}
