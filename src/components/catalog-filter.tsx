"use client";

import Link from "next/link";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { buildCatalogQuery, multiParam, singleParam } from "@/lib/catalog-params";
import type { CatalogFilterGroup } from "@/lib/catalog-types";

type BrandOption = { name: string; slug: string; count: number };

type FilterField = CatalogFilterGroup["fields"][number];

function FilterAccordion({
  title,
  collapsed,
  children,
}: {
  title: string;
  collapsed?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(!collapsed);

  return (
    <section className="border-t border-border pt-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mb-3 flex w-full items-center justify-between gap-2 text-left text-sm font-bold text-petrol"
      >
        <span>{title}</span>
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? children : null}
    </section>
  );
}

function FilterRange({
  field,
  selected,
  paramPrefix,
}: {
  field: FilterField;
  selected: Record<string, string | string[] | undefined>;
  paramPrefix?: string;
}) {
  const minName = paramPrefix ? `min_${paramPrefix}` : `min_${field.slug}`;
  const maxName = paramPrefix ? `max_${paramPrefix}` : `max_${field.slug}`;

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-graphite">
        {field.name}
        {field.unit ? <span className="text-muted"> ({field.unit})</span> : null}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          name={minName}
          defaultValue={singleParam(selected[minName]) ?? ""}
          placeholder={field.min != null ? String(field.min) : "от"}
          min={field.min}
          max={field.max}
          className="h-10 rounded-2xl border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-lime/30"
        />
        <input
          type="number"
          name={maxName}
          defaultValue={singleParam(selected[maxName]) ?? ""}
          placeholder={field.max != null ? String(field.max) : "до"}
          min={field.min}
          max={field.max}
          className="h-10 rounded-2xl border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-lime/30"
        />
      </div>
    </div>
  );
}

function FilterCheckboxList({
  field,
  selected,
}: {
  field: FilterField;
  selected: Record<string, string | string[] | undefined>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const selectedValues = multiParam(selected[field.slug]);
  const limit = field.topValuesLimit ?? 8;

  const visibleOptions = field.options.filter((option) => {
    const count = field.optionCounts[option.slug] ?? 0;
    const checked = selectedValues.includes(option.slug);
    if (!count && !checked) return false;
    if (!search.trim()) return true;
    return option.label.toLowerCase().includes(search.trim().toLowerCase());
  });

  const shownOptions = expanded ? visibleOptions : visibleOptions.slice(0, limit);
  const hiddenCount = Math.max(0, visibleOptions.length - shownOptions.length);

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-graphite">{field.name}</div>
      {field.searchable && field.options.length >= 12 ? (
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск..."
          className="h-9 w-full rounded-2xl border border-border px-3 text-sm outline-none focus:ring-2 focus:ring-lime/30"
        />
      ) : null}
      <div className="space-y-1">
        {shownOptions.map((option) => {
          const count = field.optionCounts[option.slug] ?? 0;
          const checked = selectedValues.includes(option.slug);
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
      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs font-semibold text-petrol hover:text-lime"
        >
          Показать ещё {hiddenCount}
        </button>
      ) : null}
      {expanded && visibleOptions.length > limit ? (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-xs font-semibold text-petrol hover:text-lime"
        >
          Свернуть
        </button>
      ) : null}
    </div>
  );
}

function FilterBooleanField({
  field,
  selected,
}: {
  field: FilterField;
  selected: Record<string, string | string[] | undefined>;
}) {
  const checked = singleParam(selected[field.slug]) === "1";
  const count = field.optionCounts["1"] ?? 0;
  if (!count && !checked) return null;

  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-3 py-2 hover:bg-background">
      <span className="flex items-center gap-3">
        <input type="checkbox" name={field.slug} value="1" defaultChecked={checked} className="accent-lime" />
        <span className="text-sm">{field.name}</span>
      </span>
      <span className="text-xs text-muted">{count}</span>
    </label>
  );
}

function FilterFieldBlock({
  field,
  selected,
}: {
  field: FilterField;
  selected: Record<string, string | string[] | undefined>;
}) {
  if (field.type === "PRICE") {
    return <FilterRange field={field} selected={selected} paramPrefix="price" />;
  }

  if (field.type === "NUMBER" || field.type === "RANGE") {
    return <FilterRange field={field} selected={selected} />;
  }

  if (field.type === "BOOLEAN") {
    return <FilterBooleanField field={field} selected={selected} />;
  }

  return <FilterCheckboxList field={field} selected={selected} />;
}

function FilterForm({
  groups,
  brands,
  selected,
  basePath,
  total,
  hiddenFields,
  onDone,
}: {
  groups: CatalogFilterGroup[];
  brands: BrandOption[];
  selected: Record<string, string | string[] | undefined>;
  basePath: string;
  total: number;
  hiddenFields?: string[];
  onDone?: () => void;
}) {
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      fields: group.fields.filter((field) => !hiddenFields?.includes(field.slug)),
    }))
    .filter((group) => group.fields.length > 0);

  return (
    <form action={basePath} className="space-y-2" onSubmit={onDone}>
      {hiddenFields?.includes("sale") || singleParam(selected.sale) === "1" ? (
        <input type="hidden" name="sale" value="1" />
      ) : null}
      {singleParam(selected.all) === "1" ? <input type="hidden" name="all" value="1" /> : null}
      <FilterAccordion title="Бренд">
        <div className="space-y-1">
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 hover:bg-background">
            <input type="radio" name="brand" value="" defaultChecked={!singleParam(selected.brand)} className="accent-lime" />
            <span className="text-sm">Все бренды</span>
          </label>
          {brands.map((brand) => (
            <label key={brand.slug} className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-3 py-2 hover:bg-background">
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="brand"
                  value={brand.slug}
                  defaultChecked={singleParam(selected.brand) === brand.slug}
                  className="accent-lime"
                />
                <span className="text-sm">{brand.name}</span>
              </span>
              <span className="text-xs text-muted">{brand.count}</span>
            </label>
          ))}
        </div>
      </FilterAccordion>

      {visibleGroups.map((group) => (
        <FilterAccordion key={group.id} title={group.name} collapsed={group.collapsed}>
          <div className="space-y-5">
            {group.fields.map((field) => (
              <FilterFieldBlock key={field.id} field={field} selected={selected} />
            ))}
          </div>
        </FilterAccordion>
      ))}

      <div className="sticky bottom-0 grid gap-2 border-t border-border bg-white pt-4">
        <button type="submit" className="h-11 rounded-full bg-petrol text-sm font-bold text-white transition hover:bg-petrol-soft">
          Показать товары ({total})
        </button>
        <Link
          href={basePath}
          className="inline-flex h-11 items-center justify-center rounded-full border border-border text-sm font-bold text-petrol hover:bg-background"
        >
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
  total,
  hiddenFields,
}: {
  groups: CatalogFilterGroup[];
  brands: BrandOption[];
  selected: Record<string, string | string[] | undefined>;
  basePath: string;
  total: number;
  hiddenFields?: string[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeChips = useMemo(() => {
    const chips: Array<{ label: string; href: string }> = [];
    const brand = singleParam(selected.brand);
    if (brand) {
      const brandName = brands.find((item) => item.slug === brand)?.name ?? brand;
      chips.push({ label: `Бренд: ${brandName}`, href: buildCatalogQuery(basePath, selected, { brand: null }) });
    }

    const minPrice = singleParam(selected.min_price);
    const maxPrice = singleParam(selected.max_price);
    if (minPrice || maxPrice) {
      chips.push({
        label: `Цена: ${minPrice ?? "…"}–${maxPrice ?? "…"}`,
        href: buildCatalogQuery(basePath, selected, { min_price: null, max_price: null }),
      });
    }

    if (singleParam(selected.inStock) === "1") {
      chips.push({ label: "В наличии", href: buildCatalogQuery(basePath, selected, { inStock: null }) });
    }

    if (singleParam(selected.sale) === "1") {
      chips.push({ label: "Со скидкой", href: buildCatalogQuery(basePath, selected, { sale: null }) });
    }

    for (const group of groups) {
      for (const field of group.fields) {
        if (field.type === "PRICE") continue;

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

        if (field.type === "BOOLEAN") {
          if (singleParam(selected[field.slug]) === "1") {
            chips.push({
              label: field.name,
              href: buildCatalogQuery(basePath, selected, { [field.slug]: null }),
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
      <FilterForm groups={groups} brands={brands} selected={selected} basePath={basePath} total={total} hiddenFields={hiddenFields} onDone={() => setMobileOpen(false)} />
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
