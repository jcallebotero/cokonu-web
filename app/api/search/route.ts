import { searchCatalog } from "@/lib/catalog";

/**
 * Live search endpoint for the header dropdown.
 * GET /api/search?q=<keyword> → { total, items } where `items` is capped to the
 * preview count and `total` is the true number of matches.
 */
const PREVIEW_LIMIT = 4;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  const matches = await searchCatalog(q);
  return Response.json({
    total: matches.length,
    items: matches.slice(0, PREVIEW_LIMIT),
  });
}
