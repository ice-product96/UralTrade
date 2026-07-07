import Link from "next/link";
import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicBrands } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Бренды",
  description: "Производители гидравлического оборудования в каталоге UralTrade.",
};

export default async function BrandsPage() {
  const brands = await getPublicBrands();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-graphite">Бренды</h1>
          <p className="mt-3 max-w-2xl text-muted">Производители и поставщики оборудования, представленные в нашем каталоге.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/catalog?brand=${brand.slug}`}
              className="group rounded-[28px] border border-border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-petrol/10"
            >
              <div className="flex h-16 items-center justify-center rounded-2xl bg-background">
                {brand.logoUrl ? (
                  <Image src={brand.logoUrl} alt={brand.name} width={120} height={48} className="max-h-12 w-auto object-contain" />
                ) : (
                  <span className="text-lg font-black text-petrol">{brand.name.slice(0, 2)}</span>
                )}
              </div>
              <div className="mt-4 text-lg font-black text-graphite group-hover:text-petrol">{brand.name}</div>
              <div className="mt-1 text-sm text-muted">{brand._count.products} товаров</div>
            </Link>
          ))}
        </div>
        {!brands.length ? (
          <div className="rounded-[30px] border border-border bg-white p-10 text-center text-muted">Бренды пока не добавлены.</div>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
