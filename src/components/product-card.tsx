import Link from "next/link";
import { ProductCardActions } from "@/components/product-list-buttons";
import { ProductCardCart } from "@/components/product-card-cart";
import { ProductImage } from "@/components/product-image";
import type { ProductCardData } from "@/lib/catalog-serialize";
import { formatPrice, hasDiscount } from "@/lib/format";
import { normalizeImageSrc } from "@/lib/image-url";
import { cn } from "@/lib/utils";

export function ProductCard({ product, compact = false, mini = false }: { product: ProductCardData; compact?: boolean; mini?: boolean }) {
  const image = normalizeImageSrc(product.images[0]?.url ?? "/demo/pump-1.svg");
  const discount = hasDiscount(product.oldPrice, product.price);

  return (
    <article
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-petrol/10 max-sm:hover:translate-y-0 max-sm:hover:shadow-sm",
        compact
          ? mini
            ? "rounded-[12px] sm:rounded-[16px]"
            : "rounded-[18px] sm:rounded-[24px]"
          : "rounded-[18px] sm:rounded-[28px]",
      )}
    >
      <div className="relative">
        <Link
          href={`/product/${product.slug}`}
          scroll
          className={cn(
            "relative block bg-background",
            compact ? (mini ? "p-1.5 sm:p-2" : "p-2 sm:p-3") : "p-2 sm:p-4",
          )}
        >
          <div
            className={cn(
              "absolute z-10 flex flex-col gap-0.5 sm:max-w-none sm:gap-2",
              compact
                ? mini
                  ? "left-1.5 top-1.5 max-w-[54%] sm:left-2.5 sm:top-2.5"
                  : "left-2.5 top-2.5 max-w-[52%] sm:left-4 sm:top-4"
                : "left-2 top-2 max-w-[52%] sm:left-6 sm:top-6",
            )}
          >
            <span
              className={cn(
                "rounded-full font-bold leading-tight",
                compact
                  ? mini
                    ? "px-1.5 py-0.5 text-[8px] sm:px-2 sm:py-0.5 sm:text-[10px]"
                    : "px-2 py-0.5 text-[10px] sm:px-3 sm:py-1 sm:text-xs"
                  : "px-1.5 py-0.5 text-[9px] sm:px-3 sm:py-1 sm:text-xs",
                product.inStock ? "bg-lime text-white" : "bg-white text-muted",
              )}
            >
              {product.inStock ? "В наличии" : "Под заказ"}
            </span>
            {discount ? (
              <span
                className={cn(
                  "rounded-full bg-sale font-bold leading-tight text-white",
                  compact
                    ? mini
                      ? "px-1.5 py-0.5 text-[8px] sm:px-2 sm:py-0.5 sm:text-[10px]"
                      : "px-2 py-0.5 text-[10px] sm:px-3 sm:py-1 sm:text-xs"
                    : "px-1.5 py-0.5 text-[9px] sm:px-3 sm:py-1 sm:text-xs",
                )}
              >
                Скидка
              </span>
            ) : null}
          </div>
          <div
            className={cn(
              "relative aspect-square overflow-hidden",
              compact
                ? mini
                  ? "rounded-[8px] sm:rounded-[10px]"
                  : "rounded-[12px] sm:rounded-[16px]"
                : "rounded-[12px] sm:rounded-[22px]",
            )}
          >
            <ProductImage
              src={image}
              alt={product.images[0]?.alt ?? product.name}
              fill
              sizes={
                compact
                  ? "(min-width: 1280px) 20vw, (min-width: 640px) 47vw, 68vw"
                  : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 45vw"
              }
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </Link>
        <ProductCardActions
          productId={product.id}
          compact={compact}
          mini={mini}
          className={cn(
            "absolute z-20",
            compact
              ? mini
                ? "right-1.5 top-1.5 sm:right-2.5 sm:top-2.5"
                : "right-2.5 top-2.5 sm:right-4 sm:top-4"
              : "right-2 top-2 sm:right-6 sm:top-6",
          )}
        />
      </div>
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          compact
            ? mini
              ? "space-y-1 p-1.5 sm:space-y-2 sm:p-2.5"
              : "space-y-2 p-2.5 sm:space-y-3 sm:p-4"
            : "space-y-1.5 p-2.5 sm:space-y-4 sm:p-5",
        )}
      >
        <div className="min-w-0 space-y-1 sm:space-y-2">
          <div
            className={cn(
              "flex min-w-0 items-center justify-between gap-1 font-semibold uppercase tracking-wide text-muted sm:gap-2 sm:tracking-[0.16em] lg:tracking-[0.2em]",
              compact && mini ? "text-[8px] sm:text-[10px]" : "text-[9px] sm:text-xs",
            )}
          >
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
            <span className="hidden shrink-0 truncate sm:inline">{product.sku}</span>
          </div>
          <Link
            href={`/product/${product.slug}`}
            scroll
            className={cn(
              "block w-full min-w-0 break-words font-bold leading-snug text-graphite transition-colors hover:text-petrol",
              compact
                ? mini
                  ? "line-clamp-2 text-[11px] sm:text-xs"
                  : "line-clamp-2 text-sm sm:line-clamp-none sm:text-base"
                : "line-clamp-3 text-xs sm:line-clamp-none sm:text-base lg:text-lg",
            )}
          >
            {product.name}
          </Link>
        </div>
        <div className="mt-auto flex items-end justify-between gap-1.5 pt-0.5 sm:gap-2 sm:pt-1">
          <div className="min-w-0">
            <div
              className={cn(
                "font-black text-petrol",
                compact ? (mini ? "text-xs sm:text-sm" : "text-sm sm:text-base") : "text-sm sm:text-lg lg:text-xl",
              )}
            >
              {formatPrice(product.price)}
            </div>
            {discount ? (
              <div className="text-[10px] text-sale line-through sm:text-sm">{formatPrice(product.oldPrice!)}</div>
            ) : null}
          </div>
          <ProductCardCart productId={product.id} productName={product.name} compact={compact} mini={mini} />
        </div>
      </div>
    </article>
  );
}
