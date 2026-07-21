export type SiteContactData = {
  phone: string | null;
  email: string | null;
  address: string | null;
  telegram: string | null;
  whatsapp: string | null;
  maxMessenger: string | null;
  locations: ContactLocationData[];
};

export type ContactLocationData = {
  id: string;
  name: string;
  kind: string;
  address: string;
  phone: string | null;
  workingHours: string | null;
  mapUrl: string | null;
  published: boolean;
  sortOrder: number;
};

export function buildTelHref(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : "";
}

export function buildEmailHref(email: string) {
  const trimmed = email.trim();
  return trimmed ? `mailto:${trimmed}` : "";
}

export function buildTelegramHref(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const handle = trimmed.replace(/^@/, "");
  return handle ? `https://t.me/${handle}` : "";
}

export function buildWhatsappHref(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

export function buildMaxHref(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

export function telegramLabel(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Telegram";
  if (trimmed.startsWith("@")) return trimmed;
  if (/t\.me\/([^/?#]+)/i.test(trimmed)) {
    const match = trimmed.match(/t\.me\/([^/?#]+)/i);
    return match?.[1] ? `@${match[1]}` : "Telegram";
  }
  return trimmed.startsWith("http") ? "Telegram" : `@${trimmed.replace(/^@/, "")}`;
}

export function whatsappLabel(value: string) {
  const trimmed = value.trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed)) return "WhatsApp";
  return trimmed;
}

export function maxLabel(value: string) {
  const trimmed = value.trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed)) return "MAX";
  return trimmed;
}

export function buildMapsHref(address: string) {
  const trimmed = address.trim();
  return trimmed ? `https://yandex.ru/maps/?text=${encodeURIComponent(trimmed)}` : "";
}

export function buildMapEmbedHref(address: string, mapUrl?: string | null) {
  const customUrl = mapUrl?.trim();
  if (customUrl) {
    const iframeSrc = (customUrl.match(/src=["']([^"']+)["']/i)?.[1] ?? customUrl).replaceAll("&amp;", "&");
    try {
      const parsed = new URL(iframeSrc);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") return parsed.toString();
    } catch {
      // Используем автоматически сформированную карту ниже.
    }
  }

  const trimmed = address.trim();
  return trimmed ? `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(trimmed)}&z=15` : "";
}
