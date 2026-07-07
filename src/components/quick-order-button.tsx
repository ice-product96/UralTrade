"use client";

import { useState } from "react";

export function QuickOrderButton({ productId, productName }: { productId: string; productName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-13 flex-1 items-center justify-center rounded-full border border-lime bg-lime/10 px-6 text-base font-bold text-petrol transition hover:bg-lime/20"
      >
        Купить в 1 клик
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-black text-graphite">Быстрый заказ</h3>
            <p className="mt-2 text-sm text-muted">{productName}</p>
            <form action="/api/checkout" method="post" className="mt-5 space-y-3">
              <input type="hidden" name="items" value={JSON.stringify([{ id: productId, quantity: 1 }])} />
              <input type="hidden" name="comment" value={`Быстрый заказ: ${productName}`} />
              <input name="name" required placeholder="Ваше имя" className="admin-input" />
              <input name="phone" required type="tel" placeholder="Телефон" className="admin-input" />
              <input name="email" type="email" placeholder="Email (необязательно)" className="admin-input" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="h-11 flex-1 rounded-full border border-border text-sm font-bold text-petrol">
                  Отмена
                </button>
                <button type="submit" className="h-11 flex-1 rounded-full bg-petrol text-sm font-bold text-white">
                  Отправить
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
