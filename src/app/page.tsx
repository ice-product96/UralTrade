import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Search, SlidersHorizontal, Sparkles } from "lucide-react";
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
                <Sparkles className="h-4 w-4 text-lime" />
                Современный подбор инженерного оборудования
              </div>
              <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-tight text-graphite md:text-7xl">
                {banner?.title ?? "Инженерное оборудование с умным подбором"}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
                {banner?.subtitle ??
                  "Каталог UralTrade помогает быстро найти товар по артикулу, бренду и точным техническим параметрам."}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={banner?.href ?? "/catalog"}>{banner?.buttonLabel ?? "Перейти в каталог"}</ButtonLink>
                <ButtonLink href="/admin" variant="ghost">
                  Открыть админку
                </ButtonLink>
              </div>
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  ["Поиск", "Артикул, бренд, название"],
                  ["Фильтры", "Диапазоны и группы"],
                  ["SEO", "JSON-LD для Яндекса"],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-3xl border border-border bg-white/80 p-4">
                    <CheckCircle2 className="h-5 w-5 text-lime" />
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
                  alt={banner?.title ?? "Инженерное оборудование"}
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
              <h2 className="text-3xl font-black text-graphite">Категории</h2>
              <p className="mt-2 text-muted">Категории и подкатегории связаны с шаблонами карточек.</p>
            </div>
            <Link href="/catalog" className="hidden items-center gap-2 font-bold text-petrol md:flex">
              Весь каталог <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.id} href={`/catalog/${category.slug}`} className="rounded-[30px] border border-border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-petrol/10">
                <SlidersHorizontal className="h-8 w-8 text-lime" />
                <div className="mt-6 text-xl font-black text-graphite">{category.name}</div>
                <p className="mt-2 text-sm text-muted">{category.description ?? "Подбор по характеристикам и брендам."}</p>
              </Link>
            ))}
          </div>
        </section>
        </MotionReveal>
        <MotionReveal>
        <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-graphite">Популярные товары</h2>
              <p className="mt-2 text-muted">Карточки с фото, SEO-данными, характеристиками и перелинковкой.</p>
            </div>
            <Search className="hidden h-10 w-10 text-lime md:block" />
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
