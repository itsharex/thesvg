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

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q");
  const category = searchParams.get("category");
  const rawLimit = searchParams.get("limit");
  const limit = Math.min(
    rawLimit ? parseInt(rawLimit, 10) || DEFAULT_LIMIT : DEFAULT_LIMIT,
    MAX_LIMIT
  );

  let icons = category ? getIconsByCategory(category) : getAllIcons();

  if (query) {
    icons = searchIcons(icons, query);
  }

  const total = icons.length;
  const sliced = icons.slice(0, limit);

  const index = sliced.map((icon) => ({
    slug: icon.slug,
    title: icon.title,
    categories: icon.categories,
    variants: Object.keys(icon.variants).filter(
      (key) => icon.variants[key as keyof typeof icon.variants]
    ),
  }));

  return NextResponse.json(
    { total, count: index.length, limit, icons: index },
    { status: 200, headers: { ...CORS_HEADERS, ...CACHE_HEADERS } }
  );
}
