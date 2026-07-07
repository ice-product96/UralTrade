"use client";

import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { buildCatalogQuery, multiParam, singleParam } from "@/lib/catalog-params";

type FilterGroup = {
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
};

type BrandOption = { name: string; slug: string; count: number };

function FilterForm({
  groups,
  brands,
  selected,
  basePath,
  onDone,
}: {
  groups: FilterGroup[];
  brands: BrandOption[];
  selected: Record<string, string | string[] | undefined>;
  basePath: string;
  onDone?: () => void;
}) {
  return (
    <form action={basePath} className="space-y-6" onSubmit={onDone}>
      <div className="space-y-3">
        <div className="text-sm font-bold text-petrol">Бренд</div>
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 hover:bg-background">
          <input type="radio" name="brand" value="" defaultChecked={!singleParam(selected.brand)} className="accent-lime" />
          <span className="text-sm">Все бренды</span>
        </label>
        {brands.map((brand) => (
          <label key={brand.slug} className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-3 py-2 hover:bg-background">
            <span className="flex items-center gap-3">
              <input type="radio" name="brand" value={brand.slug} defaultChecked={singleParam(selected.brand) === brand.slug} className="accent-lime" />
              <span className="text-sm">{brand.name}</span>
            </span>
            <span className="text-xs text-muted">{brand.count}</span>
          </label>
        ))}
      </div>

      {groups.map((group) => (
        <section key={group.id} className="border-t border-border pt-5">
          <div className="mb-3 text-sm font-bold text-petrol">{group.name}</div>
          <div className="space-y-5">
            {group.fields.map((field) => {
              const selectedValues = multiParam(selected[field.slug]);
              if (field.type === "NUMBER" || field.type === "RANGE") {
                return (
                  <div key={field.id} className="space-y-2">
                    <div className="text-sm font-semibold text-graphite">
                      {field.name} {field.unit ? <span className="text-muted">({field.unit})</span> : null}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        name={`min_${field.slug}`}
                        defaultValue={singleParam(selected[`min_${field.slug}`]) ?? ""}
                        placeholder={field.min?.toString() ?? "от"}
                        className="h-10 rounded-2xl border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-lime/30"
                      />
                      <input
                        type="number"
                        name={`max_${field.slug}`}
                        defaultValue={singleParam(selected[`max_${field.slug}`]) ?? ""}
                        placeholder={field.max?.toString() ?? "до"}
                        className="h-10 rounded-2xl border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-lime/30"
                      />
                    </div>
                  </div>
                );
              }

              return (
                <div key={field.id} className="space-y-2">
                  <div className="text-sm font-semibold text-graphite">{field.name}</div>
                  {field.options.map((option) => {
                    const count = field.optionCounts[option.id] ?? 0;
                    const checked = selectedValues.includes(option.slug);
                    if (!count && !checked) return null;
                    return (
                      <label key={option.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-3 py-2 hover:bg-background">
                        <span className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            name={field.slug}
                            value={option.slug}
                            defaultChecked={checked}
                            className="accent-lime"
                          />
                          <span className="text-sm">{option.label}</span>
                        </span>
                        <span className="text-xs text-muted">{count}</span>
                      </label>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <div className="grid gap-2 border-t border-border pt-5">
        <button type="submit" className="h-11 rounded-full bg-petrol text-sm font-bold text-white transition hover:bg-petrol-soft">
          Показать товары
        </button>
        <Link href={basePath} className="inline-flex h-11 items-center justify-center rounded-full border border-border text-sm font-bold text-petrol hover:bg-background">
          Сбросить
        </Link>
      </div>
    </form>
  );
}

export function CatalogFilter({
  groups,
  brands,
  selected,
  basePath,
}: {
  groups: FilterGroup[];
  brands: BrandOption[];
  selected: Record<string, string | string[] | undefined>;
  basePath: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeChips = useMemo(() => {
    const chips: Array<{ label: string; href: string }> = [];
    const brand = singleParam(selected.brand);
    if (brand) {
      const brandName = brands.find((item) => item.slug === brand)?.name ?? brand;
      chips.push({ label: `Бренд: ${brandName}`, href: buildCatalogQuery(basePath, selected, { brand: null }) });
    }

    for (const group of groups) {
      for (const field of group.fields) {
        if (field.type === "NUMBER" || field.type === "RANGE") {
          const min = singleParam(selected[`min_${field.slug}`]);
          const max = singleParam(selected[`max_${field.slug}`]);
          if (min || max) {
            chips.push({
              label: `${field.name}: ${min ?? "…"}–${max ?? "…"}`,
              href: buildCatalogQuery(basePath, selected, { [`min_${field.slug}`]: null, [`max_${field.slug}`]: null }),
            });
          }
          continue;
        }

        for (const slug of multiParam(selected[field.slug])) {
          const option = field.options.find((item) => item.slug === slug);
          chips.push({
            label: `${field.name}: ${option?.label ?? slug}`,
            href: buildCatalogQuery(basePath, selected, {
              [field.slug]: multiParam(selected[field.slug])
                .filter((item) => item !== slug)
                .join(",") || null,
            }),
          });
        }
      }
    }

    return chips;
  }, [basePath, brands, groups, selected]);

  const filterPanel = (
    <div className="rounded-[30px] border border-border bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-lg font-black text-graphite">
          <SlidersHorizontal className="h-5 w-5 text-lime" />
          Фильтр
        </div>
        {mobileOpen ? (
          <button type="button" onClick={() => setMobileOpen(false)} className="rounded-full p-2 text-petrol lg:hidden" aria-label="Закрыть фильтр">
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>
      {activeChips.length ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <Link key={chip.href} href={chip.href} className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-petrol hover:bg-lime/10">
              {chip.label}
              <X className="h-3 w-3" />
            </Link>
          ))}
        </div>
      ) : null}
      <FilterForm groups={groups} brands={brands} selected={selected} basePath={basePath} onDone={() => setMobileOpen(false)} />
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="mb-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-white text-sm font-bold text-petrol lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Фильтр{activeChips.length ? ` (${activeChips.length})` : ""}
      </button>

      <aside className="hidden lg:block lg:sticky lg:top-28">{filterPanel}</aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Закрыть" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[28px] bg-white p-4 shadow-2xl">{filterPanel}</div>
        </div>
      ) : null}
    </>
  );
}
