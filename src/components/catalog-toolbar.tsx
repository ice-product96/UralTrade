"use client";

import { useRouter } from "next/navigation";

const SORT_OPTIONS = [
  { value: "new", label: "Сначала новые" },
  { value: "price_asc", label: "Цена ↑" },
  { value: "price_desc", label: "Цена ↓" },
  { value: "name_asc", label: "А–Я" },
  { value: "name_desc", label: "Я–А" },
];

const PER_PAGE_OPTIONS = [12, 24, 48];

export function CatalogToolbar({
  basePath,
  selected,
  sort,
  perPage,
  total,
}: {
  basePath: string;
  selected: Record<string, string | string[] | undefined>;
  sort: string;
  perPage: number;
  total: number;
}) {
  const router = useRouter();

  function buildUrl(changes: Record<string, string>) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(selected)) {
      if (key === "page" || value == null) continue;
      if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
      else params.set(key, value);
    }
    for (const [key, value] of Object.entries(changes)) params.set(key, value);
    params.delete("page");
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
      <div className="font-bold text-muted">Найдено товаров: {total}</div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-graphite">
          Сортировка
          <select
            value={sort}
            onChange={(event) => router.push(buildUrl({ sort: event.target.value }))}
            className="h-10 rounded-full border border-border bg-white px-4 text-sm outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-graphite">
          На странице
          <select
            value={String(perPage)}
            onChange={(event) => router.push(buildUrl({ perPage: event.target.value }))}
            className="h-10 rounded-full border border-border bg-white px-4 text-sm outline-none"
          >
            {PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
