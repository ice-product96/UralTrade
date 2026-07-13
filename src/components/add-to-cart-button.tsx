"use client";

import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  addToCart,
  CART_UPDATED_EVENT,
  decrementCart,
  getCartQuantity,
  incrementCart,
} from "@/lib/cart-storage";
import { cn } from "@/lib/utils";

export function AddToCartButton({ productId, className }: { productId: string; className?: string }) {
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    const sync = () => setQuantity(getCartQuantity(productId));
    sync();
    window.addEventListener(CART_UPDATED_EVENT, sync);
    return () => window.removeEventListener(CART_UPDATED_EVENT, sync);
  }, [productId]);

  function handleAdd() {
    addToCart(productId);
    setQuantity(getCartQuantity(productId));
  }

  function handleDecrement() {
    decrementCart(productId);
    setQuantity(getCartQuantity(productId));
  }

  function handleIncrement() {
    incrementCart(productId);
    setQuantity(getCartQuantity(productId));
  }

  if (quantity === 0) {
    return (
      <Button onClick={handleAdd} className={cn("h-12 w-full gap-2 text-base sm:w-auto", className)}>
        <ShoppingCart className="h-5 w-5" />
        В корзину
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex h-12 w-full items-center overflow-hidden rounded-full border border-lime bg-lime text-white shadow-lg shadow-lime/20 sm:w-auto",
        className,
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center transition hover:bg-lime-hover"
        aria-label="Уменьшить количество"
      >
        <Minus className="h-5 w-5" />
      </button>
      <span className="min-w-10 flex-1 text-center text-base font-bold sm:flex-none sm:px-2">{quantity}</span>
      <button
        type="button"
        onClick={handleIncrement}
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center transition hover:bg-lime-hover"
        aria-label="Увеличить количество"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}
