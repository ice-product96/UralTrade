export const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number | string | { toString(): string }) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return currencyFormatter.format(amount);
}

export function hasDiscount(
  oldPrice: number | string | { toString(): string } | null | undefined,
  price: number | string | { toString(): string },
) {
  const old = Number(oldPrice);
  const current = Number(price);
  return Number.isFinite(old) && old > 0 && Number.isFinite(current) && old > current;
}

export function getSiteUrl() {
  return (process.env.SITE_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
