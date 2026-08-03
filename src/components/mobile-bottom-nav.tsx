"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, LayoutGrid, Mail, Phone, ShoppingCart, Wrench } from "lucide-react";
import { buildEmailHref, buildTelHref } from "@/lib/contacts";
import { useCartCount, useProductList } from "@/lib/use-shop-storage";
import { cn } from "@/lib/utils";

type Contacts = { phone: string | null; email: string | null };

export function MobileBottomNav({ visible, contacts }: { visible: boolean; contacts: Contacts }) {
  const pathname = usePathname();
  const favorites = useProductList("favorites");
  const cartCount = useCartCount();

  const items = [
    { href: "/", label: "Домой", icon: Home, match: (path: string) => path === "/" },
    { href: "/catalog", label: "Каталог", icon: LayoutGrid, match: (path: string) => path.startsWith("/catalog") || path.startsWith("/product") },
    {
      href: "/favorites",
      label: "Избранное",
      icon: Heart,
      count: favorites.length,
      match: (path: string) => path.startsWith("/favorites"),
    },
    { href: "/services", label: "Услуги", icon: Wrench, match: (path: string) => path.startsWith("/services") },
    contacts.phone
      ? { href: buildTelHref(contacts.phone), label: "Телефон", icon: Phone, external: true as const, match: () => false }
      : null,
    contacts.email
      ? { href: buildEmailHref(contacts.email), label: "Почта", icon: Mail, external: true as const, match: () => false }
      : null,
    {
      href: "/cart",
      label: "Корзина",
      icon: ShoppingCart,
      count: cartCount,
      match: (path: string) => path.startsWith("/cart"),
    },
  ].filter(Boolean) as Array<{
    href: string;
    label: string;
    icon: typeof Home;
    count?: number;
    external?: boolean;
    match: (path: string) => boolean;
  }>;

  return (
    <nav
      aria-label="Мобильное меню"
      className={cn(
        "fixed inset-x-3 bottom-3 z-50 lg:hidden",
        "transition-all duration-300 ease-out",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0",
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-between gap-0.5 rounded-[28px] border border-border/80 bg-white/95 px-1.5 py-2 shadow-2xl shadow-graphite/15 backdrop-blur-xl">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);
          const className = cn(
            "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 text-[10px] font-semibold leading-tight transition",
            active ? "bg-lime/10 text-lime" : "text-muted hover:text-petrol",
          );

          const content = (
            <>
              <span className="relative">
                <Icon className={cn("h-5 w-5", active && item.icon === Heart && "fill-current")} />
                {item.count && item.count > 0 ? (
                  <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-lime px-1 text-[9px] font-black leading-none text-white">
                    {item.count > 99 ? "99+" : item.count}
                  </span>
                ) : null}
              </span>
              <span className="max-w-full truncate">{item.label}</span>
            </>
          );

          if (item.external) {
            return (
              <a key={item.label} href={item.href} className={className} aria-label={item.label}>
                {content}
              </a>
            );
          }

          return (
            <Link key={item.href} href={item.href} className={className} aria-label={item.label} aria-current={active ? "page" : undefined}>
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
