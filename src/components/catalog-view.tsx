import Link from "next/link";
import { CatalogFilter } from "@/components/catalog-filter";
import { CatalogToolbar } from "@/components/catalog-toolbar";
import { CategoryCard } from "@/components/category-card";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCatalogData } from "@/lib/data";
import { normalizeImageSrc } from "@/lib/image-url";

export async function CatalogView({
  slug,
  searchParams,
}: {
  slug?: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const data = await getCatalogData(slug, searchParams);
  const basePath = data.category ? `/catalog/${data.category.slug}` : "/catalog";
  const showCategoryGrid = !data.hasFilters && (data.rootCategories.length > 0 || (data.category?.children.length ?? 0) > 0);
  const categoriesToShow = data.category?.children.length ? data.category.children : data.rootCategories;

  const breadcrumbs = [
    { name: "Главная", href: "/" },
    { name: "Каталог", href: "/catalog" },
    ...(data.category?.parent ? [{ name: data.category.parent.name, href: `/catalog/${data.category.parent.slug}` }] : []),
    ...(data.category ? [{ name: data.category.name, href: `/catalog/${data.category.slug}` }] : []),
  ];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <nav className="mb-4 flex flex-wrap gap-2 text-sm text-muted">
          {breadcrumbs.map((item, index) => (
            <Link key={item.href} href={item.href} className="hover:text-petrol">
              {item.name}
              {index < breadcrumbs.length - 1 ? " /" : ""}
            </Link>
          ))}
        </nav>

        <div className="mb-8 overflow-hidden rounded-[34px] bg-petrol text-white">
          <div className="grid lg:grid-cols-[1fr_280px]">
            <div className="p-8">
              <div className="text-sm font-bold uppercase tracking-[0.24em] text-lime">Каталог</div>
              <h1 className="mt-3 text-4xl font-black">{data.category?.h1 ?? data.category?.name ?? "Каталог товаров"}</h1>
              <p className="mt-3 max-w-3xl text-white/75">
                {data.category?.description ?? "Гидравлическое оборудование и комплектующие с подбором по артикулу, бренду и характеристикам."}
              </p>
            </div>
            {data.category?.imageUrl ? (
              <div className="relative hidden min-h-[220px] bg-petrol-soft/40 lg:block">
                <ProductImage src={normalizeImageSrc(data.category.imageUrl)} alt={data.category.name} fill sizes="280px" className="object-cover opacity-90" />
              </div>
            ) : null}
          </div>
        </div>

        {showCategoryGrid ? (
          <section className="mb-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-black text-graphite">{data.category ? "Подкатегории" : "Популярные категории"}</h2>
              {!data.category ? (
                <Link href="/catalog?all=1" className="text-sm font-bold text-petrol hover:text-lime">
                  Смотреть все товары
                </Link>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categoriesToShow.map((category) => (
                <CategoryCard key={category.id} category={category} size="md" />
              ))}
            </div>
          </section>
        ) : null}

        <div className={`grid gap-8 ${data.showFilterPanel ? "lg:grid-cols-[320px_1fr]" : ""}`}>
          {data.showFilterPanel ? (
            <CatalogFilter
              groups={data.filterGroups}
              brands={data.brands}
              selected={data.selected}
              basePath={basePath}
              total={data.total}
            />
          ) : null}
          <section>
            <CatalogToolbar basePath={basePath} selected={data.selected} sort={data.sort} perPage={data.perPage} total={data.total} />
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {data.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {data.products.length === 0 ? (
              <div className="rounded-[30px] border border-border bg-white p-10 text-center">
                <p className="text-muted">Товары не найдены. Попробуйте изменить фильтры или выберите другую категорию.</p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <Link href={basePath} className="inline-flex h-11 items-center rounded-full border border-border px-5 text-sm font-bold text-petrol">
                    Сбросить фильтры
                  </Link>
                  <Link href="/catalog" className="inline-flex h-11 items-center rounded-full bg-petrol px-5 text-sm font-bold text-white">
                    Весь каталог
                  </Link>
                </div>
              </div>
            ) : null}
            {data.pages > 1 ? (
              <div className="mt-8 flex flex-wrap gap-2">
                {Array.from({ length: data.pages }).map((_, index) => {
                  const pageNum = index + 1;
                  const params = new URLSearchParams();
                  for (const [key, value] of Object.entries(data.selected)) {
                    if (!value || key === "page") continue;
                    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
                    else params.set(key, value);
                  }
                  params.set("page", String(pageNum));
                  return (
                    <Link
                      key={pageNum}
                      href={`${basePath}?${params}`}
                      className={`h-10 w-10 rounded-full text-center text-sm font-bold leading-10 ${pageNum === data.page ? "bg-petrol text-white" : "bg-white text-petrol"}`}
                    >
                      {pageNum}
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
