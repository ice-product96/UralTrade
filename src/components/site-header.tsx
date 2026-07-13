import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { SiteDesktopNav, SiteMobileNav } from "@/components/site-nav";
import { getNavigationCategories } from "@/lib/data";
import { SearchBox } from "@/components/search-box";
import { SiteLogo } from "@/components/site-logo";

export async function SiteHeader() {
  const categories = await getNavigationCategories();
  const navCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    imageUrl: category.imageUrl,
    children: category.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
    })),
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl min-w-0 items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4 lg:gap-4 lg:px-8">
        <SiteLogo priority imageClassName="h-9 w-auto max-w-[140px] sm:h-[46px] sm:max-w-none" />
        <SiteDesktopNav categories={navCategories} />
        <div className="hidden min-w-0 flex-1 lg:block">
          <SearchBox />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/cart"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-petrol px-3 text-sm font-semibold text-white transition hover:bg-petrol-soft sm:px-4"
            aria-label="Корзина"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline">Корзина</span>
          </Link>
          <SiteMobileNav categories={navCategories} />
        </div>
      </div>
      <div className="border-t border-border/50 px-3 pb-3 pt-2 lg:hidden sm:px-4">
        <SearchBox />
      </div>
    </header>
  );
}
