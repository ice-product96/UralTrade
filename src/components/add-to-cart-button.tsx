"use client";

import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type CartItem = {
  id: string;
  quantity: number;
};

export function AddToCartButton({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false);

  function addToCart() {
    const current = JSON.parse(window.localStorage.getItem("uraltrade-cart") ?? "[]") as CartItem[];
    const existing = current.find((item) => item.id === productId);
    const next = existing
      ? current.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item))
      : [...current, { id: productId, quantity: 1 }];

    window.localStorage.setItem("uraltrade-cart", JSON.stringify(next));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <Button onClick={addToCart} className="h-13 w-full gap-2 text-base sm:w-auto">
      <ShoppingCart className="h-5 w-5" />
      {added ? "Добавлено" : "В корзину"}
    </Button>
  );
}
