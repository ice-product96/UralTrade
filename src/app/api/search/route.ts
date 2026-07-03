import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const products = await searchProducts(q);

  return NextResponse.json(
    products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: product.price.toString(),
      brand: product.brand?.name,
      image: product.images[0]?.url,
    })),
  );
}
