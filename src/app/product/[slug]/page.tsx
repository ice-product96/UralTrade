import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, ShieldCheck, Truck } from "lucide-react";
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
        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <ProductGallery images={product.images} productName={product.name} />
          <div className="space-y-5 sm:space-y-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-lime sm:text-sm">{product.sku}</div>
              <p className="mt-3 text-base leading-7 text-muted sm:mt-4 sm:text-lg sm:leading-8">{product.shortDescription}</p>
            </div>
            <div className="rounded-[24px] border border-border bg-white p-5 shadow-xl shadow-petrol/5 sm:rounded-[30px] sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-3xl font-black text-petrol sm:text-4xl">{formatPrice(product.price)}</div>
                  {hasDiscount(product.oldPrice, product.price) ? (
                    <div className="text-muted line-through">{formatPrice(product.oldPrice!)}</div>
                  ) : null}
                </div>
                <span className="rounded-full bg-lime/10 px-4 py-2 text-sm font-bold text-lime">
                  {product.inStock ? "В наличии" : "Под заказ"}
                </span>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <AddToCartButton productId={product.id} />
                <QuickOrderButton productId={product.id} productName={product.name} />
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl bg-background p-4">
                  <ShieldCheck className="h-5 w-5 text-lime" />
                  <span className="text-sm font-semibold text-graphite">Оригинальные карточки и документация</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-background p-4">
                  <Truck className="h-5 w-5 text-lime" />
                  <span className="text-sm font-semibold text-graphite">Доставка до транспортной компании</span>
                </div>
                {product.brand ? (
                  <Link
                    href={`/catalog?brand=${product.brand.slug}`}
                    className="flex items-center gap-3 rounded-2xl bg-background p-4 transition hover:bg-white hover:shadow-sm"
                  >
                    {product.brand.logoUrl ? (
                      <ProductImage src={normalizeImageSrc(product.brand.logoUrl)} alt={product.brand.name} width={64} height={32} className="object-contain" />
                    ) : null}
                    <span className="text-sm font-semibold text-graphite hover:text-petrol">{product.brand.name}</span>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </section>
        <section className="mt-10 sm:mt-14">
          <div className="rounded-[24px] border border-border bg-white p-5 sm:rounded-[30px] sm:p-6">
            <h2 className="text-2xl font-black text-graphite">Описание</h2>
            <div className="rich-text mt-5" dangerouslySetInnerHTML={{ __html: absolutizeImportedHtml(product.fullDescription) }} />
            <div className="mt-8 space-y-6">
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
