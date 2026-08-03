import type { ProductCardItem } from "@/lib/data";

export type SerializedProductCard = Omit<ProductCardItem, "price" | "oldPrice"> & {
  price: string;
  oldPrice: string | null;
};

/** Минимум, который нужен карточке товара: подходит и для серверных данных, и для ответа API. */
export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: string | number | { toString(): string };
  oldPrice: string | number | { toString(): string } | null;
  inStock: boolean;
  brand: { name: string; slug: string } | null;
  images: Array<{ url: string; alt: string | null }>;
};

export function serializeProductCard(product: ProductCardItem): SerializedProductCard {
  return {
    ...product,
    price: product.price.toString(),
    oldPrice: product.oldPrice?.toString() ?? null,
  };
}
