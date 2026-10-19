"use client";

import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createHomeBanner, deleteHomeBanner, updateHomeBanner } from "@/app/admin/actions";
import { AdminImageUpload } from "@/components/admin/admin-file-upload";
import { AdminFormActions } from "@/components/admin/admin-form-footer";
import { AdminModal } from "@/components/admin/admin-modal";
import { useCrudModal } from "@/components/admin/use-crud-modal";
import { ProductImage } from "@/components/product-image";
import { normalizeImageSrc } from "@/lib/image-url";

type BannerRow = {
  id: string;
  kicker: string;
  title: string;
  text: string;
  buttonLabel: string;
  link: string;
  imageUrl: string;
  sortOrder: number;
  published: boolean;
};

export function HomeBannersCrud({ banners }: { banners: BannerRow[] }) {
  const router = useRouter();
  const modal = useCrudModal<BannerRow>();
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
    if (!modal.item || !confirm(`Удалить баннер «${modal.item.title}»?`)) return;
    const formData = new FormData();
    formData.set("id", modal.item.id);
    startTransition(async () => {
      await deleteHomeBanner(formData);
      router.refresh();
      modal.close();
    });
  }

  return (
    <>
      <section className="rounded-[30px] border border-border bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-graphite">Баннеры на главной</h1>
            <p className="mt-2 text-sm text-muted">
              Слайдер на первом экране. Если нет ни одного опубликованного баннера, показывается стандартная картинка.
              Рекомендуемый размер изображения — 2400×600 px (на телефоне баннер обрезается по центру).
            </p>
          </div>
          <button
            type="button"
            onClick={modal.openCreate}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-lime px-5 text-sm font-bold text-white hover:bg-lime-hover"
          >
            <Plus className="h-4 w-4" />
            Добавить баннер
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {banners.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted md:col-span-2">Баннеры пока не добавлены.</div>
          ) : (
            banners.map((banner) => (
              <article key={banner.id} className="overflow-hidden rounded-[24px] border border-border bg-background/60">
                <div className="relative aspect-[4/1] bg-white">
                  <ProductImage src={normalizeImageSrc(banner.imageUrl)} alt={banner.title} fill sizes="600px" className="object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black text-graphite">{banner.title}</h2>
                    {banner.published ? (
                      <span className="rounded-full bg-lime/10 px-2 py-1 text-xs font-bold text-lime">Опубликован</span>
                    ) : (
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-muted">Скрыт</span>
                    )}
                    <span className="text-xs text-muted">Порядок: {banner.sortOrder}</span>
                  </div>
                  {banner.text ? <p className="mt-2 line-clamp-2 text-sm text-muted">{banner.text}</p> : null}
                  <button
                    type="button"
                    onClick={() => modal.openEdit(banner)}
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

      <AdminModal open={modal.open} title={modal.isEdit ? "Редактировать баннер" : "Новый баннер"} onClose={modal.close} size="lg">
        <form onSubmit={submit(modal.isEdit ? updateHomeBanner : createHomeBanner)} className="space-y-3">
          {current ? <input type="hidden" name="id" value={current.id} /> : null}
          <AdminImageUpload name="imageUrl" defaultValue={current?.imageUrl ?? ""} label="Изображение баннера (обязательно)" />
          <input name="kicker" defaultValue={current?.kicker ?? ""} placeholder="Надзаголовок (необязательно), например «Собственное производство»" className="admin-input" />
          <input name="title" required defaultValue={current?.title ?? ""} placeholder="Заголовок" className="admin-input" />
          <textarea name="text" rows={2} defaultValue={current?.text ?? ""} placeholder="Текст (необязательно)" className="admin-textarea" />
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="buttonLabel" defaultValue={current?.buttonLabel ?? ""} placeholder="Текст кнопки, например «Подробнее»" className="admin-input" />
            <input name="link" defaultValue={current?.link ?? ""} placeholder="Ссылка, например /catalog/gidronasosy" className="admin-input" />
          </div>
          <input
            name="sortOrder"
            type="number"
            defaultValue={current?.sortOrder ?? (banners.length + 1) * 10}
            placeholder="Порядок сортировки"
            className="admin-input"
          />
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold">
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
