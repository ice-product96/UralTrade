import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { MessengerIcon, MESSENGER_ICONS, type MessengerKey } from "@/components/messenger-icon";
import {
  buildEmailHref,
  buildMapsHref,
  buildMaxHref,
  buildTelHref,
  buildTelegramHref,
  buildWhatsappHref,
  maxLabel,
  type SiteContactData,
  telegramLabel,
  whatsappLabel,
} from "@/lib/contacts";

type ContactsPageProps = {
  title?: string;
  description?: string | null;
  contacts: SiteContactData;
};

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
  external,
  accent = "petrol",
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
  accent?: "petrol" | "lime";
}) {
  const content = (
    <>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent === "lime" ? "bg-lime/10 text-lime" : "bg-petrol/10 text-petrol"}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted">{label}</div>
        <div className="mt-2 text-lg font-black text-graphite">{value}</div>
      </div>
      {href ? <ArrowUpRight className="h-5 w-5 shrink-0 text-muted transition group-hover:text-petrol" /> : null}
    </>
  );

  const className =
    "group flex items-start gap-4 rounded-[28px] border border-border bg-white p-5 shadow-sm transition hover:border-petrol/20 hover:shadow-lg hover:shadow-petrol/5 sm:p-6";

  if (href) {
    return (
      <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className={className}>
        {content}
      </a>
    );
  }

  return <article className={className}>{content}</article>;
}

export function ContactsPage({ title = "Контакты", description, contacts }: ContactsPageProps) {
  const messengers = [
    contacts.telegram
      ? {
          key: "telegram" as const,
          href: buildTelegramHref(contacts.telegram),
          label: telegramLabel(contacts.telegram),
        }
      : null,
    contacts.whatsapp
      ? {
          key: "whatsapp" as const,
          href: buildWhatsappHref(contacts.whatsapp),
          label: whatsappLabel(contacts.whatsapp),
        }
      : null,
    contacts.maxMessenger
      ? {
          key: "max" as const,
          href: buildMaxHref(contacts.maxMessenger),
          label: maxLabel(contacts.maxMessenger),
        }
      : null,
  ].filter((item): item is { key: MessengerKey; href: string; label: string } => item !== null);

  const hasAny = Boolean(contacts.phone || contacts.email || contacts.address || messengers.length);

  return (
    <div className="mx-auto max-w-5xl px-3 py-10 sm:px-4 sm:py-14 lg:px-8">
      <div className="relative overflow-hidden rounded-[28px] bg-petrol px-5 py-8 text-white sm:rounded-[34px] sm:px-8 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(126,173,22,0.22),transparent_42%)]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-lime sm:text-sm">
            <MessageCircle className="h-4 w-4" />
            Связь с нами
          </div>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/75 sm:text-base">
            {description ?? "Позвоните, напишите или оставьте заявку в корзине — менеджер поможет с подбором оборудования и оформлением заказа."}
          </p>
        </div>
      </div>

      {!hasAny ? (
        <div className="mt-8 rounded-[28px] border border-dashed border-border bg-white p-10 text-center text-muted">
          Контактные данные пока не заполнены.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {contacts.phone ? (
            <ContactCard icon={Phone} label="Телефон" value={contacts.phone} href={buildTelHref(contacts.phone)} accent="lime" />
          ) : null}
          {contacts.email ? (
            <ContactCard icon={Mail} label="Email" value={contacts.email} href={buildEmailHref(contacts.email)} />
          ) : null}
          {contacts.address ? (
            <ContactCard
              icon={MapPin}
              label="Адрес"
              value={contacts.address}
              href={buildMapsHref(contacts.address)}
              external
            />
          ) : null}

          {messengers.length ? (
            <article className="rounded-[28px] border border-border bg-white p-5 shadow-sm sm:col-span-2 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background text-petrol">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Мессенджеры</div>
                  <div className="mt-1 text-lg font-black text-graphite">Напишите удобным способом</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {messengers.map((item) => (
                  <a
                    key={item.key}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-4 transition hover:border-petrol/25 hover:bg-white hover:shadow-md hover:shadow-petrol/5"
                  >
                    <MessengerIcon messenger={item.key} size={28} />
                    <div className="min-w-0">
                      <div className="text-sm font-black text-graphite">{MESSENGER_ICONS[item.key].label}</div>
                      <div className="truncate text-xs text-muted">{item.label}</div>
                    </div>
                  </a>
                ))}
              </div>
            </article>
          ) : null}
        </div>
      )}

      <div className="mt-10 rounded-[28px] border border-border bg-white p-6 text-center shadow-sm sm:p-8">
        <h2 className="text-xl font-black text-graphite">Нужен подбор по характеристикам?</h2>
        <p className="mt-2 text-sm text-muted">Откройте каталог или добавьте товары в корзину — мы свяжемся для уточнения деталей.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/catalog"
            className="inline-flex h-11 items-center justify-center rounded-full bg-petrol px-6 text-sm font-bold text-white hover:bg-petrol-soft"
          >
            Перейти в каталог
          </Link>
          <Link
            href="/cart"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-bold text-petrol hover:bg-background"
          >
            Корзина
          </Link>
        </div>
      </div>
    </div>
  );
}
