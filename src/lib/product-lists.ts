export type ProductListKind = "favorites" | "compare";

const STORAGE_KEYS: Record<ProductListKind, string> = {
  favorites: "uraltrade-favorites",
  compare: "uraltrade-compare",
};

export const PRODUCT_LIST_UPDATED_EVENT = "uraltrade-product-list-updated";
export const COMPARE_LIMIT = 8;

/** Общая ссылка на пустой список: useSyncExternalStore требует стабильный снимок. */
export const EMPTY_PRODUCT_LIST: string[] = [];

const cache: Record<ProductListKind, string[] | null> = { favorites: null, compare: null };

function parseIds(raw: string | null) {
  if (!raw) return EMPTY_PRODUCT_LIST;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_PRODUCT_LIST;
    const ids = parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
    return ids.length ? ids : EMPTY_PRODUCT_LIST;
  } catch {
    return EMPTY_PRODUCT_LIST;
  }
}

export function readProductList(kind: ProductListKind) {
  if (typeof window === "undefined") return EMPTY_PRODUCT_LIST;

  const cached = cache[kind];
  if (cached) return cached;

  const ids = parseIds(window.localStorage.getItem(STORAGE_KEYS[kind]));
  cache[kind] = ids;
  return ids;
}

function writeProductList(kind: ProductListKind, ids: string[]) {
  cache[kind] = ids.length ? ids : EMPTY_PRODUCT_LIST;
  window.localStorage.setItem(STORAGE_KEYS[kind], JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(PRODUCT_LIST_UPDATED_EVENT, { detail: { kind } }));
  return cache[kind]!;
}

export function isInProductList(kind: ProductListKind, productId: string) {
  return readProductList(kind).includes(productId);
}

export type ToggleResult = { active: boolean; limitReached: boolean };

export function toggleProductList(kind: ProductListKind, productId: string): ToggleResult {
  const current = readProductList(kind);

  if (current.includes(productId)) {
    writeProductList(
      kind,
      current.filter((id) => id !== productId),
    );
    return { active: false, limitReached: false };
  }

  if (kind === "compare" && current.length >= COMPARE_LIMIT) {
    return { active: false, limitReached: true };
  }

  writeProductList(kind, [...current, productId]);
  return { active: true, limitReached: false };
}

export function removeFromProductList(kind: ProductListKind, productId: string) {
  return writeProductList(
    kind,
    readProductList(kind).filter((id) => id !== productId),
  );
}

export function clearProductList(kind: ProductListKind) {
  return writeProductList(kind, []);
}

export function subscribeProductLists(onChange: () => void) {
  const handle = () => {
    cache.favorites = null;
    cache.compare = null;
    onChange();
  };

  window.addEventListener(PRODUCT_LIST_UPDATED_EVENT, handle);
  // Событие storage приходит из других вкладок — списки остаются синхронными.
  window.addEventListener("storage", handle);

  return () => {
    window.removeEventListener(PRODUCT_LIST_UPDATED_EVENT, handle);
    window.removeEventListener("storage", handle);
  };
}
