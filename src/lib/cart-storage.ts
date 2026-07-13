export type CartLine = {
  id: string;
  quantity: number;
};

const CART_KEY = "uraltrade-cart";
export const CART_UPDATED_EVENT = "uraltrade-cart-updated";

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed.filter((line) => line.id && line.quantity > 0) : [];
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]) {
  const next = lines.filter((line) => line.quantity > 0);
  window.localStorage.setItem(CART_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
}

export function getCartQuantity(productId: string) {
  return readCart().find((line) => line.id === productId)?.quantity ?? 0;
}

export function getCartCount() {
  return readCart().reduce((sum, line) => sum + line.quantity, 0);
}

export function addToCart(productId: string) {
  const current = readCart();
  const existing = current.find((line) => line.id === productId);
  const next = existing
    ? current.map((line) => (line.id === productId ? { ...line, quantity: line.quantity + 1 } : line))
    : [...current, { id: productId, quantity: 1 }];

  writeCart(next);
  return next;
}

export function setCartQuantity(productId: string, quantity: number) {
  const current = readCart();
  const next =
    quantity <= 0
      ? current.filter((line) => line.id !== productId)
      : current.some((line) => line.id === productId)
        ? current.map((line) => (line.id === productId ? { ...line, quantity } : line))
        : [...current, { id: productId, quantity }];

  writeCart(next);
  return next;
}

export function incrementCart(productId: string) {
  return addToCart(productId);
}

export function decrementCart(productId: string) {
  const quantity = getCartQuantity(productId);
  return setCartQuantity(productId, quantity - 1);
}
