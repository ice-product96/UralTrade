import Link from "next/link";
import { getAdminStats } from "@/lib/data";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Товаров", value: stats.products, href: "/admin/products" },
    { label: "Категорий", value: stats.categories, href: "/admin/categories" },
    { label: "Полей конструктора", value: stats.fields, href: "/admin/fields" },
    { label: "Заказов", value: stats.orders, href: "/admin/orders" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-graphite">Панель управления</h1>
        <p className="mt-2 text-muted">Управляйте каталогом, фильтрами, SEO и заказами из единой админки.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="rounded-[28px] border border-border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-petrol/10">
            <div className="text-sm font-semibold text-muted">{card.label}</div>
            <div className="mt-3 text-4xl font-black text-petrol">{card.value}</div>
          </Link>
        ))}
      </div>
      <section className="rounded-[30px] border border-border bg-white p-6">
        <h2 className="text-xl font-black text-graphite">Архитектура каталога</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Общие поля товара хранятся в модели Product, а настраиваемые поля идут через FieldTemplate, FieldDefinition и ProductFieldValue.
          Это позволяет делать разные карточки под разные категории и одновременно строить быстрый фасетный фильтр.
        </p>
      </section>
    </div>
  );
}
