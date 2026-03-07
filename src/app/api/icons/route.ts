import { NextRequest, NextResponse } from "next/server";
import { getAllIcons, getIconsByCategory } from "@/lib/icons";
import { searchIcons } from "@/lib/search";

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

  return NextResponse.json({
    total,
    offset,
    limit,
    icons: paginated,
  });
}
