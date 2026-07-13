import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { buildEmailHref, buildTelHref } from "@/lib/contacts";

type HeaderContactsData = {
  phone: string | null;
  email: string | null;
};

export function HeaderContacts({ contacts, className = "" }: { contacts: HeaderContactsData; className?: string }) {
  if (!contacts.phone && !contacts.email) return null;

  return (
    <div className={`flex min-w-0 items-center gap-2 sm:gap-3 ${className}`}>
      {contacts.phone ? (
        <a
          href={buildTelHref(contacts.phone)}
          className="inline-flex max-w-[9rem] items-center gap-1.5 truncate text-xs font-semibold text-petrol hover:text-lime sm:max-w-none sm:text-sm"
          title={contacts.phone}
        >
          <Phone className="h-4 w-4 shrink-0" />
          <span className="hidden truncate sm:inline">{contacts.phone}</span>
        </a>
      ) : null}
      {contacts.email ? (
        <a
          href={buildEmailHref(contacts.email)}
          className="inline-flex max-w-[9rem] items-center gap-1.5 truncate text-xs font-semibold text-muted hover:text-petrol sm:max-w-[12rem] sm:text-sm"
          title={contacts.email}
        >
          <Mail className="h-4 w-4 shrink-0" />
          <span className="hidden truncate md:inline">{contacts.email}</span>
        </a>
      ) : null}
      <Link href="/page/contacts" className="hidden text-xs font-semibold text-muted hover:text-petrol lg:inline">
        Контакты
      </Link>
    </div>
  );
}

export function MobileMenuContacts({ contacts }: { contacts: HeaderContactsData }) {
  if (!contacts.phone && !contacts.email) return null;

  return (
    <div className="mt-4 space-y-2 border-t border-border pt-4">
      <div className="px-1 text-xs font-bold uppercase tracking-[0.2em] text-muted">Контакты</div>
      {contacts.phone ? (
        <a href={buildTelHref(contacts.phone)} className="flex items-center gap-3 rounded-2xl bg-background px-4 py-3 text-sm font-semibold text-petrol">
          <Phone className="h-4 w-4 shrink-0" />
          {contacts.phone}
        </a>
      ) : null}
      {contacts.email ? (
        <a href={buildEmailHref(contacts.email)} className="flex items-center gap-3 rounded-2xl bg-background px-4 py-3 text-sm font-semibold text-graphite">
          <Mail className="h-4 w-4 shrink-0" />
          {contacts.email}
        </a>
      ) : null}
    </div>
  );
}
