import { ProductImage } from "@/components/product-image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { BrandCard } from "@/components/brand-card";
import { CategoryCard } from "@/components/category-card";
import { HomeCarousel } from "@/components/home-carousel";
import { HomeHero } from "@/components/home-hero";
import { MotionReveal } from "@/components/motion-reveal";
import { ProductCard } from "@/components/product-card";
import { RichText } from "@/components/rich-text";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getHomeData } from "@/lib/data";
import { normalizeImageSrc } from "@/lib/image-url";
import { organizationJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

const HOME_SHELF_ITEM_CLASS =
  "flex-[0_0_calc(100%/2.2)] sm:flex-[0_0_calc(100%/3.5)] lg:flex-[0_0_calc(100%/6.5)]";
/** Dense gutter is sm:pl-2.5 (0.625rem); add gap/6 so six cards fill width with no 7th peek. */
const CATALOG_SHELF_ITEM_CLASS =
  "flex-[0_0_calc(100%/2.2)] sm:flex-[0_0_calc(100%/3.5)] lg:flex-[0_0_calc((100%+0.625rem)/6)]";
/** Dense gutter is sm:pl-2.5 (0.625rem); add gap/5 so five cards fill width with no 6th peek. */
const PRODUCTS_SHELF_ITEM_CLASS =
  "flex-[0_0_calc(100%/2.2)] sm:flex-[0_0_calc(100%/3.5)] lg:flex-[0_0_calc((100%+0.625rem)/5)]";

function HomeShelf({
  title,
  subtitle,
  href,
  linkLabel,
  previousLabel,
  nextLabel,
  itemClassName = HOME_SHELF_ITEM_CLASS,
  dragFree = false,
  children,
}: {
  title: string;
  subtitle?: string;
  href: string;
  linkLabel: string;
  previousLabel: string;
  nextLabel: string;
  itemClassName?: string;
  dragFree?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-3 py-2 sm:px-4 lg:min-h-0 lg:flex-1 lg:px-8 lg:py-1.5">
      <div className="mb-1.5 flex items-end justify-between gap-3 lg:mb-2">
        <div className="min-w-0">
          <h2 className="text-lg font-black text-graphite sm:text-xl">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-muted sm:text-sm">{subtitle}</p> : null}
        </div>
        <Link href={href} className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-petrol transition hover:text-lime sm:text-sm">
          {linkLabel} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <HomeCarousel
        itemClassName={itemClassName}
        previousLabel={previousLabel}
        nextLabel={nextLabel}
        dense
        dragFree={dragFree}
      >
        {children}
      </HomeCarousel>
    </section>
  );
}

export default async function Home() {
  const { homePage, features, categories, products, brands, services } = await getHomeData();

  const hero = homePage ?? {
    title: "Инженерное оборудование с умным подбором",
    subtitle: "Каталог UralTrade помогает быстро найти товар по артикулу, бренду и точным техническим параметрам.",
    imageUrl: "/demo/hero-equipment.jpg",
  };

  return (
    <>
      <SiteHeader />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
        <div className="lg:flex lg:max-h-[calc(100svh-7.75rem)] lg:flex-col">
          <HomeHero
            title={hero.title}
            subtitle={hero.subtitle}
            imageUrl={hero.imageUrl}
            features={features.map((feature) => ({
              id: feature.id,
              title: feature.title,
              text: feature.text,
              icon: feature.icon,
              sortOrder: feature.sortOrder,
            }))}
          />

          <HomeShelf
            title="Каталог"
            subtitle="Основные разделы магазина"
            href="/catalog"
            linkLabel="Весь каталог"
            previousLabel="Предыдущие разделы каталога"
            nextLabel="Следующие разделы каталога"
            itemClassName={CATALOG_SHELF_ITEM_CLASS}
            dragFree
          >
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} compact mini showDescription={false} />
            ))}
          </HomeShelf>

          {brands.length ? (
            <HomeShelf title="Популярные бренды" href="/brands" linkLabel="Все бренды" previousLabel="Предыдущие бренды" nextLabel="Следующие бренды">
              {brands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} mini />
              ))}
            </HomeShelf>
          ) : null}

          <HomeShelf
            title="Популярные товары"
            subtitle="Карточки с фото, SEO-данными, характеристиками и перелинковкой."
            href="/catalog?all=1"
            linkLabel="Смотреть все"
            previousLabel="Предыдущие товары"
            nextLabel="Следующие товары"
            itemClassName={PRODUCTS_SHELF_ITEM_CLASS}
            dragFree
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} compact mini />
            ))}
          </HomeShelf>
        </div>

        {homePage?.textBlock?.trim() ? (
          <section className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
            <div className="rounded-[24px] border border-border bg-white p-5 shadow-sm sm:rounded-[30px] sm:p-7">
              <RichText html={homePage.textBlock} />
            </div>
          </section>
        ) : null}

        {services.length ? (
          <MotionReveal>
            <section className="mx-auto max-w-7xl px-3 py-8 sm:px-4 sm:py-10 lg:px-8">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
                <div>
                  <h2 className="text-2xl font-black text-graphite sm:text-3xl">Популярные услуги</h2>
                  <p className="mt-2 text-sm text-muted sm:text-base">Подбор, монтаж и сервисное сопровождение</p>
                </div>
                <Link href="/services" className="inline-flex items-center gap-2 text-sm font-bold text-petrol transition hover:text-lime sm:text-base">
                  Все услуги <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <HomeCarousel
                itemClassName="flex-[0_0_86%] sm:flex-[0_0_48%] lg:flex-[0_0_calc(25%+0.25rem)]"
                previousLabel="Предыдущие услуги"
                nextLabel="Следующие услуги"
                dragFree
              >
                {services.map((service) => (
                  <Link
                    key={service.id}
                    href={`/services/${service.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-petrol/10"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-background">
                      {service.imageUrl ? (
                        <ProductImage
                          src={normalizeImageSrc(service.imageUrl)}
                          alt={service.title}
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 86vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm font-bold text-muted">UralTrade</div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="text-lg font-black text-graphite transition group-hover:text-petrol">{service.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{service.shortDescription}</p>
                      <div className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-bold text-petrol">
                        Подробнее
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </HomeCarousel>
            </section>
          </MotionReveal>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
