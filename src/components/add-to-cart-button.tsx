"use client";

import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { addToCart, CART_UPDATED_EVENT, getCartQuantity } from "@/lib/cart-storage";

export function AddToCartButton({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const sync = () => setAdded(getCartQuantity(productId) > 0);
    sync();
    window.addEventListener(CART_UPDATED_EVENT, sync);
    return () => window.removeEventListener(CART_UPDATED_EVENT, sync);
  }, [productId]);

  function handleAdd() {
    addToCart(productId);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <Button onClick={handleAdd} className="h-12 w-full gap-2 text-base sm:w-auto">
      <ShoppingCart className="h-5 w-5" />
      {added ? "Добавлено" : "В корзину"}
    </Button>
  );
}
