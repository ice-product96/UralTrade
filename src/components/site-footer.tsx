import Link from "next/link";
import { SiteLogo } from "@/components/site-logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <SiteLogo href="/" width={180} height={60} />
          <p className="mt-4 max-w-md text-sm leading-6 text-muted">
            Интернет-магазин инженерного оборудования с точным подбором по артикулам, характеристикам и брендам.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <div className="font-bold text-graphite">Каталог</div>
          <Link href="/catalog" className="block text-muted hover:text-petrol">
            Все товары
          </Link>
          <Link href="/catalog/nasosy" className="block text-muted hover:text-petrol">
            Насосы
          </Link>
          <Link href="/catalog/pogruzhnye-nasosy" className="block text-muted hover:text-petrol">
            Погружные насосы
          </Link>
        </div>
        <div className="space-y-3 text-sm">
          <div className="font-bold text-graphite">Покупателям</div>
          <Link href="/page/delivery" className="block text-muted hover:text-petrol">
            Доставка
          </Link>
          <Link href="/page/about" className="block text-muted hover:text-petrol">
            О компании
          </Link>
          <Link href="/page/contacts" className="block text-muted hover:text-petrol">
            Контакты
          </Link>
        </div>
      </div>
    </footer>
  );
}
