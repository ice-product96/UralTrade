import { NextResponse } from "next/server";
import { parseSpecJson, slugifySpecKey } from "@/lib/catalog-facets";
import type { ComparePayload, CompareRow } from "@/lib/compare-types";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { COMPARE_LIMIT } from "@/lib/product-lists";
import { formatFieldValue } from "@/lib/product-specs";
import { slugify } from "@/lib/utils";

const BASE_GROUP = "Основное";

type RowDraft = {
  key: string;
  name: string;
  group: string;
  groupIndex: number;
  order: number;
  values: Record<string, string>;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") ?? "").split(",").filter(Boolean).slice(0, COMPARE_LIMIT);

  const empty: ComparePayload = { products: [], rows: [] };
  if (!ids.length) return NextResponse.json(empty);

  const found = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      fieldValues: {
        include: { field: { include: { group: true } }, option: true, brandRef: true },
        orderBy: { field: { sortOrder: "asc" } },
      },
    },
  });

  const products = ids
    .map((id) => found.find((product) => product.id === id))
    .filter((product): product is (typeof found)[number] => Boolean(product));

  const drafts = new Map<string, RowDraft>();
  const groupIndexes = new Map<string, number>([[BASE_GROUP, 0]]);

  function push(key: string, name: string, group: string, order: number, productId: string, value: string) {
    if (!value) return;

    let groupIndex = groupIndexes.get(group);
    if (groupIndex === undefined) {
      groupIndex = groupIndexes.size;
      groupIndexes.set(group, groupIndex);
    }

    const draft = drafts.get(key) ?? { key, name, group, groupIndex, order, values: {} };
    draft.values[productId] ??= value;
    drafts.set(key, draft);
  }

  for (const product of products) {
    push("base:price", "Цена", BASE_GROUP, 10, product.id, formatPrice(product.price));
    push("base:stock", "Наличие", BASE_GROUP, 20, product.id, product.inStock ? "В наличии" : "Под заказ");
    push("base:brand", "Бренд", BASE_GROUP, 30, product.id, product.brand?.name ?? "—");
    push("base:category", "Категория", BASE_GROUP, 40, product.id, product.category?.name ?? "—");

    for (const value of product.fieldValues) {
      if (value.valueFileUrl) continue;

      const group = value.field.group?.name ?? "Характеристики";
      const specs = parseSpecJson(value.valueJson);

      if (specs.length) {
        specs.forEach((spec, index) => {
          push(`spec:${slugifySpecKey(spec.key)}`, spec.key, group, value.field.sortOrder + index, product.id, spec.value);
        });
        continue;
      }

      push(
        `field:${slugify(value.field.name) || value.field.id}`,
        value.field.name,
        group,
        value.field.sortOrder,
        product.id,
        formatFieldValue(value),
      );
    }
  }

  const rows: CompareRow[] = [...drafts.values()]
    .sort((a, b) => a.groupIndex - b.groupIndex || a.order - b.order || a.name.localeCompare(b.name, "ru"))
    .map((draft) => {
      const values = Object.fromEntries(products.map((product) => [product.id, draft.values[product.id] ?? null]));
      const list = products.map((product) => values[product.id] ?? "");
      return {
        key: draft.key,
        name: draft.name,
        group: draft.group,
        identical: list.every((item) => item === list[0]),
        values,
      };
    });

  const payload: ComparePayload = {
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: product.price.toString(),
      oldPrice: product.oldPrice?.toString() ?? null,
      inStock: product.inStock,
      image: product.images[0]?.url ?? null,
      brandName: product.brand?.name ?? null,
      categoryName: product.category?.name ?? null,
    })),
    rows,
  };

  return NextResponse.json(payload);
}
