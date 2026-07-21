"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CatalogMegaMenu, SUBCATEGORY_LIMIT } from "@/components/catalog-mega-menu";
import { MobileMenuContacts } from "@/components/header-contacts";
import { mainNavLinks } from "@/lib/site-nav";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { cn } from "@/lib/utils";

type NavCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  children: Array<{ id: string; name: string; slug: string }>;
};

function MobileCategoryItem({
  category,
  onNavigate,
}: {
  category: NavCategory;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children.length > 0;

  return (
    <div className="rounded-2xl bg-background/60">
      <div className="flex items-stretch">
        <Link
          href={`/catalog/${category.slug}`}
          onClick={onNavigate}
          className="min-w-0 flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-graphite hover:text-petrol"
        >
          {category.name}
        </Link>
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="flex w-11 shrink-0 items-center justify-center rounded-2xl text-petrol"
            aria-expanded={expanded}
            aria-label={`Подкатегории: ${category.name}`}
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
          </button>
        ) : null}
      </div>
      {hasChildren && expanded ? (
        <div className="space-y-0.5 border-t border-border/70 px-2 pb-2 pt-1">
          {category.children.slice(0, SUBCATEGORY_LIMIT).map((child) => (
            <Link
              key={child.id}
              href={`/catalog/${child.slug}`}
              onClick={onNavigate}
              className="block rounded-xl px-4 py-2.5 text-sm text-muted hover:bg-white hover:text-petrol"
            >
              {child.name}
            </Link>
          ))}
          <Link
            href={`/catalog/${category.slug}`}
            onClick={onNavigate}
            className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-petrol hover:bg-white"
          >
            Все в разделе →
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function SiteMobileNav({
  categories,
  contacts,
}: {
  categories: NavCategory[];
  contacts: { phone: string | null; email: string | null };
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useBodyScrollLock(open);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function close() {
    setOpen(false);
  }

  const menuOverlay =
    open && mounted ? (
      <div className="fixed inset-0 z-[100] lg:hidden">
        <button type="button" className="absolute inset-0 bg-black/40" aria-label="Закрыть" onClick={close} />
        <div className="absolute inset-y-0 right-0 flex h-full w-full max-w-[360px] flex-col bg-white shadow-2xl">
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-4">
            <div className="text-lg font-black text-graphite">Меню</div>
            <button type="button" onClick={close} className="rounded-full p-2 text-petrol" aria-label="Закрыть меню">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="space-y-1">
              <Link
                href="/catalog"
                onClick={close}
                className="block rounded-2xl bg-petrol px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Каталог
              </Link>
              {mainNavLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="block rounded-2xl px-4 py-3 text-sm font-semibold text-petrol hover:bg-background"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            {categories.length > 0 ? (
              <div className="mt-4 border-t border-border pt-4">
                <div className="px-1 pb-2 text-xs font-bold uppercase tracking-[0.2em] text-muted">Разделы каталога</div>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <MobileCategoryItem key={category.id} category={category} onNavigate={close} />
                  ))}
                </div>
              </div>
            ) : null}
            <MobileMenuContacts contacts={contacts} />
          </nav>
        </div>
      </div>
    ) : null;

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

      {mounted && menuOverlay ? createPortal(menuOverlay, document.body) : null}
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
