import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { MessengerIcon, MESSENGER_ICONS } from "@/components/messenger-icon";
import { SiteLogo } from "@/components/site-logo";
import {
  buildEmailHref,
  buildMaxHref,
  buildTelHref,
  buildTelegramHref,
  buildWhatsappHref,
} from "@/lib/contacts";
import { getNavigationCategories, getSiteContacts } from "@/lib/data";
import { mainNavLinks } from "@/lib/site-nav";

export async function SiteFooter() {
  const [categories, contacts] = await Promise.all([getNavigationCategories(), getSiteContacts()]);

  const messengers = [
    contacts.telegram ? { href: buildTelegramHref(contacts.telegram), key: "telegram" as const } : null,
    contacts.whatsapp ? { href: buildWhatsappHref(contacts.whatsapp), key: "whatsapp" as const } : null,
    contacts.maxMessenger ? { href: buildMaxHref(contacts.maxMessenger), key: "max" as const } : null,
  ].filter(Boolean) as Array<{ href: string; key: keyof typeof MESSENGER_ICONS }>;

  const hasContacts = Boolean(contacts.phone || contacts.email || messengers.length);

  return (
    <footer className="mt-16 border-t border-border bg-white sm:mt-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <SiteLogo href="/" height={52} />
          <p className="mt-4 max-w-md text-sm leading-6 text-muted">
            Интернет-магазин гидравлического оборудования и комплектующих с подбором по артикулам, характеристикам и брендам.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <div className="font-bold text-graphite">Каталог</div>
          <Link href="/catalog" className="block text-muted hover:text-petrol">
            Все товары
          </Link>
          <Link href="/brands" className="block text-muted hover:text-petrol">
            Бренды
          </Link>
          <Link href="/promotions" className="block text-muted hover:text-petrol">
            Акции
          </Link>
          {categories.slice(0, 5).map((category) => (
            <Link key={category.id} href={`/catalog/${category.slug}`} className="block text-muted hover:text-petrol">
              {category.name}
            </Link>
          ))}
        </div>
        <div className="space-y-3 text-sm">
          <div className="font-bold text-graphite">Покупателям</div>
          {mainNavLinks
            .filter((item) => item.href !== "/brands" && item.href !== "/promotions")
            .map((item) => (
              <Link key={item.href} href={item.href} className="block text-muted hover:text-petrol">
                {item.label}
              </Link>
            ))}
        </div>
        {hasContacts ? (
          <div className="space-y-3 text-sm">
            <div className="font-bold text-graphite">Контакты</div>
            {contacts.phone ? (
              <a href={buildTelHref(contacts.phone)} className="flex items-center gap-2 font-semibold text-petrol hover:text-lime">
                <Phone className="h-4 w-4 shrink-0" />
                {contacts.phone}
              </a>
            ) : null}
            {contacts.email ? (
              <a href={buildEmailHref(contacts.email)} className="flex items-center gap-2 text-muted hover:text-petrol">
                <Mail className="h-4 w-4 shrink-0" />
                {contacts.email}
              </a>
            ) : null}
            {messengers.length ? (
              <div className="space-y-2 pt-1">
                {messengers.map((item) => (
                  <a
                    key={item.key}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-2xl bg-background px-3 py-2.5 font-semibold text-graphite transition hover:text-petrol"
                  >
                    <MessengerIcon messenger={item.key} size={22} />
                    {MESSENGER_ICONS[item.key].label}
                  </a>
                ))}
              </div>
            ) : null}
            <Link href="/page/contacts" className="inline-block pt-1 text-muted hover:text-petrol">
              Все контакты
            </Link>
          </div>
        ) : null}
      </div>
    </footer>
  );
}
