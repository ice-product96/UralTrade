import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Wrench } from "lucide-react";
import { CategoryCard } from "@/components/category-card";
import { MotionReveal } from "@/components/motion-reveal";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button";
import { getHomeData } from "@/lib/data";
import { organizationJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { banners, categories, products, brands } = await getHomeData();
  const banner = banners[0];

  return (
    <>
      <SiteHeader />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(126,173,22,0.16),transparent_38%),linear-gradient(135deg,#f5fafb_0%,#ffffff_48%,#edf6f7_100%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-8 px-3 py-12 sm:gap-10 sm:px-4 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
            <MotionReveal>
              <div className="flex flex-col justify-center">
                <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-bold text-petrol shadow-sm">
                  Гидравлика и комплектующие
                </div>
                <h1 className="max-w-3xl text-balance text-3xl font-black leading-tight tracking-tight text-graphite sm:text-4xl md:text-5xl lg:text-7xl">
                  {banner?.title ?? "Интернет-магазин гидравлического оборудования"}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:mt-6 sm:text-lg sm:leading-8">
                  {banner?.subtitle ?? "Большой каталог с поиском по артикулу, подбором по характеристикам и оформлением заказа онлайн."}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <ButtonLink href={banner?.href ?? "/catalog"}>{banner?.buttonLabel ?? "Перейти в каталог"}</ButtonLink>
                  <ButtonLink href="/brands" variant="ghost">
                    Бренды
                  </ButtonLink>
                </div>
                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: Wrench, title: "Подбор по параметрам", text: "Фильтры по характеристикам и брендам" },
                    { icon: Truck, title: "Доставка по РФ", text: "Отправка до транспортной компании" },
                    { icon: ShieldCheck, title: "Консультация", text: "Поможем подобрать оборудование" },
                  ].map(({ icon: Icon, title, text }) => (
                    <div key={title} className="rounded-3xl border border-border bg-white/80 p-4">
                      <Icon className="h-5 w-5 text-lime" />
                      <div className="mt-3 font-bold text-graphite">{title}</div>
                      <div className="text-sm text-muted">{text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </MotionReveal>
            <MotionReveal delay={0.12}>
              <div className="relative">
                <div className="glass-panel overflow-hidden rounded-[42px] p-4">
                  <Image
                    src={banner?.imageUrl ?? "/demo/hero-equipment.svg"}
                    alt={banner?.title ?? "Гидравлическое оборудование"}
                    width={980}
                    height={620}
                    priority
                    className="rounded-[32px]"
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
              <Link href="/catalog" className="inline-flex items-center gap-2 text-sm font-bold text-petrol sm:text-base">
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
                <Link href="/brands" className="font-bold text-petrol hover:text-lime">
                  Все бренды
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {brands.map((brand) => (
                  <Link key={brand.id} href={`/catalog?brand=${brand.slug}`} className="rounded-2xl border border-border bg-white p-4 text-center transition hover:border-lime">
                    <div className="font-bold text-graphite">{brand.name}</div>
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
              <Link href="/catalog?all=1" className="text-sm font-bold text-petrol sm:text-base">
                Смотреть все
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </MotionReveal>
      </main>
      <SiteFooter />
    </>
  );
}
