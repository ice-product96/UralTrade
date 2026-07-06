"use client";

import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { createProduct, deleteProduct, updateProduct } from "@/app/admin/actions";
import { AdminFormActions } from "@/components/admin/admin-form-footer";
import { AdminModal } from "@/components/admin/admin-modal";
import { useCrudModal } from "@/components/admin/use-crud-modal";
import { formatPrice } from "@/lib/format";

type FieldRow = {
  id: string;
  name: string;
  type: string;
  unit: string | null;
  templateId: string;
  templateName: string;
  options: Array<{ label: string; slug: string }>;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: string;
  oldPrice: string | null;
  inStock: boolean;
  categoryId: string;
  brandId: string | null;
  templateId: string | null;
  shortDescription: string;
  fullDescription: string;
  h1: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  category: { name: string; parent?: { name: string } | null };
  brand: { name: string } | null;
  images: Array<{ url: string }>;
  fieldValues: Array<{
    fieldId: string;
    field: { name: string };
    option: { label: string } | null;
    valueText: string | null;
    valueNumber: string | null;
    valueBoolean: boolean | null;
    valueFileUrl: string | null;
    valueJson: unknown;
  }>;
};

type CategoryOption = { id: string; name: string; templateId: string | null; parent: { name: string } | null };
type BrandOption = { id: string; name: string };
type TemplateOption = { id: string; name: string };

function fieldValueToString(value: ProductRow["fieldValues"][number]) {
  if (value.option) return value.option.label;
  if (value.valueNumber != null) return value.valueNumber.toString();
  if (value.valueBoolean != null) return value.valueBoolean ? "on" : "";
  if (value.valueFileUrl) return value.valueFileUrl;
  if (value.valueText) return value.valueText;
  if (Array.isArray(value.valueJson)) {
    return value.valueJson
      .map((item) => {
        if (item && typeof item === "object" && "key" in item && "value" in item) {
          return `${item.key}: ${item.value}`;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

function ProductFieldInput({
  field,
  defaultValue,
}: {
  field: FieldRow;
  defaultValue: string;
}) {
  const inputName = `field_${field.id}`;

  if (field.type === "SELECT" && field.options.length) {
    return (
      <select name={inputName} defaultValue={defaultValue} className="admin-input bg-white">
        <option value="">Не выбрано</option>
        {field.options.map((option) => (
          <option key={option.slug} value={option.label}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "MULTISELECT" && field.options.length) {
    const selected = new Set(defaultValue.split(",").map((item) => item.trim()).filter(Boolean));
    return (
      <div className="space-y-2 rounded-2xl border border-border bg-white p-3">
        {field.options.map((option) => (
          <label key={option.slug} className="flex items-center gap-2 text-sm font-semibold text-graphite">
            <input
              type="checkbox"
              name={inputName}
              value={option.label}
              defaultChecked={selected.has(option.label) || selected.has(option.slug)}
              className="accent-lime"
            />
            {option.label}
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "BOOLEAN") {
    return (
      <label className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold">
        <input name={inputName} type="checkbox" value="on" defaultChecked={defaultValue === "on"} className="accent-lime" />
        Да
      </label>
    );
  }

  if (field.type === "NUMBER" || field.type === "RANGE") {
    return (
      <input
        name={inputName}
        type="number"
        step="any"
        defaultValue={defaultValue}
        placeholder={field.unit ?? "Число"}
        className="admin-input bg-white"
      />
    );
  }

  return (
    <textarea
      name={inputName}
      rows={field.type === "KEY_VALUE" ? 5 : 2}
      defaultValue={defaultValue}
      placeholder={field.type === "KEY_VALUE" ? "Параметр: значение (каждый с новой строки)" : field.unit ?? field.type}
      className="admin-textarea bg-white"
    />
  );
}

export function ProductsCrud({
  products,
  categories,
  brands,
  templates,
  fields,
}: {
  products: ProductRow[];
  categories: CategoryOption[];
  brands: BrandOption[];
  templates: TemplateOption[];
  fields: FieldRow[];
}) {
  const router = useRouter();
  const modal = useCrudModal<ProductRow>();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const current = modal.item;

  useEffect(() => {
    if (!modal.open) return;
    setError(null);
    setCategoryId(current?.categoryId ?? "");
    setTemplateId(current?.templateId ?? categories.find((item) => item.id === current?.categoryId)?.templateId ?? "");
  }, [modal.open, current, categories]);

  const activeTemplateId = useMemo(() => {
    if (templateId) return templateId;
    const category = categories.find((item) => item.id === categoryId);
    return category?.templateId ?? "";
  }, [templateId, categoryId, categories]);

  const visibleFields = useMemo(
    () => fields.filter((field) => field.templateId === activeTemplateId),
    [fields, activeTemplateId],
  );

  const activeTemplateName = templates.find((template) => template.id === activeTemplateId)?.name;

  function submit(action: (fd: FormData) => Promise<void>) {
    return (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);

      for (const field of visibleFields) {
        if (field.type !== "MULTISELECT") continue;
        const values = formData.getAll(`field_${field.id}`).map(String);
        formData.delete(`field_${field.id}`);
        if (values.length) formData.set(`field_${field.id}`, values.join(", "));
      }

      startTransition(async () => {
        try {
          setError(null);
          await action(formData);
          router.refresh();
          modal.close();
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : "Не удалось сохранить товар");
        }
      });
    };
  }

  function handleDelete() {
    if (!modal.item || !confirm(`Удалить товар «${modal.item.name}»?`)) return;
    const formData = new FormData();
    formData.set("id", modal.item.id);
    startTransition(async () => {
      try {
        setError(null);
        await deleteProduct(formData);
        router.refresh();
        modal.close();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Не удалось удалить товар");
      }
    });
  }

  return (
    <>
      <section className="rounded-[30px] border border-border bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-graphite">Товары</h1>
            <p className="mt-2 text-muted">Карточка товара, характеристики из шаблона категории, фото и SEO.</p>
          </div>
          <button type="button" onClick={modal.openCreate} className="inline-flex h-11 items-center gap-2 rounded-full bg-lime px-5 text-sm font-bold text-white hover:bg-lime-hover">
            <Plus className="h-4 w-4" />
            Добавить
          </button>
        </div>
        <div className="mt-6 grid gap-4">
          {products.map((product) => (
            <article key={product.id} className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border p-4">
              <div>
                <Link href={`/product/${product.slug}`} className="text-lg font-black text-petrol hover:text-lime">
                  {product.name}
                </Link>
                <div className="mt-1 text-sm text-muted">
                  {product.sku} • {product.category.name} • {product.brand?.name ?? "Без бренда"}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-black text-graphite">{formatPrice(product.price)}</div>
                <button type="button" onClick={() => modal.openEdit(product)} className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold text-petrol hover:bg-background">
                  <Pencil className="h-4 w-4" />
                  Изменить
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <AdminModal open={modal.open} onClose={modal.close} title={modal.isEdit ? "Редактировать товар" : "Новый товар"} size="xl">
        <form onSubmit={submit(modal.isEdit ? updateProduct : createProduct)} className="space-y-3">
          {current ? <input type="hidden" name="id" value={current.id} /> : null}
          <input name="name" required defaultValue={current?.name} placeholder="Название" className="admin-input" />
          <input name="slug" defaultValue={current?.slug} placeholder="slug" className="admin-input" />
          <input name="sku" required defaultValue={current?.sku} placeholder="Артикул" className="admin-input" />
          <div className="grid grid-cols-2 gap-3">
            <input name="price" required type="number" min="0" step="0.01" defaultValue={current?.price} placeholder="Цена, ₽" className="admin-input" />
            <input name="oldPrice" type="number" min="0" step="0.01" defaultValue={current?.oldPrice ?? ""} placeholder="Старая цена (необязательно)" className="admin-input" />
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm font-semibold">
            <input name="inStock" type="checkbox" defaultChecked={current?.inStock ?? true} className="accent-lime" />
            В наличии
          </label>
          <select
            name="categoryId"
            required
            value={categoryId}
            onChange={(event) => {
              const nextCategoryId = event.target.value;
              setCategoryId(nextCategoryId);
              const category = categories.find((item) => item.id === nextCategoryId);
              if (category?.templateId && !templateId) {
                setTemplateId(category.templateId);
              }
            }}
            className="admin-input"
          >
            <option value="">Категория</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.parent ? `${category.parent.name} / ` : ""}
                {category.name}
              </option>
            ))}
          </select>
          <select name="brandId" defaultValue={current?.brandId ?? ""} className="admin-input">
            <option value="">Бренд</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          <select
            name="templateId"
            value={templateId}
            onChange={(event) => setTemplateId(event.target.value)}
            className="admin-input"
          >
            <option value="">Шаблон характеристик (из категории)</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          <textarea name="shortDescription" required defaultValue={current?.shortDescription} rows={3} placeholder="Краткое описание" className="admin-textarea" />
          <textarea name="fullDescription" required defaultValue={current?.fullDescription} rows={5} placeholder="Полное описание (HTML)" className="admin-textarea" />
          <textarea
            name="images"
            rows={3}
            defaultValue={current?.images.map((image) => image.url).join("\n")}
            placeholder="URL фото, каждый с новой строки"
            className="admin-textarea"
          />
          {activeTemplateId ? (
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="mb-3 font-bold text-graphite">
                Характеристики{activeTemplateName ? `: ${activeTemplateName}` : ""}
              </div>
              {visibleFields.length ? (
                <div className="space-y-3">
                  {visibleFields.map((field) => {
                    const existing = current?.fieldValues.find((value) => value.fieldId === field.id);
                    return (
                      <label key={field.id} className="block">
                        <span className="mb-1 block text-xs font-bold uppercase tracking-[0.16em] text-muted">
                          {field.name}
                          {field.unit ? `, ${field.unit}` : ""}
                        </span>
                        <ProductFieldInput field={field} defaultValue={existing ? fieldValueToString(existing) : ""} />
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted">В шаблоне пока нет полей. Добавьте их в разделе «Поля и фильтры».</p>
              )}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted">
              Выберите категорию с шаблоном или укажите шаблон характеристик вручную.
            </p>
          )}
          <input name="h1" defaultValue={current?.h1 ?? ""} placeholder="H1" className="admin-input" />
          <input name="metaTitle" defaultValue={current?.metaTitle ?? ""} placeholder="Meta title" className="admin-input" />
          <textarea name="metaDescription" defaultValue={current?.metaDescription ?? ""} rows={3} placeholder="Meta description" className="admin-textarea" />
          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
          <AdminFormActions onCancel={modal.close} onDelete={modal.isEdit ? handleDelete : undefined} />
          {pending ? <p className="text-sm text-muted">Сохранение...</p> : null}
        </form>
      </AdminModal>
    </>
  );
}
