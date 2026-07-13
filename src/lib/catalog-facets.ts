import { slugify } from "./utils";

export const SPEC_FACET_PREFIX = "f_";

export type SpecEntry = { key: string; value: string };

export type ProductSpecRow = {
  productId: string;
  specs: SpecEntry[];
};

export type SpecFacetOption = {
  id: string;
  label: string;
  slug: string;
  productIds: Set<string>;
};

export type SpecFacet = {
  key: string;
  keySlug: string;
  paramKey: string;
  options: SpecFacetOption[];
  productCount: number;
};

const SPEC_KEY_BLACKLIST = new Set([
  "артикул",
  "sku",
  "код",
  "код товара",
  "вес",
  "weight",
  "габариты",
  "размер упаковки",
]);

export const SPEC_FACET_MIN_PRODUCTS = 2;
export const SPEC_FACET_MAX_KEYS = 15;
export const SPEC_FACET_TOP_VALUES = 8;
export const SPEC_FACET_SEARCH_THRESHOLD = 12;

export function specFacetParamKey(keySlug: string) {
  return `${SPEC_FACET_PREFIX}${keySlug}`;
}

export function slugifySpecKey(key: string) {
  return slugify(key) || "spec";
}

export function slugifySpecValue(value: string) {
  return slugify(value) || "value";
}

export function parseSpecJson(value: unknown): SpecEntry[] {
  if (!Array.isArray(value)) return [];

  const specs: SpecEntry[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const key = "key" in item ? String(item.key ?? "").trim() : "";
    const valueText = "value" in item ? String(item.value ?? "").trim() : "";
    if (key && valueText) specs.push({ key, value: valueText });
  }

  return specs;
}

export function isNoisySpecKey(key: string) {
  const normalized = key.trim().toLowerCase();
  return SPEC_KEY_BLACKLIST.has(normalized);
}

export function discoverSpecFacets(
  rows: ProductSpecRow[],
  options?: { excludeKeySlug?: string; minProducts?: number; maxKeys?: number },
): SpecFacet[] {
  const minProducts = options?.minProducts ?? SPEC_FACET_MIN_PRODUCTS;
  const maxKeys = options?.maxKeys ?? SPEC_FACET_MAX_KEYS;
  const keyMap = new Map<
    string,
    {
      key: string;
      keySlug: string;
      productIds: Set<string>;
      values: Map<string, { label: string; slug: string; productIds: Set<string> }>;
    }
  >();

  for (const row of rows) {
    for (const spec of row.specs) {
      if (isNoisySpecKey(spec.key)) continue;

      const keySlug = slugifySpecKey(spec.key);
      if (!keySlug || (options?.excludeKeySlug && keySlug === options.excludeKeySlug)) continue;

      let bucket = keyMap.get(keySlug);
      if (!bucket) {
        bucket = {
          key: spec.key,
          keySlug,
          productIds: new Set<string>(),
          values: new Map(),
        };
        keyMap.set(keySlug, bucket);
      }

      bucket.productIds.add(row.productId);

      const valueSlug = slugifySpecValue(spec.value);
      let valueBucket = bucket.values.get(valueSlug);
      if (!valueBucket) {
        valueBucket = {
          label: spec.value,
          slug: valueSlug,
          productIds: new Set<string>(),
        };
        bucket.values.set(valueSlug, valueBucket);
      }

      valueBucket.productIds.add(row.productId);
    }
  }

  return [...keyMap.values()]
    .filter((item) => item.productIds.size >= minProducts)
    .sort((a, b) => b.productIds.size - a.productIds.size || a.key.localeCompare(b.key, "ru"))
    .slice(0, maxKeys)
    .map((item) => ({
      key: item.key,
      keySlug: item.keySlug,
      paramKey: specFacetParamKey(item.keySlug),
      productCount: item.productIds.size,
      options: [...item.values.values()]
        .sort((a, b) => b.productIds.size - a.productIds.size || a.label.localeCompare(b.label, "ru"))
        .map((option) => ({
          id: `${item.keySlug}:${option.slug}`,
          label: option.label,
          slug: option.slug,
          productIds: option.productIds,
        })),
    }));
}

export type SelectedSpecFacets = Record<string, string[]>;

export function parseSpecFacetParams(searchParams?: Record<string, string | string[] | undefined>): SelectedSpecFacets {
  const selected: SelectedSpecFacets = {};
  if (!searchParams) return selected;

  for (const [key, raw] of Object.entries(searchParams)) {
    if (!key.startsWith(SPEC_FACET_PREFIX)) continue;
    const keySlug = key.slice(SPEC_FACET_PREFIX.length);
    if (!keySlug) continue;
    const values = Array.isArray(raw) ? raw : (raw ?? "").split(",").filter(Boolean);
    if (values.length) selected[keySlug] = values;
  }

  return selected;
}

export function matchSpecFilters(specs: SpecEntry[], selected: SelectedSpecFacets) {
  const entries = Object.entries(selected);
  if (!entries.length) return true;

  const specIndex = new Map<string, Set<string>>();
  for (const spec of specs) {
    const keySlug = slugifySpecKey(spec.key);
    const valueSlug = slugifySpecValue(spec.value);
    const values = specIndex.get(keySlug) ?? new Set<string>();
    values.add(valueSlug);
    specIndex.set(keySlug, values);
  }

  return entries.every(([keySlug, valueSlugs]) => {
    const productValues = specIndex.get(keySlug);
    if (!productValues) return false;
    return valueSlugs.some((valueSlug) => productValues.has(valueSlug));
  });
}

export function countSpecFacetOptions(
  rows: ProductSpecRow[],
  facets: SpecFacet[],
  selected: SelectedSpecFacets,
  excludeKeySlug?: string,
) {
  const filteredRows = rows.filter((row) => {
    const reduced = { ...selected };
    if (excludeKeySlug) delete reduced[excludeKeySlug];
    return matchSpecFilters(row.specs, reduced);
  });

  const discovered = discoverSpecFacets(filteredRows, { excludeKeySlug, maxKeys: SPEC_FACET_MAX_KEYS });
  const counts = new Map<string, Record<string, number>>();

  for (const facet of discovered) {
    const optionCounts: Record<string, number> = {};
    for (const option of facet.options) {
      optionCounts[option.slug] = option.productIds.size;
    }
    counts.set(facet.keySlug, optionCounts);
  }

  for (const facet of facets) {
    if (!counts.has(facet.keySlug)) counts.set(facet.keySlug, {});
  }

  return counts;
}

export function filterProductIdsBySpecFacets(rows: ProductSpecRow[], selected: SelectedSpecFacets) {
  if (!Object.keys(selected).length) return null;
  return rows.filter((row) => matchSpecFilters(row.specs, selected)).map((row) => row.productId);
}
