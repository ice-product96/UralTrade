import { ProductImage } from "@/components/product-image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryCard } from "@/components/category-card";
import { HomeCarousel } from "@/components/home-carousel";
import { MotionReveal } from "@/components/motion-reveal";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getHomeData } from "@/lib/data";
import { normalizeImageSrc } from "@/lib/image-url";
import { resolveHomeFeatureIcon } from "@/lib/home-features";
import { organizationJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

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
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,125,116,0.16),transparent_38%),linear-gradient(135deg,#f5fafb_0%,#ffffff_48%,#edf6f7_100%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-8 px-3 py-12 sm:gap-10 sm:px-4 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
            <MotionReveal>
              <div className="flex flex-col justify-center">
                <h1 className="max-w-3xl text-balance text-3xl font-black leading-tight tracking-tight text-graphite sm:text-4xl md:text-5xl lg:text-7xl">
                  {hero.title}
                </h1>
                {hero.subtitle ? (
                  <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:mt-6 sm:text-lg sm:leading-8">{hero.subtitle}</p>
                ) : null}
                {features.length ? (
                  <div className="mt-10 grid gap-3 sm:grid-cols-3">
                    {features.map((feature) => {
                      const Icon = resolveHomeFeatureIcon(feature.icon);
                      return (
                        <div key={feature.id} className="rounded-3xl border border-border bg-white/80 p-4">
                          <Icon className="h-5 w-5 text-lime" />
                          <div className="mt-3 font-bold text-graphite">{feature.title}</div>
                          <div className="text-sm text-muted">{feature.text}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </MotionReveal>
            <MotionReveal delay={0.12}>
              <div className="relative">
                <div className="glass-panel overflow-hidden rounded-[42px] p-4">
                  <ProductImage
                    src={hero.imageUrl}
                    alt={hero.title}
                    width={1024}
                    height={341}
                    priority
                    className="h-auto w-full rounded-[32px] object-cover"
                  />
                </div>
              </div>
            </MotionReveal>
          </div>
        </section>

        <MotionReveal>
          <section className="mx-auto max-w-7xl px-3 py-12 sm:px-4 sm:py-16 lg:px-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8 sm:gap-4">
              <div>
                <h2 className="text-2xl font-black text-graphite sm:text-3xl">Каталог</h2>
                <p className="mt-2 text-sm text-muted sm:text-base">Основные разделы магазина</p>
              </div>
              <Link href="/catalog" className="inline-flex items-center gap-2 text-sm font-bold text-petrol transition hover:text-lime sm:text-base">
                Весь каталог <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} size="lg" />
              ))}
            </div>
          </section>
        </MotionReveal>

        {brands.length ? (
          <MotionReveal>
            <section className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
              <div className="mb-6 flex items-end justify-between gap-4">
                <h2 className="text-3xl font-black text-graphite">Популярные бренды</h2>
                <Link href="/brands" className="inline-flex items-center gap-2 font-bold text-petrol hover:text-lime">
                  Все бренды <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {brands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/catalog?brand=${brand.slug}`}
                    className="group flex items-center justify-center rounded-2xl border border-border bg-white p-4 transition hover:border-lime hover:shadow-md hover:shadow-petrol/10"
                    title={brand.name}
                  >
                    <div className="flex h-16 w-full items-center justify-center rounded-xl bg-background px-3">
                      {brand.logoUrl ? (
                        <ProductImage
                          src={normalizeImageSrc(brand.logoUrl)}
                          alt={brand.name}
                          width={120}
                          height={48}
                          className="max-h-12 w-auto object-contain"
                        />
                      ) : (
                        <span className="text-lg font-black text-petrol">{brand.name.slice(0, 2)}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </MotionReveal>
        ) : null}

        <MotionReveal>
          <section className="mx-auto max-w-7xl px-3 py-8 sm:px-4 sm:py-10 lg:px-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
              <div>
                <h2 className="text-2xl font-black text-graphite sm:text-3xl">Популярные товары</h2>
                <p className="mt-2 text-sm text-muted sm:text-base">Актуальные позиции из каталога</p>
              </div>
              <Link href="/catalog?all=1" className="inline-flex items-center gap-2 text-sm font-bold text-petrol transition hover:text-lime sm:text-base">
                Смотреть все <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <HomeCarousel
              itemClassName="flex-[0_0_86%] sm:flex-[0_0_47%] lg:flex-[0_0_31%] xl:flex-[0_0_20%]"
              previousLabel="Предыдущие товары"
              nextLabel="Следующие товары"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} compact />
              ))}
            </HomeCarousel>
          </section>
        </MotionReveal>

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
                itemClassName="flex-[0_0_86%] sm:flex-[0_0_48%] lg:flex-[0_0_31%] xl:flex-[0_0_24%]"
                previousLabel="Предыдущие услуги"
                nextLabel="Следующие услуги"
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
                          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 86vw"
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
