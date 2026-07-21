import Link from "next/link";
import { ProductCardCart } from "@/components/product-card-cart";
import { ProductImage } from "@/components/product-image";
import type { ProductCardItem } from "@/lib/data";
import type { SerializedProductCard } from "@/lib/catalog-serialize";
import { formatPrice, hasDiscount } from "@/lib/format";
import { normalizeImageSrc } from "@/lib/image-url";

export function ProductCard({
  product,
  compact = false,
}: {
  product: ProductCardItem | SerializedProductCard;
  compact?: boolean;
}) {
  const image = normalizeImageSrc(product.images[0]?.url ?? "/demo/pump-1.svg");
  const discount = hasDiscount(product.oldPrice, product.price);

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-petrol/10 ${
        compact ? "rounded-[24px]" : "rounded-[28px]"
      }`}
    >
      <Link href={`/product/${product.slug}`} scroll className={`relative block bg-background ${compact ? "p-3" : "p-4"}`}>
        <div className={`absolute z-10 flex flex-col gap-2 ${compact ? "left-4 top-4" : "left-6 top-6"}`}>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${product.inStock ? "bg-lime text-white" : "bg-white text-muted"}`}>
            {product.inStock ? "В наличии" : "Под заказ"}
          </span>
          {discount ? <span className="rounded-full bg-sale px-3 py-1 text-xs font-bold text-white">Скидка</span> : null}
        </div>
        <div className="relative aspect-square overflow-hidden rounded-[22px]">
          <ProductImage
            src={image}
            alt={product.images[0]?.alt ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className={`flex flex-1 flex-col ${compact ? "space-y-3 p-4" : "space-y-4 p-5"}`}>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted sm:tracking-[0.2em]">
            {product.brand?.slug ? (
              <Link
                href={`/catalog?brand=${product.brand.slug}`}
                className="min-w-0 truncate transition-colors hover:text-petrol"
              >
                {product.brand.name}
              </Link>
            ) : (
              <span className="min-w-0 truncate">{product.brand?.name ?? "UralTrade"}</span>
            )}
            <span className="shrink-0 truncate">{product.sku}</span>
          </div>
          <Link
            href={`/product/${product.slug}`}
            scroll
            className={`block font-bold text-graphite transition-colors hover:text-petrol ${compact ? "text-base" : "text-base sm:text-lg"}`}
          >
            {product.name}
          </Link>
        </div>
        <div className="mt-auto flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-black text-petrol sm:text-xl">{formatPrice(product.price)}</div>
            {discount ? <div className="text-sm text-sale line-through">{formatPrice(product.oldPrice!)}</div> : null}
          </div>
          <ProductCardCart productId={product.id} productName={product.name} />
        </div>
      </div>
    </article>
  );
}
