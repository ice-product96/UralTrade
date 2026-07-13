export type SiteContactData = {
  phone: string | null;
  email: string | null;
  telegram: string | null;
  whatsapp: string | null;
  maxMessenger: string | null;
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
