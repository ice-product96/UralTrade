import Image from "next/image";
import { createHomeBanner } from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";

export default async function AdminContentPage() {
  const banners = await prisma.homeBanner.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
      <section className="rounded-[30px] border border-border bg-white p-6">
        <h1 className="text-3xl font-black text-graphite">Контент главной</h1>
        <div className="mt-6 grid gap-4">
          {banners.map((banner) => (
            <article key={banner.id} className="grid gap-4 rounded-2xl border border-border p-4 md:grid-cols-[220px_1fr]">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-background">
                <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover" />
              </div>
              <div>
                <div className="text-lg font-black text-graphite">{banner.title}</div>
                <p className="mt-2 text-sm text-muted">{banner.subtitle}</p>
                <div className="mt-3 text-xs font-bold text-petrol">{banner.href}</div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <form action={createHomeBanner} className="h-fit rounded-[30px] border border-border bg-white p-6">
        <h2 className="text-xl font-black text-graphite">Новый баннер</h2>
        <div className="mt-5 space-y-3">
          <input name="title" required placeholder="Заголовок" className="admin-input" />
          <textarea name="subtitle" rows={3} placeholder="Подзаголовок" className="admin-textarea" />
          <input name="imageUrl" required placeholder="/demo/hero-equipment.svg" className="admin-input" />
          <input name="href" placeholder="/catalog/nasosy" className="admin-input" />
          <input name="buttonLabel" placeholder="Текст кнопки" className="admin-input" />
          <input name="sortOrder" type="number" placeholder="Порядок" className="admin-input" />
        </div>
        <button className="mt-5 h-11 w-full rounded-full bg-lime text-sm font-bold text-white">Создать баннер</button>
      </form>
    </div>
  );
}
