import Link from "next/link";
import { Menu, ShoppingCart, SlidersHorizontal } from "lucide-react";
import { getNavigationCategories } from "@/lib/data";
import { SearchBox } from "@/components/search-box";
import { SiteLogo } from "@/components/site-logo";

export async function SiteHeader() {
  const categories = await getNavigationCategories();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 lg:px-8">
        <SiteLogo priority />
        <nav className="hidden items-center gap-2 rounded-full bg-white p-1 text-sm font-semibold shadow-sm lg:flex">
          <Link href="/catalog" className="rounded-full px-4 py-2 text-petrol hover:bg-background">
            Каталог
          </Link>
          {categories.slice(0, 4).map((category) => (
            <Link key={category.id} href={`/catalog/${category.slug}`} className="rounded-full px-4 py-2 text-muted hover:bg-background hover:text-petrol">
              {category.name}
            </Link>
          ))}
        </nav>
        <div className="hidden flex-1 md:block">
          <SearchBox />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/catalog"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-petrol shadow-sm md:hidden"
            aria-label="Фильтр и каталог"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Link>
          <Link
            href="/cart"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-petrol px-4 text-sm font-semibold text-white transition hover:bg-petrol-soft"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline">Корзина</span>
          </Link>
          <Link
            href="/admin"
            className="hidden h-11 items-center rounded-full border border-border bg-white px-4 text-sm font-semibold text-petrol transition hover:bg-background lg:inline-flex"
          >
            Админка
          </Link>
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-petrol shadow-sm lg:hidden" aria-label="Меню">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="px-4 pb-4 md:hidden">
        <SearchBox />
      </div>
    </header>
  );
}
