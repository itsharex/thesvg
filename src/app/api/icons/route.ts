import { NextRequest, NextResponse } from "next/server";
import { getAllIcons, getIconsByCategory } from "@/lib/icons";
import { searchIcons } from "@/lib/search";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q");
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "100", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  let icons = getAllIcons();

  if (category) {
    icons = getIconsByCategory(category);
  }

  if (query) {
    icons = searchIcons(icons, query);
  }

  const total = icons.length;
  const paginated = icons.slice(offset, offset + limit);

  return NextResponse.json(
    { total, offset, limit, icons: paginated },
    { headers: { ...CORS_HEADERS, ...CACHE_HEADERS } }
  );
}
