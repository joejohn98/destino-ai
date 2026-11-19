import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { tag?: string };
    const tag = body?.tag ?? "destinations";

    revalidateTag(tag, { expire: 0 });
    if (tag === "destinations") {
      revalidateTag("featured-destinations", { expire: 0 });
      revalidateTag("continents", { expire: 0 });
      revalidateTag("continent-stats", { expire: 0 });
    } else if (tag === "continent-stats" || tag === "continents") {
      revalidateTag("continents", { expire: 0 });
      revalidateTag("continent-stats", { expire: 0 });
    }

    return NextResponse.json({ revalidated: true, tag, now: Date.now() });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to revalidate cache",
      },
      { status: 500 },
    );
  }
}
