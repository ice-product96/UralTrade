import { FieldType, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { asNumber } from "@/lib/utils";

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

export async function getNavigationCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    include: { children: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
}

async function getCategoryTreeIds(categoryId: string): Promise<string[]> {
  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  });
  const nested = await Promise.all(children.map((child) => getCategoryTreeIds(child.id)));
  return [categoryId, ...nested.flat()];
}

export async function getHomeData() {
  const [banners, categories, products] = await Promise.all([
    prisma.homeBanner.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    getNavigationCategories(),
    prisma.product.findMany({
      take: 8,
      include: { brand: true, category: true, images: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { banners, categories, products };
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
  const take = 12;
  const skip = (page - 1) * take;
  const q = singleParam(searchParams?.q);
  const brandSlug = singleParam(searchParams?.brand);
  const showAllProducts = singleParam(searchParams?.all) === "1";
  const hasFilters =
    showAllProducts ||
    Boolean(q || brandSlug || Object.keys(searchParams ?? {}).some((key) => key.startsWith("f_") || (key === "page" && Number(searchParams?.page) > 1)));

  const categoryIds = category ? await getCategoryTreeIds(category.id) : undefined;

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

  const filters = await buildFieldFilters(category?.templateId, searchParams);
  if (filters.length) {
    where.AND = filters;
  }

  const [products, total, brands, filterGroups] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { brand: true, category: true, images: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.product.count({ where }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    getFilterGroups(category?.templateId),
  ]);

  return {
    category,
    rootCategories,
    hasFilters,
    products,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / take)),
    brands,
    filterGroups,
    selected: searchParams ?? {},
  };
}

async function getFilterGroups(templateId?: string | null) {
  if (!templateId) return [];

  const fields = await prisma.fieldDefinition.findMany({
    where: { templateId, isFilterable: true },
    include: {
      group: true,
      options: { orderBy: { sortOrder: "asc" } },
      values: {
        include: { option: true },
      },
    },
    orderBy: [{ group: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  const grouped = new Map<
    string,
    {
      id: string;
      name: string;
      collapsed: boolean;
      fields: Array<(typeof fields)[number] & { min?: number; max?: number; optionCounts?: Map<string, number> }>;
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

    const numericValues = field.values
      .map((value) => (value.valueNumber == null ? null : Number(value.valueNumber)))
      .filter((value): value is number => value !== null);
    const optionCounts = new Map<string, number>();
    for (const value of field.values) {
      if (value.optionId) {
        optionCounts.set(value.optionId, (optionCounts.get(value.optionId) ?? 0) + 1);
      }
    }

    group.fields.push({
      ...field,
      min: numericValues.length ? Math.min(...numericValues) : undefined,
      max: numericValues.length ? Math.max(...numericValues) : undefined,
      optionCounts,
    });
    grouped.set(groupId, group);
  }

  return Array.from(grouped.values());
}

async function buildFieldFilters(
  templateId?: string | null,
  searchParams?: Record<string, string | string[] | undefined>,
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
      take: 50,
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

export function singleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function multiParam(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : value.split(",").filter(Boolean);
}
