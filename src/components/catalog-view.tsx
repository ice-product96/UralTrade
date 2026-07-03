import Link from "next/link";
import { CatalogFilter } from "@/components/catalog-filter";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCatalogData } from "@/lib/data";

export async function CatalogView({
  slug,
  searchParams,
}: {
  slug?: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const data = await getCatalogData(slug, searchParams);
  const basePath = data.category ? `/catalog/${data.category.slug}` : "/catalog";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="mb-8 rounded-[34px] bg-petrol p-8 text-white">
          <div className="text-sm font-bold uppercase tracking-[0.24em] text-lime">Каталог UralTrade</div>
          <h1 className="mt-3 text-4xl font-black">{data.category?.h1 ?? data.category?.name ?? "Все товары"}</h1>
          <p className="mt-3 max-w-3xl text-white/75">
            {data.category?.description ??
              "Подбор товаров по артикулу, бренду и настраиваемым характеристикам. Фильтр синхронизируется с URL и подходит для SEO-страниц."}
          </p>
          {data.category?.parent ? (
            <Link href={`/catalog/${data.category.parent.slug}`} className="mt-4 inline-flex text-sm font-bold text-lime">
              ← {data.category.parent.name}
            </Link>
          ) : null}
        </div>
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <CatalogFilter groups={data.filterGroups} brands={data.brands} selected={data.selected} basePath={basePath} />
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div className="font-bold text-muted">Найдено товаров: {data.total}</div>
              <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-petrol">Страница {data.page} из {data.pages}</div>
            </div>
            {data.category?.children.length ? (
              <div className="mb-6 flex flex-wrap gap-2">
                {data.category.children.map((child) => (
                  <Link key={child.id} href={`/catalog/${child.slug}`} className="rounded-full border border-border bg-white px-4 py-2 text-sm font-bold text-petrol hover:bg-background">
                    {child.name}
                  </Link>
                ))}
              </div>
            ) : null}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {data.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {data.products.length === 0 ? <div className="rounded-[30px] border border-border bg-white p-10 text-center text-muted">Товары не найдены.</div> : null}
            {data.pages > 1 ? (
              <div className="mt-8 flex gap-2">
                {Array.from({ length: data.pages }).map((_, index) => {
                  const page = index + 1;
                  const params = new URLSearchParams();
                  for (const [key, value] of Object.entries(data.selected)) {
                    if (!value || key === "page") continue;
                    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
                    else params.set(key, value);
                  }
                  params.set("page", String(page));
                  return (
                    <Link key={page} href={`${basePath}?${params}`} className={`h-10 w-10 rounded-full text-center text-sm font-bold leading-10 ${page === data.page ? "bg-petrol text-white" : "bg-white text-petrol"}`}>
                      {page}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
