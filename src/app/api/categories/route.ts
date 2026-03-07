import { NextResponse } from "next/server";
import { getAllCategories, getIconsByCategory } from "@/lib/icons";

export async function GET() {
  const categories = getAllCategories();

  const result = categories.map((name) => ({
    name,
    count: getIconsByCategory(name).length,
  }));

  return NextResponse.json({ categories: result });
}
