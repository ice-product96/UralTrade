export const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number | string | { toString(): string }) {
  return currencyFormatter.format(Number(value));
}

export function getSiteUrl() {
  return (process.env.SITE_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
