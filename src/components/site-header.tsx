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
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 lg:gap-4 lg:px-8">
        <SiteLogo priority height={46} />
        <SiteDesktopNav categories={navCategories} />
        <div className="hidden flex-1 md:block">
          <SearchBox />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/catalog"
            className="inline-flex h-11 items-center rounded-full border border-border bg-white px-4 text-sm font-semibold text-petrol transition hover:bg-background lg:hidden"
          >
            Каталог
          </Link>
          <Link
            href="/cart"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-petrol px-4 text-sm font-semibold text-white transition hover:bg-petrol-soft"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline">Корзина</span>
          </Link>
          <SiteMobileNav categories={navCategories} />
        </div>
      </div>
      <div className="px-4 pb-4 md:hidden">
        <SearchBox />
      </div>
    </header>
  );
}
