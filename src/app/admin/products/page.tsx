import { ProductsCrud } from "@/components/admin/products-crud";
import { getAdminCatalog } from "@/lib/data";
import { singleParam } from "@/lib/catalog-params";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const categoryId = singleParam(params.category) ?? undefined;
  const brandId = singleParam(params.brand) ?? undefined;
  const q = singleParam(params.q) ?? undefined;
  const pageParam = Number(singleParam(params.page) ?? "1");

  const catalog = await getAdminCatalog({
    categoryId,
    brandId,
    q,
    page: Number.isFinite(pageParam) ? pageParam : 1,
  });

  const { products, categories, brands, templates, total, pages, perPage, page, categoryCounts } = catalog;

  const fields = templates.flatMap((template) =>
    template.fields.map((field) => ({
      id: field.id,
      name: field.name,
      type: field.type,
      unit: field.unit,
      templateId: template.id,
      templateName: template.name,
      options: field.options.map((option) => ({ label: option.label, slug: option.slug })),
    })),
  );

  const serializedProducts = products.map((product) => ({
    ...product,
    price: product.price.toString(),
    oldPrice: product.oldPrice?.toString() ?? null,
    fieldValues: product.fieldValues.map((value) => ({
      fieldId: value.fieldId,
      field: value.field,
      option: value.option,
      valueText: value.valueText,
      valueNumber: value.valueNumber?.toString() ?? null,
      valueBoolean: value.valueBoolean,
      valueFileUrl: value.valueFileUrl,
      valueJson: value.valueJson,
    })),
    documents: product.documents.map((document) => ({
      title: document.title,
      url: document.url,
      fileName: document.fileName,
    })),
  }));

  const categoryOptions = buildCategoryOptions(categories, categoryCounts);

  return (
    <ProductsCrud
      products={serializedProducts}
      categories={categoryOptions}
      brands={brands}
      templates={templates.map((template) => ({ id: template.id, name: template.name }))}
      fields={fields}
      total={total}
      page={page}
      pages={pages}
      perPage={perPage}
      initialQuery={q ?? ""}
      initialCategoryId={categoryId ?? ""}
      initialBrandId={brandId ?? ""}
    />
  );
}

type CategoryRow = Awaited<ReturnType<typeof getAdminCatalog>>["categories"][number];

function buildCategoryOptions(categories: CategoryRow[], counts: Map<string, number>) {
  const byParent = new Map<string | null, CategoryRow[]>();

  for (const category of categories) {
    const key = category.parentId;
    const list = byParent.get(key) ?? [];
    list.push(category);
    byParent.set(key, list);
  }

  const result: Array<{
    id: string;
    name: string;
    templateId: string | null;
    parent: { name: string } | null;
    depth: number;
    productCount: number;
    label: string;
  }> = [];

  function walk(parentId: string | null, depth: number) {
    const items = byParent.get(parentId) ?? [];
    for (const category of items) {
      const count = counts.get(category.id) ?? 0;
      const indent = depth > 0 ? `${"— ".repeat(depth)}` : "";
      result.push({
        id: category.id,
        name: category.name,
        templateId: category.templateId,
        parent: category.parent,
        depth,
        productCount: count,
        label: `${indent}${category.name}${count ? ` (${count})` : ""}`,
      });
      walk(category.id, depth + 1);
    }
  }

  walk(null, 0);
  return result;
}
