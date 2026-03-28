import { NextRequest, NextResponse } from "next/server";
import { getIconBySlug } from "@/lib/icons";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const icon = getIconBySlug(slug);

  if (!icon) {
    return NextResponse.json(
      { error: "Icon not found" },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  return NextResponse.json(icon, {
    headers: { ...CORS_HEADERS, ...CACHE_HEADERS },
  });
}
