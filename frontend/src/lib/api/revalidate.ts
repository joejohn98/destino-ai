/**
 * Helper to trigger Next.js cache revalidation from client-side admin actions.
 * Clears in-memory Cache Components tagged entries to keep frontend in sync
 * with backend Redis and database updates.
 */
export async function triggerRevalidation(tag = "destinations"): Promise<void> {
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag }),
    });
  } catch (error) {
    console.warn("Next.js cache revalidation trigger failed:", error);
  }
}
