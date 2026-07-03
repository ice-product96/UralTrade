import Image from "next/image";
import { createBrand } from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } });

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
      <section className="rounded-[30px] border border-border bg-white p-6">
        <h1 className="text-3xl font-black text-graphite">Бренды</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {brands.map((brand) => (
            <article key={brand.id} className="rounded-2xl border border-border p-4">
              {brand.logoUrl ? (
                <div className="relative mb-4 h-16 overflow-hidden rounded-2xl bg-background">
                  <Image src={brand.logoUrl} alt={brand.name} fill className="object-contain p-2" />
                </div>
              ) : null}
              <div className="font-black text-graphite">{brand.name}</div>
              <div className="mt-1 text-sm text-muted">{brand._count.products} товаров</div>
              <p className="mt-3 text-sm text-muted">{brand.description}</p>
            </article>
          ))}
        </div>
      </section>
      <form action={createBrand} className="h-fit rounded-[30px] border border-border bg-white p-6">
        <h2 className="text-xl font-black text-graphite">Новый бренд</h2>
        <div className="mt-5 space-y-3">
          <input name="name" required placeholder="Название" className="admin-input" />
          <input name="slug" placeholder="slug" className="admin-input" />
          <input name="logoUrl" placeholder="URL логотипа" className="admin-input" />
          <textarea name="description" rows={4} placeholder="Описание" className="admin-textarea" />
          <input name="metaTitle" placeholder="Meta title" className="admin-input" />
          <textarea name="metaDescription" rows={3} placeholder="Meta description" className="admin-textarea" />
        </div>
        <button className="mt-5 h-11 w-full rounded-full bg-petrol text-sm font-bold text-white">Создать бренд</button>
      </form>
    </div>
  );
}
