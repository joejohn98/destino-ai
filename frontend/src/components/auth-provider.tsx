"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { api, ApiError, type AuthUser } from "@/lib/api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  favoriteIds: ReadonlySet<string>;
  /** Store the user returned by login/register without another request. */
  signIn: (user: AuthUser) => void;
  /** Re-read the session cookie, e.g. after the OAuth redirect. */
  refresh: () => Promise<AuthUser | null>;
  signOut: () => Promise<void>;
  isFavorite: (destinationId: string) => boolean;
  /** Optimistically toggles a favorite; rolls back and rethrows on failure. */
  toggleFavorite: (destinationId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data } = await api.getProfile();
    return data;
  } catch (error) {
    // 401 just means there is no session; anything else is unexpected.
    if (!(error instanceof ApiError && error.statusCode === 401)) {
      console.error("Failed to load the current user:", error);
    }
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [favoriteIds, setFavoriteIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const applyUser = useCallback((nextUser: AuthUser | null) => {
    setUser(nextUser);
    setFavoriteIds(new Set(nextUser?.favoriteDestinations ?? []));
    setStatus(nextUser ? "authenticated" : "unauthenticated");
  }, []);

  const refresh = useCallback(async () => {
    const nextUser = await loadCurrentUser();
    applyUser(nextUser);
    return nextUser;
  }, [applyUser]);

  useEffect(() => {
    let cancelled = false;
    void loadCurrentUser().then((nextUser) => {
      if (!cancelled) applyUser(nextUser);
    });
    return () => {
      cancelled = true;
    };
  }, [applyUser]);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      applyUser(null);
    }
  }, [applyUser]);

  const isFavorite = useCallback(
    (destinationId: string) => favoriteIds.has(destinationId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (destinationId: string) => {
      const wasFavorite = favoriteIds.has(destinationId);
      const update = (add: boolean) =>
        setFavoriteIds((current) => {
          const next = new Set(current);
          if (add) next.add(destinationId);
          else next.delete(destinationId);
          return next;
        });

      update(!wasFavorite);
      try {
        const { data } = wasFavorite
          ? await api.removeFavorite(destinationId)
          : await api.addFavorite(destinationId);
        setFavoriteIds(new Set(data.favoriteDestinations));
        return !wasFavorite;
      } catch (error) {
        update(wasFavorite);
        if (error instanceof ApiError && error.statusCode === 401) {
          applyUser(null);
        }
        throw error;
      }
    },
    [favoriteIds, applyUser],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        favoriteIds,
        signIn: applyUser,
        refresh,
        signOut,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return context;
}

/**
 * Only allow same-origin relative paths as post-login targets, so a crafted
 * `?next=https://evil.example` link cannot redirect users off-site.
 */
export function safeRedirectPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return "/";
  }
  return next;
}
