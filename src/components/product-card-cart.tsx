"use client";

import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import {
  addToCart,
  CART_UPDATED_EVENT,
  decrementCart,
  getCartQuantity,
  incrementCart,
} from "@/lib/cart-storage";

export function ProductCardCart({
  productId,
  productName,
  compact = false,
}: {
  productId: string;
  productName: string;
  compact?: boolean;
}) {
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    const sync = () => setQuantity(getCartQuantity(productId));
    sync();
    window.addEventListener(CART_UPDATED_EVENT, sync);
    return () => window.removeEventListener(CART_UPDATED_EVENT, sync);
  }, [productId]);

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={() => {
          addToCart(productId);
          setQuantity(getCartQuantity(productId));
        }}
        className={`inline-flex shrink-0 items-center justify-center rounded-full bg-lime text-white shadow-lg shadow-lime/20 transition hover:bg-lime-hover ${compact ? "h-9 w-9" : "h-9 w-9 sm:h-11 sm:w-11"}`}
        aria-label={`Добавить ${productName} в корзину`}
      >
        <ShoppingCart className={`${compact ? "h-4 w-4" : "h-4 w-4 sm:h-5 sm:w-5"}`} />
      </button>
    );
  }

  return (
    <div className={`inline-flex shrink-0 items-center overflow-hidden rounded-full border border-border bg-white shadow-sm ${compact ? "h-9" : "h-9 sm:h-11"}`}>
      <button
        type="button"
        onClick={() => {
          decrementCart(productId);
          setQuantity(getCartQuantity(productId));
        }}
        className={`inline-flex w-8 items-center justify-center text-petrol transition hover:bg-background ${compact ? "h-9" : "h-9 sm:h-11 sm:w-10"}`}
        aria-label={`Уменьшить количество ${productName}`}
      >
        <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </button>
      <span className="min-w-7 text-center text-xs font-bold text-graphite sm:min-w-8 sm:text-sm">{quantity}</span>
      <button
        type="button"
        onClick={() => {
          incrementCart(productId);
          setQuantity(getCartQuantity(productId));
        }}
        className={`inline-flex w-8 items-center justify-center text-petrol transition hover:bg-background ${compact ? "h-9" : "h-9 sm:h-11 sm:w-10"}`}
        aria-label={`Увеличить количество ${productName}`}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
