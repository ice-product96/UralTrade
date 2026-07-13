"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { normalizeImageSrc } from "@/lib/image-url";
import { addToCart, incrementCart, readCart, setCartQuantity, type CartLine } from "@/lib/cart-storage";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

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
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useBodyScrollLock(checkoutOpen);

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

  const checkoutForm = (
    <form action="/api/checkout" method="post" className="h-fit rounded-[28px] border border-border bg-white p-5 shadow-xl shadow-petrol/5 sm:rounded-[30px] sm:p-6">
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
  );

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="rounded-[28px] border border-border bg-white p-8 text-center text-muted sm:rounded-[30px] sm:p-10">
              Корзина пока пуста.
            </div>
          ) : (
            products.map((product) => {
              const quantity = lines.find((line) => line.id === product.id)?.quantity ?? 1;
              return (
                <div
                  key={product.id}
                  className="grid gap-4 rounded-[24px] border border-border bg-white p-4 shadow-sm sm:grid-cols-[112px_1fr_auto] sm:rounded-[28px]"
                >
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-background sm:aspect-auto sm:h-28 sm:w-28">
                    <ProductImage src={normalizeImageSrc(product.image ?? "/demo/pump-1.svg")} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold uppercase tracking-[0.2em] text-muted">{product.sku}</div>
                    <div className="mt-2 line-clamp-2 text-base font-black text-graphite sm:text-lg">{product.name}</div>
                    <div className="mt-2 font-bold text-petrol">{formatPrice(product.price)}</div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <button type="button" onClick={() => updateQuantity(product.id, quantity - 1)} className="h-11 w-11 rounded-full border border-border">
                      -
                    </button>
                    <span className="w-8 text-center font-bold">{quantity}</span>
                    <button type="button" onClick={() => setLines(incrementCart(product.id))} className="h-11 w-11 rounded-full border border-border">
                      +
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="hidden lg:block">{checkoutForm}</div>
      </div>

      {products.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 p-3 shadow-[0_-12px_40px_rgba(8,54,83,0.12)] backdrop-blur lg:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted">Итого</div>
              <div className="text-lg font-black text-petrol">{formatPrice(total)}</div>
            </div>
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-petrol px-6 text-sm font-bold text-white"
            >
              Оформить
            </button>
          </div>
        </div>
      ) : null}

      {checkoutOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Закрыть" onClick={() => setCheckoutOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-[28px] bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="mb-3 flex justify-end">
              <button type="button" onClick={() => setCheckoutOpen(false)} className="rounded-full px-3 py-1 text-sm font-bold text-petrol">
                Закрыть
              </button>
            </div>
            {checkoutForm}
          </div>
        </div>
      ) : null}

      {products.length > 0 ? <div className="h-24 lg:hidden" aria-hidden /> : null}
    </>
  );
}
