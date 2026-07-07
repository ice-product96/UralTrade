"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { ProductImage } from "@/components/product-image";
import { normalizeImageSrc } from "@/lib/image-url";

export type NavCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  children: Array<{ id: string; name: string; slug: string }>;
};

export function CatalogMegaMenu({ categories }: { categories: NavCategory[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative hidden lg:block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold text-petrol hover:bg-background"
        aria-expanded={open}
      >
        Каталог
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-50 w-[min(92vw,980px)] pt-3">
          <div className="grid max-h-[70vh] gap-4 overflow-y-auto rounded-[28px] border border-border bg-white p-5 shadow-2xl shadow-petrol/10 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <div key={category.id} className="rounded-[22px] border border-border bg-background/60 p-4">
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
                  <div>
                    <div className="font-black text-graphite transition group-hover:text-petrol">{category.name}</div>
                    {category.children.length ? (
                      <div className="mt-2 text-xs font-semibold text-muted">{category.children.length} подкатегорий</div>
                    ) : null}
                  </div>
                </Link>
                {category.children.length ? (
                  <ul className="mt-3 space-y-1 border-t border-border pt-3">
                    {category.children.slice(0, 8).map((child) => (
                      <li key={child.id}>
                        <Link href={`/catalog/${child.slug}`} className="block rounded-lg px-2 py-1.5 text-sm text-muted transition hover:bg-white hover:text-petrol">
                          {child.name}
                        </Link>
                      </li>
                    ))}
                    {category.children.length > 8 ? (
                      <li>
                        <Link href={`/catalog/${category.slug}`} className="block px-2 py-1.5 text-sm font-bold text-lime">
                          Все подкатегории →
                        </Link>
                      </li>
                    ) : null}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
