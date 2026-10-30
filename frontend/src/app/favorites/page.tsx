import type { Metadata } from "next";

import { FavoritesClient } from "@/app/favorites/_components/favorites-client";

export const metadata: Metadata = {
  title: "Your favorites",
  description: "Destinations you've saved for later.",
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
