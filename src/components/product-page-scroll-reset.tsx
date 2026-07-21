"use client";

import { useEffect } from "react";

export function ProductPageScrollReset({ productSlug }: { productSlug: string }) {
  useEffect(() => {
    const root = document.documentElement;
    let secondFrame = 0;

    const scrollToTop = () => {
      const previousScrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      root.style.scrollBehavior = previousScrollBehavior;
    };

    scrollToTop();
    const firstFrame = requestAnimationFrame(() => {
      scrollToTop();
      secondFrame = requestAnimationFrame(scrollToTop);
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [productSlug]);

  return null;
}
