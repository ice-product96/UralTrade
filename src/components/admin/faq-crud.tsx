"use client";

import { GripVertical, Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createFaqItem, deleteFaqItem, updateFaqItem } from "@/app/admin/actions";
import { AdminFormActions } from "@/components/admin/admin-form-footer";
import { AdminModal } from "@/components/admin/admin-modal";
import { useCrudModal } from "@/components/admin/use-crud-modal";

type FaqRow = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  published: boolean;
  updatedAt: Date;
};

export function FaqCrud({ items }: { items: FaqRow[] }) {
  const router = useRouter();
  const modal = useCrudModal<FaqRow>();
  const [pending, startTransition] = useTransition();
  const current = modal.item;

  function submit(action: (fd: FormData) => Promise<void>) {
    return (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      startTransition(async () => {
        await action(formData);
        router.refresh();
        modal.close();
      });
    };
  }

  function handleDelete() {
    if (!modal.item || !confirm(`Удалить вопрос «${modal.item.question}»?`)) return;
    const formData = new FormData();
    formData.set("id", modal.item.id);
    startTransition(async () => {
      await deleteFaqItem(formData);
      router.refresh();
      modal.close();
    });
  }

  return (
    <>
      <section className="rounded-[30px] border border-border bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-graphite">Вопрос — ответ</h1>
            <p className="mt-2 text-sm text-muted">Управление блоком FAQ на странице /page/faq</p>
          </div>
          <button
            type="button"
            onClick={modal.openCreate}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-lime px-5 text-sm font-bold text-white hover:bg-lime-hover"
          >
            <Plus className="h-4 w-4" />
            Добавить вопрос
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">Пока нет вопросов. Добавьте первый.</div>
          ) : (
            items.map((item) => (
              <article key={item.id} className="flex flex-wrap items-start gap-4 rounded-2xl border border-border p-4">
                <GripVertical className="mt-1 h-5 w-5 shrink-0 text-border" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-black text-graphite">{item.question}</span>
                    {item.published ? (
                      <span className="rounded-full bg-lime/10 px-2 py-1 text-xs font-bold text-lime">Опубликован</span>
                    ) : (
                      <span className="rounded-full bg-background px-2 py-1 text-xs font-bold text-muted">Скрыт</span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{item.answer}</p>
                  <div className="mt-2 text-xs text-muted">Порядок: {item.sortOrder}</div>
                </div>
                <button
                  type="button"
                  onClick={() => modal.openEdit(item)}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold text-petrol hover:bg-background"
                >
                  <Pencil className="h-4 w-4" />
                  Изменить
                </button>
              </article>
            ))
          )}
        </div>
      </section>

      <AdminModal open={modal.open} title={modal.isEdit ? "Редактировать вопрос" : "Новый вопрос"} onClose={modal.close}>
        <form onSubmit={submit(modal.isEdit ? updateFaqItem : createFaqItem)} className="space-y-4">
          {current ? <input type="hidden" name="id" value={current.id} /> : null}
          <input name="question" required defaultValue={current?.question} placeholder="Вопрос" className="admin-input" />
          <textarea
            name="answer"
            required
            rows={6}
            defaultValue={current?.answer}
            placeholder="Ответ (можно с переносами строк)"
            className="admin-textarea"
          />
          <input
            name="sortOrder"
            type="number"
            defaultValue={current?.sortOrder ?? (items.length + 1) * 10}
            placeholder="Порядок сортировки"
            className="admin-input"
          />
          <label className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm font-semibold">
            <input name="published" type="checkbox" defaultChecked={current?.published ?? true} className="accent-lime" />
            Опубликован
          </label>
          <AdminFormActions onCancel={modal.close} onDelete={modal.isEdit ? handleDelete : undefined} />
          {pending ? <p className="text-sm text-muted">Сохранение...</p> : null}
        </form>
      </AdminModal>
    </>
  );
}
