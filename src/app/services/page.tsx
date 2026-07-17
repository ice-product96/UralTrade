import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublishedServices } from "@/lib/data";
import { normalizeImageSrc } from "@/lib/image-url";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Услуги",
  description: "Услуги UralTrade: подбор оборудования, монтаж, сервис и сопровождение проектов.",
};

export default async function ServicesPage() {
  const services = await getPublishedServices();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-3 py-8 sm:px-4 sm:py-10 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-petrol px-5 py-8 text-white sm:rounded-[34px] sm:px-8 sm:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(126,173,22,0.22),transparent_42%)]" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-lime sm:text-sm">
              <Briefcase className="h-4 w-4" />
              Услуги компании
            </div>
            <h1 className="mt-4 text-3xl font-black sm:text-4xl">Комплексное сопровождение проектов</h1>
            <p className="mt-3 text-sm text-white/75 sm:text-base">
              Подбор оборудования, техническая консультация, поставка и сервисное сопровождение — всё, что нужно для надёжной работы вашей гидравлики.
            </p>
          </div>
        </div>

        {services.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className="group overflow-hidden rounded-[28px] border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-petrol/10"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-background">
                  {service.imageUrl ? (
                    <ProductImage
                      src={normalizeImageSrc(service.imageUrl)}
                      alt={service.title}
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-bold text-muted">UralTrade</div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-black text-graphite transition group-hover:text-petrol">{service.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{service.shortDescription}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-petrol">
                    Подробнее
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </div>
                  {service._count.examples ? (
                    <div className="mt-2 text-xs font-semibold text-muted">{service._count.examples} примеров работ</div>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[28px] border border-dashed border-border bg-white p-10 text-center text-muted">
            Услуги пока не добавлены.
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
