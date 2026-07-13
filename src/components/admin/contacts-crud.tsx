"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateSiteContacts } from "@/app/admin/actions";

type ContactRow = {
  phone: string | null;
  email: string | null;
  telegram: string | null;
  whatsapp: string | null;
  maxMessenger: string | null;
};

export function ContactsCrud({ contacts }: { contacts: ContactRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await updateSiteContacts(formData);
      router.refresh();
    });
  }

  return (
    <section className="rounded-[30px] border border-border bg-white p-6">
      <div>
        <h1 className="text-3xl font-black text-graphite">Контакты</h1>
        <p className="mt-2 text-sm text-muted">Телефон, почта и мессенджеры отображаются в подвале сайта на всех страницах.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.16em] text-muted">Телефон</span>
          <input name="phone" defaultValue={contacts.phone ?? ""} placeholder="+7 (343) 000-00-00" className="admin-input" />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.16em] text-muted">Email</span>
          <input name="email" type="email" defaultValue={contacts.email ?? ""} placeholder="sales@uraltrade.ru" className="admin-input" />
        </label>

        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-petrol">Мессенджеры</div>
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-[0.16em] text-muted">Telegram</span>
              <input name="telegram" defaultValue={contacts.telegram ?? ""} placeholder="@uraltrade или https://t.me/uraltrade" className="admin-input bg-white" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-[0.16em] text-muted">WhatsApp</span>
              <input name="whatsapp" defaultValue={contacts.whatsapp ?? ""} placeholder="+79001234567 или https://wa.me/79001234567" className="admin-input bg-white" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-[0.16em] text-muted">MAX</span>
              <input name="maxMessenger" defaultValue={contacts.maxMessenger ?? ""} placeholder="https://max.ru/..." className="admin-input bg-white" />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center rounded-full bg-lime px-6 text-sm font-bold text-white hover:bg-lime-hover disabled:opacity-60"
        >
          {pending ? "Сохранение…" : "Сохранить"}
        </button>
      </form>
    </section>
  );
}
