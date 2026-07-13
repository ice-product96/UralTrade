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

export function ProductCardCart({ productId, productName }: { productId: string; productName: string }) {
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
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-lime text-white shadow-lg shadow-lime/20 transition hover:bg-lime-hover"
        aria-label={`Добавить ${productName} в корзину`}
      >
        <ShoppingCart className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="inline-flex h-11 items-center overflow-hidden rounded-full border border-border bg-white shadow-sm">
      <button
        type="button"
        onClick={() => {
          decrementCart(productId);
          setQuantity(getCartQuantity(productId));
        }}
        className="inline-flex h-11 w-10 items-center justify-center text-petrol transition hover:bg-background"
        aria-label={`Уменьшить количество ${productName}`}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-8 text-center text-sm font-bold text-graphite">{quantity}</span>
      <button
        type="button"
        onClick={() => {
          incrementCart(productId);
          setQuantity(getCartQuantity(productId));
        }}
        className="inline-flex h-11 w-10 items-center justify-center text-petrol transition hover:bg-background"
        aria-label={`Увеличить количество ${productName}`}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
