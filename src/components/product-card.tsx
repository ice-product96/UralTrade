import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import type { ProductCardItem } from "@/lib/data";
import { formatPrice, hasDiscount } from "@/lib/format";
import { normalizeImageSrc } from "@/lib/image-url";

export function ProductCard({ product }: { product: ProductCardItem }) {
  const image = normalizeImageSrc(product.images[0]?.url ?? "/demo/pump-1.svg");
  const discount = hasDiscount(product.oldPrice, product.price);

  return (
    <article className="group overflow-hidden rounded-[28px] border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-petrol/10">
      <Link href={`/product/${product.slug}`} className="relative block bg-background p-4">
        <div className="absolute left-6 top-6 z-10 flex flex-col gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${product.inStock ? "bg-lime text-white" : "bg-white text-muted"}`}>
            {product.inStock ? "В наличии" : "Под заказ"}
          </span>
          {discount ? <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">Скидка</span> : null}
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
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            <span>{product.brand?.name ?? "UralTrade"}</span>
            <span>{product.sku}</span>
          </div>
          <Link href={`/product/${product.slug}`} className="block text-lg font-bold text-graphite transition-colors hover:text-petrol">
            {product.name}
          </Link>
          <p className="line-clamp-2 text-sm text-muted">{product.shortDescription}</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-black text-petrol">{formatPrice(product.price)}</div>
            {discount ? <div className="text-sm text-muted line-through">{formatPrice(product.oldPrice!)}</div> : null}
          </div>
          <Link
            href={`/cart?add=${product.id}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-lime text-white shadow-lg shadow-lime/20 transition hover:bg-lime-hover"
            aria-label={`Добавить ${product.name} в корзину`}
          >
            <ShoppingCart className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
