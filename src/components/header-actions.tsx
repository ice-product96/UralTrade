"use client";

import Link from "next/link";
import { BarChart3, Heart, ShoppingCart, type LucideIcon } from "lucide-react";
import { useCartCount, useProductList } from "@/lib/use-shop-storage";
import { cn } from "@/lib/utils";

export function HeaderActions({ className }: { className?: string }) {
  const favorites = useProductList("favorites");
  const compare = useProductList("compare");
  const cartCount = useCartCount();

  return (
    <nav className={cn("flex items-center gap-0.5 sm:gap-1", className)} aria-label="Избранное, сравнение и корзина">
      <HeaderAction href="/favorites" icon={Heart} label="Избранное" count={favorites.length} />
      <HeaderAction href="/compare" icon={BarChart3} label="Сравнение" count={compare.length} />
      <HeaderAction href="/cart" icon={ShoppingCart} label="Корзина" count={cartCount} />
    </nav>
  );
}

function HeaderAction({
  href,
  icon: Icon,
  label,
  count,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className="flex w-11 flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-graphite transition hover:bg-white hover:text-lime sm:w-[72px]"
      aria-label={count > 0 ? `${label}: ${count}` : label}
    >
      <span className="relative">
        <Icon className="h-5 w-5" />
        {count > 0 ? (
          <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-lime px-1 text-[10px] font-black leading-none text-white ring-2 ring-background">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </span>
      <span className="hidden text-[11px] font-semibold leading-none sm:block">{label}</span>
    </Link>
  );
}
