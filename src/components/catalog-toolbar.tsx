"use client";

import { useRouter } from "next/navigation";

const PER_PAGE_OPTIONS = [12, 24, 48];

export function CatalogToolbar({
  basePath,
  selected,
  perPage,
  total,
}: {
  basePath: string;
  selected: Record<string, string | string[] | undefined>;
  sort?: string;
  perPage: number;
  total: number;
}) {
  const router = useRouter();

  function buildUrl(changes: Record<string, string>) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(selected)) {
      if (key === "page" || key === "sort" || value == null) continue;
      if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
      else params.set(key, value);
    }
    for (const [key, value] of Object.entries(changes)) params.set(key, value);
    params.delete("page");
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="text-sm font-bold text-muted sm:text-base">Найдено товаров: {total}</div>
      <label className="grid w-full gap-1.5 text-sm font-semibold text-graphite sm:w-auto sm:min-w-[140px]">
        <span>На странице</span>
        <select
          value={String(perPage)}
          onChange={(event) => router.push(buildUrl({ perPage: event.target.value }))}
          className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm outline-none"
        >
          {PER_PAGE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
