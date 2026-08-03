"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductImage } from "@/components/product-image";
import type { ComparePayload, CompareRow } from "@/lib/compare-types";
import { formatPrice, hasDiscount } from "@/lib/format";
import { normalizeImageSrc } from "@/lib/image-url";
import { clearProductList, COMPARE_LIMIT, removeFromProductList } from "@/lib/product-lists";
import { useIsHydrated, useProductList } from "@/lib/use-shop-storage";
import { cn } from "@/lib/utils";

const EMPTY_PAYLOAD: ComparePayload = { products: [], rows: [] };

export function CompareClient() {
  const hydrated = useIsHydrated();
  const ids = useProductList("compare");
  const idsKey = ids.join(",");
  const [data, setData] = useState<ComparePayload>(EMPTY_PAYLOAD);
  const [ready, setReady] = useState(false);
  const [onlyDifferences, setOnlyDifferences] = useState(false);

  useEffect(() => {
    if (!idsKey) return;

    let cancelled = false;
    fetch(`/api/compare?ids=${idsKey}`)
      .then((response) => response.json())
      .then((payload: ComparePayload) => {
        if (cancelled) return;
        setData(payload);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  const products = useMemo(() => data.products.filter((product) => ids.includes(product.id)), [data.products, ids]);

  const groups = useMemo(() => {
    const visibleRows = onlyDifferences ? data.rows.filter((row) => !row.identical) : data.rows;
    const map = new Map<string, CompareRow[]>();
    for (const row of visibleRows) {
      map.set(row.group, [...(map.get(row.group) ?? []), row]);
    }
    return [...map.entries()].map(([name, rows]) => ({ name, rows }));
  }, [data.rows, onlyDifferences]);

  const differencesCount = useMemo(() => data.rows.filter((row) => !row.identical).length, [data.rows]);
  const gridTemplateColumns = `minmax(180px, 220px) repeat(${products.length}, minmax(220px, 1fr))`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-graphite sm:text-4xl">Сравнение</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">
            До {COMPARE_LIMIT} товаров одновременно. Список хранится в этом браузере — регистрация не нужна.
          </p>
        </div>
        {products.length ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyDifferences((value) => !value)}
              aria-pressed={onlyDifferences}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-bold transition",
                onlyDifferences ? "border-lime bg-lime text-white" : "border-border bg-white text-graphite hover:border-lime hover:text-lime",
              )}
            >
              Только отличия
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  onlyDifferences ? "bg-white/20" : "bg-background text-muted",
                )}
              >
                {differencesCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => clearProductList("compare")}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-white px-5 text-sm font-bold text-graphite transition hover:border-sale hover:text-sale"
            >
              <Trash2 className="h-4 w-4" />
              Очистить
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-8">
        {!hydrated || (ids.length > 0 && !ready) ? (
          <div className="h-96 animate-pulse rounded-[30px] border border-border bg-white" />
        ) : products.length ? (
          <div className="overflow-hidden rounded-[30px] border border-border bg-white">
            <div className="overflow-x-auto scrollbar-thin">
              <div style={{ gridTemplateColumns }} className="grid border-b border-border">
                <div className="sticky left-0 z-10 bg-white p-4" />
                {products.map((product) => (
                  <CompareHeaderCell key={product.id} product={product} />
                ))}
              </div>

              {groups.map((group) => (
                <div key={group.name}>
                  <div className="sticky left-0 z-10 w-fit px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-petrol">
                    {group.name}
                  </div>
                  {group.rows.map((row, index) => (
                    <div
                      key={row.key}
                      style={{ gridTemplateColumns }}
                      className={cn("grid border-t border-border/60", index % 2 === 0 ? "bg-white" : "bg-background/50")}
                    >
                      <div
                        className={cn(
                          "sticky left-0 z-10 flex items-center gap-2 p-4 text-sm font-semibold",
                          index % 2 === 0 ? "bg-white" : "bg-background/50",
                          row.identical ? "text-muted" : "text-graphite",
                        )}
                      >
                        {!row.identical ? <span className="h-2 w-2 shrink-0 rounded-full bg-lime" /> : null}
                        <span className="min-w-0">{row.name}</span>
                      </div>
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className={cn(
                            "border-l border-border/60 p-4 text-sm",
                            row.identical ? "text-muted" : "font-bold text-graphite",
                          )}
                        >
                          {row.values[product.id] ?? "—"}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}

              {!groups.length ? (
                <div className="border-t border-border/60 p-8 text-center text-sm text-muted">
                  У выбранных товаров нет отличающихся характеристик.
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <EmptyCompare />
        )}
      </div>
    </>
  );
}

function CompareHeaderCell({ product }: { product: ComparePayload["products"][number] }) {
  const discount = hasDiscount(product.oldPrice, product.price);

  return (
    <div className="relative border-l border-border/60 p-4">
      <button
        type="button"
        onClick={() => removeFromProductList("compare", product.id)}
        aria-label={`Убрать ${product.name} из сравнения`}
        className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-muted transition hover:border-sale hover:text-sale"
      >
        <X className="h-4 w-4" />
      </button>
      <Link href={`/product/${product.slug}`} scroll className="block">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-background">
          <ProductImage
            src={normalizeImageSrc(product.image ?? "/demo/pump-1.svg")}
            alt={product.name}
            fill
            sizes="220px"
            className="object-cover"
          />
        </div>
        <div className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">{product.sku}</div>
        <div className="mt-1 line-clamp-2 text-sm font-bold text-graphite transition-colors hover:text-petrol">
          {product.name}
        </div>
      </Link>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-lg font-black text-petrol">{formatPrice(product.price)}</div>
        {discount ? <div className="text-xs text-sale line-through">{formatPrice(product.oldPrice!)}</div> : null}
      </div>
      <AddToCartButton productId={product.id} className="mt-3 h-10 w-full text-sm sm:w-full" />
    </div>
  );
}

function EmptyCompare() {
  return (
    <div className="rounded-[30px] border border-border bg-white p-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime/10 text-lime">
        <BarChart3 className="h-7 w-7" />
      </div>
      <div className="mt-5 text-xl font-black text-graphite">Список сравнения пуст</div>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        Добавьте товары кнопкой сравнения в карточке — таблица покажет характеристики рядом и подсветит отличия.
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
