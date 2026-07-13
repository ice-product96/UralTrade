import { Mail, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { SiteLogo } from "@/components/site-logo";
import {
  buildEmailHref,
  buildMaxHref,
  buildTelHref,
  buildTelegramHref,
  buildWhatsappHref,
  maxLabel,
  telegramLabel,
  whatsappLabel,
} from "@/lib/contacts";
import { getNavigationCategories, getSiteContacts } from "@/lib/data";
import { mainNavLinks } from "@/lib/site-nav";

export async function SiteFooter() {
  const [categories, contacts] = await Promise.all([getNavigationCategories(), getSiteContacts()]);

  const messengers = [
    contacts.telegram
      ? { href: buildTelegramHref(contacts.telegram), label: telegramLabel(contacts.telegram), key: "telegram" }
      : null,
    contacts.whatsapp
      ? { href: buildWhatsappHref(contacts.whatsapp), label: whatsappLabel(contacts.whatsapp), key: "whatsapp" }
      : null,
    contacts.maxMessenger
      ? { href: buildMaxHref(contacts.maxMessenger), label: maxLabel(contacts.maxMessenger), key: "max" }
      : null,
  ].filter(Boolean) as Array<{ href: string; label: string; key: string }>;

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
                    className="flex items-center gap-2 text-muted hover:text-petrol"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0" />
                    {item.label}
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
