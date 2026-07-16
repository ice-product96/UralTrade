import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Truck } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { QuickOrderButton } from "@/components/quick-order-button";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ProductImage } from "@/components/product-image";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";
import { formatPrice, hasDiscount } from "@/lib/format";
import { absolutizeImportedHtml, normalizeImageSrc } from "@/lib/image-url";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const image = product.images[0]?.url;

  return {
    title: product.metaTitle ?? `${product.name} купить`,
    description: product.metaDescription ?? product.shortDescription,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.metaTitle ?? product.name,
      description: product.metaDescription ?? product.shortDescription,
      images: image ? [{ url: image }] : undefined,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const groups = groupValues(product);
  const allSpecs = groups.flatMap((group) => group.items);
  const previewSpecs = allSpecs.slice(0, 4);
  const breadcrumbs = [
    { name: "Главная", href: "/" },
    { name: "Каталог", href: "/catalog" },
    ...(product.category.parent ? [{ name: product.category.parent.name, href: `/catalog/${product.category.parent.slug}` }] : []),
    { name: product.category.name, href: `/catalog/${product.category.slug}` },
    { name: product.name, href: `/product/${product.slug}` },
  ];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-8">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }} />
        <nav className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted sm:mb-4 sm:text-sm">
          {breadcrumbs.map((item, index) => (
            <span key={item.href} className="inline-flex min-w-0 items-center gap-x-2">
              {index > 0 ? <span className="text-border">/</span> : null}
              <Link href={item.href} className="truncate hover:text-petrol">
                {item.name}
              </Link>
            </span>
          ))}
        </nav>
        <h1 className="mb-6 max-w-4xl text-2xl font-black leading-tight text-graphite sm:mb-8 sm:text-3xl md:text-4xl">
          {product.h1 ?? product.name}
        </h1>
        <section>
          <ProductGallery images={product.images} productName={product.name}>
            <div className="flex min-h-0 flex-1 flex-col gap-2.5 lg:overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Артикул</span>
                  <span className="truncate text-sm font-bold text-lime">{product.sku}</span>
                </div>
                <span className="rounded-full bg-lime/10 px-3 py-1 text-xs font-bold text-lime">
                  {product.inStock ? "В наличии" : "Под заказ"}
                </span>
              </div>

              {product.shortDescription ? (
                <div>
                  <p className="line-clamp-2 text-sm leading-5 text-muted">{product.shortDescription}</p>
                  <a href="#description" className="mt-0.5 inline-flex text-xs font-bold text-petrol hover:text-lime">
                    Полное описание
                  </a>
                </div>
              ) : (
                <a href="#description" className="inline-flex text-xs font-bold text-petrol hover:text-lime">
                  Полное описание
                </a>
              )}

              <div className="flex flex-wrap items-end gap-x-3 gap-y-0.5">
                <div className="text-2xl font-black text-petrol sm:text-3xl">{formatPrice(product.price)}</div>
                {hasDiscount(product.oldPrice, product.price) ? (
                  <div className="pb-0.5 text-sm text-muted line-through">{formatPrice(product.oldPrice!)}</div>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <AddToCartButton productId={product.id} className="h-10 text-sm" />
                <QuickOrderButton productId={product.id} productName={product.name} />
              </div>

              {previewSpecs.length ? (
                <div className="min-h-0">
                  <div className="text-[11px] font-black uppercase tracking-[0.12em] text-graphite">Характеристики</div>
                  <dl className="mt-1">
                    {previewSpecs.map((item) => (
                      <div key={item.id} className="grid grid-cols-[1fr_auto] gap-2 border-b border-border/60 py-1 text-xs last:border-b-0">
                        <dt className="truncate text-muted">{item.name}</dt>
                        <dd className="font-bold text-graphite">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <a href="#specs" className="mt-1 inline-flex text-xs font-bold text-petrol hover:text-lime">
                    Полные характеристики
                  </a>
                </div>
              ) : null}

              <div className="mt-auto grid shrink-0 gap-1.5 sm:grid-cols-2">
                {product.brand ? (
                  <Link
                    href={`/catalog?brand=${product.brand.slug}`}
                    className="flex items-center gap-2 rounded-xl bg-background px-2.5 py-2 transition hover:bg-white hover:shadow-sm"
                  >
                    {product.brand.logoUrl ? (
                      <ProductImage src={normalizeImageSrc(product.brand.logoUrl)} alt={product.brand.name} width={40} height={20} className="object-contain" />
                    ) : null}
                    <span className="truncate text-xs font-semibold text-graphite hover:text-petrol">{product.brand.name}</span>
                  </Link>
                ) : null}
                <div className="flex items-center gap-2 rounded-xl bg-background px-2.5 py-2">
                  <Truck className="h-4 w-4 shrink-0 text-lime" />
                  <span className="text-xs font-semibold leading-snug text-graphite">Доставка до транспортной компании</span>
                </div>
              </div>
            </div>
          </ProductGallery>
        </section>
        <section id="description" className="mt-10 scroll-mt-24 sm:mt-14">
          <div className="rounded-[24px] border border-border bg-white p-5 sm:rounded-[30px] sm:p-6">
            <h2 className="text-2xl font-black text-graphite">Описание</h2>
            <div className="rich-text mt-5" dangerouslySetInnerHTML={{ __html: absolutizeImportedHtml(product.fullDescription) }} />
            {groups.length ? (
              <div id="specs" className="mt-8 scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-black text-graphite">Характеристики</h2>
                {groups.map((group) => (
                  <div key={group.name}>
                    <h3 className="text-lg font-black text-petrol">{group.name}</h3>
                    <dl className="mt-3 grid gap-2">
                      {group.items.map((item) => (
                        <div key={item.id} className="grid gap-2 rounded-2xl bg-background p-4 sm:grid-cols-[220px_1fr]">
                          <dt className="font-semibold text-muted">{item.name}</dt>
                          <dd className="font-bold text-graphite">{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
        {product.documents.length || product.fieldValues.some((value) => value.valueFileUrl) ? (
          <section className="mt-6 sm:mt-8">
            <div className="rounded-[24px] border border-border bg-white p-5 sm:rounded-[30px] sm:p-6">
              <h2 className="text-2xl font-black text-graphite">Техническая документация</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {product.documents.map((document) => (
                  <a
                    key={document.id}
                    href={document.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-2xl bg-background p-4 font-bold text-petrol transition hover:bg-white hover:shadow-sm"
                  >
                    <FileText className="h-5 w-5 shrink-0 text-lime" />
                    {document.title}
                  </a>
                ))}
                {product.fieldValues
                  .filter((value) => value.valueFileUrl && !product.documents.some((document) => document.url === value.valueFileUrl))
                  .map((value) => (
                    <a
                      key={value.id}
                      href={value.valueFileUrl!}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-2xl bg-background p-4 font-bold text-petrol transition hover:bg-white hover:shadow-sm"
                    >
                      <FileText className="h-5 w-5 shrink-0 text-lime" />
                      {value.field.name}
                    </a>
                  ))}
              </div>
            </div>
          </section>
        ) : null}
        {related.length ? (
          <section className="mt-16">
            <h2 className="text-3xl font-black text-graphite">Похожие товары</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}

function groupValues(product: Awaited<ReturnType<typeof getProductBySlug>> & {}) {
  if (!product) return [];

  const groups = new Map<string, Array<{ id: string; name: string; value: string }>>();

  for (const value of product.fieldValues) {
    if (value.valueFileUrl) continue;
    const groupName = value.field.group?.name ?? "Характеристики";
    const group = groups.get(groupName) ?? [];
    group.push({
      id: value.id,
      name: value.field.name,
      value: formatFieldValue(value),
    });
    groups.set(groupName, group);
  }

  return Array.from(groups.entries()).map(([name, items]) => ({ name, items }));
}

function formatFieldValue(value: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>["fieldValues"][number]) {
  if (value.option) return value.option.label;
  if (value.brandRef) return value.brandRef.name;
  if (value.valueNumber != null) return `${value.valueNumber}${value.field.unit ? ` ${value.field.unit}` : ""}`;
  if (value.valueBoolean != null) return value.valueBoolean ? "Да" : "Нет";
  if (value.valueText) return value.valueText;
  if (Array.isArray(value.valueJson)) {
    return value.valueJson
      .map((item) => {
        if (!item || typeof item !== "object" || !("key" in item) || !("value" in item)) return null;
        return `${String(item.key)}: ${String(item.value)}`;
      })
      .filter(Boolean)
      .join(", ");
  }
  return "Заполнено";
}
