export const MAX_IMAGE_URL_LENGTH = 2000;

/** Returns the trimmed URL string, or an empty string when input is empty. */
export function formatImageUrl(value: string): string {
  return value.trim();
}

/** Validates a user-supplied image URL. Returns an error message, or null if valid. */
export function validateImageUrl(value: string): string | null {
  const url = formatImageUrl(value);
  if (!url) return null;
  if (url.length > MAX_IMAGE_URL_LENGTH)
    return `URL must be at most ${MAX_IMAGE_URL_LENGTH} characters`;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return "Image URL must start with http:// or https://";
    }
    if (!parsed.hostname) return "Image URL must be a valid web address";
    if (/\.(?:jpe?g|png|gif|webp|avif|bmp)$/i.test(parsed.pathname)) {
      return null;
    }
    // No recognisable image extension — only reject clearly non-image hosts.
    const host = parsed.hostname.toLowerCase();
    if (
      host === "example.com" ||
      host.endsWith(".example.com") ||
      host.endsWith(".test")
    ) {
      return "Image URL must point to an image host";
    }
    return null;
  } catch {
    return "Enter a valid image URL (e.g. https://…/photo.jpg)";
  }
}

