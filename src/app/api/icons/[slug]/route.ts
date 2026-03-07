import { NextRequest, NextResponse } from "next/server";
import { getIconBySlug } from "@/lib/icons";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const icon = getIconBySlug(slug);

  if (!icon) {
    return NextResponse.json({ error: "Icon not found" }, { status: 404 });
  }

  return NextResponse.json(icon);
}
