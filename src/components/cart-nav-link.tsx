"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { CART_UPDATED_EVENT, getCartCount } from "@/lib/cart-storage";
import { cn } from "@/lib/utils";

export function CartNavLink({ className }: { className?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getCartCount());
    sync();
    window.addEventListener(CART_UPDATED_EVENT, sync);
    return () => window.removeEventListener(CART_UPDATED_EVENT, sync);
  }, []);

  return (
    <Link
      href="/cart"
      className={cn(
        "relative inline-flex h-11 items-center gap-2 rounded-full bg-petrol px-3 text-sm font-semibold text-white transition hover:bg-petrol-soft sm:px-4",
        className,
      )}
      aria-label={count > 0 ? `Корзина: ${count} ${pluralItems(count)}` : "Корзина"}
    >
      <span className="relative">
        <ShoppingCart className="h-5 w-5" />
        {count > 0 ? (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-lime px-1 text-[11px] font-black leading-none text-white ring-2 ring-petrol">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </span>
      <span className="hidden sm:inline">Корзина{count > 0 ? ` (${count})` : ""}</span>
    </Link>
  );
}

function pluralItems(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "товар";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "товара";
  return "товаров";
}
