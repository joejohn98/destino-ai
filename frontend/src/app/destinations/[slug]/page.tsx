import { redirect, notFound } from "next/navigation";
import { api } from "@/lib/api";

// Legacy route: /destinations/:slug
// Tries to resolve the destination and redirect to the canonical nested URL
// /destinations/:countrySlug/:destinationSlug. Falls through to 404 if not found.
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ country?: string | string[] }>;
};

export default async function DestinationSlugRedirect({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  // Support legacy ?country= query param by redirecting to nested path
  const country = Array.isArray(query.country) ? query.country[0] : query.country;

  if (country) {
    redirect(`/destinations/${encodeURIComponent(country)}/${encodeURIComponent(slug)}`);
  }

  // No country provided: try to resolve slug and get the countrySlug from the response
  try {
    const res = await api.getDestinationByNameOrSlug(slug);
    const destination = res?.data;
    if (destination?.location?.countrySlug && destination?.slug) {
      redirect(
        `/destinations/${encodeURIComponent(destination.location.countrySlug)}/${encodeURIComponent(destination.slug)}`,
      );
    }
  } catch {
    // fall through to 404
  }

  notFound();
}
