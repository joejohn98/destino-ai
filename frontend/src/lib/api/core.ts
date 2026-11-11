import type { Destination } from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? "http://localhost:5000"
    : "http://127.0.0.1:5000");

export function destinationHref(
  destination: Destination,
  countrySlug = destination.location?.countrySlug,
  continentSlug = destination.continentSlug ||
    (destination.continent
      ? destination.continent.toLowerCase().replace(/\s+/g, "-")
      : undefined),
): string {
  if (continentSlug && countrySlug && destination.slug) {
    return `/continents/${encodeURIComponent(continentSlug)}/countries/${encodeURIComponent(countrySlug)}/${encodeURIComponent(destination.slug)}`;
  }
  return "/destinations";
}

const nextOptimizedImageHosts = new Set([
  "images.unsplash.com",
  "i.postimg.cc",
  "hebbkx1anhila5yf.public.blob.vercel-storage.com",
  "res.cloudinary.com",
]);

/** Bypass Next's image proxy for administrator-supplied hosts. */
export function shouldBypassImageOptimization(source: string): boolean {
  try {
    const url = new URL(source);
    return (
      url.protocol !== "https:" ||
      url.port !== "" ||
      !nextOptimizedImageHosts.has(url.hostname)
    );
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly payload: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Fetch helper with error handling
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  try {
    // Multipart payloads must let the browser set the boundary + Content-Type.
    // Only inject the JSON header for non-FormData bodies.
    const isFormData = options?.body instanceof FormData;

    const res = await fetch(url, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options?.headers,
      },
      cache: "no-store", // Ensure we don't cache API responses
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      throw new ApiError(
        errorBody?.message ||
          `API error: ${res.status} ${res.statusText} at ${endpoint}`,
        res.status,
        errorBody,
      );
    }

    return (await res.json()) as T;
  } catch (error) {
    // A 4xx response is a handled API outcome (for example, an invalid
    // comparison request), not a network failure. Keep the payload available
    // to the page without reporting it as an unexpected fetch error.
    if (!(error instanceof ApiError) || error.statusCode >= 500) {
      console.error(`Fetch failure at ${url}:`, error);
    }
    throw error;
  }
}

