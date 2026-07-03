import type { Metadata } from "next";
import { CartClient } from "@/components/cart-client";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Корзина",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <h1 className="text-4xl font-black text-graphite">Корзина</h1>
        <p className="mt-3 max-w-2xl text-muted">Проверьте состав заявки. После отправки заказ появится в админке для обработки менеджером.</p>
        <div className="mt-8">
          <CartClient />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
