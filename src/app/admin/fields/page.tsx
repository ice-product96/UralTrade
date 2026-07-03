import { FieldType, FilterWidget } from "@/generated/prisma/client";
import { createFieldDefinition, createFieldTemplate } from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";

export default async function AdminFieldsPage() {
  const templates = await prisma.fieldTemplate.findMany({
    include: {
      fields: { include: { group: true, options: true }, orderBy: { sortOrder: "asc" } },
      categories: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-graphite">Конструктор полей и фильтра</h1>
        <p className="mt-2 text-muted">Создавайте шаблоны карточек товара и указывайте, какие поля участвуют в фасетном фильтре.</p>
      </div>
      <div className="grid gap-8 xl:grid-cols-[1fr_440px]">
        <section className="space-y-5">
          {templates.map((template) => (
            <article key={template.id} className="rounded-[30px] border border-border bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-graphite">{template.name}</h2>
                  <p className="mt-1 text-sm text-muted">{template.description}</p>
                </div>
                <span className="rounded-full bg-background px-3 py-1 text-xs font-bold text-petrol">{template.fields.length} полей</span>
              </div>
              <div className="mt-5 grid gap-3">
                {template.fields.map((field) => (
                  <div key={field.id} className="rounded-2xl border border-border p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-bold text-graphite">{field.name}</div>
                      <span className="rounded-full bg-petrol/10 px-2 py-1 text-xs font-bold text-petrol">{field.type}</span>
                      {field.isFilterable ? <span className="rounded-full bg-lime/10 px-2 py-1 text-xs font-bold text-lime">Фильтр: {field.filterWidget}</span> : null}
                    </div>
                    <div className="mt-2 text-sm text-muted">
                      slug: {field.slug} {field.unit ? `• ${field.unit}` : ""} {field.group ? `• группа: ${field.group.name}` : ""}
                    </div>
                    {field.options.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {field.options.map((option) => (
                          <span key={option.id} className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                            {option.label}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
        <aside className="space-y-5">
          <form action={createFieldTemplate} className="rounded-[30px] border border-border bg-white p-6">
            <h2 className="text-xl font-black text-graphite">Новый шаблон</h2>
            <div className="mt-5 space-y-3">
              <input name="name" required placeholder="Название шаблона" className="admin-input" />
              <textarea name="description" rows={3} placeholder="Описание" className="admin-textarea" />
            </div>
            <button className="mt-5 h-11 w-full rounded-full bg-petrol text-sm font-bold text-white">Создать шаблон</button>
          </form>
          <form action={createFieldDefinition} className="rounded-[30px] border border-border bg-white p-6">
            <h2 className="text-xl font-black text-graphite">Новое поле</h2>
            <div className="mt-5 space-y-3">
              <select name="templateId" required className="admin-input">
                <option value="">Выберите шаблон</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <input name="name" required placeholder="Название поля" className="admin-input" />
              <input name="slug" placeholder="slug" className="admin-input" />
              <select name="type" required className="admin-input" defaultValue={FieldType.TEXT}>
                {Object.values(FieldType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <input name="unit" placeholder="Единица измерения (кВт, м, мм)" className="admin-input" />
              <input name="groupName" placeholder="Группа фильтра (например, Габариты)" className="admin-input" />
              <input name="sortOrder" type="number" placeholder="Порядок" className="admin-input" />
              <label className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm font-semibold">
                <input name="isFilterable" type="checkbox" className="accent-lime" />
                Участвует в фильтре
              </label>
              <select name="filterWidget" className="admin-input" defaultValue={FilterWidget.CHECKBOX}>
                {Object.values(FilterWidget).map((widget) => (
                  <option key={widget} value={widget}>
                    {widget}
                  </option>
                ))}
              </select>
              <textarea name="options" rows={3} placeholder="Опции для SELECT через запятую" className="admin-textarea" />
            </div>
            <button className="mt-5 h-11 w-full rounded-full bg-lime text-sm font-bold text-white">Добавить поле</button>
          </form>
        </aside>
      </div>
    </div>
  );
}
