"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

import { api } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

interface FavoritesContextValue {
  favoriteIds: ReadonlySet<string>;
  isFavorite: (destinationId: string) => boolean;
  /** Optimistically toggles a favorite; rolls back and rethrows on failure. */
  toggleFavorite: (destinationId: string) => Promise<boolean>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();

  // Track the base favorites list from the authenticated user
  const userFavorites =
    status === "authenticated" ? user?.favoriteDestinations : undefined;

  const [prevUserFavorites, setPrevUserFavorites] = useState(userFavorites);
  const [favoriteIds, setFavoriteIds] = useState<ReadonlySet<string>>(
    () => new Set(userFavorites ?? []),
  );

  // React-recommended pattern for syncing state when context/props change without an effect
  if (userFavorites !== prevUserFavorites) {
    setPrevUserFavorites(userFavorites);
    setFavoriteIds(new Set(userFavorites ?? []));
  }

  const isFavorite = useCallback(
    (destinationId: string) => favoriteIds.has(destinationId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (destinationId: string) => {
      const wasFavorite = favoriteIds.has(destinationId);

      // Optimistic update
      setFavoriteIds((current) => {
        const next = new Set(current);
        if (wasFavorite) next.delete(destinationId);
        else next.add(destinationId);
        return next;
      });

      try {
        const { data } = wasFavorite
          ? await api.removeFavorite(destinationId)
          : await api.addFavorite(destinationId);

        setFavoriteIds(new Set(data.favoriteDestinations));
        return !wasFavorite;
      } catch (error) {
        // Rollback on failure
        setFavoriteIds((current) => {
          const next = new Set(current);
          if (wasFavorite) next.add(destinationId);
          else next.delete(destinationId);
          return next;
        });
        throw error;
      }
    },
    [favoriteIds],
  );

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used inside <FavoritesProvider>.");
  }
  return context;
}
