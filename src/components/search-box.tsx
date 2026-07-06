"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

  return (
    <div className="relative w-full">
      <form action="/catalog" className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          name="q"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (event.target.value.trim().length < 2) setResults([]);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Поиск по артикулу, названию, бренду"
          className="h-12 w-full rounded-full border border-border bg-white pl-12 pr-4 text-sm outline-none ring-lime/30 transition focus:ring-4"
        />
      </form>
      {open && results.length > 0 ? (
        <div className="absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-3xl border border-border bg-white shadow-2xl shadow-petrol/15">
          {results.map((item) => (
            <Link
              key={item.id}
              href={`/product/${item.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 border-b border-border/70 p-3 last:border-0 hover:bg-background"
            >
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-background">
                <Image src={normalizeImageSrc(item.image ?? "/demo/pump-1.svg")} alt={item.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-graphite">{item.name}</div>
                <div className="text-xs text-muted">
                  {item.sku} {item.brand ? `• ${item.brand}` : ""}
                </div>
              </div>
              <div className="text-sm font-bold text-petrol">{formatPrice(item.price)}</div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
