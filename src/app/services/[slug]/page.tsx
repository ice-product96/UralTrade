import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Briefcase } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getServiceBySlug } from "@/lib/data";
import { normalizeImageSrc } from "@/lib/image-url";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};

  return {
    title: service.metaTitle ?? service.title,
    description: service.metaDescription ?? service.shortDescription,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-8">
        <nav className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted sm:mb-6 sm:text-sm">
          <Link href="/" className="hover:text-petrol">
            Главная
          </Link>
          <span className="text-border">/</span>
          <Link href="/services" className="hover:text-petrol">
            Услуги
          </Link>
          <span className="text-border">/</span>
          <span className="truncate text-graphite">{service.title}</span>
        </nav>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="relative min-h-[280px] overflow-hidden rounded-[28px] border border-border bg-white shadow-xl shadow-petrol/5 sm:min-h-[360px]">
            {service.imageUrl ? (
              <ProductImage src={normalizeImageSrc(service.imageUrl)} alt={service.title} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
            ) : (
              <div className="flex h-full min-h-[280px] items-center justify-center bg-background text-muted sm:min-h-[360px]">UralTrade</div>
            )}
          </div>

          <div className="flex flex-col rounded-[28px] border border-border bg-white p-5 shadow-xl shadow-petrol/5 sm:p-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-lime/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-lime">
              <Briefcase className="h-4 w-4" />
              Услуга
            </div>
            <h1 className="mt-4 text-3xl font-black leading-tight text-graphite sm:text-4xl">{service.h1 ?? service.title}</h1>
            <p className="mt-4 text-base leading-7 text-muted">{service.shortDescription}</p>
            <Link
              href="/page/contacts"
              className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-full bg-petrol px-6 text-sm font-bold text-white transition hover:bg-petrol-soft"
            >
              Обсудить проект
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {service.body.trim() ? (
          <section className="mt-8 rounded-[28px] border border-border bg-white p-5 sm:p-6">
            <h2 className="text-2xl font-black text-graphite">Описание услуги</h2>
            <div className="mt-5 whitespace-pre-line text-base leading-7 text-muted">{service.body}</div>
          </section>
        ) : null}

        {service.examples.length ? (
          <section className="mt-8">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-graphite sm:text-3xl">Примеры выполненных работ</h2>
                <p className="mt-2 text-sm text-muted">Реальные кейсы и результаты наших проектов</p>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {service.examples.map((example, index) => (
                <article
                  key={example.id}
                  className="group overflow-hidden rounded-[24px] border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-petrol/10"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-background">
                    <ProductImage
                      src={normalizeImageSrc(example.imageUrl)}
                      alt={example.title}
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-petrol">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-black text-graphite">{example.title}</h3>
                    {example.description ? <p className="mt-2 text-sm leading-6 text-muted">{example.description}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-10">
          <Link href="/services" className="inline-flex items-center gap-2 text-sm font-bold text-petrol hover:text-lime">
            <ArrowLeft className="h-4 w-4" />
            Все услуги
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
