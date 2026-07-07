"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { CatalogMegaMenu } from "@/components/catalog-mega-menu";
import { mainNavLinks } from "@/lib/site-nav";

type NavCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  children: Array<{ id: string; name: string; slug: string }>;
};

export function SiteMobileNav({ categories }: { categories: NavCategory[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-petrol shadow-sm lg:hidden"
        aria-label="Меню"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Закрыть" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[min(100%,320px)] overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="text-lg font-black text-graphite">Меню</div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-petrol" aria-label="Закрыть меню">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              <Link href="/catalog" onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-sm font-semibold text-petrol hover:bg-background">
                Каталог
              </Link>
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  href={`/catalog/${category.slug}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-2.5 pl-8 text-sm text-muted hover:bg-background hover:text-petrol"
                >
                  {category.name}
                </Link>
              ))}
              {mainNavLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-semibold text-petrol hover:bg-background"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function SiteDesktopNav({ categories }: { categories: NavCategory[] }) {
  return (
    <nav className="hidden items-center gap-1 rounded-full bg-white p-1 text-sm font-semibold shadow-sm lg:flex">
      <CatalogMegaMenu categories={categories} />
      {mainNavLinks.map((item) => (
        <Link key={item.href} href={item.href} className="rounded-full px-3 py-2 text-muted hover:bg-background hover:text-petrol xl:px-4">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
