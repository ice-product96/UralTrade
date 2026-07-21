import Link from "next/link";
import { CatalogFilter } from "@/components/catalog-filter";
import { CatalogProductGrid } from "@/components/catalog-product-grid";
import { CatalogToolbar } from "@/components/catalog-toolbar";
import { CategoryCard } from "@/components/category-card";
import { ProductImage } from "@/components/product-image";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCatalogData } from "@/lib/data";
import { serializeProductCard } from "@/lib/catalog-serialize";
import { normalizeImageSrc } from "@/lib/image-url";

export async function CatalogView({
  slug,
  searchParams,
  pageTitle,
  pageDescription,
  basePath: basePathOverride,
  lockSaleFilter,
  embedded,
}: {
  slug?: string;
  searchParams?: Record<string, string | string[] | undefined>;
  pageTitle?: string;
  pageDescription?: string;
  basePath?: string;
  lockSaleFilter?: boolean;
  embedded?: boolean;
}) {
  const data = await getCatalogData(slug, searchParams);
  const basePath = basePathOverride ?? (data.category ? `/catalog/${data.category.slug}` : "/catalog");
  const showCategoryGrid =
    !pageTitle && !data.hasFilters && (data.rootCategories.length > 0 || (data.category?.children.length ?? 0) > 0);
  const categoriesToShow = data.category?.children.length ? data.category.children : data.rootCategories;
  const heroLabel = pageTitle ? "Акции" : "Каталог";
  const heroTitle = pageTitle ?? data.category?.h1 ?? data.category?.name ?? "Каталог товаров";
  const heroDescription =
    pageDescription ??
    data.category?.description ??
    "Гидравлическое оборудование и комплектующие с подбором по артикулу, бренду и характеристикам.";

  const breadcrumbs = [
    { name: "Главная", href: "/" },
    ...(pageTitle
      ? [{ name: pageTitle, href: basePath }]
      : [
          { name: "Каталог", href: "/catalog" },
          ...(data.category?.parent ? [{ name: data.category.parent.name, href: `/catalog/${data.category.parent.slug}` }] : []),
          ...(data.category ? [{ name: data.category.name, href: `/catalog/${data.category.slug}` }] : []),
        ]),
  ];

  const filterGroups = lockSaleFilter
    ? data.filterGroups.map((group) => ({
        ...group,
        fields: group.fields.filter((field) => field.slug !== "sale"),
      }))
    : data.filterGroups;

  const content = (
    <main className="mx-auto max-w-7xl px-3 py-8 sm:px-4 sm:py-10 lg:px-8">
      <nav className="mb-4 flex flex-wrap gap-2 text-sm text-muted">
        {breadcrumbs.map((item, index) => (
          <Link key={item.href} href={item.href} className="hover:text-petrol">
            {item.name}
            {index < breadcrumbs.length - 1 ? " /" : ""}
          </Link>
        ))}
      </nav>

      <div className="mb-8 overflow-hidden rounded-[28px] bg-petrol text-white sm:rounded-[34px]">
        <div className="grid lg:grid-cols-[1fr_280px]">
          <div className="p-5 sm:p-8">
            <div className="text-xs font-bold uppercase tracking-[0.24em] text-lime sm:text-sm">{heroLabel}</div>
            <h1 className="mt-3 text-2xl font-black sm:text-3xl lg:text-4xl">{heroTitle}</h1>
            <p className="mt-3 max-w-3xl text-sm text-white/75 sm:text-base">{heroDescription}</p>
          </div>
          {data.category?.imageUrl ? (
            <div className="relative min-h-[160px] bg-petrol-soft/40 sm:min-h-[200px] lg:min-h-[220px]">
              <ProductImage src={normalizeImageSrc(data.category.imageUrl)} alt={data.category.name} fill sizes="(min-width: 1024px) 280px, 100vw" className="object-cover opacity-90" />
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
          <div
            className={
              data.category
                ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
                : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }
          >
            {categoriesToShow.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                size={data.category ? "sm" : "md"}
                showDescription={!data.category}
              />
            ))}
          </div>
        </section>
      ) : null}

      <div className={`grid gap-8 ${data.showFilterPanel ? "lg:grid-cols-[320px_1fr]" : ""}`}>
        {data.showFilterPanel ? (
          <CatalogFilter
            groups={filterGroups}
            brands={data.brands}
            selected={data.selected}
            basePath={basePath}
            total={data.total}
            hiddenFields={lockSaleFilter ? ["sale"] : undefined}
          />
        ) : null}
        <section>
          <CatalogToolbar basePath={basePath} selected={data.selected} sort={data.sort} perPage={data.perPage} total={data.total} />
          {data.products.length === 0 ? (
            <div className="rounded-[30px] border border-border bg-white p-10 text-center">
              <p className="text-muted">
                {pageTitle ? "Сейчас нет товаров со скидкой. Загляните позже или перейдите в каталог." : "Товары не найдены. Попробуйте изменить фильтры или выберите другую категорию."}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Link href={basePath} className="inline-flex h-11 items-center rounded-full border border-border px-5 text-sm font-bold text-petrol">
                  Сбросить фильтры
                </Link>
                <Link href="/catalog" className="inline-flex h-11 items-center rounded-full bg-petrol px-5 text-sm font-bold text-white">
                  Весь каталог
                </Link>
              </div>
            </div>
          ) : (
            <CatalogProductGrid
              initialProducts={data.products.map(serializeProductCard)}
              page={data.page}
              pages={data.pages}
              perPage={data.perPage}
              total={data.total}
              basePath={basePath}
              selected={data.selected}
              categorySlug={data.category?.slug}
            />
          )}
        </section>
      </div>
    </main>
  );

  if (embedded) return content;

  return (
    <>
      <SiteHeader />
      {content}
      <SiteFooter />
    </>
  );
}
