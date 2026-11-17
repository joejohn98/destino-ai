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

const AUTH_STORAGE_KEY = "destino_auth_user";
const AUTH_TIMESTAMP_KEY = "destino_auth_timestamp";

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

function getCachedUser(): { user: AuthUser | null; isFresh: boolean } {
  if (typeof window === "undefined") return { user: null, isFresh: false };
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    const timestamp = sessionStorage.getItem(AUTH_TIMESTAMP_KEY);
    if (raw) {
      const cached = JSON.parse(raw) as AuthUser;
      if (cached && typeof cached === "object" && cached._id) {
        const age = timestamp ? Date.now() - Number(timestamp) : Infinity;
        return { user: cached, isFresh: age < 120_000 };
      }
    }
  } catch {
    // Ignore sessionStorage parsing or access issues
  }
  return { user: null, isFresh: false };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getCachedUser().user);
  const [isLoading, setIsLoading] = useState(() => !getCachedUser().user);

  // Derived state — eliminates desynchronization
  const status: AuthStatus = isLoading
    ? "loading"
    : user
      ? "authenticated"
      : "unauthenticated";

  const persistUser = useCallback((nextUser: AuthUser | null) => {
    try {
      if (nextUser) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
        sessionStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
      } else {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        sessionStorage.removeItem(AUTH_TIMESTAMP_KEY);
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  const signIn = useCallback(
    (newUser: AuthUser) => {
      setUser(newUser);
      setIsLoading(false);
      persistUser(newUser);
    },
    [persistUser],
  );

  const refresh = useCallback(async () => {
    const nextUser = await loadCurrentUser();
    setUser(nextUser);
    setIsLoading(false);
    persistUser(nextUser);
    return nextUser;
  }, [persistUser]);

  useEffect(() => {
    let cancelled = false;

    const { isFresh } = getCachedUser();
    if (isFresh) {
      return;
    }

    void loadCurrentUser().then((nextUser) => {
      if (!cancelled) {
        setUser(nextUser);
        setIsLoading(false);
        persistUser(nextUser);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [persistUser]);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      persistUser(null);
    }
  }, [persistUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        signIn,
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
