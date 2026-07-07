import { FieldType, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-query";
import { asNumber } from "@/lib/utils";
import { multiParam, singleParam } from "@/lib/catalog-params";

export { multiParam, singleParam, buildCatalogQuery } from "@/lib/catalog-params";

export const productDetailsInclude = {
  category: { include: { parent: true } },
  brand: true,
  images: { orderBy: { sortOrder: "asc" as const } },
  relatedFrom: {
    include: {
      related: {
        include: {
          brand: true,
          images: { orderBy: { sortOrder: "asc" as const } },
          category: true,
        },
      },
    },
    orderBy: { sortOrder: "asc" as const },
  },
  fieldValues: {
    include: {
      field: { include: { group: true, options: { orderBy: { sortOrder: "asc" as const } } } },
      option: true,
      brandRef: true,
    },
    orderBy: { field: { sortOrder: "asc" as const } },
  },
} satisfies Prisma.ProductInclude;

export type ProductWithDetails = Prisma.ProductGetPayload<{
  include: typeof productDetailsInclude;
}>;

export type ProductCardItem = Prisma.ProductGetPayload<{
  include: {
    brand: true;
    category: true;
    images: true;
  };
}>;

export type CatalogSort = "new" | "price_asc" | "price_desc" | "name_asc" | "name_desc";

export async function getNavigationCategories() {
  return safeQuery(
    "navigationCategories",
    () =>
      prisma.category.findMany({
        where: { parentId: null },
        include: { children: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      }),
    [],
  );
}

async function getCategoryTreeIds(categoryId: string): Promise<string[]> {
  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  });
  const nested = await Promise.all(children.map((child) => getCategoryTreeIds(child.id)));
  return [categoryId, ...nested.flat()];
}

async function resolveCategoryTemplate(category: {
  id: string;
  templateId: string | null;
  parentId: string | null;
}): Promise<string | null> {
  if (category.templateId) return category.templateId;
  if (!category.parentId) return null;

  const parent = await prisma.category.findUnique({
    where: { id: category.parentId },
    select: { id: true, templateId: true, parentId: true },
  });

  return parent ? resolveCategoryTemplate(parent) : null;
}

function resolveSortOrder(sort?: string): Prisma.ProductOrderByWithRelationInput {
  switch (sort as CatalogSort) {
    case "price_asc":
      return { price: "asc" };
    case "price_desc":
      return { price: "desc" };
    case "name_asc":
      return { name: "asc" };
    case "name_desc":
      return { name: "desc" };
    default:
      return { createdAt: "desc" };
  }
}

export async function getHomeData() {
  const [banners, categories, products, brands] = await Promise.all([
    safeQuery("homeBanners", () => prisma.homeBanner.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }), []),
    getNavigationCategories(),
    safeQuery(
      "homeProducts",
      () =>
        prisma.product.findMany({
          take: 8,
          include: { brand: true, category: true, images: { orderBy: { sortOrder: "asc" } } },
          orderBy: { createdAt: "desc" },
        }),
      [],
    ),
    safeQuery(
      "homeBrands",
      () =>
        prisma.brand.findMany({
          where: { products: { some: {} } },
          orderBy: { name: "asc" },
          take: 12,
        }),
      [],
    ),
  ]);

  return { banners, categories, products, brands };
}

export async function getPublicBrands() {
  return safeQuery(
    "publicBrands",
    () =>
      prisma.brand.findMany({
        where: { products: { some: {} } },
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
      }),
    [],
  );
}

export async function getCatalogData(slug?: string, searchParams?: Record<string, string | string[] | undefined>) {
  const category = slug
    ? await prisma.category.findUnique({
        where: { slug },
        include: { children: { orderBy: { sortOrder: "asc" } }, parent: true, template: true },
      })
    : null;

  const rootCategories = !slug
    ? await prisma.category.findMany({
        where: { parentId: null },
        include: { children: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      })
    : [];

  const page = Math.max(1, asNumber(searchParams?.page, 1));
  const perPage = Math.min(48, Math.max(12, asNumber(searchParams?.perPage, 12)));
  const skip = (page - 1) * perPage;
  const q = singleParam(searchParams?.q);
  const brandSlug = singleParam(searchParams?.brand);
  const sort = singleParam(searchParams?.sort) ?? "new";
  const showAllProducts = singleParam(searchParams?.all) === "1";
  const hasFilters =
    showAllProducts ||
    Boolean(
      q ||
        brandSlug ||
        sort !== "new" ||
        Object.keys(searchParams ?? {}).some(
          (key) =>
            key.startsWith("min_") ||
            key.startsWith("max_") ||
            (key !== "page" && key !== "perPage" && key !== "sort" && key !== "all" && !key.startsWith("f_")),
        ),
    );

  const categoryIds = category ? await getCategoryTreeIds(category.id) : undefined;
  const templateId = category ? await resolveCategoryTemplate(category) : null;

  const where: Prisma.ProductWhereInput = {
    ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { brand: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(brandSlug ? { brand: { slug: brandSlug } } : {}),
  };

  const fieldFilters = await buildFieldFilters(templateId, searchParams);
  if (fieldFilters.length) {
    where.AND = fieldFilters;
  }

  const [products, total, brands, filterGroups] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { brand: true, category: true, images: { orderBy: { sortOrder: "asc" } } },
      orderBy: resolveSortOrder(sort),
      take: perPage,
      skip,
    }),
    prisma.product.count({ where }),
    getScopedBrands(categoryIds, searchParams, templateId),
    getFilterGroups(templateId, categoryIds, searchParams),
  ]);

  return {
    category,
    rootCategories,
    hasFilters,
    products,
    total,
    page,
    perPage,
    sort,
    pages: Math.max(1, Math.ceil(total / perPage)),
    brands,
    filterGroups,
    selected: searchParams ?? {},
  };
}

async function getScopedBrands(
  categoryIds: string[] | undefined,
  searchParams?: Record<string, string | string[] | undefined>,
  templateId?: string | null,
) {
  const baseWhere: Prisma.ProductWhereInput = {
    ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
  };

  const q = singleParam(searchParams?.q);
  if (q) {
    baseWhere.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { brand: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  const fieldFilters = await buildFieldFilters(templateId, searchParams, { skipBrand: true });
  if (fieldFilters.length) {
    baseWhere.AND = fieldFilters;
  }

  const grouped = await prisma.product.groupBy({
    by: ["brandId"],
    where: { ...baseWhere, brandId: { not: null } },
    _count: { id: true },
  });

  const brandIds = grouped.map((item) => item.brandId).filter((id): id is string => Boolean(id));
  if (!brandIds.length) return [];

  const brands = await prisma.brand.findMany({
    where: { id: { in: brandIds } },
    orderBy: { name: "asc" },
  });

  const countMap = new Map(grouped.map((item) => [item.brandId, item._count.id]));

  return brands.map((brand) => ({
    name: brand.name,
    slug: brand.slug,
    count: countMap.get(brand.id) ?? 0,
  }));
}

async function getFilterGroups(
  templateId: string | null | undefined,
  categoryIds: string[] | undefined,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  if (!templateId) return [];

  const fields = await prisma.fieldDefinition.findMany({
    where: { templateId, isFilterable: true },
    include: {
      group: true,
      options: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: [{ group: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  const baseWhere: Prisma.ProductWhereInput = {
    ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
  };

  const q = singleParam(searchParams?.q);
  const brandSlug = singleParam(searchParams?.brand);
  if (q) {
    baseWhere.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { brand: { name: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (brandSlug) {
    baseWhere.brand = { slug: brandSlug };
  }

  const otherFieldFilters = await buildFieldFilters(templateId, searchParams);
  if (otherFieldFilters.length) {
    baseWhere.AND = otherFieldFilters;
  }

  const productIds = (
    await prisma.product.findMany({
      where: baseWhere,
      select: { id: true },
    })
  ).map((product) => product.id);

  const grouped = new Map<
    string,
    {
      id: string;
      name: string;
      collapsed: boolean;
      fields: Array<{
        id: string;
        name: string;
        slug: string;
        type: string;
        unit: string | null;
        min?: number;
        max?: number;
        options: Array<{ id: string; label: string; slug: string }>;
        optionCounts: Record<string, number>;
      }>;
    }
  >();

  for (const field of fields) {
    const groupId = field.group?.id ?? "common";
    const group = grouped.get(groupId) ?? {
      id: groupId,
      name: field.group?.name ?? "Основные фильтры",
      collapsed: field.group?.collapsed ?? false,
      fields: [],
    };

    const optionCounts: Record<string, number> = {};

    if (field.type === FieldType.NUMBER || field.type === FieldType.RANGE) {
      const numericValues = await prisma.productFieldValue.findMany({
        where: {
          fieldId: field.id,
          productId: productIds.length ? { in: productIds } : undefined,
          valueNumber: { not: null },
        },
        select: { valueNumber: true },
      });
      const numbers = numericValues.map((value) => Number(value.valueNumber)).filter(Number.isFinite);
      group.fields.push({
        id: field.id,
        name: field.name,
        slug: field.slug,
        type: field.type,
        unit: field.unit,
        min: numbers.length ? Math.min(...numbers) : undefined,
        max: numbers.length ? Math.max(...numbers) : undefined,
        options: field.options,
        optionCounts,
      });
    } else if (field.type === FieldType.SELECT || field.type === FieldType.MULTISELECT) {
      const counts = await prisma.productFieldValue.groupBy({
        by: ["optionId"],
        where: {
          fieldId: field.id,
          productId: productIds.length ? { in: productIds } : undefined,
          optionId: { not: null },
        },
        _count: { id: true },
      });

      for (const row of counts) {
        if (row.optionId) optionCounts[row.optionId] = row._count.id;
      }

      group.fields.push({
        id: field.id,
        name: field.name,
        slug: field.slug,
        type: field.type,
        unit: field.unit,
        options: field.options,
        optionCounts,
      });
    }

    grouped.set(groupId, group);
  }

  return Array.from(grouped.values());
}

async function buildFieldFilters(
  templateId?: string | null,
  searchParams?: Record<string, string | string[] | undefined>,
  options?: { skipBrand?: boolean },
): Promise<Prisma.ProductWhereInput[]> {
  if (!templateId || !searchParams) return [];

  const fields = await prisma.fieldDefinition.findMany({
    where: { templateId, isFilterable: true },
    include: { options: true },
  });

  const filters: Prisma.ProductWhereInput[] = [];

  for (const field of fields) {
    if (field.type === FieldType.NUMBER || field.type === FieldType.RANGE) {
      const min = singleParam(searchParams[`min_${field.slug}`]);
      const max = singleParam(searchParams[`max_${field.slug}`]);
      if (!min && !max) continue;

      filters.push({
        fieldValues: {
          some: {
            fieldId: field.id,
            valueNumber: {
              ...(min ? { gte: asNumber(min) } : {}),
              ...(max ? { lte: asNumber(max) } : {}),
            },
          },
        },
      });
      continue;
    }

    const selected = multiParam(searchParams[field.slug]);
    if (!selected.length) continue;
    const selectedOptionIds = field.options.filter((option) => selected.includes(option.slug)).map((option) => option.id);

    if (!selectedOptionIds.length) continue;

    filters.push({
      fieldValues: {
        some: {
          fieldId: field.id,
          optionId: { in: selectedOptionIds },
        },
      },
    });
  }

  if (!options?.skipBrand && singleParam(searchParams.brand)) {
    // brand handled in main where
  }

  return filters;
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: productDetailsInclude,
  });
}

export async function getRelatedProducts(product: ProductWithDetails) {
  const manual = product.relatedFrom.map((relation) => relation.related);
  if (manual.length >= 4) return manual.slice(0, 4);

  const automatic = await prisma.product.findMany({
    where: {
      id: { not: product.id, notIn: manual.map((item) => item.id) },
      OR: [{ categoryId: product.categoryId }, { brandId: product.brandId ?? undefined }],
    },
    include: { brand: true, category: true, images: { orderBy: { sortOrder: "asc" } } },
    take: 4 - manual.length,
  });

  return [...manual, ...automatic];
}

export async function searchProducts(query: string) {
  if (!query || query.length < 2) return [];

  return prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { sku: { contains: query, mode: "insensitive" } },
        { brand: { name: { contains: query, mode: "insensitive" } } },
      ],
    },
    include: { brand: true, images: { orderBy: { sortOrder: "asc" } }, category: true },
    take: 8,
  });
}

export async function getAdminStats() {
  const [products, categories, orders, fields] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.fieldDefinition.count(),
  ]);

  return { products, categories, orders, fields };
}

export async function getAdminCatalog() {
  const [categories, brands, templates, products] = await Promise.all([
    prisma.category.findMany({ include: { parent: true, template: true }, orderBy: { sortOrder: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.fieldTemplate.findMany({
      include: { fields: { include: { group: true, options: true }, orderBy: { sortOrder: "asc" } } },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      include: { brand: true, category: true, images: { orderBy: { sortOrder: "asc" } }, fieldValues: { include: { field: true, option: true } } },
      orderBy: { updatedAt: "desc" },
      take: 500,
    }),
  ]);

  return { categories, brands, templates, products };
}

export async function getAdminOrders() {
  return prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSeoData() {
  const [templates, redirects] = await Promise.all([
    prisma.seoTemplate.findMany({ orderBy: { entityType: "asc" } }),
    prisma.redirect.findMany({ orderBy: { fromPath: "asc" } }),
  ]);

  return { templates, redirects };
}
