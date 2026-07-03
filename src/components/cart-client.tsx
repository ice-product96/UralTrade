"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

type CartLine = {
  id: string;
  quantity: number;
};

type CartProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: string;
  image: string | null;
};

export function CartClient() {
  const [lines, setLines] = useState<CartLine[]>(() => {
    if (typeof window === "undefined") return [];

    const initial = JSON.parse(window.localStorage.getItem("uraltrade-cart") ?? "[]") as CartLine[];
    const params = new URLSearchParams(window.location.search);
    const add = params.get("add");
    const next = add ? increment(initial, add) : initial;
    window.localStorage.setItem("uraltrade-cart", JSON.stringify(next));
    return next;
  });
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
    const next = lines
      .map((line) => (line.id === id ? { ...line, quantity: Math.max(0, quantity) } : line))
      .filter((line) => line.quantity > 0);
    setLines(next);
    window.localStorage.setItem("uraltrade-cart", JSON.stringify(next));
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
                  <Image src={product.image ?? "/demo/pump-1.svg"} alt={product.name} fill className="object-cover" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{product.sku}</div>
                  <div className="mt-2 text-lg font-black text-graphite">{product.name}</div>
                  <div className="mt-2 font-bold text-petrol">{formatPrice(product.price)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQuantity(product.id, quantity - 1)} className="h-10 w-10 rounded-full border border-border">
                    -
                  </button>
                  <span className="w-8 text-center font-bold">{quantity}</span>
                  <button onClick={() => updateQuantity(product.id, quantity + 1)} className="h-10 w-10 rounded-full border border-border">
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
        <div className="mt-2 text-sm text-muted">Итого: <span className="font-bold text-petrol">{formatPrice(total)}</span></div>
        <div className="mt-6 space-y-3">
          <input required name="name" placeholder="Ваше имя" className="h-12 w-full rounded-2xl border border-border px-4 outline-none focus:ring-4 focus:ring-lime/20" />
          <input required name="phone" placeholder="Телефон" className="h-12 w-full rounded-2xl border border-border px-4 outline-none focus:ring-4 focus:ring-lime/20" />
          <input name="email" type="email" placeholder="Email" className="h-12 w-full rounded-2xl border border-border px-4 outline-none focus:ring-4 focus:ring-lime/20" />
          <textarea name="comment" placeholder="Комментарий" rows={4} className="w-full rounded-2xl border border-border px-4 py-3 outline-none focus:ring-4 focus:ring-lime/20" />
        </div>
        <Button disabled={!products.length} className="mt-5 w-full">Отправить заявку</Button>
      </form>
    </div>
  );
}

function increment(lines: CartLine[], id: string) {
  const existing = lines.find((line) => line.id === id);
  return existing ? lines.map((line) => (line.id === id ? { ...line, quantity: line.quantity + 1 } : line)) : [...lines, { id, quantity: 1 }];
}
