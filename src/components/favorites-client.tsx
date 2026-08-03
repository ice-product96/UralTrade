"use client";

import Link from "next/link";
import { ArrowRight, Heart, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { ProductCardData } from "@/lib/catalog-serialize";
import { clearProductList } from "@/lib/product-lists";
import { useIsHydrated, useProductList } from "@/lib/use-shop-storage";

export function FavoritesClient() {
  const hydrated = useIsHydrated();
  const ids = useProductList("favorites");
  const idsKey = ids.join(",");
  const [loaded, setLoaded] = useState<ProductCardData[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!idsKey) return;

    let cancelled = false;
    fetch(`/api/products?ids=${idsKey}`)
      .then((response) => response.json())
      .then((data: ProductCardData[]) => {
        if (cancelled) return;
        setLoaded(data);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  const products = useMemo(() => {
    const byId = new Map(loaded.map((product) => [product.id, product]));
    return ids
      .map((id) => byId.get(id))
      .filter((product): product is ProductCardData => Boolean(product))
      .reverse();
  }, [ids, loaded]);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-graphite sm:text-4xl">Избранное</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">
            Список хранится в этом браузере — регистрация не нужна.
          </p>
        </div>
        {ids.length ? (
          <button
            type="button"
            onClick={() => clearProductList("favorites")}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-white px-5 text-sm font-bold text-graphite transition hover:border-sale hover:text-sale"
          >
            <Trash2 className="h-4 w-4" />
            Очистить
          </button>
        ) : null}
      </div>

      <div className="mt-8">
        {!hydrated || (ids.length > 0 && !ready) ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: Math.min(Math.max(ids.length, 1), 4) }).map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-[28px] border border-border bg-white" />
            ))}
          </div>
        ) : products.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyFavorites />
        )}
      </div>
    </>
  );
}

function EmptyFavorites() {
  return (
    <div className="rounded-[30px] border border-border bg-white p-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime/10 text-lime">
        <Heart className="h-7 w-7" />
      </div>
      <div className="mt-5 text-xl font-black text-graphite">В избранном пока пусто</div>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        Нажмите на сердечко в карточке товара, чтобы сохранить его и быстро вернуться к нему позже.
      </p>
      <Link
        href="/catalog"
        className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-petrol px-6 text-sm font-bold text-white transition hover:bg-lime"
      >
        Перейти в каталог
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
