"use client";

import { ExternalLink, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { createCategory, deleteCategory, updateCategory } from "@/app/admin/actions";
import { AdminImageUpload } from "@/components/admin/admin-file-upload";
import { AdminFormActions } from "@/components/admin/admin-form-footer";
import { AdminModal } from "@/components/admin/admin-modal";
import { useCrudModal } from "@/components/admin/use-crud-modal";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  templateId: string | null;
  h1: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  parent: { name: string } | null;
  template: { name: string } | null;
};

type TemplateOption = { id: string; name: string };

export function CategoriesCrud({ categories, templates }: { categories: CategoryRow[]; templates: TemplateOption[] }) {
  const router = useRouter();
  const modal = useCrudModal<CategoryRow>();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const current = modal.item;

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) => {
        const aRoot = a.parent?.name ?? "";
        const bRoot = b.parent?.name ?? "";
        if (aRoot !== bRoot) return aRoot.localeCompare(bRoot, "ru");
        return a.name.localeCompare(b.name, "ru");
      }),
    [categories],
  );

  function submit(action: (fd: FormData) => Promise<void>) {
    return (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      startTransition(async () => {
        try {
          setError(null);
          await action(formData);
          router.refresh();
          modal.close();
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : "Не удалось сохранить категорию");
        }
      });
    };
  }

  function handleDelete() {
    if (!modal.item || !confirm(`Удалить категорию «${modal.item.name}»?`)) return;
    const formData = new FormData();
    formData.set("id", modal.item.id);
    startTransition(async () => {
      try {
        await deleteCategory(formData);
        router.refresh();
        modal.close();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Не удалось удалить категорию");
      }
    });
  }

  return (
    <>
      <section className="rounded-[30px] border border-border bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-graphite">Категории</h1>
            <p className="mt-2 text-muted">Иерархия каталога, изображения, SEO и шаблоны характеристик.</p>
          </div>
          <button type="button" onClick={modal.openCreate} className="inline-flex h-11 items-center gap-2 rounded-full bg-lime px-5 text-sm font-bold text-white hover:bg-lime-hover">
            <Plus className="h-4 w-4" />
            Добавить
          </button>
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-background text-muted">
              <tr>
                <th className="p-4">Фото</th>
                <th className="p-4">Название</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Родитель</th>
                <th className="p-4">Шаблон</th>
                <th className="p-4 w-32">Действия</th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.map((category) => (
                <tr key={category.id} className="border-t border-border hover:bg-background/60">
                  <td className="p-4">
                    {category.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={category.imageUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="p-4 font-semibold text-graphite">{category.name}</td>
                  <td className="p-4 text-muted">{category.slug}</td>
                  <td className="p-4 text-muted">{category.parent?.name ?? "Корень"}</td>
                  <td className="p-4 text-muted">{category.template?.name ?? "—"}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link href={`/catalog/${category.slug}`} target="_blank" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-petrol hover:bg-background" aria-label="Открыть на сайте">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button type="button" onClick={() => modal.openEdit(category)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-petrol hover:bg-background">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AdminModal open={modal.open} onClose={modal.close} title={modal.isEdit ? "Редактировать категорию" : "Новая категория"} size="lg">
        <form onSubmit={submit(modal.isEdit ? updateCategory : createCategory)} className="space-y-3">
          {current ? <input type="hidden" name="id" value={current.id} /> : null}
          <input name="name" required defaultValue={current?.name} placeholder="Название" className="admin-input" />
          <input name="slug" defaultValue={current?.slug} placeholder="slug" className="admin-input" />
          <AdminImageUpload name="imageUrl" defaultValue={current?.imageUrl ?? ""} label="Изображение категории" />
          <select name="parentId" defaultValue={current?.parentId ?? ""} className="admin-input">
            <option value="">Без родителя</option>
            {categories.filter((c) => c.id !== current?.id).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select name="templateId" defaultValue={current?.templateId ?? ""} className="admin-input">
            <option value="">Без шаблона</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          <input name="h1" defaultValue={current?.h1 ?? ""} placeholder="H1" className="admin-input" />
          <input name="metaTitle" defaultValue={current?.metaTitle ?? ""} placeholder="Meta title" className="admin-input" />
          <textarea name="metaDescription" defaultValue={current?.metaDescription ?? ""} rows={3} placeholder="Meta description" className="admin-textarea" />
          <textarea name="description" defaultValue={current?.description ?? ""} rows={4} placeholder="Описание" className="admin-textarea" />
          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
          <AdminFormActions onCancel={modal.close} onDelete={modal.isEdit ? handleDelete : undefined} />
          {pending ? <p className="text-sm text-muted">Сохранение...</p> : null}
        </form>
      </AdminModal>
    </>
  );
}
