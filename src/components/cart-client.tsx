"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { normalizeImageSrc } from "@/lib/image-url";
import { addToCart, incrementCart, readCart, setCartQuantity, type CartLine } from "@/lib/cart-storage";

type CartProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: string;
  image: string | null;
};

export function CartClient() {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const add = params.get("add");
    if (add) {
      addToCart(add);
      params.delete("add");
      const nextUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
      window.history.replaceState({}, "", nextUrl);
    }

    setLines(readCart());
  }, []);

  const [products, setProducts] = useState<CartProduct[]>([]);

  useEffect(() => {
    if (!lines.length) {
      queueMicrotask(() => setProducts([]));
      return;
    }

    fetch(`/api/products?ids=${lines.map((line) => line.id).join(",")}`)
      .then((response) => response.json())
      .then(setProducts);
  }, [lines]);

  const total = useMemo(
    () =>
      products.reduce((sum, product) => {
        const quantity = lines.find((line) => line.id === product.id)?.quantity ?? 0;
        return sum + Number(product.price) * quantity;
      }, 0),
    [lines, products],
  );

  function updateQuantity(id: string, quantity: number) {
    setLines(setCartQuantity(id, quantity));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        {products.length === 0 ? (
          <div className="rounded-[30px] border border-border bg-white p-10 text-center text-muted">Корзина пока пуста.</div>
        ) : (
          products.map((product) => {
            const quantity = lines.find((line) => line.id === product.id)?.quantity ?? 1;
            return (
              <div key={product.id} className="grid gap-4 rounded-[28px] border border-border bg-white p-4 shadow-sm sm:grid-cols-[112px_1fr_auto]">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-background">
                  <ProductImage src={normalizeImageSrc(product.image ?? "/demo/pump-1.svg")} alt={product.name} fill className="object-cover" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{product.sku}</div>
                  <div className="mt-2 text-lg font-black text-graphite">{product.name}</div>
                  <div className="mt-2 font-bold text-petrol">{formatPrice(product.price)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => updateQuantity(product.id, quantity - 1)} className="h-10 w-10 rounded-full border border-border">
                    -
                  </button>
                  <span className="w-8 text-center font-bold">{quantity}</span>
                  <button type="button" onClick={() => setLines(incrementCart(product.id))} className="h-10 w-10 rounded-full border border-border">
                    +
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      <form action="/api/checkout" method="post" className="h-fit rounded-[30px] border border-border bg-white p-6 shadow-xl shadow-petrol/5">
        <input type="hidden" name="items" value={JSON.stringify(lines)} />
        <div className="text-xl font-black text-graphite">Оформление заказа</div>
        <div className="mt-2 text-sm text-muted">
          Итого: <span className="font-bold text-petrol">{formatPrice(total)}</span>
        </div>
        <div className="mt-6 space-y-3">
          <input required name="name" placeholder="Ваше имя" className="h-12 w-full rounded-2xl border border-border px-4 outline-none focus:ring-4 focus:ring-lime/20" />
          <input required name="phone" placeholder="Телефон" className="h-12 w-full rounded-2xl border border-border px-4 outline-none focus:ring-4 focus:ring-lime/20" />
          <input name="email" type="email" placeholder="Email" className="h-12 w-full rounded-2xl border border-border px-4 outline-none focus:ring-4 focus:ring-lime/20" />
          <textarea name="comment" placeholder="Комментарий" rows={4} className="w-full rounded-2xl border border-border px-4 py-3 outline-none focus:ring-4 focus:ring-lime/20" />
        </div>
        <Button disabled={!products.length} className="mt-5 w-full">
          Отправить заявку
        </Button>
      </form>
    </div>
  );
}
