import Link from "next/link";
import { Boxes, FileText, HelpCircle, Home, Layers3, Package, Phone, Settings2, ShoppingBag, Tags, Files } from "lucide-react";
import { SiteLogo } from "@/components/site-logo";

const items = [
  { href: "/admin", label: "Дашборд", icon: Home },
  { href: "/admin/categories", label: "Категории", icon: Layers3 },
  { href: "/admin/fields", label: "Поля и фильтры", icon: Settings2 },
  { href: "/admin/products", label: "Товары", icon: Package },
  { href: "/admin/brands", label: "Бренды", icon: Tags },
  { href: "/admin/orders", label: "Заказы", icon: ShoppingBag },
  { href: "/admin/content", label: "Главная", icon: Boxes },
  { href: "/admin/pages", label: "Страницы", icon: Files },
  { href: "/admin/faq", label: "Вопрос — ответ", icon: HelpCircle },
  { href: "/admin/contacts", label: "Контакты", icon: Phone },
  { href: "/admin/seo", label: "SEO", icon: FileText },
];

export function AdminNav() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-border bg-white p-5 lg:block">
      <SiteLogo href="/" height={48} />
      <nav className="mt-8 space-y-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-muted hover:bg-background hover:text-petrol">
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
