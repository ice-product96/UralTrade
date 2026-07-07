"use client";

import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateContentPage } from "@/app/admin/actions";
import { AdminFormActions } from "@/components/admin/admin-form-footer";
import { AdminModal } from "@/components/admin/admin-modal";
import { useCrudModal } from "@/components/admin/use-crud-modal";

type PageRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  body: string;
  metaTitle: string | null;
  metaDescription: string | null;
  h1: string | null;
  published: boolean;
  updatedAt: Date;
};

export function PagesCrud({ pages }: { pages: PageRow[] }) {
  const router = useRouter();
  const modal = useCrudModal<PageRow>();
  const [pending, startTransition] = useTransition();
  const current = modal.item;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await updateContentPage(formData);
      router.refresh();
      modal.close();
    });
  }

  return (
    <>
      <section className="rounded-[30px] border border-border bg-white p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-graphite">Страницы сайта</h1>
          <p className="mt-2 text-sm text-muted">
            Редактируйте информационные страницы. Раздел «Акции» формируется автоматически из товаров со скидкой.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-3 py-3 font-semibold">Страница</th>
                <th className="px-3 py-3 font-semibold">URL</th>
                <th className="px-3 py-3 font-semibold">Статус</th>
                <th className="px-3 py-3 font-semibold">Обновлено</th>
                <th className="px-3 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-border/70">
                  <td className="px-3 py-4 font-bold text-graphite">{page.title}</td>
                  <td className="px-3 py-4">
                    <Link href={`/page/${page.slug}`} target="_blank" className="inline-flex items-center gap-1 text-petrol hover:text-lime">
                      /page/{page.slug}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                  <td className="px-3 py-4">
                    {page.published ? (
                      <span className="rounded-full bg-lime/10 px-2 py-1 text-xs font-bold text-lime">Опубликована</span>
                    ) : (
                      <span className="rounded-full bg-background px-2 py-1 text-xs font-bold text-muted">Скрыта</span>
                    )}
                  </td>
                  <td className="px-3 py-4 text-muted">{new Date(page.updatedAt).toLocaleDateString("ru-RU")}</td>
                  <td className="px-3 py-4">
                    <button
                      type="button"
                      onClick={() => modal.openEdit(page)}
                      className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold text-petrol hover:bg-background"
                    >
                      <Pencil className="h-4 w-4" />
                      Редактировать
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AdminModal open={modal.open} title={current ? `Редактировать: ${current.title}` : "Страница"} onClose={modal.close}>
        {current ? (
          <form onSubmit={submit} className="space-y-4">
            <input type="hidden" name="id" value={current.id} />
            <input type="hidden" name="slug" value={current.slug} />
            <input name="title" required defaultValue={current.title} placeholder="Заголовок" className="admin-input" />
            <input name="h1" defaultValue={current.h1 ?? ""} placeholder="H1 (если отличается от заголовка)" className="admin-input" />
            <textarea
              name="description"
              rows={2}
              defaultValue={current.description ?? ""}
              placeholder="Краткое описание под заголовком"
              className="admin-textarea"
            />
            <textarea
              name="body"
              rows={12}
              defaultValue={current.body}
              placeholder="Содержимое страницы (HTML: p, h3, ul, li, strong)"
              className="admin-textarea font-mono text-xs"
            />
            <input name="metaTitle" defaultValue={current.metaTitle ?? ""} placeholder="Meta title" className="admin-input" />
            <textarea
              name="metaDescription"
              rows={2}
              defaultValue={current.metaDescription ?? ""}
              placeholder="Meta description"
              className="admin-textarea"
            />
            <label className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm font-semibold">
              <input name="published" type="checkbox" defaultChecked={current.published} className="accent-lime" />
              Опубликована
            </label>
            <AdminFormActions onCancel={modal.close} />
          </form>
        ) : null}
      </AdminModal>
    </>
  );
}
