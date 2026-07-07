export type CatalogFilterField = {
  id: string;
  name: string;
  slug: string;
  type: "PRICE" | "BOOLEAN" | "NUMBER" | "RANGE" | "SELECT" | "MULTISELECT" | "SPEC";
  unit?: string | null;
  min?: number;
  max?: number;
  collapsed?: boolean;
  searchable?: boolean;
  topValuesLimit?: number;
  options: Array<{ id: string; label: string; slug: string }>;
  optionCounts: Record<string, number>;
};

export type CatalogFilterGroup = {
  id: string;
  name: string;
  collapsed: boolean;
  fields: CatalogFilterField[];
};
