"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

function isMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches;
}

/** Горизонтальный ряд чипов: на мобильной — карусель со стрелками, если не помещается. */
export function ProductChipCarousel({
  children,
  ariaLabel,
  className,
}: {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
}) {
  const items = Children.toArray(children);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [carouselMode, setCarouselMode] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (!isMobileViewport()) {
      setCarouselMode(false);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const overflows = el.scrollWidth > el.clientWidth + 2;
    setCarouselMode(overflows);
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, items.length]);

  function scrollByDir(dir: -1 | 1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.72, 96), behavior: "smooth" });
  }

  if (items.length === 0) return null;

  return (
    <div className={cn("relative min-w-0", className)}>
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-1.5 pb-1",
          "max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:snap-x max-sm:snap-mandatory max-sm:[scrollbar-width:none] max-sm:[-ms-overflow-style:none] max-sm:[&::-webkit-scrollbar]:hidden",
          "sm:flex-wrap sm:overflow-visible",
        )}
        aria-label={ariaLabel}
      >
        {items.map((child, index) => (
          <div key={index} className="max-sm:snap-start shrink-0">
            {child}
          </div>
        ))}
      </div>

      {carouselMode ? (
        <>
          <button
            type="button"
            onClick={() => scrollByDir(-1)}
            disabled={!canScrollLeft}
            aria-label={`Назад: ${ariaLabel}`}
            className="absolute left-0 top-1/2 z-10 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-petrol shadow-md backdrop-blur-sm transition hover:border-lime hover:text-lime disabled:pointer-events-none disabled:opacity-0 sm:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByDir(1)}
            disabled={!canScrollRight}
            aria-label={`Вперёд: ${ariaLabel}`}
            className="absolute right-0 top-1/2 z-10 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-petrol shadow-md backdrop-blur-sm transition hover:border-lime hover:text-lime disabled:pointer-events-none disabled:opacity-0 sm:hidden"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      ) : null}
    </div>
  );
}
