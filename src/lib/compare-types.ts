export type CompareProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: string;
  oldPrice: string | null;
  inStock: boolean;
  image: string | null;
  brandName: string | null;
  categoryName: string | null;
};

export type CompareRow = {
  key: string;
  name: string;
  group: string;
  /** Значение одинаково у всех товаров — такие строки можно скрыть. */
  identical: boolean;
  values: Record<string, string | null>;
};

export type ComparePayload = {
  products: CompareProduct[];
  rows: CompareRow[];
};
