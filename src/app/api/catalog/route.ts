import { NextResponse } from "next/server";
import { getCatalogData } from "@/lib/data";
import { serializeProductCard } from "@/lib/catalog-serialize";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") ?? undefined;

  const params: Record<string, string | string[]> = {};
  for (const [key, value] of searchParams.entries()) {
    if (key === "slug") continue;
    const existing = params[key];
    if (existing) {
      params[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    } else {
      params[key] = value;
    }
  }

  const data = await getCatalogData(slug || undefined, params);

  return NextResponse.json({
    products: data.products.map(serializeProductCard),
    page: data.page,
    pages: data.pages,
    total: data.total,
    perPage: data.perPage,
  });
}
