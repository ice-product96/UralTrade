import { Mail, Phone } from "lucide-react";
import { buildEmailHref, buildTelHref } from "@/lib/contacts";

type HeaderContactsData = {
  phone: string | null;
  email: string | null;
};

export function HeaderContactIcons({ contacts, className = "" }: { contacts: HeaderContactsData; className?: string }) {
  if (!contacts.phone && !contacts.email) return null;

  return (
    <div className={`flex shrink-0 items-center gap-1.5 ${className}`}>
      {contacts.phone ? (
        <a
          href={buildTelHref(contacts.phone)}
          title={contacts.phone}
          aria-label={`Позвонить: ${contacts.phone}`}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-petrol shadow-sm transition hover:border-lime hover:text-lime sm:h-12 sm:w-12"
        >
          <Phone className="h-5 w-5" />
        </a>
      ) : null}
      {contacts.email ? (
        <a
          href={buildEmailHref(contacts.email)}
          title={contacts.email}
          aria-label={`Написать: ${contacts.email}`}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-petrol shadow-sm transition hover:border-lime hover:text-lime sm:h-12 sm:w-12"
        >
          <Mail className="h-5 w-5" />
        </a>
      ) : null}
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
