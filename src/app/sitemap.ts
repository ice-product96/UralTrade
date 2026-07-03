import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.brand.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  return [
    { url: siteUrl, lastModified: new Date(), priority: 1 },
    { url: `${siteUrl}/catalog`, lastModified: new Date(), priority: 0.9 },
    { url: `${siteUrl}/page/about`, lastModified: new Date(), priority: 0.5 },
    { url: `${siteUrl}/page/delivery`, lastModified: new Date(), priority: 0.5 },
    { url: `${siteUrl}/page/contacts`, lastModified: new Date(), priority: 0.5 },
    ...categories.map((category) => ({
      url: `${siteUrl}/catalog/${category.slug}`,
      lastModified: category.updatedAt,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/product/${product.slug}`,
      lastModified: product.updatedAt,
      priority: 0.7,
    })),
    ...brands.map((brand) => ({
      url: `${siteUrl}/catalog?brand=${brand.slug}`,
      lastModified: brand.updatedAt,
      priority: 0.45,
    })),
  ];
}
