import Link from "next/link";
import { SiteLogo } from "@/components/site-logo";
import { getNavigationCategories } from "@/lib/data";
import { mainNavLinks } from "@/lib/site-nav";

export async function SiteFooter() {
  const categories = await getNavigationCategories();

  return (
    <footer className="mt-16 border-t border-border bg-white sm:mt-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <SiteLogo href="/" height={52} />
          <p className="mt-4 max-w-md text-sm leading-6 text-muted">
            Интернет-магазин гидравлического оборудования и комплектующих с подбором по артикулам, характеристикам и брендам.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <div className="font-bold text-graphite">Каталог</div>
          <Link href="/catalog" className="block text-muted hover:text-petrol">
            Все товары
          </Link>
          <Link href="/brands" className="block text-muted hover:text-petrol">
            Бренды
          </Link>
          <Link href="/promotions" className="block text-muted hover:text-petrol">
            Акции
          </Link>
          {categories.slice(0, 5).map((category) => (
            <Link key={category.id} href={`/catalog/${category.slug}`} className="block text-muted hover:text-petrol">
              {category.name}
            </Link>
          ))}
        </div>
        <div className="space-y-3 text-sm">
          <div className="font-bold text-graphite">Покупателям</div>
          {mainNavLinks
            .filter((item) => item.href !== "/brands" && item.href !== "/promotions")
            .map((item) => (
              <Link key={item.href} href={item.href} className="block text-muted hover:text-petrol">
                {item.label}
              </Link>
            ))}
        </div>
      </div>
    </footer>
  );
}
