import { AdminContinentCountries } from "@/components/admin/continent-countries";

export default async function AdminContinentCountriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <AdminContinentCountries slug={slug} />;
}
