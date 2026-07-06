import type { ProductWithDetails } from "@/lib/data";
import { getSiteUrl } from "@/lib/format";

export function productJsonLd(product: ProductWithDetails) {
  const siteUrl = getSiteUrl();
  const primaryImage = product.images[0]?.url ?? "/demo/pump-1.svg";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((image) => new URL(image.url, siteUrl).toString()),
    description: product.shortDescription,
    sku: product.sku,
    brand: product.brand
      ? {
          "@type": "Brand",
          name: product.brand.name,
          logo: product.brand.logoUrl ? new URL(product.brand.logoUrl, siteUrl).toString() : undefined,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      url: new URL(`/product/${product.slug}`, siteUrl).toString(),
      priceCurrency: "RUB",
      price: Number(product.price),
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    mainEntityOfPage: new URL(`/product/${product.slug}`, siteUrl).toString(),
    thumbnailUrl: new URL(primaryImage, siteUrl).toString(),
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; href: string }>) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.href, siteUrl).toString(),
    })),
  };
}

export function organizationJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "UralTrade",
    url: siteUrl,
    logo: new URL("/logo.png", siteUrl).toString(),
  };
}
