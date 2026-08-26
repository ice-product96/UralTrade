"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Принудительно поднимает страницу к началу при входе в маршрут.
 * Нужен, потому что browser scroll restoration и CSS smooth scroll
 * иногда оставляют каталог/товар на прежней позиции.
 */
export function RouteScrollReset({ resetKey }: { resetKey?: string } = {}) {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const root = document.documentElement;
    let secondFrame = 0;

    const scrollToTop = () => {
      const previousScrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.body.scrollTop = 0;
      root.scrollTop = 0;
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
  }, [pathname, resetKey]);

  return null;
}
