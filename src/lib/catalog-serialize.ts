import type { ProductCardItem } from "@/lib/data";

export type SerializedProductCard = Omit<ProductCardItem, "price" | "oldPrice"> & {
  price: string;
  oldPrice: string | null;
};

export function serializeProductCard(product: ProductCardItem): SerializedProductCard {
  return {
    ...product,
    price: product.price.toString(),
    oldPrice: product.oldPrice?.toString() ?? null,
  };
}
