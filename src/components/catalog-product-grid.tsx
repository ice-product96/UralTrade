"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { buildCatalogPageRange } from "@/lib/catalog-pagination";
import type { SerializedProductCard } from "@/lib/catalog-serialize";
import { cn } from "@/lib/utils";

export function CatalogProductGrid({
  initialProducts,
  page,
  pages,
  perPage,
  total,
  basePath,
  selected,
  categorySlug,
}: {
  initialProducts: SerializedProductCard[];
  page: number;
  pages: number;
  perPage: number;
  total: number;
  basePath: string;
  selected: Record<string, string | string[] | undefined>;
  categorySlug?: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [loadedPage, setLoadedPage] = useState(page);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProducts(initialProducts);
    setLoadedPage(page);
    setError(null);
  }, [initialProducts, page]);

  const hasMore = loadedPage < pages;
  const remaining = Math.max(0, total - products.length);
  const pageItems = useMemo(() => buildCatalogPageRange(page, pages), [page, pages]);

  function buildPageHref(pageNum: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(selected)) {
      if (!value || key === "page") continue;
      if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
      else params.set(key, value);
    }
    if (pageNum > 1) params.set("page", String(pageNum));
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  function buildApiUrl(pageNum: number) {
    const params = new URLSearchParams();
    if (categorySlug) params.set("slug", categorySlug);
    for (const [key, value] of Object.entries(selected)) {
      if (key === "page") continue;
      if (value == null || value === "") continue;
      if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
      else params.set(key, value);
    }
    params.set("page", String(pageNum));
    return `/api/catalog?${params}`;
  }

  async function loadMore() {
    if (!hasMore || loading) return;
    const nextPage = loadedPage + 1;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl(nextPage));
      if (!response.ok) throw new Error("Не удалось загрузить товары");
      const data = (await response.json()) as { products: SerializedProductCard[] };
      setProducts((current) => {
        const seen = new Set(current.map((item) => item.id));
        const appended = data.products.filter((item) => !seen.has(item.id));
        return [...current, ...appended];
      });
      setLoadedPage(nextPage);
    } catch {
      setError("Не удалось загрузить товары. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {pages > 1 ? (
        <div className="mt-10 space-y-5">
          {hasMore ? (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={loadMore}
                disabled={loading}
                className="inline-flex h-12 min-w-[220px] items-center justify-center rounded-full border border-border bg-white px-8 text-sm font-bold text-petrol shadow-sm transition hover:border-lime hover:bg-background disabled:cursor-wait disabled:opacity-70"
              >
                {loading ? "Загрузка..." : `Показать ещё${remaining > 0 ? ` (${Math.min(perPage, remaining)})` : ""}`}
              </button>
              {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
            </div>
          ) : null}

          <nav className="flex items-center justify-center gap-1 sm:gap-2" aria-label="Пагинация каталога">
            {page > 1 ? (
              <Link
                href={buildPageHref(page - 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-petrol transition hover:bg-white hover:text-lime"
                aria-label="Предыдущая страница"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
            ) : (
              <span className="inline-flex h-10 w-10 items-center justify-center text-border" aria-hidden>
                <ChevronLeft className="h-5 w-5" />
              </span>
            )}

            {pageItems.map((item, index) =>
              item === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="px-1 text-sm font-bold text-muted sm:px-2">
                  …
                </span>
              ) : (
                <Link
                  key={item}
                  href={buildPageHref(item)}
                  className={cn(
                    "inline-flex h-10 min-w-10 items-center justify-center rounded-full px-2 text-sm font-bold transition",
                    item === page ? "text-lime" : "text-petrol hover:bg-white hover:text-lime",
                  )}
                  aria-current={item === page ? "page" : undefined}
                >
                  {item}
                </Link>
              ),
            )}

            {page < pages ? (
              <Link
                href={buildPageHref(page + 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-petrol transition hover:bg-white hover:text-lime"
                aria-label="Следующая страница"
              >
                <ChevronRight className="h-5 w-5" />
              </Link>
            ) : (
              <span className="inline-flex h-10 w-10 items-center justify-center text-border" aria-hidden>
                <ChevronRight className="h-5 w-5" />
              </span>
            )}
          </nav>
        </div>
      ) : null}
    </>
  );
}
