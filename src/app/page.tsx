import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
  const { banners, categories, products } = await getHomeData();
  const banner = banners[0];

  return (
    <>
      <SiteHeader />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(126,173,22,0.16),transparent_38%),linear-gradient(135deg,#f5fafb_0%,#ffffff_48%,#edf6f7_100%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
            <MotionReveal>
              <div className="flex flex-col justify-center">
                <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-bold text-petrol shadow-sm">
                  Гидравлика и комплектующие
                </div>
                <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-tight text-graphite md:text-7xl">
                  {banner?.title ?? "Интернет-магазин гидравлического оборудования"}
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
                  {banner?.subtitle ??
                    "Большой каталог с поиском по артикулу, подбором по характеристикам и оформлением заказа онлайн."}
                </p>
                <div className="mt-8">
                  <ButtonLink href={banner?.href ?? "/catalog"}>{banner?.buttonLabel ?? "Перейти в каталог"}</ButtonLink>
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
          <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-graphite">Каталог</h2>
                <p className="mt-2 text-muted">Основные разделы магазина</p>
              </div>
              <Link href="/catalog" className="hidden items-center gap-2 font-bold text-petrol md:flex">
                Весь каталог <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} size="lg" />
              ))}
            </div>
          </section>
        </MotionReveal>

        <MotionReveal>
          <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-graphite">Популярные товары</h2>
                <p className="mt-2 text-muted">Актуальные позиции из каталога</p>
              </div>
              <Link href="/catalog" className="hidden font-bold text-petrol md:inline">
                Смотреть все
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
