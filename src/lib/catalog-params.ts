import { parseSpecFacetParams, SPEC_FACET_PREFIX, specFacetParamKey } from "@/lib/catalog-facets";

export { parseSpecFacetParams, SPEC_FACET_PREFIX, specFacetParamKey };

const IGNORED_FILTER_PARAMS = new Set(["page", "perPage", "sort", "all", "q"]);

export function singleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function multiParam(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : value.split(",").filter(Boolean);
}

export function hasActiveCatalogFilters(searchParams?: Record<string, string | string[] | undefined>) {
  if (!searchParams) return false;

  return Object.entries(searchParams).some(([key, value]) => {
    if (IGNORED_FILTER_PARAMS.has(key)) return false;
    if (value == null || value === "") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });
}

export function buildCatalogQuery(
  basePath: string,
  selected: Record<string, string | string[] | undefined>,
  changes: Record<string, string | null | undefined>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(selected)) {
    if (key === "page" || value == null) continue;
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
    else params.set(key, value);
  }

  for (const [key, value] of Object.entries(changes)) {
    params.delete(key);
    if (value != null && value !== "") params.set(key, value);
  }

  params.delete("page");
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
