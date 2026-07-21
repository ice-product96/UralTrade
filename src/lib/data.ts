import { FieldType, FilterWidget, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-query";
import { asNumber } from "@/lib/utils";
import {
  countSpecFacetOptions,
  discoverSpecFacets,
  filterProductIdsBySpecFacets,
  parseSpecFacetParams,
  parseSpecJson,
  SPEC_FACET_SEARCH_THRESHOLD,
  SPEC_FACET_TOP_VALUES,
  specFacetParamKey,
  type ProductSpecRow,
} from "@/lib/catalog-facets";
import { hasActiveCatalogFilters, multiParam, singleParam } from "@/lib/catalog-params";
import { contentPageSeeds } from "@/lib/site-nav";
import { parseFaqHtml } from "@/lib/faq";
import type { CatalogFilterGroup } from "@/lib/catalog-types";
import type { SiteContactData } from "@/lib/contacts";

export { multiParam, singleParam, buildCatalogQuery } from "@/lib/catalog-params";

export const productDetailsInclude = {
  category: { include: { parent: true } },
  brand: true,
  images: { orderBy: { sortOrder: "asc" as const } },
  documents: { orderBy: { sortOrder: "asc" as const } },
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
  relatedTo: {
    include: {
      product: {
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

export type { CatalogFilterField, CatalogFilterGroup } from "@/lib/catalog-types";

type WhereBuildOptions = {
  categoryIds?: string[];
  templateId?: string | null;
  searchParams?: Record<string, string | string[] | undefined>;
  specRows?: ProductSpecRow[];
  exclude?: {
    brand?: boolean;
    price?: boolean;
    availability?: boolean;
    specKeySlug?: string;
    fieldSlug?: string;
  };
};

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
  const [homePage, features, categories, products, brands, services] = await Promise.all([
    safeQuery(
      "homePage",
      () => prisma.homePage.findUnique({ where: { id: "default" } }),
      null,
    ),
    safeQuery("homeFeatures", () => prisma.homeFeature.findMany({ orderBy: { sortOrder: "asc" } }), []),
    getNavigationCategories(),
    safeQuery(
      "homeProducts",
      () =>
        prisma.product.findMany({
          take: 10,
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
          take: 6,
        }),
      [],
    ),
    safeQuery(
      "homeServices",
      () =>
        prisma.service.findMany({
          where: { published: true },
          orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
          take: 10,
        }),
      [],
    ),
  ]);

  return { homePage, features, categories, products, brands, services };
}

export async function getHomePageSettings() {
  const [homePage, features] = await Promise.all([
    prisma.homePage.findUnique({ where: { id: "default" } }),
    prisma.homeFeature.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return {
    homePage: homePage ?? {
      title: "Инженерное оборудование с умным подбором",
      subtitle: "Каталог UralTrade помогает быстро найти товар по артикулу, бренду и точным техническим параметрам.",
      imageUrl: "/demo/hero-equipment.jpg",
    },
    features,
  };
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

export async function getContentPage(slug: string) {
  const existing = await prisma.contentPage.findUnique({ where: { slug } });
  if (existing) return existing;

  const seed = contentPageSeeds.find((page) => page.slug === slug);
  if (!seed) return null;

  return prisma.contentPage.create({ data: seed });
}

export async function getPublishedFaqItems() {
  const select = { id: true, question: true, answer: true } as const;

  try {
    let items = await prisma.faqItem.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select,
    });

    if (items.length === 0) {
      await importFaqItemsFromContentPage();
      items = await prisma.faqItem.findMany({
        where: { published: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select,
      });
    }

    if (items.length > 0) return items;
  } catch {
    // Таблица FaqItem ещё не создана (миграция не применена) — fallback ниже.
  }

  const page = await getContentPage("faq");
  const parsed = parseFaqHtml(page?.body ?? "");
  return parsed.map((item, index) => ({
    id: `legacy-${index}`,
    question: item.question,
    answer: item.answer,
  }));
}

async function importFaqItemsFromContentPage() {
  const count = await prisma.faqItem.count();
  if (count > 0) return;

  const page = await prisma.contentPage.findUnique({ where: { slug: "faq" } });
  const parsed = parseFaqHtml(page?.body ?? "");
  if (!parsed.length) return;

  await prisma.faqItem.createMany({
    data: parsed.map((item, index) => ({
      question: item.question,
      answer: item.answer,
      sortOrder: (index + 1) * 10,
      published: true,
    })),
  });
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
  const sort = singleParam(searchParams?.sort) ?? "new";
  const showAllProducts = singleParam(searchParams?.all) === "1";
  const hasFilters = showAllProducts || hasActiveCatalogFilters(searchParams);
  const showFilterPanel = Boolean(category) || hasFilters;

  const categoryIds = category ? await getCategoryTreeIds(category.id) : undefined;
  const templateId = category ? await resolveCategoryTemplate(category) : await resolveCatalogTemplateId(categoryIds);
  const scopeWhere: Prisma.ProductWhereInput = categoryIds ? { categoryId: { in: categoryIds } } : {};

  const specsFieldIds = await getSpecsFieldIds(templateId, categoryIds);
  const specRows = await loadProductSpecRows(specsFieldIds, scopeWhere);

  const where = await buildProductWhere({
    categoryIds,
    templateId,
    searchParams,
    specRows,
  });

  const [products, total, brands, filterGroups] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { brand: true, category: true, images: { orderBy: { sortOrder: "asc" } } },
      orderBy: resolveSortOrder(sort),
      take: perPage,
      skip,
    }),
    prisma.product.count({ where }),
    getScopedBrands(categoryIds, searchParams, templateId, specRows),
    showFilterPanel
      ? getCatalogFilters(templateId, categoryIds, searchParams, specRows)
      : Promise.resolve([] as CatalogFilterGroup[]),
  ]);

  return {
    category,
    rootCategories,
    hasFilters,
    showFilterPanel,
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

async function resolveCatalogTemplateId(categoryIds?: string[]): Promise<string | null> {
  const products = await prisma.product.findMany({
    where: categoryIds ? { categoryId: { in: categoryIds } } : {},
    select: { templateId: true },
    distinct: ["templateId"],
    take: 5,
  });

  const templateIds = products.map((item) => item.templateId).filter((id): id is string => Boolean(id));
  return templateIds.length === 1 ? templateIds[0] : null;
}

async function getSpecsFieldIds(templateId: string | null, categoryIds?: string[]): Promise<string[]> {
  const templateIds = templateId
    ? [templateId]
    : (
        await prisma.product.findMany({
          where: categoryIds ? { categoryId: { in: categoryIds } } : {},
          select: { templateId: true },
          distinct: ["templateId"],
        })
      )
        .map((item) => item.templateId)
        .filter((id): id is string => Boolean(id));

  if (!templateIds.length) return [];

  const fields = await prisma.fieldDefinition.findMany({
    where: {
      templateId: { in: templateIds },
      type: FieldType.KEY_VALUE,
    },
    select: { id: true },
  });

  return [...new Set(fields.map((field) => field.id))];
}

async function loadProductSpecRows(fieldIds: string[], scopeWhere: Prisma.ProductWhereInput): Promise<ProductSpecRow[]> {
  if (!fieldIds.length) return [];

  const values = await prisma.productFieldValue.findMany({
    where: {
      fieldId: { in: fieldIds },
      product: scopeWhere,
      valueJson: { not: Prisma.DbNull },
    },
    select: { productId: true, valueJson: true },
  });

  const byProduct = new Map<string, ReturnType<typeof parseSpecJson>>();
  for (const row of values) {
    const specs = parseSpecJson(row.valueJson);
    if (!specs.length) continue;
    const existing = byProduct.get(row.productId) ?? [];
    byProduct.set(row.productId, [...existing, ...specs]);
  }

  return [...byProduct.entries()].map(([productId, specs]) => ({ productId, specs }));
}

async function getSaleProductIds(categoryIds?: string[]): Promise<string[]> {
  const products = await prisma.product.findMany({
    where: {
      ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
      oldPrice: { not: null },
    },
    select: { id: true, price: true, oldPrice: true },
  });

  return products.filter((product) => Number(product.oldPrice) > Number(product.price)).map((product) => product.id);
}

async function buildProductWhere(options: WhereBuildOptions): Promise<Prisma.ProductWhereInput> {
  const { categoryIds, templateId, searchParams, specRows, exclude } = options;
  const where: Prisma.ProductWhereInput = {};
  const andFilters: Prisma.ProductWhereInput[] = [];

  if (categoryIds?.length) {
    where.categoryId = { in: categoryIds };
  }

  const q = singleParam(searchParams?.q);
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { brand: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  const brandSlug = singleParam(searchParams?.brand);
  if (!exclude?.brand && brandSlug) {
    where.brand = { slug: brandSlug };
  }

  if (!exclude?.price) {
    const minPrice = singleParam(searchParams?.min_price);
    const maxPrice = singleParam(searchParams?.max_price);
    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: asNumber(minPrice) } : {}),
        ...(maxPrice ? { lte: asNumber(maxPrice) } : {}),
      };
    }
  }

  if (!exclude?.availability) {
    if (singleParam(searchParams?.inStock) === "1") {
      where.inStock = true;
    }

    if (singleParam(searchParams?.sale) === "1") {
      const saleIds = await getSaleProductIds(categoryIds);
      andFilters.push({ id: { in: saleIds.length ? saleIds : ["__none__"] } });
    }
  }

  const templateFilters = await buildTemplateFieldFilters(templateId, searchParams, exclude?.fieldSlug);
  if (templateFilters.length) andFilters.push(...templateFilters);

  const selectedFacets = parseSpecFacetParams(searchParams);
  const reducedFacets = { ...selectedFacets };
  if (exclude?.specKeySlug) delete reducedFacets[exclude.specKeySlug];

  if (specRows?.length && Object.keys(reducedFacets).length) {
    const matchedIds = filterProductIdsBySpecFacets(specRows, reducedFacets);
    andFilters.push({ id: { in: matchedIds?.length ? matchedIds : ["__none__"] } });
  }

  if (andFilters.length) {
    where.AND = andFilters;
  }

  return where;
}

async function getScopedBrands(
  categoryIds: string[] | undefined,
  searchParams?: Record<string, string | string[] | undefined>,
  templateId?: string | null,
  specRows?: ProductSpecRow[],
) {
  const baseWhere = await buildProductWhere({
    categoryIds,
    templateId,
    searchParams,
    specRows,
    exclude: { brand: true },
  });

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

async function getCatalogFilters(
  templateId: string | null | undefined,
  categoryIds: string[] | undefined,
  searchParams?: Record<string, string | string[] | undefined>,
  specRows: ProductSpecRow[] = [],
): Promise<CatalogFilterGroup[]> {
  const groups: CatalogFilterGroup[] = [];

  const priceWhere = await buildProductWhere({
    categoryIds,
    templateId,
    searchParams,
    specRows,
    exclude: { price: true },
  });

  const priceAgg = await prisma.product.aggregate({
    where: priceWhere,
    _min: { price: true },
    _max: { price: true },
  });

  const minPrice = priceAgg._min.price ? Number(priceAgg._min.price) : undefined;
  const maxPrice = priceAgg._max.price ? Number(priceAgg._max.price) : undefined;

  if (minPrice != null && maxPrice != null && minPrice <= maxPrice) {
    groups.push({
      id: "price",
      name: "Цена",
      collapsed: false,
      fields: [
        {
          id: "price-range",
          name: "Цена",
          slug: "price",
          type: "PRICE",
          min: minPrice,
          max: maxPrice,
          options: [],
          optionCounts: {},
        },
      ],
    });
  }

  const availabilityWhere = await buildProductWhere({
    categoryIds,
    templateId,
    searchParams,
    specRows,
    exclude: { availability: true },
  });

  const [inStockCount, saleIds] = await Promise.all([
    prisma.product.count({ where: { ...availabilityWhere, inStock: true } }),
    getSaleProductIds(categoryIds),
  ]);

  const saleCount = saleIds.length
    ? await prisma.product.count({
        where: {
          ...availabilityWhere,
          id: { in: saleIds },
        },
      })
    : 0;

  if (inStockCount > 0 || saleCount > 0) {
    groups.push({
      id: "availability",
      name: "Наличие",
      collapsed: false,
      fields: [
        {
          id: "in-stock",
          name: "В наличии",
          slug: "inStock",
          type: "BOOLEAN",
          options: [{ id: "in-stock", label: "В наличии", slug: "1" }],
          optionCounts: { "1": inStockCount },
        },
        ...(saleCount > 0
          ? [
              {
                id: "on-sale",
                name: "Со скидкой",
                slug: "sale",
                type: "BOOLEAN" as const,
                options: [{ id: "on-sale", label: "Со скидкой", slug: "1" }],
                optionCounts: { "1": saleCount },
              },
            ]
          : []),
      ],
    });
  }

  if (templateId) {
    const templateGroups = await getTemplateFilterGroups(templateId, categoryIds, searchParams, specRows);
    groups.push(...templateGroups);
  }

  const specFacets = discoverSpecFacets(specRows);
  const templateSpecKeys = templateId
    ? new Set(
        (
          await prisma.fieldDefinition.findMany({
            where: { templateId, isFilterable: true, slug: { startsWith: "spec-" } },
            select: { slug: true },
          })
        ).map((field) => field.slug),
      )
    : new Set<string>();

  if (specFacets.length) {
    const selected = parseSpecFacetParams(searchParams);

    for (const facet of specFacets) {
      if (templateSpecKeys.has(`spec-${facet.keySlug}`)) continue;
      const facetWhere = await buildProductWhere({
        categoryIds,
        templateId,
        searchParams,
        specRows,
        exclude: { specKeySlug: facet.keySlug },
      });

      const scopedIds = (
        await prisma.product.findMany({
          where: facetWhere,
          select: { id: true },
        })
      ).map((product) => product.id);

      const scopedRows = specRows.filter((row) => scopedIds.includes(row.productId));
      const countsMap = countSpecFacetOptions(scopedRows, [facet], selected, facet.keySlug);
      const optionCounts = countsMap.get(facet.keySlug) ?? {};

      groups.push({
        id: `spec-${facet.keySlug}`,
        name: facet.key,
        collapsed: false,
        fields: [
          {
            id: facet.keySlug,
            name: facet.key,
            slug: specFacetParamKey(facet.keySlug),
            type: "SPEC",
            searchable: facet.options.length >= SPEC_FACET_SEARCH_THRESHOLD,
            topValuesLimit: SPEC_FACET_TOP_VALUES,
            options: facet.options.map((option) => ({
              id: option.id,
              label: option.label,
              slug: option.slug,
            })),
            optionCounts,
          },
        ],
      });
    }
  }

  return groups;
}

async function getTemplateFilterGroups(
  templateId: string,
  categoryIds: string[] | undefined,
  searchParams?: Record<string, string | string[] | undefined>,
  specRows: ProductSpecRow[] = [],
): Promise<CatalogFilterGroup[]> {
  const fields = await prisma.fieldDefinition.findMany({
    where: { templateId, isFilterable: true },
    include: {
      group: true,
      options: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: [{ group: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  const grouped = new Map<string, CatalogFilterGroup>();

  for (const field of fields) {
    const facetWhere = await buildProductWhere({
      categoryIds,
      templateId,
      searchParams,
      specRows,
      exclude: { fieldSlug: field.slug },
    });

    const productIds = (
      await prisma.product.findMany({
        where: facetWhere,
        select: { id: true },
      })
    ).map((product) => product.id);

    const groupId = field.group?.id ?? "template-common";
    const group = grouped.get(groupId) ?? {
      id: groupId,
      name: field.group?.name ?? "Параметры",
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
        type: field.type === FieldType.RANGE ? "RANGE" : "NUMBER",
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
        const option = field.options.find((item) => item.id === row.optionId);
        if (option) optionCounts[option.slug] = row._count.id;
      }

      group.fields.push({
        id: field.id,
        name: field.name,
        slug: field.slug,
        type: field.type === FieldType.MULTISELECT ? "MULTISELECT" : "SELECT",
        unit: field.unit,
        searchable: field.filterWidget === FilterWidget.SEARCHABLE_LIST || field.options.length >= SPEC_FACET_SEARCH_THRESHOLD,
        topValuesLimit: field.topValuesLimit,
        options: field.options,
        optionCounts,
      });
    } else if (field.type === FieldType.BOOLEAN) {
      const trueCount = await prisma.productFieldValue.count({
        where: {
          fieldId: field.id,
          productId: productIds.length ? { in: productIds } : undefined,
          valueBoolean: true,
        },
      });

      if (trueCount > 0) {
        group.fields.push({
          id: field.id,
          name: field.name,
          slug: field.slug,
          type: "BOOLEAN",
          options: [{ id: `${field.id}-true`, label: field.name, slug: "1" }],
          optionCounts: { "1": trueCount },
        });
      }
    } else if (field.type === FieldType.TEXT) {
      const textValues = await prisma.productFieldValue.findMany({
        where: {
          fieldId: field.id,
          productId: productIds.length ? { in: productIds } : undefined,
          valueText: { not: null },
        },
        select: { valueText: true },
      });

      const valueCounts = new Map<string, number>();
      for (const row of textValues) {
        const label = row.valueText?.trim();
        if (!label) continue;
        valueCounts.set(label, (valueCounts.get(label) ?? 0) + 1);
      }

      const options = [...valueCounts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ru"))
        .map(([label, count]) => {
          optionCounts[label] = count;
          return { id: `${field.id}-${label}`, label, slug: label };
        });

      if (options.length) {
        group.fields.push({
          id: field.id,
          name: field.name,
          slug: field.slug,
          type: "SELECT",
          searchable: options.length >= SPEC_FACET_SEARCH_THRESHOLD,
          topValuesLimit: field.topValuesLimit,
          options,
          optionCounts,
        });
      }
    }

    grouped.set(groupId, group);
  }

  return [...grouped.values()].filter((group) => group.fields.length > 0);
}

async function buildTemplateFieldFilters(
  templateId?: string | null,
  searchParams?: Record<string, string | string[] | undefined>,
  excludeFieldSlug?: string,
): Promise<Prisma.ProductWhereInput[]> {
  if (!templateId || !searchParams) return [];

  const fields = await prisma.fieldDefinition.findMany({
    where: { templateId, isFilterable: true },
    include: { options: true },
  });

  const filters: Prisma.ProductWhereInput[] = [];

  for (const field of fields) {
    if (excludeFieldSlug && field.slug === excludeFieldSlug) continue;

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

    if (field.type === FieldType.BOOLEAN) {
      if (singleParam(searchParams[field.slug]) !== "1") continue;
      filters.push({
        fieldValues: {
          some: {
            fieldId: field.id,
            valueBoolean: true,
          },
        },
      });
      continue;
    }

    if (field.type === FieldType.TEXT) {
      const selected = multiParam(searchParams[field.slug]);
      if (!selected.length) continue;
      filters.push({
        fieldValues: {
          some: {
            fieldId: field.id,
            valueText: { in: selected },
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
  const manual = getProductAnalogs(product);
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

export function getProductAnalogs(product: ProductWithDetails) {
  const analogs = [
    ...product.relatedFrom.map((relation) => relation.related),
    ...product.relatedTo.map((relation) => relation.product),
  ];

  return Array.from(new Map(analogs.map((analog) => [analog.id, analog])).values());
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

export async function getAdminCatalog(filters?: {
  categoryId?: string;
  brandId?: string;
  q?: string;
  page?: number;
  perPage?: number;
}) {
  const perPage = filters?.perPage ?? 50;
  const page = Math.max(1, filters?.page ?? 1);
  const q = filters?.q?.trim();

  let categoryIds: string[] | undefined;
  if (filters?.categoryId) {
    categoryIds = await getCategoryTreeIds(filters.categoryId);
  }

  const where: Prisma.ProductWhereInput = {
    ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
    ...(filters?.brandId ? { brandId: filters.brandId } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
            { brand: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [categories, brands, templates, products, total, categoryCounts] = await Promise.all([
    prisma.category.findMany({ include: { parent: true, template: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.fieldTemplate.findMany({
      include: { fields: { include: { group: true, options: true }, orderBy: { sortOrder: "asc" } } },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: { include: { parent: true } },
        images: { orderBy: { sortOrder: "asc" } },
        documents: { orderBy: { sortOrder: "asc" } },
        fieldValues: { include: { field: true, option: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
    prisma.product.groupBy({ by: ["categoryId"], _count: { _all: true } }),
  ]);

  const countsByCategory = new Map(categoryCounts.map((row) => [row.categoryId, row._count._all]));

  return {
    categories,
    brands,
    templates,
    products,
    total,
    page,
    perPage,
    pages: Math.max(1, Math.ceil(total / perPage)),
    categoryCounts: countsByCategory,
  };
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

const defaultSiteContacts: SiteContactData = {
  phone: null,
  email: null,
  address: null,
  telegram: null,
  whatsapp: null,
  maxMessenger: null,
  locations: [],
};

export async function getSiteContacts(includeUnpublishedLocations = false) {
  const contacts = await prisma.siteContact.findUnique({
    where: { id: "default" },
    include: {
      locations: {
        where: includeUnpublishedLocations ? undefined : { published: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
  });
  if (!contacts) return { ...defaultSiteContacts };

  return {
    phone: contacts.phone,
    email: contacts.email,
    address: contacts.address,
    telegram: contacts.telegram,
    whatsapp: contacts.whatsapp,
    maxMessenger: contacts.maxMessenger,
    locations: contacts.locations,
  };
}

export async function getPublishedServices() {
  return prisma.service.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: {
      examples: { orderBy: { sortOrder: "asc" }, take: 1 },
      _count: { select: { examples: true } },
    },
  });
}

export async function getServiceBySlug(slug: string) {
  return prisma.service.findFirst({
    where: { slug, published: true },
    include: { examples: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getAdminServices() {
  return prisma.service.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: {
      examples: { orderBy: { sortOrder: "asc" } },
      _count: { select: { examples: true } },
    },
  });
}
