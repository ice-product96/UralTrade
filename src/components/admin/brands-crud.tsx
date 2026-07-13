"use client";

import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createBrand, deleteBrand, updateBrand } from "@/app/admin/actions";
import { AdminImageUpload } from "@/components/admin/admin-file-upload";
import { ProductImage } from "@/components/product-image";
import { AdminFormActions } from "@/components/admin/admin-form-footer";
import { AdminModal } from "@/components/admin/admin-modal";
import { useCrudModal } from "@/components/admin/use-crud-modal";

type BrandRow = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  _count: { products: number };
};

export function BrandsCrud({ brands }: { brands: BrandRow[] }) {
  const router = useRouter();
  const modal = useCrudModal<BrandRow>();
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
    if (!modal.item || !confirm(`Удалить бренд «${modal.item.name}»?`)) return;
    const formData = new FormData();
    formData.set("id", modal.item.id);
    startTransition(async () => {
      await deleteBrand(formData);
      router.refresh();
      modal.close();
    });
  }

  return (
    <>
      <section className="rounded-[30px] border border-border bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-black text-graphite">Бренды</h1>
          <button type="button" onClick={modal.openCreate} className="inline-flex h-11 items-center gap-2 rounded-full bg-lime px-5 text-sm font-bold text-white hover:bg-lime-hover">
            <Plus className="h-4 w-4" />
            Добавить
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {brands.map((brand) => (
            <article key={brand.id} className="rounded-2xl border border-border p-4">
              {brand.logoUrl ? (
                <div className="relative mb-4 h-16 overflow-hidden rounded-2xl bg-background">
                  <ProductImage src={brand.logoUrl} alt={brand.name} fill className="object-contain p-2" />
                </div>
              ) : null}
              <div className="font-black text-graphite">{brand.name}</div>
              <div className="mt-1 text-sm text-muted">{brand._count.products} товаров</div>
              <button type="button" onClick={() => modal.openEdit(brand)} className="mt-4 inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold text-petrol hover:bg-background">
                <Pencil className="h-4 w-4" />
                Редактировать
              </button>
            </article>
          ))}
        </div>
      </section>

      <AdminModal open={modal.open} onClose={modal.close} title={modal.isEdit ? "Редактировать бренд" : "Новый бренд"}>
        <form onSubmit={submit(modal.isEdit ? updateBrand : createBrand)} className="space-y-3">
          {current ? <input type="hidden" name="id" value={current.id} /> : null}
          <input name="name" required defaultValue={current?.name} placeholder="Название" className="admin-input" />
          <input name="slug" defaultValue={current?.slug} placeholder="slug" className="admin-input" />
          <AdminImageUpload
            name="logoUrl"
            defaultValue={current?.logoUrl ?? ""}
            label="Логотип"
            previewClassName="relative mx-auto aspect-square w-32 overflow-hidden rounded-2xl border border-border bg-background"
          />
          <textarea name="description" defaultValue={current?.description ?? ""} rows={4} placeholder="Описание" className="admin-textarea" />
          <input name="metaTitle" defaultValue={current?.metaTitle ?? ""} placeholder="Meta title" className="admin-input" />
          <textarea name="metaDescription" defaultValue={current?.metaDescription ?? ""} rows={3} placeholder="Meta description" className="admin-textarea" />
          <AdminFormActions onCancel={modal.close} onDelete={modal.isEdit ? handleDelete : undefined} />
          {pending ? <p className="text-sm text-muted">Сохранение...</p> : null}
        </form>
      </AdminModal>
    </>
  );
}
