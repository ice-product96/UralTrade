import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { ProductCardItem } from "@/lib/data";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: ProductCardItem }) {
  const image = product.images[0]?.url ?? "/demo/pump-1.svg";

  return (
    <article className="group overflow-hidden rounded-[28px] border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-petrol/10">
      <Link href={`/product/${product.slug}`} className="block bg-background p-4">
        <div className="relative aspect-square overflow-hidden rounded-[22px]">
          <Image
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
            {product.oldPrice ? <div className="text-sm text-muted line-through">{formatPrice(product.oldPrice)}</div> : null}
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
