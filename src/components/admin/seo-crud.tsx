"use client";

import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  createRedirect,
  createSeoTemplate,
  deleteRedirect,
  deleteSeoTemplate,
  updateRedirect,
  updateSeoTemplate,
} from "@/app/admin/actions";
import { AdminFormActions } from "@/components/admin/admin-form-footer";
import { AdminModal } from "@/components/admin/admin-modal";
import { useCrudModal } from "@/components/admin/use-crud-modal";

type SeoTemplateRow = {
  id: string;
  entityType: string;
  metaTitle: string;
  metaDescription: string;
  h1: string | null;
};

type RedirectRow = {
  id: string;
  fromPath: string;
  toPath: string;
  code: number;
};

export function SeoCrud({ templates, redirects }: { templates: SeoTemplateRow[]; redirects: RedirectRow[] }) {
  const router = useRouter();
  const templateModal = useCrudModal<SeoTemplateRow>();
  const redirectModal = useCrudModal<RedirectRow>();
  const [pending, startTransition] = useTransition();

  function submit(action: (fd: FormData) => Promise<void>, close: () => void) {
    return (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      startTransition(async () => {
        await action(formData);
        router.refresh();
        close();
      });
    };
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-graphite">SEO</h1>
          <p className="mt-2 text-muted">Шаблоны мета-тегов и редиректы.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={templateModal.openCreate} className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-white px-5 text-sm font-bold text-petrol hover:bg-background">
            <Plus className="h-4 w-4" />
            SEO-шаблон
          </button>
          <button type="button" onClick={redirectModal.openCreate} className="inline-flex h-11 items-center gap-2 rounded-full bg-lime px-5 text-sm font-bold text-white hover:bg-lime-hover">
            <Plus className="h-4 w-4" />
            Редирект
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[30px] border border-border bg-white p-6">
          <h2 className="text-xl font-black text-graphite">SEO-шаблоны</h2>
          <div className="mt-4 space-y-3">
            {templates.map((template) => (
              <article key={template.id} className="flex items-start justify-between gap-3 rounded-2xl border border-border p-4">
                <div>
                  <div className="font-black text-petrol">{template.entityType}</div>
                  <div className="mt-2 text-sm font-semibold text-graphite">{template.metaTitle}</div>
                  <p className="mt-1 text-sm text-muted">{template.metaDescription}</p>
                </div>
                <button type="button" onClick={() => templateModal.openEdit(template)} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-petrol hover:bg-background">
                  <Pencil className="h-4 w-4" />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-border bg-white p-6">
          <h2 className="text-xl font-black text-graphite">Редиректы</h2>
          <div className="mt-4 space-y-2">
            {redirects.map((redirect) => (
              <div key={redirect.id} className="flex items-center justify-between gap-3 rounded-2xl bg-background px-4 py-3 text-sm">
                <span>{redirect.fromPath}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-petrol">
                    {redirect.code} → {redirect.toPath}
                  </span>
                  <button type="button" onClick={() => redirectModal.openEdit(redirect)} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-petrol hover:bg-white">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <AdminModal
        open={templateModal.open}
        onClose={templateModal.close}
        title={templateModal.isEdit ? "Редактировать SEO-шаблон" : "Новый SEO-шаблон"}
      >
        <form
          onSubmit={submit(templateModal.isEdit ? updateSeoTemplate : createSeoTemplate, templateModal.close)}
          className="space-y-3"
        >
          {templateModal.item ? <input type="hidden" name="id" value={templateModal.item.id} /> : null}
          <input name="entityType" required defaultValue={templateModal.item?.entityType} placeholder="product / category / brand" className="admin-input" />
          <input name="metaTitle" required defaultValue={templateModal.item?.metaTitle} placeholder="Meta title" className="admin-input" />
          <textarea name="metaDescription" required defaultValue={templateModal.item?.metaDescription} rows={3} placeholder="Meta description" className="admin-textarea" />
          <input name="h1" defaultValue={templateModal.item?.h1 ?? ""} placeholder="H1" className="admin-input" />
          <AdminFormActions
            onCancel={templateModal.close}
            onDelete={
              templateModal.isEdit && templateModal.item
                ? () => {
                    if (!confirm("Удалить SEO-шаблон?")) return;
                    const fd = new FormData();
                    fd.set("id", templateModal.item!.id);
                    startTransition(async () => {
                      await deleteSeoTemplate(fd);
                      router.refresh();
                      templateModal.close();
                    });
                  }
                : undefined
            }
          />
        </form>
      </AdminModal>

      <AdminModal
        open={redirectModal.open}
        onClose={redirectModal.close}
        title={redirectModal.isEdit ? "Редактировать редирект" : "Новый редирект"}
      >
        <form
          onSubmit={submit(redirectModal.isEdit ? updateRedirect : createRedirect, redirectModal.close)}
          className="space-y-3"
        >
          {redirectModal.item ? <input type="hidden" name="id" value={redirectModal.item.id} /> : null}
          <input name="fromPath" required defaultValue={redirectModal.item?.fromPath} placeholder="/old-url" className="admin-input" />
          <input name="toPath" required defaultValue={redirectModal.item?.toPath} placeholder="/new-url" className="admin-input" />
          <input name="code" type="number" defaultValue={redirectModal.item?.code ?? 301} className="admin-input" />
          <AdminFormActions
            onCancel={redirectModal.close}
            onDelete={
              redirectModal.isEdit && redirectModal.item
                ? () => {
                    if (!confirm("Удалить редирект?")) return;
                    const fd = new FormData();
                    fd.set("id", redirectModal.item!.id);
                    startTransition(async () => {
                      await deleteRedirect(fd);
                      router.refresh();
                      redirectModal.close();
                    });
                  }
                : undefined
            }
          />
          {pending ? <p className="text-sm text-muted">Сохранение...</p> : null}
        </form>
      </AdminModal>
    </>
  );
}
