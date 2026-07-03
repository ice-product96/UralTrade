import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { multiParam, singleParam } from "@/lib/data";

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
    optionCounts?: Map<string, number>;
  }>;
};

export function CatalogFilter({
  groups,
  brands,
  selected,
  basePath,
}: {
  groups: FilterGroup[];
  brands: Array<{ name: string; slug: string }>;
  selected: Record<string, string | string[] | undefined>;
  basePath: string;
}) {
  return (
    <aside className="rounded-[30px] border border-border bg-white p-5 shadow-sm lg:sticky lg:top-28">
      <div className="mb-5 flex items-center gap-2 text-lg font-black text-graphite">
        <SlidersHorizontal className="h-5 w-5 text-lime" />
        Фильтр
      </div>
      <form action={basePath} className="space-y-6">
        <div className="space-y-3">
          <div className="text-sm font-bold text-petrol">Бренд</div>
          {brands.map((brand) => {
            const checked = singleParam(selected.brand) === brand.slug;
            return (
              <label key={brand.slug} className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 hover:bg-background">
                <input type="radio" name="brand" value={brand.slug} defaultChecked={checked} className="accent-lime" />
                <span className="text-sm">{brand.name}</span>
              </label>
            );
          })}
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
                    {field.options.map((option) => (
                      <label key={option.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-3 py-2 hover:bg-background">
                        <span className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            name={field.slug}
                            value={option.slug}
                            defaultChecked={selectedValues.includes(option.slug)}
                            className="accent-lime"
                          />
                          <span className="text-sm">{option.label}</span>
                        </span>
                        <span className="text-xs text-muted">{field.optionCounts?.get(option.id) ?? 0}</span>
                      </label>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        <div className="grid gap-2 border-t border-border pt-5">
          <button className="h-11 rounded-full bg-petrol text-sm font-bold text-white transition hover:bg-petrol-soft">Показать товары</button>
          <Link href={basePath} className="inline-flex h-11 items-center justify-center rounded-full border border-border text-sm font-bold text-petrol hover:bg-background">
            Сбросить
          </Link>
        </div>
      </form>
    </aside>
  );
}
