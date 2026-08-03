"use client";

import { useSyncExternalStore } from "react";
import { CART_UPDATED_EVENT, getCartCount } from "@/lib/cart-storage";
import {
  EMPTY_PRODUCT_LIST,
  readProductList,
  subscribeProductLists,
  type ProductListKind,
} from "@/lib/product-lists";

export function useProductList(kind: ProductListKind) {
  return useSyncExternalStore(
    subscribeProductLists,
    () => readProductList(kind),
    () => EMPTY_PRODUCT_LIST,
  );
}

function subscribeCart(onChange: () => void) {
  window.addEventListener(CART_UPDATED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CART_UPDATED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const noopSubscribe = () => () => {};

/** Отличает первый серверный рендер от клиентского: списки живут только в localStorage. */
export function useIsHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function useCartCount() {
  return useSyncExternalStore(
    subscribeCart,
    () => getCartCount(),
    () => 0,
  );
}
