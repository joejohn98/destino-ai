import { redirect, notFound } from "next/navigation";
import { api } from "@/lib/api";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ country?: string | string[] }>;
};

export default async function DestinationSlugRedirect({
  params,
  searchParams,
}: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  // Support legacy ?country= query param by redirecting to canonical nested path
  const countryParam = Array.isArray(query.country) ? query.country[0] : query.country;
  if (countryParam) {
    redirect(
      `/destinations/${encodeURIComponent(countryParam)}/${encodeURIComponent(slug)}`,
    );
  }

  // 1. Check if slug matches a Country in canonical hierarchy
  try {
    const countryRes = await api.getCountryDestinations(slug);
    const country = countryRes?.data?.country;
    if (country?.continentSlug && country?.slug) {
      redirect(
        `/continents/${encodeURIComponent(country.continentSlug)}/countries/${encodeURIComponent(country.slug)}`,
      );
    }
  } catch {
    // not a country, proceed to destination check
  }

  // 2. Check if slug matches a Destination
  try {
    const res = await api.getDestinationByNameOrSlug(slug);
    const destination = res?.data;
    if (destination?.location?.countrySlug && destination?.slug) {
      const continentSlug =
        destination.continentSlug ||
        (destination.continent
          ? destination.continent.toLowerCase().replace(/\s+/g, "-")
          : null);
      if (continentSlug) {
        redirect(
          `/continents/${encodeURIComponent(continentSlug)}/countries/${encodeURIComponent(destination.location.countrySlug)}/${encodeURIComponent(destination.slug)}`,
        );
      }
      redirect(
        `/destinations/${encodeURIComponent(destination.location.countrySlug)}/${encodeURIComponent(destination.slug)}`,
      );
    }
  } catch {
    // fall through to 404
  }

  notFound();
}
