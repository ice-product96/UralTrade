"use client";

import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";
import { normalizeImageSrc } from "@/lib/image-url";

type SearchResult = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: string;
  brand?: string | null;
  image?: string | null;
};

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const normalized = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (normalized.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(normalized)}`, {
        signal: controller.signal,
      });
      if (response.ok) {
        setResults(await response.json());
        setOpen(true);
      }
    }, 180);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [normalized]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative w-full min-w-0">
      <form action="/catalog" className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          name="q"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (event.target.value.trim().length < 2) {
              setResults([]);
              setOpen(false);
            }
          }}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          placeholder="Поиск по артикулу, названию"
          className="h-11 w-full rounded-full border border-border bg-white pl-12 pr-4 text-sm outline-none ring-lime/30 transition focus:ring-4 sm:h-12"
        />
      </form>
      {open && results.length > 0 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(60vh,24rem)] overflow-y-auto overscroll-contain rounded-3xl border border-border bg-white shadow-2xl shadow-petrol/15">
          {results.map((item) => (
            <Link
              key={item.id}
              href={`/product/${item.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 border-b border-border/70 p-3 last:border-0 hover:bg-background"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-background">
                <ProductImage src={normalizeImageSrc(item.image ?? "/demo/pump-1.svg")} alt={item.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-graphite">{item.name}</div>
                <div className="truncate text-xs text-muted">
                  {item.sku} {item.brand ? `• ${item.brand}` : ""}
                </div>
              </div>
              <div className="shrink-0 text-sm font-bold text-petrol">{formatPrice(item.price)}</div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
