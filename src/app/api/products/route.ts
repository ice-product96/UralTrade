import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") ?? "").split(",").filter(Boolean);

  if (!ids.length) return NextResponse.json([]);

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { brand: true, images: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json(
    products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: product.price.toString(),
      oldPrice: product.oldPrice?.toString() ?? null,
      inStock: product.inStock,
      brand: product.brand ? { name: product.brand.name, slug: product.brand.slug } : null,
      images: product.images.map((image) => ({ url: image.url, alt: image.alt })),
      image: product.images[0]?.url,
    })),
  );
}
