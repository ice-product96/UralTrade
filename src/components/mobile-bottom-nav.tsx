"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Heart, Home, LayoutGrid, ShoppingCart } from "lucide-react";
import { useCartCount, useProductList } from "@/lib/use-shop-storage";
import { cn } from "@/lib/utils";

type NavItem =
  | {
      kind: "link";
      href: string;
      label: string;
      shortLabel?: string;
      icon: typeof Home;
      count?: number;
      active: boolean;
    }
  | {
      kind: "button";
      label: string;
      shortLabel?: string;
      icon: typeof Home;
      active: boolean;
      onClick: () => void;
    };

export function MobileBottomNav({
  visible,
  onCatalogClick,
  catalogActive = false,
}: {
  visible: boolean;
  onCatalogClick?: () => void;
  catalogActive?: boolean;
}) {
  const pathname = usePathname();
  const favorites = useProductList("favorites");
  const compare = useProductList("compare");
  const cartCount = useCartCount();

  const items: NavItem[] = [
    {
      kind: "link",
      href: "/",
      label: "Домой",
      icon: Home,
      active: pathname === "/",
    },
    onCatalogClick
      ? {
          kind: "button",
          label: "Каталог",
          icon: LayoutGrid,
          active: catalogActive,
          onClick: onCatalogClick,
        }
      : {
          kind: "link",
          href: "/catalog",
          label: "Каталог",
          icon: LayoutGrid,
          active: pathname.startsWith("/catalog") || pathname.startsWith("/product"),
        },
    {
      kind: "link",
      href: "/cart",
      label: "Корзина",
      icon: ShoppingCart,
      count: cartCount,
      active: pathname.startsWith("/cart"),
    },
    {
      kind: "link",
      href: "/favorites",
      label: "Избранное",
      shortLabel: "Избр.",
      icon: Heart,
      count: favorites.length,
      active: pathname.startsWith("/favorites"),
    },
    {
      kind: "link",
      href: "/compare",
      label: "Сравнение",
      shortLabel: "Сравн.",
      icon: BarChart3,
      count: compare.length,
      active: pathname.startsWith("/compare"),
    },
  ];

  return (
    <nav
      aria-label="Мобильное меню"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 w-full max-w-[100vw] border-t border-border bg-white box-border lg:hidden",
        "transition-transform duration-300 ease-out",
        visible ? "translate-y-0" : "pointer-events-none translate-y-full",
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-14 w-full min-w-0 max-w-7xl items-stretch px-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const className = cn(
            "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 text-[9px] font-semibold leading-none transition-colors sm:text-[10px]",
            item.active ? "text-lime" : "text-muted",
          );

          const content = (
            <>
              <span className="relative shrink-0">
                <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", item.active && item.icon === Heart && "fill-current")} />
                {"count" in item && item.count && item.count > 0 ? (
                  <span className="absolute -right-2 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-lime px-0.5 text-[8px] font-black leading-none text-white sm:h-4 sm:min-w-4 sm:text-[9px]">
                    {item.count > 99 ? "99+" : item.count}
                  </span>
                ) : null}
              </span>
              <span className="max-w-full truncate">
                <span className="sm:hidden">{item.shortLabel ?? item.label}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </span>
            </>
          );

          if (item.kind === "button") {
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={className}
                aria-label={item.label}
                aria-expanded={item.active}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={className}
              aria-label={item.label}
              aria-current={item.active ? "page" : undefined}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
