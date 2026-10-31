import { AdminCountryDestinations } from "@/components/admin/country-destinations";

export default async function AdminCountryDestinationsPage({
  params,
}: {
  params: Promise<{ slug: string; countrySlug: string }>;
}) {
  const { slug: continentSlug, countrySlug } = await params;
  return (
    <AdminCountryDestinations
      continentSlug={continentSlug}
      countrySlug={countrySlug}
    />
  );
}
