"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { ProductImage } from "@/components/product-image";
import { normalizeImageSrc } from "@/lib/image-url";
import { cn } from "@/lib/utils";

export type NavCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  children: Array<{ id: string; name: string; slug: string }>;
};

const SUBCATEGORY_LIMIT = 8;

function CategoryMenuItem({
  category,
  expanded,
  onEnter,
  onLeave,
}: {
  category: NavCategory;
  expanded: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const hasChildren = category.children.length > 0;
  const visibleChildren = category.children.slice(0, SUBCATEGORY_LIMIT);
  const hasMore = category.children.length > SUBCATEGORY_LIMIT;

  return (
    <div
      className="rounded-[22px] border border-border bg-background/60 p-4 transition hover:border-petrol/15 hover:bg-white"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <Link href={`/catalog/${category.slug}`} className="group flex items-start gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white">
          <ProductImage
            src={normalizeImageSrc(category.imageUrl ?? "/demo/pump-1.svg")}
            alt={category.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="font-black text-graphite transition group-hover:text-petrol">{category.name}</div>
            {hasChildren ? (
              <ChevronRight className={cn("mt-0.5 h-4 w-4 shrink-0 text-muted transition-transform", expanded && "rotate-90 text-petrol")} />
            ) : null}
          </div>
        </div>
      </Link>

      {hasChildren ? (
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <ul className="mt-3 space-y-1 border-t border-border pt-3">
              {visibleChildren.map((child) => (
                <li key={child.id}>
                  <Link
                    href={`/catalog/${child.slug}`}
                    className="block rounded-lg px-2 py-1.5 text-sm text-muted transition hover:bg-background hover:text-petrol"
                  >
                    {child.name}
                  </Link>
                </li>
              ))}
              {hasMore ? (
                <li>
                  <Link href={`/catalog/${category.slug}`} className="block px-2 py-1.5 text-sm font-bold text-lime hover:text-petrol">
                    Все →
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function CatalogMegaMenu({ categories }: { categories: NavCategory[] }) {
  const [open, setOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  function handleMenuLeave() {
    setOpen(false);
    setHoveredId(null);
  }

  return (
    <div className="relative hidden lg:block" onMouseEnter={() => setOpen(true)} onMouseLeave={handleMenuLeave}>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold text-petrol hover:bg-background"
        aria-expanded={open}
      >
        Каталог
        <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-50 w-[min(92vw,980px)] pt-3">
          <div className="grid max-h-[70vh] gap-4 overflow-y-auto rounded-[28px] border border-border bg-white p-5 shadow-2xl shadow-petrol/10 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <CategoryMenuItem
                key={category.id}
                category={category}
                expanded={hoveredId === category.id}
                onEnter={() => setHoveredId(category.id)}
                onLeave={() => setHoveredId((current) => (current === category.id ? null : current))}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
