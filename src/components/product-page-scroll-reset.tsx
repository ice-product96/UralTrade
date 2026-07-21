"use client";

import { useLayoutEffect } from "react";

export function ProductPageScrollReset({ productSlug }: { productSlug: string }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;

    root.style.scrollBehavior = "auto";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    root.style.scrollBehavior = previousScrollBehavior;
  }, [productSlug]);

  return null;
}
