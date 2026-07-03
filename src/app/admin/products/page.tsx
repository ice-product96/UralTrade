import Link from "next/link";
import { createProduct } from "@/app/admin/actions";
import { getAdminCatalog } from "@/lib/data";
import { formatPrice } from "@/lib/format";

export default async function AdminProductsPage() {
  const { products, categories, brands, templates } = await getAdminCatalog();
  const fields = templates.flatMap((template) => template.fields.map((field) => ({ ...field, templateName: template.name })));

  return (
    <div className="grid gap-8 2xl:grid-cols-[1fr_520px]">
      <section className="rounded-[30px] border border-border bg-white p-6">
        <h1 className="text-3xl font-black text-graphite">Товары</h1>
        <p className="mt-2 text-muted">Общие поля, динамические характеристики из шаблонов, изображения и SEO.</p>
        <div className="mt-6 grid gap-4">
          {products.map((product) => (
            <article key={product.id} className="rounded-2xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Link href={`/product/${product.slug}`} className="text-lg font-black text-petrol hover:text-lime">
                    {product.name}
                  </Link>
                  <div className="mt-1 text-sm text-muted">
                    {product.sku} • {product.category.name} • {product.brand?.name ?? "Без бренда"}
                  </div>
                </div>
                <div className="text-right font-black text-graphite">{formatPrice(product.price)}</div>
              </div>
              {product.fieldValues.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.fieldValues.slice(0, 8).map((value) => (
                    <span key={value.id} className="rounded-full bg-background px-3 py-1 text-xs text-muted">
                      {value.field.name}: {value.option?.label ?? value.valueText ?? value.valueNumber?.toString() ?? value.valueFileUrl ?? "заполнено"}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
      <form action={createProduct} className="h-fit rounded-[30px] border border-border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-graphite">Новый товар</h2>
        <div className="mt-5 space-y-3">
          <input name="name" required placeholder="Название" className="admin-input" />
          <input name="slug" placeholder="slug" className="admin-input" />
          <input name="sku" required placeholder="Артикул" className="admin-input" />
          <div className="grid grid-cols-2 gap-3">
            <input name="price" required type="number" placeholder="Цена" className="admin-input" />
            <input name="oldPrice" type="number" placeholder="Старая цена" className="admin-input" />
          </div>
          <select name="categoryId" required className="admin-input">
            <option value="">Категория</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.parent ? `${category.parent.name} / ` : ""}
                {category.name}
              </option>
            ))}
          </select>
          <select name="brandId" className="admin-input">
            <option value="">Бренд</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          <select name="templateId" className="admin-input">
            <option value="">Шаблон полей</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          <textarea name="shortDescription" required rows={3} placeholder="Краткое описание" className="admin-textarea" />
          <textarea name="fullDescription" required rows={5} placeholder="Полное описание (можно HTML)" className="admin-textarea" />
          <textarea name="images" rows={3} placeholder="URL фото, каждый с новой строки" className="admin-textarea" />
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="mb-3 font-bold text-graphite">Динамические поля</div>
            <div className="space-y-3">
              {fields.map((field) => (
                <label key={field.id} className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.16em] text-muted">
                    {field.templateName} / {field.name}
                  </span>
                  <textarea
                    name={`field_${field.id}`}
                    rows={field.type === "KEY_VALUE" ? 4 : 1}
                    placeholder={
                      field.type === "KEY_VALUE"
                        ? "Ключ: значение, каждая пара с новой строки"
                        : field.options.length
                          ? `Значение из: ${field.options.map((option) => option.label).join(", ")}`
                          : field.unit ?? field.type
                    }
                    className="admin-textarea bg-white"
                  />
                </label>
              ))}
            </div>
          </div>
          <input name="h1" placeholder="H1" className="admin-input" />
          <input name="metaTitle" placeholder="Meta title" className="admin-input" />
          <textarea name="metaDescription" rows={3} placeholder="Meta description" className="admin-textarea" />
        </div>
        <button className="mt-5 h-11 w-full rounded-full bg-lime text-sm font-bold text-white">Создать товар</button>
      </form>
    </div>
  );
}
