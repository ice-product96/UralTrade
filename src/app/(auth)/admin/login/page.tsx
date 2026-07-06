import Link from "next/link";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin-login-form";
import { SiteLogo } from "@/components/site-logo";

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-md rounded-[34px] border border-border bg-white p-8 shadow-2xl shadow-petrol/10">
        <div className="flex justify-center">
          <SiteLogo href="/" height={58} />
        </div>
        <Link href="/" className="mt-6 inline-block text-sm font-bold text-lime">
          ← На сайт
        </Link>
        <h1 className="mt-6 text-3xl font-black text-graphite">Вход в админку</h1>
        <p className="mt-2 text-sm text-muted">Управление товарами, фильтрами, SEO и заказами UralTrade.</p>
        <div className="mt-8">
          <Suspense fallback={<div className="text-sm text-muted">Загрузка формы...</div>}>
            <AdminLoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
