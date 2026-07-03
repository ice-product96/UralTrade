import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";

export default function CartSuccessPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid max-w-3xl place-items-center px-4 py-20 text-center lg:px-8">
        <div className="rounded-[34px] border border-border bg-white p-10 shadow-2xl shadow-petrol/10">
          <CheckCircle2 className="mx-auto h-14 w-14 text-lime" />
          <h1 className="mt-6 text-4xl font-black text-graphite">Заявка отправлена</h1>
          <p className="mt-3 text-muted">Менеджер увидит заказ в админке и свяжется с клиентом для подтверждения.</p>
          <Link href="/catalog" className="mt-8 inline-flex h-12 items-center rounded-full bg-petrol px-6 font-bold text-white hover:bg-petrol-soft">
            Вернуться в каталог
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
