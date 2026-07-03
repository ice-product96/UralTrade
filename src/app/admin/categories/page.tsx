import { createCategory } from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  const [categories, templates] = await Promise.all([
    prisma.category.findMany({ include: { parent: true, template: true }, orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }] }),
    prisma.fieldTemplate.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
      <section className="rounded-[30px] border border-border bg-white p-6">
        <h1 className="text-3xl font-black text-graphite">Категории</h1>
        <p className="mt-2 text-muted">Дерево категорий, SEO-поля и шаблон конструктора для товаров.</p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-background text-muted">
              <tr>
                <th className="p-4">Название</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Родитель</th>
                <th className="p-4">Шаблон</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t border-border">
                  <td className="p-4 font-semibold text-graphite">{category.name}</td>
                  <td className="p-4 text-muted">{category.slug}</td>
                  <td className="p-4 text-muted">{category.parent?.name ?? "Корень"}</td>
                  <td className="p-4 text-muted">{category.template?.name ?? "Не задан"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <form action={createCategory} className="h-fit rounded-[30px] border border-border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-graphite">Новая категория</h2>
        <div className="mt-5 space-y-3">
          <input name="name" required placeholder="Название" className="admin-input" />
          <input name="slug" placeholder="slug (опционально)" className="admin-input" />
          <select name="parentId" className="admin-input">
            <option value="">Без родителя</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select name="templateId" className="admin-input">
            <option value="">Без шаблона</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          <input name="h1" placeholder="H1" className="admin-input" />
          <input name="metaTitle" placeholder="Meta title" className="admin-input" />
          <textarea name="metaDescription" placeholder="Meta description" rows={3} className="admin-textarea" />
          <textarea name="description" placeholder="Описание категории" rows={4} className="admin-textarea" />
        </div>
        <button className="mt-5 h-11 w-full rounded-full bg-petrol text-sm font-bold text-white hover:bg-petrol-soft">Создать</button>
      </form>
    </div>
  );
}
