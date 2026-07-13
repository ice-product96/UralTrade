"use client";

import Image from "next/image";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createHomeBanner, deleteHomeBanner, updateHomeBanner } from "@/app/admin/actions";
import { AdminFormActions } from "@/components/admin/admin-form-footer";
import { AdminModal } from "@/components/admin/admin-modal";
import { useCrudModal } from "@/components/admin/use-crud-modal";

type BannerRow = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  href: string | null;
  buttonLabel: string | null;
  sortOrder: number;
  active: boolean;
};

export function ContentCrud({ banners }: { banners: BannerRow[] }) {
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
          <h1 className="text-3xl font-black text-graphite">Контент главной</h1>
          <button type="button" onClick={modal.openCreate} className="inline-flex h-11 items-center gap-2 rounded-full bg-lime px-5 text-sm font-bold text-white hover:bg-lime-hover">
            <Plus className="h-4 w-4" />
            Добавить баннер
          </button>
        </div>
        <div className="mt-6 grid gap-4">
          {banners.map((banner) => (
            <article key={banner.id} className="grid gap-4 rounded-2xl border border-border p-4 md:grid-cols-[220px_1fr_auto]">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-background">
                <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover" />
              </div>
              <div>
                <div className="text-lg font-black text-graphite">{banner.title}</div>
                <p className="mt-2 text-sm text-muted">{banner.subtitle}</p>
                <div className="mt-3 text-xs font-bold text-petrol">{banner.href}</div>
              </div>
              <button type="button" onClick={() => modal.openEdit(banner)} className="inline-flex h-9 items-center gap-2 self-start rounded-full border border-border px-4 text-sm font-bold text-petrol hover:bg-background">
                <Pencil className="h-4 w-4" />
                Изменить
              </button>
            </article>
          ))}
        </div>
      </section>

      <AdminModal open={modal.open} onClose={modal.close} title={modal.isEdit ? "Редактировать баннер" : "Новый баннер"} size="lg">
        <form onSubmit={submit(modal.isEdit ? updateHomeBanner : createHomeBanner)} className="space-y-3">
          {current ? <input type="hidden" name="id" value={current.id} /> : null}
          <input name="title" required defaultValue={current?.title} placeholder="Заголовок" className="admin-input" />
          <textarea name="subtitle" defaultValue={current?.subtitle ?? ""} rows={3} placeholder="Подзаголовок" className="admin-textarea" />
          <input name="imageUrl" required defaultValue={current?.imageUrl} placeholder="/demo/hero-equipment.jpg" className="admin-input" />
          <input name="href" defaultValue={current?.href ?? ""} placeholder="/catalog/nasosy" className="admin-input" />
          <input name="buttonLabel" defaultValue={current?.buttonLabel ?? ""} placeholder="Текст кнопки" className="admin-input" />
          <input name="sortOrder" type="number" defaultValue={current?.sortOrder ?? 0} placeholder="Порядок" className="admin-input" />
          <label className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm font-semibold">
            <input name="active" type="checkbox" defaultChecked={current?.active ?? true} className="accent-lime" />
            Активен
          </label>
          <AdminFormActions onCancel={modal.close} onDelete={modal.isEdit ? handleDelete : undefined} />
          {pending ? <p className="text-sm text-muted">Сохранение...</p> : null}
        </form>
      </AdminModal>
    </>
  );
}
