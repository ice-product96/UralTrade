"use client";

import { ArrowRight, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createService, deleteService, updateService } from "@/app/admin/actions";
import { AdminImageUpload } from "@/components/admin/admin-file-upload";
import { AdminFormActions } from "@/components/admin/admin-form-footer";
import { AdminModal } from "@/components/admin/admin-modal";
import { ServiceExamplesManager, type ServiceExampleItem } from "@/components/admin/service-examples-manager";
import { ProductImage } from "@/components/product-image";
import { useCrudModal } from "@/components/admin/use-crud-modal";
import { normalizeImageSrc } from "@/lib/image-url";

type ServiceRow = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  body: string;
  imageUrl: string | null;
  sortOrder: number;
  published: boolean;
  h1: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  examples: Array<{ title: string; description: string | null; imageUrl: string }>;
  _count: { examples: number };
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-background p-4">
      <div className="text-sm font-black uppercase tracking-[0.16em] text-petrol">{title}</div>
      {children}
    </div>
  );
}

export function ServicesCrud({ services }: { services: ServiceRow[] }) {
  const router = useRouter();
  const modal = useCrudModal<ServiceRow>();
  const [pending, startTransition] = useTransition();
  const [examples, setExamples] = useState<ServiceExampleItem[]>([]);
  const current = modal.item;

  useEffect(() => {
    if (!modal.open) return;
    setExamples(
      current?.examples.map((example) => ({
        title: example.title,
        description: example.description ?? undefined,
        imageUrl: example.imageUrl,
      })) ?? [],
    );
  }, [modal.open, current]);

  function submit(action: (fd: FormData) => Promise<void>) {
    return (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      formData.set("examplesJson", JSON.stringify(examples));
      startTransition(async () => {
        await action(formData);
        router.refresh();
        modal.close();
      });
    };
  }

  function handleDelete() {
    if (!modal.item || !confirm(`Удалить услугу «${modal.item.title}»?`)) return;
    const formData = new FormData();
    formData.set("id", modal.item.id);
    startTransition(async () => {
      await deleteService(formData);
      router.refresh();
      modal.close();
    });
  }

  return (
    <>
      <section className="rounded-[30px] border border-border bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-graphite">Услуги</h1>
            <p className="mt-2 text-sm text-muted">Карточки услуг на странице /services и детальные страницы с примерами работ.</p>
          </div>
          <button
            type="button"
            onClick={modal.openCreate}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-lime px-5 text-sm font-bold text-white hover:bg-lime-hover"
          >
            <Plus className="h-4 w-4" />
            Добавить услугу
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted md:col-span-2 xl:col-span-3">
              Услуги пока не добавлены.
            </div>
          ) : (
            services.map((service) => (
              <article key={service.id} className="overflow-hidden rounded-[24px] border border-border bg-background/60">
                <div className="relative aspect-[16/10] bg-white">
                  {service.imageUrl ? (
                    <ProductImage src={normalizeImageSrc(service.imageUrl)} alt={service.title} fill sizes="360px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-bold text-muted">Без фото</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black text-graphite">{service.title}</h2>
                    {service.published ? (
                      <span className="rounded-full bg-lime/10 px-2 py-1 text-xs font-bold text-lime">Опубликована</span>
                    ) : (
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-muted">Скрыта</span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{service.shortDescription}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="text-xs text-muted">{service._count.examples} примеров</span>
                    <Link href={`/services/${service.slug}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-bold text-petrol hover:text-lime">
                      На сайте <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => modal.openEdit(service)}
                    className="mt-4 inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold text-petrol hover:bg-white"
                  >
                    <Pencil className="h-4 w-4" />
                    Редактировать
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <AdminModal open={modal.open} title={modal.isEdit ? "Редактировать услугу" : "Новая услуга"} onClose={modal.close} size="lg">
        <form onSubmit={submit(modal.isEdit ? updateService : createService)} className="space-y-4">
          {current ? <input type="hidden" name="id" value={current.id} /> : null}

          <Section title="Основное">
            <input name="title" required defaultValue={current?.title} placeholder="Название услуги" className="admin-input bg-white" />
            <input name="slug" defaultValue={current?.slug} placeholder="slug (необязательно)" className="admin-input bg-white" />
            <textarea
              name="shortDescription"
              required
              rows={2}
              defaultValue={current?.shortDescription}
              placeholder="Краткое описание для карточки"
              className="admin-textarea bg-white"
            />
            <AdminImageUpload name="imageUrl" defaultValue={current?.imageUrl ?? ""} label="Изображение услуги" />
            <input
              name="sortOrder"
              type="number"
              defaultValue={current?.sortOrder ?? (services.length + 1) * 10}
              placeholder="Порядок сортировки"
              className="admin-input bg-white"
            />
            <label className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold">
              <input name="published" type="checkbox" defaultChecked={current?.published ?? true} className="accent-lime" />
              Опубликована
            </label>
          </Section>

          <Section title="Описание на странице услуги">
            <textarea name="body" rows={8} defaultValue={current?.body ?? ""} placeholder="Подробное описание услуги" className="admin-textarea bg-white" />
          </Section>

          <Section title="Примеры выполненных работ">
            <ServiceExamplesManager examples={examples} onChange={setExamples} />
            <input type="hidden" name="examplesJson" value={JSON.stringify(examples)} />
          </Section>

          <Section title="SEO">
            <input name="h1" defaultValue={current?.h1 ?? ""} placeholder="H1" className="admin-input bg-white" />
            <input name="metaTitle" defaultValue={current?.metaTitle ?? ""} placeholder="Meta title" className="admin-input bg-white" />
            <textarea name="metaDescription" defaultValue={current?.metaDescription ?? ""} rows={3} placeholder="Meta description" className="admin-textarea bg-white" />
          </Section>

          <AdminFormActions onCancel={modal.close} onDelete={modal.isEdit ? handleDelete : undefined} />
          {pending ? <p className="text-sm text-muted">Сохранение...</p> : null}
        </form>
      </AdminModal>
    </>
  );
}
