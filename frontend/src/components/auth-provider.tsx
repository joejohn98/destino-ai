"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { api, ApiError, type AuthUser } from "@/lib/api";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  /** Store the user returned by login/register without another request. */
  signIn: (user: AuthUser) => void;
  /** Re-read the session cookie, e.g. after OAuth redirect. */
  refresh: () => Promise<AuthUser | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data } = await api.getProfile();
    return data;
  } catch (error) {
    // 401 means no active session; log other unexpected failures
    if (!(error instanceof ApiError && error.statusCode === 401)) {
      console.error("Failed to load current user:", error);
    }
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derived state — eliminates desynchronization
  const status: AuthStatus = isLoading
    ? "loading"
    : user
      ? "authenticated"
      : "unauthenticated";

  const refresh = useCallback(async () => {
    const nextUser = await loadCurrentUser();
    setUser(nextUser);
    setIsLoading(false);
    return nextUser;
  }, []);

  useEffect(() => {
    let cancelled = false;
    void loadCurrentUser().then((nextUser) => {
      if (!cancelled) {
        setUser(nextUser);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        signIn: setUser,
        refresh,
        signOut,
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
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.startsWith("/\\")
  ) {
    return "/";
  }
  return next;
}
