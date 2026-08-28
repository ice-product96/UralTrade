import Link from "next/link";
import { ProductCardActions } from "@/components/product-list-buttons";
import { ProductCardCart } from "@/components/product-card-cart";
import { ProductImage } from "@/components/product-image";
import type { ProductCardData } from "@/lib/catalog-serialize";
import { formatPrice, hasDiscount } from "@/lib/format";
import { normalizeImageSrc } from "@/lib/image-url";

export function ProductCard({ product, compact = false }: { product: ProductCardData; compact?: boolean }) {
  const image = normalizeImageSrc(product.images[0]?.url ?? "/demo/pump-1.svg");
  const discount = hasDiscount(product.oldPrice, product.price);

  return (
    <article
      className={`group flex h-full min-w-0 flex-col overflow-hidden border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-petrol/10 ${
        compact ? "rounded-[24px]" : "rounded-[20px] sm:rounded-[28px]"
      }`}
    >
      <div className="relative">
        <Link href={`/product/${product.slug}`} scroll className={`relative block bg-background ${compact ? "p-3" : "p-3 sm:p-4"}`}>
          <div className={`absolute z-10 flex max-w-[58%] flex-col gap-1 sm:max-w-none sm:gap-2 ${compact ? "left-4 top-4" : "left-3 top-3 sm:left-6 sm:top-6"}`}>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold leading-tight sm:px-3 sm:py-1 sm:text-xs ${product.inStock ? "bg-lime text-white" : "bg-white text-muted"}`}>
              {product.inStock ? "В наличии" : "Под заказ"}
            </span>
            {discount ? <span className="rounded-full bg-sale px-2 py-0.5 text-[10px] font-bold leading-tight text-white sm:px-3 sm:py-1 sm:text-xs">Скидка</span> : null}
          </div>
          <div className="relative aspect-square overflow-hidden rounded-[16px] sm:rounded-[22px]">
            <ProductImage
              src={image}
              alt={product.images[0]?.alt ?? product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </Link>
        <ProductCardActions productId={product.id} compact={compact} className={`absolute z-20 ${compact ? "right-4 top-4" : "right-3 top-3 sm:right-6 sm:top-6"}`} />
      </div>
      <div className={`flex min-w-0 flex-1 flex-col ${compact ? "space-y-3 p-4" : "space-y-2 p-3 sm:space-y-4 sm:p-5"}`}>
        <div className="min-w-0 space-y-1.5 sm:space-y-2">
          <div className="flex min-w-0 items-center justify-between gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted sm:gap-2 sm:text-xs sm:tracking-[0.16em] lg:tracking-[0.2em]">
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
            className={`block w-full min-w-0 break-words font-bold leading-snug text-graphite transition-colors hover:text-petrol ${compact ? "text-base" : "text-sm sm:text-base lg:text-lg"}`}
          >
            {product.name}
          </Link>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="min-w-0">
            <div className="text-base font-black text-petrol sm:text-lg lg:text-xl">{formatPrice(product.price)}</div>
            {discount ? <div className="text-xs text-sale line-through sm:text-sm">{formatPrice(product.oldPrice!)}</div> : null}
          </div>
          <ProductCardCart productId={product.id} productName={product.name} compact={compact} />
        </div>
      </div>
    </article>
  );
}
