import { createRedirect, createSeoTemplate } from "@/app/admin/actions";
import { getSeoData } from "@/lib/data";

export default async function AdminSeoPage() {
  const { templates, redirects } = await getSeoData();

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_460px]">
      <section className="space-y-6">
        <div className="rounded-[30px] border border-border bg-white p-6">
          <h1 className="text-3xl font-black text-graphite">SEO</h1>
          <p className="mt-2 text-muted">Шаблоны мета-тегов, редиректы, robots и sitemap генерируются приложением.</p>
          <div className="mt-6 space-y-3">
            {templates.map((template) => (
              <article key={template.id} className="rounded-2xl border border-border p-4">
                <div className="font-black text-petrol">{template.entityType}</div>
                <div className="mt-2 text-sm font-semibold text-graphite">{template.metaTitle}</div>
                <p className="mt-1 text-sm text-muted">{template.metaDescription}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="rounded-[30px] border border-border bg-white p-6">
          <h2 className="text-xl font-black text-graphite">Редиректы</h2>
          <div className="mt-4 space-y-2">
            {redirects.map((redirect) => (
              <div key={redirect.id} className="flex justify-between rounded-2xl bg-background px-4 py-3 text-sm">
                <span>{redirect.fromPath}</span>
                <span className="font-bold text-petrol">
                  {redirect.code} → {redirect.toPath}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <aside className="space-y-5">
        <form action={createSeoTemplate} className="rounded-[30px] border border-border bg-white p-6">
          <h2 className="text-xl font-black text-graphite">Новый SEO-шаблон</h2>
          <div className="mt-5 space-y-3">
            <input name="entityType" required placeholder="product/category/brand" className="admin-input" />
            <input name="metaTitle" required placeholder="{name} купить — UralTrade" className="admin-input" />
            <textarea name="metaDescription" required rows={3} placeholder="Meta description" className="admin-textarea" />
            <input name="h1" placeholder="{name}" className="admin-input" />
          </div>
          <button className="mt-5 h-11 w-full rounded-full bg-petrol text-sm font-bold text-white">Создать шаблон</button>
        </form>
        <form action={createRedirect} className="rounded-[30px] border border-border bg-white p-6">
          <h2 className="text-xl font-black text-graphite">Новый редирект</h2>
          <div className="mt-5 space-y-3">
            <input name="fromPath" required placeholder="/old-url" className="admin-input" />
            <input name="toPath" required placeholder="/new-url" className="admin-input" />
            <input name="code" type="number" defaultValue={301} className="admin-input" />
          </div>
          <button className="mt-5 h-11 w-full rounded-full bg-lime text-sm font-bold text-white">Создать редирект</button>
        </form>
      </aside>
    </div>
  );
}
